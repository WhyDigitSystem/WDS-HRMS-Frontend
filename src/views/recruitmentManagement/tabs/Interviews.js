import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Rating
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';

const Interviews = ({ config }) => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedBack: ''
  });

  useEffect(() => {
    getScheduledInterviews();
  }, [orgId, branchCode]);

  const getScheduledInterviews = async () => {
    try {
      setLoading(true);
      const response = await apiCalls('get', `recruitmentmanagement/getSchedulerCandidatesByOrgId?branchCode=${branchCode}&orgId=${orgId}`);
      if (response.status === true) {
        setInterviews(response.paramObjectsMap.candidatesVO || []);
      } else {
        console.error('API Error:', response);
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeedbackDialog = (interview) => {
    setSelectedInterview(interview);
    setFeedbackData({
      rating: interview.rating || 0,
      feedBack: interview.feedBack || ''
    });
    setOpenFeedbackDialog(true);
  };

  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    setSelectedInterview(null);
    setFeedbackData({
      rating: 0,
      feedBack: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = dayjs(dateString);
    return date.isValid() ? date.format('DD-MM-YYYY') : 'N/A';
  };

  const handleFeedbackChange = (field, value) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveFeedback = async () => {
    try {
      if (!selectedInterview) return;

      // Prepare only fields the API expects
      const payload = {
        id: selectedInterview.id,
        candidatesName: selectedInterview.candidatesName,
        email: selectedInterview.email,
        positionApplied: selectedInterview.positionApplied,
        resumeScore: selectedInterview.resumeScore || 0,
        interviewDate: selectedInterview.interviewDate,
        interviewTime: selectedInterview.interviewTime,
        interviewer: selectedInterview.interviewer,
        rating: feedbackData.rating || 0,
        feedBack: feedbackData.feedBack || '',
        orgId: parseInt(orgId),
        branch: selectedInterview.branch || 'BENGALURU',
        branchCode: selectedInterview.branchCode || branchCode,
        createdBy: selectedInterview.createdBy || loginUserName,
        active: selectedInterview.active === 'Active' || selectedInterview.active === true,
      };

      console.log('🧾 Final Payload:', payload);

      const response = await apiCalls('put', 'recruitmentmanagement/createUpdateCandidates', payload);

      if (response.status === true) {
        await getScheduledInterviews();
        handleCloseFeedbackDialog();
        showToast('success', 'Feedback saved successfully!');
      } else {
        showToast('error', 'Failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      showToast('error', 'Error saving feedback. Please try again.');
    }
  };

  const transformedInterviews = interviews
    .filter(interview => interview.interviewDate && interview.interviewTime)
    .map(interview => ({
      id: interview.id,
      candidate_name: interview.candidatesName,
      position: interview.positionApplied,
      interview_date: interview.interviewDate,
      interview_time: interview.interviewTime,
      interviewer: interview.interviewer,
      rating: interview.rating,
      feedback: interview.feedBack,
      status: interview.active === 'Active' || interview.active === true ? 'Scheduled' : 'Cancelled',
      email: interview.email,
      resumeScore: interview.resumeScore,
      active: interview.active
    }));

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading interviews...</Typography>
      </Box>
    );
  }

  if (transformedInterviews.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: 2,
          border: '2px dashed #cbd5e1'
        }}
      >
        <ScheduleIcon sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No interviews scheduled
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Schedule interviews from the Candidates tab
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {transformedInterviews.map((interview) => (
          <Grid item xs={12} md={6} lg={4} key={interview.id}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                height: '100%',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, ${config.primary_action_color} 0%, transparent 100%)`,
                },
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${config.primary_action_color}20`,
                      color: config.primary_action_color,
                      width: 52,
                      height: 52,
                      fontWeight: 600,
                      border: `2px solid ${config.primary_action_color}30`
                    }}
                  >
                    {interview.candidate_name?.charAt(0) || 'C'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {interview.candidate_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interview.position}
                    </Typography>
                  </Box>
                </Box>

                {/* Details */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: `${config.primary_action_color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: config.primary_action_color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(interview.interview_date)} at {interview.interview_time}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: `${config.primary_action_color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PersonIcon sx={{ fontSize: 16, color: config.primary_action_color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Interviewer
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {interview.interviewer}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: `${config.primary_action_color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BusinessIcon sx={{ fontSize: 16, color: config.primary_action_color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Resume Score
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: config.primary_action_color }}>
                        {interview.resumeScore}%
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                {/* Status & Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip
                    label={interview.status}
                    size="small"
                    sx={{
                      backgroundColor: interview.status === 'Scheduled' ? '#dcfce7' : '#fef2f2',
                      color: interview.status === 'Scheduled' ? '#166534' : '#dc2626',
                      fontWeight: 600,
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenFeedbackDialog(interviews.find(i => i.id === interview.id))}
                      sx={{
                        bgcolor: `${config.primary_action_color}15`,
                        color: config.primary_action_color,
                        '&:hover': {
                          bgcolor: config.primary_action_color,
                          color: 'white'
                        }
                      }}
                    >
                      <CommentIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Feedback Dialog */}
      <Dialog
        open={openFeedbackDialog}
        onClose={handleCloseFeedbackDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {selectedInterview?.feedBack ? 'Edit Feedback' : 'Add Feedback'}
          <IconButton onClick={handleCloseFeedbackDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Rating (1-10)
              </Typography>
              <Rating
                value={feedbackData.rating}
                onChange={(event, newValue) => handleFeedbackChange('rating', newValue || 0)}
                max={10}
                size="large"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Selected: {feedbackData.rating}/10
              </Typography>
            </Box>

            <TextField
              label="Feedback"
              fullWidth
              multiline
              rows={4}
              value={feedbackData.feedBack}
              onChange={(e) => handleFeedbackChange('feedBack', e.target.value)}
              placeholder="Enter your feedback about the candidate's performance..."
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseFeedbackDialog}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveFeedback}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              backgroundColor: config.primary_action_color,
              '&:hover': {
                backgroundColor: config.primary_action_color
              }
            }}
          >
            Save Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Interviews;