import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getToken } from '../utils/auth';
import NavBar from '../component/NavBar';
import './ReportDetailPage.css';

const ReportDetailPage = () => {
  const { id } = useParams(); // URL에서 report ID 가져오기
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      const token = getToken();

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/report/getdetail/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'emergency-user-token': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }

        const data = await response.json();
        setReport(data.report);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching report details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <NavBar />
      <h1>상세 정보</h1>
      <div className="report-detail-container">
        {report && (
          <div className="report-detail-cards">
            <div className="report-detail-card">
              <p><strong>주소:</strong> {report.patientLocation}</p>
            </div>
            <div className="report-detail-card">
              <p><strong>증상:</strong> {report.symptom}</p>
            </div>
            <div className="report-detail-card">
              <p><strong>증상 검사결과:</strong> {report.isSevere ? '중증' : '경증'}</p>
            </div>
            <div className="report-detail-card">
              <p><strong>신고일시:</strong> {new Date(report.isCreated).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailPage;