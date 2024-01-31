const db = require('../Models');
const Admin = db.admin;
const User = db.user;
const { Op } = require("sequelize")
const RequiredQuestion = db.requiredQuestion;
const RequiredQuestionAnswer = db.questionAnswer;

exports.isAdminPresent = async (req, res, next) => {
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
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

exports.isUserPresent = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                [Op.and]: [
                    { id: req.user.id }, { email: req.user.email }
                ]
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not present!"
            });
        }
        if (user.name && user.age && user.profession && user.city && user.state) {
            req.user = {
                ...req.user,
                name: user.name
            };
            next();
        } else {
            return res.status(400).json({
                success: false,
                message: "Please complete your profile!"
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

exports.isUserAttemptedAllQuestion = async (req, res, next) => {
    try {
        const compareArrays = (a, b) => a.length === b.length && a.every((element, index) => element === b[index]);
        const adminQuestion = await RequiredQuestion.findAll({
            order: [
                ['id', 'ASC']
            ]
        });
        const userAnswer = await RequiredQuestionAnswer.findAll({
            where: { userId: req.user.id }, order: [
                ['questionId', 'ASC']
            ]
        });
        if (userAnswer.length <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please attempt question!"
            });
        }
        if (adminQuestion.length !== userAnswer.length) {
            return res.status(400).json({
                success: false,
                message: "Please attempt all question!"
            });
        }
        const questionIds = [];
        const userAnswerIds = [];
        for (let i = 0; i < adminQuestion.length; i++) {
            questionIds.push(adminQuestion[i].id);
        }
        for (let i = 0; i < userAnswer.length; i++) {
            userAnswerIds.push(userAnswer[i].questionId);
        }
        const check = compareArrays(questionIds, userAnswerIds);
        if (check === false) {
            return res.status(400).json({
                success: false,
                message: "Please attempt all question!"
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}