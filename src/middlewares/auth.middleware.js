const jwt = require("jsonwebtoken");

class AuthMiddleware {
  async isAuth(req, res, next) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
        });
      }
      // const token = req.cookies.accessToken;
      // if (!token) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Authentication required",
      //     data: null,
      //   });
      // }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded; // { userId, role }
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        data: null,
      });
    }
  }

  hasRole(roles = []) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
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
        message: "Admin access required",
        data: null,
      });
    }
    next();
  }

  isDoctor(req, res, next) {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Doctor access required",
        data: null,
      });
    }
    next();
  }
}

const authMiddleware = new AuthMiddleware();
module.exports = authMiddleware;