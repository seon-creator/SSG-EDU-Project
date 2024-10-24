import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import landingpageImage from '../image/landingpage.png';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div
      className="landing-container"
      style={{ backgroundImage: `url(${landingpageImage})` }}
    >
      <div className="content">
        <h1 className="title">신속한 환자 상태 분류 및 병원 추천</h1>
        <button className="btn landing-login-btn" onClick={() => navigate('/login')}>
          로그인
        </button>
      </div>
    </div>
  );
};

export default LandingPage;