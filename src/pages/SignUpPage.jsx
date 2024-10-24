import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css'

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SignupPage = () => {
  const [userid, setUserid] = useState('');
  const [isUsernameError, setIsUsernameError] = useState(false);  // 에러 여부 관리
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [usernameCheckMessage, setUsernameCheckMessage] = useState('');
  const navigate = useNavigate(); // 페이지 이동 모듈

  // 중복 확인 로직
  const handleUsernameCheck = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/auth/check-userid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID: userid }),
      });
      const data = await response.json();

      if (data.isAvailable) {
        setUsernameCheckMessage('사용 가능한 아이디입니다.');
        setIsUsernameError(false);  // 에러 아님
      } else {
        setUsernameCheckMessage('중복된 아이디입니다.');
        setIsUsernameError(true);  // 에러 아님
      }
    } catch (error) {
      console.error('아이디 확인 중 오류 발생:', error);
      setUsernameCheckMessage('아이디 확인 중 오류가 발생했습니다.');
      setIsUsernameError(true);  // 에러 아님
    }
  };

  // 회원가입 제출 로직
  const HandleSignup = async (e) => {
    // 프론트엔드에서 폼 제출 시 자동 새로고침 동작을 막아줌 TypeError: Failed to fetch 오류를 방지함
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('패스워드가 일치하지 않습니다.');
      return;
    }

    const signupData = {
      userid: userid,
      password: password,
      name: name,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/auth/sign-up`, {
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
      }
      else {
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
        {/* 아이디 입력란 */}
        <div className="signup-input-group">
          <label>아이디</label>
          <div className='input-and-button'>
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
        <div className="input-group">
          <label>패스워드 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* 기관명 입력란 */}
        <div className="signup-input-group">
          <label>기관명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {/* 회원가입 제출 버튼 */}
        <button type="submit">회원가입</button>
      </form>
      </div>
    </div>
  );
};

export default SignupPage;