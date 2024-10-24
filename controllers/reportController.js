// 신고정보 저장, 불러오기
const Report = require('../schema/Report'); // Report 스키마 불러오기
const User = require('../schema/User'); // User 스키마 불러오기

// 환자 정보 등록 메서드
exports.createReport = async (req, res) => {
  const { patientLocation, symptom } = req.body;
  const userId = req.user.id; // JWT에서 가져온 사용자 ID

  try {
    // 유저가 존재하는지 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '유저 정보가 등록되어있지 않습니다.' });
    }

    // 새로운 Report 생성
    const newReport = new Report({
      user: user._id, // User ObjectID 참조
      patientLocation,
      symptom,
    });

    // Report 저장
    await newReport.save();

    // 유저의 reports 배열에 새로운 Report의 _id 추가
    user.reports.push(newReport._id);

    // 유저 정보 저장 (reports 업데이트 후)
    await user.save();

    res.status(201).json({ message: 'Report가 성공적으로 생성되었습니다.' });
  } catch (error) {
    console.error('Report 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};