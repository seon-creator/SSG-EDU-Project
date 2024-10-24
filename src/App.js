import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';  // 로그인 상태에만 접속 가능한 페이지

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

import EnterInfoPage from './pages/EnterInfoPage';
import ShowStatusPage from './pages/ShowStatusPage';
import SeverePage from './pages/SeverePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* 상단 메뉴바 적용 */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
  
          {/* 로그인 상태에서만 접속 가능 */}
          <Route path="/enterInfo" element={<ProtectedRoute element={EnterInfoPage} />} />    {/* 환자 주소 및 증상 정보를 입력 */}
          <Route path="/patient-status" element={<ProtectedRoute element={ShowStatusPage} />} />  {/* 환자 주소,증상 정보 분류 모델을 실행 */}
          <Route path="/patient-status/Severe" element={<ProtectedRoute element={SeverePage} />} />  {/* 중증 환자 페이지 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;