const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const EmailService = require("../utils/email.util");

class AuthController {
  async register(req, res) {
    try {
      const { email, userId, password, firstName, lastName, role } = req.body;

      // 이미 이메일로 가입한 유저가 있는 경우
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "이미 존재하는 이메일입니다.",
          data: null,
        });
      }
      // 유저 DB 생성
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        userId,
        role,
      });
      // 인증 토큰 발급 유효시간 5분
      const verificationToken = jwt.sign(
        { userId: user._id },
        process.env.EMAIL_VERIFICATION_SECRET,
        { expiresIn: "5m" }
      );
      // 인증링크
      const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${verificationToken}`;
      // 이메일로 인증링크 전송
      await EmailService.sendEmail(
        user.email,
        "이메일 인증",
        EmailService.getVerificationEmailTemplate(
          user.firstName,
          verificationLink
        )
      );
      // 프론트엔드로 성공 응답 반환
      return res.status(201).json({
        success: true,
        message: "사용자가 성공적으로 등록되었습니다. 이메일을 확인해 주세요.",
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
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

  async login(req, res) {
    try {
      const { userId, password } = req.body;

      const user = await User.findOne({ userId }).select("+password");

      console.log('User:', user);
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "잘못된 자격 증명",
          data: null,
        });
      }

      if (!user.verified) {
        return res.status(403).json({
          success: false,
          message: "이메일이 인증되지 않았습니다.",
          data: null,
        });
      }
      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        message: "로그인 성공",
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
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "리프레시 토큰을 찾을 수 없습니다.",
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
          message: "사용자를 찾을 수 없습니다.",
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "토큰이 성공적으로 갱신되었습니다.",
        data: {
          accessToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 리프레시 토큰",
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
        message: "성공적으로 로그아웃되었습니다.",
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
          message: "사용자를 찾을 수 없습니다.",
          data: null,
        });
      }

      return res.json({
        success: true,
        message: "이메일이 성공적으로 인증되었습니다.",
        data: null,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 인증 토큰",
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
          message: "사용자를 찾을 수 없습니다.",
          data: null,
        });
      }

      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.RESET_PASSWORD_SECRET,
        { expiresIn: "1h" }
      );

      const resetLink = `${process.env.FRONTEND_URL}/api/v1/auth/reset-password/${resetToken}`;

      await EmailService.sendEmail(
        user.email,
        "비밀번호 재설정",
        EmailService.getPasswordResetTemplate(user.firstName, resetLink)
      );

      return res.json({
        success: true,
        message: "비밀번호 재설정 지침이 이메일로 전송되었습니다.",
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
          message: "사용자를 찾을 수 없습니다.",
          data: null,
        });
      }

      user.password = password;
      await user.save();

      return res.json({
        success: true,
        message: "비밀번호가 성공적으로 재설정되었습니다.",
        data: null,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 재설정 토큰",
        data: null,
      });
    }
  }

  async checkUserName(req, res) {
    try {
      const { userId } = req.body;

      const existingUser = await User.findOne({
        userId: { $regex: new RegExp(`^${userId}$`, 'i') }
      });

      console.log('Found user:', existingUser);
      if (existingUser) {
        return res.status(200).json({
          isAvailable: false,
          message: '중복된 아이디입니다.'
        });
      }

      res.status(200).json({
        isAvailable: true,
        message: '사용 가능한 아이디입니다.'
      });
    } catch (error) {
      console.error('중복 검사 중 오류 발생:', error);
      res.status(500).json({
        message: '서버 오류가 발생했습니다.'
      });
    }
  }

  constructor() {
    // 인증번호 저장소 초기화
    this.verificationCodes = new Map();
  }
  // 인증번호 전송
  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "이메일이 필요합니다.",
        });
      }

      // 인증번호 생성
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // JWT 토큰 생성 (인증번호 포함)
      const token = jwt.sign(
        { email, code },
        process.env.EMAIL_VERIFICATION_SECRET,
        { expiresIn: "5m" } // 5분 만료
      );

      // 이메일 전송
      await EmailService.sendEmail(
        email,
        "이메일 인증 코드",
        EmailService.getCodeTemplate(code),
      );

      return res.status(200).json({
        success: true,
        message: "인증번호가 이메일로 전송되었습니다.",
        data: { token }, // JWT 토큰 반환
      });
    } catch (error) {
      console.error("sendVerificationCode에서 오류 발생:", error);
      return res.status(500).json({
        success: false,
        message: "인증번호 전송 중 오류가 발생했습니다.",
        error: error.message,
      });
    }
  }

  // 인증번호 검증
  async verifyCode(req, res) {
    try {
      const { token, code } = req.body;

      // 토큰과 인증번호가 없을 경우
      if (!token || !code) {
        return res.status(400).json({
          success: false,
          message: "토큰과 인증번호가 필요합니다.",
        });
      }

      // 토큰 검증
      const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

      // 인증번호 비교
      if (decoded.code !== code) {
        return res.status(400).json({
          success: false,
          message: "인증번호가 일치하지 않습니다.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "인증번호가 성공적으로 검증되었습니다.",
      });
    } catch (error) {
      // JWT 만료 또는 검증 실패
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "인증번호가 만료되었습니다.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "유효하지 않은 인증번호입니다.",
        error: error.message,
      });
    }
  }  

}

module.exports = new AuthController();