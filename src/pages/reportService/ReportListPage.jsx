import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { cities } from '../../data/cities'; // 도시와 구 데이터 import
import './ReportListPage.css';

const ReportListPage = () => {
  const navigate = useNavigate();   // 페이지 이동 모듈
  const [reports, setReports] = useState([]);   // 신고 목록
  const [loading, setLoading] = useState(true); // 로딩 상태 성공유무
  const [error, setError] = useState(null);     // 에러 상태 확인
  const [isNewestFirst, setIsNewestFirst] = useState(true);   // 기본 정렬: 최신순
  const [selectedCity, setSelectedCity] = useState('전체');    // 정렬기준: 도시
  const [selectedDistrict, setSelectedDistrict] = useState('전체'); // 정렬기준: 구

  useEffect(() => {
    const fetchReports = async () => {
      const token = getToken();

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/report/getlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Bearer 토큰 형식으로 전달
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.reports);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // 정렬 상태 설정
  const setSortOrder = (order) => {
    setIsNewestFirst(order === 'newest');
  };

  // 도시 필터 변경 이벤트
  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    setSelectedDistrict('전체'); // 도시 변경 시 구를 전체로 리셋
  };
  // 구 필터 변경 이벤트
  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  // 클릭 시 상세 페이지로 이동
  const handleReportClick = (id) => {
    navigate(`/report-list/${id}`);
  };

  // 정렬 및 필터링된 리스트 생성
  const filteredReports = reports
    .filter((report) => {
      const cityMatch = selectedCity === '전체' || report.patientLocation.includes(selectedCity);
      const districtMatch = selectedDistrict === '전체' || report.patientLocation.includes(selectedDistrict);
      return cityMatch && districtMatch;
    })
    .sort((a, b) => {
      return isNewestFirst
        ? new Date(b.isCreated) - new Date(a.isCreated)
        : new Date(a.isCreated) - new Date(b.isCreated);
    });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="report-list-page">
        <div className="report-list-container">
          <div className="filter-section">
            <div className="sort-buttons">
              <span>정렬 기준: </span>
              <button
                onClick={() => setSortOrder('newest')}
                className={isNewestFirst ? 'active' : ''}
              >
                최신순
              </button>
              <button
                onClick={() => setSortOrder('oldest')}
                className={!isNewestFirst ? 'active' : ''}
              >
                오래된 순
              </button>
            </div>
            <div className="city-district-filters">
              <label>도시: </label>
              <select value={selectedCity} onChange={handleCityChange}>
                <option value="전체">전체</option>
                {Object.keys(cities).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <label>구: </label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={selectedCity === '전체'}
              >
                <option value="전체">전체</option>
                {selectedCity !== '전체' &&
                  cities[selectedCity].map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className="report-list">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className="report-card"
                onClick={() => handleReportClick(report._id)}
              >
                <p>주소: {report.patientLocation}</p>
                <p>증상: {report.symptom}...</p>
                <p>신고일시: {new Date(report.isCreated).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportListPage;