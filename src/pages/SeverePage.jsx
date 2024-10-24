import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/auth';
import { useLocation } from 'react-router-dom';
import './SeverePage.css';

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SeverePage = () => {
  const location = useLocation();
  const { address } = location.state || {}; // navigate로 받은 state에서 address 추출
  const [emergencyRooms, setEmergencyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 주소를 ' '로 분리하여 도시(stage1), 구(stage2) 추출
  const [stage1, stage2] = address ? address.split(' ').slice(0, 2) : ['', ''];

  useEffect(() => {
    const fetchEmergencyInfo = async () => {
      const token = getToken();
      try {
        // 백엔드 서버로 GET 요청을 보냄
        const response = await fetch(`${BACKEND_URL}/api/getEmergencyInfo?stage1=${stage1}&stage2=${stage2}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'emergency-user-token': token,  // 인증 토큰
          },
        });

        if (!response.ok) {
          throw new Error("데이터 요청에 실패했습니다.");
        }

        const data = await response.json(); // JSON으로 변환
        console.log(data);

        // 응답 데이터가 유효한지 확인 후 상태 업데이트
        if (data && data.response && data.response.body && data.response.body.items) {
          const items = data.response.body.items.item;
          // 응답 데이터가 배열인지 확인 후 상태 업데이트
          if (Array.isArray(items)) {
            setEmergencyRooms(items);
          } else if (items) {
            setEmergencyRooms([items]); // 배열이 아니면 배열로 감싸기
          } else {
            setEmergencyRooms([]); // 데이터가 없을 때 빈 배열
          }
          setError(null);
        } else {
          setEmergencyRooms([]); // 데이터가 없으면 빈 배열 설정
          setError("데이터가 없습니다.");
        }

      } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
        setError("데이터 요청 중 오류가 발생했습니다.");
        setEmergencyRooms([]); // 오류 발생 시 빈 배열
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchEmergencyInfo();
  }, [stage1, stage2]); // stage1, stage2 값이 변경될 때마다 실행

  if (loading) {
    return <p>데이터를 불러오는 중입니다...</p>; // 로딩 상태
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>; // 에러 메시지
  }

  return (
    <div className="severe-diagnosis-page">
      {/* Title */}
      <h1 className="page-title">증상 기반 진단결과: 중증</h1>

      {/* Subtitle */}
      <p className="page-subtitle">인근 응급실을 확인해보세요.</p>

      {/* Emergency Room List */}
      <div className="emergency-room-list">
        {emergencyRooms.length > 0 ? (
          emergencyRooms.map((er, index) => (
            <div className="emergency-room-card" key={index}>
              <h2 className="emergency-room-name">{er.dutyName} ({er.hvgc})</h2>
              <p className="emergency-room-details">입력일시: {er.hvidate}</p>
              <p className="emergency-room-details">응급실: {er.hvec}</p>
              <p className="emergency-room-details">수술실: {er.hvoc}</p>
              <p className="emergency-room-details">구급차 가용 여부: {er.hvamyn}</p>
              <p className="emergency-room-details">응급실 전화: {er.dutyTel3}</p>
            </div>
          ))
        ) : (
          <p>응급실 정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default SeverePage;