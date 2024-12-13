import React, { useState } from 'react';
import { getToken } from '../../utils/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import './ShowStatusPage.css'; // 스타일을 위한 CSS 파일 import
import { flaskApi } from '../../utils/api';
// 환경 변수에서 백엔드 URL 가져오기
const FLASK_URL = process.env.REACT_APP_FLASK_URL;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

const ShowStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
  const { address, symptoms } = location.state || {}; // 전달된 state에서 address와 symptoms을 추출
  const [isLoading, setIsLoading] = useState(false);  // 버튼의 로딩 상태 관리
  const token = getToken();

  // BERT 모델을 호출하는 백엔드 메서드 호출
  const handleCheck = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 검사 시작 시 로딩 상태로 설정

    try {

      const response = await flaskApi.post('/predict/binary', {
        symptoms: symptoms
      });
      // const response = await fetch(`${FLASK_URL}/predict/binary`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`, // Bearer 토큰 형식으로 전달
      //   },
      //   body: JSON.stringify({
      //     symptoms: symptoms
      //   })
      // });
      console.log("요청을 보냄");
      const data = response


      if (response.status === 200) {
        // 응답이 '중증'일 경우 Severe 페이지로, 그렇지 않으면 notSevere 페이지로 이동
        // console.log(data.data.result);
        if (data.data.result === '중증') {
          // isSevere 값을 true로 설정하는 요청
          await fetch(`${BACKEND_URL}/api/v1/report/update-severe`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Bearer 토큰 형식으로 전달
            },
            body: JSON.stringify({
              address, // 환자의 주소
              symptoms, // 환자의 증상
            }),
          });
          navigate('/patient-status/Severe', { state: { symptoms, address } });
        } else {
          navigate('/patient-status/mild', { state: { symptoms, address } });
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
      <div className="status-container">
        <form className="status-form" onSubmit={handleCheck}>
          <h1>증상 진단 검사하기</h1>
          <h3>* 10,000개 이상의 중증/경증 분류 데이터를 기반으로 학습된 인공지능을 사용해 검사합니다.</h3>
          <div className="status-info-wrapper"> {/* 주소와 환자 증상을 묶는 컨테이너 */}
            <div className="input-group">
              <label><strong>1. 주소</strong></label>
              <p>{address}</p>
            </div>
            <div className="input-group">
              <label><strong>2. 증상</strong></label>
              <p>{symptoms}</p>
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