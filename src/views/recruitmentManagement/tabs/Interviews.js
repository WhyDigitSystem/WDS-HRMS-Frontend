import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Paper,
  Avatar,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

const Interviews = ({ interviews, onAddFeedback, onDeleteInterview, config }) => {
  if (interviews.length === 0) {
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
        <Typography variant="h6" color="text.secondary">
          No interviews scheduled
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Schedule interviews from the Candidates tab
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {interviews.map((interview) => (
        <Grid item xs={12} md={6} lg={4} key={interview.id}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Header Section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: config.primary_action_color,
                    width: 48,
                    height: 48
                  }}>
                    {interview.candidate_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {interview.candidate_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interview.position}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={interview.status}
                  size="small"
                  sx={{
                    backgroundColor: `${config.primary_action_color}20`,
                    color: config.primary_action_color,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Interview Details */}
              <Box sx={{ mb: 2 }}>
                {/* Date & Time */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 20, color: config.primary_action_color }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {interview.interview_date}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {interview.interview_time}
                    </Typography>
                  </Box>
                </Box>

                {/* Interviewer */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 20, color: config.primary_action_color }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Interviewer
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {interview.interviewer}
                    </Typography>
                  </Box>
                </Box>

                {/* Interview Type */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 20, color: config.primary_action_color }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Type
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {interview.interview_type}
                    </Typography>
                  </Box>
                </Box>

                {/* Rating (if available) */}
                {interview.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <StarIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Rating
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {interview.rating}/5
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Feedback Section */}
              {interview.feedback && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    bgcolor: 'rgba(59, 130, 246, 0.03)',
                    borderColor: `${config.primary_action_color}20`,
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CommentIcon sx={{ fontSize: 18, color: config.primary_action_color }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Feedback
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {interview.feedback}
                  </Typography>
                </Paper>
              )}
            </CardContent>

            {/* Actions */}
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
              <Button
                size="small"
                onClick={() => onAddFeedback(interview)}
                variant={interview.feedback ? "outlined" : "contained"}
                sx={{
                  background: interview.feedback ? 'transparent' : `linear-gradient(135deg, ${config.primary_action_color} 0%, #2563eb 100%)`,
                  color: interview.feedback ? config.primary_action_color : 'white',
                  borderColor: config.primary_action_color,
                  '&:hover': {
                    backgroundColor: interview.feedback ? `${config.primary_action_color}10` : undefined,
                  }
                }}
              >
                {interview.feedback ? 'Edit Feedback' : 'Add Feedback'}
              </Button>
              <Tooltip title="Delete Interview">
                <IconButton
                  size="small"
                  onClick={() => onDeleteInterview(interview.id)}
                  sx={{ 
                    color: '#64748b',
                    '&:hover': {
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Interviews;