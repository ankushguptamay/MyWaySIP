const db = require('../../Models');
const AnalysisReport = db.analysisReport;
const { submitAnalysisReport } = require("../../Middlewares/Validation/validateAdmin");
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
        const { uploadDate, serviceId, userId } = req.body;
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
        await AnalysisReport.findAll({
            where: condition
        });
        res.status(200).send({
            success: true,
            message: "Anylysis report fetched successfully!"
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
        await AnalysisReport.findAll({
            where: condition
        });
        res.status(200).send({
            success: true,
            message: "Anylysis report fetched successfully!"
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