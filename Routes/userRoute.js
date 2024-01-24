const express = require("express");
const router = express.Router();

const { registerByEmailOTP, verifyOTP, signInByEmailOTP, updateUser, getUser } = require('../Controllers/User/AuthUser/byEmailOTP');
const { getAllRequiredQuestion, getRequiredQuestion, attempQuestion, getMyResult } = require('../Controllers/Admin/requiredQuestionController');
const { getAllService, getService } = require('../Controllers/Admin/myServiceController');
const { getMyMFund, addMFund, softDeleteMFund, updateMFund } = require('../Controllers/User/mFundController');
const { createPayment, verifyPayment } = require('../Controllers/User/user_serviceController');
const { addStockPortfolio, getMyStockPortfolio, updateStockPortfolio, softDeleteStockPortfolio } = require('../Controllers/User/stockPortfolioController');

//middleware
const { verifyUserToken } = require('../Middlewares/verifyJWT');
const { isUserPresent, isUserAttemptedAllQuestion } = require('../Middlewares/isPresent');

router.post("/register", registerByEmailOTP);
router.post("/login", verifyOTP);
router.post("/changePassword", signInByEmailOTP);
router.get("/user", verifyUserToken, getUser);
router.put("/updateUser", verifyUserToken, updateUser);

// RequiredQuestion
router.get("requiredQuestions", verifyUserToken, isUserPresent, getAllRequiredQuestion);
router.get("requiredQuestions/:id", verifyUserToken, isUserPresent, getRequiredQuestion);
router.post("attempQuestion", verifyUserToken, isUserPresent, attempQuestion);
router.get("myResult", verifyUserToken, isUserPresent, getMyResult);

// Stock PortFolio
router.post("/addStock", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, addStockPortfolio);
router.get("/myStock", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, getMyStockPortfolio);
router.put("/updateStock/:id", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, updateStockPortfolio);
router.delete("/deleteStock/:id", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, softDeleteStockPortfolio);

// Mutual Fund
router.post("/addMFund", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, addMFund);
router.get("/myMFund", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, getMyMFund);
router.put("/updateMFund/:id", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, updateMFund);
router.delete("/deleteMFund/:id", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, softDeleteMFund);

// Service
router.get("services", verifyUserToken, isUserPresent, getAllService);
router.get("services/:id", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, getService);

// Purchase
router.post("/createPayment/:id", verifyUserToken, isUserPresent, isUserAttemptedAllQuestion, createPayment);
router.post("/verifyPayment", verifyPayment);

module.exports = router;