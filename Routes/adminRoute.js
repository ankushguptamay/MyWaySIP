const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin, changePassword, updateAdminName, getAdmin } = require('../Controllers/Admin/adminController');
const { getAllRequiredQuestion, getRequiredQuestion, createRequiredQuestion, getUserResult } = require('../Controllers/Admin/requiredQuestionController');
const { getAllService, getService, updateService, createService } = require('../Controllers/Admin/myServiceController');
const { getStockPortfolioForAdmin } = require('../Controllers/User/stockPortfolioController');
const { allUserForAdmin, userForAdmin } = require('../Controllers/User/AuthUser/byEmailOTP');
const { getMFundForAdmin } = require('../Controllers/User/mFundController');
const { getAllNotification, changeSeenStatus, getNotification } = require('../Controllers/Admin/notificationController');

//middleware
const { verifyAdminToken } = require('../Middlewares/verifyJWT');
const { isAdminPresent } = require('../Middlewares/isPresent');

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/changePassword", changePassword);
router.put("/updateAdmin", verifyAdminToken, isAdminPresent, updateAdminName);
router.get("/admin", verifyAdminToken, isAdminPresent, getAdmin);

// Service
router.get("services", verifyAdminToken, isAdminPresent, getAllService);
router.get("services/:id", verifyAdminToken, isAdminPresent, getService);
router.put("updateService/:id", verifyAdminToken, isAdminPresent, updateService);
router.post("createService", verifyAdminToken, isAdminPresent, createService);

// RequiredQuestion
router.get("requiredQuestions", verifyAdminToken, isAdminPresent, getAllRequiredQuestion);
router.get("requiredQuestions/:id", verifyAdminToken, isAdminPresent, getRequiredQuestion);
router.post("createRequiredQuestion/:id", verifyAdminToken, isAdminPresent, createRequiredQuestion);
router.get("userResult/:id", verifyAdminToken, isAdminPresent, getUserResult);

// User
router.get("users", verifyAdminToken, isAdminPresent, allUserForAdmin);
router.get("users/:id", verifyAdminToken, isAdminPresent, userForAdmin);

// Stock PortFolio
router.get("/stockPortfolio/:id", verifyAdminToken, isAdminPresent, getStockPortfolioForAdmin); // id= user id

// Mutual Fund
router.get("/mFunds/:id", verifyAdminToken, isAdminPresent, getMFundForAdmin); // id= user id

// Notification
router.get("notifications", verifyAdminToken, isAdminPresent, getAllNotification);
router.get("notifications/:id", verifyAdminToken, isAdminPresent, getNotification);
router.put("changeSeenStatus/:id", verifyAdminToken, isAdminPresent, changeSeenStatus);

module.exports = router;