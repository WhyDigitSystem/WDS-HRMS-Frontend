import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Rating,
    TextField,
    Button,
    Divider,
    Paper,
    Chip,
    Autocomplete,
    CircularProgress,
    Snackbar,
    Alert,
    FormControl
} from '@mui/material';
import {
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    RateReview as FeedbackIcon,
    Work as WorkIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ExitInterviewManagement = () => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchCode');
    const branch = localStorage.getItem('branch');
    const loginUserName = localStorage.getItem('userName');

    // Fetch employees from API
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await apiCalls('get', `/employeseparation/getInitiateSeparationByOrgId?branchCode=${branchCode}&orgId=${orgId}`);

            if (response.status === true && response.paramObjectsMap && response.paramObjectsMap.initiateSeparationVO) {
                const employeeList = response.paramObjectsMap.initiateSeparationVO.map((emp) => ({
                    id: emp.id,
                    employeeCode: emp.employeeCode,
                    employeeName: emp.employeeName,
                    department: emp.department,
                    position: emp.position,
                    reportingManager: emp.reportingPerson,
                    joiningDate: emp.joiningDate,
                    separationType: emp.separationType,
                    name: `${emp.employeeName} (${emp.employeeCode})`,
                    originalData: emp
                }));
                setEmployees(employeeList);
            } else {
                console.error('No data found in response');
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
            showSnackbar('Error fetching employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSubmit = async () => {
        if (!selectedEmployee || !interviewDate || !rating || !feedback.trim()) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                id: selectedEmployee.id, // Main record ID for update
                branch: branch || "",
                branchCode: branchCode,
                clearanceManagementDTO: selectedEmployee.originalData?.clearanceManagementVO || [],
                createdBy: loginUserName,
                department: selectedEmployee.department,
                detailedReason: selectedEmployee.originalData?.detailedReason || "",
                employeeCode: selectedEmployee.employeeCode,
                employeeName: selectedEmployee.employeeName,
                exitInterviewFeedback: feedback,
              interviewDate: dayjs(interviewDate, 'YYYY-MM-DD', true).isValid()
  ? interviewDate
  : '',
                // interviewDate: interviewDate
                joiningDate: selectedEmployee.joiningDate,
                lastWorkingDate: selectedEmployee.originalData?.lastWorkingDate || "",
                noticeDate: selectedEmployee.originalData?.noticeDate || 0,
                orgId: parseInt(orgId),
                position: selectedEmployee.position,
                reasonCategory: selectedEmployee.originalData?.reasonCategory || "",
                rehireEligible: selectedEmployee.originalData?.rehireEligible || "Yes",
                reportingPerson: selectedEmployee.reportingManager,
                reportingPersonCode: selectedEmployee.originalData?.reportingPersonCode || "",
                reportingPersonEmail: selectedEmployee.originalData?.reportingPersonEmail || "",
                resignation: selectedEmployee.originalData?.resignation || "",
                separationType: selectedEmployee.separationType,
                updatedBy: loginUserName,
                status: 'APPROVED'
            };

            console.log('Saving exit interview data:', payload);

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                showSnackbar('Exit interview completed successfully!', 'success');
                // Reset form after successful submission
                setSelectedEmployee(null);
                setInterviewDate('');
                setRating(0);
                setFeedback('');
                // Refresh employee data
                fetchEmployees();
            } else {
                showSnackbar(response.message || 'Failed to save exit interview', 'error');
            }
        } catch (error) {
            console.error('Error saving exit interview:', error);
            showSnackbar('Error saving exit interview', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEmployeeSelect = (event, newValue) => {
        setSelectedEmployee(newValue);
        // Reset form when employee changes
        if (!newValue) {
            setInterviewDate('');
            setRating(0);
            setFeedback('');
        } else {
            // Pre-fill interview date with today's date
            setInterviewDate(new Date().toISOString().split('T')[0]);
            // Pre-fill rating and feedback if they exist in original data
            if (newValue.originalData) {
                setRating(newValue.originalData.experienceRating || 0);
                setFeedback(newValue.originalData.exitInterviewFeedback || '');
                if (newValue.originalData.interviewDate) {
                    setInterviewDate(newValue.originalData.interviewDate.split('T')[0]);
                }
            }
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const isFormValid = selectedEmployee && interviewDate && rating > 0 && feedback.trim();

    return (
        <Box sx={{ p: 0, maxWidth: 1200, margin: '0 auto' }}>
            {/* Employee Selection Card */}
            <Card sx={{ mb: 3, backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                        Select Employee for Exit Interview
                    </Typography>

                    <Autocomplete
                        options={employees}
                        getOptionLabel={(option) => option.name}
                        value={selectedEmployee}
                        onChange={handleEmployeeSelect}
                        loading={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search and Select Employee *"
                                placeholder="Type to search employees..."
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {option.name}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        sx={{
                            width: 300,
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                height: 36,
                                fontSize: '0.85rem',
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: '0.85rem',
                            },
                        }}
                    />

                    {selectedEmployee && (
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                            <Avatar
                                sx={{
                                    background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                                    mr: 2,
                                    width: 60,
                                    height: 60,
                                    color: '#fff',
                                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                                }}
                            >
                                <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                                    {selectedEmployee.employeeName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <WorkIcon sx={{ color: '#6b7280', mr: 1, fontSize: 18 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            {selectedEmployee.position}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={selectedEmployee.department}
                                        size="small"
                                        variant="outlined"
                                        sx={{ backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#2563eb' }}
                                    />
                                    <Chip
                                        label={selectedEmployee.separationType}
                                        size="small"
                                        variant="outlined"
                                        sx={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#166534' }}
                                    />
                                </Box>
                                {selectedEmployee.originalData?.lastWorkingDate && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Last Working Date: {new Date(selectedEmployee.originalData.lastWorkingDate).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {selectedEmployee && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        flexDirection: { xs: 'column', lg: 'row' },
                        mt: 2,
                        p: 1,
                    }}
                >
                    {/* ---------- Left Section: Interview Details & Rating ---------- */}
                    <Box sx={{ flex: 1, minWidth: 360 }}>
                        <Card
                            sx={{
                                mb: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                {/* Interview Date */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 1.5,
                                            fontWeight: 700,
                                            color: '#1e293b',
                                        }}
                                    >
                                        Interview Date *
                                    </Typography>
                                    <FormControl sx={{ width: 240 }} variant="outlined" size="small">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label={
                                                    <span>
                                                        Interview Date<span style={{ color: 'red' }}> *</span>
                                                    </span>
                                                }
                                                format="DD-MM-YYYY"
                                                value={interviewDate ? dayjs(interviewDate, 'DD-MM-YYYY') : null}
                                                
                                                onChange={(newValue) => {
                                                    const formattedDate = newValue ? dayjs(newValue).format('DD-MM-YYYY') : '';
                                                    setInterviewDate(formattedDate);
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true,
                                                        error: false,
                                                        helperText: '',
                                                        sx: {
                                                            '& .MuiInputBase-root': {
                                                                backgroundColor: '#f9fafb',
                                                                borderRadius: 2, // same rounded look
                                                                height: 38, // match your previous height
                                                                fontSize: '0.9rem',
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#94a3b8',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#94a3b8',
                                                            },
                                                            '& .Mui-disabled': {
                                                                backgroundColor: '#f9fafb',
                                                                color: '#334155',
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                padding: '6px 10px',
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ mt: 1, display: 'block' }}
                                    >
                                        Select the date when the exit interview was conducted
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Rating Section */}
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 2,
                                            fontWeight: 700,
                                            color: '#1e293b',
                                        }}
                                    >
                                        Overall Experience Rating *
                                    </Typography>
                                    <Rating
                                        name="experience-rating"
                                        value={rating}
                                        onChange={(event, newValue) => setRating(newValue)}
                                        sx={{
                                            fontSize: '2.6rem',
                                            mb: 1.5,
                                            '& .MuiRating-iconFilled': { color: '#f59e0b' }, // Changed to amber/orange
                                            '& .MuiRating-iconHover': { color: '#d97706' }, // Darker amber on hover
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            color: rating === 0 ? '#6b7280' : '#f59e0b', // Changed to amber
                                        }}
                                    >
                                        {rating === 0
                                            ? 'Please select a rating'
                                            : `${rating} star${rating > 1 ? 's' : ''}`}
                                    </Typography>
                                    {rating > 0 && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {rating <= 2
                                                ? 'Poor experience'
                                                : rating === 3
                                                    ? 'Average experience'
                                                    : rating === 4
                                                        ? 'Good experience'
                                                        : 'Excellent experience'}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* ---------- Right Section: Feedback Form ---------- */}
                    <Box sx={{ flex: 1.5, minWidth: 460 }}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 10px 32px rgba(0,0,0,0.08)',
                                },
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 3,
                                        gap: 1,
                                    }}
                                >
                                    <FeedbackIcon sx={{ color: '#2563eb', fontSize: 26 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        Exit Interview Feedback *
                                    </Typography>
                                </Box>

                                {/* Feedback Textarea */}
                                <TextField
                                    multiline
                                    fullWidth
                                    rows={10}
                                    placeholder="Write detailed feedback — reasons for leaving, positive experiences, and suggestions for improvement..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#fafafa',
                                            fontSize: '0.95rem',
                                            transition: '0.2s',
                                            '&:hover': { backgroundColor: '#f1f5f9' },
                                            '&.Mui-focused': {
                                                backgroundColor: '#fff',
                                                boxShadow: '0 0 0 3px rgba(37,99,235,0.15)',
                                            },
                                        },
                                    }}
                                />

                                {/* Keywords Chips */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ mb: 1, display: 'block' }}
                                    >
                                        Suggested topics to cover:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {[
                                            'Work experience',
                                            'Reasons for leaving',
                                            'Suggestions',
                                            'Team feedback',
                                            'Management feedback',
                                            'Company culture',
                                        ].map((label, i) => (
                                            <Chip
                                                key={i}
                                                label={label}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: '#e2e8f0',
                                                    color: '#475569',
                                                    fontSize: '0.75rem',
                                                    '&:hover': {
                                                        backgroundColor: '#f1f5f9',
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                {/* Submit Button */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        mt: 3,
                                        pt: 2,
                                        borderTop: '1px solid #e5e7eb',
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        onClick={handleSubmit}
                                        disabled={!isFormValid || saving}
                                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                                         sx={{
    background: "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
    color: "white",
    fontWeight: 600,
    px: 1,
    py: 0.55,
    borderRadius: 2,
    letterSpacing: "0.5px",
    fontSize: "14px",

    "&:hover": {
      transform: "scale(1.06)",
      background: "linear-gradient(135deg, #E100FF 0%, #7F00FF 100%)",
    },

    "&:active": {
      transform: "scale(0.97)",
    }
  }}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            )}

            {!selectedEmployee && (
                <Paper sx={{ p: 8, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                    <PersonIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        {loading ? 'Loading Employees...' : 'No Employee Selected'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {loading
                            ? 'Fetching employee data...'
                            : 'Please select an employee from the dropdown above to begin the exit interview process.'
                        }
                    </Typography>
                    {loading && <CircularProgress sx={{ mt: 2 }} />}
                </Paper>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ExitInterviewManagement;