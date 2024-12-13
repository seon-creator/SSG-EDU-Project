import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../utils/api';
import SuccessPopup from './SuccessPopup';
import './SignUpPage.css';

const SignupPage = () => {
  const [userid, setUserid] = useState('');
  const [email, setEmail] = useState('');
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [usernameCheckMessage, setUsernameCheckMessage] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const roleFromUrl = queryParams.get('role');
    if (roleFromUrl) {
      setRole(roleFromUrl);
    }
  }, [location]);

  const handleUseridChange = (e) => {
    setUserid(e.target.value);
    setIsUsernameChecked(false);
    setUsernameCheckMessage('');
    setIsUsernameError(false);
  };

  const handleUsernameCheck = async (e) => {
    e.preventDefault();
    if (!userid) {
      setFormMessage('아이디를 입력해주세요.');
      setFormError(true);
      return;
    }

    setIsLoading(true);
    try {

      const response = await authApi.checkUsername(userid);
      const { isAvailable } = response.data;

      if (isAvailable) {
        setUsernameCheckMessage('사용 가능한 아이디입니다.');
        setIsUsernameError(false);
        setIsUsernameChecked(true);
      } else {
        setUsernameCheckMessage('중복된 아이디입니다.');
        setIsUsernameError(true);
        setIsUsernameChecked(false);
      }
    } catch (error) {
      setUsernameCheckMessage('아이디 확인 중 오류가 발생했습니다.');
      setIsUsernameError(true);
      setIsUsernameChecked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!email || !userid || !password || !firstName || !lastName) {
      setFormMessage('모든 필드를 입력해주세요.');
      setFormError(true);
      return false;
    }

    if (password.length < 6) {
      setFormMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      setFormError(true);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormMessage('유효한 이메일 주소를 입력해주세요.');
      setFormError(true);
      return false;
    }

    setFormMessage('');
    setFormError(false);
    return true;
  };

  const handleConfirmSuccess = () => {
    setShowSuccessPopup(false);
    navigate('/login');
  };

  const HandleSignup = async (e) => {
    e.preventDefault();

    if (!isUsernameChecked) {
      setFormMessage('아이디 중복 확인을 해주세요.');
      setFormError(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (password !== confirmPassword) {
      setFormMessage('패스워드가 일치하지 않습니다.');
      setFormError(true);
      return;
    }

    const signupData = {
      email: email.trim(),
      userId: userid.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'user'
    };

    setIsLoading(true);
    try {
      const response = await authApi.register(signupData);

      if (response.status === 201 && response.data.success) {
        setFormMessage('회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.');
        setFormError(false);
        setShowSuccessPopup(true);
      } else {
        setFormMessage('회원가입 처리 중 오류가 발생했습니다.');
        setFormError(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message
        || '회원가입 중 오류가 발생했습니다.';
      setFormMessage(errorMessage);
      setFormError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`signup-container ${showSuccessPopup ? 'blur' : ''}`}>
      <div className="signup-input-container">
        <h1>회원가입</h1>
        <form onSubmit={HandleSignup}>
          {/* Email input */}
          <div className="signup-input-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* UserID input */}
          <div className="signup-input-group">
            <label>아이디</label>
            <div className="input-and-button">
              <input
                type="text"
                value={userid}
                onChange={handleUseridChange}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={handleUsernameCheck}
                className={`check-button ${isUsernameChecked ? 'checked' : ''} ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? '확인 중...' : isUsernameChecked ? '확인완료' : '중복확인'}
              </button>
            </div>
            {usernameCheckMessage && (
              <p className={`username-check-message ${isUsernameError ? 'error' : 'success'}`}>
                {usernameCheckMessage}
              </p>
            )}
          </div>

          {/* Password inputs */}
          <div className="signup-input-group">
            <label>패스워드</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="signup-input-group">
            <label>패스워드 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Name inputs */}
          <div className="signup-input-group">
            <div className="name-fields">
              <div className="name-field">
                <label>이름</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="name-field">
                <label>성</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </button>

          {/* Form message */}
          {formMessage && !showSuccessPopup && (
            <div className={`form-message ${formError ? 'error' : 'success'}`}>
              {formMessage}
            </div>
          )}
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <SuccessPopup
          message={formMessage}
          onConfirm={handleConfirmSuccess}
        />
      )}
    </div>
  );
};

export default SignupPage;