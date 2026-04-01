import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Paper,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
    Chip,
    LinearProgress,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Tooltip,
    Container,
    Fade,
    Grow,
    Collapse,
    Divider
} from '@mui/material';
import {
    Person as PersonIcon,
    Save as SaveIcon,
    QuestionAnswer as QuestionIcon,
    NavigateNext as NextIcon,
    NavigateBefore as PrevIcon,
    CheckCircle as CheckCircleIcon,
    ExpandMore as ExpandMoreIcon,
    Assessment as AssessmentIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
    FormatQuote as FormatQuoteIcon,
    DoneAll as DoneAllIcon,
    Lock as LockIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';

const UserInterview = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [separationId, setSeparationId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveMessage, setSaveMessage] = useState({
        show: false,
        message: '',
        type: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Get user info from localStorage
    const employeeCode = localStorage.getItem('employeeCode');
    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchCode');
    const userName = localStorage.getItem('userName');

    useEffect(() => {
        fetchEmployeeSeparationData();
    }, []);

    // Auto-hide save message after 3 seconds
    useEffect(() => {
        if (saveMessage.show) {
            const timer = setTimeout(() => {
                setSaveMessage({ show: false, message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [saveMessage.show]);

    // Fetch employee separation data which contains the questions
    const fetchEmployeeSeparationData = async () => {
        setLoading(true);
        try {
            const response = await apiCalls('get',
                `/employeseparation/getInitiateSeparationByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap?.initiateSeparationVO) {
                // Find the current employee's data
                const currentEmployee = response.paramObjectsMap.initiateSeparationVO.find(
                    emp => emp.employeeCode === employeeCode
                );

                if (currentEmployee) {
                    setEmployeeInfo({
                        id: currentEmployee.id,
                        employeeName: currentEmployee.employeeName,
                        employeeCode: currentEmployee.employeeCode,
                        department: currentEmployee.department,
                        position: currentEmployee.position,
                        designation: currentEmployee.position,
                        separationType: currentEmployee.separationType,
                        lastWorkingDate: currentEmployee.lastWorkingDate,
                        resignation: currentEmployee.resignation,
                        reasonCategory: currentEmployee.reasonCategory,
                        status: currentEmployee.status
                    });

                    setSeparationId(currentEmployee.id);

                    // Check if interview is already submitted
                    const isAlreadySubmitted = currentEmployee.status === 'COMPLETED';
                    setIsSubmitted(isAlreadySubmitted);

                    // Extract exit interview questions
                    if (currentEmployee.exitInterviewVO && currentEmployee.exitInterviewVO.length > 0) {
                        const exitQuestions = currentEmployee.exitInterviewVO.map((q, index) => ({
                            id: q.id,
                            questions: q.questions,
                            answer: q.answer || '',
                            screenCode: q.screenCode,
                            screenName: q.screenName,
                            order: index
                        }));

                        setQuestions(exitQuestions);

                        // Initialize answers with existing answers
                        const initialAnswers = {};
                        exitQuestions.forEach((q) => {
                            initialAnswers[q.id] = q.answer || '';
                        });
                        setAnswers(initialAnswers);

                        // Find the first unanswered question or start from beginning
                        const firstUnansweredIndex = exitQuestions.findIndex(q => !q.answer || q.answer.trim() === '');
                        setCurrentIndex(firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0);
                    } else {
                        setQuestions([]);
                        showSnackbar('No exit interview questions found', 'info');
                    }
                } else {
                    showSnackbar('No separation data found for current employee', 'error');
                    setQuestions([]);
                }
            } else {
                setQuestions([]);
                showSnackbar('Error fetching separation data', 'error');
            }
        } catch (error) {
            console.error('Error fetching separation data:', error);
            showSnackbar('Error fetching assigned questions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        if (isSubmitted) return;

        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));

        if (saveMessage.show) {
            setSaveMessage({ show: false, message: '', type: '' });
        }
    };

    const handleNext = () => {
        if (isSubmitted) return;

        const currentQuestion = questions[currentIndex];
        if (currentQuestion && !answers[currentQuestion.id]) {
            showSnackbar('Please answer the current question before proceeding', 'warning');
            return;
        }
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        if (isSubmitted) return;

        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async () => {
        if (isSubmitted) return;

        const unansweredQuestions = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');

        if (unansweredQuestions.length > 0) {
            showSnackbar(`Please answer all ${unansweredQuestions.length} remaining questions`, 'warning');
            return;
        }

        setIsSubmitting(true);
        setSaving(true);
        try {
            const updatedExitInterviewVO = questions.map(q => ({
                id: q.id,
                questions: q.questions,
                answer: answers[q.id]
            }));

            const payload = {
                id: separationId,
                employeeCode: employeeCode,
                employeeName: employeeInfo.employeeName,
                department: employeeInfo.department,
                position: employeeInfo.position,
                separationType: employeeInfo.separationType,
                resignation: employeeInfo.resignation,
                lastWorkingDate: employeeInfo.lastWorkingDate,
                reasonCategory: employeeInfo.reasonCategory,
                status: 'COMPLETED',
                exitInterviewDTO: updatedExitInterviewVO,
                updatedBy: userName,
                orgId: parseInt(orgId),
                branchCode: branchCode,
                branch: localStorage.getItem('branch') || '',
                clearanceManagementVO: []
            };

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                setIsSubmitted(true);
                showSnackbar('Exit interview submitted successfully! Thank you for your feedback.', 'success');
                setSaveMessage({
                    show: true,
                    message: '✅ Exit interview submitted successfully! Thank you for your valuable feedback.',
                    type: 'success'
                });
            } else {
                showSnackbar(response.message || 'Failed to submit answers', 'error');
            }
        } catch (error) {
            console.error('Error submitting answers:', error);
            showSnackbar('Error submitting answers', 'error');
        } finally {
            setSaving(false);
            setIsSubmitting(false);
        }
    };

    const handleSaveProgress = async () => {
        if (isSubmitted) return;

        setSaving(true);
        try {
            const updatedExitInterviewVO = questions.map(q => ({
                id: q.id,
                questions: q.questions,
                answer: answers[q.id] || '',
                screenCode: q.screenCode,
                screenName: q.screenName
            }));

            const payload = {
                id: separationId,
                employeeCode: employeeCode,
                employeeName: employeeInfo.employeeName,
                department: employeeInfo.department,
                position: employeeInfo.position,
                separationType: employeeInfo.separationType,
                resignation: employeeInfo.resignation,
                lastWorkingDate: employeeInfo.lastWorkingDate,
                reasonCategory: employeeInfo.reasonCategory,
                status: 'IN_PROGRESS',
                exitInterviewVO: updatedExitInterviewVO,
                updatedBy: userName,
                orgId: parseInt(orgId),
                branchCode: branchCode,
                branch: localStorage.getItem('branch') || '',
                clearanceManagementVO: []
            };

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                showSnackbar('Progress saved successfully!', 'success');
                setSaveMessage({
                    show: true,
                    message: '💾 Your progress has been saved successfully! You can continue later.',
                    type: 'success'
                });
            } else {
                showSnackbar('Failed to save progress', 'error');
                setSaveMessage({
                    show: true,
                    message: '❌ Failed to save progress. Please try again.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            showSnackbar('Error saving progress', 'error');
            setSaveMessage({
                show: true,
                message: '❌ Error saving progress. Please check your connection and try again.',
                type: 'error'
            });
        } finally {
            setSaving(false);
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
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const getProgressPercentage = () => {
        if (questions.length === 0) return 0;
        const answeredCount = Object.values(answers).filter(ans => ans && ans.trim() !== '').length;
        return (answeredCount / questions.length) * 100;
    };

    const getAnsweredCount = () => {
        return Object.values(answers).filter(ans => ans && ans.trim() !== '').length;
    };

    const handleRefresh = () => {
        fetchEmployeeSeparationData();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="body1" sx={{ ml: 2, color: '#666' }}>
                    Loading your exit interview...
                </Typography>
            </Box>
        );
    }

    if (questions.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 3 }}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <QuestionIcon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            No Exit Interview Questions Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Your exit interview questions haven't been configured yet.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleRefresh}
                            startIcon={<RefreshIcon />}
                            sx={{
                                background: '#3b82f6',
                                borderRadius: 2,
                                px: 3,
                                '&:hover': {
                                    background: '#2563eb'
                                }
                            }}
                        >
                            Refresh
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = getProgressPercentage();
    const answeredCount = getAnsweredCount();
    const isCompleted = progress === 100;

    const hasAnyAnswer = Object.values(answers).some(
        ans => ans && ans.trim() !== ''
    );

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Save Success Message Banner */}
            <Collapse in={saveMessage.show}>
                <Alert
                    severity={saveMessage.type === 'success' ? 'success' : 'error'}
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        animation: 'slideIn 0.3s ease-out',
                        '@keyframes slideIn': {
                            from: {
                                transform: 'translateY(-20px)',
                                opacity: 0
                            },
                            to: {
                                transform: 'translateY(0)',
                                opacity: 1
                            }
                        }
                    }}
                    icon={saveMessage.type === 'success' ? <DoneAllIcon /> : <QuestionIcon />}
                    onClose={() => setSaveMessage({ show: false, message: '', type: '' })}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {saveMessage.message}
                    </Typography>
                </Alert>
            </Collapse>

            {/* Header Section */}
            <Grow in={true} timeout={500}>
                <Card sx={{
                    mb: 2,
                    borderRadius: 2,
                    background: isSubmitted ? '#10b981' : '#3b82f6',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isSubmitted ? <LockIcon sx={{ color: '#ffffff', fontSize: 20 }} /> : <AssessmentIcon sx={{ color: '#ffffff', fontSize: 20 }} />}
                                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                    Exit Interview
                                </Typography>
                                {isSubmitted && (
                                    <Chip
                                        label="Submitted"
                                        size="small"
                                        sx={{
                                            backgroundColor: '#ffffff',
                                            color: '#10b981',
                                            fontWeight: 600,
                                            height: 22,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                    label={`${Math.round(progress)}% Complete`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: 22
                                    }}
                                />
                                <Tooltip title="Refresh">
                                    <IconButton
                                        onClick={handleRefresh}
                                        size="small"
                                        sx={{
                                            color: '#ffffff',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                                            padding: 0.3
                                        }}
                                    >
                                        <RefreshIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#ffffff',
                                    borderRadius: 2
                                }
                            }}
                        />

                        {employeeInfo && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PersonIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                                        {employeeInfo.employeeName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        ({employeeInfo.employeeCode})
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {employeeInfo.department} | {employeeInfo.position}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={employeeInfo.separationType}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: '#ffffff',
                                        fontWeight: 500,
                                        height: 20,
                                        fontSize: '0.65rem'
                                    }}
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grow>

            {/* Only show Question Card if NOT submitted */}
            {!isSubmitted && (
                <Fade in={true} timeout={800}>
                    <Card sx={{
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        overflow: 'visible'
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            {/* Progress Info */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                                pb: 1.5,
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600, letterSpacing: 0.5 }}>
                                        Question Progress
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                                        {currentIndex + 1} of {questions.length}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                        Completed
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                        {answeredCount}/{questions.length}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Current Question */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.5,
                                    mb: 2
                                }}>
                                    <FormatQuoteIcon sx={{
                                        fontSize: 28,
                                        color: '#3b82f6',
                                        opacity: 0.5,
                                        transform: 'rotate(180deg)'
                                    }} />
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        color: '#1f2937',
                                        lineHeight: 1.4,
                                        flex: 1,
                                        fontSize: '1rem'
                                    }}>
                                        {currentQuestion.questions}
                                    </Typography>
                                </Box>

                                {/* Answer Input */}
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={6}
                                    variant="outlined"
                                    label="Your Answer"
                                    disabled={answers.length > 0}
                                    placeholder="Please provide your honest and detailed response here..."
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    sx={{
                                        mt: 1,
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#fafafa',
                                            borderRadius: 1.5,
                                            fontSize: '0.9rem',
                                            '&:hover': {
                                                backgroundColor: '#ffffff'
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: '#ffffff',
                                                '& fieldset': {
                                                    borderColor: '#3b82f6',
                                                    borderWidth: 1.5
                                                }
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '0.85rem',
                                            '&.Mui-focused': {
                                                color: '#3b82f6'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Navigation Buttons */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 2,
                                pt: 1.5,
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <Button
                                    variant="outlined"
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    startIcon={<PrevIcon />}
                                    size="small"
                                    sx={{
                                        borderRadius: 1.5,
                                        px: 2,
                                        py: 0.5,
                                        borderColor: '#d1d5db',
                                        color: '#6b7280',
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.04)'
                                        }
                                    }}
                                >
                                    Previous
                                </Button>

                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleSaveProgress}
                                        disabled={saving}
                                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                                        size="small"
                                        sx={{
                                            borderRadius: 1.5,
                                            px: 2,
                                            py: 0.5,
                                            borderColor: '#10b981',
                                            color: '#10b981',
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: '#059669',
                                                backgroundColor: 'rgba(16, 185, 129, 0.04)'
                                            }
                                        }}
                                    >
                                        Save Progress
                                    </Button>

                                    {currentIndex === questions.length - 1 ? (
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={saving || !isCompleted || isSubmitting}
                                            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
                                            size="small"
                                            sx={{
                                                borderRadius: 1.5,
                                                px: 3,
                                                py: 0.5,
                                                background: '#3b82f6',
                                                color: 'white',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                '&:hover': {
                                                    background: '#2563eb',
                                                    transform: 'translateY(-1px)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Interview'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            disabled={!answers[currentQuestion.id]}
                                            endIcon={<NextIcon />}
                                            size="small"
                                            sx={{
                                                borderRadius: 1.5,
                                                px: 3,
                                                py: 0.5,
                                                background: '#3b82f6',
                                                color: 'white',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                '&:hover': {
                                                    background: '#2563eb',
                                                    transform: 'translateY(-1px)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            Next Question
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>
            )}

            {/* Review Section - Always show, but style changes based on submission status */}
            {questions.length > 0 && (
                <Grow in={true} timeout={1000}>
                    <Card sx={{
                        mt: isSubmitted ? 0 : 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <CardContent sx={{ p: 0 }}>
                            <Accordion
                                defaultExpanded={!isSubmitted && !hasAnyAnswer ? false : true}
                                sx={{
                                    boxShadow: 'none',
                                    '&:before': { display: 'none' },
                                    '&.Mui-expanded': {
                                        margin: 0
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
                                    sx={{
                                        px: 2.5,
                                        py: 1,
                                        minHeight: 'auto',
                                        '&:hover': {
                                            backgroundColor: '#f9fafb'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                        {isSubmitted ? <LockIcon sx={{ color: '#10b981', fontSize: 18 }} /> : <VisibilityIcon sx={{ color: '#3b82f6', fontSize: 18 }} />}
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {isSubmitted ? 'Submitted Interview - Questions & Answers' : 'Review All Questions & Answers'}
                                        </Typography>
                                        <Chip
                                            label={`${answeredCount}/${questions.length} Answered`}
                                            size="small"
                                            sx={{
                                                backgroundColor: answeredCount === questions.length ? '#10b981' : '#f59e0b',
                                                color: 'white',
                                                fontWeight: 600,
                                                height: 22,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                        {isSubmitted && (
                                            <Chip
                                                label="Final Submission"
                                                size="small"
                                                icon={<LockIcon sx={{ fontSize: 12 }} />}
                                                sx={{
                                                    backgroundColor: '#e5e7eb',
                                                    color: '#6b7280',
                                                    fontWeight: 500,
                                                    height: 22,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                                    <Stack spacing={1.5}>
                                        {questions.map((q, index) => (
                                            <Paper
                                                key={q.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 1.5,
                                                    backgroundColor: answers[q.id] ? (isSubmitted ? '#f9fafb' : '#fefce8') : '#fafafa',
                                                    borderColor: answers[q.id] ? (isSubmitted ? '#e5e7eb' : '#fde047') : '#e5e7eb'
                                                }}
                                            >
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#1f2937',
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}>
                                                    <span style={{
                                                        backgroundColor: isSubmitted ? '#10b981' : '#3b82f6',
                                                        color: 'white',
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {index + 1}
                                                    </span>
                                                    {q.questions}
                                                </Typography>
                                                <Box sx={{ pl: 3.5 }}>
                                                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                                        Your Answer:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        mt: 0.5,
                                                        color: '#374151',
                                                        borderLeft: `2px solid ${isSubmitted ? '#10b981' : '#3b82f6'}`,
                                                        paddingLeft: 1.5,
                                                        backgroundColor: isSubmitted ? '#f9fafb' : 'transparent',
                                                        padding: 1,
                                                        borderRadius: 1
                                                    }}>
                                                        {answers[q.id] || '⚠️ Not answered yet'}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                    {isSubmitted && (
                                        <Box sx={{ mt: 2, textAlign: 'center', pt: 1.5, borderTop: '1px solid #e5e7eb' }}>
                                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                                This interview has been submitted and cannot be edited.
                                            </Typography>
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                </Grow>
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
                    sx={{
                        width: '100%',
                        borderRadius: 1.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UserInterview;