import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SignUpPage.css';

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SignupPage = () => {
  const [userid, setUserid] = useState('');
  const [email, setEmail] = useState('');
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState(''); // role 상태 추가

  const [usernameCheckMessage, setUsernameCheckMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 정보 가져오기

  // URL에서 role 값 가져오기
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const roleFromUrl = queryParams.get('role');
    if (roleFromUrl) {
      setRole(roleFromUrl);
    }
  }, [location]);

  // 중복 확인 로직
  const handleUsernameCheck = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID: userid }),
      });
      const data = await response.json();

      if (data.isAvailable) {
        setUsernameCheckMessage('사용 가능한 아이디입니다.');
        setIsUsernameError(false);
      } else {
        setUsernameCheckMessage('중복된 아이디입니다.');
        setIsUsernameError(true);
      }
    } catch (error) {
      console.error('아이디 확인 중 오류 발생:', error);
      setUsernameCheckMessage('아이디 확인 중 오류가 발생했습니다.');
      setIsUsernameError(true);
    }
  };

  // 회원가입 제출 로직
  const HandleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('패스워드가 일치하지 않습니다.');
      return;
    }

    const signupData = {
      email: email,
      userId: userid,
      password: password,
      firstName: firstName,
      lastName: lastName,
      role: role, // 저장된 role 값 사용
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.msg);
        navigate('/login');
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-input-container">
        <h1>회원가입</h1>
        <form onSubmit={HandleSignup}>
          {/* 이메일 입력란 */}
          <div className="signup-input-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 아이디 입력란 */}
          <div className="signup-input-group">
            <label>아이디</label>
            <div className="input-and-button">
              <input
                type="text"
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
                required
              />
              <button type="button" onClick={handleUsernameCheck}>중복확인</button>
            </div>
            <p className={`username-check-message ${isUsernameError ? 'error' : ''}`}>{usernameCheckMessage}</p>
          </div>

          {/* 패스워드 입력란 */}
          <div className="signup-input-group">
            <label>패스워드</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="signup-input-group">
            <label>패스워드 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* 이름과 성 입력란 */}
          <div className="signup-input-group">
            <div className="name-fields">
              <div className="name-field">
                <label>이름</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="name-field">
                <label>성</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          {/* 회원가입 제출 버튼 */}
          <button type="submit">회원가입</button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;