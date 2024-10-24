const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // User 스키마의 ObjectID 참조
    required: true,
  },
  patientLocation: {
    type: String,
    required: true,  // 환자의 위치 정보
  },
  desination: {   //  목적지
    type: String,
    required: false
  },
  symptom: {
    type: String,
    required: true,  // 증상 설명
  },
  isSevere: {
    type: Boolean,
    required: false,  // 중증 여부
  },
  isCreated: {
    type: Date,
    default: Date.now,  // 생성일 (기본값: 현재 시간)
  }
});

module.exports = mongoose.model('Report', reportSchema);