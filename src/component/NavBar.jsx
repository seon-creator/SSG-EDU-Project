import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../utils/auth';  // 로그인 상태 확인 함수와 토큰 삭제 함수
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();  // 로그인 상태 확인

  // 로그아웃 핸들러
  const handleLogout = () => {
    removeToken();  // 세션에서 토큰 삭제
    navigate('/login');  // 로그인 페이지로 리다이렉트
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>응급 정보 시스템</h1>
      </div>
      <ul className="navbar-menu">
        <li>
          <Link to="/mypage">마이페이지</Link>
        </li>
        <li>
          <Link to="/edit-info">정보수정</Link>
        </li>
        <li>
          {loggedIn ? (
            <button onClick={handleLogout} className="navbar-button">
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="navbar-button">
              로그인
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;