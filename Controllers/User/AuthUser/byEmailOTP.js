const db = require('../../../Models');
const User = db.user;
const EmailOTP = db.emailOTP;
const EmailCredential = db.emailCredential
const User_Service = db.user_service;
const ProfileImage = db.profileImage;

const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { OTP_VALIDITY_IN_MILLISECONDS, OTP_DIGITS_LENGTH, JWT_SECRET_KEY_USER, JWT_VALIDITY } = process.env;
const { registerByEmailOTP, verifyOTP, signInByEmailOTP, updateUser } = require("../../../Middlewares/Validation/validationUser");
const { getUser } = require("../../../Middlewares/Validation/validateAdmin");

const FORGET_OTP_VALIDITY = (OTP_VALIDITY_IN_MILLISECONDS) ? OTP_VALIDITY_IN_MILLISECONDS : '120000';
const OTP_LENGTH = (OTP_DIGITS_LENGTH) ? OTP_DIGITS_LENGTH : 6;

// Sending Email
const emailOTP = require('../../../Util/generateOTP');
const { sendEmail } = require("../../../Util/sendEmail");
const brevo = require('@getbrevo/brevo');

exports.registerByEmailOTP = async (req, res) => {
    try {
        // Validate body
        const { error } = registerByEmailOTP(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, name, mobileNumber } = req.body;
        const isUser = await User.findOne({
            where: {
                email: email
            }
        });
        if (isUser) {
            return res.status(400).send({
                success: false,
                message: "User is present! Login.."
            });
        }
        // Store user
        const user = await User.create({
            email: email,
            name: name,
            mobileNumber: mobileNumber
        });
        // Generate OTP for Email
        const otp = emailOTP.generateFixedLengthRandomNumber(OTP_LENGTH);
        // Update sendEmail 0 every day
        const date = JSON.stringify(new Date());
        const todayDate = `${date.slice(1, 11)}`;
        const changeUpdateDate = await EmailCredential.findAll({
            where: {
                updatedAt: { [Op.lt]: todayDate }
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        for (let i = 0; i < changeUpdateDate.length; i++) {
            // console.log("hii");
            await EmailCredential.update({
                emailSend: 0
            }, {
                where: {
                    id: changeUpdateDate[i].id
                }
            });
        }
        // finalise email credentiel
        const emailCredential = await EmailCredential.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        let finaliseEmailCredential;
        for (let i = 0; i < emailCredential.length; i++) {
            if (parseInt(emailCredential[i].emailSend) < 300) {
                finaliseEmailCredential = emailCredential[i];
                break;
            }
        }
        if (finaliseEmailCredential) {
            // Send OTP to Email By Brevo
            if (finaliseEmailCredential.plateForm === "BREVO") {
                const options = {
                    subject: "Register",
                    brevoEmail: finaliseEmailCredential.email,
                    brevoKey: finaliseEmailCredential.EMAIL_API_KEY,
                    headers: { "OTP for ragistration verification": "123A" },
                    htmlContent: `
                    <!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Verification Card</title>
                  </head>
                  <body style="margin: 0; padding: 0; background-color: #f4f5ff;">
                      <center>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                              <tr>
                                  <td align="center" style="padding: 20px 0; background-color: #f4f5ff;">
                                      <table border="0" cellpadding="0" cellspacing="0" width="80%" style="max-width: 400px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                          <tr>
                                              <td style="padding: 30px;">
                                                  <img src="https://affiliate.techastute.in/static/media/logo.49cbec0ecddcccf78524.png" alt="Logo" width="100" style="max-width: 100px; height: auto;">
                                                  <p style="font-size: 14px; font-family: verdana; color: #333; margin: 15px 0;">Hi <span style="font-weight: 600; color: #333;">${email},</span></p>
                                                  <p style="font-size: 14px; font-family: verdana; color: #333;">Please copy the One Time Password (OTP) below and enter it on the verification page of My Way SIP.</p>
                                                  <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                  <p style="font-size: 32px; font-weight: bold; text-align: center; color: #1c2e4a; margin: 20px 0;">${otp}</p>
                                                  <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                  <p style="font-size: 14px; font-family: verdana; color: #333;">This code <span style="font-weight: 600; color: #333;">expires in ${parseInt(FORGET_OTP_VALIDITY) / 1000 / 60} minutes.</span> Please, <span style="font-weight: 600; color: #333;">DO NOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                                                  <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                  <p  style="font-size: 14px; text-align: center; color: #666;">Powered by Your Company | Address | Contact Information</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </center>
                  </body>
                  </html>`,
                    userEmail: email,
                    userName: user.name
                }
                await sendEmail(options);
                const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                await EmailCredential.update({
                    emailSend: increaseNumber
                }, { where: { id: finaliseEmailCredential.id } });
            }
        }
        //  Store OTP
        await EmailOTP.create({
            vallidTill: new Date().getTime() + parseInt(FORGET_OTP_VALIDITY),
            otp: otp,
            userId: user.id
        });
        res.status(201).send({
            success: true,
            message: `OTP send to email successfully! Valid for ${FORGET_OTP_VALIDITY / (60 * 1000)} minutes!`,
            data: { email: email }
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        // Validate body
        const { error } = verifyOTP(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, otp } = req.body;
        // Is Email Otp exist
        const isOtp = await EmailOTP.findOne({
            where: {
                otp: otp
            }
        });
        if (!isOtp) {
            return res.status(400).send({
                success: false,
                message: `Invalid OTP!`
            });
        }
        // Checking is user present or not
        const user = await User.findOne({
            where: {
                [Op.and]: [
                    { email: email }, { id: isOtp.userId }
                ]
            }
        });
        if (!user) {
            return res.status(400).send({
                success: false,
                message: "No Details Found. Register Now!"
            });
        }
        // is email otp expired?
        const isOtpExpired = new Date().getTime() > parseInt(isOtp.vallidTill);
        if (isOtpExpired) {
            await EmailOTP.destroy({ where: { userId: isOtp.userId } });
            return res.status(400).send({
                success: false,
                message: `OTP expired, please regenerate new OTP!`
            });
        }
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: user.id,
                email: email
            },
            JWT_SECRET_KEY_USER,
            { expiresIn: JWT_VALIDITY } // five day
        );
        await EmailOTP.destroy({ where: { userId: isOtp.userId } });
        res.status(201).send({
            success: true,
            message: `OTP matched successfully!`,
            data: authToken
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.signInByEmailOTP = async (req, res) => {
    try {
        // Validate body
        const { error } = signInByEmailOTP(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email } = req.body;
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(400).send({
                success: false,
                message: "User is not present! Register.."
            });
        }

        // Generate OTP for Email
        const otp = emailOTP.generateFixedLengthRandomNumber(OTP_LENGTH);
        // Update sendEmail 0 every day
        const date = JSON.stringify(new Date());
        const todayDate = `${date.slice(1, 11)}`;
        const changeUpdateDate = await EmailCredential.findAll({
            where: {
                updatedAt: { [Op.lt]: todayDate }
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        for (let i = 0; i < changeUpdateDate.length; i++) {
            // console.log("hii");
            await EmailCredential.update({
                emailSend: 0
            }, {
                where: {
                    id: changeUpdateDate[i].id
                }
            });
        }
        // finalise email credentiel
        const emailCredential = await EmailCredential.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        let finaliseEmailCredential;
        for (let i = 0; i < emailCredential.length; i++) {
            if (parseInt(emailCredential[i].emailSend) < 300) {
                finaliseEmailCredential = emailCredential[i];
                break;
            }
        }
        if (finaliseEmailCredential) {
            // Send OTP to Email By Brevo
            if (finaliseEmailCredential.plateForm === "BREVO") {
                const options = {
                    subject: "Login",
                    brevoEmail: finaliseEmailCredential.email,
                    brevoKey: finaliseEmailCredential.EMAIL_API_KEY,
                    headers: { "OTP for ragistration verification": "123A" },
                    htmlContent: ` <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verification Card</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f4f5ff;">
                        <center>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td align="center" style="padding: 20px 0; background-color: #f4f5ff;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="80%" style="max-width: 400px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                            <tr>
                                                <td style="padding: 30px;">
                                                    <img src="https://affiliate.techastute.in/static/media/logo.49cbec0ecddcccf78524.png" alt="Logo" width="100" style="max-width: 100px; height: auto;">
                                                    <p style="font-size: 14px; font-family: verdana; color: #333; margin: 15px 0;">Hi <span style="font-weight: 600; color: #333;">${email},</span></p>
                                                    <p style="font-size: 14px; font-family: verdana; color: #333;">Please copy the One Time Password (OTP) below and enter it on the verification page of My Way SIP.</p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p style="font-size: 32px; font-weight: bold; text-align: center; color: #1c2e4a; margin: 20px 0;">${otp}</p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p style="font-size: 14px; font-family: verdana; color: #333;">This code <span style="font-weight: 600; color: #333;">expires in ${parseInt(FORGET_OTP_VALIDITY) / 1000 / 60} minutes.</span> Please, <span style="font-weight: 600; color: #333;">DO NOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p  style="font-size: 14px; text-align: center; color: #666;">Powered by Your Company | Address | Contact Information</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </center>
                    </body>
                    </html>`,
                    userEmail: email,
                    userName: user.name
                }
                await sendEmail(options);
                const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                await EmailCredential.update({
                    emailSend: increaseNumber
                }, { where: { id: finaliseEmailCredential.id } });
            }
        }
        //  Store OTP
        await EmailOTP.create({
            vallidTill: new Date().getTime() + parseInt(FORGET_OTP_VALIDITY),
            otp: otp,
            userId: user.id
        });
        res.status(201).send({
            success: true,
            message: `OTP send to email successfully! Valid for ${FORGET_OTP_VALIDITY / (60 * 1000)} minutes!`,
            data: { email: email }
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.allUserForAdmin = async (req, res) => {
    try {
        // Validate body
        const { error } = getUser(req.query);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { page, limit, search, serviceId, paid } = req.query;
        const isPaid = paid ? paid : false;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { mobileNumber: { [Op.substring]: search } },
                    { email: { [Op.substring]: search } }
                ]
            })
        }
        // Only paid User
        if (isPaid) {
            const usersId = [];
            let allSuccessPayment;
            if (serviceId) {
                allSuccessPayment = await User_Service.findAll({
                    where: {
                        serviceId: serviceId,
                        status: "Paid",
                        verify: true,
                        serviceActive: true
                    }
                });
            } else {
                allSuccessPayment = await User_Service.findAll({
                    where: {
                        status: "Paid",
                        verify: true,
                        serviceActive: true
                    }
                });
            }
            for (let i = 0; i < allSuccessPayment.length; i++) {
                usersId.push(allSuccessPayment[i].userId);
            }
            condition.push({ id: usersId });
        }
        // Count All User
        const totalUser = await User.count({
            where: {
                [Op.and]: condition
            }
        });
        const user = await User.findAll({
            where: {
                [Op.and]: condition
            },
            limit: recordLimit,
            offset: offSet,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).send({
            success: true,
            message: `Users fetched successfully!`,
            totalPage: Math.ceil(totalUser / recordLimit),
            currentPage: currentPage,
            data: user
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.userForAdmin = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'This user is not present!'
            });
        }
        res.status(200).send({
            success: true,
            message: `User fetched successfully!`,
            data: user
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.user.id
            },
            include: [{
                model: ProfileImage,
                as: "profileImage"
            }]
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'This user is not present!'
            });
        }
        res.status(200).send({
            success: true,
            message: `User fetched successfully!`,
            data: user
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        // Validate body
        const { error } = updateUser(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, name, mobileNumber, age, profession, state, city } = req.body;
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'This user is not present!'
            });
        }
        await user.update({
            ...user,
            name: name,
            mobileNumber: mobileNumber,
            age: age,
            profession: profession,
            state: state,
            city: city
        });
        res.status(200).send({
            success: true,
            message: `User updated successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};