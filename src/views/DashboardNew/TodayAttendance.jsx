// src/components/Dashboard/TodayAttendance.jsx

import React, { useState, useEffect } from 'react';
import {
    Paper,
    Box,
    Typography,
    Button,
    Chip,
    Avatar,
    Checkbox,
    FormControlLabel,
    Dialog
} from '@mui/material';

import {
    AccessTime,
    Login,
    Logout
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

// Updated StyledPaper with reduced height
const StyledPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    padding: theme.spacing(1.2),
    borderRadius: 22,
    minHeight: 220,
    maxHeight: 220,

    background: `
        linear-gradient(145deg, rgba(15,23,42,0.96), rgba(30,41,59,0.94)),
        radial-gradient(circle at top right, rgba(59,130,246,0.30), transparent 40%),
        radial-gradient(circle at bottom left, rgba(14,165,233,0.22), transparent 35%)
    `,

    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.08)',

    boxShadow: `
        0 10px 30px rgba(0,0,0,0.25),
        inset 0 1px 1px rgba(255,255,255,0.05)
    `,

    transition: 'all 0.35s ease',

    '& .MuiTypography-root': {
        color: '#ffffff',
    },

    '& .MuiChip-root': {
        color: '#ffffff',
    },

    '&::before': {
        content: '""',
        position: 'absolute',
        width: 180,
        height: 180,
        top: -80,
        right: -80,
        borderRadius: '50%',
        background: 'rgba(59,130,246,0.18)',
        filter: 'blur(20px)',
    },

    '&::after': {
        content: '""',
        position: 'absolute',
        width: 140,
        height: 140,
        bottom: -60,
        left: -60,
        borderRadius: '50%',
        background: 'rgba(14,165,233,0.14)',
        filter: 'blur(20px)',
    },

    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `
            0 16px 40px rgba(0,0,0,0.32),
            inset 0 1px 1px rgba(255,255,255,0.08)
        `,
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    padding: '3px 12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.7rem',
    background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
    color: '#fff',
    boxShadow: '0 3px 10px rgba(37, 99, 235, 0.35)',

    '&:hover': {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.45)',
    },
}));

const TodayAttendance = () => {
    // State variables from CheckinDetails
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [empcode] = useState(localStorage.getItem('employeeCode'));
    const [empName] = useState(localStorage.getItem('employeeName'));
    const [designation] = useState(localStorage.getItem('designation'));
    const [profileImage, setProfileImage] = useState('');
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [hoursWorked, setHoursWorked] = useState(null);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);
    const [reportingPersonMail, setReportingPersonMail] = useState('');
    const [reportingPerson, setReportingPerson] = useState('');
    const [reportingPersonCode, setReportingPersonCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isWorkFromHome, setIsWorkFromHome] = useState(false);
    const [isHybrid, setIsHybrid] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationAddress, setLocationAddress] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');

    // Calculate total hours worked
    const calculateTotalHours = () => {
        if (checkInTime && checkOutTime) {
            const start = new Date(checkInTime);
            const end = new Date(checkOutTime);
            const diffMs = end - start;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        }
        if (checkInTime && !checkOutTime) {
            const start = new Date(checkInTime);
            const now = new Date();
            const diffMs = now - start;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        }
        return '00h 00m';
    };

    // Format time for display
    const formatTime = (date) => {
        if (!date) return '--:--';
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get reporting person details
    const getReportingPerson = async () => {
        setLoading(true);
        try {
            const result = await apiCalls('get', `master/getAllEmployeeByOrgIdAndEmployeeCode?employeeCode=${empcode}&orgId=${orgId}`);

            if (result?.paramObjectsMap?.employeeVO?.length) {
                const employee = result.paramObjectsMap.employeeVO[0];
                setReportingPerson(employee?.reportnigPerson || '');
                setReportingPersonCode(employee?.reportningPersonCode || '');
                setReportingPersonMail(employee?.reportnigPersonEmail || '');
                setEmployeeEmail(employee?.email || '');
                setProfileImage(employee?.profileImage || '');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get company details for hybrid/WFH settings
    const getCompanyDetails = async () => {
        setLoading(true);
        try {
            const result = await apiCalls('get', `commonmaster/company/${orgId}`);

            if (result?.paramObjectsMap?.companyVO?.length) {
                const company = result.paramObjectsMap.companyVO[0];
                setIsHybrid(company.hybrid === true);
                setLatitude(company.latitude || null);
                setLongitude(company.longitude || null);
                setLocationAddress(company.locationAddress || '');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get check-in/out status
    const getCheckInOutStatus = async () => {
        try {
            const response = await apiCalls('get', `basicmaster/chkStatus/${empcode}`);
            if (response.status === true) {
                const employeeStatus = response.paramObjectsMap.EmployeeStatus;
                const status = employeeStatus.status;

                const today = new Date().toISOString().split('T')[0];
                const inTime = employeeStatus.firstCheckIn
                    ? new Date(`${today}T${employeeStatus.firstCheckIn}`)
                    : null;
                const outTime = employeeStatus.latestOut ? new Date(`${today}T${employeeStatus.latestOut}`) : null;

                if (status === 'In') {
                    setIsCheckedIn(true);
                    setCheckInTime(inTime);
                    localStorage.setItem('checkInTime', inTime?.toISOString());
                } else {
                    setIsCheckedIn(false);
                    if (inTime) setCheckInTime(inTime);
                    if (outTime) setCheckOutTime(outTime);
                    localStorage.removeItem('checkInTime');
                }
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    // Handle Check-In
    const handleCheckIn = async () => {
        const now = new Date();
        const saveCheckIN = {
            status: true,
            orgId,
            branch,
            branchCode,
            empcode,
            empName,
            email: employeeEmail,
            notify: reportingPerson,
            notifyCode: reportingPersonCode,
            notifyEmail: reportingPersonMail,
            latitude: latitude ?? 0,
            longitude: longitude ?? 0,
            locationAddress: locationAddress || '',
            workFromHome: isWorkFromHome ? 'YES' : 'NO'
        };

        try {
            const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);
            if (result.status === true) {
                showToast('success', 'Check-In Success');
                setCheckInTime(now);
                localStorage.setItem('checkInTime', now.toISOString());
                setIsCheckedIn(true);
                setCheckOutTime(null);
            } else {
                showToast('error', result.paramObjectsMap?.errorMessage || 'Check-In Failed');
            }
        } catch (err) {
            showToast('error', 'Check-In Failed');
        }
    };

    // Handle Check-Out
    const handleCheckOut = async () => {
        const checkOut = new Date();
        const saveCheckIN = {
            status: false,
            orgId,
            branch,
            branchCode,
            empcode,
            empName,
            email: employeeEmail,
            notify: reportingPerson,
            notifyCode: reportingPersonCode,
            notifyEmail: reportingPersonMail,
            latitude: latitude ?? 0,
            longitude: longitude ?? 0,
            locationAddress: locationAddress || '',
            workFromHome: isWorkFromHome ? 'YES' : 'NO'
        };

        try {
            const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);
            if (result.status === true) {
                showToast('success', 'Check-Out Success');
                setIsCheckedIn(false);
                setCheckOutTime(checkOut);

                if (checkInTime) {
                    const start = new Date(checkInTime);
                    const diffMs = checkOut - start;
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    setHoursWorked(`${hours} hours ${minutes} minutes`);
                }

                localStorage.removeItem('checkInTime');
            } else {
                showToast('error', result.paramObjectsMap?.errorMessage || 'Check-Out Failed');
            }
        } catch (err) {
            showToast('error', 'Check-Out Failed');
        }
    };

    // Load initial data
    useEffect(() => {
        getCheckInOutStatus();
        getReportingPerson();
        getCompanyDetails();
    }, []);

    const isCheckedOut = checkOutTime !== null && !isCheckedIn;

    return (
        <>
            <StyledPaper elevation={0}>
                {/* Header with Profile Avatar - Compact */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.8}
                >
                    <Box display="flex" alignItems="center" gap={0.8}>
                        <Avatar
                            src={profileImage ? `data:image/png;base64,${profileImage}` : null}
                            onClick={() => setOpenProfileDialog(true)}
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: 'rgba(56,189,248,0.12)',
                                color: '#38bdf8',
                                border: `1.5px solid ${isCheckedIn ? '#4caf50' : isCheckedOut ? '#f44336' : '#38bdf8'}`,
                                cursor: 'pointer'
                            }}
                        >
                            {!profileImage && <AccessTime sx={{ fontSize: 14 }} />}
                        </Avatar>

                        <Box display="flex" flexDirection="column">
                            <Typography
                                sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    lineHeight: 1.2
                                }}
                            >
                                {empName || 'Employee Name'}
                            </Typography>
                            <Typography
                                sx={{
                                    opacity: 0.65,
                                    fontSize: '0.55rem',
                                    color: '#cbd5e1',
                                    mt: 0.2
                                }}
                            >
                                {empcode} - {designation}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Total Hours Highlight - Compact */}
                <Box
                    sx={{
                        p: 0.8,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        mb: 0.8,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            opacity: 0.7,
                            fontSize: '0.6rem',
                            display: 'block',
                            mb: 0.2
                        }}
                    >
                        Total Working Hours
                    </Typography>

                    <Typography
                        fontWeight={800}
                        sx={{
                            color: '#38bdf8 !important',
                            letterSpacing: 0.5,
                            fontSize: '1rem'
                        }}
                    >
                        {hoursWorked ? hoursWorked.split(' ').slice(0, 2).join(' ') : calculateTotalHours()}
                    </Typography>
                </Box>

                {/* Check In / Out Cards - Compact */}
                <Box display="flex" gap={0.8}>
                    <Box
                        flex={1}
                        sx={{
                            p: 0.7,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.65,
                                fontSize: '0.6rem'
                            }}
                        >
                            Check-in
                        </Typography>

                        <Typography
                            fontWeight={700}
                            sx={{
                                mt: 0.2,
                                fontSize: '0.9rem',
                                color: checkInTime ? '#4ade80 !important' : '#cbd5e1'
                            }}
                        >
                            {formatTime(checkInTime)}
                        </Typography>
                    </Box>

                    <Box
                        flex={1}
                        sx={{
                            p: 0.7,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.65,
                                fontSize: '0.6rem'
                            }}
                        >
                            Check-out
                        </Typography>

                        <Typography
                            fontWeight={700}
                            sx={{
                                mt: 0.2,
                                fontSize: '0.9rem',
                                color: checkOutTime ? '#4ade80' : '#cbd5e1'
                            }}
                        >
                            {formatTime(checkOutTime)}
                        </Typography>
                    </Box>
                </Box>

                {/* WFH Checkbox (if hybrid enabled) - Compact */}
                {isHybrid && (
                    <Box sx={{ mt: 0.5 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isWorkFromHome}
                                    onChange={(e) => setIsWorkFromHome(e.target.checked)}
                                    size="small"
                                    sx={{
                                        color: 'rgba(255,255,255,0.7)',
                                        '&.Mui-checked': {
                                            color: '#38bdf8'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: 16
                                        }
                                    }}
                                />
                            }
                            label="Work From Home"
                            sx={{
                                color: 'white',
                                '& .MuiTypography-root': {
                                    color: 'white',
                                    fontSize: '0.65rem'
                                }
                            }}
                        />
                    </Box>
                )}

                {/* Bottom Actions - Compact */}
                <Box
                    mt={1.5}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                >
                    {!isCheckedIn ? (
                        <ActionButton
                            variant="contained"
                            onClick={handleCheckIn}
                            startIcon={<Login sx={{ fontSize: 14 }} />}
                            disabled={loading}
                        >
                            Check In
                        </ActionButton>
                    ) : !isCheckedOut ? (
                        <ActionButton
                            variant="contained"
                            onClick={handleCheckOut}
                            startIcon={<Logout sx={{ fontSize: 14 }} />}
                            disabled={loading}
                        >
                            Check Out
                        </ActionButton>
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#38bdf8',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.7rem'
                            }}
                        >
                            View Attendance →
                        </Typography>
                    )}
                </Box>
            </StyledPaper>

            {/* Profile Image Dialog */}
            <Dialog
                open={openProfileDialog}
                onClose={() => setOpenProfileDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }
                }}
            >
                <Box
                    component="img"
                    src={profileImage ? `data:image/png;base64,${profileImage}` : null}
                    alt="Profile"
                    onClick={() => setOpenProfileDialog(false)}
                    sx={{
                        width: 250,
                        height: 250,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        cursor: 'pointer'
                    }}
                />
            </Dialog>
        </>
    );
};

export default TodayAttendance;