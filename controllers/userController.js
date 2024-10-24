const User = require('../schema/User');

// 유저 정보 가져오기
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // 비밀번호 제외
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '유저 정보를 불러오지 못했습니다', error });
  }
};

// 유저 정보 업데이트
exports.updateUserInfo = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ message: '유저 정보 업데이트 성공', user });
  } catch (error) {
    res.status(500).json({ message: '유저 정보 업데이트 실패', error });
  }
};