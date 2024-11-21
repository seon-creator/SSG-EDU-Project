const express = require('express');
const { createReport, getReports, getReportDetails } = require('../controllers/report.controller');
const { isAuth, isDoctor } = require("../middlewares/auth.middleware");
const router = express.Router();

// POST 요청으로 Report 생성
router.post('/create', isAuth, isDoctor, createReport);
router.post('/getlist', isAuth, isDoctor, getReports);
router.get('/getdetail/:id', isAuth, isDoctor, getReportDetails);

module.exports = router;