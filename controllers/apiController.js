const axios = require('axios'); // http 통신
require('dotenv').config(); // 환경변수 내용 불러오기

const API_KEY = process.env.EMERGENCY_ROOM_API_KEY;

// 응급실 정보 조회 함수
exports.getEmergencyInfo = async (req, res) => {
  const { stage1, stage2, pageNo = 1, numOfRows = 10 } = req.query;

  try {
    const url = `http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEmrrmRltmUsefulSckbdInfoInqire?serviceKey=${API_KEY}&STAGE1=${stage1}&STAGE2=${stage2}&pageNo=${pageNo}&numOfRows=${numOfRows}`;
    const response = await axios.get(url);
    res.json(response.data); // JSON 데이터를 클라이언트로 전송
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    res.status(500).send('API 요청 실패');
  }
};