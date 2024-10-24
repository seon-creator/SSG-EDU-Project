import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import NavBar from '../component/NavBar';  // 상단 메뉴바
import './ShowStatusPage.css'; // 스타일을 위한 CSS 파일 import

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ShowStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
  const { address, status_str } = location.state || {}; // 전달된 state에서 address와 status_str을 추출

  // BERT 모델을 호출하는 백엔드 메서드 호출
  const handleCheck = async (e) => {
    e.preventDefault();
    const token = getToken();

    try {
      const response = await fetch(`${BACKEND_URL}/api/predict-severe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'emergency-user-token': token,  // 인증 토큰
        },
        body: JSON.stringify({ text: status_str }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        alert('모델 추론이 정상동작합니다');
      } else {
        alert('응답이 올바르지 않음');
      }
    } catch (error) {
      console.error('오류 발생:', error);
      alert('Report 생성 중 오류가 발생했습니다.');
    }
  };

  // '중증' 버튼 클릭 시 /patient-status/Severe 페이지로 navigate
  const handleSevereNavigate = () => {
    navigate('/patient-status/Severe', { state: { address } }); // address 정보를 state로 전달하며 이동
  };

  return (
    <div>
    <NavBar />
    <div className="status-container">
      <form className="status-form" onSubmit={handleCheck}>
        <h1>응급환자 중증/경증 분류</h1>
        <div className="status-info-wrapper"> {/* 주소와 환자 증상을 묶는 컨테이너 */}
          <div className="input-group">
            <label><strong>주소:</strong></label>
            <p>{address}</p>
          </div>
          <div className="input-group">
            <label><strong>환자 증상:</strong></label>
            <p>{status_str}</p>
          </div>
        </div>

        <button type="submit" className="check-btn">검사하기</button> {/* 이 버튼을 누르면 중증/경증 분류 시작 */}

        {/* 중증 버튼 추가 */}
        <button
          type="button"
          className="severe-btn"
          onClick={handleSevereNavigate}
        >
          중증
        </button>
      </form>
    </div>
    </div>
  );
};

export default ShowStatusPage;