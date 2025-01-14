const dbConfig = require("../Config/db.config.js");

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);

const db = {};

const queryInterface = sequelize.getQueryInterface();

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Admin
db.admin = require("./Admin/adminModel.js")(sequelize, Sequelize);
db.requiredQuestion = require("./Admin/requireQuestionController.js")(
  sequelize,
  Sequelize
);
db.analysisReport = require("./Admin/analysisReportModel.js")(
  sequelize,
  Sequelize
);
db.service = require("./Admin/myServiceModel.js")(sequelize, Sequelize);
db.adminNotification = require("./Admin/adminNotificationModel.js")(
  sequelize,
  Sequelize
);
db.emailCredential = require("./Admin/emailCredentialsModel.js")(
  sequelize,
  Sequelize
);
// User
db.user = require("./User/userModel.js")(sequelize, Sequelize);
db.commentOnService = require("./User/userCommentOnService.js")(
  sequelize,
  Sequelize
);
db.profileImage = require("./User/userProfileImageModel.js")(
  sequelize,
  Sequelize
);
db.questionAnswer = require("./User/requiredQuestionAnswerModel.js")(
  sequelize,
  Sequelize
);
db.questionResult = require("./User/requiredQuestionResultsModel.js")(
  sequelize,
  Sequelize
);
db.emailOTP = require("./User/emailOTPModel.js")(sequelize, Sequelize);
db.mFund = require("./User/mFundModel.js")(sequelize, Sequelize);
db.user_service = require("./User/user_ServiceModel.js")(sequelize, Sequelize);
db.stockPortfolio = require("./User/stockPortfolioModel.js")(
  sequelize,
  Sequelize
);
db.previousStockPortfolio =
  require("./User/PreviousRecord/previousStockPortfolioModel.js")(
    sequelize,
    Sequelize
  );
db.previousMFund = require("./User/PreviousRecord/previousMFundModel.js")(
  sequelize,
  Sequelize
);
// Blog
db.blogTags = require("./Blog/blogTagsModel.js")(sequelize, Sequelize);
db.blogCategory = require("./Blog/blogCategoryModel.js")(sequelize, Sequelize);
db.blogImages = require("./Blog/blogImgesModel.js")(sequelize, Sequelize);
db.blog = require("./Blog/blogModel.js")(sequelize, Sequelize);
db.blogTagAssociation = require("./Blog/blogTagAssociation.js")(
  sequelize,
  Sequelize
);
db.blogCategoryAssociation = require("./Blog/blogCategoryAssociation.js")(
  sequelize,
  Sequelize
);

// User Association
db.user.hasMany(db.mFund, { foreignKey: "userId", as: "mFunds" });
db.mFund.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasMany(db.stockPortfolio, {
  foreignKey: "userId",
  as: "stockPortfolios",
});
db.stockPortfolio.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasMany(db.previousStockPortfolio, {
  foreignKey: "userId",
  as: "previousStockPortfolios",
});

db.stockPortfolio.hasMany(db.previousStockPortfolio, {
  foreignKey: "stockId",
  as: "previousStockPortfolios",
});

db.user.hasMany(db.previousMFund, {
  foreignKey: "userId",
  as: "previousMFunds",
});

db.mFund.hasMany(db.previousMFund, {
  foreignKey: "mFundId",
  as: "previousMFunds",
});

// Question Answer
db.user.hasMany(db.questionAnswer, { foreignKey: "userId", as: "answers" });
db.questionAnswer.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.requiredQuestion.hasMany(db.questionAnswer, {
  foreignKey: "questionId",
  as: "answers",
});
db.questionAnswer.belongsTo(db.requiredQuestion, {
  foreignKey: "questionId",
  as: "questions",
});

// Question Answer
db.user.hasOne(db.questionResult, { foreignKey: "userId", as: "results" });
db.questionResult.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasOne(db.profileImage, { foreignKey: "userId", as: "profileImage" });
db.profileImage.belongsTo(db.user, { foreignKey: "userId", as: "user" });

// Blog
db.blog.hasMany(db.blogImages, {
  foreignKey: "blogId",
  as: "images",
});
db.blogImages.belongsTo(db.blog, {
  foreignKey: "blogId",
  as: "blog",
});

db.blog.hasMany(db.blogCategoryAssociation, {
  foreignKey: "blogId",
  as: "blogCategory_juction",
});
db.blogCategoryAssociation.belongsTo(db.blog, {
  foreignKey: "blogId",
  as: "blogs",
});

db.blogCategory.hasMany(db.blogCategoryAssociation, {
  foreignKey: "blogCategoryId",
  as: "blogCategory_juction",
});
db.blogCategoryAssociation.belongsTo(db.blogCategory, {
  foreignKey: "blogCategoryId",
  as: "categories",
});

db.blog.hasMany(db.blogTagAssociation, {
  foreignKey: "blogId",
  as: "blogTag_juction",
});
db.blogTagAssociation.belongsTo(db.blog, {
  foreignKey: "blogId",
  as: "blogs",
});

db.blogTags.hasMany(db.blogTagAssociation, {
  foreignKey: "blogTagId",
  as: "blogTag_juction",
});
db.blogTagAssociation.belongsTo(db.blogTags, {
  foreignKey: "blogTagId",
  as: "tags",
});

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
//     serviceCode: "AAA"
// }, {
//     serviceName: "Mutual Fund Portfolio Analysis Tool",
//     price: "100",
//     serviceCode: "BBB"
// }, {
//     serviceName: "Stocks Portfolio Analysis",
//     price: "100",
//     serviceCode: "CCC"
// }, {
//     serviceName: "Technical Analysis Tool For Stocks",
//     price: "100",
//     serviceCode: "DDD"
// }, {
//     serviceName: "Portfolio Management Service",
//     price: "100",
//     serviceCode: "EEE"
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
//                 price: serviceArray[i].price,
//                 serviceCode: serviceArray[i].serviceCode
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
//     questionTitle: "Time Horizon",
//     question: "What is your time horizon for this investment?",
//     options: {
//         a: "Short-term(Less than 1 year)",
//         b: "Medium-term(1 year- 3 years)",
//         c: "Long-term(More than 3 years)"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Loss Tolerance",
//     question: "What can you handle as a temporary drop in your portfolio?",
//     options: {
//         a: "I can not take any portfolio drop",
//         b: "10-20%",
//         c: "20% or More"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: "Investment Knowledge",
//     question: "What is your investment experience?",
//     options: {
//         a: "Have no experience investing",
//         b: "I have some experience investing",
//         c: "I am a professional investor"
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
//         a: "I have limited assets and income",
//         b: "I have moderate assets and income",
//         c: "I have significant assets and income"
//     },
//     points: {
//         a: 1,
//         b: 2,
//         c: 3
//     }
// }, {
//     questionTitle: " Market Conditions Reaction",
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

module.exports = db;
