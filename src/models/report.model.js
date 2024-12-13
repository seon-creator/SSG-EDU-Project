const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // User 스키마의 ObjectID 참조
    required: true,
  },
  patientLocation: {
    // 환자의 위치 정보
    type: String,
    required: true,
  },
  desination: {
    //  목적지
    type: String,
    required: false,
  },
  symptom: {
    // 증상 설명
    type: String,
    required: true,
  },
  isSevere: {
    // 중증 여부
    type: Boolean,
    default: false,
    required: false,
  },
  estimatedTime: {
    // 소요시간 (분 단위)
    type: Number,
    required: false,
  },
  isCreated: {
    // 생성일 (기본값: 현재 시간)
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
