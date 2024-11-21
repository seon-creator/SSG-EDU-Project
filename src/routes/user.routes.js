const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { isAuth } = require("../middlewares/auth.middleware");

router.get("/me", isAuth, userController.getCurrentUser);
router.put("/me", isAuth, userController.updateCurrentUser);
router.patch("/change-password", isAuth, userController.changePassword);

module.exports = router;