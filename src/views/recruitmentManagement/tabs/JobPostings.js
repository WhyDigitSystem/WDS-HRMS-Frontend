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
const experienceOptions = [
  '0-1 Year',
  '1-2 Year',
  '2-3 Year',
  '3-4 Year',
  '4-5 Year',
];




   
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
    const [newJobData, setNewJobData] = useState({
        jobTitle: '',
        department: '',
        location: '',
        education:[],
        skills:[],
        keywords:[],
        experience:'',
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
                const branchNames = branches.map(branch =>
                    branch.branch || branch.branchName || branch.name || 'Unknown'
                );
                setBranchList(branchNames);
            } else {
                showToast('warning', 'Failed to fetch branches, using default list');
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('warning', 'Failed to fetch branches, using default list');
            setBranchList(["ALL", "BANGALORE", "CHENNAI", "Hyderabad"]);
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
            keywords:[],
            experience: '',
            description:'',
            branch: branchCode || '',
            branchCode: branchCode || '',
            createdBy: localStorage.getItem('username') || 'admin',
            orgId: parseInt(orgId) || 0,
            active: true // Changed from isActive to active
        });
    };

    const handleInputChange = (field, value) => {   
        setNewJobData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateJob = async () => {
        try {
            const payload = {
                ...newJobData,
                branch: branch || '',
                branchCode: branchCode || '',
                createdBy: loginUserName,
                orgId: parseInt(orgId),
                // active field is already included in newJobData
            };

            const response = await apiCalls('put', 'recruitmentmanagement/createUpdateJobPostings', payload);

            if (response.status === true) {
                // Refresh the jobs list
                await getJobPostings();
                handleCloseAddJobModal();
                showToast('success', 'Job posting created successfully!');
            } else {
                showToast('error', 'Failed to create job posting: ' + (response.message || 'Unknown error'));
            }

        } catch (error) {
            console.error('Error creating job:', error);
            alert('Error creating job posting. Please try again.');
        }
    };

    // Transform department data for autocomplete options
    const departmentOptions = departmentList.map(dept => ({
        value: dept.departmentName,
        label: dept.departmentName
    }));

    // Transform API data to match component expectations
    const transformedJobs = jobs.map(job => ({
        id: job.id,
        job_title: job.jobTitle,
        department: job.department,
        location: job.location,
        status: job.active ? 'Active' : 'Inactive', // Fixed status logic
        postedDate: job.commonDate ? job.commonDate.createdon : '',
        skills: job.skills,
        experience: job.experience,
        education: job.education,
        applications: 0, // You might want to add this field to your API
        salary: '' // You might want to add this field to your API
    }));

const handleRemoveKeyword = (index) => {
  setNewJobData(prev => ({
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
                       
                        px:1,
                        py: 0.5,
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                         backgroundColor: '#f1f5f9',
                    }}
                    
                >
                 <Typography
  variant="h6"
  sx={{
    fontWeight: 600,
    // background: 'linear-gradient(90deg, #ff6a00, #ee0979)', 
  
   
  }}
>
  Create Job Posting
</Typography>
                    <IconButton
                        onClick={handleCloseAddJobModal}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon color='error' />
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
                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
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
                            value={
                                departmentOptions.find(
                                    (option) => option.value === newJobData.department
                                ) || null
                            }
                            onChange={(event, newValue) => {
                                handleInputChange('department', newValue ? newValue.value : '');
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Department"
                                    required
                                    placeholder="Select Department"
                                    size="small"
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
                            )}
                        />

                        {/* Location */}
                        <Autocomplete
                            options={branchList}
                            value={newJobData.location} // ✅ Default to ALL
                            onChange={(event, newValue) => {
                                handleInputChange('location', newValue);
                            }}
                            loading={loading} // optional if you track loading
                            size="small"
                            clearOnEscape
                            disableClearable={false} // ✅ adds clear (X) icon
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Work Location"
                                    placeholder="Select Location"
                                    required
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />

                        {/*education*/}
                        <Autocomplete
                            multiple  
                            options={educationOptions}
                            value={newJobData.education} 
                            onChange={(event, newValue) => {
                                handleInputChange('education', newValue);
                            }}
                            loading={loading} 
                            size="small"
                            clearOnEscape
                            disableClearable={false} // ✅ adds clear (X) icon
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Education Qulication"
                                    required
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />

                        {/* skills */}
                         <Autocomplete
                            multiple  
                            options={skillsOptions}
                            value={newJobData.skills} 
                            onChange={(event, newValue) => {
                                handleInputChange('skills', newValue);
                            }}
                            loading={loading} 
                            size="small"
                            clearOnEscape
                            disableClearable={false} 
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Skills"
                                    required
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    {/* Ketwords */}
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

      setNewJobData(prev => {
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

<Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto' }}>
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
        sx={{ fontSize: 16, cursor: 'pointer', color: 'red' }}
        onClick={() => handleRemoveKeyword(index)}
      />
    </Card>
  ))}
</Box>

{/* experience */}
  <Autocomplete
                          
                            options={experienceOptions}
                            value={newJobData.experience} 
                            onChange={(event, newValue) => {
                                handleInputChange('experience', newValue);
                            }}
                            loading={loading} 
                            size="small"
                            clearOnEscape
                            disableClearable={false} 
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Experience"
                                  
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />

{/* description */}
  <TextField
  label="Description"

  fullWidth
  size="small"
  value={newJobData.description}
  onChange={(e) => handleInputChange('description', e.target.value)}
  multiline // <-- allows multiple lines
  rows={4}   // optional, sets visible rows
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      minHeight: 80, // optional, controls textarea height
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.875rem',
    },
  }}
/>


                        {/* Job Status Section */}
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
                                sx={{ fontWeight: 600, color: 'text.primary' }}
                            >
                                Job Status
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Switch
                                    checked={newJobData.active} // Changed from isActive to active
                                    onChange={(e) =>
                                        handleInputChange('active', e.target.checked) // Changed from isActive to active
                                    }
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#22c55e'
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#22c55e'
                                        }
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: newJobData.active ? '#22c55e' : '#64748b', // Changed from isActive to active
                                        fontWeight: 600
                                    }}
                                >
                                    {newJobData.active ? 'Active' : 'Inactive'} {/* Changed from isActive to active */}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={handleCloseAddJobModal}
                        sx={{
                            color: '#64748b',
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 3,
                            py: 0.5
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateJob}
                        sx={{
                            backgroundColor: primaryColor,
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 3,
                            py: 0.5,
                            '&:hover': {
                                backgroundColor: primaryColor
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
      "&:hover": {
        transform: 'scale(1.02)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
      }
    }
  }}
            >
                <DialogTitle sx={{
      background: "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
      color: '#fff',
      fontWeight: 600,
      fontSize: '1rem',
      py: 1.2,
      px: 2,
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px 8px 0 0',
      textShadow: '0 0 8px rgba(255,255,255,0.6)' 
    }}
  >
                 
     💼 Job Details
         </DialogTitle>

                 <DialogContent sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {selectedJob && (
  <Box display="flex" flexDirection="column" gap={0}>
    {[
     
  { icon: '💼', label: 'Job Title', value: selectedJob.jobTitle },

  { icon: '🏷️', label: 'Department', value: selectedJob.department },

  { icon: '🛠️', label: 'Skills', value: selectedJob.skills },

  { icon: '🧑‍💻', label: 'Experience', value: selectedJob.experience },

  { icon: '🎓', label: 'Education Qualification', value: selectedJob.education },

  { icon: '🏢', label: 'Branch', value: selectedJob.branch },

  { icon: '📍', label: 'Job Location', value: selectedJob.location },

  { icon: selectedJob.active ? '🟢' : '🔴', label: 'Status', value: selectedJob.active ? 'Active' : 'Inactive' },

  { icon: '📅', label: 'Created On', value: selectedJob.commonDate?.createdon }


    ].map((item, idx) => (
      <Box
        key={idx}
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          p: 1,
          borderRadius: 1.5,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        }}
      >
        <Box
          sx={{
            width: 25,
            height: 25,
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            color: '#7f00ff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          {item.icon}
        </Box>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            color: '#64748b',
            minWidth: 140,
          }}
        >
          {item.label}:
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#1e293b',
            textShadow: '0 0 2px rgba(0,0,0,0.15)',
          }}
        >
          {item.value || '-'}
        </Typography>
      </Box>
    ))}
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
                            color: '#7c3aed',
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
                            textTransform: 'none',
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
                                            background: `linear-gradient(90deg, ${primaryColor} 0%, #3b82f6 100%)`,
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
                                                        color: '#059669',
                                                        opacity: 0.8
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{
                                                    color: 'text.primary',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500
                                                }}>
                                                    {job.department}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <LocationIcon
                                                    sx={{
                                                        fontSize: 14,
                                                        color: '#7c3aed',
                                                        opacity: 0.8
                                                    }}
                                                />
                                                <Typography variant="body2" color="text.secondary" sx={{
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {job.location}
                                                </Typography>
                                            </Box>
                                            {/* Added Posted Date Icon */}
                                            {job.postedDate && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <ScheduleIcon
                                                        sx={{
                                                            fontSize: 14,
                                                            color: '#ea580c',
                                                            opacity: 0.8
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary" sx={{
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {job.postedDate}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>

                                    {/* Footer with Status and Actions - Compact */}
                                    <Box sx={{
                                        p: 2,
                                        pt: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderTop: '1px solid #f8fafc'
                                    }}>
                                        {/* Status Chip */}
                                        <Chip
                                            label={job.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: job.status === 'Active'
                                                    ? '#dcfce7'
                                                    : '#f3f4f6',
                                                color: job.status === 'Active'
                                                    ? '#166534'
                                                    : '#374151',
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                                height: 22,
                                                border: job.status === 'Active'
                                                    ? `1px solid #bbf7d0`
                                                    : `1px solid #e5e7eb`,
                                                borderRadius: 0.75
                                            }}
                                        />

                                        {/* Actions - Minimal */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                            <Button
                                                variant="text"
                                                size="small"
                                                startIcon={<ViewIcon sx={{ fontSize: 16, color: primaryColor }} />}
                                                onClick={() => handleViewJob(jobs.find(j => j.id === job.id))}
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