const db = require('../../Models');
const StockPortfolio = db.stockPortfolio;
const PreviousStockPortfolio = db.previousStockPortfolio;
const AdminNotification = db.adminNotification;
const { addStockPortfolio } = require("../../Middlewares/Validation/validationUser");
const { Op } = require("sequelize");

// addStockPortfolio
// getMyStockPortfolio
// getStockPortfolioForAdmin
// updateStockPortfolio
// softDeleteStockPortfolio

exports.addStockPortfolio = async (req, res) => {
    try {
        const { error } = addStockPortfolio(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const { stockName, buyingPrice, investmentDate, currentMarketValue, shareQuantity } = req.body;
        await StockPortfolio.create({
            stockName: stockName,
            buyingPrice: buyingPrice,
            currentMarketValue: currentMarketValue,
            investmentDate: investmentDate,
            shareQuantity: parseInt(shareQuantity),
            userId: req.user.id
        });
        res.status(200).json({
            success: true,
            message: 'Stock added successfully!'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getMyStockPortfolio = async (req, res) => {
    try {
        const stock = await StockPortfolio.findAll({
            where: {
                userId: req.user.id
            }
        });
        res.status(200).json({
            success: true,
            message: 'Stock fetched successfully!',
            data: stock
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getStockPortfolioForAdmin = async (req, res) => {
    try {
        const stock = await StockPortfolio.findAll({
            where: {
                userId: req.params.id
            }
        });
        res.status(200).json({
            success: true,
            message: 'Stock fetched successfully!',
            data: stock
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateStockPortfolio = async (req, res) => {
    try {
        const { error } = addStockPortfolio(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const { stockName, buyingPrice, investmentDate, currentMarketValue, exitDate, shareQuantity } = req.body;
        const stock = await StockPortfolio.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!stock) {
            res.status(400).json({
                success: false,
                message: 'This Stock is not present!'
            });
        }
        // Store value to previous record
        await PreviousStockPortfolio.create({
            stockName: stock.stockName,
            buyingPrice: stock.buyingPrice,
            investmentDate: stock.investmentDate,
            currentMarketValue: stock.currentMarketValue,
            exitDate: stock.exitDate,
            stockId: stock.id,
            shareQuantity: stock.shareQuantity,
            userId: req.user.id
        });
        // Update Stock
        const newStock = await stock.update({
            ...stock,
            stockName: stockName,
            buyingPrice: buyingPrice,
            investmentDate: investmentDate,
            currentMarketValue: currentMarketValue,
            shareQuantity: parseInt(shareQuantity),
            exitDate: exitDate
        });
        // Create notification for admin
        await AdminNotification.create({
            message: `${req.user.name} updated ${newStock.stockName}!`,
            userId: req.user.id
        });
        res.status(200).json({
            success: true,
            message: 'Stock updated successfully!'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteStockPortfolio = async (req, res) => {
    try {
        const stock = await StockPortfolio.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!stock) {
            res.status(400).json({
                success: false,
                message: 'This Stock is not present!'
            });
        }
        await stock.destroy();
        res.status(200).json({
            success: true,
            message: 'Stock deleted successfully!'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};