const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { isAuth } = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/refresh-token", authController.refreshToken);
router.delete("/logout", isAuth, authController.logout);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/check-username", authController.checkUserName);
router.post("/sendcode", authController.sendVerificationCode);  // 인증번호 전송
router.post("/verify", authController.verifyCode);  // 인증번호 검증

module.exports = router;
