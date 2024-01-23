const joi = require('joi');

exports.validateAdminRegistration = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required().label('Email'),
        mobileNumber: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        password: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(20)
    });
    return schema.validate(data);
}

exports.validateAdminLogin = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        password: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(20)
    });
    return schema.validate(data);
}

exports.changePassword = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        oldPassword: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(20),
        newPassword: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(20),
    });
    return schema.validate(data);
}

exports.updateService = (data) => {
    const schema = joi.object().keys({
        serviceName: joi.string().required(),
        price: joi.string().required()
    });
    return schema.validate(data);
}

exports.createRequiredQuestion = (data) => {
    const schema = joi.object().keys({
        questionTitle: joi.string().required(),
        question: joi.string().required(),
        options: joi.string().required(),
        points: joi.string().required()
    });
    return schema.validate(data);
}

exports.attempQuestion = (data) => {
    const schema = joi.object().keys({
        answers: joi.array().required()
    });
    return schema.validate(data);
}