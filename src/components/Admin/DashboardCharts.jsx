// src/components/Admin/DashboardCharts.jsx
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const DashboardCharts = ({ stats }) => {
    const userRolesData = [
        { name: '사용자', value: stats.users.byRole.users },
        { name: '구급대원', value: stats.users.byRole.doctors },
        { name: '관리자', value: stats.users.byRole.admins }
    ];

    const reportsData = [
        {
            name: '일일',
            중증: stats.reports.daily.severe,
            경증: stats.reports.daily.nonSevere
        },
        {
            name: '주간',
            중증: stats.reports.weekly.severe,
            경증: stats.reports.weekly.nonSevere
        },
        {
            name: '월간',
            중증: stats.reports.monthly.severe,
            경증: stats.reports.monthly.nonSevere
        }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        사용자 분포
                    </Typography>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={userRolesData}
                            cx={200}
                            cy={150}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {userRolesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        보고서 통계
                    </Typography>
                    <BarChart
                        width={400}
                        height={300}
                        data={reportsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="중증" fill="#FF8042" />
                        <Bar dataKey="경증" fill="#00C49F" />
                    </BarChart>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default DashboardCharts;