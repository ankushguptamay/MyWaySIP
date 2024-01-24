const dbConfig = require('../Config/db.config.js');

const Sequelize = require('sequelize');
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

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Admin
db.admin = require('./Admin/adminModel.js')(sequelize, Sequelize);
db.requiredQuestion = require('./Admin/requireQuestionController.js')(sequelize, Sequelize);
db.service = require('./Admin/myServiceModel.js')(sequelize, Sequelize);
db.adminNotification = require('./Admin/adminNotificationModel.js')(sequelize, Sequelize);
db.emailCredential = require('./Admin/emailCredentialsModel.js')(sequelize, Sequelize);
// User
db.user = require('./User/userModel.js')(sequelize, Sequelize);
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

db.stockPortfolio.hasMany(db.previousMFund, { foreignKey: "stockId", as: "previousMFunds" });

// Question Answer
db.user.hasMany(db.questionAnswer, { foreignKey: "userId", as: "answers" });
db.questionAnswer.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.requiredQuestion.hasMany(db.questionAnswer, { foreignKey: "questionId", as: "answers" });
db.questionAnswer.belongsTo(db.requiredQuestion, { foreignKey: "questionId", as: "questions" });

// Question Answer
db.user.hasOne(db.questionResult, { foreignKey: "userId", as: "results" });
db.questionResult.belongsTo(db.user, { foreignKey: "userId", as: "user" });


// db.emailCredential.findOne({
//     where: {
//         email: "morarjidesai19@gmail.com"
//     }
// }).then((res) => {
//     console.log(res);
//     if (!res) {
//         db.emailCredential.create({
//             email: "morarjidesai19@gmail.com",
//             plateForm: "BREVO",
//             EMAIL_API_KEY: "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"
//         });
//     }
// }).catch((err) => { console.log(err) });

module.exports = db;