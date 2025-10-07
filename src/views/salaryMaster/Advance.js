import React, { useState, useEffect } from 'react';
import apiCalls from 'apicall';
import IconButton from '@mui/material/IconButton';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Avatar,
  DialogContent,
  Dialog,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Grid,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ActionButton from 'utils/ActionButton';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { GridAddIcon } from '@mui/x-data-grid';
import CommonTable from 'views/basicMaster/CommonTable';

const Advance = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [editId, setEditId] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    getAllEmployeeList();
    getAllAdvanceByOrgId();
  }, []);
  const [formData, setFormData] = useState({
    docDate: dayjs(),
    employeeId: '',
    name: '',
    code: '',
    department: '',
    designation: '',
    advanceAmount: '',
    dueMonth: '1', // Added dueMonth with default value
    reason: '',
    customReason: '',
    loanBalance: '',
    repaymentTerm: '3',
    approver: '',
    remarks: '',
    approve: false,
    branchCode: branchCode,
    branch: branch,
    finYear: finYear
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    code: '',
    department: '',
    designation: '',
    docDate: '',
    advanceAmount: '',
    dueMonth: '', // Added dueMonth to fieldErrors
    reason: '',
    loanBalance: '',
    remarks: '',
    customReason: '',
    approve: false,
    repaymentTerm: '3',
    approver: ''
  });

  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listViewColumns = [
    { accessorKey: 'requestDate', header: 'Requested Date', size: 140 },
    { accessorKey: 'employeeName', header: 'Name ', size: 140 },
    { accessorKey: 'employeeCode', header: 'Code', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    { accessorKey: 'reasonForAdvance', header: 'Reason', size: 140 },
    {
      accessorKey: 'advanceAmount',
      header: 'Advance Amt',
      size: 80,
      Cell: ({ cell }) => (
        <div style={{ textAlign: 'right', width: '100%' }}>
          {cell.getValue() !== undefined && cell.getValue() !== null ? Number(cell.getValue()).toLocaleString('en-IN') : '-'}
        </div>
      )
    },
    { accessorKey: 'dueMonth', header: 'Due Month', size: 100 }, // Added dueMonth column
    { accessorKey: 'approve', header: 'Approve Status', size: 140 }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, docDate: date }));
  };

  const handleEmployeeSelect = (newValue) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        name: newValue.employeeName,
        code: newValue.employeeCode,
        department: newValue.department,
        designation: newValue.designation
      }));
    }
  };
  const getAllEmployeeList = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllEmployeeByActive?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setEmployees(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllAdvanceByOrgId = async () => {
    setIsSubmitting(true);
    try {
      const result = await apiCalls('get', `/advance/getAllAdvanceByOrgId?branchCode=${branchCode}&orgId=${orgId}`);
      setData(result.paramObjectsMap.advanceVO.reverse() || []);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      console.log('error', err);
    }
  };
  const getAdvanceById = async (row) => {
    setShowForm(true);
    setIsSubmitting(true);
    try {
      const result = await apiCalls('get', `/advance/getAdvanceById?id=${row.original.id}`);

      if (result) {
        const AdvanceVO = result.paramObjectsMap.advanceVO;
        setAttachment(result.paramObjectsMap.advanceVO.attachment);
        getAllEmployeeList();
        setEditId(row.original.id);
        setFormData({
          id: AdvanceVO.id || '',
          docDate: AdvanceVO.requestDate ? dayjs(AdvanceVO.requestDate, 'YYYY-MM-DD') : null,
          name: AdvanceVO.employeeName || '',
          code: AdvanceVO.employeeCode || '',
          department: AdvanceVO.department || '',
          designation: AdvanceVO.designation || '',
          reason: AdvanceVO.reasonForAdvance || '',
          advanceAmount: AdvanceVO.advanceAmount || '',
          dueMonth: AdvanceVO.dueMonth || '1', // Added dueMonth
          loanBalance: AdvanceVO.loanBalance || '',
          remarks: AdvanceVO.remarks || '',
          approve: AdvanceVO.approve || '',
          branchCode: AdvanceVO.branchCode || '',
          branch: AdvanceVO.branch || '',
          finYear: AdvanceVO.finYear || ''
        });
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        // Handle error
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error fetching data:', error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errors = {};
    // setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      const saveFormData = {
        ...(editId && { id: editId }),
        active: true,
        advanceAmount: formData.advanceAmount,
        dueMonth: formData.dueMonth, // Added dueMonth
        approve: formData.approve,
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        department: formData.department,
        designation: formData.designation,
        employeeCode: formData.code,
        employeeName: formData.name,
        finYear: finYear,
        loanBalance: parseFloat(formData.loanBalance),
        orgId: orgId,
        reasonForAdvance: formData.reason,
        remarks: formData.remarks,
        requestDate: formData.docDate?.format('YYYY-MM-DD')
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/advance/updateCreateAdvance`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Advance Updated Successfully' : 'Advance Created successfully');
          getAllAdvanceByOrgId();
          const generatedId = response.paramObjectsMap.advanceVO.id;
          if (generatedId && typeof attachment === 'object') {
            console.log('Generated ID:', generatedId);
            console.log('Uploaded Item', attachment);
            handleFileUpload(generatedId);
          } else {
            console.log('handle Img Upload failed');
          }
          handleReset();
          setIsSubmitting(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Advance creation failed');
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsSubmitting(false);
        showToast('error', 'Advance creation failed');
      }
    } else {
      // setFieldErrors(errors);
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAttachment(null);
    setFormData({
      docDate: dayjs(),
      employeeId: '',
      name: '',
      code: '',
      department: '',
      designation: '',
      advanceAmount: '',
      dueMonth: '1', // Reset dueMonth to default
      reason: '',
      customReason: '',
      loanBalance: '',
      approver: '',
      remarks: '',
      approve: false
    });
    setFieldErrors({
      docDate: '',
      employeeId: '',
      name: '',
      code: '',
      department: '',
      designation: '',
      advanceAmount: '',
      dueMonth: '', // Reset dueMonth error
      reason: '',
      customReason: '',
      loanBalance: '',
      repaymentTerm: '',
      approver: '',
      remarks: '',
      approve: false
    });
  };
  const handleView = () => {
    setShowForm(!showForm);
    handleReset();
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setAttachment(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };
  const handleFileUpload = async (generatedId) => {
    if (!generatedId) {
      console.warn('Generated ID is missing');
      showToast('error', 'Generated ID is required');
      return;
    }
    const formData = new FormData();
    formData.append('file', attachment);
    try {
      const response = await apiCalls(
        'post',
        `/advance/uploadAttachmentLogoInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      console.log('Img Upload Response:', response);

      if (response.status === true) {
        showToast('success', response.message || 'Image Uploaded successfully!');
      } else {
        console.warn('Img upload failed:', response);
        showToast('error', 'Img upload failed');
      }
    } catch (error) {
      console.error('Img Upload Error:', error);
      showToast('error', 'Failed to upload Img');
    }
  };
  useEffect(() => {
    return () => {
      if (attachment && typeof attachment === 'object') {
        URL.revokeObjectURL(attachment);
      }
    };
  }, [attachment]);
  const handleRemoveAttachment = () => setAttachment(null);

  // Generate options for due month dropdown (1-12)
  const dueMonthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <>
      <ToastComponent />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card sx={{ p: 2, borderRadius: 2 }}>
          {showForm ? (
            <>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <ActionButton title="Clear" icon={ClearIcon} onClick={handleReset} />
                <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                <ActionButton title="Save" icon={SaveIcon} onClick={handleSubmit} />
              </Stack>

              <Box component="form" onSubmit={handleSubmit}>
                {/* --- Employee Details --- */}
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Employee Details
                </Typography>

                <Stack direction="row" sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Autocomplete
                        options={employees}
                        getOptionLabel={(option) => (option ? `${option.employeeCode} - ${option.employeeName}` : '')}
                        value={employees.find((emp) => emp.employeeName === formData.name) || null}
                        onChange={(e, newValue) => handleEmployeeSelect(newValue)}
                        renderInput={(params) => <TextField {...params} label="Name" variant="outlined" size="small" fullWidth />}
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <TextField
                        label="Employee Code"
                        variant="outlined"
                        size="small"
                        fullWidth
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <TextField
                        label="Department"
                        variant="outlined"
                        size="small"
                        fullWidth
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <TextField
                        label="Designation"
                        variant="outlined"
                        size="small"
                        fullWidth
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        disabled
                      />
                    </Grid>
                  </Grid>
                </Stack>
                {/* --- Advance Details --- */}
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Advance Details
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <DatePicker
                    label="Request Date*"
                    value={formData.docDate}
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />

                  <TextField
                    label="Advance Amount"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="advanceAmount"
                    type="number"
                    value={formData.advanceAmount}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0 }}
                  />

                  {/* Added Due Month Dropdown */}
                  <FormControl fullWidth size="small">
                    <InputLabel id="due-month-label">Due Month</InputLabel>
                    <Select labelId="due-month-label" label="Due Month" name="dueMonth" value={formData.dueMonth} onChange={handleChange}>
                      {dueMonthOptions.map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="reason-label">Reason for Advance*</InputLabel>
                    <Select
                      labelId="reason-label"
                      label="Reason for Advance*"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="Salary Advance">Salary Advance</MenuItem>
                      <MenuItem value="Medical">Medical</MenuItem>
                      <MenuItem value="Travel">Travel</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Loan Balance"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="loanBalance"
                    type="number"
                    value={formData.loanBalance}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                    disabled
                  />
                </Stack>

                <Stack direction="row" sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Remarks"
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Button
                          variant="outlined"
                          component="label"
                          multiline
                          startIcon={<CloudUploadIcon />}
                          sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
                        >
                          {attachment ? (typeof attachment === 'object' && attachment.name ? attachment.name : '') : 'Attachment'}
                          <input type="file" hidden accept="image/png, image/jpeg" onChange={handleImgChange} />
                        </Button>

                        {attachment && (
                          <IconButton variant="contained" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }} onClick={handleOpen}>
                            <ControlCameraIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                        <DialogContent
                          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}
                        >
                          <Typography variant="h5" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }}>
                            Attachment
                          </Typography>
                          {attachment ? (
                            <Box>
                              <Avatar
                                src={
                                  typeof attachment === 'object' ? URL.createObjectURL(attachment) : `data:image/jpeg;base64,${attachment}`
                                }
                                alt="Attachment"
                                sx={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', borderRadius: 2 }}
                              />
                              <Box display="flex" gap={2} mt={2}>
                                <IconButton
                                  variant="contained"
                                  sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                                  onClick={handleRemoveAttachment}
                                >
                                  Delete
                                </IconButton>
                                <IconButton
                                  variant="contained"
                                  sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                                  onClick={handleClose}
                                >
                                  Close
                                </IconButton>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <Avatar sx={{ width: 150, height: 150, bgcolor: '#F0F0F0', borderRadius: 2 }}>
                                <Typography variant="caption">Attachment</Typography>
                              </Avatar>
                              <Box display="flex" gap={2} mt={2}>
                                <IconButton
                                  variant="contained"
                                  sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '15px' }}
                                  onClick={handleClose}
                                >
                                  Close
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                        </DialogContent>
                      </Dialog>
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        control={<Checkbox checked={formData.approve} name="approve" onChange={handleChange} />}
                        label="Approve"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<GridAddIcon />}
                  size="small"
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#1e88e5',
                    border: '1px solid #1e88e5',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#bbdefb',
                      borderColor: '#1565c0',
                      color: '#1565c0'
                    }
                  }}
                  onClick={handleView}
                >
                  New
                </Button>
              </Box>
              <CommonTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getAdvanceById} enableEditing={true} />
            </>
          )}
        </Card>
      </LocalizationProvider>
    </>
  );
};
export default Advance;