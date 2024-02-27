const db = require('../../Models');
const User_Service = db.user_service;
const crypto = require('crypto');
const { createPayment } = require("../../Middlewares/Validation/validationUser");
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_ID, THANKYOU_PATH } = process.env;
const { Op } = require('sequelize');

// Razorpay
const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET_ID
});

exports.createPayment = async (req, res) => {
    try {
        // Validate body
        const { error } = createPayment(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { amount, currency, receipt } = req.body; // receipt is id created for this order
        const serviceId = req.params.id;
        const userId = req.user.id;
        // initiate payment
        razorpayInstance.orders.create({ amount, currency, receipt },
            (err, order) => {
                if (!err) {
                    User_Service.create({
                        serviceId: serviceId,
                        userId: userId,
                        amount: amount / 100,
                        currency: currency,
                        receipt: receipt,
                        razorpayOrderId: order.id,
                        status: "Created",
                        razorpayTime: order.created_at,
                        verify: false
                    })
                        .then(() => {
                            res.status(201).send({
                                success: true,
                                message: `Order craeted successfully!`,
                                data: order
                            });
                        })
                        .catch((err) => {
                            res.status(500).send({
                                success: false,
                                err: err.message
                            });
                        });
                }
                else {
                    res.status(500).send({
                        success: false,
                        err: err.message
                    });
                }
            })
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const orderId = req.body.razorpay_order_id;
        const paymentId = req.body.razorpay_payment_id;
        const razorpay_signature = req.body.razorpay_signature;
        // Creating hmac object 
        let hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_ID);
        // Passing the data to be hashed
        hmac.update(orderId + "|" + paymentId);
        // Creating the hmac in the required format
        const generated_signature = hmac.digest('hex');

        if (razorpay_signature === generated_signature) {
            const purchase = await User_Service.findOne({
                where: {
                    razorpayOrderId: orderId,
                    verify: false,
                    status: "Created"
                }
            });
            if (!purchase) {
                return res.status(200).json({
                    success: true,
                    message: "Payment has been verified! Second Time!"
                });
            }
            // Update Purchase
            await purchase.update({
                ...purchase,
                status: "Paid",
                razorpayPaymentId: paymentId,
                verify: true
            });
            res.status(200).redirect(THANKYOU_PATH);
        }
        else {
            res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};


exports.getPaymentForAdmin = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
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
                    { status: { [Op.substring]: search } },
                    { verify: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Payment
        const totalUser_Service = await User_Service.count({
            where: {
                [Op.and]: condition
            }
        });
        const user_service = await User_Service.findAll({
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
            message: `Payment fetched successfully!`,
            totalPage: Math.ceil(totalUser_Service / recordLimit),
            currentPage: currentPage,
            data: user_service
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};