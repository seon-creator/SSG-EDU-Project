import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../utils/api';
import './LoginPage.css';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 로그인 요청
      const response = await authApi.login({
        userId: userId.trim(),
        password
      });

      if (response.data.success) {
        const { role } = response.data.data.user;
        const tokens = response.data.data.tokens;

        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
        if (roleFromUrl && role !== roleFromUrl) {
          alert('해당 서비스 유저가 아닙니다.');
          navigate('/services');
          return;
        }

        // 계정 role에 맞게 서비스 페이지 이동
        switch (role) {
          case 'doctor':
            alert('로그인 성공! 환영합니다. doctor');
            navigate('/enterInfo');
            break;
          case 'user':
            alert('로그인 성공! 환영합니다. user');
            navigate('/chat');
            break;
          case 'admin':
            alert('로그인 성공! 환영합니다. admin');
            navigate('/');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        '아이디 또는 비밀번호를 확인해주세요.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    navigate(`/signup${roleFromUrl ? `?role=${roleFromUrl}` : ''}`);
  };

  const handleFindID = () => {
    navigate('/find-id');
  };

  const handleResetPW = () => {
    navigate('/reset-pw');
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
              onChange={(e) => setUserId(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
          </div>

          <div className="login-helper-links">
            <button
              type="button"
              className="find-account-button"
              onClick={handleFindID}
              disabled={isLoading}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              className="find-account-button"
              onClick={handleResetPW}
              disabled={isLoading}
            >
              비밀번호 찾기
            </button>
          </div>

          <button
              type="submit"
              className={`login-signup-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              로그인
            </button>

          <button
            type="button"
            onClick={handleSignup}
            className="login-signup-btn"
            disabled={isLoading}
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;