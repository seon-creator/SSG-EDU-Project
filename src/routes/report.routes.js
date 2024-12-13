const express = require('express');
const { createReport, getReports, getReportDetails, updateSevere, updateDestination, updateReport } = require('../controllers/report.controller');
const { isAuth, isDoctor } = require("../middlewares/auth.middleware");
const router = express.Router();

// POST 요청으로 Report 생성
router.post('/create', isAuth, isDoctor, createReport);
router.post('/getlist', isAuth, isDoctor, getReports);
router.get('/getdetail/:id', isAuth, isDoctor, getReportDetails);
router.patch('/update-severe', isAuth, isDoctor, updateSevere);
router.patch('/update-destination', isAuth, isDoctor, updateDestination);
router.put('/update/:id', isAuth, isDoctor, updateReport);

module.exports = router;