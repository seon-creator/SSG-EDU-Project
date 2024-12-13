import React, { useState } from 'react';
import { dailyReportApi } from '../../../utils/api';
import DateSelector from '../../../components/DateSelector';
import './ReportChatbotPage.css';

const ReportChatbotPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const fetchReport = async (date) => {
        setLoading(true);
        setError(null);
        const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
            .toISOString().split('T')[0];

        try {
            const response = await dailyReportApi.get(dateStr);
            if (response.data.message === '이 날짜에 메시지가 없습니다') {
                setReportData({ message: '이 날짜의 보고서가 없습니다' });
            } else {
                setReportData(response.data);
            }
        } catch (err) {
            setError('보고서를 가져올 수 없습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-container">
            <div className="report-header">
                <h1>챗봇 보고서</h1>
                <div className="date-selector-wrapper">
                    <DateSelector onDateSelect={fetchReport} />
                </div>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>보고서 로딩 중...</p>
                </div>
            )}

            {error && (
                <div className="error-container">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error}</p>
                </div>
            )}

            {reportData && !loading && (
                <div className="report-content">
                    {reportData.data ? (
                        <>
                            <div className="report-date">
                                <i className="far fa-calendar-alt"></i>
                                <h2>{formatDate(reportData.data.report.timestamp)}</h2>
                            </div>
                            <div className="report-grid">
                                <div className="report-card diagnosis">
                                    <div className="card-header">
                                        <i className="fas fa-stethoscope"></i>
                                        <h3>진단</h3>
                                    </div>
                                    <p>{reportData.data.report.diagnosis || '없음'}</p>
                                </div>

                                <div className="report-card symptoms">
                                    <div className="card-header">
                                        <i className="fas fa-notes-medical"></i>
                                        <h3>증상</h3>
                                    </div>
                                    <p>{reportData.data.report.symptoms || '없음'}</p>
                                </div>

                                <div className="report-card severity">
                                    <div className="card-header">
                                        <i className="fas fa-chart-line"></i>
                                        <h3>심각도</h3>
                                    </div>
                                    <p>{reportData.data.report.severity || '없음'}</p>
                                </div>

                                <div className="report-card advice">
                                    <div className="card-header">
                                        <i className="fas fa-comment-medical"></i>
                                        <h3>조언</h3>
                                    </div>
                                    <p>{reportData.data.report.advice || '없음'}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-data-container">
                            <i className="far fa-folder-open"></i>
                            <p>{reportData.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportChatbotPage;