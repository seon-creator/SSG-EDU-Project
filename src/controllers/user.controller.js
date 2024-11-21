// const mongoose = require("mongoose");
const User = require("../models/user.model");
class UserController {
  async getCurrentUser(req, res) {
    try {
      // console.log("User from request:", req.user);
      const user = await User.findById(req.user.userId)
        .select('-password');

      // console.log("Found user:", user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null
        });
      }
      const userData = {
        role: user.role,

        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verified: user.verified,

      };
      return res.json({
        success: true,
        message: "User retrieved successfully",
        data: userData
      });
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  async updateCurrentUser(req, res) {
    try {
      const { firstName, lastName, dateOfBirth, description } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        {
          firstName,
          lastName,
          dateOfBirth,
          description
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: "User updated successfully",
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.userId).select("+password");
      if (!user || !(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
          data: null
        });
      }

      user.password = newPassword;
      await user.save();

      return res.json({
        success: true,
        message: "Password changed successfully",
        data: null
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }
}

module.exports = new UserController();
