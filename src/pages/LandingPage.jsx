import React from 'react';
import { useNavigate } from 'react-router-dom';  // 페이지 이동 모듈
import headerrightimg from '../assets/images/background.png'

import chatbot from '../assets/images/chatbot.png';
import classify from '../assets/images/classify.png';
import hospital from '../assets/images/hospital.png';
import time from '../assets/images/time.png';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleGetStarted = () => {
    navigate('/services'); // /services 페이지로 이동
  };
  return (
    <div className="landing-page">
      {/* Header Section */}
      <header className="header">
        <div className="description">
          <h2>종합 응급 의료 도우미</h2>
          <p>
            환자의 증상을 빠르게 파악하는 <br />
            <strong>GPT 기반 증상 확인 챗봇</strong>과<br />
            최적의 <strong>응급실/병원 추천 및 소요시간 예측</strong><br />
            의료 서비스를 제공합니다.
          </p>
          <button className="get-started-button" onClick={handleGetStarted}>
            <strong>무료로 시작하기</strong>
          </button>
        </div>
        <div className="header-image-container">
      <img src={headerrightimg} alt="Paramedic illustration" className="header-image" />
      </div>
      </header>

      {/* Service Features Section */}
      <section className="features">
        <Feature
          title="GPT 기반 증상 진단 챗봇"
          description="사용자의 증상을 입력하면 GPT 모델을 통해 신속하게 진단 및 진료과를 추천합니다."
          image={chatbot}
        />
        <Feature
          title="환자 중증/경증 판별 서비스"
          description="환자의 증상을 분석하여 중증 또는 경증 여부를 판별해 응급실 필요성을 평가합니다."
          image={classify}
        />
        <Feature
          title="응급실 및 병원 추천 시스템"
          description="가까운 응급실이나 일반 병원을 추천하여 신속한 치료를 받을 수 있도록 안내합니다."
          image={hospital}
        />
        <Feature
          title="소요시간 예측 시스템"
          description="실시간으로 최적 경로를 계산하여 응급실까지의 예상 소요시간을 제공합니다."
          image={time}
        />
      </section>
    </div>
  );
}

function Feature({ title, description, image }) {
  return (
    <div className="feature">
      <img src={image} alt={title} className="feature-image" />
      <div className="feature-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default LandingPage;