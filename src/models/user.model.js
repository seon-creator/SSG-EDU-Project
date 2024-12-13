const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "이메일은 필수입니다"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email),
        message: "유효하지 않은 이메일 형식입니다",
      },
    },
    password: {
      type: String,
      required: [true, "비밀번호는 필수입니다"],
      minLength: [8, "비밀번호는 최소 8자 이상이어야 합니다"],
      select: false,
    },
    userId: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: [true, "이름은 필수입니다"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "성은 필수입니다"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    height: {
      type: Number,
      min: [0, "키는 0보다 커야 합니다"],
    },
    weight: {
      type: Number,
      min: [0, "몸무게는 0보다 커야 합니다"],
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    healthHistory: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "doctor", "admin"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    reports: [    // 응급 신고 id
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',  // Report 스키마의 ObjectID 참조
      }
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 전체 이름에 대한 가상 필드
userSchema.virtual("fullName").get(function () {
  return `${this.lastName} ${this.firstName}`;
});

// 저장하기 전에 비밀번호 해시
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;