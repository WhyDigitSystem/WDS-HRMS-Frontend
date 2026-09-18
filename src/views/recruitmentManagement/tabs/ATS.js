import React, { useRef, useState, useEffect } from 'react';
import { Box, Grid, TextField, Typography, Paper, Button, LinearProgress, Avatar, Autocomplete } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm, Controller } from 'react-hook-form';
import apiCalls from 'apicall';
import { ToastContainer } from 'react-toastify';
import { showToast } from 'utils/toast-component';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ATS = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      candidateName: '',
      emailAddress: '',
      mobileNumber: '',
      jobId: '',
      resumefile: null
    }
  });
  const [atsResult, setAtsResult] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event, onChange) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        event.target.value = null; // reset file input
        setSelectedFile(null);
        onChange(null);
      } else {
        setSelectedFile(file);
        onChange(file);
      }
    }
  };

  const handleRemoveFile = (onChange) => {
    setSelectedFile(null);
    onChange(null);
    fileInputRef.current.value = null;
  };

  const onSubmit = async (data) => {
    const SaveData = {
      candidateName: data.candidateName,
      email: data.emailAddress,
      mobile: data.mobileNumber,
      jobId: data.jobId, // only the ID
      orgId,
      branchCode,
      branch,
      createdBy
    };
    console.log(SaveData);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('atsRequestDTO', new Blob([JSON.stringify(SaveData)], { type: 'application/json' }));
      formDataToSend.append('resumefile', data.resumefile);

      // Call API using POST
      const response = await apiCalls('put', '/ats/analyze', formDataToSend, {}, { Accept: 'application/json' });

      if (response?.status === true) {
        setAtsResult(response.paramObjectsMap.atsResult);
        showToast('Resume analyzed successfully', 'success');
        // reset();
        setSelectedFile(null);
      } else {
        showToast(response?.message || 'Failed to analyze resume', 'error');
      }
    } catch (error) {
      console.error('ATS Analyze Error:', error);
      showToast('Something went wrong', 'error');
    }
  };

  const getJobPostings = async () => {
    try {
      const response = await apiCalls('get', `recruitmentmanagement/getJobPostingsByOrgId?branchCode=${branchCode}&orgId=${orgId}`);
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
    }
  };

  useEffect(() => {
    getJobPostings();
  }, []);

  const progressData = {
    'Experience Match': atsResult?.breakdown?.experience_score || 0,
    'Skills Match': atsResult?.breakdown?.skills_score || 0,
    Education: atsResult?.breakdown?.education_score || 0,
    'Keywords Found': atsResult?.matched_keywords?.length ? Math.min(atsResult.matched_keywords.length * 10, 100) : 0
  };

  const handleReset = () => {
    reset({
      candidateName: '',
      emailAddress: '',
      mobileNumber: '',
      jobId: '',
      resumefile: null
    });

    setAtsResult(null);

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <>
      <ToastContainer />

      <Box
        sx={{
          minHeight: '100vh',
          py: 0,
          px: { xs: 2, sm: 4 },
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef5f5 50%, #f8fafc 100%)'
        }}
      >
        <Typography
          variant="h3"
          align="center"
          mb={1}
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          ATS Resume Scoring System
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" mb={2}>
          Upload candidate resumes and get instant AI-powered scoring
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            mb: 2
          }}
        >
          <Button
            variant="contained"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            sx={{
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              color: '#fff',
              fontWeight: 600,
              px: 2,
              py: 0.7,
              borderRadius: '10px',
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(58,107,109,0.25)',

              '&:hover': {
                background: 'linear-gradient(135deg, #4b8587 0%, #355f61 100%)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Reset
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ maxWidth: 1100, mx: 'auto', pl: 0, pr: 2 }}>
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '20px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  Upload Resume
                </Typography>

                <Controller
                  name="candidateName"
                  control={control}
                  rules={{
                    required: 'Candidate Name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' },
                    pattern: { value: /^[A-Za-z\s]+$/, message: 'Only letters and spaces are allowed' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Candidate Name *"
                      size="small"
                      fullWidth
                      error={!!errors.candidateName}
                      helperText={errors.candidateName?.message}
                    />
                  )}
                />

                <Controller
                  name="emailAddress"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address *"
                      size="small"
                      fullWidth
                      error={!!errors.emailAddress}
                      helperText={errors.emailAddress?.message}
                    />
                  )}
                />

                <Controller
                  name="mobileNumber"
                  control={control}
                  rules={{
                    required: 'Mobile Number is required',
                    pattern: { value: /^[0-9]{10}$/, message: 'Invalid Mobile Number format' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mobile Number *"
                      size="small"
                      fullWidth
                      error={!!errors.mobileNumber}
                      helperText={errors.mobileNumber?.message}
                    />
                  )}
                />

                <Controller
                  name="jobId"
                  control={control}
                  rules={{ required: 'Position Applied is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      options={jobPostings}
                      getOptionLabel={(option) => option.jobTitle || ''}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(event, newValue) => field.onChange(newValue?.id || '')}
                      value={jobPostings.find((job) => job.id === field.value) || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Position Applied *"
                          placeholder="Select Job Title"
                          size="small"
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  name="resumefile"
                  control={control}
                  rules={{ required: 'Resume File is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <Box>
                      {/* Hidden file input */}
                      <Typography variant="body1" color={error ? 'error' : 'text.primary'} sx={{ mb: 1 }}>
                        Resume File *
                      </Typography>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              alert('File size must be less than 50MB');
                              e.target.value = null;
                              setSelectedFile('');
                              field.onChange(null);
                            } else {
                              setSelectedFile(file.name);
                              field.onChange(file);
                            }
                          }
                        }}
                      />

                      {/* Upload box */}
                      <Paper
                        variant="outlined"
                        sx={{
                          border: error ? '2px dashed #dc2626' : '2px dashed #3a6b6d',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 2.5,
                          px: 2,
                          mt: 1,
                          bgcolor: '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',

                          '&:hover': {
                            bgcolor: '#eef5f5',
                            borderColor: '#2a4b4d',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(58,107,109,0.12)'
                          }
                        }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: '14px',
                              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 6px 16px rgba(58,107,109,0.25)'
                            }}
                          >
                            <CloudUploadIcon
                              sx={{
                                fontSize: 28,
                                color: '#fff'
                              }}
                            />
                          </Box>

                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: '#1e293b'
                              }}
                            >
                              {field.value ? field.value.name : 'Upload Resume'}
                            </Typography>

                            {field.value ? (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#64748b'
                                }}
                              >
                                {(field.value.size / (1024 * 1024)).toFixed(2)} MB
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#94a3b8'
                                }}
                              >
                                PDF, DOC, DOCX • Max 50MB
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {field.value && (
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile('');
                              field.onChange(null);
                            }}
                            sx={{
                              minWidth: '80px',
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 600,
                              color: '#dc2626',
                              background: '#fee2e2',

                              '&:hover': {
                                background: '#fecaca'
                              }
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </Paper>

                      {/* Error message */}
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />

                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  sx={{
                    mt: 2.5,
                    py: 1.5,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                    boxShadow: '0 4px 12px rgba(58, 107, 109, 0.25)',
                    transition: 'all 0.3s ease',

                    '&:hover': {
                      background: 'linear-gradient(135deg, #2f5a5c 0%, #1f3d3f 100%)',
                      boxShadow: '0 8px 20px rgba(58, 107, 109, 0.35)',
                      transform: 'translateY(-2px)'
                    },

                    '&:active': {
                      transform: 'translateY(0)'
                    },

                    '&:disabled': {
                      background: '#cbd5e1',
                      color: '#64748b'
                    }
                  }}
                >
                  Analyze Resume & Calculate Score
                </Button>
              </Paper>
            </form>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                background: '#fff',
                border: '1px solid rgba(58,107,109,0.12)',
                boxShadow: '0 10px 30px rgba(58,107,109,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                height: '100%'
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  width: '100%',
                  color: '#2a4b4d'
                }}
              >
                Score Preview
              </Typography>

              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                  boxShadow: '0 10px 25px rgba(58,107,109,0.25)'
                }}
              >
                {atsResult?.overall_score || 0}
              </Avatar>

              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 500,
                  mt: -1
                }}
              >
                Overall ATS Score
              </Typography>

              <Box width="100%" display="flex" flexDirection="column" gap={2}>
                {['Experience Match', 'Skills Match', 'Education', 'Keywords Found'].map((label, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#334155'
                        }}
                      >
                        {label}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#3a6b6d'
                        }}
                      >
                        {progressData[label]}%
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={progressData[label]}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#e2e8f0',

                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)'
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ATS;
