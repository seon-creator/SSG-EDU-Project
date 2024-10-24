// config/db.js
const mongoose = require('mongoose');   // MongoDB 사용
require('dotenv').config();     // 환경변수로 API 키 값을 작성해둠

const ApiKey = process.env.MONGODB_APIKEY   // 데이터베이스 연결 ApiKey

const connectDB = async () => {     // db 연결 함수
    try {
        await mongoose.connect(ApiKey);     // API 키 연결
        console.log('MongoDB connected');   // db 연결 성공 시 로그 메시지 표시
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;