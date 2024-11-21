const express = require('express');     // 라우팅 목적으로 사용(라우팅 : 네트워크에서 경로를 선택하는 프로세스)
const { getEmergencyInfo } = require('../controllers/api.controller'); // API 컨트롤러에서 getEmergencyInfo 함수 가져오기
const { isAuth, isDoctor } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get('/getEmergencyInfo', isAuth, isDoctor, getEmergencyInfo);

module.exports = router;