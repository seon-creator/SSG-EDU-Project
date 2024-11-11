const express = require('express');
const { createReport, getReports, getReportDetails } = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// POST 요청으로 Report 생성
router.post('/create', isAuthenticated, createReport);
router.post('/getlist', isAuthenticated, getReports);
router.get('/getdetail/:id', isAuthenticated, getReportDetails);

module.exports = router;