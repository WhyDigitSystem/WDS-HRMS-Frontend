// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import { Grid, Container, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import TodayAttendance from './TodayAttendance';
import PendingApprovalsSummary from './PendingApprovalsSummary';
import AnnouncementsCard from './AnnouncementsCard';
import QuickActionsRow from './QuickActionsRow';
import PerformanceOverview from './PerformanceOverview';
import TimeDeficitCompensation from './TimeDeficitCompensation';
import UpcomingEvents from './UpcomingEvents';

const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
}));

const Dashboard = () => {
    return (
        <StyledContainer maxWidth="xl">
            {/* Row 1: Today's Attendance + Pending Approvals + Announcements */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TodayAttendance />
                </Grid>
                <Grid item xs={12} md={4}>
                    <PendingApprovalsSummary />
                </Grid>
                <Grid item xs={12} md={4}>
                    <AnnouncementsCard />
                </Grid>
            </Grid>

            {/* Row 2: Quick Actions */}
            <Box sx={{ mt: 2 }}>
                <QuickActionsRow />
            </Box>

            {/* Row 3: Performance Overview - Full Row */}
            <Box sx={{ mt: 1 }}>
                <PerformanceOverview />
            </Box>

            {/* Row 4: Time Deficit - Full Row */}
            <Box sx={{ mt: 1 }}>
                <TimeDeficitCompensation />
            </Box>

            {/* Row 5: Upcoming Events - Full Width */}
            <Box sx={{ mt: 1.5 }}>
                <UpcomingEvents />
            </Box>
        </StyledContainer>
    );
};

export default Dashboard;