const express = require("express");
const router = express.Router();

const {
  registerByEmailOTP,
  verifyOTP,
  signInByEmailOTP,
  updateUser,
  getUser,
} = require("../../Controllers/User/AuthUser/byEmailOTP");
const {
  addUpdateProfileImage,
} = require("../../Controllers/User/AuthUser/userProfileImage");
const {
  getAllRequiredQuestion,
  getRequiredQuestion,
  attemptQuestion,
  getMyResult,
} = require("../../Controllers/Admin/requiredQuestionController");
const {
  getAllService,
  getService,
} = require("../../Controllers/Admin/myServiceController");
const {
  getMyMFund,
  addMFund,
  softDeleteMFund,
  updateMFund,
} = require("../../Controllers/User/mFundController");
const {
  createPayment,
  verifyPayment,
} = require("../../Controllers/User/user_serviceController");
const {
  addStockPortfolio,
  getMyStockPortfolio,
  updateStockPortfolio,
  softDeleteStockPortfolio,
} = require("../../Controllers/User/stockPortfolioController");
const {
  getReportForUser,
} = require("../../Controllers/Admin/analysisReportController");
const {
  addCommentOnService,
} = require("../../Controllers/Admin/analysisReportController");

const blog = require("./publicRoute");

//middleware
const uploadImage = require("../../Middlewares/uploadImages");
const { verifyUserToken } = require("../../Middlewares/verifyJWT");
const {
  isUserPresent,
  isUserAttemptedAllQuestion,
} = require("../../Middlewares/isPresent");

router.post("/register", registerByEmailOTP);
router.post("/verifyOTP", verifyOTP);
router.post("/login", signInByEmailOTP);
router.get("/user", verifyUserToken, getUser);
router.put("/updateUser", verifyUserToken, updateUser);

// Profile Image
router.post(
  "/profileImage",
  verifyUserToken,
  uploadImage.single("profileImage"),
  addUpdateProfileImage
);
// RequiredQuestion
router.get(
  "/questions",
  verifyUserToken,
  isUserPresent,
  getAllRequiredQuestion
);
router.get(
  "/questions/:id",
  verifyUserToken,
  isUserPresent,
  getRequiredQuestion
);
router.post(
  "/attemptQuestion",
  verifyUserToken,
  isUserPresent,
  attemptQuestion
);
router.get("/myResult", verifyUserToken, isUserPresent, getMyResult);

// Stock PortFolio
router.post(
  "/addStock",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  addStockPortfolio
);
router.get(
  "/myStock",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  getMyStockPortfolio
);
router.put(
  "/updateStock/:id",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  updateStockPortfolio
);
router.delete(
  "/deleteStock/:id",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  softDeleteStockPortfolio
);

// Mutual Fund
router.post(
  "/addMFund",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  addMFund
);
router.get(
  "/myMFund",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  getMyMFund
);
router.put(
  "/updateMFund/:id",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  updateMFund
);
router.delete(
  "/deleteMFund/:id",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  softDeleteMFund
);

// Service
router.get("/services", verifyUserToken, isUserPresent, getAllService);
router.get(
  "/services/:id",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  getService
);

// Purchase
router.post(
  "/createPayment/:id",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  createPayment
);
router.post("/verifyPayment", verifyPayment);

// Analysis Report
router.get(
  "/reports",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  getReportForUser
);

// Comment On Service
router.post(
  "/commentOnService",
  verifyUserToken,
  isUserPresent,
  isUserAttemptedAllQuestion,
  addCommentOnService
);

router.use("/blog", blog);
module.exports = router;
