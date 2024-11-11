import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getToken, removeToken } from '../utils/auth';  // 로그인 상태 확인 함수와 토큰 삭제 함수
import logo from '../assets/images/logo.png';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const token = getToken();  // JWT 토큰을 가져와서 로그인 상태를 확인
  const loggedIn = isAuthenticated();  // 로그인 상태 확인

  // 로그아웃 핸들러
  const handleLogout = () => {
    removeToken();  // 세션에서 토큰 삭제
    alert('로그아웃 되었습니다.');
    navigate('/');  // 랜딩 페이지로 리다이렉트
  };

  // 신고 목록 페이지 이동
  const handleList = () => { navigate('/report-list'); }
  const handleEnterInfo = () => { navigate('/enterInfo')}

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" className="navbar-logo-image" />
        </Link>
      </div>
      <ul className="navbar-menu">
        {token && (
          <>
            <button onClick={handleList} className="navbar-button">
              신고 목록
            </button>
            <button onClick={handleEnterInfo} className="navbar-button">
              신고 등록
            </button>
          </>
        )}
        <li>
          {loggedIn ? (
            <button onClick={handleLogout} className="navbar-button">
              로그아웃
            </button>
          ) : (
            <Link to="/services" className="navbar-button">
              시작하기
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;