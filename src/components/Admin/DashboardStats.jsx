// src/components/Admin/DashboardStats.jsx
import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const DashboardStats = ({ stats }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            총 사용자
                        </Typography>
                        <Typography variant="h4">
                            {stats.users.total}
                        </Typography>
                        <Typography color="textSecondary">
                            일반인: {stats.users.byRole.users} |
                            구급대원: {stats.users.byRole.doctors} |
                            관리자: {stats.users.byRole.admins}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            오늘의 보고서
                        </Typography>
                        <Typography variant="h4">
                            {stats.reports.daily.total}
                        </Typography>
                        <Typography color="textSecondary">
                            중증: {stats.reports.daily.severe} |
                            경증: {stats.reports.daily.nonSevere}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            활성 채팅
                        </Typography>
                        <Typography variant="h4">
                            {stats.activeChats}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default DashboardStats;