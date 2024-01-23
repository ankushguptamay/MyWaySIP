const db = require('../../Models');
const Admin = db.admin;
const { validateAdminLogin, validateAdminRegistration, changePassword } = require("../../Middlewares/Validation/validateAdmin");
const { JWT_SECRET_KEY_ADMIN, JWT_VALIDITY } = process.env;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const SALT = 10;

exports.registerAdmin = async (req, res) => {
    try {
        const { error } = validateAdminRegistration(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const isAdmin = await Admin.findOne({
            where: {
                email: req.body.email,
            },
        });
        if (isAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already present!"
            });
        }
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const admin = await Admin.create({
            ...req.body,
            password: hashedPassword,
        });
        const data = {
            id: admin.id,
            email: req.body.email
        }
        const authToken = jwt.sign(
            data,
            JWT_SECRET_KEY_ADMIN,
            { expiresIn: JWT_VALIDITY } // five day
        );
        res.status(200).json({
            success: true,
            message: 'Register successfully!',
            authToken: authToken
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { error } = validateAdminLogin(req.body);
        if (error) {
            console.log(error);
            return res.status(400).json(error.details[0].message);
        }
        const admin = await Admin.findOne({
            where: {
                email: req.body.email,
            },
        });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password!"
            });
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            admin.password
        );
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password!"
            });
        }
        const data = {
            id: admin.id,
            email: req.body.email
        }
        const authToken = jwt.sign(
            data,
            JWT_SECRET_KEY_ADMIN,
            { expiresIn: JWT_VALIDITY } // five day
        );
        res.status(200).json({
            success: true,
            message: 'Login successfully!',
            authToken: authToken
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { error } = changePassword(req.body);
        if (error) {
            console.log(error);
            return res.status(400).json(error.details[0].message);
        }
        const admin = await Admin.findOne({
            where: {
                email: req.body.email,
            },
        });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password!"
            });
        }
        const validPassword = await bcrypt.compare(
            req.body.oldPassword,
            admin.password
        );
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password!"
            });
        }
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
        await admin.update({
            ...admin,
            password: hashedPassword,
        });
        const data = {
            id: admin.id,
            email: req.body.email
        }
        const authToken = jwt.sign(
            data,
            JWT_SECRET_KEY_ADMIN,
            { expiresIn: JWT_VALIDITY } // five day
        );
        res.status(200).json({
            success: true,
            message: 'Password changed successfully!',
            authToken: authToken
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateAdminName = async (req, res) => {
    try {
        const admin = await Admin.findOne({
            where: {
                [Op.and]: [
                    { id: req.admin.id }, { email: req.admin.email }
                ]
            }
        });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Your profile is not present! Are you register?.. "
            })
        };
        const { name } = req.body;
        await admin.update({
            ...admin,
            name: name
        });
        res.status(200).json({
            success: true,
            message: "Admin updated successfully!"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

exports.getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne({
            where: {
                [Op.and]: [
                    { id: req.admin.id }, { email: req.admin.email }
                ]
            }
        });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Admin is not present!"
            })
        }
        res.status(200).json({
            success: true,
            message: "Admin Profile Fetched successfully!",
            data: admin
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}