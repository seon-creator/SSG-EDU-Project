import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import './ReportDetailPage.css';

const ReportDetailPage = () => {
  const { id } = useParams(); // URL에서 report ID 가져오기
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [updatedSymptom, setUpdatedSymptom] = useState('');
  const [updatedIsSevere, setUpdatedIsSevere] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      const token = getToken();

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/report/getdetail/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Bearer 토큰 형식으로 전달
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }

        const data = await response.json();
        setReport(data.report);
        setUpdatedSymptom(data.report.symptom); // 수정용 초기값 설정
        setUpdatedIsSevere(data.report.isSevere); // 수정용 초기값 설정
        setLoading(false);
      } catch (error) {
        console.error('Error fetching report details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleSave = async () => {
    const token = getToken();

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/report/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptom: updatedSymptom,
          isSevere: updatedIsSevere,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report details');
      }

      const data = await response.json();
      setReport(data.updatedReport); // 업데이트된 정보 반영
      setIsEditing(false); // 수정 모드 종료
    } catch (error) {
      console.error('Error updating report details:', error);
    }
  };

  const handleFindInstitution = () => {
    if (report.isSevere) {
      // 중증인 경우 /patient-status/Severe로 이동
      navigate('/patient-status/Severe', { state: { symptoms: report.symptom, address: report.patientLocation } });
    } else {
      // 경증인 경우 /patient-status/mild로 이동
      navigate('/patient-status/mild', { state: { symptoms: report.symptom, address: report.patientLocation } });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="ReportDetail-Page">
        <h1>상세 정보</h1>
        <div className="report-detail-container">
          {report && (
            <>
              {!isEditing ? (
                <>
                  <div className="report-detail-row">
                    <span className="report-detail-label">주소:</span>
                    <div className="report-detail-card">{report.patientLocation}</div>
                  </div>
                  <div className="report-detail-row">
                    <span className="report-detail-label">증상:</span>
                    <div className="report-detail-card">{report.symptom}</div>
                  </div>
                  <div className="report-detail-row">
                    <span className="report-detail-label">검사결과:</span>
                    <div className="report-detail-card">{report.isSevere ? '중증' : '경증'}</div>
                  </div>
                  <div className="report-detail-row">
                    <span className="report-detail-label">신고일시:</span>
                    <div className="report-detail-card">{new Date(report.isCreated).toLocaleString()}</div>
                  </div>
                  <div className="report-detail-buttons-container">
                    <button className="report-detail-edit-button" onClick={() => setIsEditing(true)}>
                      수정하기
                    </button>
                    <button className="report-detail-find-button" onClick={handleFindInstitution}>
                      의료기관 찾기
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="report-detail-row">
                    <span className="report-detail-label">증상:</span>
                    <textarea
                      className="report-detail-input"
                      type="text"
                      value={updatedSymptom}
                      onChange={(e) => setUpdatedSymptom(e.target.value)}
                    />
                  </div>
                  <div className="report-detail-row">
                    <span className="report-detail-label">검사결과:</span>
                    <select
                      className="report-detail-select"
                      value={updatedIsSevere ? '중증' : '경증'}
                      onChange={(e) => setUpdatedIsSevere(e.target.value === '중증')}
                    >
                      <option value="중증">중증</option>
                      <option value="경증">경증</option>
                    </select>
                  </div>
                  <div className="report-detail-buttons-container">
                    <button className="report-detail-save-button" onClick={handleSave}>
                      저장하기
                    </button>
                    <button className="report-detail-cancel-button" onClick={() => setIsEditing(false)}>
                      취소하기
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;