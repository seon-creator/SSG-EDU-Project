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
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, password: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 로그인 성공 시 토큰 저장 및 성공 처리
        setToken(data.data.tokens.accessToken);
        // role 값에 따라 다른 페이지로 이동
        if (data.data.user.role === 'doctor') {
          alert('로그인 성공! 환영합니다. doctor');
          navigate('/enterInfo'); // role이 doctor이면 enterInfo로 이동
        } // 일반 유저 로그인
        else if (data.data.user.role === 'user') {
          alert('로그인 성공! 환영합니다. user');
          navigate('/'); // 기본 페이지로 이동
        }
        else {
          alert('로그인 성공! 환영합니다. admin');
          navigate('/'); // 기본 페이지로 이동
        }
      } else {
        // 로그인 실패 시 사용자에게 메시지 알림
        alert(data.message || '아이디 또는 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };
  
  // 회원가입 페이지로 이동하는 함수
  const handleSignup = () => {
    navigate('/services'); // 회원가입 페이지로 이동
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