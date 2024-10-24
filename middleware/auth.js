// middleware/auth.js
require('dotenv').config(); // 환경변수 사용목적
const jwt = require('jsonwebtoken');    // JSON Web Token을 생성하고 검증하기 위한 모듈

// 로그인 상태를 확인하는 isAuthenticated 함수
module.exports.isAuthenticated = (req, res, next) => {
    const token = req.header('emergency-user-token');
    if (!token) {
        return res.status(401).json({ msg: '토큰이 없습니다.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded.user;
        return next();
    } catch (err) {
        console.log('인증 토큰이 만료되었거나 유효한 토큰이 아닙니다.');
        res.status(403).json({ msg: '인증 토큰이 만료되었거나 유효한 토큰이 아닙니다.' });
    }
};