const express = require('express');
const { createReport } = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// POST 요청으로 Report 생성
router.post('/create', isAuthenticated, createReport);

module.exports = router;