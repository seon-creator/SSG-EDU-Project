const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {    // 기관명
    type: String,
    required: true
  },
  reports: [    // 응급 신고 id
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',  // Report 스키마의 ObjectID 참조
    }
  ],
});

module.exports = mongoose.model('User', userSchema);