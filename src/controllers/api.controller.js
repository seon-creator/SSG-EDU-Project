const axios = require('axios'); // HTTP 통신
require('dotenv').config(); // 환경변수 내용 불러오기
const { failedCitiesWithNeighbors } = require('./data/failedCitiesWithNeighbor'); // 실패 도시/구와 인접 구 데이터

// 응급실 정보 조회 API키
const API_KEY = process.env.EMERGENCY_ROOM_API_KEY;

// 응급실 정보 조회 함수
exports.getEmergencyInfo = async (req, res) => {
  const { stage1, stage2, pageNo = 1, numOfRows = 10 } = req.query;

  // API 호출 함수
  const fetchEmergencyInfo = async (city, district) => {
    const url = `http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEmrrmRltmUsefulSckbdInfoInqire?serviceKey=${API_KEY}&STAGE1=${encodeURIComponent(
      city
    )}&STAGE2=${encodeURIComponent(district)}&pageNo=${pageNo}&numOfRows=${numOfRows}`;

    try {
      const response = await axios.get(url);
      const { header, body } = response.data.response;

      if (header.resultCode === '00' && body && body.items) {
        const items = Array.isArray(body.items.item)
          ? body.items.item
          : [body.items.item]; // 단일 항목일 경우 배열로 변환
        return items;
      }
      return [];
    } catch (error) {
      console.error(`API 요청 실패: ${city} - ${district}`, error.message);
      return [];
    }
  };

  try {
    let items = []; // 최종 응답 데이터를 저장할 변수

    // 실패 목록에 입력된 도시와 구가 있는지 확인
    if (
      failedCitiesWithNeighbors[stage1] &&
      failedCitiesWithNeighbors[stage1][stage2]
    ) {
      const neighbors = failedCitiesWithNeighbors[stage1][stage2];

      // 인접 구 검색
      for (const neighbor of neighbors) {
        const data = await fetchEmergencyInfo(stage1, neighbor);
        items = items.concat(data); // 결과 데이터를 합치기
      }
    } else {
      // 실패 목록에 없으면 입력된 도시/구로 검색
      const data = await fetchEmergencyInfo(stage1, stage2);
      items = items.concat(data);
    }

    // 프론트엔드에서 요구하는 형식으로 응답 데이터 가공
    const responseBody = items.length > 0
      ? {
          response: {
            body: {
              items: {
                item: items,
              },
            },
          },
        }
      : {
          response: {
            body: {
              items: {
                item: [],
              },
            },
          },
        };

    // 결과를 클라이언트로 전송
    res.json(responseBody);
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    res.status(500).json({
      error: '데이터 요청 실패',
      details: error.message,
    });
  }
};