const express = require('express');
const cors = require('cors');   // 사용목적: 백엔드 요청 받을 때 브라우저 보안 정책문제 해결
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const FRONTEND_URL = 'http://localhost:3000'

// MongoDB 연결
connectDB();

const app = express();

// CORS 설정
app.use(cors({
    origin: FRONTEND_URL,  // 프론트엔드가 실행 중인 주소
    credentials: true,
  }));

// 미들웨어
app.use(express.json());

// 라우트 설정
app.use('/auth', require('./routes/auth'));
app.use('/report', require('./routes/report'));
app.use('/user', require('./routes/user'));
app.use('/api', require('./routes/api'));

// 서버 실행
const PORT = 3001;
app.listen(PORT, () => console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`));