import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import CommonListView from '../../../utils/AssetCommonListViewTable';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';

const Candidates = ({ candidates, setCandidates, config }) => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  // const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobPostings, setJobPostings] = useState([]);
  const [allReportingPersonList, setAllReportingPersonList] = useState([]);

  // Modal states
  const [openCandidateDialog, setOpenCandidateDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Pagination state - same as AssetMaster
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Form data
  const [candidateData, setCandidateData] = useState({
    candidatesName: '',
    email: '',
    positionApplied: '',
    resumeScore: '',
    active: true
  });

  const [scheduleData, setScheduleData] = useState({
    interviewDate: '',
    interviewTime: '',
    interviewer: '',
    rating: '',
    feedBack: ''
  });

  useEffect(() => {
    getCandidates();
    getJobPostings();
    getAllReportingPersonList();
  }, [orgId, branchCode]);

  // Pagination configuration - EXACTLY like AssetMaster
  const paginationConfig = {
    currentPage,
    totalPages: Math.ceil(candidates.length / itemsPerPage),
    itemsPerPage,
    onPageChange: (event, value) => setCurrentPage(value)
  };

  const getJobPostings = async () => {
    try {
      setLoading(true);
      const response = await apiCalls(
        'get',
        `recruitmentmanagement/getJobPostingsByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );
      if (response.status === true) {
        const jobs = response.paramObjectsMap.jobPostingsVO || [];
        setJobPostings(jobs);
      } else {
        setJobPostings([]);
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
      setJobPostings([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllReportingPersonList = async () => {
    try {
      const result = await apiCalls(
        'get',
        `master/getReportingNameForEmployee?branchCode=${branchCode}&employeeCode=Undefined&orgId=${orgId}`
      );
      const employeeList = result?.paramObjectsMap?.employeeVO || [];
      const mappedList = employeeList.map((emp) => ({
        label: emp.employeeName,
        code: emp.employeeCode,
        email: emp.email,
        role: emp.role
      }));
      setAllReportingPersonList(mappedList);
    } catch (err) {
      console.error('Error fetching reporting persons:', err);
      setAllReportingPersonList([]);
    }
  };

  const getCandidates = async () => {
    try {
      setLoading(true);
      const response = await apiCalls('get', `recruitmentmanagement/getCandidatesByOrgId?branchCode=${branchCode}&orgId=${orgId}`);
      if (response.status === true) {
        setCandidates(response.paramObjectsMap.candidatesVO || []);
        setCurrentPage(1); // Reset to first page when data loads
      } else {
        console.error('API Error:', response);
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Candidate Dialog handlers
  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setCandidateData({
      candidatesName: '',
      email: '',
      positionApplied: '',
      resumeScore: '',
      active: true
    });
    setOpenCandidateDialog(true);
    setCurrentPage(1); // Reset to first page when adding new candidate
  };

  const handleOpenEditDialog = (candidate) => {
    setIsEditMode(true);
    setSelectedCandidate(candidate);
    setCandidateData({
      candidatesName: candidate.candidatesName,
      email: candidate.email,
      positionApplied: candidate.positionApplied,
      resumeScore: candidate.resumeScore,
      active: candidate.active === 'Active' || candidate.active === true
    });
    setOpenCandidateDialog(true);
    setCurrentPage(1); // Reset to first page when editing
  };

  const handleCloseCandidateDialog = () => {
    setOpenCandidateDialog(false);
    setSelectedCandidate(null);
    setIsEditMode(false);
    setCandidateData({
      candidatesName: '',
      email: '',
      positionApplied: '',
      resumeScore: '',
      active: true
    });
    setCurrentPage(1); // Reset to first page when canceling
  };

  const handleOpenScheduleDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setScheduleData({
      interviewDate: candidate.interviewDate || '',
      interviewTime: candidate.interviewTime || '',
      interviewer: candidate.interviewer || '',
      rating: candidate.rating || '',
      feedBack: candidate.feedBack || ''
    });
    setOpenScheduleDialog(true);
  };

  const handleCloseScheduleDialog = () => {
    setOpenScheduleDialog(false);
    setSelectedCandidate(null);
    setScheduleData({
      interviewDate: '',
      interviewTime: '',
      interviewer: '',
      rating: '',
      feedBack: ''
    });
  };

  // Input handlers
  const handleInputChange = (field, value) => {
    setCandidateData(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (field, value) => {
    setScheduleData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCandidate = async () => {
    try {
      // Base payload for both add and update
      const payload = {
        ...candidateData,
        branch: branch || '',
        branchCode: branchCode || '',
        createdBy: loginUserName,
        orgId: parseInt(orgId),
        resumeScore: parseInt(candidateData.resumeScore) || 0,
        active: candidateData.active,
        ...(isEditMode && {
          id: selectedCandidate?.id,          // ✅ Include ID only when editing
          updatedBy: loginUserName
        })
      };

      const successMessage = isEditMode
        ? 'Candidate updated successfully!'
        : 'Candidate added successfully!';

      const response = await apiCalls(
        'put',
        'recruitmentmanagement/createUpdateCandidates',
        payload
      );

      if (response.status === true) {
        showToast('success', successMessage);
        handleCloseCandidateDialog();
        await getCandidates();
      } else {
        showToast('error', 'Failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast('error', 'Error processing request. Please try again.');
    }
  };

  // Schedule interview handler
  const handleSaveInterview = async () => {
    try {
      const payload = {
        id: selectedCandidate.id,
        candidatesName: selectedCandidate.candidatesName,
        email: selectedCandidate.email,
        positionApplied: selectedCandidate.positionApplied,
        resumeScore: parseInt(selectedCandidate.resumeScore) || 0,
        orgId: parseInt(orgId),
        branch: branch || '',
        branchCode: branchCode || '',
        active: selectedCandidate.active === 'Active' || selectedCandidate.active === true,
        createdBy: selectedCandidate.createdBy || loginUserName,
        feedBack: scheduleData.feedBack || '',
        interviewDate: scheduleData.interviewDate,
        interviewTime: scheduleData.interviewTime,
        interviewer: scheduleData.interviewer,
        rating: parseInt(scheduleData.rating) || 0
      };

      const response = await apiCalls('put', 'recruitmentmanagement/createUpdateCandidates', payload);

      if (response.status === true) {
        await getCandidates();
        showToast('success', 'Interview scheduled successfully!');
        handleCloseScheduleDialog();
      } else {
        showToast('error', 'Failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast('error', 'Error processing request. Please try again.');
    }
  };

  // Status chip styles
  const getStatusChipStyles = (status) => {
    const isActive = status === 'Active' || status === true;

    return {
      backgroundColor: isActive ? '#dcfce7' : '#fef2f2',
      color: isActive ? '#166534' : '#dc2626',
      fontWeight: 600,
      fontSize: '0.7rem',
      height: 22,
      border: isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
      borderRadius: 0.75
    };
  };

  // Transform API data for table
  const transformedCandidates = candidates.map(candidate => ({
    id: candidate.id,
    candidate_name: candidate.candidatesName,
    candidate_email: candidate.email,
    position_applied: candidate.positionApplied,
    resume_score: candidate.resumeScore || 0,
    status: candidate.active === 'Active' || candidate.active === true ? 'Active' : 'Inactive',
    interview_date: candidate.interviewDate,
    interview_time: candidate.interviewTime,
    interviewer: candidate.interviewer,
    rating: candidate.rating,
    feedBack: candidate.feedBack,
    active: candidate.active
  }));

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Scheduled';
    const date = dayjs(dateString);
    return date.isValid() ? date.format('DD-MM-YYYY') : 'Not Scheduled';
  };
  
  const columns = [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: config.primary_action_color,
              width: 32,
              height: 32,
              fontSize: '0.875rem'
            }}
          >
            {row.candidate_name?.charAt(0) || 'C'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {row.candidate_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {row.candidate_email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'position_applied',
      label: 'Position',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
          {value}
        </Typography>
      )
    },
    {
      key: 'resume_score',
      label: 'Resume Score',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 120 }}>
          <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 6,
                borderRadius: 1,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(135deg, ${config.primary_action_color} 0%, #2563eb 100%)`
                }
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 35, fontSize: '0.8rem' }}>
            {value}%
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <Chip
          label={value}
          size="small"
          sx={getStatusChipStyles(row.active)}
        />
      )
    },
    {
      key: 'interview_date',
      label: 'Interview Date',
      render: (value) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {formatDate(value)} {/* ✅ now shows DD-MM-YYYY */}
        </Typography>
      )
    }
  ];

  const actions = [
    {
      icon: <EditIcon fontSize="small" />,
      tooltip: 'Edit Candidate',
      onClick: (candidate) => handleOpenEditDialog(candidates.find(c => c.id === candidate.id)),
      color: 'primary'
    },
    {
      icon: <ScheduleIcon fontSize="small" />,
      tooltip: 'Schedule Interview',
      onClick: (candidate) => handleOpenScheduleDialog(candidates.find(c => c.id === candidate.id)),
      color: 'primary'
    },
  ];

  return (
    <Box>
      {/* Add Candidate Button */}
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${config.primary_action_color} 0%, #2563eb 100%)`,
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
            borderRadius: 1,
            px: 1,
            py: 1,
            fontSize: '0.8rem',
            minWidth: '110px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
              boxShadow: '0 3px 8px rgba(59, 130, 246, 0.4)'
            }
          }}
        >
          Add Candidate
        </Button>
      </Box>
      <ToastContainer />

      <CommonListView
        data={transformedCandidates}
        columns={columns}
        actions={actions}
        emptyMessage="No candidates yet"
        emptyDescription="Add your first candidate to start the hiring process"
        loading={loading}
        pagination={paginationConfig}
      />

      {/* Rest of your dialogs remain exactly the same */}
      <Dialog
        open={openCandidateDialog}
        onClose={handleCloseCandidateDialog}
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
          {isEditMode ? 'Edit Candidate' : 'Add Candidate'}
          <IconButton onClick={handleCloseCandidateDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Candidate Name"
              size="small"
              fullWidth
              required
              value={candidateData.candidatesName}
              onChange={(e) => handleInputChange('candidatesName', e.target.value)}
            />
            <TextField
              label="Email"
              size="small"
              fullWidth
              required
              type="email"
              value={candidateData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <Autocomplete
              options={jobPostings}
              getOptionLabel={(option) => option.jobTitle || ''}
              value={
                jobPostings.find(
                  (job) => job.jobTitle === candidateData.positionApplied
                ) || null
              }
              onChange={(event, newValue) => {
                handleInputChange('positionApplied', newValue ? newValue.jobTitle : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Position Applied"
                  size="small"
                  fullWidth
                  required
                  placeholder="Select Job Title"
                />
              )}
            />
            <TextField
              label="Resume Score (0-100)"
              size="small"
              fullWidth
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={candidateData.resumeScore}
              onChange={(e) => handleInputChange('resumeScore', e.target.value)}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={candidateData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                  color="success"
                />
              }
              label={candidateData.active ? 'Active' : 'Inactive'}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseCandidateDialog}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCandidate}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              backgroundColor: config.primary_action_color,
              '&:hover': {
                backgroundColor: config.primary_action_color
              }
            }}
          >
            {isEditMode ? 'Update Candidate' : 'Add Candidate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog
        open={openScheduleDialog}
        onClose={handleCloseScheduleDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          Schedule Interview
          <IconButton onClick={handleCloseScheduleDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          {/* ✅ Candidate Info Section */}
          {selectedCandidate && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 1,
                backgroundColor: '#f9fafb',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Avatar
                sx={{
                  bgcolor: config.primary_action_color,
                  width: 40,
                  height: 40,
                  fontSize: '0.875rem'
                }}
              >
                {selectedCandidate.candidatesName?.charAt(0) || 'C'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedCandidate.candidatesName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                >
                  {selectedCandidate.positionApplied}
                </Typography>
              </Box>
            </Box>
          )}

          {/* ✅ Form Fields */}
          <Stack spacing={2}>
            <TextField
              label="Interview Date"
              size="small"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={scheduleData.interviewDate}
              onChange={(e) => handleScheduleChange('interviewDate', e.target.value)}
            />
            <TextField
              label="Interview Time"
              size="small"
              fullWidth
              type="time"
              InputLabelProps={{ shrink: true }}
              value={scheduleData.interviewTime}
              onChange={(e) => handleScheduleChange('interviewTime', e.target.value)}
            />
            <Autocomplete
              options={allReportingPersonList}
              getOptionLabel={(option) => `${option.label} - ${option.code}` || ''}
              value={
                allReportingPersonList.find(
                  (emp) => emp.label === scheduleData.interviewer
                ) || null
              }
              onChange={(event, newValue) =>
                handleScheduleChange('interviewer', newValue ? newValue.label : '')
              }
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start',
                    width: '100%',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: 'text.primary',
                    }}
                  >
                    {`${option.label} - ${option.code}`}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Interviewer"
                  size="small"
                  fullWidth
                  placeholder="Select interviewer"
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseScheduleDialog}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveInterview}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              backgroundColor: config.primary_action_color,
              '&:hover': {
                backgroundColor: config.primary_action_color
              }
            }}
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates;