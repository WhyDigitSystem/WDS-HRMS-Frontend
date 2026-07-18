// src/components/Dashboard/TimeDeficitCompensation.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    LinearProgress,
    CircularProgress
} from '@mui/material';

import {
    InfoOutlined,
    ErrorOutline,
    CheckCircleOutline,
    WarningAmberOutlined
} from '@mui/icons-material';
import apiCalls from 'apicall';

const CardBox = ({ children, bg, borderColor }) => (
    <Box
        sx={{
            p: 1.8,
            borderRadius: '18px',
            background: bg,
            border: `1px solid ${borderColor}`,
            minHeight: 135,
            transition: '0.25s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            },
        }}
    >
        {children}
    </Box>
);

const Row = ({ label, value, valueColor }) => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 0.9,
            borderBottom: '1px dashed rgba(148,163,184,0.25)',
        }}
    >
        <Typography
            sx={{
                fontSize: '0.82rem',
                color: '#475569',
                fontWeight: 600,
            }}
        >
            {label}
        </Typography>

        <Typography
            sx={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: valueColor || '#0f172a',
            }}
        >
            {value}
        </Typography>
    </Box>
);

const TimeDeficitCompensation = () => {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [deficitHours, setDeficitHours] = useState('00h 00m');
    const [extraHours, setExtraHours] = useState('00h 00m');
    const [progress, setProgress] = useState(0);
    const [remainingDeficit, setRemainingDeficit] = useState('00h 00m');
    const [currentMonthExtra, setCurrentMonthExtra] = useState('00h 00m');

    // Helper function to convert hours to minutes
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
        }
        return 0;
    };

    // Helper function to convert minutes to HHh MMm format
    const minutesToTime = (minutes) => {
        const hours = Math.floor(Math.abs(minutes));
        const mins = Math.floor((Math.abs(minutes) % 1) * 60);
        const sign = minutes < 0 ? '-' : '';
        return `${sign}${hours}h ${mins}m`;
    };

    // Parse hours from string like "194:16:37" to total hours
    const parseHours = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0]) + parseInt(parts[1]) / 60 + parseInt(parts[2]) / 3600;
        }
        return 0;
    };

    // Format hours to HHh MMm
    const formatHours = (hours) => {
        const h = Math.floor(Math.abs(hours));
        const m = Math.floor((Math.abs(hours) % 1) * 60);
        return `${h}h ${m}m`;
    };

    useEffect(() => {
        if (orgId && employeeCode) {
            fetchDashboardData();
        }
    }, [orgId, employeeCode]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const result = await apiCalls('get', `/newdashboard/getLastMonthSummaryDashboard?employeecode=${employeeCode}&orgId=${orgId}`);

            if (result?.status && result?.paramObjectsMap?.attendanceDashboard?.length > 0) {
                const data = result.paramObjectsMap.attendanceDashboard[0];
                setDashboardData(data);

                // Calculate deficit hours (if any)
                const expected = parseHours(data.expected_working_hours);
                const actual = parseHours(data.actual_worked_hours);

                let deficit = 0;
                let extra = 0;

                if (actual < expected) {
                    deficit = expected - actual;
                    extra = 0;
                } else {
                    deficit = 0;
                    extra = actual - expected;
                }

                setDeficitHours(formatHours(deficit));
                setExtraHours(formatHours(extra));
                setRemainingDeficit(data.missing_hours !== "00:00:00" ? formatHours(parseHours(data.missing_hours)) : '00h 00m');
                setCurrentMonthExtra(data.current_month_extra_hours ? formatHours(parseHours(data.current_month_extra_hours)) : '00h 00m');

                // Calculate progress for this month (example: 35% progress)
                // You can adjust this based on actual data
                const daysPassed = new Date().getDate();
                const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                const monthProgress = (daysPassed / daysInMonth) * 100;
                setProgress(Math.min(100, Math.max(0, monthProgress)));

            } else {
                console.error('No dashboard data found');
                setDashboardData(null);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Determine status message based on deficit and extra hours
    const getStatusMessage = () => {
        const deficitMinutes = parseHours(dashboardData?.missing_hours || '00:00:00');
        const extraMinutes = parseHours(dashboardData?.current_month_extra_hours || '00:00:00');
        const totalExtra = parseHours(extraHours);

        // Case 1: Has deficit remaining
        if (deficitMinutes > 0) {
            return {
                icon: <ErrorOutline sx={{ color: '#ef4444', fontSize: 18, mt: 0.1 }} />,
                title: "⚠️ Deficit Alert!",
                message: `You have ${formatHours(deficitMinutes)} deficit remaining to compensate this month.`,
                subMessage: "Please work extra hours to clear this deficit.",
                color: "#ef4444",
                bgGradient: "linear-gradient(180deg,#ffffff 0%,#fef2f2 100%)",
                borderColor: "#fecaca"
            };
        }

        // Case 2: Has extra hours worked this month
        else if (extraMinutes > 0) {
            return {
                icon: <CheckCircleOutline sx={{ color: '#22c55e', fontSize: 18, mt: 0.1 }} />,
                title: "🎉 Excellent Performance!",
                message: `You've worked ${formatHours(extraMinutes)} extra hours this month.`,
                subMessage: "Keep up the great work! These hours will be carried forward as compensation.",
                color: "#22c55e",
                bgGradient: "linear-gradient(180deg,#ffffff 0%,#f0fdf4 100%)",
                borderColor: "#bbf7d0"
            };
        }

        // Case 3: Has total extra from previous months
        else if (totalExtra > 0) {
            return {
                icon: <InfoOutlined sx={{ color: '#3b82f6', fontSize: 18, mt: 0.1 }} />,
                title: "Compensation Balance Available",
                message: `You have ${formatHours(totalExtra)} extra hours in your compensation bank.`,
                subMessage: "You can use these for time-off or future adjustments.",
                color: "#3b82f6",
                bgGradient: "linear-gradient(180deg,#ffffff 0%,#eff6ff 100%)",
                borderColor: "#bfdbfe"
            };
        }

        // Case 4: On track with no deficit and no extra
        else {
            return {
                icon: <InfoOutlined sx={{ color: '#64748b', fontSize: 18, mt: 0.1 }} />,
                title: "On Track",
                message: "You're meeting your required working hours.",
                subMessage: "Continue maintaining this balance.",
                color: "#64748b",
                bgGradient: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
                borderColor: "#e2e8f0"
            };
        }
    };

    if (loading) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                }}
            >
                <CircularProgress size={40} />
                <Typography sx={{ mt: 2, color: '#64748b' }}>
                    Loading time deficit data...
                </Typography>
            </Paper>
        );
    }

    const status = getStatusMessage();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            }}
        >
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography
                    sx={{
                        fontSize: '1.12rem',
                        fontWeight: 800,
                        color: '#0f172a',
                    }}
                >
                    Time Deficit & Compensation
                </Typography>
            </Box>

            {/* Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        lg: 'repeat(4, 1fr)',
                    },
                    gap: 1.8,
                }}
            >
                {/* Card 1 - Last Month Summary */}
                <CardBox
                    bg="linear-gradient(180deg,#ffffff 0%,#f0fdf4 100%)"
                    borderColor="#bbf7d0"
                >
                    <Typography
                        sx={{
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            color: '#166534',
                            mb: 1,
                        }}
                    >
                        Last Month Summary
                    </Typography>

                    <Row
                        label="Required Hours"
                        value={dashboardData ? formatHours(parseHours(dashboardData.expected_working_hours)) : '0h 00m'}
                    />

                    <Row
                        label="Actual Hours"
                        value={dashboardData ? formatHours(parseHours(dashboardData.actual_worked_hours)) : '0h 00m'}
                    />

                    <Row
                        label="Extra Hours"
                        value={extraHours}
                        valueColor="#22c55e"
                    />
                    <Row
                        label="Deficit Hours"
                        value={deficitHours}
                        valueColor="#ef4444"
                    />
                </CardBox>

                {/* Card 2 - Carry Forward */}
                <CardBox
                    bg="linear-gradient(180deg,#ffffff 0%,#f5f3ff 100%)"
                    borderColor="#ddd6fe"
                >
                    <Typography
                        sx={{
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            color: '#6d28d9',
                            mb: 1.2,
                        }}
                    >
                        Carry Forward
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            fontWeight: 700,
                            textAlign: 'center',
                            mt: 3,
                            mb: 1,
                        }}
                    >
                        Previous Month {'Deficit'}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '1.7rem',
                            fontWeight: 900,
                            color: deficitHours !== '0h 0m' ? '#ef4444' : '#22c55e',
                            textAlign: 'center',
                            lineHeight: 1,
                        }}
                    >
                        {deficitHours !== '0h 0m' ? deficitHours : '00h 00m'}
                    </Typography>

                    {deficitHours !== '0h 0m' && (
                        <>
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    fontSize: '1rem',
                                    color: '#ef4444',
                                    my: 0.4,
                                }}
                            >
                                {'↓'}
                            </Typography>

                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    fontSize: '0.72rem',
                                    color: '#64748b',
                                    fontWeight: 700,
                                }}
                            >
                                {'Carried to this month'}
                            </Typography>
                        </>
                    )}

                    {deficitHours === '0h 0m' && extraHours !== '0h 0m' && (
                        <>
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    color: '#22c55e',
                                    fontWeight: 700,
                                    mt: 1,
                                }}
                            >
                                ✓ No deficit carried forward
                            </Typography>
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    fontSize: '0.7rem',
                                    color: '#64748b',
                                    mt: 0.5,
                                }}
                            >
                                {extraHours} extra banked
                            </Typography>
                        </>
                    )}
                </CardBox>

                {/* Card 3 - This Month Progress */}
                <CardBox
                    bg="linear-gradient(180deg,#ffffff 0%,#eff6ff 100%)"
                    borderColor="#bfdbfe"
                >
                    <Typography
                        sx={{
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            color: '#2563eb',
                            mb: 1.2,
                        }}
                    >
                        This Month Progress
                    </Typography>

                    <Box display="flex" justifyContent="space-between" mb={0.8}>
                        <Typography
                            sx={{
                                fontSize: '0.82rem',
                                color: '#475569',
                                fontWeight: 700,
                                mt: 2
                            }}
                        >
                            Worked Extra Hours
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: '0.85rem',
                                color: parseHours(currentMonthExtra) > 0 ? '#22c55e' : '#64748b',
                                fontWeight: 800,
                                mt: 2
                            }}
                        >
                            {currentMonthExtra}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography
                            sx={{
                                fontSize: '0.82rem',
                                color: '#475569',
                                fontWeight: 700,
                            }}
                        >
                            Deficit Remaining
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: '0.85rem',
                                color: parseHours(remainingDeficit) > 0 ? '#ef4444' : '#22c55e',
                                fontWeight: 800,
                            }}
                        >
                            {remainingDeficit}
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 7,
                            borderRadius: 20,
                            backgroundColor: '#dbeafe',
                            mb: 1.3,
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 20,
                                background: parseHours(remainingDeficit) > 0
                                    ? 'linear-gradient(90deg,#ef4444,#f97316)'
                                    : 'linear-gradient(90deg,#22c55e,#10b981)',
                            },
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: '0.78rem',
                            color: '#334155',
                            fontWeight: 700,
                            lineHeight: 1.5,
                        }}
                    >
                        {parseHours(remainingDeficit) > 0 ? (
                            <>Complete <Box component="span" sx={{ color: '#ef4444', fontWeight: 900 }}>{remainingDeficit}</Box> extra hours this month to clear deficit</>
                        ) : parseHours(currentMonthExtra) > 0 ? (
                            <>Great job! You've earned <Box component="span" sx={{ color: '#22c55e', fontWeight: 900 }}>{currentMonthExtra}</Box> extra hours this month</>
                        ) : (
                            <>Work extra hours to build your compensation balance</>
                        )}
                    </Typography>
                </CardBox>

                {/* Card 4 - Status - Dynamic based on data */}
                <CardBox
                    bg={status.bgGradient}
                    borderColor={status.borderColor}
                >
                    <Typography
                        sx={{
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            color: status.color,
                            mb: 1.2,
                        }}
                    >
                        Status
                    </Typography>

                    <Box
                        sx={{
                            background: 'rgba(255,255,255,0.7)',
                            border: `1px solid ${status.borderColor}`,
                            borderRadius: '12px',
                            p: 1.3,
                            display: 'flex',
                            gap: 1,
                            alignItems: 'flex-start',
                            backdropFilter: 'blur(10px)',
                            mt: 2
                        }}
                    >
                        {status.icon}

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    color: '#111827',
                                    mb: 0.4,
                                    lineHeight: 1.4,
                                }}
                            >
                                {status.title}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: '0.73rem',
                                    color: '#475569',
                                    lineHeight: 1.5,
                                    fontWeight: 600,
                                    mb: 0.3,
                                }}
                            >
                                {status.message}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: '0.7rem',
                                    color: '#64748b',
                                    lineHeight: 1.4,
                                    fontWeight: 500,
                                }}
                            >
                                {status.subMessage}
                            </Typography>
                        </Box>
                    </Box>
                </CardBox>
            </Box>
        </Paper>
    );
};

export default TimeDeficitCompensation;