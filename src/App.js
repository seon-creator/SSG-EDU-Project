import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';

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
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/Chatbot/Profiles/ProfilePage';
import Chat from './pages/Chatbot/Chat/ChatPage';
import Navbar from './components/Navbar';
import ChangePasswordPage from './pages/Chatbot/Profiles/ChangePassword';
import FindUserId from './pages/FindIdPage';
import ResetPassword from './pages/ResetPasswordPage';
import { getRole } from './utils/auth';
import DashboardPage from './pages/Admin/DashboardPage';
import './assets/styles/global.css';
import './App.css';
import ReportChatbotPage from './pages/Chatbot/Reports/ReportChatbotPage';
import HistoryReportChatbotPage from './pages/Chatbot/Reports/HistoryReportChatbotPage';
function App() {
  // State to manage the user's role
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);

  // Update role on component mount
  useEffect(() => {
    const initializeUser = async () => {
      const userRole = getRole();
      setRole(userRole);


    };


    initializeUser();
  }, []); // 의존성 배열을 빈 배열로 설정 (한 번만 실행)

  const routes = [
    // Public routes
    { path: '/', element: <LandingPage /> },
    { path: '/services', element: <ChooseServicePage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignUpPage /> },
    { path: '/find-id', element: <FindUserId /> },
    { path: '/reset-pw', element: <ResetPassword /> },



    // Protected routes
    // { path: '/', element: <Home userData={userData} userRole={role} />, private: true },
    { path: '/enterInfo', element: <EnterInfoPage />, private: true },
    { path: '/patient-status', element: <ShowStatusPage />, private: true },
    { path: '/patient-status/Severe', element: <SeverePage />, private: true },
    { path: '/patient-status/mild', element: <MildPage />, private: true },
    { path: '/route/guide', element: <RouteguidancePage />, private: true },
    { path: '/report-list', element: <ReportListPage />, private: true },
    { path: '/report-list/:id', element: <ReportDetailPage />, private: true },
    { path: '/profile', element: <ProfilePage />, private: true },
    { path: '/chat', element: <Chat />, private: true },
    { path: '/change-password', element: <ChangePasswordPage />, private: true },
    { path: '/admin/dashboard', element: <DashboardPage />, private: true },
    { path: '/report-chatbot', element: <ReportChatbotPage />, private: true },
    { path: '/history-report-chatbot', element: <HistoryReportChatbotPage />, private: true }


  ];

  return (
    <Router>
      {/* Render Navbar based on the role */}
      <Navbar />
      <div className="App">
        <Routes>
          {routes.map(({ path, element, private: isPrivate }) => (
            <Route
              key={path}
              path={path}
              element={isPrivate ? <ProtectedRoute>{element}</ProtectedRoute> : element}
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;