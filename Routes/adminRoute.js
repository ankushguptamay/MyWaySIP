const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin, changePassword, updateAdminName, getAdmin } = require('../Controllers/Admin/adminController');
const { totalNewUser, totalNonPaidUser, totalPaidUser, totalUser } = require('../Controllers/Admin/dashboardController');
const { getAllRequiredQuestion, getRequiredQuestion, createRequiredQuestion, getUserResult } = require('../Controllers/Admin/requiredQuestionController');
const { getAllService, getService, updateService, createService } = require('../Controllers/Admin/myServiceController');
const { getStockPortfolioForAdmin } = require('../Controllers/User/stockPortfolioController');
const { allUserForAdmin, userForAdmin } = require('../Controllers/User/AuthUser/byEmailOTP');
const { getMFundForAdmin } = require('../Controllers/User/mFundController');
const { getPaymentForAdmin } = require('../Controllers/User/user_serviceController');
const { getAllNotification, changeSeenStatus, getNotification } = require('../Controllers/Admin/notificationController');
const { submitReport, getReportForAdmin, deleteReport, getcommentOnServiceForAdmin } = require('../Controllers/Admin/analysisReportController');

//middleware
const { verifyAdminToken } = require('../Middlewares/verifyJWT');
const uploadImageAndPDF = require("../Middlewares/uploadImageAndPDF");
const { isAdminPresent } = require('../Middlewares/isPresent');

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/changePassword", changePassword);
router.put("/updateAdmin", verifyAdminToken, isAdminPresent, updateAdminName);
router.get("/admin", verifyAdminToken, isAdminPresent, getAdmin);

// Service
router.get("/services", verifyAdminToken, isAdminPresent, getAllService);
router.get("/services/:id", verifyAdminToken, isAdminPresent, getService);
router.put("/updateService/:id", verifyAdminToken, isAdminPresent, updateService);
// router.post("/createService", verifyAdminToken, isAdminPresent, createService);

// RequiredQuestion
router.get("/requiredQuestions", verifyAdminToken, isAdminPresent, getAllRequiredQuestion);
router.get("/requiredQuestions/:id", verifyAdminToken, isAdminPresent, getRequiredQuestion);
// router.post("/createRequiredQuestion/:id", verifyAdminToken, isAdminPresent, createRequiredQuestion);
router.get("/userResult/:id", verifyAdminToken, isAdminPresent, getUserResult);

// User
router.get("/users", verifyAdminToken, isAdminPresent, allUserForAdmin);
router.get("/users/:id", verifyAdminToken, isAdminPresent, userForAdmin);

// Stock PortFolio
router.get("/stockPortfolio/:id", verifyAdminToken, isAdminPresent, getStockPortfolioForAdmin); // id= user id

// Mutual Fund
router.get("/mFunds/:id", verifyAdminToken, isAdminPresent, getMFundForAdmin); // id= user id

// Notification
router.get("/notifications", verifyAdminToken, isAdminPresent, getAllNotification);
router.get("/notifications/:id", verifyAdminToken, isAdminPresent, getNotification);
router.put("/changeSeenStatus/:id", verifyAdminToken, isAdminPresent, changeSeenStatus);

// Dashboard
router.get("/totalNewUser", verifyAdminToken, isAdminPresent, totalNewUser);
router.get("/totalNonPaidUser", verifyAdminToken, isAdminPresent, totalNonPaidUser);
router.get("/totalPaidUser", verifyAdminToken, isAdminPresent, totalPaidUser);
router.get("/totalUser", verifyAdminToken, isAdminPresent, totalUser);

// Payment
router.get("/payments", verifyAdminToken, isAdminPresent, getPaymentForAdmin);

// Analysis report
router.get("/report/:id", verifyAdminToken, isAdminPresent, getReportForAdmin);
router.post("/submitReport", verifyAdminToken, isAdminPresent, uploadImageAndPDF.single("report"), submitReport);
router.delete("/deleteReport/:id", verifyAdminToken, isAdminPresent, deleteReport);
router.get("/commentOnService", verifyAdminToken, isAdminPresent, getcommentOnServiceForAdmin);

module.exports = router;