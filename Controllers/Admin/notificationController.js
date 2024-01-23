const db = require('../../Models');
const AdminNotification = db.adminNotification;

exports.getAllNotification = async (req, res) => {
    try {
        const adminNotification = await AdminNotification.findAll();
        res.status(200).send({
            success: true,
            message: `Notification fetched successfully!`,
            data: adminNotification
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getNotification = async (req, res) => {
    try {
        const adminNotification = await AdminNotification.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!adminNotification) {
            res.status(400).send({
                success: false,
                message: `This notification is not present!`
            });
        }
        res.status(200).send({
            success: true,
            message: `Notification fetched successfully!`,
            data: adminNotification
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.changeSeenStatus = async (req, res) => {
    try {
        await AdminNotification.update({
            seenByAdmin: true
        }, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).send({
            success: true,
            message: `Notification seen status changed successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};