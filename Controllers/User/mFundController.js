const db = require('../../Models');
const MutualFund = db.mFund;
const PreviousMutualFund = db.previousMFund;
const AdminNotification = db.adminNotification;
const { addMFund } = require("../../Middlewares/Validation/validationUser");
const { Op } = require("sequelize");

// addMFund
// getMyMFund
// getMFundForAdmin
// updateMFund
// softDeleteMFund

exports.addMFund = async (req, res) => {
    try {
        const { error } = addMFund(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const { serviceId, mFSchemeName, investedSIPAmount, investedLumSumAmount, investmentTypeSIP, investmentTypeLumSum, currentMarketValue, currentMFundValue, investmentDate } = req.body;
        if (investmentTypeSIP === true && investmentTypeLumSum === false) {
            if (!investedSIPAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Investment SIP Amount should be present!'
                });
            }
        } else if (investmentTypeSIP === false && investmentTypeLumSum === true) {
            if (!investedLumSumAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Investment LumSum Amount should be present!'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Required field should be present!'
            });
        }
        await MutualFund.create({
            mFSchemeName: mFSchemeName,
            investedLumSumAmount: investedLumSumAmount,
            investedSIPAmount: investedSIPAmount,
            investmentTypeSIP: investmentTypeSIP,
            investmentTypeLumSum: investmentTypeLumSum,
            currentMFundValue: currentMFundValue,
            currentMarketValue: currentMarketValue,
            investmentDate: investmentDate,
            serviceId: serviceId,
            byPDF: false,
            byData: true,
            userId: req.user.id
        });
        res.status(200).json({
            success: true,
            message: 'Mutual fund added successfully!'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getMyMFund = async (req, res) => {
    try {
        const mFunds = await MutualFund.findAll({
            where: {
                userId: req.user.id
            }
        });
        res.status(200).json({
            success: true,
            message: 'Mutual fund fetched successfully!',
            data: mFunds
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getMFundForAdmin = async (req, res) => {
    try {
        const mFunds = await MutualFund.findAll({
            where: {
                userId: req.params.id
            }
        });
        res.status(200).json({
            success: true,
            message: 'Mutual fund fetched successfully!',
            data: mFunds
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


exports.updateMFund = async (req, res) => {
    try {
        const { error } = addMFund(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const { mFSchemeName, investedSIPAmount, investedLumSumAmount, investmentTypeSIP, investmentTypeLumSum, currentMarketValue, currentMFundValue, investmentDate } = req.body;
        const mFunds = await MutualFund.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!mFunds) {
            return res.status(400).json({
                success: false,
                message: 'This mutual fund is not present!'
            });
        }
        if (mFunds.isAnalysed === true) {
            return res.status(400).json({
                success: false,
                message: 'Can not update a analysed mutual fund!'
            });
        }
        // Store value to previous record
        await PreviousMutualFund.create({
            mFSchemeName: mFunds.mFSchemeName,
            investedLumSumAmount: mFunds.investedLumSumAmount,
            investedSIPAmount: mFunds.investedSIPAmount,
            investmentTypeSIP: mFunds.investmentTypeSIP,
            investmentTypeLumSum: mFunds.investmentTypeLumSum,
            currentMFundValue: mFunds.currentMFundValue,
            currentMarketValue: mFunds.currentMarketValue,
            investmentDate: mFunds.investmentDate,
            mFundId: mFunds.id,
            userId: req.user.id
        });
        // Update Mutual fund
        const newMFund = await mFunds.update({
            ...mFunds,
            mFSchemeName: mFSchemeName,
            investedLumSumAmount: investedLumSumAmount,
            investedSIPAmount: investedSIPAmount,
            investmentTypeSIP: investmentTypeSIP,
            investmentTypeLumSum: investmentTypeLumSum,
            currentMFundValue: currentMFundValue,
            currentMarketValue: currentMarketValue,
            investmentDate: investmentDate,
        });
        // Create notification for admin
        await AdminNotification.create({
            message: `${req.user.name} updated ${newMFund.mFSchemeName}!`,
            userId: req.user.id
        });
        res.status(200).json({
            success: true,
            message: 'Mutual fund updated successfully!'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteMFund = async (req, res) => {
    try {
        const mutualFunds = await MutualFund.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!mutualFunds) {
            return res.status(400).json({
                success: false,
                message: 'This Mutual fund is not present!'
            });
        }
        await mutualFunds.destroy();
        res.status(200).json({
            success: true,
            message: 'Mutual fund deleted successfully!'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};