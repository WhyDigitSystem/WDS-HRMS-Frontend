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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField
} from '@mui/material';
import {
    Person as PersonIcon,
    Save as SaveIcon,
    BusinessCenter as BusinessIcon,
    QuestionAnswer as QuestionIcon,
    ExpandMore as ExpandMoreIcon,
    Category as CategoryIcon
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
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchCode');
    const branch = localStorage.getItem('branch');
    const loginUserName = localStorage.getItem('userName');

    useEffect(() => {
        fetchEmployees();
    }, []);

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
                    designation: emp.designation || emp.position,
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

    // Fetch questions based on designation
    const fetchQuestionsByDesignation = async (designation) => {
        setQuestionsLoading(true);
        try {
            const response = await apiCalls('get',
                `/employeseparation/getExitInterviewBasedOnDesignation?branchCode=${branchCode}&designation=${designation}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap?.exitInterviewDepartmentVO) {
                const questionsData = response.paramObjectsMap.exitInterviewDepartmentVO;

                // Separate general questions and designation-specific questions
                const general = [];
                const designationSpecific = [];

                questionsData.forEach(dept => {
                    if (dept.designation === "GENERAL") {
                        // These are general questions that apply to everyone
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
                        // These are questions specific to the employee's designation
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

                // Reset selected questions when new designation is selected
                setSelectedQuestions([]);
            } else {
                setGeneralQuestions([]);
                setDesignationSpecificQuestions([]);
                setSelectedQuestions([]);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setGeneralQuestions([]);
            setDesignationSpecificQuestions([]);
            showSnackbar('Error fetching questions for designation', 'error');
        } finally {
            setQuestionsLoading(false);
        }
    };

    const handleEmployeeSelect = useCallback((event, newValue) => {
        setSelectedEmployee(newValue);

        if (newValue) {
            const employeeDesignation = newValue.designation || newValue.position;
            setSelectedDesignation(employeeDesignation);
            fetchQuestionsByDesignation(employeeDesignation);
        } else {
            setSelectedDesignation('');
            setGeneralQuestions([]);
            setDesignationSpecificQuestions([]);
            setSelectedQuestions([]);
        }
    }, [fetchQuestionsByDesignation]);

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

        if (selectedQuestions.length === 0) {
            showSnackbar('Please select at least one exit interview question', 'error');
            return;
        }

        setSaving(true);
        try {
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
                status: 'PENDING',
                exitInterviewQuestions: selectedQuestions.map(q => ({
                    id: q.id,
                    question: q.question,
                    answer: '',
                    type: q.type
                }))
            };

            console.log('Saving exit interview data:', payload);

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                showSnackbar('Exit interview questions saved successfully!', 'success');
                // Reset form after successful submission
                setSelectedEmployee(null);
                setSelectedDesignation('');
                setGeneralQuestions([]);
                setDesignationSpecificQuestions([]);
                setSelectedQuestions([]);
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
    }, [selectedEmployee, selectedQuestions, selectedDesignation]);

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

    // Calculate total questions
    const totalQuestions = generalQuestions.length + designationSpecificQuestions.length;
    const selectedCount = selectedQuestions.length;

    const selectedQuestionIds = useMemo(() => {
        return new Set(selectedQuestions.map(q => q.id));
    }, [selectedQuestions]);

    return (
        <Box sx={{ p: 0, maxWidth: 1200, margin: '0 auto' }}>
            {/* Main Card */}
            <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                        Exit Interview Questions
                    </Typography>

                    {/* Employee and Designation Selection */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
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
                    </Grid>

                    {/* Questions Section */}
                    {selectedEmployee && (
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
                                    </Box>
                                </Box>

                                {questionsLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : totalQuestions > 0 ? (
                                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 550, overflowY: 'auto' }}>
                                        <Stack spacing={2}>
                                            {/* General Questions Section */}
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

                                            {/* Designation Specific Questions Section */}
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

                    {/* Save Button */}
                    {selectedEmployee && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={handleSubmit}
                                disabled={!selectedEmployee || selectedQuestions.length === 0 || saving}
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
                                {saving ? 'Saving...' : 'Save Questions'}
                            </Button>
                        </Box>
                    )}

                    {/* No Employee Selected Message */}
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

                    {/* Loading State */}
                    {loading && !selectedEmployee && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Snackbar for notifications */}
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