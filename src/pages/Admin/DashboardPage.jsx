// src/pages/Admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { adminApi } from '../../utils/api';
import DashboardStats from '../../components/Admin/DashboardStats';
import DashboardCharts from '../../components/Admin/DashboardCharts';
import './DashboardPage.css';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getBasicStats();
            setStats(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return (
        <Box className="loading-container">
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box className="error-container">
            <Typography color="error">{error}</Typography>
        </Box>
    );

    if (!stats) return null;

    return (
        <Container maxWidth="lg" className="dashboard-container">
            <DashboardStats stats={stats} />
            <Box className="charts-container">
                <DashboardCharts stats={stats} />
            </Box>
        </Container>
    );
};

export default DashboardPage;