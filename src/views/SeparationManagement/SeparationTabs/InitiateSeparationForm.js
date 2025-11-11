import React, { useState, useEffect } from 'react';
import {
    Grid,
    TextField,
    Box,
    Typography,
    Autocomplete,
    Button,
    MenuItem,
    Snackbar,
    Alert,
    CircularProgress,
    FormControl
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import apiCalls from 'apicall';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const InitiateSeparationForm = ({ onSeparationCreated }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        department: '',
        position: '',
        reportingManager: '',
        joiningDate: '',
        separationType: '',
        noticePeriod: '30 Days',
        detailedReason: '',
        resignationDate: '',
        reasonCategory: '',
        lastWorkingDate: '',
        rehireEligible: true,
        separationReason: ''
    });
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const separationTypes = [
        'Resignation',
        'Termination',
        'Retirement',
        'Contract End',
        'Other'
    ];

    const reasonCategories = [
        'Career Growth',
        'Better Opportunity',
        'Personal Reasons',
        'Relocation',
        'Health Issues',
        'Other'
    ];

    useEffect(() => {
        getAllEmployeeDetails();
    }, []);

    const getAllEmployeeDetails = async () => {
        setLoading(true);
        try {
            const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?orgId=${orgId}`);
            if (response.status === true) {
                const employeeList = response.paramObjectsMap.employeeVO.map((emp) => ({
                    id: emp.employeeId,
                    employeeCode: emp.employeeCode,
                    employeeName: emp.employee,
                    department: emp.department,
                    position: emp.designation,
                    reportingManager: emp.reportingPerson,
                    joiningDate: emp.joiningDate,
                    label: `${emp.employeeCode} - ${emp.employee}`
                }));
                setEmployees(employeeList);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            showSnackbar('Error fetching employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = (event, selectedEmployee) => {
        if (selectedEmployee) {
            setFormData({
                ...formData,
                employeeId: selectedEmployee.employeeCode,
                employeeName: selectedEmployee.employeeName,
                department: selectedEmployee.department,
                position: selectedEmployee.position,
                reportingManager: selectedEmployee.reportingManager,
                joiningDate: selectedEmployee.joiningDate
            });
        } else {
            setFormData({
                ...formData,
                employeeId: '',
                employeeName: '',
                department: '',
                position: '',
                reportingManager: '',
                joiningDate: ''
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return '';
        return dateString; // Assuming dateString is already in YYYY-MM-DD format
    };

    const extractNoticeDays = (noticePeriod) => {
        const daysMap = {
            '15 Days': 15,
            '30 Days': 30,
            '45 Days': 45,
            '60 Days': 60,
            '90 Days': 90
        };
        return daysMap[noticePeriod] || 30;
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

    const handleSubmit = async () => {
        // Validation
        if (!formData.employeeId) {
            showSnackbar('Please select an employee', 'error');
            return;
        }

        if (!formData.separationType) {
            showSnackbar('Please select separation type', 'error');
            return;
        }

        if (!formData.resignationDate) {
            showSnackbar('Please select resignation date', 'error');
            return;
        }

        if (!formData.lastWorkingDate) {
            showSnackbar('Please select last working date', 'error');
            return;
        }

        if (!formData.reasonCategory) {
            showSnackbar('Please select reason category', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                branch: branch, // You might need to get this from employee data
                branchCode: branchCode, // You might need to get this from employee data
                createdBy: loginUserName, // Replace with actual user from your auth context
                department: formData.department,
                detailedReason: formData.detailedReason || formData.separationReason,
                employeeCode: formData.employeeId,
                employeeName: formData.employeeName,
                exitInterviewFeedback: "", // Will be filled later
                experienceRating: 0, // Default value
                interviewDate: formatDateForAPI(new Date().toISOString().split('T')[0]), // Current date
                joiningDate: formatDateForAPI(formData.joiningDate),
                lastWorkingDate: formatDateForAPI(formData.lastWorkingDate),
                noticeDate: extractNoticeDays(formData.noticePeriod),
                orgId: orgId,
                position: formData.position,
                reasonCategory: formData.reasonCategory,
                rehireEligible: formData.rehireEligible ? "Yes" : "No",
                reportingPerson: formData.reportingManager,
                reportingPersonCode: "", // You might need to get this from employee data
                reportingPersonEmail: "", // You might need to get this from employee data
                resignation: formatDateForAPI(formData.resignationDate),
                separationType: formData.separationType
            };

            console.log('Submitting payload:', payload);

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                showSnackbar('Separation process initiated successfully!', 'success');

                if (onSeparationCreated) {
                    onSeparationCreated();
                }

                // Reset form after successful submission
                setFormData({
                    employeeId: '',
                    employeeName: '',
                    department: '',
                    position: '',
                    reportingManager: '',
                    joiningDate: '',
                    separationType: '',
                    noticePeriod: '30 Days',
                    detailedReason: '',
                    resignationDate: '',
                    reasonCategory: '',
                    lastWorkingDate: '',
                    rehireEligible: true,
                    separationReason: ''
                });
            } else {
                showSnackbar(response.message || 'Failed to initiate separation process', 'error');
            }
        } catch (error) {
            console.error('Error submitting separation form:', error);
            showSnackbar('Error submitting separation form', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Employee Info Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Employee Details
                </Typography>
            </Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                    <Autocomplete
                        options={employees}
                        getOptionLabel={(option) => option.label}
                        value={employees.find(emp => emp.employeeCode === formData.employeeId) || null}
                        onChange={handleEmployeeSelect}
                        loading={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Name"
                                variant="outlined"
                                size="small"
                                fullWidth
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Code"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!!formData.employeeId}
                        name="Code"
                        value={formData.employeeId}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Department"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!!formData.department}
                        name="department"
                        value={formData.department}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Position"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!!formData.position}
                        name="position"
                        value={formData.position}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Reporting Manager"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!!formData.reportingManager}
                        name="reportingManager"
                        value={formData.reportingManager}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label={
                                    <span>
                                        Joining Date<span style={{ color: 'red' }}> *</span>
                                    </span>
                                }
                                format="DD-MM-YYYY"
                                value={formData.joiningDate ? dayjs(formData.joiningDate) : null}
                                onChange={(newValue) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        joiningDate: newValue ? newValue.toISOString() : '',
                                    }));
                                }}
                                readOnly
                                disabled={!!formData.joiningDate}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: false,
                                        helperText: '',
                                        sx: {
                                            '& .MuiInputBase-root': {
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '8px',
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
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Separation Details */}
            <Box sx={{ mb: 4, p: 2, pl: 0, pr: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarMonthIcon sx={{ color: '#2563eb', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Separation Details
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Autocomplete
                            options={separationTypes}
                            value={formData.separationType || null}
                            onChange={(event, newValue) =>
                                setFormData((prev) => ({ ...prev, separationType: newValue }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Separation Type *"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label={
                                        <span>
                                            Resignation/Notice Date<span style={{ color: 'red' }}> *</span>
                                        </span>
                                    }
                                    format="DD-MM-YYYY"
                                    value={formData.resignationDate ? dayjs(formData.resignationDate) : null}
                                    onChange={(newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            resignationDate: newValue ? newValue.toISOString() : '',
                                        }));
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
                                                    borderRadius: '8px',
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
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label={
                                        <span>
                                            Last Working Date<span style={{ color: 'red' }}> *</span>
                                        </span>
                                    }
                                    format="DD-MM-YYYY"
                                    value={formData.lastWorkingDate ? dayjs(formData.lastWorkingDate) : null}
                                    onChange={(newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            lastWorkingDate: newValue ? newValue.toISOString() : '',
                                        }));
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
                                                    borderRadius: '8px',
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
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Notice Period (Days)"
                            select
                            variant="outlined"
                            size="small"
                            fullWidth
                            name="noticePeriod"
                            value={formData.noticePeriod}
                            onChange={handleInputChange}
                        >
                            {['15 Days', '30 Days', '45 Days', '60 Days', '90 Days'].map((d) => (
                                <MenuItem key={d} value={d}>
                                    {d}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Autocomplete
                            options={reasonCategories}
                            value={formData.reasonCategory || null}
                            onChange={(event, newValue) =>
                                setFormData((prev) => ({ ...prev, reasonCategory: newValue }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Reason Category *"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Rehire Eligible"
                            select
                            variant="outlined"
                            size="small"
                            fullWidth
                            name="rehireEligible"
                            value={formData.rehireEligible ? 'Yes' : 'No'}
                            onChange={(e) => setFormData((prev) => ({
                                ...prev,
                                rehireEligible: e.target.value === 'Yes'
                            }))}
                        >
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Detailed Reason"
                            variant="outlined"
                            size="small"
                            fullWidth
                            multiline
                            rows={3}
                            name="detailedReason"
                            value={formData.detailedReason}
                            onChange={handleInputChange}
                            placeholder="Provide detailed reason for separation"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#dc2626',
                        '&:hover': { backgroundColor: '#b91c1c' },
                        px: 4,
                        minWidth: 200
                    }}
                    onClick={handleSubmit}
                    disabled={!formData.employeeId || submitting}
                >
                    {submitting ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                        'Initiate Separation Process'
                    )}
                </Button>
            </Box>

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

export default InitiateSeparationForm;