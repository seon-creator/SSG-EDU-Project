import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/auth';
import './LoginPage.css'; // CSS 파일 import

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LoginPage = () => {
  const [userId, setID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid: userId, password: password }),
      });

      const data = await response.json();
      if (data.isSuccess) {
        // 로그인 성공 시 토큰을 저장
        setToken(data.token);
        navigate('/enterInfo'); // 대시보드로 이동 (로그인 성공 후 페이지 이동)
      } else {
        alert(data.message || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };
  
  // 회원가입 페이지로 이동하는 함수
  const handleSignup = () => {
    navigate('/signup'); // 회원가입 페이지로 이동
  };

  return (
    <div className="login-container">
      <div className="login-input-container">
        <h2>로그인</h2>
        <form onSubmit={handleLogin}>
          <div className="login-input-group">
            <label htmlFor="username">아이디</label>
            <input 
              type="text" 
              placeholder="아이디 입력" 
              value={userId} 
              onChange={(e) => setID(e.target.value)} 
              required
            />
          </div>
          <div className="login-input-group">
            <label htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn login-btn">로그인</button>
          {/* 회원가입 버튼 추가 */}
          <button onClick={handleSignup} className="btn signup-btn">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;