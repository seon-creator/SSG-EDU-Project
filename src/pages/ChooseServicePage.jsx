// ChooseServicePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import emergencyIcon from '../assets/images/paramedic.png';
import chatbotIcon from '../assets/images/chatservice.png';
import './ChooseServicePage.css'; // 스타일 파일 import

function ChooseServicePage() {
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleEmergencyServiceClick = () => {
        navigate('/login'); // /login 페이지로 이동
    };
    return (
    <div className="choose-service-page">
        <div className="choose-service-container">
        <div className="service-option">
            <div className="service-icon">
            {/* 여기에 일반회원 아이콘을 추가하세요 */}
            <img src={chatbotIcon} alt="일반회원 아이콘" />
            </div>
            <h3>증상진단 서비스</h3>
            <p>
                • 증상 정보 진단<br></br>
                • GPT 연동 챗봇 서비스
            </p>
            <button className="join-button">시작하기</button>
        </div>
        <div className="service-option">
            <div className="service-icon">
            {/* 여기에 기업회원 아이콘을 추가하세요 */}
            <img src={emergencyIcon} alt="응급 아이콘" />
            </div>
            <h3>응급서비스</h3>
            <p>
                • 환자의 중증/경증 상태분류<br></br>
                • 상태 기반 응급실/병원 추천
            </p>
            <button className="join-button" onClick={handleEmergencyServiceClick}>시작하기</button>
        </div>
        </div>
    </div>
  );
}

export default ChooseServicePage;