// src/components/AdvancedOfferLetterSystem/tabs/CreateOffer.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';

const CreateOffer = () => {
  const [departmentList, setDepartmentList] = useState([]);
  const [allReportingPersonList, setAllReportingPersonList] = useState([]);
  const [salaryHeadsType, setSalaryHeadsType] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    candidateId: '',
    candidateName: '',
    department: '',
    reportingTo: '',
    reportingCode: '',
    reportingEmail: '',
    positionApplied: '',
    location: '',
    joiningDate: '2025-11-13',
    probationPeriod: '6 Months',
    noticePeriod: '60 Days',
    workHours: '9 AM - 6 PM',
    templateType: 'Standard',
    additionalBenefits: '',
    specialTermsCondition: '',
    active: true
  });

  const probationPeriods = ['3 Months', '6 Months', '9 Months', '12 Months'];
  const noticePeriods = ['30 Days', '45 Days', '60 Days', '90 Days'];
  const workHours = ['9 AM - 6 PM', '10 AM - 7 PM', 'Flexible'];
  const templates = ['Standard', 'Custom'];

  const [compensations, setCompensations] = useState([{ type: '', amount: '', heading: '', headType: '' }]);

  useEffect(() => {
    getAllDepartment();
    getAllReportingPersonList();
    getSalaryHeadsDetails();
    getJobPostings();
    getCandidates();
    getAllBranches();
  }, [orgId, branchCode]);

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

  const getCandidates = async () => {
    try {
      setLoading(true);
      const response = await apiCalls('get', `/recruitmentmanagement/getSelectedCandidates?branchCode=${branchCode}&orgId=${orgId}`);
      if (response.status === true) {
        setCandidates(response.paramObjectsMap.candidatesVO || []);
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

  const getSalaryHeadsDetails = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllSalaryHeadsByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        const heads = response.paramObjectsMap.salaryHeadsVO;

        // ✅ Filter only "EARNING" type and active heads
        const activeEarningHeads = heads
          .filter((head) => head.active === 'Active' && head.cancel === 'F' && head.type === 'EARNING')
          .map((head) => ({
            id: head.id,
            heading: head.heading,
            code: head.code,
            category: head.category,
            type: head.type
          }));

        // ✅ Set state with only earnings
        setSalaryHeadsType(activeEarningHeads);

        // ✅ Pre-fill BASIC component if available
        const basicSalaryHead = activeEarningHeads.find((head) => head.code === 'BASIC');
        if (basicSalaryHead && compensations.length === 1 && !compensations[0].type) {
          setCompensations([
            {
              type: basicSalaryHead.heading,
              amount: '',
              heading: basicSalaryHead.heading,
              headType: basicSalaryHead.type
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching salary heads:', error);
      setSalaryHeadsType([]);
    }
  };

  const getJobPostings = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReportingPersonChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      reportingTo: newValue ? newValue.label : '',
      reportingCode: newValue ? newValue.code : '',
      reportingEmail: newValue ? newValue.email : ''
    }));
  };

  const handleCompChange = (index, field, value) => {
    const updated = [...compensations];

    if (field === 'type') {
      const selectedHead = salaryHeadsType.find((head) => head.heading === value);
      updated[index] = {
        ...updated[index],
        [field]: value,
        heading: selectedHead?.heading || '',
        headType: selectedHead?.type || ''
      };
    } else {
      updated[index][field] = value;
    }

    setCompensations(updated);
  };

  const handleAddRow = () => {
    setCompensations([...compensations, { type: '', amount: '', heading: '', headType: '' }]);
  };

  const handleRemoveRow = (index) => {
    const updated = compensations.filter((_, i) => i !== index);
    setCompensations(updated);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!formData.candidateName.trim()) {
      showToast('error', 'Candidate Name is required');
      return;
    }
    if (!formData.positionApplied) {
      showToast('error', 'Position is required');
      return;
    }
    if (!formData.department) {
      showToast('error', 'Department is required');
      return;
    }
    if (!formData.joiningDate) {
      showToast('error', 'Joining Date is required');
      return;
    }
    if (!formData.reportingTo) {
      showToast('error', 'Reporting Person is required');
      return;
    }
    if (!formData.location) {
      showToast('error', 'Work Location is required');
      return;
    }

    // ✅ Step 2: Validate compensations
    const invalidCompensations = compensations.filter(
      (comp) => !comp.type || !comp.amount || isNaN(parseFloat(comp.amount)) || parseFloat(comp.amount) <= 0
    );

    if (invalidCompensations.length > 0) {
      showToast('error', 'Please fill all compensation components with valid amounts');
      return;
    }

    // ✅ Step 3: Prepare API Data
    const apiData = {
      candidateId: formData.candidateId,
      candidateName: formData.candidateName.trim(),
      position: formData.positionApplied,
      department: formData.department,
      joiningDate: formData.joiningDate,
      reportingPerson: formData.reportingTo,
      reportingcode: formData.reportingCode,
      reportingEmail: formData.reportingEmail,
      workLocation: formData.location,
      probationPeriod: parseInt(formData.probationPeriod) || 6,
      noticePeriod: formData.noticePeriod,
      workhours: formData.workHours,
      templateType: formData.templateType,
      additionalBenefits: formData.additionalBenefits || '',
      specialTermsCondition: formData.specialTermsCondition || '',
      branch,
      branchCode,
      orgId: parseInt(orgId),
      finYear: '2025',
      createdBy: loginUserName,
      active: !isDraft, // draft offers inactive
      compensationDetailsDTO: compensations.map((comp) => ({
        componentType: comp.heading || comp.type,
        amount: parseFloat(comp.amount) || 0,
        id: 0
      }))
    };

    // ✅ Step 4: API Call
    setSubmitting(true);
    try {
      const response = await apiCalls('put', 'recruitmentmanagement/createUpdateCreateOffer', apiData);

      if (response.status === true) {
        // showToast('success',
        //     isDraft
        //         ? 'Offer saved as draft successfully!'
        //         : 'Offer created and approved successfully!'
        // );
        showToast('success', 'Offer Created Successfully');
        handleReset(); // Reset form after success
      } else {
        showToast('error', response.message || 'Offer creation failed');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      showToast('error', 'An error occurred while creating the offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      candidateId: '',
      candidateName: '',
      department: '',
      reportingTo: '',
      reportingCode: '',
      reportingEmail: '',
      positionApplied: '',
      location: '',
      joiningDate: '2025-11-13',
      probationPeriod: '6 Months',
      noticePeriod: '60 Days',
      workHours: '9 AM - 6 PM',
      templateType: 'Standard',
      additionalBenefits: '',
      specialTermsCondition: '',
      active: true
    });
    setCompensations([{ type: '', amount: '', heading: '', headType: '' }]);

    // Reset to BASIC salary if available
    const basicSalaryHead = salaryHeadsType.find((head) => head.code === 'BASIC');
    if (basicSalaryHead) {
      setCompensations([
        {
          type: basicSalaryHead.heading,
          amount: '',
          heading: basicSalaryHead.code,
          headType: basicSalaryHead.type
        }
      ]);
    }
  };

  const totalCTC = compensations.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const departmentOptions = departmentList.map((dept) => ({
    value: dept.departmentName,
    label: dept.departmentName
  }));

  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 3,
          mb: 3,
          backgroundColor: 'background.paper'
        }}
      >
        {/* ---------- Candidate Info Section ---------- */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#2a4b4d',
              mb: 2,
              letterSpacing: '0.3px'
            }}
          >
            Candidate Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={candidates}
                getOptionLabel={(option) => option.candidatesName || ''}
                value={candidates.find((c) => c.candidatesName === formData.candidateName) || null}
                onChange={(event, newValue) => {
                  handleInputChange('candidateName', newValue ? newValue.candidatesName : '');
                  handleInputChange('candidateId', newValue ? newValue.candidateId : '');
                  handleInputChange('positionApplied', newValue ? newValue.positionApplied : '');
                }}
                loading={loading}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Candidate Name"
                    required
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Select candidate"
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
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Candidate Code"
                variant="outlined"
                size="small"
                disabled
                value={formData.candidateId}
                onChange={(e) => handleInputChange('candidateId', e.target.value)}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              {/* <Autocomplete
                                options={jobPostings}
                                loading={loading}
                                getOptionLabel={(option) => option.jobTitle || ''}
                                value={
                                    jobPostings.find(
                                        (job) => job.jobTitle === formData.positionApplied
                                    ) || null
                                }
                                onChange={(event, newValue) => {
                                    handleInputChange('positionApplied', newValue ? newValue.jobTitle : '');
                                }}
                                // onChange={(e) => handleInputChange('candidateId', e.target.value)}

                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Position"
                                        size="small"
                                        fullWidth
                                        required
                                        placeholder="Select Job Title"
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
                            /> */}
              <TextField
                required
                fullWidth
                label="Position"
                variant="outlined"
                size="small"
                disabled
                value={formData.positionApplied}
                onChange={(e) => handleInputChange('positionApplied', e.target.value)}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={departmentOptions}
                size="small"
                getOptionLabel={(option) => option.label}
                value={departmentOptions.find((option) => option.value === formData.department) || null}
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
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={
                      <span>
                        Joining Date<span style={{ color: 'red' }}> *</span>
                      </span>
                    }
                    format="DD-MM-YYYY"
                    value={formData.joiningDate ? dayjs(formData.joiningDate, 'DD/MM/YYYY') : null}
                    onChange={(newValue) => {
                      const formattedDate = newValue ? dayjs(newValue).format('DD/MM/YYYY') : '';
                      setFormData((prev) => ({
                        ...prev,
                        joiningDate: formattedDate
                      }));
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        // ✅ Remove automatic red error highlight
                        required: false,
                        error: false,
                        helperText: '',
                        sx: {
                          '& .MuiInputBase-root': {
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#94a3b8'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#94a3b8'
                          },
                          '& .Mui-disabled': {
                            backgroundColor: '#f9fafb',
                            color: '#334155'
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={allReportingPersonList}
                getOptionLabel={(option) => `${option.label} - ${option.code}` || ''}
                value={allReportingPersonList.find((emp) => emp.label === formData.reportingTo) || null}
                onChange={(event, newValue) => handleReportingPersonChange(newValue)}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'start',
                      width: '100%'
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        color: 'text.primary'
                      }}
                    >
                      {`${option.label} - ${option.code}`}
                    </Typography>
                  </Box>
                )}
                renderInput={(params) => <TextField {...params} label="Reporting Person" size="small" fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={branchList}
                value={formData.location} // ✅ Default to ALL
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
                      )
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* ---------- Compensation Section ---------- */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#2a4b4d',
              mb: 2,
              letterSpacing: '0.3px'
            }}
          >
            Compensation Details (Annual)
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Total CTC (Annual): ₹{totalCTC.toLocaleString('en-IN')}
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddRow}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                color: '#fff',
                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                boxShadow: '0 4px 12px rgba(58,107,109,0.25)',
                transition: 'all 0.3s ease',

                '&:hover': {
                  background: 'linear-gradient(135deg, #2a4b4d 0%, #1f383a 100%)',
                  boxShadow: '0 6px 18px rgba(58,107,109,0.35)',
                  transform: 'translateY(-2px)'
                },

                '&:active': {
                  transform: 'scale(0.98)'
                }
              }}
            >
              Add Component
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
          >
            <Table size="small">
              <TableHead
                sx={{
                  background: 'linear-gradient(90deg, #f5f7fa, #e8eefc)',
                  '& th': {
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '0.9rem',
                    borderBottom: '1px solid #d0d7e1'
                  }
                }}
              >
                <TableRow>
                  <TableCell width="5%">#</TableCell>
                  <TableCell width="50%">Component Type</TableCell>
                  <TableCell width="35%">Amount (₹)</TableCell>
                  <TableCell width="10%" align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {compensations.map((row, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#fafbfc' },
                      '&:hover': {
                        backgroundColor: 'rgba(25,118,210,0.06)',
                        transition: '0.2s ease-in-out'
                      }
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{index + 1}</TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={row.type}
                        onChange={(e) => handleCompChange(index, 'type', e.target.value)}
                        required
                      >
                        {salaryHeadsType
                          .filter((head) => !compensations.some((comp, i) => comp.type === head.heading && i !== index))
                          .map((head) => (
                            <MenuItem
                              key={head.id}
                              value={head.heading}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              {head.heading}
                            </MenuItem>
                          ))}
                      </TextField>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Enter amount"
                        value={row.amount}
                        onChange={(e) => handleCompChange(index, 'amount', e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                              ₹
                            </Typography>
                          )
                        }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <IconButton color="error" size="small" disabled={compensations.length === 1} onClick={() => handleRemoveRow(index)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* ---------- Employment Terms Section ---------- */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              fontWeight: 700,
              color: '#2a4b4d',
              letterSpacing: '0.3px'
            }}
          >
            <DescriptionOutlinedIcon
              sx={{
                color: '#3a6b6d',
                fontSize: 24
              }}
            />
            Employment Terms
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Probation Period"
                variant="outlined"
                value={formData.probationPeriod}
                onChange={(e) => handleInputChange('probationPeriod', e.target.value)}
                size="small"
              >
                {probationPeriods.map((period) => (
                  <MenuItem key={period} value={period}>
                    {period}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Notice Period"
                variant="outlined"
                value={formData.noticePeriod}
                onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                size="small"
              >
                {noticePeriods.map((period) => (
                  <MenuItem key={period} value={period}>
                    {period}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Work Hours"
                variant="outlined"
                value={formData.workHours}
                onChange={(e) => handleInputChange('workHours', e.target.value)}
                size="small"
              >
                {workHours.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Template Type"
                variant="outlined"
                value={formData.templateType}
                onChange={(e) => handleInputChange('templateType', e.target.value)}
                size="small"
              >
                {templates.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                multiline
                rows={1}
                fullWidth
                label="Additional Benefits"
                placeholder="List additional benefits like gym membership, food allowance, etc."
                variant="outlined"
                size="small"
                value={formData.additionalBenefits}
                onChange={(e) => handleInputChange('additionalBenefits', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                multiline
                rows={1}
                fullWidth
                label="Special Terms & Conditions"
                placeholder="Any special terms or conditions for this offer"
                variant="outlined"
                size="small"
                value={formData.specialTermsCondition}
                onChange={(e) => handleInputChange('specialTermsCondition', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* ---------- Action Buttons ---------- */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            pt: 2,
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 12px rgba(58,107,109,0.25)',
              transition: 'all 0.3s ease',

              '&:hover': {
                background: 'linear-gradient(135deg, #2a4b4d 0%, #1f383a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 18px rgba(58,107,109,0.35)'
              },

              '&:disabled': {
                background: '#cbd5e1',
                color: '#64748b'
              }
            }}
          >
            {submitting ? 'Creating...' : 'Save'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            disabled={submitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              borderColor: '#3a6b6d',
              color: '#3a6b6d',

              '&:hover': {
                borderColor: '#2a4b4d',
                backgroundColor: 'rgba(58,107,109,0.08)'
              },

              '&:disabled': {
                borderColor: '#cbd5e1',
                color: '#94a3b8'
              }
            }}
          >
            Reset
          </Button>
        </Box>
      </Paper>
      <ToastContainer />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateOffer;
