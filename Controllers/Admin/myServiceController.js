const db = require('../../Models');
const Service = db.service;
const { updateService } = require("../../Middlewares/Validation/validateAdmin");

exports.getAllService = async (req, res) => {
    try {
        const service = await Service.findAll();
        res.status(200).send({
            success: true,
            message: `Service fetched successfully!`,
            data: service
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.createService = async (req, res) => {
    try {
        await Service.create({
            serviceName: req.body.serviceName,
            price: req.body.price
        });
        res.status(200).send({
            success: true,
            message: `Service created successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getService = async (req, res) => {
    try {
        const service = await Service.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!service) {
            res.status(400).send({
                success: false,
                message: `This service is not present!`
            });
        }
        res.status(200).send({
            success: true,
            message: `Service fetched successfully!`,
            data: service
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { error } = updateService(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const service = await Service.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!service) {
            res.status(400).send({
                success: false,
                message: `This service is not present!`
            });
        }
        await service.update({
            serviceName: req.body.serviceName,
            price: req.body.price
        });
        res.status(200).send({
            success: true,
            message: `Service updtaed successfully!`,
            data: service
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};