// pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { Typography, IconButton, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, ArrowBack } from '@mui/icons-material';
import ChatArea from '../../../components/Chatbot/ChatArea';
import ChatSessions from '../../../components/Chatbot/ChatSessions';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

const ChatPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) navigate('/login');
    }, [navigate]);

    const handleSessionSelect = (sessionId) => {
        setSelectedSessionId(sessionId);
        if (isMobile) setMobileDrawerOpen(false);
    };

    const handleBack = () => {
        setSelectedSessionId(null);
        setMobileDrawerOpen(true);
    };

    return (
        <div className="chat-page">
            {isMobile && (
                <div className="mobile-header">
                    <IconButton onClick={() => setMobileDrawerOpen(true)} color="inherit">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6">
                        {selectedSessionId ? '채팅' : '세션'}
                    </Typography>
                </div>
            )}

            <div className="chat-content">
                {/* 데스크탑 세션 사이드바 */}
                {!isMobile && (
                    <div className="sessions-sidebar">
                        <ChatSessions
                            onSelectSession={handleSessionSelect}
                            selectedSessionId={selectedSessionId}
                        />
                    </div>
                )}

                {/* 모바일 세션 서랍 */}
                {isMobile && (
                    <Drawer
                        anchor="left"
                        open={mobileDrawerOpen}
                        onClose={() => setMobileDrawerOpen(false)}
                        className="mobile-drawer"
                    >
                        <div className="mobile-drawer-content">
                            <ChatSessions
                                onSelectSession={handleSessionSelect}
                                selectedSessionId={selectedSessionId}
                            />
                        </div>
                    </Drawer>
                )}

                {/* 채팅 영역 */}
                <div className="main-chat-area">
                    {selectedSessionId ? (
                        <div className="chat-area-container">
                            {isMobile && (
                                <IconButton
                                    className="back-button"
                                    onClick={handleBack}
                                >
                                    <ArrowBack />
                                </IconButton>
                            )}
                            <ChatArea
                                sessionId={selectedSessionId}
                                onBack={isMobile ? handleBack : undefined}
                            />
                        </div>
                    ) : (
                        <div className="chat-placeholder">
                            <div className="placeholder-content">

                                <Typography variant="h5">
                                    채팅에 오신 것을 환영합니다
                                </Typography>
                                <Typography variant="body1">
                                    대화를 선택하거나 새 대화를 시작하세요
                                </Typography>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;