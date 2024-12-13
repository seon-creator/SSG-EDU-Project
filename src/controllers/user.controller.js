const User = require("../models/user.model");

class UserController {
  // 현재 사용자 정보 가져오기
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .select('-password -reports -createdAt -updatedAt -__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
          data: null
        });
      }

      // 필요한 모든 필드 반환
      const userData = {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName, // 가상 필드
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        bloodGroup: user.bloodGroup,
        healthHistory: user.healthHistory,
        role: user.role,
        verified: user.verified,
        status: user.status
      };

      return res.json({
        success: true,
        message: "사용자 정보가 성공적으로 조회되었습니다.",
        data: userData
      });
    } catch (error) {
      console.error("getCurrentUser에서 오류 발생:", error);
      return res.status(500).json({
        success: false,
        message: "내부 서버 오류",
        error: error.message
      });
    }
  }

  // 현재 사용자 정보 업데이트
  async updateCurrentUser(req, res) {
    try {
      const allowedUpdates = [
        'firstName',
        'lastName',
        'dateOfBirth',
        'gender',
        'height',
        'weight',
        'bloodGroup',
        'healthHistory'
      ];

      // 업데이트할 필드 필터링
      const updates = {};
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // 업데이트 전 데이터 검증
      if (updates.height && updates.height < 0) {
        return res.status(400).json({
          success: false,
          message: "키는 0보다 커야 합니다."
        });
      }

      if (updates.weight && updates.weight < 0) {
        return res.status(400).json({
          success: false,
          message: "몸무게는 0보다 커야 합니다."
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        updates,
        {
          new: true,
          runValidators: true,
          select: '-password -reports -createdAt -updatedAt -__v'
        }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
          data: null
        });
      }

      return res.json({
        success: true,
        message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        data: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          bloodGroup: user.bloodGroup,
          healthHistory: user.healthHistory,
          role: user.role,
          verified: user.verified,
          status: user.status
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "내부 서버 오류",
        error: error.message
      });
    }
  }

  // 비밀번호 변경
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // 입력값 검증
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "현재 비밀번호와 새 비밀번호가 필요합니다.",
          data: null
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "새 비밀번호는 최소 8자 이상이어야 합니다.",
          data: null
        });
      }

      const user = await User.findById(req.user.userId).select("+password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
          data: null
        });
      }

      // 현재 비밀번호 검증
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
          success: false,
          message: "현재 비밀번호가 올바르지 않습니다.",
          data: null
        });
      }

      // 비밀번호 업데이트
      user.password = newPassword;
      await user.save();

      return res.json({
        success: true,
        message: "비밀번호가 성공적으로 변경되었습니다.",
        data: null
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "내부 서버 오류",
        error: error.message
      });
    }
  }
  // 이메일과 이름으로 userId 반환
  async getUserId(req, res) {
    try {
      const { email, firstName, lastName } = req.body;

      // 입력값 검증
      if (!email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: "이메일, 이름, 성을 모두 입력해야 합니다.",
        });
      }

      // 데이터베이스에서 사용자 검색
      const user = await User.findOne({ email, firstName, lastName }).select('userId');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        });
      }

      return res.json({
        success: true,
        message: "사용자 ID를 성공적으로 조회했습니다.",
        data: { userId: user.userId },
      });
    } catch (error) {
      console.error("getUserId에서 오류 발생:", error);
      return res.status(500).json({
        success: false,
        message: "내부 서버 오류",
        error: error.message,
      });
    }
  }

  // 비밀번호 재설정
  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      // 입력값 검증
      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "이메일과 새 비밀번호가 필요합니다.",
        });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "새 비밀번호는 최소 8자 이상이어야 합니다.",
        });
      }
      // 사용자 찾기
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        });
      }
      // 비밀번호 업데이트
      user.password = newPassword;
      await user.save();
      console.log("Updated Password (hashed):", user.password);

      return res.status(200).json({
        success: true,
        message: "비밀번호가 성공적으로 재설정되었습니다.",
      });
    } catch (error) {
      console.error("resetPassword에서 오류 발생:", error);
      return res.status(500).json({
        success: false,
        message: "내부 서버 오류",
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();