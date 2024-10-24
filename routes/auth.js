// routes/auth.js
const express = require('express');     // 라우팅 목적으로 사용(라우팅 : 네트워크에서 경로를 선택하는 프로세스)
const { signup, login, checkUserID } = require('../controllers/authController');   // 회원가입, 로그인

const router = express.Router();

router.post('/sign-up', signup);                 // 회원가입
router.post('/check-userid', checkUserID);      // 아이디 중복확인
router.post('/login', login);                   // 로그인

module.exports = router;