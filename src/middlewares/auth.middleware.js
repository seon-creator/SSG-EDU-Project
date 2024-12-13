const jwt = require("jsonwebtoken");

class AuthMiddleware {
  async isAuth(req, res, next) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
          data: null,
        });
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded; // { userId, role }
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 토큰",
        data: null,
      });
    }
  }

  hasRole(roles = []) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "권한이 부족합니다.",
          data: null,
        });
      }
      next();
    };
  }

  isAdmin(req, res, next) {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자 권한이 필요합니다.",
        data: null,
      });
    }
    next();
  }

  isDoctor(req, res, next) {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "의사 권한이 필요합니다.",
        data: null,
      });
    }
    next();
  }
}

const authMiddleware = new AuthMiddleware();
module.exports = authMiddleware;