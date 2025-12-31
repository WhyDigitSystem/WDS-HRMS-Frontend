import React, { useRef, useState, useEffect } from 'react';
import { Box, Grid, TextField, Typography, Paper, Button, LinearProgress, Avatar, Autocomplete } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm, Controller } from 'react-hook-form';
import apiCalls from 'apicall';
import { ToastContainer } from 'react-toastify';
import { showToast } from 'utils/toast-component';
import RestartAltIcon from "@mui/icons-material/RestartAlt"; 

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
    < ToastContainer />
  
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', py: 0, px: { xs: 2, sm: 4 } }}>
      <Typography variant="h3" fontWeight="bold" align="center" color="text.primary" mb={1}>
        ATS Resume Scoring System
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" mb={2}>
        Upload candidate resumes and get instant AI-powered scoring
      </Typography>
<Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",   
    mb: 2
  }}
>
  <Button
    variant="contained"
    startIcon={<RestartAltIcon />}
    onClick={handleReset}
    sx={{
      background: "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
      color: "white",
      fontWeight: 600,
      px: 1,
      py: 0.55,
      borderRadius: 2,
      letterSpacing: "0.5px",
      fontSize: "14px",

      "&:hover": {
        transform: "scale(1.06)",
        background: "linear-gradient(135deg, #E100FF 0%, #7F00FF 100%)",
      },

      "&:active": {
        transform: "scale(0.97)",
      },
    }}
  >
    Reset
  </Button>
</Box>


      <Grid container spacing={2} sx={{ maxWidth: 1100, mx: 'auto', pl: 0, pr: 2 }}>
        <Grid item xs={12} md={6}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                        borderStyle: 'dashed',
                        borderColor: error ? 'red' : 'grey.400',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                        px: 2,
                        mt: 2,
                        bgcolor: '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#e0f0ff',
                          borderColor: 'primary.main',
                          transform: 'scale(1.02)'
                        }
                      }}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {field.value ? field.value.name : 'Click to upload or drag and drop'}
                          </Typography>
                          {field.value ? (
                            <Typography variant="caption" color="text.secondary">
                              {(field.value.size / (1024 * 1024)).toFixed(2)} MB
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              PDF, DOC, DOCX (Max 50MB)
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Cancel/Remove Button */}
                      {field.value && (
                        <Button
                          variant="text"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile('');
                            field.onChange(null);
                          }}
                        >
                          Cancel
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
                color="primary"
                fullWidth
                type="submit"
                sx={{ mt: 2.5, textTransform: 'none', py: 1.5, borderRadius: 2 }}
              >
                Analyze Resume & Calculate Score
              </Button>
            </Paper>
          </form>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Typography variant="h4" fontWeight="bold" align="left" sx={{ width: '100%' }}>
              Score Preview
            </Typography>
            <Avatar sx={{ bgcolor: '#f3f6fa', color: 'text.primary', width: 100, height: 100, fontSize: 28, alignItems: 'center' }}>
              {atsResult?.overall_score || 0}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Overall ATS Score
            </Typography>
            <Box width="100%" display="flex" flexDirection="column" gap={2}>
              {['Experience Match', 'Skills Match', 'Education', 'Keywords Found'].map((label, index) => (
                <Box key={index} mb={0}>
                  <Box display="flex" justifyContent="space-between" mb={1} bgcolor="grey.100" p={0.5} borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {progressData[label]}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={progressData[label]}
                    sx={{
                      height: 10,
                      borderRadius: 2,
                      bgcolor: '#f0f0f0'
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
