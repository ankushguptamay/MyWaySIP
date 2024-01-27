const db = require('../../Models');
const User = db.user;
const User_Service = db.user_service;
const { Op } = require("sequelize");
const Service = db.service;


exports.totalUser = async (req, res) => {
    try {
        const user = await User.count();
        res.status(200).send({
            success: true,
            message: `Total user fetched successfully!`,
            data: user
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.totalPaidUser = async (req, res) => {
    try {
        const userIDs = [];
        const user_Service = await User_Service.findAll({
            where: {
                status: "Paid",
                verify: true
            }
        });
        for (let i = 0; i < user_Service.length; i++) {
            userIDs.push(user_Service[i].userId);
        }
        const user = await User.count({
            where: {
                id: userIDs
            }
        });
        res.status(200).send({
            success: true,
            message: `Total paid user fetched successfully!`,
            data: user
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.totalNonPaidUser = async (req, res) => {
    try {
        const userIDs = [];
        const user_Service = await User_Service.findAll({
            where: {
                status: "Paid",
                verify: true
            }
        });
        for (let i = 0; i < user_Service.length; i++) {
            userIDs.push(user_Service[i].userId);
        }
        const paidUser = await User.count({
            where: {
                id: userIDs
            }
        });
        const user = await User.count();
        res.status(200).send({
            success: true,
            message: `Total non paid user fetched successfully!`,
            data: parseInt(user) - parseInt(paidUser)
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.totalNewUser = async (req, res) => {
    try {
        const date = JSON.stringify(new Date());
        const todayDate = `${date.slice(1, 11)}`;
        const user = await User.count({
            where: {
                createdAt: { [Op.gt]: todayDate }
            }
        });
        res.status(200).send({
            success: true,
            message: `Total new user fetched successfully!`,
            data: user
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};