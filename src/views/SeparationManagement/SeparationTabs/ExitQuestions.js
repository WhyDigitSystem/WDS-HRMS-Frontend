import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Paper,
    Chip,
    Autocomplete,
    CircularProgress,
    Snackbar,
    Alert,
    FormControlLabel,
    Checkbox,
    Stack,
    Grid,
    Divider,
    TextField,
    IconButton,
    Tooltip,
    AlertTitle
} from '@mui/material';
import {
    Person as PersonIcon,
    Save as SaveIcon,
    BusinessCenter as BusinessIcon,
    QuestionAnswer as QuestionIcon,
    ExpandMore as ExpandMoreIcon,
    Category as CategoryIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Pending as PendingIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Lock as LockIcon,
    HourglassEmpty as HourglassIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';

const ExitQuestions = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDesignation, setSelectedDesignation] = useState('');
    const [generalQuestions, setGeneralQuestions] = useState([]);
    const [designationSpecificQuestions, setDesignationSpecificQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [clearanceStatus, setClearanceStatus] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [existingQuestions, setExistingQuestions] = useState([]);

    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchCode');
    const branch = localStorage.getItem('branch');
    const loginUserName = localStorage.getItem('userName');

    useEffect(() => {
        fetchEmployees();
    }, []);

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
                    designation: emp.designation || emp.position,
                    separationType: emp.separationType,
                    name: `${emp.employeeName} (${emp.employeeCode})`,
                    originalData: emp,
                    exitQuestions: emp.exitInterviewVO || []
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

    const fetchClearanceStatus = async (employeeCode) => {
        setStatusLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/employeseparation/getStatusForClearance?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap && response.paramObjectsMap.assetStatus) {
                const statusData = response.paramObjectsMap.assetStatus[0];
                setClearanceStatus(statusData);
                return statusData;
            } else {
                setClearanceStatus(null);
                return null;
            }
        } catch (error) {
            console.error('Error fetching clearance status:', error);
            setClearanceStatus(null);
            return null;
        } finally {
            setStatusLoading(false);
        }
    };

    const fetchQuestionsByDesignation = async (designation, employeeExitQuestions = []) => {
        setQuestionsLoading(true);
        try {
            const response = await apiCalls('get',
                `/employeseparation/getExitInterviewBasedOnDesignation?branchCode=${branchCode}&designation=${designation}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap?.exitInterviewDepartmentVO) {
                const questionsData = response.paramObjectsMap.exitInterviewDepartmentVO;

                const general = [];
                const designationSpecific = [];

                questionsData.forEach(dept => {
                    if (dept.designation === "GENERAL") {
                        if (dept.questionVO && dept.questionVO.length > 0) {
                            dept.questionVO.forEach(q => {
                                general.push({
                                    id: q.id,
                                    question: q.question,
                                    type: 'general',
                                    designation: dept.designation
                                });
                            });
                        }
                    } else if (dept.designation === designation) {
                        if (dept.questionVO && dept.questionVO.length > 0) {
                            dept.questionVO.forEach(q => {
                                designationSpecific.push({
                                    id: q.id,
                                    question: q.question,
                                    type: 'specific',
                                    designation: dept.designation,
                                    designationCode: dept.designationCode
                                });
                            });
                        }
                    }
                });

                setGeneralQuestions(general);
                setDesignationSpecificQuestions(designationSpecific);

                if (employeeExitQuestions && employeeExitQuestions.length > 0) {
                    const allQuestions = [...general, ...designationSpecific];

                    const existingSelected = allQuestions.filter(q =>
                        employeeExitQuestions.some(eq =>
                            eq.questions?.trim().toLowerCase() === q.question?.trim().toLowerCase()
                        )
                    );

                    setSelectedQuestions(existingSelected);
                    setExistingQuestions(existingSelected);
                } else {
                    setSelectedQuestions([]);
                    setExistingQuestions([]);
                }
            } else {
                setGeneralQuestions([]);
                setDesignationSpecificQuestions([]);
                setSelectedQuestions([]);
                setExistingQuestions([]);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setGeneralQuestions([]);
            setDesignationSpecificQuestions([]);
            setSelectedQuestions([]);
            showSnackbar('Error fetching questions for designation', 'error');
        } finally {
            setQuestionsLoading(false);
        }
    };

    const handleEmployeeSelect = useCallback(async (event, newValue) => {
        setSelectedEmployee(newValue);

        if (newValue) {
            const employeeDesignation = newValue.designation || newValue.position;
            setSelectedDesignation(employeeDesignation);

            const status = await fetchClearanceStatus(newValue.employeeCode);

            if (status && status.qty === 0) {
                await fetchQuestionsByDesignation(employeeDesignation, newValue.exitQuestions || []);
            } else {
                setGeneralQuestions([]);
                setDesignationSpecificQuestions([]);
                setSelectedQuestions([]);
                setExistingQuestions([]);
            }
        } else {
            setSelectedDesignation('');
            setGeneralQuestions([]);
            setDesignationSpecificQuestions([]);
            setSelectedQuestions([]);
            setExistingQuestions([]);
            setClearanceStatus(null);
        }
    }, [fetchQuestionsByDesignation, fetchClearanceStatus]);

    const handleQuestionToggle = useCallback((question) => {
        setSelectedQuestions(prev => {
            const isSelected = prev.some(q => q.id === question.id);
            if (isSelected) {
                return prev.filter(q => q.id !== question.id);
            } else {
                return [...prev, question];
            }
        });
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!selectedEmployee) {
            showSnackbar('Please select an employee', 'error');
            return;
        }

        if (clearanceStatus && clearanceStatus.qty > 0) {
            showSnackbar('Cannot save exit interview while clearance is pending. Please complete all clearance items first.', 'warning');
            return;
        }

        if (selectedQuestions.length === 0) {
            showSnackbar('Please select at least one exit interview question', 'error');
            return;
        }

        setSaving(true);
        try {
            const hasChanges = selectedQuestions.length !== existingQuestions.length ||
                selectedQuestions.some(q => !existingQuestions.find(eq => eq.id === q.id)) ||
                existingQuestions.some(eq => !selectedQuestions.find(q => q.id === eq.id));

            if (!hasChanges) {
                showSnackbar('No changes to save', 'info');
                setSaving(false);
                return;
            }

            const payload = {
                id: selectedEmployee.id,
                branch: branch || '',
                branchCode: branchCode,
                clearanceManagementDTO: selectedEmployee.originalData?.clearanceManagementVO || [],
                createdBy: loginUserName,
                department: selectedEmployee.department,
                detailedReason: selectedEmployee.originalData?.detailedReason || '',
                employeeCode: selectedEmployee.employeeCode,
                employeeName: selectedEmployee.employeeName,
                joiningDate: selectedEmployee.joiningDate,
                lastWorkingDate: selectedEmployee.originalData?.lastWorkingDate || '',
                noticeDate: selectedEmployee.originalData?.noticeDate || 0,
                orgId: parseInt(orgId),
                position: selectedEmployee.position,
                designation: selectedDesignation,
                reasonCategory: selectedEmployee.originalData?.reasonCategory || '',
                rehireEligible: selectedEmployee.originalData?.rehireEligible || 'Yes',
                resignation: selectedEmployee.originalData?.resignation || '',
                separationType: selectedEmployee.separationType,
                updatedBy: loginUserName,
                status: selectedEmployee.originalData?.status || 'PENDING',
                exitInterviewDTO: selectedQuestions.map(q => ({
                    id: q.id,
                    questions: q.question,
                    answer: '',
                    type: q.type
                }))
            };

            console.log('Saving exit interview data:', payload);

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                showSnackbar('Exit interview questions updated successfully!', 'success');
                setExistingQuestions([...selectedQuestions]);
                fetchEmployees();
                if (selectedEmployee) {
                    const updatedEmployee = employees.find(emp => emp.id === selectedEmployee.id);
                    if (updatedEmployee) {
                        setSelectedEmployee(updatedEmployee);
                    }
                }
            } else {
                showSnackbar(response.message || 'Failed to update exit interview', 'error');
            }
        } catch (error) {
            console.error('Error saving exit interview:', error);
            showSnackbar('Error saving exit interview', 'error');
        } finally {
            setSaving(false);
        }
    }, [selectedEmployee, selectedQuestions, selectedDesignation, existingQuestions, clearanceStatus]);

    const handleRefresh = useCallback(() => {
        if (selectedEmployee) {
            const employeeDesignation = selectedEmployee.designation || selectedEmployee.position;
            fetchClearanceStatus(selectedEmployee.employeeCode).then(status => {
                if (status && status.qty === 0) {
                    fetchQuestionsByDesignation(employeeDesignation, selectedEmployee.exitQuestions || []);
                } else {
                    showSnackbar('Clearance is still pending. Cannot refresh questions.', 'warning');
                }
            });
        }
    }, [selectedEmployee, fetchQuestionsByDesignation, fetchClearanceStatus]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const totalQuestions = generalQuestions.length + designationSpecificQuestions.length;
    const selectedCount = selectedQuestions.length;

    const selectedQuestionIds = useMemo(() => {
        return new Set(selectedQuestions.map(q => q.id));
    }, [selectedQuestions]);

    const hasUnsavedChanges = useMemo(() => {
        if (!selectedEmployee) return false;
        return selectedQuestions.length !== existingQuestions.length ||
            selectedQuestions.some(q => !existingQuestions.find(eq => eq.id === q.id)) ||
            existingQuestions.some(eq => !selectedQuestions.find(q => q.id === eq.id));
    }, [selectedQuestions, existingQuestions, selectedEmployee]);

    const isClearanceCompleted = clearanceStatus && clearanceStatus.qty === 0;
    const pendingCount = clearanceStatus ? clearanceStatus.qty : 0;

    return (
        <Box sx={{ p: 0, maxWidth: 1200, margin: '0 auto' }}>
            <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                        Exit Interview Questions Management
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={5}>
                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => option.name}
                                value={selectedEmployee}
                                onChange={handleEmployeeSelect}
                                loading={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Employee *"
                                        placeholder="Search employee..."
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            )
                                        }}
                                    />
                                )}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Designation"
                                value={selectedDesignation}
                                disabled
                                size="small"
                                sx={{ backgroundColor: '#f5f5f5' }}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>

                        {selectedEmployee && (
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                                    {statusLoading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <>
                                            {isClearanceCompleted ? (
                                                <Chip
                                                    icon={<CheckCircleIcon />}
                                                    label="Clearance Completed"
                                                    color="success"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<PendingIcon />}
                                                    label={`Pending Clearance (${pendingCount} items)`}
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                            {isClearanceCompleted && (
                                                <Chip
                                                    label={selectedEmployee.exitQuestions?.length > 0 ? `${selectedEmployee.exitQuestions.length} Questions Assigned` : 'No Questions Assigned'}
                                                    color={selectedEmployee.exitQuestions?.length > 0 ? "success" : "default"}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {isClearanceCompleted && (
                                                <Tooltip title="Refresh Questions">
                                                    <IconButton onClick={handleRefresh} size="small">
                                                        <RefreshIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Grid>
                        )}
                    </Grid>

                    {/* Enhanced Warning Message with Better Styling */}
                    {selectedEmployee && !statusLoading && clearanceStatus && clearanceStatus.qty > 0 && (
                        <Box sx={{ mb: 3, ml: 3, mr: 3 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    p: 2.5,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                    background: 'linear-gradient(135deg, #fff8f0 0%, #fff3e6 100%)',
                                    border: '1px solid #f0d9c2',
                                    boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                    }
                                }}
                            >
                                {/* Icon */}
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #f4a261, #e76f51)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 10px rgba(231,111,81,0.3)'
                                    }}
                                >
                                    <PendingIcon sx={{ color: '#fff', fontSize: 22 }} />
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: '#d97706',
                                            letterSpacing: 0.5,
                                            mb: 0.5
                                        }}
                                    >
                                        ACTION REQUIRED
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            color: '#3b2f2f',
                                            mb: 1
                                        }}
                                    >
                                        Clearance pending for {selectedEmployee?.employeeName}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: '0.85rem',
                                            color: '#6b4f3a',
                                            lineHeight: 1.6,
                                            mb: 2
                                        }}
                                    >
                                        Exit interview form is locked until all clearance items are completed.
                                        Please finish the pending tasks to proceed.
                                    </Typography>

                                    {/* Status Row */}
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                        {/* Pending Badge */}
                                        <Box
                                            sx={{
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 5,
                                                backgroundColor: '#fde8d7',
                                                color: '#b45309',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {pendingCount} Pending Item{pendingCount > 1 ? 's' : ''}
                                        </Box>

                                        {/* Locked Badge */}
                                        <Box
                                            sx={{
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 5,
                                                backgroundColor: '#ffe4e6',
                                                color: '#be123c',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            <LockIcon sx={{ fontSize: 14 }} />
                                            Form Locked
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    {selectedEmployee && isClearanceCompleted && (
                        <>
                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <QuestionIcon sx={{ color: '#2563eb', fontSize: 26 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            Select Exit Interview Questions *
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {totalQuestions > 0 && (
                                            <Chip
                                                label={`Total: ${totalQuestions} questions`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        {selectedCount > 0 && (
                                            <Chip
                                                label={`Selected: ${selectedCount}`}
                                                size="small"
                                                color="primary"
                                            />
                                        )}
                                        {hasUnsavedChanges && (
                                            <Chip
                                                label="Unsaved Changes"
                                                size="small"
                                                color="warning"
                                                icon={<EditIcon />}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {questionsLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : totalQuestions > 0 ? (
                                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 550, overflowY: 'auto' }}>
                                        <Stack spacing={2}>
                                            {generalQuestions.length > 0 && (
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                                        <CategoryIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f59e0b' }}>
                                                            General Questions
                                                        </Typography>
                                                        <Chip
                                                            label={`${generalQuestions.length} questions`}
                                                            size="small"
                                                            sx={{ ml: 1, backgroundColor: '#fff3e0', color: '#f59e0b' }}
                                                        />
                                                    </Box>
                                                    <Stack spacing={1.5}>
                                                        {generalQuestions.map((question) => (
                                                            <Paper
                                                                key={question.id}
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 1.5,
                                                                    backgroundColor: selectedQuestionIds.has(question.id)
                                                                        ? '#e3f2fd'
                                                                        : 'transparent',
                                                                    borderColor: selectedQuestionIds.has(question.id)
                                                                        ? '#1976d2'
                                                                        : '#e0e0e0',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        backgroundColor: '#f5f5f5'
                                                                    }
                                                                }}
                                                            >
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={selectedQuestionIds.has(question.id)}
                                                                            onChange={() => handleQuestionToggle(question)}
                                                                            sx={{ color: '#1976d2' }}
                                                                        />
                                                                    }
                                                                    label={
                                                                        <Typography variant="body1">
                                                                            {question.question}
                                                                        </Typography>
                                                                    }
                                                                />
                                                            </Paper>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}

                                            {designationSpecificQuestions.length > 0 && (
                                                <Box>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2, gap: 1 }}>
                                                        <BusinessIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb' }}>
                                                            Questions for {selectedDesignation}
                                                        </Typography>
                                                        <Chip
                                                            label={`${designationSpecificQuestions.length} questions`}
                                                            size="small"
                                                            sx={{ ml: 1, backgroundColor: '#e3f2fd', color: '#1976d2' }}
                                                        />
                                                    </Box>
                                                    <Stack spacing={1.5}>
                                                        {designationSpecificQuestions.map((question) => (
                                                            <Paper
                                                                key={question.id}
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 1.5,
                                                                    backgroundColor: selectedQuestionIds.has(question.id)
                                                                        ? '#e3f2fd'
                                                                        : 'transparent',
                                                                    borderColor: selectedQuestionIds.has(question.id)
                                                                        ? '#1976d2'
                                                                        : '#e0e0e0',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        backgroundColor: '#f5f5f5'
                                                                    }
                                                                }}
                                                            >
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={selectedQuestionIds.has(question.id)}
                                                                            onChange={() => handleQuestionToggle(question)}
                                                                            sx={{ color: '#1976d2' }}
                                                                        />
                                                                    }
                                                                    label={
                                                                        <Typography variant="body1">
                                                                            {question.question}
                                                                        </Typography>
                                                                    }
                                                                />
                                                            </Paper>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Paper>
                                ) : (
                                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', backgroundColor: '#fafafa' }}>
                                        <QuestionIcon sx={{ fontSize: 48, color: '#9e9e9e', mb: 2 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            No questions found for this designation
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Please contact HR to add exit interview questions for {selectedDesignation}
                                        </Typography>
                                    </Paper>
                                )}
                            </Box>
                        </>
                    )}

                    {selectedEmployee && isClearanceCompleted && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={handleSubmit}
                                disabled={!selectedEmployee || selectedQuestions.length === 0 || saving || !hasUnsavedChanges}
                                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                                sx={{
                                    background: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1,
                                    borderRadius: 2,
                                    letterSpacing: '0.5px',
                                    fontSize: '14px',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        background: 'linear-gradient(135deg, #E100FF 0%, #7F00FF 100%)'
                                    },
                                    '&:disabled': {
                                        background: '#9e9e9e'
                                    }
                                }}
                            >
                                {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                            </Button>
                        </Box>
                    )}

                    {!selectedEmployee && !loading && (
                        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#fafafa', mt: 2 }}>
                            <PersonIcon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No Employee Selected
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please select an employee from the dropdown above to view and select exit interview questions.
                            </Typography>
                        </Paper>
                    )}

                    {loading && !selectedEmployee && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ExitQuestions;