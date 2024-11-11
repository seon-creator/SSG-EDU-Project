import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate import
import { getToken } from '../utils/auth'; // For send user id
import { cities } from '../data/cities'; // cities 데이터 import
import NavBar from '../component/NavBar';  // 상단 메뉴바
import './EnterInfoPage.css';

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EnterInfoPage = () => {
  const [selectedCity, setSelectedCity] = useState(''); // 선택된 도시
  const [districts, setDistricts] = useState([]); // 선택된 도시에 따른 구 목록
  const [selectedDistrict, setSelectedDistrict] = useState(''); // 선택된 구
  const [details, setDetails] = useState(''); // 세부주소 입력 필드
  const [symptoms, setSymptoms] = useState(''); // 증상 입력 필드

  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate
  const isFormValid = selectedCity && selectedDistrict && details && symptoms;  // 버튼 활성화 목적

  // 도시 선택 핸들러
  const handleCityChange = (event) => {
    const city = event.target.value;
    setSelectedCity(city);
    if (cities[city]) {
      setDistricts(cities[city]);
    } else {
      setDistricts([]); // 도시 선택이 없을 경우 구 목록 초기화
    }
    setSelectedDistrict(''); // 구 초기화
  };

  // 구 선택 핸들러
  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  // 정보 등록 버튼 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = getToken();
  
    const address = `${selectedCity} ${selectedDistrict} ${details}`.trim();
    const status_str = symptoms;
  
    try {
      const response = await fetch(`${BACKEND_URL}/report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'emergency-user-token':token  // 인증 토큰
        },
        body: JSON.stringify({
          patientLocation: address,
          symptom: status_str,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Report가 성공적으로 생성되었습니다.');
        navigate('/patient-status', { state: { address, status_str } });
      } else {
        alert(data.message || 'Report 생성 실패');
      }
    } catch (error) {
      console.error('Report 생성 중 오류 발생:', error);
      alert('Report 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <NavBar />
    <div className="EnterInfo-container">
      {/* NavBar 추가 */}
      <div className="EnterInfo-content">
        <h1 className="EnterInfo-content-title">신속한 환자 상태 분류 및 병원 추천</h1>

        <form className="patient-info-form" onSubmit={handleSubmit}>
          <div className="address-group">

            <div className="city-input-pair">
              <label htmlFor="city">도시</label>
              <select id="city" value={selectedCity} onChange={handleCityChange}>
                <option value="">도시 선택</option>
                {Object.keys(cities).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="dis-input-pair">
              <label htmlFor="district">구</label>
              <select
                id="district"
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedCity}
              >
                <option value="">구 선택</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="detail-input-pair">
              <label htmlFor="details">세부주소</label>
              <input
                type="text"
                id="details"
                placeholder="세부 주소 입력"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
          </div>

          <div className="symptoms-input-group">
            <label htmlFor="symptoms">환자증상:</label>
            <textarea
              id="symptoms"
              rows="4"
              placeholder="증상 입력"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}></textarea>
          </div>

          <button 
            type="submit" 
            className={`btn submit-btn ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
            >정보 등록</button>
        </form>

      </div>
    </div>
    </div>
  );
};

export default EnterInfoPage;