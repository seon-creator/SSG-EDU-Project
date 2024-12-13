// 신고정보 저장, 불러오기
const Report = require('../models/report.model'); // Report 스키마 불러오기
const User = require("../models/user.model");

// 환자 정보 등록 메서드
exports.createReport = async (req, res) => {
  const { patientLocation, symptom } = req.body;
  const userId = req.user.userId;

  try {
    // 유저가 존재하는지 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '유저 정보가 등록되어있지 않습니다.' });
    }

    // 새로운 Report 생성
    const newReport = new Report({
      user: user._id, // User ObjectID 참조
      patientLocation,
      symptom,
    });

    // Report 저장
    await newReport.save();

    // 유저의 reports 배열에 새로운 Report의 _id 추가
    user.reports.push(newReport._id);

    // 유저 정보 저장 (reports 업데이트 후)
    await user.save();

    res.status(201).json({ message: 'Report가 성공적으로 생성되었습니다.' });
  } catch (error) {
    console.error('Report 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 신고 목록 불러오기 메서드
exports.getReports = async (req, res) => {
  const userId = req.user.userId;

  try {
    // 유저가 존재하는지 확인
    const user = await User.findById(userId).populate('reports', 'patientLocation symptom isCreated');
    if (!user) {
      return res.status(404).json({ message: '유저 정보가 등록되어있지 않습니다.' });
    }

    // 유저의 reports 배열에서 모든 신고 정보를 가져오기
    const reports = user.reports.map((report) => ({
      ...report._doc,
      symptom: report.symptom.length > 15 ? report.symptom.slice(0, 15) : report.symptom // 증상 15자까지 잘라서 보냄
    }));

    res.status(200).json({ reports });
  } catch (error) {
    console.error('신고 목록 불러오는 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 신고 세부 정보 불러오기 메서드
exports.getReportDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // 참조 데이터를 가져오지 않고 report 자체만 조회
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: '해당 신고 정보를 찾을 수 없습니다.' });
    }

    res.status(200).json({ report });
  } catch (error) {
    console.error('신고 세부 정보 불러오는 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 중증일때 상태 업데이트
exports.updateSevere = async (req, res) => {
  const { address, symptoms } = req.body;

  try {
    // 주소와 증상으로 report 찾기
    const report = await Report.findOneAndUpdate(
      { patientLocation: address, symptom: symptoms },
      { isSevere: true }, // isSevere 값을 true로 업데이트
      { new: true } // 업데이트 후 변경된 데이터를 반환
    );

    if (!report) {
      return res.status(404).json({ message: '해당 신고를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: 'Report가 성공적으로 업데이트되었습니다.', report });
  } catch (error) {
    console.error('Report 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.updateDestination = async (req, res) => {
  const { address, symptoms, destination } = req.body;

  try {
    // address와 symptoms를 기준으로 report 찾기
    const report = await Report.findOneAndUpdate(
      { patientLocation: address, symptom: symptoms },
      { destination: destination }, // 선택된 병원의 이름을 destination으로 설정
      { new: true } // 업데이트 후 변경된 데이터를 반환
    );

    if (!report) {
      return res.status(404).json({ message: '해당 신고를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: 'Report가 성공적으로 업데이트되었습니다.', report });
  } catch (error) {
    console.error('Report 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.updateReport = async (req, res) => {
  const { symptom, isSevere } = req.body; // 클라이언트에서 보낸 데이터
  const { id } = req.params; // URL에서 ID 가져오기

  try {
    // ID로 Report 찾기 및 업데이트
    const report = await Report.findByIdAndUpdate(
      id, // 찾을 조건
      { symptom, isSevere }, // 업데이트할 데이터
      { new: true } // 업데이트된 데이터를 반환
    );

    if (!report) {
      return res.status(404).json({ message: '해당 Report를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      message: 'Report가 성공적으로 업데이트되었습니다.',
      updatedReport: report,
    });
  } catch (error) {
    console.error('Report 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};