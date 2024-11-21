require('dotenv').config(); // 환경변수 내용 불러오기

const corsOptions = {
  // origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

module.exports = corsOptions;
