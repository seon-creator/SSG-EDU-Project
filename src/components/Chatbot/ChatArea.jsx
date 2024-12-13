import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography,
    Avatar,
    ThemeProvider,
    createTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { flaskApi } from '../../utils/api';
import PropTypes from 'prop-types';

// Styled Components
const ChatSendButton = styled(IconButton)(({ theme }) => ({
    width: '40px',
    height: '40px',
    minWidth: '40px',
    minHeight: '40px',
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'scale(1.05)',
    },
    '&:active': {
        transform: 'scale(0.95)',
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.grey[300],
    }
}));

const ChatTextField = styled(TextField)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    '& .MuiOutlinedInput-root': {
        height: '40px',
        '& fieldset': {
            borderColor: theme.palette.grey[200],
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& .MuiOutlinedInput-input': {
        padding: '8px 14px',
    },
}));

// Theme Configuration
const theme = createTheme({
    typography: {
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        body1: {
            fontSize: '0.95rem',
            lineHeight: 1.6,
        },
        caption: {
            fontSize: '0.75rem',
        },
    },
    palette: {
        primary: {
            main: '#1976d2',
            light: '#e3f2fd',
            dark: '#1565c0',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e0e0e0',
            300: '#9e9e9e',
        },
        text: {
            primary: '#18181B',
            secondary: '#52525B',
        },
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    '& code': {
                        backgroundColor: 'rgba(0, 0, 0, 0.06)',
                        padding: '2px 4px',
                        borderRadius: 4,
                        fontSize: '0.9em',
                    },
                    '& blockquote': {
                        borderLeft: '4px solid #1976d2',
                        margin: '16px 0',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    },
                },
            },
        },
    },
});

// Custom Scrollbar Styles
const scrollbarStyle = {
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#888',
        borderRadius: '4px',
        '&:hover': {
            background: '#555',
        },
    },
};
// Message Component
const Message = ({ message }) => {
    const isBot = message.type === 'bot';

    const markdownComponents = {
        h1: (props) => <Typography variant="h5" sx={{ mt: 2, mb: 1 }} {...props} />,
        h2: (props) => <Typography variant="h6" sx={{ mt: 2, mb: 1 }} {...props} />,
        p: (props) => <Typography variant="body1" sx={{ mb: 1.5 }} {...props} />,
        ul: (props) => (
            <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
                {props.children}
            </Box>
        ),
        ol: (props) => (
            <Box component="ol" sx={{ pl: 2, mb: 1.5 }}>
                {props.children}
            </Box>
        ),
        li: (props) => (
            <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body1" component="span">
                    {props.children}
                </Typography>
            </Box>
        ),
        strong: (props) => (
            <Typography
                component="span"
                sx={{
                    fontWeight: 'bold',
                    color: 'primary.main'
                }}
                {...props}
            />
        ),
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                mb: 2,
                flexDirection: isBot ? 'row' : 'row-reverse',
            }}
        >
            <Avatar
                sx={{
                    bgcolor: isBot ? 'primary.light' : 'primary.main',
                    color: isBot ? 'primary.main' : '#fff',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.1)'
                    }
                }}
            >
                {isBot ? <SmartToyIcon /> : <PersonIcon />}
            </Avatar>
            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    maxWidth: '75%',
                    bgcolor: isBot ? 'grey.50' : 'primary.light',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <Box sx={{
                    '& > *:first-child': { mt: 0 },
                    '& > *:last-child': { mb: 0 }
                }}>
                    {isBot ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                        >
                            {message.content}
                        </ReactMarkdown>
                    ) : (
                        <Typography variant="body1">{message.content}</Typography>
                    )}
                </Box>
                {message.timestamp && (
                    <Typography
                        variant="caption"
                        sx={{
                            mt: 1,
                            display: 'block',
                            opacity: 0.7,
                            color: 'text.secondary',
                        }}
                    >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

// Typing Indicator Component
const TypingIndicator = () => (
    <Box
        sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            alignItems: 'center',
        }}
    >
        <Avatar
            sx={{
                bgcolor: 'primary.light',
                color: 'primary.main',
            }}
        >
            <SmartToyIcon />
        </Avatar>
        <Paper
            elevation={1}
            sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                }}
            >
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            animation: 'bounce 1.4s infinite ease-in-out',
                            animationDelay: `${i * 0.16}s`,
                            '@keyframes bounce': {
                                '0%, 80%, 100%': {
                                    transform: 'scale(0)',
                                    opacity: 0.3,
                                },
                                '40%': {
                                    transform: 'scale(1)',
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                ))}
            </Box>
        </Paper>
    </Box>
);

const ChatArea = ({ sessionId }) => {
    // 상태 변수 정의
    const [messages, setMessages] = useState([]); // 메시지 목록 저장
    const [newMessage, setNewMessage] = useState(''); // 새로운 메시지 입력값
    const [loading, setLoading] = useState(false); // 채팅 기록 로딩 상태
    const [sending, setSending] = useState(false); // 메시지 전송 상태
    const [error, setError] = useState(null); // 에러 상태 관리
    const messagesEndRef = useRef(null); // 메시지 리스트 끝 위치 참조용

    // 메시지 리스트의 끝으로 스크롤 이동 함수
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // 끝 위치로 부드럽게 스크롤
    }, []);

    // 채팅 기록을 서버에서 가져오는 함수
    const fetchHistory = useCallback(async () => {
        if (!sessionId) return; // sessionId가 없으면 실행하지 않음

        try {
            setLoading(true); // 로딩 상태 시작
            setError(null); // 에러 상태 초기화
            const response = await flaskApi.get(`chat/sessions/${sessionId}/history`); // 서버로부터 채팅 기록 가져오기
            if (response.data.status === 'success') { // 성공 응답 확인
                setMessages(response.data.data.history); // 가져온 기록을 상태에 저장
            }
        } catch (err) {
            setError('Failed to load chat history'); // 에러 메시지 설정
            console.error('Error fetching chat history:', err); // 에러 로그 출력
        } finally {
            setLoading(false); // 로딩 상태 종료
        }
    }, [sessionId]);

    // 컴포넌트가 렌더링될 때 또는 sessionId가 변경될 때 채팅 기록 가져오기 실행
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // 메시지가 추가될 때 스크롤을 끝으로 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // 메시지 전송 처리 함수
    const handleSendMessage = async (e) => {
        e.preventDefault(); // 기본 폼 제출 이벤트 방지
        if (!newMessage.trim() || !sessionId || sending) return; // 메시지가 없거나 sessionId가 없거나 이미 전송 중이면 실행하지 않음

        try {
            setSending(true); // 전송 상태 시작
            setError(null); // 에러 상태 초기화

            // 사용자 메시지 객체 생성
            const userMessage = {
                type: 'user', // 사용자 메시지 타입
                content: newMessage.trim(), // 메시지 내용
                timestamp: new Date().toISOString(), // 현재 시간
                id: `user-${Date.now()}` // 고유 ID 생성
            };
            setMessages(prev => [...prev, userMessage]); // 메시지 목록에 사용자 메시지 추가
            setNewMessage(''); // 입력 필드 초기화

            // 사용자 메시지를 서버로 전송
            const userResponse = await flaskApi.post(`chat/sessions/${sessionId}/messages/user`, {
                content: newMessage.trim()
            });

            if (userResponse.data.status === 'success') { // 사용자 메시지 전송 성공 확인
                // 봇 응답을 서버로부터 요청
                const botResponse = await flaskApi.post(`chat/sessions/${sessionId}/messages/bot`, {
                    content: newMessage.trim()
                });

                if (botResponse.data.status === 'success') { // 봇 응답 성공 확인
                    const botMessage = {
                        ...botResponse.data.data.response.message, // 봇 메시지 내용
                        id: botResponse.data.data.response.message.id || `bot-${Date.now()}` // 고유 ID 생성
                    };
                    setMessages(prev => [...prev, botMessage]); // 메시지 목록에 봇 메시지 추가
                }
            }
        } catch (err) {
            setError('Failed to send message'); // 에러 메시지 설정
            console.error('Error sending message:', err); // 에러 로그 출력
        } finally {
            setSending(false); // 전송 상태 종료
        }
    };

    if (!sessionId) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                bgcolor: 'background.default',
            }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    No active chat session
                </Typography>
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    maxHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        bgcolor: 'grey.50',
                    }}
                >
                    <Typography variant="h6">Chat Session</Typography>
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        p: 2,
                        ...scrollbarStyle,
                    }}
                >
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography color="text.secondary">Loading messages...</Typography>
                        </Box>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <Message
                                    key={message.id || `${message.type}-${message.timestamp}`}
                                    message={message}
                                />
                            ))}
                            {sending && <TypingIndicator />}
                            {error && (
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: '#ffebee',
                                        color: '#c62828',
                                        borderRadius: 1,
                                        mt: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography>{error}</Typography>
                                </Box>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </Box>

                <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'grey.200',
                        bgcolor: 'grey.50',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                        }}
                    >
                        <ChatTextField
                            fullWidth
                            size="small"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            variant="outlined"
                            disabled={sending}
                        />
                        <ChatSendButton
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                        >
                            <SendIcon sx={{ fontSize: '1.2rem' }} />
                        </ChatSendButton>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

ChatArea.propTypes = {
    sessionId: PropTypes.string,
};

export default ChatArea;