import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import {
    Save as SaveIcon,
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const showToast = (type, message) => {
    toast[type](message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
    });
};

const InitiateSeparationForm = ({ onSeparationCreated }) => {
    console.log("🔁 Component Rendered");
    const initialFormData = {
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
    };
    const [formData, setFormData] = useState(initialFormData);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // const inpRef = useRef();
    // const empRef = useRef();
    // const subRef = useRef();

    // useEffect(() => {
    //     if (inpRef.current === handleInputChange) {
    //         console.log("✅ inp function");
    //     } else {
    //         console.log("❌ inp function");
    //     }
    //     inpRef.current = handleInputChange;
    // });

    // useEffect(() => {
    //     if (empRef.current === handleEmployeeSelect) {
    //         console.log("✅ emp function");
    //     } else {
    //         console.log("❌ emp function");
    //     }
    //     empRef.current = handleEmployeeSelect;
    // });

    // useEffect(() => {
    //     if (subRef.current === handleSubmit) {
    //         console.log("✅ emp function");
    //     } else {
    //         console.log("❌ emp function");
    //     }
    //     subRef.current = handleSubmit;
    // });

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
            console.error('error', 'Error fetching employees:', error);

        } finally {
            setLoading(false);
        }
    };

    // const handleEmployeeSelect = (event, selectedEmployee) => {
    //     if (selectedEmployee) {
    //         setFormData({
    //             ...formData,
    //             employeeId: selectedEmployee.employeeCode,
    //             employeeName: selectedEmployee.employeeName,
    //             department: selectedEmployee.department,
    //             position: selectedEmployee.position,
    //             reportingManager: selectedEmployee.reportingManager,
    //             joiningDate: selectedEmployee.joiningDate
    //         });
    //     } else {
    //         setFormData({
    //             ...formData,
    //             employeeId: '',
    //             employeeName: '',
    //             department: '',
    //             position: '',
    //             reportingManager: '',
    //             joiningDate: ''
    //         });
    //     }
    // };

    const handleEmployeeSelect = useCallback((event, selectedEmployee) => {
        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                employeeId: selectedEmployee.employeeCode,
                employeeName: selectedEmployee.employeeName,
                department: selectedEmployee.department,
                position: selectedEmployee.position,
                reportingManager: selectedEmployee.reportingManager,
                joiningDate: selectedEmployee.joiningDate
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                employeeId: '',
                employeeName: '',
                department: '',
                position: '',
                reportingManager: '',
                joiningDate: ''
            }));
        }
    }, []);

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({ ...prev, [name]: value }));
    // };

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

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

    const handleSubmit = useCallback(async () => {
        if (!formData.employeeId) {
            showToast('error', 'Please select employee');
            return;
        }

        if (!formData.separationType) {
            showToast('error', 'Please select separation type');
            return;
        }

        if (formData.separationType === 'Resignation' && !formData.reasonCategory) {
            showToast('error', 'Please select reason');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                branch: branch,
                branchCode: branchCode,
                createdBy: loginUserName,
                department: formData.department,
                detailedReason: formData.detailedReason || formData.separationReason,
                employeeCode: formData.employeeId,
                employeeName: formData.employeeName,
                exitInterviewFeedback: "",
                experienceRating: 0,
                interviewDate: new Date().toISOString().split('T')[0],
                joiningDate: formData.joiningDate,
                lastWorkingDate: formData.lastWorkingDate,
                noticeDate: extractNoticeDays(formData.noticePeriod),
                orgId: orgId,
                position: formData.position,
                reasonCategory: formData.reasonCategory,
                rehireEligible: formData.rehireEligible ? "Yes" : "No",
                reportingManager: formData.reportingManager,
                reportingPerson: [],
                reportingPersonCode: [],
                reportingPersonEmail: [],
                resignation: formData.resignationDate,
                separationType: formData.separationType
            };

            console.log("✅ FINAL PAYLOAD:", payload);

            const response = await apiCalls(
                'put',
                '/employeseparation/createUpdateInitiateSeparation',
                payload
            );

            if (response.status === true) {
                showToast('success', 'Saved successfully!');
                onSeparationCreated?.();
                setFormData(initialFormData);
            } else {
                showToast('error', response.message);
            }

        } catch (error) {
            console.error(error);
            showToast('error', 'Error submitting form');
        } finally {
            setSubmitting(false);
        }
    }, [
        formData,          // 🔥 MOST IMPORTANT
        branch,
        branchCode,
        loginUserName,
        orgId
    ]);

    const calculateLastWorkingDate = (resignationDate, noticePeriod) => {
        if (!resignationDate || !noticePeriod) return '';

        const days = extractNoticeDays(noticePeriod);

        return dayjs(resignationDate)
            .add(days - 1, 'day')
            .toISOString();
    };

    const selectedEmployee = useMemo(() => {
        if (!formData.employeeId) return null; // 🔥 IMPORTANT
        return employees.find(emp => emp.employeeCode === formData.employeeId) || null;
    }, [employees, formData.employeeId]);

    // const selectedEmployee = employees.find(emp => {
    //     console.log("🔥 find running");
    //     return emp.employeeCode === formData.employeeId;
    // });

    return (
        <>
            <ToastContainer />
            <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                {/* Employee Info Section */}
                <Typography sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                    👤 Employee Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => option.label}
                            value={selectedEmployee}
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

                    <Grid item xs={12} sm={6} md={4} lg={3}>
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

                    <Grid item xs={12} sm={6} md={4} lg={3}>
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

                    <Grid item xs={12} sm={6} md={4} lg={3}>
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

                    <Grid item xs={12} sm={6} md={4} lg={3}>
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
                    <Grid item xs={12} sm={6} md={4} lg={3}>
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
                <Typography sx={{ fontWeight: 700, mt: 2, mb: 1, color: '#1e293b' }}>
                    🚪 Separation Details
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4} lg={3}>

                        <Autocomplete
                            options={separationTypes}
                            value={formData.separationType || null}
                            onChange={(event, newValue) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    separationType: newValue,
                                    reasonCategory: newValue === 'Resignation' ? prev.reasonCategory : ''
                                }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    // label="Type *"
                                    label={
                                        <span>
                                            Type<span style={{ color: 'red' }}> *</span>
                                        </span>
                                    }
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                {/* <DatePicker
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
                                /> */}
                                <DatePicker
                                    label={
                                        <span>
                                            Resignation/Notice Date<span style={{ color: 'red' }}> *</span>
                                        </span>
                                    }
                                    format="DD-MM-YYYY"
                                    value={formData.resignationDate ? dayjs(formData.resignationDate) : null}
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
                                    onChange={(newValue) => {
                                        const resignationISO = newValue ? newValue.toISOString() : '';

                                        setFormData((prev) => ({
                                            ...prev,
                                            resignationDate: resignationISO,
                                            lastWorkingDate: calculateLastWorkingDate(
                                                resignationISO,
                                                prev.noticePeriod
                                            ),
                                        }));
                                    }}
                                />

                            </LocalizationProvider>
                        </FormControl>
                    </Grid>


                    <Grid item xs={12} sm={6} md={4} lg={3}>

                        {/* <TextField
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
                        </TextField> */}
                        <TextField
                            label="Notice Period (Days)"
                            select
                            variant="outlined"
                            size="small"
                            fullWidth
                            name="noticePeriod"
                            value={formData.noticePeriod}
                            onChange={(e) => {
                                const noticePeriod = e.target.value;

                                setFormData((prev) => ({
                                    ...prev,
                                    noticePeriod,
                                    lastWorkingDate: calculateLastWorkingDate(
                                        prev.resignationDate,
                                        noticePeriod
                                    ),
                                }));
                            }}
                        >
                            {['15 Days', '30 Days', '45 Days', '60 Days', '90 Days'].map((d) => (
                                <MenuItem key={d} value={d}>
                                    {d}
                                </MenuItem>
                            ))}
                        </TextField>

                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3}>

                        <FormControl fullWidth variant="outlined" size="small">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label={
                                        <span>
                                            Last Working Date<span style={{ color: 'red' }}> *</span>
                                        </span>
                                    }
                                    format="DD-MM-YYYY"
                                    disabled
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


                    {formData.separationType === 'Resignation' && (
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Autocomplete
                                options={reasonCategories}
                                value={formData.reasonCategory || null}
                                onChange={(event, newValue) =>
                                    setFormData((prev) => ({ ...prev, reasonCategory: newValue }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            <span>
                                                Reason <span style={{ color: 'red' }}> *</span>
                                            </span>
                                        }
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12} sm={6} md={4} lg={3}>

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


                {/* Submit */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
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
                        onClick={handleSubmit}
                    // disabled={!formData.employeeId || submitting}
                    >
                        {submitting ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            'Save'
                        )}
                    </Button>
                </Box>
            </Box>

        </>

    );
};

export default InitiateSeparationForm;