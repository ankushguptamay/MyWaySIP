const db = require('../../Models');
const AnalysisReport = db.analysisReport;
const StockPortfolio = db.stockPortfolio;
const User_Service = db.user_service;
const MutualFund = db.mFund;
const CommentOnService = db.commentOnService;
const { submitAnalysisReport, addCommentOnService } = require("../../Middlewares/Validation/validateAdmin");
const { deleteSingleFile } = require("../../Util/deleteFile");
const { s3UploadObject, s3DeleteObject } = require("../../Util/fileToS3");
const fs = require('fs');

exports.submitReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Select an image!"
            })
        }
        const { error } = submitAnalysisReport(req.body);
        if (error) {
            deleteSingleFile(req.file.path);
            return res.status(400).json(error.details[0].message);
        }
        const { uploadDate, serviceId, userId, serviceCode } = req.body;
        // Check Is this service Active or not
        const checkService = await User_Service.findOne({
            where: {
                userId: userId,
                serviceId: serviceId,
                status: "Paid",
                verify: true,
                serviceActive: true
            }
        });
        if (!checkService) {
            deleteSingleFile(req.file.path);
            return res.status(400).send({
                success: true,
                message: "This service is not active for this user!"
            });
        }
        // Uploading S3
        const imagePath = `./Resources/${(req.file.filename)}`
        const fileContent = fs.readFileSync(imagePath);
        const response = await s3UploadObject(req.file.filename, fileContent);
        deleteSingleFile(req.file.path);
        const fileAWSPath = response.Location;
        await AnalysisReport.create({
            uploadDate: uploadDate,
            userId: userId,
            serviceId: serviceId,
            report_FileName: req.file.filename,
            report_OriginalName: req.file.originalname,
            reportt_Path: fileAWSPath,
            report_MimeType: req.file.mimetype
        });
        // Change analysis status
        if (serviceCode === "BBB") {
            await MutualFund.update({
                isAnalysed: true
            }, {
                where: {
                    serviceId: serviceId
                }
            });
        } else if (serviceCode === "CCC") {
            await StockPortfolio.update({
                isAnalysed: true
            }, {
                where: {
                    serviceId: serviceId
                }
            });
        }
        // Deactive Service
        await checkService.update({ ...checkService, serviceActive: false });
        // Soft DeleteComment
        await CommentOnService.destroy({
            where: {
                userId: userId,
                serviceId: serviceId
            }
        });
        res.status(200).send({
            success: true,
            message: "Anylysis report submit successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getReportForAdmin = async (req, res) => {
    try {
        const { serviceId } = req.query;
        let condition = {
            userId: req.params.id
        };
        if (serviceId) {
            condition = {
                userId: req.params.id,
                serviceId: serviceId
            };
        }
        const analysis = await AnalysisReport.findAll({
            where: condition
        });
        res.status(200).send({
            success: true,
            message: "Anylysis report fetched successfully!",
            data: analysis
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getReportForUser = async (req, res) => {
    try {
        const { serviceId } = req.query;
        let condition = {
            userId: req.user.id
        };
        if (serviceId) {
            condition = {
                userId: req.params.id,
                serviceId: serviceId
            };
        }
        const analysis = await AnalysisReport.findAll({
            where: condition
        });
        res.status(200).send({
            success: true,
            message: "Anylysis report fetched successfully!",
            data: analysis
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.addCommentOnService = async (req, res) => {
    try {
        const { error } = addCommentOnService(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const { serviceId, comment } = req.body;
        await CommentOnService.create({
            serviceId: serviceId,
            comment: comment,
            userId: req.user.id
        });
        res.status(200).send({
            success: true,
            message: "Comment successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const report = await AnalysisReport.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!report) {
            return res.status(400).send({
                success: true,
                message: "This anylysis report is not present!"
            });
        }
        await s3DeleteObject(report.report_FileName);
        await report.destroy();
        res.status(200).send({
            success: true,
            message: "Anylysis report deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};