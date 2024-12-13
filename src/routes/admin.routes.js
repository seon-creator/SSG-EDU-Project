const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");

router.get("/users", isAuth, isAdmin, adminController.getAllUsers);
router.get("/users/:id", isAuth, isAdmin, adminController.getUser);
router.post("/users", isAuth, isAdmin, adminController.createUser);
router.put("/users/:id", isAuth, isAdmin, adminController.updateUser);
router.delete("/users/:id", isAuth, isAdmin, adminController.deleteUser);
router.get("/basic-stats", isAuth, isAdmin, adminController.getBasicStats);
module.exports = router;