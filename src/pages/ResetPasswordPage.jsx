import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { authApi, userApi } from "../utils/api";
import "./ResetPasswordPage.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [step, setStep] = useState(1); // 1: Email 입력, 2: 인증번호 입력, 3: 비밀번호 재설정
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setMessage(null);
    try {
      const response = await authApi.sendVerificationCode(email); // API 호출
      localStorage.setItem("verificationToken", response.data.data.token); // JWT 토큰 저장
      console.log(response.data);
      setMessage({ type: "success", text: "인증번호가 이메일로 전송되었습니다." });
      setStep(2);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "오류가 발생했습니다." });
    }
  };

  const handleVerifyCode = async () => {
    setMessage(null);
    try {
      console.log(localStorage.getItem("verificationToken"));
      const response = await authApi.verifyCode(localStorage.getItem("verificationToken"), verificationCode); // JWT 토큰과 인증번호 전송
      if (response.data.success) {
        setMessage({ type: "success", text: "인증되었습니다." });
        setIsVerified(true);
        setStep(3);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "인증번호가 유효하지 않습니다.",
      });
    }
  };

  const handleResetPassword = async () => {
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." });
      return;
    }
    try {
      // 이메일과 새 비밀번호를 함께 전송
      await userApi.resetPassword({ email, newPassword });
      setMessage({ type: "success", text: "비밀번호가 성공적으로 변경되었습니다." });
      setStep(1); // 초기화
      setEmail("");
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
      localStorage.removeItem("verificationToken"); // 인증 토큰 삭제
      alert(message.text);
      navigate('/login');
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="reset-password-container">
      <h2>비밀번호 재설정</h2>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      {step === 1 && (
        <div>
          <label>이메일:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 입력"
          />
          <button onClick={handleSendCode}>인증번호 전송</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label>인증번호:</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="인증번호 입력"
          />
          <button onClick={handleVerifyCode}>인증하기</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label>새 비밀번호:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 입력"
          />
          <label>새 비밀번호 확인:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호 확인 입력"
          />
          <button onClick={handleResetPassword}>비밀번호 재설정</button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;