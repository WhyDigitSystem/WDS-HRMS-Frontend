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
  Rating,
  MenuItem
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
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

const Interviews = ({ interviews, setInterviews, config }) => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  // const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedBack: '',
    interviewStatus: '' 
  });

  useEffect(() => {
    getScheduledInterviews();
  }, [orgId, branchCode]);

  const getScheduledInterviews = async () => {
    try {
      setLoading(true);
      const response = await apiCalls('get', `recruitmentmanagement/getSchedulerCandidatesByOrgId?branchCode=${branchCode}&orgId=${orgId}`);
      if (response.status === true) {
        setInterviews(response.paramObjectsMap.candidatesVO.reverse() || []);
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
      feedBack: interview.feedBack || '',
      interviewStatus: interview.interviewStatus || ''
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
        interviewStatus: feedbackData.interviewStatus || '',
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
      interviewStatus:interview.interviewStatus,
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
    <ToastContainer />
      <Grid container spacing={3}>
        {transformedInterviews.map((interview) => (
          <Grid item xs={12} md={6} lg={4} key={interview.id}>
           <Card
  sx={{
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,

   
    background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.35)',

    /* Base shadow */
    boxShadow: `
      0 10px 30px rgba(0,0,0,0.12),
      inset 0 1px 0 rgba(255,255,255,0.4)
    `,

    transition: 'all 0.35s ease',

    /* Glow gradient border */
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      padding: '0px',
      borderRadius: 4,
      background: `linear-gradient(
        120deg,
        ${config.primary_action_color},
        transparent,
        ${config.primary_action_color}
      )`,
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      pointerEvents: 'none',
      opacity: 0.6,
    },

    /* Shimmer overlay */
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      // background:
        // 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
      transform: 'translateX(-100%)',
      transition: 'transform 0.8s ease',
      pointerEvents: 'none',
    },

    '&:hover': {
      transform: 'translateY(-8px) scale(1.03)',
      boxShadow: `
        0 25px 60px rgba(0,0,0,0.18),
        0 0 25px ${config.primary_action_color}55
      `,
    },

    '&:hover::after': {
      transform: 'translateX(100%)',
    },
  }}
>

              <CardContent sx={{ p: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
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
                {/* Status Icon */}
  <Box>
    {interview.interviewStatus === 'SELECTED' && (
      <CheckCircleRoundedIcon
        sx={{
          fontSize: 28,
          color: '#16a34a',
          filter: 'drop-shadow(0 0 6px rgba(22,163,74,0.6))',
        }}
      />
    )}

    {interview.interviewStatus === 'REJECTED' && (
      <CancelRoundedIcon
        sx={{
          fontSize: 28,
          color: '#dc2626',
          filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.6))',
        }}
      />
    )}
  </Box>
                </Box>
                <Box sx={{borderBottom: 1, borderBottom: 1, borderColor: 'divider'}}></Box>

                {/* Details */}
                <Stack spacing={2} sx={{ mb: 0 ,mt:0.5}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      fontSize: 11,
                        // height: 22,
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
                      <CommentIcon sx={{ fontSize: 16 }} />
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
                onChange={(event, newValue) =>
                  handleFeedbackChange('rating', newValue || 0)
                }
                max={10}
                size="large"
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
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
            />

            <TextField
              select
              label="Interview Result"
              fullWidth
              size="small"
              value={feedbackData.interviewStatus}
              onChange={(e) => handleFeedbackChange('interviewStatus', e.target.value)}
            >
              <MenuItem value="SELECTED">Selected</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="HOLD">Hold</MenuItem>
            </TextField>
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