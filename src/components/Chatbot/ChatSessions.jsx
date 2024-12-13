import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Button,
    CircularProgress,
    Tooltip,
    styled,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import { flaskApi } from '../../utils/api';
import debounce from 'lodash/debounce';

const ITEMS_PER_PAGE = 10;

// 스타일드 컴포넌트
const ModernSidebarContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: 380,
    height: '100vh',
    backgroundColor: theme.palette.background.paper,
    borderRight: '1px solid rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    }
}));

const ModernHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: theme.spacing(8),
    zIndex: 1,
    '& .MuiTypography-root': {
        fontWeight: 600,
        letterSpacing: '0.5px'
    }
}));

const ModernSessionsList = styled(List)(({ theme }) => ({
    flex: 1,
    top: theme.spacing(8),
    overflowY: 'auto',
    padding: theme.spacing(),
    '&::-webkit-scrollbar': {
        width: '4px'
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#bdbdbd',
        borderRadius: '4px',
        '&:hover': {
            background: '#9e9e9e'
        }
    }
}));

const ModernSessionItem = styled(ListItem)(({ theme, selected }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    borderRadius: '12px',
    backgroundColor: selected ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
    border: '1px solid',
    borderColor: selected ? 'rgba(33, 150, 243, 0.5)' : 'transparent',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: selected ? 'rgba(33, 150, 243, 0.12)' : 'rgba(0, 0, 0, 0.04)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }
}));

const ModernActionButtons = styled(Box)({
    display: 'flex',
    gap: '8px',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    '& .MuiIconButton-root': {
        padding: '6px',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)'
        }
    },
    '.MuiListItem-root:hover &': {
        opacity: 1
    }
});

const ModernButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    padding: '8px 16px',
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
}));

const ModernDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        padding: theme.spacing(2)
    }
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}));

// 초기 상태 및 리듀서
const initialState = {
    sessions: [],
    loading: true,
    error: null,
    hasMore: true,
    page: 1
};

function sessionsReducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                sessions: action.page === 1 ? action.sessions : [...state.sessions, ...action.sessions],
                hasMore: action.hasMore,
                loading: false,
                error: null
            };
        case 'FETCH_ERROR':
            return { ...state, error: action.error, loading: false };
        case 'SET_PAGE':
            return { ...state, page: action.page };
        case 'RESET':
            return { ...initialState };
        default:
            return state;
    }
}

const ChatSessions = ({ onSelectSession, selectedSessionId }) => {
    const [state, dispatch] = useReducer(sessionsReducer, initialState);
    const [editDialog, setEditDialog] = useState({ open: false, sessionId: null, name: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [refreshKey, setRefreshKey] = useState(0);
    const observer = useRef();
    const debouncedObserver = useRef();

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // 인터섹션 옵저버 설정
    useEffect(() => {
        debouncedObserver.current = debounce((entries) => {
            if (entries[0].isIntersecting && state.hasMore && !state.loading) {
                dispatch({ type: 'SET_PAGE', page: state.page + 1 });
            }
        }, 300);

        return () => {
            if (debouncedObserver.current) {
                debouncedObserver.current.cancel();
            }
        };
    }, [state.hasMore, state.loading, state.page]);

    const lastSessionRef = useCallback(node => {
        if (state.loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            debouncedObserver.current(entries);
        });

        if (node) observer.current.observe(node);
    }, [state.loading]);

    // API 호출
    const fetchSessions = useCallback(async () => {
        try {
            dispatch({ type: 'FETCH_START' });
            const response = await flaskApi.get(`chat/sessions?page=${state.page}&limit=${ITEMS_PER_PAGE}`);
            console.log(response);

            if (response.data.status === 'success') {
                const sessionsData = response.data.data.sessions;
                if (!sessionsData) {
                    throw new Error('세션 데이터가 유효하지 않습니다');
                }

                const newSessions = Array.isArray(sessionsData.sessions) ? sessionsData.sessions : [];
                const total = typeof sessionsData.total === 'number' ? sessionsData.total : 0;

                dispatch({
                    type: 'FETCH_SUCCESS',
                    sessions: newSessions,
                    page: state.page,
                    hasMore: state.sessions.length + newSessions.length < total
                });
            }
        } catch (err) {
            dispatch({ type: 'FETCH_ERROR', error: '채팅 세션을 로드하는 데 실패했습니다' });
            showSnackbar('채팅 세션을 로드하는 데 실패했습니다', 'error');
        }
    }, [state.page, state.sessions.length, showSnackbar]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions, refreshKey]);

    const handleCreateSession = async () => {
        try {
            dispatch({ type: 'FETCH_START' });
            const response = await flaskApi.post('chat/sessions', { name: "새 채팅" });
            if (response.data.status === 'success') {
                dispatch({ type: 'RESET' });
                await fetchSessions();
                onSelectSession(response.data.data.session.id);
                showSnackbar('새 채팅 세션이 성공적으로 생성되었습니다');
            }
        } catch (err) {
            showSnackbar('세션 생성에 실패했습니다', 'error');
            dispatch({ type: 'FETCH_ERROR', error: '세션 생성에 실패했습니다' });
        }
    };

    const handleUpdateSessionName = async () => {
        try {
            dispatch({ type: 'FETCH_START' });
            const response = await flaskApi.put(`chat/sessions/${editDialog.sessionId}/name`, {
                name: editDialog.name
            });
            if (response.data.status === 'success') {
                dispatch({ type: 'RESET' });
                await fetchSessions();
                setEditDialog({ open: false, sessionId: null, name: '' });
                showSnackbar('세션 이름이 성공적으로 업데이트되었습니다');
            }
        } catch (err) {
            showSnackbar('세션 이름 업데이트에 실패했습니다', 'error');
            dispatch({ type: 'FETCH_ERROR', error: '세션 업데이트에 실패했습니다' });
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (window.confirm('이 채팅 세션을 삭제하시겠습니까?')) {
            try {
                dispatch({ type: 'FETCH_START' });
                const response = await flaskApi.delete(`chat/sessions/${sessionId}`);
                if (response.data.status === 'success') {
                    dispatch({ type: 'RESET' });
                    await fetchSessions();
                    if (selectedSessionId === sessionId) {
                        onSelectSession(null);
                    }
                    showSnackbar('세션이 성공적으로 삭제되었습니다');
                }
            } catch (err) {
                showSnackbar('세션 삭제에 실패했습니다', 'error');
                dispatch({ type: 'FETCH_ERROR', error: '세션 삭제에 실패했습니다' });
            }
        }
    };

    const handleRefresh = () => {
        dispatch({ type: 'RESET' });
        setRefreshKey(prev => prev + 1);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ModernSidebarContainer>
            <ModernHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ChatIcon sx={{ fontSize: 28 }} />

                </Box>
                <Box>
                    {state.loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        <>

                            <Tooltip title="새 채팅">
                                <IconButton onClick={handleCreateSession} color="inherit">
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            </ModernHeader>

            <ModernSessionsList>
                {state.error && !state.loading && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="error">{state.error}</Typography>
                        <ModernButton
                            onClick={handleRefresh}
                            variant="contained"
                            sx={{ mt: 2 }}
                        >
                            다시 시도
                        </ModernButton>
                    </Box>
                )}

                {!state.loading && !state.error && state.sessions.length === 0 && (
                    <Box sx={{
                        p: 3,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <ChatIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography color="text.secondary">
                            아직 대화가 없습니다
                        </Typography>
                        <ModernButton
                            startIcon={<AddIcon />}
                            onClick={handleCreateSession}
                            variant="contained"
                        >
                            새 채팅 시작
                        </ModernButton>
                    </Box>
                )}

                {state.sessions.map((session, index) => (
                    <ModernSessionItem
                        ref={index === state.sessions.length - 1 ? lastSessionRef : null}
                        key={session.id}
                        selected={selectedSessionId === session.id}
                        onClick={() => onSelectSession(session.id)}
                    >
                        <ListItemText
                            primary={
                                <Typography noWrap>
                                    {session.name || `채팅 ${session.id}`}
                                </Typography>
                            }
                            secondary={formatDate(session.start_time)}
                        />
                        <ModernActionButtons>
                            <Tooltip title="편집">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditDialog({
                                            open: true,
                                            sessionId: session.id,
                                            name: session.name
                                        });
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="삭제">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </ModernActionButtons>
                    </ModernSessionItem>
                ))}

                {state.loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
            </ModernSessionsList>

            <ModernDialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, sessionId: null, name: '' })}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>세션 이름 편집</DialogTitle>
                <DialogContent>
                    <ModernTextField
                        autoFocus
                        margin="dense"
                        label="세션 이름"
                        fullWidth
                        value={editDialog.name}
                        onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleUpdateSessionName();
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(0, 0, 0, 0.1)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: 2 }}>
                    <ModernButton
                        onClick={() => setEditDialog({ open: false, sessionId: null, name: '' })}
                        variant="outlined"
                        sx={{
                            color: 'text.secondary',
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            '&:hover': {
                                borderColor: 'text.primary',
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        취소
                    </ModernButton>
                    <ModernButton
                        onClick={handleUpdateSessionName}
                        variant="contained"
                        sx={{

                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                            },
                        }}
                    >
                        변경 사항 저장
                    </ModernButton>
                </DialogActions>
            </ModernDialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                    '& .MuiSnackbarContent-root': {
                        borderRadius: '8px',
                    },
                }}
            >
                <Alert
                    elevation={6}
                    variant="filled"
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        borderRadius: '8px',
                        '& .MuiAlert-icon': {
                            fontSize: '24px',
                        },
                        '& .MuiAlert-message': {
                            fontSize: '14px',
                            fontWeight: 500,
                        },
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* 선택 사항: 글로벌 로딩 상태에 대한 로딩 오버레이 추가 */}
            {state.loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <CircularProgress
                        size={40}
                        sx={{
                            color: 'primary.main',
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            },
                        }}
                    />
                </Box>
            )}
        </ModernSidebarContainer>
    );
};

// PropTypes 유효성 검사
ChatSessions.propTypes = {
    onSelectSession: PropTypes.func.isRequired,
    selectedSessionId: PropTypes.string,
};

export default ChatSessions;