// src/components/Dashboard/PerformanceOverview.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Box, LinearProgress, Skeleton,
    Button, Dialog, DialogTitle, DialogContent, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Divider, Avatar, Tooltip, Fade, Zoom, Card
} from '@mui/material';
import {
    TrendingUp,
    EventNote,
    AssignmentTurnedIn,
    AccessTime,
    Close,
    Visibility,
    Warning,
    CheckCircle,
    Schedule,
    EmojiEvents,
    TrendingDown,
    BeachAccess,
    WorkOff,
    Flag
} from '@mui/icons-material';
import apiCalls from 'apicall';

const AttendanceLine = ({ data }) => {
    const weeklyData = data ? [65, 75, 85, 70, 80, 90, data.totalDays > 20 ? 85 : 70] : [35, 65, 45, 75, 55, 85, 70];

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6, height: 32, mt: 1 }}>
            {weeklyData.map((height, i) => (
                <Tooltip key={i} title={`Week ${i + 1}: ${height}%`} arrow placement="top">
                    <Box
                        sx={{
                            flex: 1,
                            height: `${height / 2.5}px`,
                            background: `linear-gradient(180deg, #10b981 0%, ${height > 80 ? '#059669' : '#34d399'} 100%)`,
                            borderRadius: '6px 6px 0 0',
                            opacity: 0.85,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 1,
                                transform: 'translateY(-4px)',
                                filter: 'brightness(1.1)'
                            }
                        }}
                    />
                </Tooltip>
            ))}
        </Box>
    );
};

const MetricCard = ({ item, onViewDetails, onViewLeaveDetails }) => {
    const getProgressColor = (value, title) => {
        if (title === 'Late Logins') return value > 15 ? '#ef4444' : value > 5 ? '#f59e0b' : '#10b981';
        if (title === 'Leaves Taken') return value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#10b981';
        return '#3b82f6';
    };

    const getButtonHandler = () => {
        if (item.title === 'Late Attendance') {
            return onViewDetails;
        } else if (item.title === 'Leave Utilization') {
            return onViewLeaveDetails;
        }
        return null;
    };

    return (
        <Fade in timeout={300}>
            <Card
                elevation={0}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    p: 2,
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${item.bgColor || '#ffffff'} 0%, #ffffff 100%)`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    border: `1.5px solid ${item.color}20`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px -8px ${item.color}30`,
                        borderColor: `${item.color}40`,
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}60)`,
                    }
                }}
            >
                {/* Header */}
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: `${item.color}15`,
                                color: item.color,
                                borderRadius: '14px',
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                        >
                            {item.icon}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" sx={{
                                color: item.color,
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                fontSize: '0.65rem'
                            }}>
                                {item.category || 'Metric'}
                            </Typography>
                            <Typography sx={{
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: '#1e293b',
                                mt: 0.25
                            }}>
                                {item.title}
                            </Typography>
                        </Box>
                    </Box>

                    {item.hasButton && (
                        <Tooltip title="View detailed breakdown" arrow>
                            <Button
                                size="small"
                                onClick={getButtonHandler()}
                                variant="outlined"
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    color: item.color,
                                    borderColor: `${item.color}40`,
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: `${item.color}10`,
                                        borderColor: item.color,
                                    }
                                }}
                                endIcon={<Visibility sx={{ fontSize: 12 }} />}
                            >
                                Details
                            </Button>
                        </Tooltip>
                    )}
                </Box>

                {/* Main Value */}
                <Box mb={1}>
                    <Typography sx={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        lineHeight: 1,
                        color: item.color,
                        letterSpacing: '-1px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.5
                    }}>
                        {item.value}
                        {item.unit && (
                            <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>
                                {item.unit}
                            </Typography>
                        )}
                    </Typography>

                    <Typography sx={{
                        fontSize: '0.75rem',
                        color: '#475569',
                        fontWeight: 500,
                        mt: 0.5
                    }}>
                        {item.sub}
                    </Typography>
                </Box>
            </Card>
        </Fade>
    );
};

const PerformanceOverview = () => {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [branch] = useState(localStorage.getItem('branch'));

    const [isLoading, setIsLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState(null);
    const [leaveData, setLeaveData] = useState(null);
    const [lateLoginData, setLateLoginData] = useState(null);
    const [currentMonth, setCurrentMonth] = useState('');
    const [lateLoginDialogOpen, setLateLoginDialogOpen] = useState(false);
    const [lateLoginDetails, setLateLoginDetails] = useState([]);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [leaveDetails, setLeaveDetails] = useState([]);

    useEffect(() => {
        if (orgId && employeeCode) {
            fetchAllData();
        }
        setCurrentMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
    }, [orgId, employeeCode]);

    const fetchAllData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchAttendanceData(),
            fetchLeaveData(),
            fetchLateLoginData()
        ]);
        setIsLoading(false);
    };

    const fetchAttendanceData = async () => {
        try {
            const result = await apiCalls('get', `/newdashboard/getMonthlyAttendanceForDashBoard?branch=${branch}&department=ALL&employeeCode=${employeeCode}&orgId=${orgId}&type=Employee`);

            if (result?.status && result?.paramObjectsMap?.attendanceProcessVO?.length > 0) {
                const attendance = result.paramObjectsMap.attendanceProcessVO[0];
                const attendancePercentage = (parseFloat(attendance.salaryDays) / parseFloat(attendance.totalDays)) * 100;

                setAttendanceData({
                    totalDays: attendance.totalDays,
                    presentDays: attendance.salaryDays,
                    percentage: Math.round(attendancePercentage),
                    month: attendance.month,
                    year: attendance.year,
                    employeeName: attendance.employeeName
                });
            } else {
                setAttendanceData({
                    totalDays: 30,
                    presentDays: 0,
                    percentage: 0,
                    message: 'No attendance data found'
                });
            }
        } catch (err) {
            console.error('Error fetching attendance data:', err);
            setAttendanceData({
                totalDays: 30,
                presentDays: 0,
                percentage: 0,
                error: true
            });
        }
    };

    const fetchLeaveData = async () => {
        try {
            const result = await apiCalls('get', `/newdashboard/getLeaveTakenReport?employeecode=${employeeCode}&orgId=${orgId}`);

            if (result?.status && result?.paramObjectsMap?.leaveTakenReport?.length > 0) {
                const leave = result.paramObjectsMap.leaveTakenReport[0];
                const totalLeaves = (leave.CL || 0) + (leave['COMP-OFF'] || 0) + (leave.LOP || 0);
                const totalLeaveBalance = 18;
                const leavePercentage = (totalLeaves / totalLeaveBalance) * 100;

                // Prepare detailed leave breakdown for dialog
                const leaveBreakdown = [];

                if (leave.CL && leave.CL > 0) {
                    leaveBreakdown.push({
                        type: 'Casual Leave (CL)',
                        code: 'CL',
                        count: leave.CL,
                        icon: <BeachAccess sx={{ fontSize: 16 }} />,
                        color: '#10b981',
                        bgColor: '#d1fae5'
                    });
                }

                if (leave['COMP-OFF'] && leave['COMP-OFF'] > 0) {
                    leaveBreakdown.push({
                        type: 'Compensatory Off',
                        code: 'COMP-OFF',
                        count: leave['COMP-OFF'],
                        icon: <EventNote sx={{ fontSize: 16 }} />,
                        color: '#f59e0b',
                        bgColor: '#fed7aa'
                    });
                }

                if (leave.LOP && leave.LOP > 0) {
                    leaveBreakdown.push({
                        type: 'Loss of Pay (LOP)',
                        code: 'LOP',
                        count: leave.LOP,
                        icon: <WorkOff sx={{ fontSize: 16 }} />,
                        color: '#ef4444',
                        bgColor: '#fee2e2'
                    });
                }

                // Check for other leave types if they exist
                const otherLeaveTypes = ['EL', 'SL', 'ML', 'PL'];
                otherLeaveTypes.forEach(leaveType => {
                    if (leave[leaveType] && leave[leaveType] > 0) {
                        let leaveTypeName = '';
                        switch (leaveType) {
                            case 'EL': leaveTypeName = 'Earned Leave'; break;
                            case 'SL': leaveTypeName = 'Sick Leave'; break;
                            case 'ML': leaveTypeName = 'Maternity Leave'; break;
                            case 'PL': leaveTypeName = 'Paternity Leave'; break;
                            default: leaveTypeName = leaveType;
                        }
                        leaveBreakdown.push({
                            type: leaveTypeName,
                            code: leaveType,
                            count: leave[leaveType],
                            icon: <Flag sx={{ fontSize: 16 }} />,
                            color: '#8b5cf6',
                            bgColor: '#ede9fe'
                        });
                    }
                });

                setLeaveData({
                    cl: leave.CL || 0,
                    compOff: leave['COMP-OFF'] || 0,
                    lop: leave.LOP || 0,
                    totalLeaves: totalLeaves,
                    balance: totalLeaveBalance,
                    percentage: Math.round(leavePercentage),
                    employeeName: leave.employee,
                    leaveBreakdown: leaveBreakdown,
                    rawData: leave
                });
            } else {
                setLeaveData({
                    totalLeaves: 0,
                    balance: 18,
                    percentage: 0,
                    message: 'No leave data found',
                    leaveBreakdown: []
                });
            }
        } catch (err) {
            console.error('Error fetching leave data:', err);
            setLeaveData({
                totalLeaves: 0,
                balance: 18,
                percentage: 0,
                error: true,
                leaveBreakdown: []
            });
        }
    };

    const parseLateDates = (lateDatesString) => {
        if (!lateDatesString) return [];
        const dates = lateDatesString.split(', ');
        return dates.map(date => {
            const [datePart, timePart] = date.split(' (');
            return {
                date: datePart,
                time: timePart ? timePart.replace(')', '') : 'N/A'
            };
        });
    };

    const fetchLateLoginData = async () => {
        try {
            const result = await apiCalls('get', `/newdashboard/getLateLoginReportforDashBoard?branchcode=${branchCode || 'WDSBLR'}&employeecode=${employeeCode}&orgId=${orgId}`);

            if (result?.status && result?.paramObjectsMap?.lateCheckinReport?.length > 0) {
                const lateLogin = result.paramObjectsMap.lateCheckinReport[0];
                const totalWorkingDays = attendanceData?.totalDays || 24;
                const latePercentage = (lateLogin.lateCheckinCount / totalWorkingDays) * 100;

                const parsedDates = parseLateDates(lateLogin.lateDates);

                setLateLoginData({
                    count: lateLogin.lateCheckinCount || 0,
                    percentage: Math.round(latePercentage),
                    lateDates: lateLogin.lateDates || '',
                    employeeName: lateLogin.employee,
                    lateDetails: parsedDates
                });

                setLateLoginDetails(parsedDates);
            } else {
                setLateLoginData({
                    count: 0,
                    percentage: 0,
                    message: 'No late logins this month',
                    lateDetails: []
                });
                setLateLoginDetails([]);
            }
        } catch (err) {
            console.error('Error fetching late login data:', err);
            setLateLoginData({
                count: 0,
                percentage: 0,
                error: true,
                lateDetails: []
            });
            setLateLoginDetails([]);
        }
    };

    const handleViewLateLogins = () => {
        setLateLoginDialogOpen(true);
    };

    const handleViewLeaveDetails = () => {
        setLeaveDialogOpen(true);
    };

    const metrics = [
        {
            title: 'Attendance Rate',
            category: 'Core Metric',
            value: attendanceData ? `${attendanceData.percentage}%` : '0%',
            unit: '',
            sub: attendanceData ? `${attendanceData.presentDays} of ${attendanceData.totalDays} days present` : 'Loading...',
            color: '#059669',
            bgColor: '#ecfdf5',
            icon: <EventNote sx={{ fontSize: 20 }} />,
            progress: attendanceData?.percentage || 0,
            progressLabel: 'Attendance Rate',
            graph: true,
            data: attendanceData
        },
        {
            title: 'Leave Utilization',
            category: 'Leave Status',
            value: leaveData ? `${leaveData.totalLeaves}` : '0',
            unit: 'days',
            sub: leaveData ? 'Leave utilization for the Year' : 'Loading...',
            // sub: leaveData ? `${leaveData.totalLeaves} of ${leaveData.balance} days used` : 'Loading...',
            color: '#d97706',
            bgColor: '#fffbeb',
            icon: <AssignmentTurnedIn sx={{ fontSize: 20 }} />,
            progress: leaveData?.percentage || 0,
            progressLabel: 'Utilization Rate',
            graph: false,
            details: leaveData ? `📅 ${leaveData.cl || 0} CL | 🎁 ${leaveData.compOff || 0} COMP-OFF | ⚠️ ${leaveData.lop || 0} UNPAID` : null,
            hasButton: true,
            leaveBreakdown: leaveData?.leaveBreakdown || []
        },
        {
            title: 'Late Attendance',
            category: 'Punctuality',
            value: lateLoginData ? `${lateLoginData.count}` : '0',
            unit: 'times',
            sub: lateLoginData ? `${lateLoginData.count === 1 ? 'Day' : 'Days'} late this month` : 'Loading...',
            color: '#dc2626',
            bgColor: '#fef2f2',
            icon: <AccessTime sx={{ fontSize: 20 }} />,
            progress: lateLoginData?.percentage || 0,
            progressLabel: 'Late Rate',
            graph: false,
            hasButton: true,
            lateCount: lateLoginData?.count || 0,
            lateDetails: lateLoginData?.lateDetails || []
        },
    ];

    if (isLoading) {
        return (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Skeleton variant="text" width={200} height={32} />
                    <Skeleton variant="rounded" width={100} height={24} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {[1, 2, 3].map((i) => (
                        <Box key={i}>
                            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
                        </Box>
                    ))}
                </Box>
            </Paper>
        );
    }

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                }}
            >
                {/* Header */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: '#3b82f6', width: 48, height: 48, borderRadius: '16px' }}>
                            <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                                Performance Dashboard
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', mt: 0.25 }}>
                                Monthly performance metrics and analytics
                            </Typography>
                        </Box>
                    </Box>

                    <Chip
                        icon={<Schedule sx={{ fontSize: 14 }} />}
                        label={currentMonth}
                        sx={{
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 1,
                            '& .MuiChip-icon': { color: '#64748b' }
                        }}
                    />
                </Box>

                {/* Metrics Grid */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 3
                }}>
                    {metrics.map((metric, index) => (
                        <MetricCard
                            key={index}
                            item={metric}
                            onViewDetails={handleViewLateLogins}
                            onViewLeaveDetails={handleViewLeaveDetails}
                        />
                    ))}
                </Box>
            </Paper>

            {/* Late Login Details Dialog */}
            <Dialog
                open={lateLoginDialogOpen}
                onClose={() => setLateLoginDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: '28px',
                        overflow: 'hidden',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 25px 60px rgba(15,23,42,0.16)',
                    }
                }}
            >
                {/* Header */}
                <DialogTitle
                    sx={{
                        position: 'relative',
                        px: 2.5,
                        py: 2,
                        background:
                            'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    }}
                >
                    {/* Glow */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 140,
                            height: 140,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)',
                        }}
                    />

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        position="relative"
                        zIndex={1}
                    >
                        <Box display="flex" alignItems="center" gap={1.5}>
                            {/* Icon */}
                            <Box
                                sx={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.16)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AccessTime
                                    sx={{
                                        color: '#ffffff',
                                        fontSize: 24,
                                    }}
                                />
                            </Box>

                            {/* Title */}
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        lineHeight: 1.2,
                                        mb: 0.3,
                                    }}
                                >
                                    Late Attendance
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: '0.68rem',
                                        color: 'rgba(255,255,255,0.80)',
                                        fontWeight: 500,
                                    }}
                                >
                                    {currentMonth}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Close */}
                        <IconButton
                            onClick={() => setLateLoginDialogOpen(false)}
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: 'rgba(255,255,255,0.14)',
                                color: '#ffffff',

                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.22)',
                                }
                            }}
                        >
                            <Close sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                {/* Content */}
                <DialogContent sx={{ p: 2 }}>
                    {lateLoginDetails.length > 0 ? (
                        <>
                            {/* Summary Card */}
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: '18px',
                                    background:
                                        'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
                                    border: '1px solid #fecaca',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: '0.68rem',
                                            color: '#991b1b',
                                            fontWeight: 700,
                                            mb: 0.3,
                                        }}
                                    >
                                        Total Late Logins
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: '1.2rem',
                                            fontWeight: 800,
                                            color: '#dc2626',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {lateLoginDetails.length}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: '14px',
                                        bgcolor: '#fee2e2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Warning
                                        sx={{
                                            fontSize: 22,
                                            color: '#dc2626',
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Cards */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                }}
                            >
                                {lateLoginDetails.map((detail, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1.4,
                                            borderRadius: '18px',
                                            border: '1px solid #e2e8f0',
                                            background: '#ffffff',
                                            transition: 'all 0.2s ease',

                                            '&:hover': {
                                                borderColor: '#fca5a5',
                                                transform: 'translateY(-1px)',
                                                boxShadow:
                                                    '0 8px 20px rgba(220,38,38,0.08)',
                                            }
                                        }}
                                    >
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            {/* Left */}
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1.2}
                                            >
                                                {/* Number */}
                                                <Box
                                                    sx={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: '12px',
                                                        bgcolor: '#fef2f2',
                                                        color: '#dc2626',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {index + 1}
                                                </Box>

                                                {/* Details */}
                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            color: '#0f172a',
                                                            mb: 0.3,
                                                        }}
                                                    >
                                                        {detail.date}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.64rem',
                                                            color: '#64748b',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Login Time
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Time */}
                                            <Box
                                                sx={{
                                                    px: 1.2,
                                                    py: 0.6,
                                                    borderRadius: '12px',
                                                    bgcolor: '#fee2e2',
                                                    color: '#dc2626',
                                                    fontWeight: 700,
                                                    fontSize: '0.68rem',
                                                }}
                                            >
                                                {detail.time}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    ) : (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '24px',
                                    background:
                                        'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <AccessTime
                                    sx={{
                                        fontSize: 38,
                                        color: '#cbd5e1',
                                    }}
                                />
                            </Box>

                            <Typography
                                sx={{
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    color: '#334155',
                                    mb: 0.5,
                                }}
                            >
                                No Late Logins
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: '0.68rem',
                                    color: '#94a3b8',
                                }}
                            >
                                Perfect attendance this month 🎉
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Leave Utilization Details Dialog - Modern Glassmorphism Style */}
            <Dialog
                open={leaveDialogOpen}
                onClose={() => setLeaveDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '28px',
                        overflow: 'hidden',
                        bgcolor: '#ffffff',
                        boxShadow: '0 25px 60px rgba(15,23,42,0.18)',
                        border: '1px solid #e2e8f0',
                    }
                }}
            >
                {/* Header */}
                <DialogTitle
                    sx={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                        px: 2.5,
                        py: 2,
                        mb: 2
                    }}
                >
                    {/* Background Glow */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -30,
                            right: -30,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.10)',
                        }}
                    />

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        position="relative"
                        zIndex={1}
                    >
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.16)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AssignmentTurnedIn
                                    sx={{
                                        color: '#ffffff',
                                        fontSize: 22
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        lineHeight: 1.2,
                                        mb: 0.3,
                                    }}
                                >
                                    Leave Details
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: '0.68rem',
                                        color: 'rgba(255,255,255,0.80)',
                                        fontWeight: 500,
                                    }}
                                >
                                    {currentMonth}
                                </Typography>
                            </Box>
                        </Box>

                        <IconButton
                            onClick={() => setLeaveDialogOpen(false)}
                            size="small"
                            sx={{
                                color: '#ffffff',
                                bgcolor: 'rgba(255,255,255,0.12)',

                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.20)',
                                }
                            }}
                        >
                            <Close sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                {/* Content */}
                <DialogContent sx={{ p: 2 }}>
                    {leaveData && leaveData.totalLeaves > 0 ? (
                        <>
                            {/* Stats */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2,1fr)',
                                    gap: 1.2,
                                    mb: 2.2,
                                }}
                            >
                                {[
                                    {
                                        label: 'Used',
                                        value: leaveData.totalLeaves,
                                        color: '#d97706',
                                        bg: '#fff7ed',
                                    },
                                    // {
                                    //     label: 'Balance',
                                    //     value: leaveData.balance - leaveData.totalLeaves,
                                    //     color: '#059669',
                                    //     bg: '#ecfdf5',
                                    // },
                                    {
                                        label: 'Usage',
                                        value: `${leaveData.percentage}%`,
                                        color:
                                            leaveData.percentage > 70
                                                ? '#dc2626'
                                                : '#2563eb',
                                        bg:
                                            leaveData.percentage > 70
                                                ? '#fef2f2'
                                                : '#eff6ff',
                                    },
                                ].map((card, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1.3,
                                            borderRadius: '18px',
                                            background: card.bg,
                                            border: '1px solid #edf2f7',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '0.62rem',
                                                color: '#64748b',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                mb: 0.5,
                                            }}
                                        >
                                            {card.label}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: '1.15rem',
                                                fontWeight: 800,
                                                color: card.color,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {card.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Breakdown Header */}
                            <Typography
                                sx={{
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    color: '#334155',
                                    mb: 1.2,
                                }}
                            >
                                Leave Breakdown
                            </Typography>

                            {/* Leave Cards */}
                            {leaveData.leaveBreakdown &&
                                leaveData.leaveBreakdown.length > 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                    }}
                                >
                                    {leaveData.leaveBreakdown.map((leave, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                p: 1.4,
                                                borderRadius: '18px',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                transition: '0.2s ease',

                                                '&:hover': {
                                                    borderColor: `${leave.color}40`,
                                                    transform: 'translateY(-1px)',
                                                }
                                            }}
                                        >
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                mb={1}
                                            >
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: '10px',
                                                            bgcolor: `${leave.color}15`,
                                                            color: leave.color,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {leave.icon}
                                                    </Box>

                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                color: '#0f172a',
                                                            }}
                                                        >
                                                            {leave.type}
                                                        </Typography>

                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.62rem',
                                                                color: '#64748b',
                                                            }}
                                                        >
                                                            {leave.code}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Typography
                                                    sx={{
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        color: leave.color,
                                                    }}
                                                >
                                                    {leave.count} Day
                                                    {leave.count > 1 ? 's' : ''}
                                                </Typography>
                                            </Box>

                                            <LinearProgress
                                                variant="determinate"
                                                value={
                                                    (leave.count /
                                                        leaveData.totalLeaves) *
                                                    100
                                                }
                                                sx={{
                                                    height: 5,
                                                    borderRadius: 99,
                                                    bgcolor: `${leave.color}15`,

                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 99,
                                                        bgcolor: leave.color,
                                                    }
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography
                                    sx={{
                                        fontSize: '0.72rem',
                                        color: '#94a3b8',
                                        textAlign: 'center',
                                        py: 2,
                                    }}
                                >
                                    No leave records found
                                </Typography>
                            )}

                            {/* Footer Note */}
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 1.3,
                                    borderRadius: '16px',
                                    bgcolor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <CheckCircle
                                    sx={{
                                        fontSize: 16,
                                        color:
                                            leaveData.percentage > 70
                                                ? '#dc2626'
                                                : '#059669',
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontSize: '0.66rem',
                                        color: '#475569',
                                        lineHeight: 1.5,
                                        fontWeight: 500,
                                    }}
                                >
                                    {leaveData.percentage > 70
                                        ? 'High leave utilization detected.'
                                        : leaveData.percentage > 40
                                            ? 'Moderate leave usage this month.'
                                            : 'Good leave balance maintained.'}
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <Box
                                sx={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: '20px',
                                    bgcolor: '#f8fafc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1.5,
                                }}
                            >
                                <AssignmentTurnedIn
                                    sx={{
                                        fontSize: 34,
                                        color: '#cbd5e1',
                                    }}
                                />
                            </Box>

                            <Typography
                                sx={{
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    color: '#334155',
                                    mb: 0.5,
                                }}
                            >
                                No Leaves Taken
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: '0.68rem',
                                    color: '#94a3b8',
                                }}
                            >
                                Perfect attendance this month 🎉
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PerformanceOverview;