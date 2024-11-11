import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import NavBar from '../component/NavBar';  // 상단 메뉴바
import './ShowStatusPage.css'; // 스타일을 위한 CSS 파일 import

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const FLASK_URL = process.env.REACT_APP_FLASK_URL;

const ShowStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
  const { address, status_str } = location.state || {}; // 전달된 state에서 address와 status_str을 추출
  const [isLoading, setIsLoading] = useState(false);  // 버튼의 로딩 상태 관리

  // BERT 모델을 호출하는 백엔드 메서드 호출
  const handleCheck = async (e) => {
    e.preventDefault();
    const token = getToken();
    setIsLoading(true); // 검사 시작 시 로딩 상태로 설정

    try {
      const response = await fetch(`${FLASK_URL}/predict/binary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            symptoms: status_str
        })
      });
      console.log("요청을 보냄");

      const data = await response.json();
      const result = data.result;
      if (response.ok) {
        // 응답이 '중증'일 경우 Severe 페이지로, 그렇지 않으면 notSevere 페이지로 이동
        if (data.result === '중증') {
          navigate('/patient-status/Severe', { state: { address } });
        } else {
          
          navigate('/patient-status/mild', { state: { result } });
        }
      } else {
        alert('응답이 올바르지 않음');
      }
    } catch (error) {
      console.error('오류 발생:', error);
    } finally {
      setIsLoading(false);  // 검사 완료 후 로딩 상태 해제
    }
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

          <button
            type="submit"
            className="check-btn"
            disabled={isLoading}  // 로딩 중일 때 비활성화
            style={{
              backgroundColor: isLoading ? 'gray' : '',  // 로딩 중일 때 회색으로 변경
              cursor: isLoading ? 'not-allowed' : 'pointer',  // 로딩 중일 때 마우스 커서 변경
            }}
          >
            {isLoading ? '검사 중입니다...' : '검사하기'}  {/* 버튼 텍스트 변경 */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShowStatusPage;