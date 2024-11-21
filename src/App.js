import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';  // 로그인 상태에만 접속 가능한 페이지

import ChooseServicePage from './pages/ChooseServicePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

import ReportListPage from './pages/reportService/ReportListPage';
import ReportDetailPage from './pages/reportService/ReportDetailPage';

import EnterInfoPage from './pages/reportService/EnterInfoPage';
import ShowStatusPage from './pages/reportService/ShowStatusPage';
import SeverePage from './pages/reportService/severe/SeverePage';
import MildPage from './pages/reportService/mild/RecommendationPage';
import RouteguidancePage from './pages/reportService/RouteguidancePage';
import './App.css';

import LandingPage from './pages/LandingPage';

function App() {

  return (
    <Router>
      <div className="App">
        {/* 상단 메뉴바 적용 */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ChooseServicePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
  
          {/* 로그인 상태에서만 접속 가능 */}
          <Route path="/enterInfo" element={<ProtectedRoute element={EnterInfoPage} />} />    {/* 환자 주소 및 증상 정보를 입력 */}
          <Route path="/patient-status" element={<ProtectedRoute element={ShowStatusPage} />} />  {/* 환자 주소,증상 정보 분류 모델을 실행 */}
          <Route path="/patient-status/Severe" element={<ProtectedRoute element={SeverePage} />} /> {/* 중증 환자 페이지 */}
          <Route path="/patient-status/mild" element={<ProtectedRoute element={MildPage} />} /> {/* 경증 환자 페이지 */}
          <Route path="/route/guide" element={<ProtectedRoute element={RouteguidancePage} />} />


          <Route path="/report-list" element={<ProtectedRoute element={ReportListPage} />} /> {/* 신고 목록 조회 */}
          <Route path="/report-list/:id" element={<ProtectedRoute element={ReportDetailPage} />} /> {/* 특정 신고 내용 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;