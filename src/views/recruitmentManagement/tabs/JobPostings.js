import React, { useEffect, useState } from 'react';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Switch,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  WorkOutline as WorkIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  CastForEducationSharp
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';

const JobPostings = ({ jobs, setJobs, config }) => {
  const educationOptions = [
    //   'SSLC',
    //   'HSC',
    //   'Diploma',
    //   'Any Graduate',
    'B.E',
    'B.Tech',
    'B.Sc',
    'BCA',
    //   'Any Post Graduate',
    'M.E',
    'M.Tech',
    'M.Sc',
    'MCA',
    'MBA',
    'PhD'
  ];
  const skillsOptions = [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React JS',
    'Angular',
    'Vue JS',
    'Node.js',
    'Express.js',
    'Java',
    'Spring Boot',
    'Python',
    'Django',
    'MySQL',
    'MongoDB',
    'Git',
    'REST API',
    'AWS',
    'Manual Testing',
    'Selenium'
  ];
  const experienceOptions = ['0-1 Year', '1-2 Year', '2-3 Year', '3-4 Year', '4-5 Year'];

  const [searchText, setSearchText] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  // const [jobs, setJobs] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [addJobModalOpen, setAddJobModalOpen] = useState(false);
  const [viewJobModalOpen, setViewJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newJobData, setNewJobData] = useState({
    jobTitle: '',
    department: '',
    location: '',
    education: [],
    skills: [],
    keywords: [],
    experience: '',
    description: '',
    active: true
  });

  useEffect(() => {
    getJobPostings();
    getAllDepartment();
    getAllBranches();
  }, [orgId, branchCode]);

  const primaryColor = config.primary_action_color || '#2563eb';
  const secondaryColor = config.secondary_action_color || '#6b7280';

  const getJobPostings = async () => {
    try {
      setLoading(true);
      const response = await apiCalls('get', `recruitmentmanagement/getJobPostingsByOrgId?branchCode=${branchCode}&orgId=${orgId}`);
      if (response.status === true) {
        setJobs(response.paramObjectsMap.jobPostingsVO.reverse() || []);
      } else {
        console.error('API Error:', response);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO || []);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const getAllBranches = async () => {
    try {
      const response = await apiCalls('get', `/master/branch?orgid=${orgId}`);

      if (response.status) {
        const branches = response.paramObjectsMap?.branchVO || [];
        const branchNames = branches.map((branch) => branch.branch || branch.branchName || branch.name || 'Unknown');
        setBranchList(branchNames);
      } else {
        showToast('warning', 'Failed to fetch branches, using default list');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      showToast('warning', 'Failed to fetch branches, using default list');
      setBranchList(['ALL', 'BANGALORE', 'CHENNAI', 'Hyderabad']);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setViewJobModalOpen(true);
  };

  const handleCloseViewJobModal = () => {
    setViewJobModalOpen(false);
    setSelectedJob(null);
  };

  const handleAddJobClick = () => {
    setAddJobModalOpen(true);
  };

  const handleCloseAddJobModal = () => {
    setAddJobModalOpen(false);
    setNewJobData({
      jobTitle: '',
      department: '',
      location: '',
      education: [],
      skills: [],
      keywords: [],
      experience: '',
      description: '',
      branch: branchCode || '',
      branchCode: branchCode || '',
      createdBy: localStorage.getItem('username') || 'admin',
      orgId: parseInt(orgId) || 0,
      active: true
    });
  };

  const handleInputChange = (field, value) => {
    setNewJobData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newJobData.jobTitle?.trim()) {
      newErrors.jobTitle = 'Job Title is required';
    }

    if (!newJobData.department) {
      newErrors.department = 'Department is required';
    }

    if (!newJobData.location) {
      newErrors.location = 'Location is required';
    }

    if (!newJobData.education?.length) {
      newErrors.education = 'Education Qualification is required';
    }

    if (!newJobData.skills?.length) {
      newErrors.skills = 'Skills are required';
    }

    if (!newJobData.experience) {
      newErrors.experience = 'Experience is required';
    }

    if (!newJobData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCreateJob = async () => {
    if (!validateForm()) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    try {
      const payload = {
        ...newJobData,
        branch: branch || '',
        branchCode: branchCode || '',
        createdBy: loginUserName,
        orgId: parseInt(orgId)
      };

      const response = await apiCalls('put', 'recruitmentmanagement/createUpdateJobPostings', payload);

      if (response.status === true) {
        await getJobPostings();
        handleCloseAddJobModal();
        showToast('success', 'Job posting created successfully!');
      } else {
        showToast('error', 'Failed to create job posting: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating job:', error);
      showToast('error', 'Error creating job posting');
    }
  };

  const departmentOptions = departmentList.map((dept) => ({
    value: dept.departmentName,
    label: dept.departmentName
  }));

  const transformedJobs = jobs.map((job) => ({
    id: job.id,
    job_title: job.jobTitle,
    department: job.department,
    location: job.location,
    status: job.active ? 'Active' : 'Inactive',
    postedDate: job.commonDate ? job.commonDate.createdon : '',
    skills: job.skills,
    experience: job.experience,
    education: job.education,
    applications: 0, // You might want to add this field to your API
    salary: '' // You might want to add this field to your API
  }));

  const handleRemoveKeyword = (index) => {
    setNewJobData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
      <ToastContainer />
      <Box>
        {/* Header with Add New Button */}
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddJobClick}
            sx={{
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              color: 'white',
              fontWeight: 600,
              px: 1,
              py: 0.55,
              borderRadius: 2,
              letterSpacing: '0.5px',
              fontSize: '14px',

              '&:hover': {
                transform: 'scale(1.06)',
                background: 'linear-gradient(135deg, #4b8587 0%, #355f61 100%)'
              },

              '&:active': {
                transform: 'scale(0.97)'
              }
            }}
          >
            Add New
          </Button>
        </Box>

        {/* Add Job Modal */}
        <Dialog
          open={addJobModalOpen}
          onClose={handleCloseAddJobModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle
            sx={{
              px: 1,
              py: 0.5,
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#fff'
              }}
            >
              Create Job Posting
            </Typography>
            <IconButton onClick={handleCloseAddJobModal} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon color="error" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              {/* Job Title */}
              <TextField
                label="Job Title"
                required
                fullWidth
                size="small"
                value={newJobData.jobTitle}
                error={!!errors.jobTitle}
                helperText={errors.jobTitle}
                onChange={(e) => {
                  handleInputChange('jobTitle', e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    jobTitle: ''
                  }));
                }}
                placeholder="e.g., Senior Frontend Developer"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    height: 40
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem'
                  }
                }}
              />

              {/* Department */}
              <Autocomplete
                options={departmentOptions}
                size="small"
                getOptionLabel={(option) => option.label}
                value={departmentOptions.find((option) => option.value === newJobData.department) || null}
                onChange={(event, newValue) => {
                  handleInputChange('department', newValue ? newValue.value : '');

                  setErrors((prev) => ({
                    ...prev,
                    department: ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    required
                    error={!!errors.department}
                    helperText={errors.department}
                    placeholder="Select Department"
                    size="small"
                  />
                )}
              />

              {/* Location */}
              <Autocomplete
                options={branchList}
                value={newJobData.location}
                onChange={(event, newValue) => {
                  handleInputChange('location', newValue);

                  setErrors((prev) => ({
                    ...prev,
                    location: ''
                  }));
                }}
                loading={loading}
                size="small"
                clearOnEscape
                disableClearable={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Work Location"
                    placeholder="Select Location"
                    required
                    error={!!errors.location}
                    helperText={errors.location}
                    fullWidth
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
              />

              {/* Education */}
              <Autocomplete
                multiple
                options={educationOptions}
                value={newJobData.education}
                onChange={(event, newValue) => {
                  handleInputChange('education', newValue);

                  setErrors((prev) => ({
                    ...prev,
                    education: ''
                  }));
                }}
                loading={loading}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Education Qualification"
                    required
                    error={!!errors.education}
                    helperText={errors.education}
                    fullWidth
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
              />

              {/* Skills */}
              <Autocomplete
                multiple
                options={skillsOptions}
                value={newJobData.skills}
                onChange={(event, newValue) => {
                  handleInputChange('skills', newValue);

                  setErrors((prev) => ({
                    ...prev,
                    skills: ''
                  }));
                }}
                loading={loading}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Skills"
                    required
                    error={!!errors.skills}
                    helperText={errors.skills}
                    fullWidth
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
              />

              {/* Keywords */}
              <TextField
                label="Keywords"
                placeholder="Type keyword and press Enter"
                size="small"
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchText.trim()) {
                    e.preventDefault();

                    setNewJobData((prev) => {
                      if (prev.keywords.includes(searchText.trim())) return prev;

                      return {
                        ...prev,
                        keywords: [...prev.keywords, searchText.trim()]
                      };
                    });

                    setSearchText('');
                  }
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  overflowX: 'auto',
                  flexWrap: 'wrap'
                }}
              >
                {newJobData.keywords.map((item, index) => (
                  <Card
                    key={index}
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 2,
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="body2">{item}</Typography>

                    <CloseIcon
                      onClick={() => handleRemoveKeyword(index)}
                      sx={{
                        fontSize: 16,
                        cursor: 'pointer',
                        color: '#fff !important'
                      }}
                    />
                  </Card>
                ))}
              </Box>

              {/* Experience */}
              <Autocomplete
                options={experienceOptions}
                value={newJobData.experience}
                onChange={(event, newValue) => {
                  handleInputChange('experience', newValue);

                  setErrors((prev) => ({
                    ...prev,
                    experience: ''
                  }));
                }}
                loading={loading}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Experience"
                    required
                    error={!!errors.experience}
                    helperText={errors.experience}
                    fullWidth
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
              />

              {/* Description */}
              <TextField
                label="Description"
                required
                fullWidth
                size="small"
                multiline
                rows={4}
                value={newJobData.description}
                error={!!errors.description}
                helperText={errors.description}
                onChange={(e) => {
                  handleInputChange('description', e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    description: ''
                  }));
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem'
                  }
                }}
              />

              {/* Job Status */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Job Status
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Switch
                    checked={newJobData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#3a6b6d'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#3a6b6d'
                      }
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      color: newJobData.active ? '#22c55e' : '#64748b',
                      fontWeight: 600
                    }}
                  >
                    {newJobData.active ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              p: 2,
              gap: 1,
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}
          >
            <Button
              onClick={handleCloseAddJobModal}
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 0.7,
                fontWeight: 600,
                color: '#64748b',
                borderColor: '#cbd5e1',
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: '#f1f5f9'
                }
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleCreateJob}
              sx={{
                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 0.7,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(58,107,109,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4b8587 0%, #355f61 100%)',
                  boxShadow: '0 6px 16px rgba(58,107,109,0.35)'
                }
              }}
            >
              Create Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Job Details Modal */}
        <Dialog
          open={viewJobModalOpen}
          onClose={handleCloseViewJobModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.3)'
              }
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              py: 1.2,
              px: 2,
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px 8px 0 0'
            }}
          >
            Job Details
          </DialogTitle>

          <DialogContent
            sx={{
              p: 2,
              background: '#f8fafc'
            }}
          >
            {selectedJob && (
              <Box
                sx={{
                  background: '#fff',
                  overflow: 'hidden'
                }}
              >
                {[
                  { label: 'Job Title', value: selectedJob.jobTitle },
                  { label: 'Department', value: selectedJob.department },
                  {
                    label: 'Skills',
                    value: Array.isArray(selectedJob.skills) ? selectedJob.skills.join(', ') : selectedJob.skills
                  },
                  { label: 'Experience', value: selectedJob.experience },
                  {
                    label: 'Education Qualification',
                    value: Array.isArray(selectedJob.education) ? selectedJob.education.join(', ') : selectedJob.education
                  },
                  { label: 'Branch', value: selectedJob.branch },
                  { label: 'Job Location', value: selectedJob.location },
                  {
                    label: 'Status',
                    value: selectedJob.active ? 'Active' : 'Inactive'
                  },
                  {
                    label: 'Created On',
                    value: selectedJob.commonDate?.createdon
                  }
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.4,
                      borderBottom: idx !== 8 ? '1px solid #f1f5f9' : 'none',
                      '&:hover': {
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#64748b',
                        minWidth: 180
                      }}
                    >
                      {item.label}
                    </Typography>

                    {item.label === 'Status' ? (
                      <Chip
                        label={item.value}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: item.value === 'Active' ? 'rgba(58,107,109,0.12)' : '#fee2e2',
                          color: item.value === 'Active' ? '#2a4b4d' : '#dc2626'
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#1e293b',
                          textAlign: 'right',
                          maxWidth: '65%',
                          wordBreak: 'break-word'
                        }}
                      >
                        {item.value || '-'}
                      </Typography>
                    )}
                  </Box>
                ))}

                {selectedJob.description && (
                  <Box
                    sx={{
                      px: 2,
                      py: 2,
                      borderTop: '1px solid #e2e8f0',
                      background: '#fafafa'
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#3a6b6d',
                        mb: 1
                      }}
                    >
                      Description
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '13px',
                        color: '#475569',
                        lineHeight: 1.8
                      }}
                    >
                      {selectedJob.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>

          {/* <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseViewJobModal}
                        variant="contained"
                        sx={{
                            backgroundColor: primaryColor,
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 3,
                            py: 1,
                            '&:hover': {
                                backgroundColor: primaryColor
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions> */}
        </Dialog>

        {/* Loading State */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading job postings...</Typography>
          </Box>
        )}

        {/* Jobs Grid */}
        {!loading && transformedJobs.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              maxWidth: 400,
              mx: 'auto',
              mt: 2
            }}
          >
            <WorkIcon
              sx={{
                fontSize: 48,
                color: '#3a6b6d',
                mb: 1.5,
                opacity: 0.8
              }}
            />
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              No Job Postings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 280, mx: 'auto', fontSize: '0.875rem' }}>
              Create your first job posting to attract qualified candidates.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddJobClick}
              sx={{
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Create Job Posting
            </Button>
          </Box>
        ) : (
          !loading && (
            <Grid container spacing={1.5}>
              {transformedJobs.map((job) => (
                <Grid item xs={12} sm={6} lg={4} key={job.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'white',
                      border: '1px solid #f1f5f9',
                      borderRadius: 1.5,
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
                        borderColor: primaryColor
                      }
                    }}
                  >
                    {/* Header with subtle accent */}
                    <Box
                      sx={{
                        height: 3,
                        background: 'linear-gradient(90deg, #3a6b6d 0%, #2a4b4d 100%)',
                        opacity: 0.8
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                      {/* Job Title with Work Icon */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                        <WorkIcon
                          sx={{
                            fontSize: 18,
                            color: '#dc2626',
                            mt: 0.25,
                            opacity: 0.9
                          }}
                        />
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            lineHeight: 1.4,
                            color: 'text.primary',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flex: 1
                          }}
                        >
                          {job.job_title}
                        </Typography>
                      </Box>

                      {/* Department and Location - Compact */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <BusinessIcon
                            sx={{
                              fontSize: 14,
                              color: '#3a6b6d',
                              opacity: 0.8
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.primary',
                              fontSize: '0.8rem',
                              fontWeight: 500
                            }}
                          >
                            {job.department}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocationIcon
                            sx={{
                              fontSize: 14,
                              color: '#2a4b4d',
                              opacity: 0.8
                            }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.8rem'
                            }}
                          >
                            {job.location}
                          </Typography>
                        </Box>
                        {/* Added Posted Date Icon */}
                        {job.postedDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <ScheduleIcon
                              sx={{
                                fontSize: 14,
                                color: '#3a6b6d',
                                opacity: 0.8
                              }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.8rem'
                              }}
                            >
                              {job.postedDate}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>

                    {/* Footer with Status and Actions - Compact */}
                    <Box
                      sx={{
                        p: 2,
                        pt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #f8fafc'
                      }}
                    >
                      {/* Status Chip */}
                      <Chip
                        label={job.status}
                        size="small"
                        sx={{
                          backgroundColor: job.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                          color: job.status === 'Active' ? '#166534' : '#374151',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                          border: job.status === 'Active' ? `1px solid #bbf7d0` : `1px solid #e5e7eb`,
                          borderRadius: 0.75
                        }}
                      />

                      {/* Actions - Minimal */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<ViewIcon sx={{ fontSize: 16, color: primaryColor }} />}
                          onClick={() => handleViewJob(jobs.find((j) => j.id === job.id))}
                          sx={{
                            color: primaryColor,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.75,
                            '&:hover': {
                              backgroundColor: `${primaryColor}08`
                            }
                          }}
                        >
                          View
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Box>
    </>
  );
};

export default JobPostings;
