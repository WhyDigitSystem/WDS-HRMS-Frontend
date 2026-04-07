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
  FormControl,
  Grid,
  IconButton,
  Tooltip,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  RateReview as FeedbackIcon,
  Work as WorkIcon,
  Save as SaveIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ExitInterviewManagement = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [interviewDate, setInterviewDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reportingPersons, setReportingPersons] = useState([]);
  const [selectedReportingPerson, setSelectedReportingPerson] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [clearanceStatus, setClearanceStatus] = useState(null);
  const [exitQuestions, setExitQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [editingFeedback, setEditingFeedback] = useState(false);
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
    getNotifyList();
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
          reportingManager: emp.reportingPerson,
          joiningDate: emp.joiningDate,
          separationType: emp.separationType,
          name: `${emp.employeeName} (${emp.employeeCode})`,
          originalData: emp,
          exitInterviewVO: emp.exitInterviewVO || [],
          experienceRating: emp.experienceRating || 0,
          exitInterviewFeedback: emp.exitInterviewFeedback || '',
          interviewDate: emp.interviewDate || null
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

  const getNotifyList = async () => {
    try {
      const result = await apiCalls('get', `master/getReportingNameForEmployee?employeeCode=${null}&branchCode=${branchCode}&orgId=${orgId}`);

      if (result?.paramObjectsMap?.employeeVO) {
        const notifyList = result.paramObjectsMap.employeeVO.map((person) => ({
          reportingPersonCode: person.employeeCode,
          reportingPerson: person.employeeName,
          notifyEmail: person.email,
          role: person.role
        }));

        console.log('🔍 Notify List:', notifyList);
        setReportingPersons(notifyList);
      } else {
        console.error('❌ No reporting persons found');
      }
    } catch (error) {
      console.error('❌ Error fetching reporting persons:', error);
    }
  };

  const approveSeparation = async (id) => {
    try {
      const res = await apiCalls(
        'get',
        `/employeseparation/approve/${id}`
      );

      if (res.status) {
        showSnackbar('Approved successfully!', 'success');
      } else {
        showSnackbar(res.message || 'Approval failed', 'error');
      }
    } catch (error) {
      console.error('Approve API error:', error);
      showSnackbar('Error while approving', 'error');
    }
  };

  const handleEmployeeSelect = async (event, newValue) => {
    setSelectedEmployee(newValue);
    setEditingFeedback(false);

    if (!newValue) {
      setInterviewDate(null);
      setRating(0);
      setFeedback('');
      setClearanceStatus(null);
      setExitQuestions([]);
      setAnswers({});
    } else {
      // Fetch clearance status when employee is selected
      const status = await fetchClearanceStatus(newValue.employeeCode);

      // Load existing data
      if (newValue.originalData) {
        setRating(newValue.experienceRating || 0);
        setFeedback(newValue.exitInterviewFeedback || '');
        if (newValue.interviewDate) {
          setInterviewDate(dayjs(newValue.interviewDate));
        }

        // Load exit interview questions and answers
        if (newValue.exitInterviewVO && newValue.exitInterviewVO.length > 0) {
          const questionsList = newValue.exitInterviewVO.map(item => ({
            id: item.id,
            question: item.questions,
            answer: item.answer || ''
          }));
          setExitQuestions(questionsList);

          // Set answers state
          const answersMap = {};
          questionsList.forEach(q => {
            answersMap[q.id] = q.answer;
          });
          setAnswers(answersMap);
        } else {
          setExitQuestions([]);
          setAnswers({});
        }
      }
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      showSnackbar('Please select an employee', 'error');
      return;
    }

    // Check if clearance is completed
    if (clearanceStatus && clearanceStatus.qty > 0) {
      showSnackbar('Cannot save exit interview while clearance is pending. Please complete all clearance items first.', 'warning');
      return;
    }

    if (!interviewDate || !rating || !feedback.trim()) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    // ✅ Validate all questions answered
    const hasEmptyAnswers = exitQuestions.some(
      (q) => !answers[q.id] || !answers[q.id].trim()
    );

    if (hasEmptyAnswers) {
      showSnackbar('Please answer all exit interview questions', 'error');
      return;
    }

    setSaving(true);
    try {
      const reportingPersonNames = selectedReportingPerson.map(
        (person) => person.reportingPerson
      );

      const reportingPersonCodes = selectedReportingPerson.map(
        (person) => person.reportingPersonCode
      );

      const reportingPersonEmails = selectedReportingPerson.map(
        (person) => person.notifyEmail
      );

      // Prepare exit interview questions with answers
      const exitInterviewDTO = exitQuestions.map(q => ({
        id: q.id,
        questions: q.question,
        answer: answers[q.id] || '',
        screenCode: "EI",
        screenName: "EXIT INTERVIEW"
      }));

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
        exitInterviewFeedback: feedback,
        interviewDate: interviewDate
          ? interviewDate.format('YYYY-MM-DD')
          : null,
        experienceRating: rating,
        joiningDate: selectedEmployee.joiningDate,
        lastWorkingDate: selectedEmployee.originalData?.lastWorkingDate || '',
        noticeDate: selectedEmployee.originalData?.noticeDate || 0,
        orgId: parseInt(orgId),
        position: selectedEmployee.position,
        reasonCategory: selectedEmployee.originalData?.reasonCategory || '',
        rehireEligible: selectedEmployee.originalData?.rehireEligible || 'Yes',
        reportingPerson: reportingPersonNames,
        reportingPersonCode: reportingPersonCodes,
        reportingPersonEmail: reportingPersonEmails,
        resignation: selectedEmployee.originalData?.resignation || '',
        separationType: selectedEmployee.separationType,
        updatedBy: loginUserName,
        status: 'PENDING',
        exitInterviewVO: exitInterviewDTO
      };

      console.log('Saving exit interview data:', payload);

      const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

      if (response.status === true) {
        showSnackbar('Saved successfully!', 'success');
        await approveSeparation(selectedEmployee.id);
        setSelectedEmployee(null);
        setInterviewDate(dayjs());
        setRating(0);
        setFeedback('');
        setSelectedReportingPerson([]);
        setClearanceStatus(null);
        setExitQuestions([]);
        setAnswers({});
        setEditingFeedback(false);
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

  const areAllAnswersFilled = exitQuestions.every(
    (q) => answers[q.id] && answers[q.id].trim()
  );

  const isFormValid =
    selectedEmployee &&
    interviewDate &&
    rating > 0 &&
    feedback.trim() &&
    areAllAnswersFilled;
  const isClearanceCompleted = clearanceStatus && clearanceStatus.qty === 0;
  const pendingCount = clearanceStatus ? clearanceStatus.qty : 0;

  return (
    <Box sx={{ p: 0, maxWidth: 1400, margin: '0 auto' }}>
      {/* Employee Selection Card */}
      <Card sx={{
        mb: 3,
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{
            mb: 3,
            fontWeight: 700,
            color: '#1f2937',
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Exit Interview Management
          </Typography>

          {/* Row for Employee + Status */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
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
                  sx={{
                    width: 320,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#7C3AED',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#7C3AED',
                      }
                    }
                  }}
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
            />

            {selectedEmployee && !statusLoading && (
              <Box>
                {isClearanceCompleted ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Clearance Completed"
                    color="success"
                    size="small"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                ) : (
                  <Chip
                    icon={<PendingIcon />}
                    label={`Pending Clearance (${pendingCount} items)`}
                    color="warning"
                    size="small"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                )}
              </Box>
            )}

            {statusLoading && <CircularProgress size={24} />}
          </Box>

          {selectedEmployee && isClearanceCompleted && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                      width: 70,
                      height: 70,
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                    {selectedEmployee.employeeName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Chip
                      label={selectedEmployee.position}
                      size="small"
                      icon={<WorkIcon />}
                      sx={{ backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: 2 }}
                    />
                    <Chip
                      label={selectedEmployee.department}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#7C3AED', color: '#7C3AED', borderRadius: 2 }}
                    />
                    <Chip
                      label={selectedEmployee.separationType}
                      size="small"
                      sx={{ backgroundColor: '#fef3c7', color: '#d97706', borderRadius: 2 }}
                    />
                  </Box>
                  {selectedEmployee.originalData?.lastWorkingDate && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Last Working Date: {new Date(selectedEmployee.originalData.lastWorkingDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Warning Message for Pending Clearance */}
      {selectedEmployee && !statusLoading && clearanceStatus && clearanceStatus.qty > 0 && (
        <Box sx={{ mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 3,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              background: 'linear-gradient(135deg, #fff8f0 0%, #fff3e6 100%)',
              border: '1px solid #f0d9c2'
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LockIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#d97706', mb: 0.5 }}>
                ACTION REQUIRED
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#3b2f2f', mb: 1 }}>
                Clearance pending for {selectedEmployee?.employeeName}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#6b4f3a', mb: 2 }}>
                Exit interview form is locked until all clearance items are completed.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Chip
                  label={`${pendingCount} Pending Item${pendingCount > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ backgroundColor: '#fde8d7', color: '#b45309', fontWeight: 600 }}
                />
                <Chip
                  icon={<LockIcon sx={{ fontSize: 14 }} />}
                  label="Form Locked"
                  size="small"
                  sx={{ backgroundColor: '#ffe4e6', color: '#be123c', fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Exit Interview Form - Only show if clearance is completed */}
      {selectedEmployee && isClearanceCompleted && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Left Section: Employee Details & Rating */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Interview Date */}
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                      Interview Date *
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={interviewDate}
                        onChange={(newValue) => setInterviewDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f9fafb'
                              }
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Rating Section */}
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                      Overall Experience Rating *
                    </Typography>
                    <Rating
                      value={rating}
                      onChange={(event, newValue) => setRating(newValue)}
                      sx={{
                        fontSize: '3rem',
                        mb: 1.5,
                        '& .MuiRating-iconFilled': { color: '#f59e0b' }
                      }}
                    />
                    <Typography sx={{ fontWeight: 600, color: rating === 0 ? '#6b7280' : '#f59e0b' }}>
                      {rating === 0 ? 'Please select a rating' : `${rating} star${rating > 1 ? 's' : ''}`}
                    </Typography>
                    {rating > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {rating <= 2 ? 'Poor experience' : rating === 3 ? 'Average experience' : rating === 4 ? 'Good experience' : 'Excellent experience'}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Section: Questions & Feedback */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                    <QuestionAnswerIcon sx={{ color: '#7C3AED', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Exit Interview Questions
                    </Typography>
                    {!editingFeedback && feedback && (
                      <Chip
                        label="Feedback Provided"
                        size="small"
                        color="success"
                        sx={{ ml: 'auto' }}
                      />
                    )}
                  </Box>

                  {/* Questions Accordion */}
                  <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600, color: '#7C3AED' }}>
                        Questions & Answers
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {exitQuestions.map((q, index) => (
                          <ListItem key={q.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <QuestionAnswerIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography sx={{ fontWeight: 600, color: '#334155', mb: 1 }}>
                                  {index + 1}. {q.question}
                                </Typography>
                              }
                              secondary={
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={2}
                                  variant="outlined"
                                  disabled
                                  size="small"
                                  placeholder="Enter answer..."
                                  value={answers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  sx={{
                                    mt: 1,
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      backgroundColor: '#fafafa'
                                    }
                                  }}
                                />
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Feedback Section */}
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <FeedbackIcon sx={{ color: '#7C3AED', fontSize: 24 }} />
                      <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>
                        HR Feedback & Comments *
                      </Typography>
                    </Box>
                    <TextField
                      multiline
                      fullWidth
                      rows={5}
                      placeholder="Provide detailed HR feedback and observations from the exit interview..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fafafa',
                          '&:hover': { backgroundColor: '#f1f5f9' },
                          '&.Mui-focused': {
                            backgroundColor: '#fff',
                            boxShadow: '0 0 0 3px rgba(124,58,237,0.15)'
                          }
                        }
                      }}
                    />
                  </Box>

                  {/* Suggested Topics */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Suggested topics to cover:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {[
                        'Work culture',
                        'Management feedback',
                        'Team collaboration',
                        'Growth opportunities',
                        'Compensation & benefits',
                        'Work-life balance'
                      ].map((label, i) => (
                        <Chip
                          key={i}
                          label={label}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 2, borderColor: '#e2e8f0', '&:hover': { backgroundColor: '#f1f5f9' } }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Save Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={handleSubmit}
                      disabled={!isFormValid || saving}
                      startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                        color: 'white',
                        fontWeight: 600,
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)'
                        }
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Exit Interview'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {!selectedEmployee && (
        <Paper sx={{ p: 8, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 3 }}>
          <PersonIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {loading ? 'Loading Employees...' : 'No Employee Selected'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {loading
              ? 'Fetching employee data...'
              : 'Please select an employee from the dropdown above to begin the exit interview process.'}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExitInterviewManagement;