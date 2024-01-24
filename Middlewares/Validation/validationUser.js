const joi = require('joi');

exports.registerByEmailOTP = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required().label('Email'),
        mobileNumber: joi.string().length(10).pattern(/^[0-9]+$/).required()
    });
    return schema.validate(data);
}

exports.verifyOTP = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        otp: joi.string().length(6).required()
    });
    return schema.validate(data);
}

exports.signInByEmailOTP = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email')
    });
    return schema.validate(data);
}

exports.addStockPortfolio = (data) => {
    const schema = joi.object().keys({
        stockName: joi.string().required(),
        investmentDate: joi.string().required(),
        buyingPrice: joi.string().required(),
        currentMarketValue: joi.string().required(),
        exitDate: joi.string().optional()
    });
    return schema.validate(data);
}

exports.updateUser = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required().label('Email'),
        mobileNumber: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        age: joi.string().required(),
        profession: joi.string().required(),
        state: joi.string().required(),
        city: joi.string().required()
    });
    return schema.validate(data);
}

exports.addMFund = (data) => {
    const schema = joi.object().keys({
        mFSchemeName: joi.string().required(),
        investedSIPAmount: joi.string().required(),
        investedLumSumAmount: joi.string().required(),
        investmentTypeSIP: joi.string().required(),
        investmentTypeLumSum: joi.string().required(),
        currentMarketValue: joi.string().required(),
        currentMFundValue: joi.string().required(),
        investmentDate: joi.string().required()
    });
    return schema.validate(data);
}

exports.createPayment = (data) => {
    const schema = joi.object().keys({
        amount: joi.string().required(),
        currency: joi.string().required(),
        receipt: joi.string().required(),
    });
    return schema.validate(data);
}