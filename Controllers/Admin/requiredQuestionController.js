const db = require('../../Models');
const RequiredQuestion = db.requiredQuestion;
const RequiredQuestionAnswer = db.questionAnswer;
const Result = db.questionResult;
const { createRequiredQuestion, attemptQuestion } = require("../../Middlewares/Validation/validateAdmin");

const checkResults = async (question, userAnswer) => {
    let num = 0;
    let result;
    for (let i = 0; i < userAnswer.length; i++) {
        const attemptQuestionId = userAnswer[i].questionId;
        for (let j = 0; j < question.length; j++) {
            const questionId = question[j].id;
            if (questionId === attemptQuestionId) {
                if (userAnswer[i].answer === "a") {
                    num = num + 1;
                } else if (userAnswer[i].answer === "b") {
                    num = num + 2;
                } else if (userAnswer[i].answer === "c") {
                    num = num + 3;
                }
            }
        }
    }
    if (num <= 9) {
        result = "Conservative";
    } else if (num >= 10 && num <= 15) {
        result = "Balanced";
    } else {
        result = "Aggresive";
    }
    let response = {
        point: num,
        result: result
    }
    return response;
}

exports.getAllRequiredQuestion = async (req, res) => {
    try {
        const question = await RequiredQuestion.findAll();
        res.status(200).send({
            success: true,
            message: `Question fetched successfully!`,
            data: question
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.createRequiredQuestion = async (req, res) => {
    try {
        const { error } = createRequiredQuestion(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const { points, options, questionTitle, question } = req.body;
        await RequiredQuestion.create({
            points: points,
            options: options,
            question: question,
            questionTitle: questionTitle
        });
        res.status(200).send({
            success: true,
            message: `Question created successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getRequiredQuestion = async (req, res) => {
    try {
        const question = await RequiredQuestion.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!question) {
            res.status(400).send({
                success: false,
                message: `This question is not present!`
            });
        }
        res.status(200).send({
            success: true,
            message: `Question fetched successfully!`,
            data: question
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.attemptQuestion = async (req, res) => {
    try {
        // const answers = [{
        //     questionId: "",
        //     answer: "a"
        // }, {
        //     questionId: "",
        //     answer: "b"
        // }]
        const { error } = attemptQuestion(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }
        const { answers } = req.body;
        // If user has already submit answer that can not change 
        for (let i = 0; i < answers.length; i++) {
            const isAttempted = await RequiredQuestionAnswer.findOne({
                where: {
                    questionId: answers[i].questionId,
                    userId: req.user.id
                }
            });
            if (!isAttempted) {
                await RequiredQuestionAnswer.create({
                    questionId: answers[i].questionId,
                    answer: answers[i].answer,
                    userId: req.user.id
                });
            }
        }
        const adminQuestion = await RequiredQuestion.findAll();
        const userAnswer = await RequiredQuestionAnswer.findAll({ where: { userId: req.user.id } });
        const response = await checkResults(adminQuestion, userAnswer);
        const result = await Result.findOne({
            where: {
                userId: req.user.id
            }
        });
        if (!result) {
            await Result.create({
                result: response.result,
                obtainPoints: response.point,
                userId: req.user.id
            });
        } else {
            await result.update({
                ...result,
                result: response.result,
                obtainPoints: response.point,
            });
        }
        res.status(200).send({
            success: true,
            message: `Answer submited successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getMyResult = async (req, res) => {
    try {
        const result = await Result.findOne({
            where: {
                userId: req.user.id
            }
        });
        res.status(200).send({
            success: true,
            message: `Fetched successfully!`,
            data: result
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getUserResult = async (req, res) => {
    try {
        const result = await Result.findOne({
            where: {
                userId: req.params.id
            }
        });
        res.status(200).send({
            success: true,
            message: `Fetched successfully!`,
            data: result
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};