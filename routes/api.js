const express = require('express');     // 라우팅 목적으로 사용(라우팅 : 네트워크에서 경로를 선택하는 프로세스)
const { getEmergencyInfo } = require('../controllers/apiController');
const { isAuthenticated } = require('../middleware/auth'); 

const router = express.Router();

router.get('/getEmergencyInfo', isAuthenticated, getEmergencyInfo);

module.exports = router;