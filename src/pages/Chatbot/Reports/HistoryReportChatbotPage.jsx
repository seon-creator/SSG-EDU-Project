// src/pages/HistoryReportPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { reportChatBotApi } from '../../../utils/api';
import './HistoryReportPage.css';

const HistoryReportChatbotPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-12-31');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const reportsPerPage = 12;

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportChatBotApi.getReports(
                startDate,
                endDate,
                1,
                reportsPerPage,
                sortBy,
                sortOrder
            );
            setReports(response.data.data.reports);
        } catch (err) {
            setError('데이터를 불러올 수 없습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, sortBy, sortOrder]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    return (
        <div className="history-page">
            <div className="history-header">
                <h1>보고서 기록</h1>
                <div className="filters">
                    <div className="date-range">
                        <div className="date-input">
                            <label>시작일:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="date-input">
                            <label>종료일:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="sort-controls">
                        <button
                            className={`sort-button ${sortBy === 'date' ? 'active' : ''}`}
                            onClick={() => handleSort('date')}
                        >
                            날짜 {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            className={`sort-button ${sortBy === 'severity' ? 'active' : ''}`}
                            onClick={() => handleSort('severity')}
                        >
                            심각도 {sortBy === 'severity' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-skeleton">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="skeleton-card" />
                    ))}
                </div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="reports-container">
                    <div className="reports-grid">
                        {reports.map((report) => (
                            <div key={report.id} className="report-card">
                                <div className="report-header">
                                    <span className={`severity-badge ${report.severity?.toLowerCase()}`}>
                                        {report.severity || '해당없음'}
                                    </span>
                                </div>
                                <div className="report-time">
                                    {new Date(report.timestamp).toLocaleDateString()}
                                </div>
                                <div className="report-content">
                                    <div className="report-field">
                                        <label>진단:</label>
                                        <p>{report.diagnosis || '없음'}</p>
                                    </div>
                                    <div className="report-field">
                                        <label>증상:</label>
                                        <p>{report.symptoms || '없음'}</p>
                                    </div>
                                    <div className="report-field">
                                        <label>권장사항:</label>
                                        <p>{report.advice || '없음'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryReportChatbotPage;