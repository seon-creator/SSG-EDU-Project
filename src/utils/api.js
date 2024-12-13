import axios from 'axios';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Node.js 서버를 위한 API
const nodeApi = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flask 서버를 위한 API
const flaskApi = axios.create({
    baseURL: process.env.REACT_APP_FLASK_BACKEND_URL || 'http://localhost:4000/api/',
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 리프레시 토큰이 필요 없는 엔드포인트 목록
const PUBLIC_ENDPOINTS = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/check-username',
    '/api/v1/auth/sendcode', // 인증번호 전송
    '/api/v1/auth/verify',   // 인증번호 검증
];

// 두 API에 인터셉터 적용
[nodeApi, flaskApi].forEach(api => {
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
                originalRequest.url.includes(endpoint)
            );

            if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
                originalRequest._retry = true;

                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
                if (!refreshToken) {
                    localStorage.removeItem(ACCESS_TOKEN_KEY);
                    localStorage.removeItem(REFRESH_TOKEN_KEY);
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                try {
                    const response = await nodeApi.post('/api/v1/auth/refresh-token', { refreshToken });
                    const { accessToken } = response.data;

                    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
                    nodeApi.defaults.headers.Authorization = `Bearer ${accessToken}`;
                    flaskApi.defaults.headers.Authorization = `Bearer ${accessToken}`;

                    return api(originalRequest);
                } catch (err) {
                    localStorage.removeItem(ACCESS_TOKEN_KEY);
                    localStorage.removeItem(REFRESH_TOKEN_KEY);
                    window.location.href = '/login';
                    return Promise.reject(err);
                }
            }
            return Promise.reject(error);
        }
    );
});

// Node.js 서버를 위한 API
export const authApi = {
    login: (data) => nodeApi.post('/api/v1/auth/login', data),
    register: (data) => nodeApi.post('/api/v1/auth/register', data),
    logout: () => nodeApi.delete('/api/v1/auth/logout'),
    checkUsername: (userId) => nodeApi.post('/api/v1/auth/check-username', { userId }),
    sendVerificationCode: (email) => nodeApi.post('/api/v1/auth/sendcode', { email }), // 인증번호 전송
    verifyCode: (token, code) => nodeApi.post('/api/v1/auth/verify', { token, code }) // 인증번호 검증
};

export const userApi = {
    getCurrentUser: () => nodeApi.get('/api/v1/users/me'),
    updateCurrentUser: (data) => nodeApi.put('/api/v1/users/me', data),
    changePassword: (data) => nodeApi.patch('/api/v1/users/change-password', data),
    resetPassword: (email, newPassword) => nodeApi.post('/api/v1/users/reset-password', email, newPassword), // 비밀번호 재설정 API 추가
};

export const predictionApi = {
    calculateTime: (startLat, startLon, distance) =>
        flaskApi.post('/predict/calculate_time', {
            startLat,
            startLon,
            distance
        })
};

export const adminApi = {
    getBasicStats: () => nodeApi.get('/api/v1/admin/basic-stats')
};
export const dailyReportApi = {
    get: (dateStr) => flaskApi.get(`chat/daily-report/${dateStr}`),
};

export const reportChatBotApi = {
    getReports: (startDate, endDate) =>
        flaskApi.post('/chat/reports', { start_date: startDate, end_date: endDate }),
};
export { nodeApi, flaskApi };