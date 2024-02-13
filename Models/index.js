const dbConfig = require('../Config/db.config.js');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

const queryInterface = sequelize.getQueryInterface();

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Admin
db.admin = require('./Admin/adminModel.js')(sequelize, Sequelize);
db.requiredQuestion = require('./Admin/requireQuestionController.js')(sequelize, Sequelize);
db.analysisReport = require('./Admin/analysisReportModel.js')(sequelize, Sequelize);
db.service = require('./Admin/myServiceModel.js')(sequelize, Sequelize);
db.adminNotification = require('./Admin/adminNotificationModel.js')(sequelize, Sequelize);
db.emailCredential = require('./Admin/emailCredentialsModel.js')(sequelize, Sequelize);
// User
db.user = require('./User/userModel.js')(sequelize, Sequelize);
db.commentOnService = require('./User/userCommentOnService.js')(sequelize, Sequelize);
db.profileImage = require('./User/userProfileImageModel.js')(sequelize, Sequelize);
db.questionAnswer = require('./User/requiredQuestionAnswerModel.js')(sequelize, Sequelize);
db.questionResult = require('./User/requiredQuestionResultsModel.js')(sequelize, Sequelize);
db.emailOTP = require('./User/emailOTPModel.js')(sequelize, Sequelize);
db.mFund = require('./User/mFundModel.js')(sequelize, Sequelize);
db.user_service = require('./User/user_ServiceModel.js')(sequelize, Sequelize);
db.stockPortfolio = require('./User/stockPortfolioModel.js')(sequelize, Sequelize);
db.previousStockPortfolio = require('./User/PreviousRecord/previousStockPortfolioModel.js')(sequelize, Sequelize);
db.previousMFund = require('./User/PreviousRecord/previousMFundModel.js')(sequelize, Sequelize);

// User Association
db.user.hasMany(db.mFund, { foreignKey: "userId", as: "mFunds" });
db.mFund.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasMany(db.stockPortfolio, { foreignKey: "userId", as: "stockPortfolios" });
db.stockPortfolio.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasMany(db.previousStockPortfolio, { foreignKey: "userId", as: "previousStockPortfolios" });

db.stockPortfolio.hasMany(db.previousStockPortfolio, { foreignKey: "stockId", as: "previousStockPortfolios" });

db.user.hasMany(db.previousMFund, { foreignKey: "userId", as: "previousMFunds" });

db.mFund.hasMany(db.previousMFund, { foreignKey: "mFundId", as: "previousMFunds" });

// Question Answer
db.user.hasMany(db.questionAnswer, { foreignKey: "userId", as: "answers" });
db.questionAnswer.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.requiredQuestion.hasMany(db.questionAnswer, { foreignKey: "questionId", as: "answers" });
db.questionAnswer.belongsTo(db.requiredQuestion, { foreignKey: "questionId", as: "questions" });

// Question Answer
db.user.hasOne(db.questionResult, { foreignKey: "userId", as: "results" });
db.questionResult.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasOne(db.profileImage, { foreignKey: "userId", as: "profileImage" });
db.profileImage.belongsTo(db.user, { foreignKey: "userId", as: "user" });

// db.emailCredential.findOne({
//     where: {
//         email: "info@mywaysip.in"
//     }
// }).then((res) => {
//     if (!res) {
//         db.emailCredential.create({
//             email: "info@mywaysip.in",
//             plateForm: "BREVO",
//             EMAIL_API_KEY: process.env.EMAIL_API_KEY
//         });
//     }
// }).catch((err) => { console.log(err) });

// const serviceArray = [{
//     serviceName: "New Mutual Fund Creation Tool",
//     price: "100",
//     serviceCode:"AAA"
// }, {
//     serviceName: "Mutual Fund Portfolio Analysis Tool",
//     price: "100",
//     serviceCode:"BBB"
// }, {
//     serviceName: "Stocks Portfolio Analysis",
//     price: "100",
//     serviceCode:"CCC"
// }, {
//     serviceName: "Technical Analysis Tool For Stocks",
//     price: "100",
//     serviceCode:"DDD"
// },{
//     serviceName: "Portfolio Management Service",
//     price: "100",S
//     serviceCode:"EEE"
// }]
// for (let i = 0; i < serviceArray.length; i++) {
//     db.service.findOne({
//         where: {
//             serviceName: serviceArray[i].serviceName
//         }
//     }).then((res) => {
//         console.log(res);
//         if (!res) {
//             db.service.create({
//                 serviceName: serviceArray[i].serviceName,
//                 price: serviceArray[i].price
//             });
//         }
//     }).catch((err) => { console.log(err) });
// }

// const questionArray = [{
//     questionTitle: "Investment Goals",
//     question: "What is your primary investment goal?",
//     options: {
//         a: "Capital preservation",
//         b: "Income generation",
//         c: "Capital growth"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Risk Tolerance",
//     question: "How would you describe your tolerance for short-term fluctuations in the value of your investments?",
//     options: {
//         a: "Low tolerance",
//         b: "Moderate tolerance",
//         c: "High tolerance"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Time Horizon",
//     question: "What is your time horizon for this investment?",
//     options: {
//         a: "Short-term",
//         b: "Medium-term",
//         c: "Long-term"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Asset Allocation Preference",
//     question: "How would you prefer to allocate your investments among different asset classes?",
//     options: {
//         a: "Mostly low-risk assets",
//         b: "A mix of low and moderate-risk assets",
//         c: "Mostly high-risk assets"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Loss Tolerance",
//     question: "How comfortable are you with the possibility of losing some or all of your investment for the potential of higher returns?",
//     options: {
//         a: "Not comfortable at all",
//         b: "Somewhat comfortable",
//         c: "Very comfortable"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Investment Knowledge",
//     question: "How familiar are you with different types of investment products?",
//     options: {
//         a: "Not familiar",
//         b: "Somewhat familiar",
//         c: "Very familiar"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Financial Situation",
//     question: "How would you describe your current financial situation and stability?",
//     options: {
//         a: "Conservative (preference for capital preservation)",
//         b: "Moderate (balanced approach)",
//         c: "Aggressive (willing to take higher risks for potential returns)"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Market Conditions Reaction",
//     question: "How do you typically react to changes in the financial markets?",
//     options: {
//         a: "Sell investments and move to more conservative options",
//         b: "Hold steady and ride out market fluctuations",
//         c: "Take advantage of market opportunities and possibly increase risk exposure"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Diversification",
//     question: "How important is diversification in your investment strategy?",
//     options: {
//         a: "Not important",
//         b: "Moderately important",
//         c: "Very important"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Monitoring Investments",
//     question: "How often do you review and monitor your investment portfolio?",
//     options: {
//         a: "Rarely",
//         b: "Occasionally",
//         c: "Regularly"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }]
// for (let i = 0; i < questionArray.length; i++) {
//     db.requiredQuestion.findOne({
//         where: {
//             questionTitle: questionArray[i].questionTitle
//         }
//     }).then((res) => {
//         console.log(res);
//         if (!res) {
//             db.requiredQuestion.create({
//                 questionTitle: questionArray[i].questionTitle,
//                 question: questionArray[i].question,
//                 options: questionArray[i].options,
//                 points: questionArray[i].points
//             });
//         }
//     }).catch((err) => { console.log(err) });
// }

// queryInterface.addColumn("user_services", "serviceActive", { type: DataTypes.BOOLEAN, defaultValue: true }).then((res) => { console.log(res) }).catch((err) => { console.log(err) });

module.exports = db;