import React, { useState } from "react";
import axios from "axios";
import "./FindIdPage.css"; // Import the CSS

const FindUserId = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUserId(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/getId`,
        { email, firstName, lastName },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setUserId(response.data.data.userId);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="FindId-Page">
    <div className="find-id-container">
      <h2>아이디 찾기</h2>
      <form onSubmit={handleSubmit} className="find-id-form">
        <div className="find-id-input-group">
          <label>이메일:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="find-id-input-group">
          <label>이름:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="find-id-input-group">
          <label>성:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="find-id-submit-btn">아이디 찾기</button>
      </form>

      {userId && (
        <div className="find-id-message success">
          <strong>아이디: {userId}</strong>
        </div>
      )}
      {error && (
        <div className="find-id-message error">
          <strong>{error}</strong>
        </div>
      )}
    </div>
    </div>
  );
};

export default FindUserId;