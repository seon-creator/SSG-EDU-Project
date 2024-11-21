const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const EmailService = require("../utils/email.util");
class AuthController {
  async register(req, res) {
    try {
      const { email, userId, password, firstName, lastName, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
          data: null,
        });
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        userId,
        role,
      });

      // Generate verification token
      const verificationToken = jwt.sign(
        { userId: user._id },
        process.env.EMAIL_VERIFICATION_SECRET,
        { expiresIn: "24h" }
      );

      // Create verification link
      const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${verificationToken}`;

      // Send verification email
      await EmailService.sendEmail(
        user.email,
        "Verify Your Email",
        EmailService.getVerificationEmailTemplate(
          user.firstName,
          verificationLink
        )
      );

      // const accessToken = jwt.sign(
      //   { userId: user._id, role: user.role },
      //   process.env.ACCESS_TOKEN_SECRET,
      //   { expiresIn: "15m" }
      // );

      // const refreshToken = jwt.sign(
      //   { userId: user._id },
      //   process.env.REFRESH_TOKEN_SECRET,
      //   { expiresIn: "7d" }
      // );

      return res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email for verification.",
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          // tokens: {
          //   accessToken,
          //   refreshToken
          // }
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  async login(req, res) {
    try {
      const { userId, password } = req.body;

      const user = await User.findOne({ userId }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
          data: null,
        });
      }

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );
      // res.cookie("accessToken", accessToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // true trong production
      //   sameSite: "strict",
      //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // });
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // true trong production
      //   sameSite: "strict",
      //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // });
      return res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  async refreshToken(req, res) {
    try {
      // const refreshToken = req.cookies.refreshToken;
      // if (!refreshToken) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Refresh token is required",
      //     data: null
      //   });
      // }
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token not found",
          data: null,
        });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true trong production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        data: null,
      });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json({
        success: true,
        message: "Logged out successfully",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

      const user = await User.findByIdAndUpdate(
        decoded.userId,
        { verified: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      return res.json({
        success: true,
        message: "Email verified successfully",
        data: null,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
        data: null,
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.RESET_PASSWORD_SECRET,
        { expiresIn: "1h" }
      );

      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL}/api/v1/auth/reset-password/${resetToken}`;

      // Send reset password email
      await EmailService.sendEmail(
        user.email,
        "Reset Your Password",
        EmailService.getPasswordResetTemplate(user.firstName, resetLink)
      );

      return res.json({
        success: true,
        message: "Password reset instructions sent to email",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      user.password = password;
      await user.save();

      return res.json({
        success: true,
        message: "Password reset successfully",
        data: null,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
        data: null,
      });
    }
  }

  // 아이디 중복 검사 로직
  async checkUserName(req, res) {
    const { userID } = req.body;
    try {
      // MongoDB에서 동일한 id가 있는 유저 조회
      const existingUser = await User.findOne({ userId: userID });
  
      if (existingUser) {
        // 중복된 경우
        return res.status(200).json({ isAvailable: false, message: '중복된 아이디입니다.' });
      }
  
      // 중복되지 않은 경우
      res.status(200).json({ isAvailable: true, message: '사용 가능한 아이디입니다.' });
    } catch (error) {
      console.error('중복 검사 중 오류 발생:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
}

module.exports = new AuthController();
