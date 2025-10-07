import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  Paper,
  Fade,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Slide
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

function WorkAnniversaries() {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [todayAnniversaries, setTodayAnniversaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (orgId) fetchWorkAnniversaries();
  }, [orgId]);

  const fetchWorkAnniversaries = async () => {
    setIsLoading(true);
    try {
      const result = await apiCalls('get', `/basicmaster/Getworkaniversary?orgId=${orgId}`);
      if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
        const anniversaries = result.paramObjectsMap.employee.map(emp => ({
          name: emp.employee || emp.employeecode || 'Employee',
          initials: (emp.employee?.[0] || emp.employeecode?.[0] || 'E').toUpperCase(),
          employeeId: emp.employeecode || emp.employeeid || 'N/A',
          role: emp.designation || 'Employee',
          years: emp.noofyears || 0,
          image: emp.profileImage || '',
          department: emp.department || '',
        }));
        setTodayAnniversaries(anniversaries);
      } else {
        setTodayAnniversaries([]);
      }
    } catch (error) {
      console.error('Error fetching work anniversaries:', error);
      showToast('Failed to fetch work anniversaries', 'error');
      setTodayAnniversaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box mt={4} px={2} sx={{ overflow: 'hidden' }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4);}
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(21, 101, 192, 0);}
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(21, 101, 192, 0);}
          }
        `}
      </style>

      {isLoading ? (
        <Box textAlign="center">
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
          <Skeleton variant="rectangular" width="90%" height={200} sx={{ mx: 'auto', borderRadius: 4 }} />
        </Box>
      ) : todayAnniversaries.length > 0 ? (
        <>
          <Box sx={{ mb: 2 }}>
            <Paper elevation={6} sx={{
              borderRadius: 6,
              p: 2,
              backdropFilter: 'blur(8px)',
              background: 'rgba(255, 255, 255, 0.85)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'scale(1.02)' },
            }}>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar
                  src={todayAnniversaries[0].image ? `data:image/png;base64,${todayAnniversaries[0].image}` : ''}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#1976d2',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 20,
                  }}
                >
                  {!todayAnniversaries[0].image && todayAnniversaries[0].name[0]}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  {todayAnniversaries[0].name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {todayAnniversaries[0].role}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {todayAnniversaries[0].employeeId}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                  <Chip icon={<CelebrationIcon />} label={`${todayAnniversaries[0].years} Year${todayAnniversaries[0].years > 1 ? 's' : ''}`} color="primary" />
                  <Chip icon={<WorkIcon />} label="Anniversary" color="success" variant="outlined" />
                </Box>
              </Box>
            </Paper>
          </Box>

          {todayAnniversaries.length > 1 && (
            <Box textAlign="center">
              <Tooltip title="View All Work Anniversaries">
                <IconButton
                  onClick={() => setOpenDialog(true)}
                  size="small"
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#115293' },
                    borderRadius: '50%',
                    boxShadow: 3,
                    width: 32,
                    height: 32,
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body2" align="center" sx={{ color: '#757575', fontStyle: 'italic', mt: 2 }}>
          No work anniversaries today
        </Typography>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 0 }}>
          🎊 All Work Anniversaries Today
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 0 }}>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
            gap={3}
            px={1}
            py={2}
          >
            {todayAnniversaries.map((person, index) => (
              <Fade in timeout={500 + index * 200} key={index}>
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: 4,
                    p: 1,
                    background: '#fff',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                    <Avatar
                      src={person.image ? `data:image/png;base64,${person.image}` : ''}
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 20,
                      }}
                    >
                      {!person.image && person.name[0]}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                      {person.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {person.role}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {person.employeeId}
                    </Typography>
                    <Box mt={1} display="flex" gap={1} justifyContent="center">
                      <Chip icon={<CelebrationIcon />} label={`${person.years} Year${person.years > 1 ? 's' : ''}`} color="primary" size="small" />
                      <Chip icon={<WorkIcon />} label="Anniversary" color="success" variant="outlined" size="small" />
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default WorkAnniversaries;
