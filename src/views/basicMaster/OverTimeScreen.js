import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  Box,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TablePagination,
  CircularProgress,
  Typography,
  Checkbox,
  Paper,
  Grid,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import { Search, Clear } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const OverTimeMaster = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [contractList, setContractList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [empList, setEmpList] = useState([]);
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    branch: 'All',
    employeeType: 'All',
    contractor: '',
    departmentName: 'ALL',
    employeeName: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openToDatePicker, setOpenToDatePicker] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [selectedOtInfo, setSelectedOtInfo] = useState(null);
  const [dialogPage, setDialogPage] = useState(0);
  const [dialogRowsPerPage, setDialogRowsPerPage] = useState(5);
  const [dialogSearchQuery, setDialogSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromSalaryProcess = location.state?.fromSalaryProcess || false;
  const cameFromAttendanceProcess = location.state?.fromAttendanceProcess || false;

  useEffect(() => {
    getAllContractList();
    getAllDepartment();
    getAllBranches();
  }, []);

  // Fetch employee list when form data changes
  useEffect(() => {
    if (formData.employeeType && formData.branch && formData.departmentName) {
      getEmployeeNames();
    }
  }, [formData.employeeType, formData.branch, formData.departmentName, formData.contractor]);

  const getEmployeeNames = async () => {
    try {
      const params = {
        branch: formData.branch === 'All' ? 'All' : formData.branch,
        department: formData.departmentName === 'ALL' ? 'All' : formData.departmentName,
        orgId: orgId,
        type: formData.employeeType === 'All' ? 'All' : formData.employeeType,
        // Only include contractor if employee type is Contractor
        ...(formData.employeeType === 'Contractor' && { contractor: formData.contractor })
      };

      const response = await apiCalls('get', '/checkinout/getEmployeeNameForApprovalOtProcess', null, params);

      if (response.status === true) {
        const allEmployeeOption = { employeeCode: 'All', employeeName: 'All' };
        const employees = response.paramObjectsMap.attendanceProcessVO || [];
        setEmpList([allEmployeeOption, ...employees]);
      } else {
        console.error('API Error:', response);
        setEmpList([{ employeeCode: 'All', employeeName: 'All' }]);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setEmpList([{ employeeCode: 'All', employeeName: 'All' }]);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogSearchQuery('');
  };

  const handleAllClear = () => {
    setFormData({
      fromDate: null,
      toDate: null,
      branch: 'All',
      employeeType: 'All',
      contractor: '',
      departmentName: 'ALL',
      employeeName: ''
    });
    setFieldErrors({});
    setSearchResults([]);
    setSelectedRecords([]);
    setSearchQuery('');
    setDialogSearchQuery('');
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList([{ id: 0, branch: 'All', branchCode: 'All' }, ...branchData]);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  const handleClick = async () => {
    const errors = {};
    if (!formData.fromDate) errors.fromDate = 'From Date is required';
    if (!formData.toDate) errors.toDate = 'To Date is required';
    if (!formData.employeeType) errors.employeeType = 'Employee Type is required';
    if (formData.employeeType === 'Contractor' && !formData.contractor) errors.contractor = 'Contractor is required';

    if (formData.fromDate && formData.toDate) {
      const fromDate = dayjs(formData.fromDate);
      const toDate = dayjs(formData.toDate);
      if (fromDate.isAfter(toDate)) {
        errors.dateRange = 'From Date cannot be after To Date';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const params = {
        branch: formData.branch === 'All' ? 'All' : formData.branch,
        department: formData.departmentName === 'ALL' ? 'All' : formData.departmentName,
        employeeCode: formData.employeeName === 'All' ? 'All' : formData.employeeName || 'All',
        fromDate: dayjs(formData.fromDate).format('YYYY-MM-DD'),
        toDate: dayjs(formData.toDate).format('YYYY-MM-DD'),
        orgId: orgId,
        type: formData.employeeType === 'All' ? 'All' : formData.employeeType,
        // Add contractor parameter when employee type is Contractor
        ...(formData.employeeType === 'Contractor' && { contractor: formData.contractor })
      };

      const result = await apiCalls('get', '/checkinout/getPendingOTHoursByOrgId', null, params);

      if (result?.status) {
        const assignments = result.paramObjectsMap.otCalculationVO || [];
        const transformedData = assignments.map((item) => ({
          id: item.id,
          employeeCode: item.empcode,
          employeeName: item.empname,
          date: item.checkindate,
          checkIn: item.intime,
          checkOut: item.outtime,
          otHours: item.othours,
          bankOtAmount: item.bankOtAmount,
          rate: item.rate,
          otType: item.ottype,
          otCategory: item.otcategory,
          companyOtPolicy: item.companyOtPolicy,
          status: item.status,
          createdon: item.createdon,
          orgId: item.orgId,
          isSelected: false
        }));

        if (transformedData.length > 0) {
          setSelectedOtInfo({
            otType: transformedData[0].otType,
            otCategory: transformedData[0].otCategory,
            companyOtPolicy: transformedData[0].companyOtPolicy
          });
        }

        setSearchResults(transformedData);
        setDialogOpen(true);
      } else {
        showToast('error', result.message || 'No overtime data found');
      }
    } catch (err) {
      showToast('error', 'Error fetching overtime data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = (id) => {
    setSearchResults((prev) => prev.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item)));
  };

  const handleSelectAllRecords = (event) => {
    setSearchResults((prev) =>
      prev.map((item) => ({
        ...item,
        isSelected: event.target.checked
      }))
    );
  };

  const handleAddSelected = () => {
    const selected = searchResults.filter((item) => item.isSelected);
    if (selected.length === 0) {
      showToast('warning', 'Please select at least one record to add');
      return;
    }

    setSelectedRecords((prev) => {
      // Filter out duplicates
      const newRecords = selected.filter((newItem) => !prev.some((existingItem) => existingItem.id === newItem.id));
      return [...prev, ...newRecords];
    });

    // showToast('success', `${selected.length} record(s) added successfully`);
    setDialogOpen(false);
    setDialogSearchQuery('');
  };

  const getAllContractList = async () => {
    try {
      const response = await apiCalls('get', `shiftmaster/getAllContractMasterByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        const transformedData = response.paramObjectsMap.contractMasterVO.map((item) => ({
          label: item.contractor,
          value: item.contractorCode,
          ...item
        }));
        setContractList(transformedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Filter selected records based on search query
  const filteredData = selectedRecords
    .filter((item) =>
      Object.values(item).some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    )
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Filter search results for dialog based on search query
  const filteredSearchResults = searchResults.filter((item) =>
    Object.values(item).some((value) =>
      String(value || '')
        .toLowerCase()
        .includes(dialogSearchQuery.toLowerCase())
    )
  );

  // Get paginated search results for dialog
  const paginatedSearchResults = filteredSearchResults.slice(
    dialogPage * dialogRowsPerPage,
    dialogPage * dialogRowsPerPage + dialogRowsPerPage
  );

  const handleSave = async () => {
    if (selectedRecords.length === 0) {
      showToast('warning', 'Please select at least one record to save');
      return;
    }

    setIsLoading(true);

    try {
      // Extract IDs from selectedRecords
      const ids = selectedRecords.map((record) => record.id).join(',');

      const params = {
        action: 'APPROVED',
        actionBy: loginUserName,
        id: ids,
        orgId: orgId
      };

      const result = await apiCalls('put', '/checkinout/createApprovalOtCalculation', null, params);

      if (result?.status) {
        showToast('success', 'Overtime records approved successfully');
        setSelectedRecords([]);
        handleAllClear();
      } else {
        showToast('error', result.message || 'Failed to approve overtime records');
      }
    } catch (err) {
      showToast('error', 'Error approving overtime records');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearDialogSearch = () => {
    setDialogSearchQuery('');
  };

  const formatNumberWithCommas = (value) => {
    if (value === 'Loading...' || value === 'Error' || value === 'Pending') {
      return value;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const handleBackToSalaryProcess = () => {
    navigate('/salaryMaster/SalaryProcess', {
      state: { fromOTApproval: true }
    });
  };
  const handleBackToAttendanceProcess = () => {
    navigate('/attendanceProcess/AttendenceProcess', {
      state: { fromOTApproval: true }
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-between align-items-center" style={{ marginBottom: '20px' }}>
            <div className="d-flex flex-wrap">
              <ActionButton title="Search" icon={SearchIcon} onClick={handleClick} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleAllClear} />
              <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
            </div>

            <div>
              {cameFromSalaryProcess && (
                <Button variant="outlined" onClick={handleBackToSalaryProcess} startIcon={<ArrowBackIcon />}>
                  Back to Salary Process
                </Button>
              )}
              {cameFromAttendanceProcess && (
                <Button variant="outlined" onClick={handleBackToAttendanceProcess} startIcon={<ArrowBackIcon />}>
                  Back to Attendance Process
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled" size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={
                    <span>
                      From Date<span style={{ color: 'red' }}> *</span>
                    </span>
                  }
                  format="DD-MM-YYYY"
                  value={formData.fromDate ? dayjs(formData.fromDate) : null}
                  onChange={(newValue) => {
                    setFormData((prev) => ({ ...prev, fromDate: newValue }));
                    setFieldErrors((prev) => ({ ...prev, fromDate: '' }));
                  }}
                  minDate={dayjs().subtract(1, 'year').startOf('year')} // Start of previous year
                  maxDate={dayjs().endOf('year')} // End of current year
                  shouldDisableYear={(date) => {
                    const year = date.year();
                    const currentYear = dayjs().year();
                    return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      error: !!fieldErrors.fromDate || !!fieldErrors.dateRange,
                      helperText: fieldErrors.fromDate || ''
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled" size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={
                    <span>
                      To Date<span style={{ color: 'red' }}> *</span>
                    </span>
                  }
                  format="DD-MM-YYYY"
                  value={formData.toDate ? dayjs(formData.toDate) : null}
                  onChange={(newValue) => {
                    setFormData((prev) => ({ ...prev, toDate: newValue }));
                    setFieldErrors((prev) => ({ ...prev, toDate: '' }));
                  }}
                  minDate={formData.fromDate ? dayjs(formData.fromDate) : dayjs().subtract(1, 'year').startOf('year')}
                  maxDate={dayjs().endOf('year')} // End of current year
                  shouldDisableYear={(date) => {
                    const year = date.year();
                    const currentYear = dayjs().year();
                    return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      error: !!fieldErrors.toDate || !!fieldErrors.dateRange,
                      helperText: fieldErrors.toDate || fieldErrors.dateRange || ''
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth>
              <InputLabel id="branch-label">Branch</InputLabel>
              <Select
                labelId="branch-label"
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
              >
                {branchList.map((branch) => (
                  <MenuItem key={branch.id || 0} value={branch.branchCode}>
                    {branch.branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small">
              <InputLabel id="employee-type-label">Employee *</InputLabel>
              <Select
                labelId="employee-type-label"
                label="Employee *"
                name="employeeType"
                value={formData.employeeType}
                onChange={handleInputChange}
                error={Boolean(fieldErrors.employeeType)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
                <MenuItem value="Contractor">Contractor</MenuItem>
              </Select>
              {fieldErrors.employeeType && <FormHelperText error>{fieldErrors.employeeType}</FormHelperText>}
            </FormControl>
          </div>
          {formData.employeeType === 'Contractor' && (
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={contractList}
                getOptionLabel={(option) => option.label || ''}
                sx={{ width: '100%' }}
                size="small"
                value={contractList.find((c) => c.contractor === formData.contractor) || null}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: { name: 'contractor', value: newValue?.contractor || '' }
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Contractor *"
                    name="contractor"
                    error={Boolean(fieldErrors.contractor)}
                    helperText={fieldErrors.contractor || ''}
                  />
                )}
              />
            </div>
          )}
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small">
              <InputLabel id="department-label">Department</InputLabel>
              <Select
                labelId="department-label"
                id="department"
                name="departmentName"
                value={formData.departmentName}
                label="Department"
                onChange={handleInputChange}
              >
                <MenuItem value="ALL">ALL</MenuItem>
                {departmentList.map((dept) => (
                  <MenuItem key={dept.id} value={dept.departmentName}>
                    {dept.departmentName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <Autocomplete
              size="small"
              options={empList}
              getOptionLabel={(option) => {
                if (!option) return '';
                if (option.employeeCode === 'All') return 'All';
                return `${option.employeeCode} - ${option.employeeName}`;
              }}
              value={empList.find((emp) => emp.employeeName === formData.employeeName) || empList[0] || null}
              onChange={(event, newValue) => {
                handleInputChange({
                  target: {
                    name: 'employeeName',
                    value: newValue ? newValue.employeeName : ''
                  }
                });
              }}
              renderInput={(params) => <TextField {...params} label="Employee Name" variant="outlined" fullWidth />}
              isOptionEqualToValue={(option, value) => option.employeeName === value.employeeName}
            />
          </div>
          {isLoading && (
            <div className="col-md-12" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <CircularProgress size={40} />
            </div>
          )}
        </div>

        {/* Selected Records Table */}
        <Box sx={{ mt: 2 }}>
          <Table stickyHeader component={Paper}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Code</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Name</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Date</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Check In</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Check Out</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>OT Hours</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>OT Amount</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.employeeCode}</TableCell>
                    <TableCell>{item.employeeName}</TableCell>
                    <TableCell>{dayjs(item.date).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>{item.checkIn}</TableCell>
                    <TableCell>{item.checkOut}</TableCell>
                    <TableCell>{formatNumberWithCommas(item.otHours)}</TableCell>
                    <TableCell>{formatNumberWithCommas(item.bankOtAmount)}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={
              selectedRecords.filter((item) =>
                Object.values(item).some((value) =>
                  String(value || '')
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
              ).length
            }
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Box>

        {/* Search Results Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { height: '85vh' } }}>
          <DialogTitle
            sx={{
              backgroundColor: '#f5f5f5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px'
            }}
          >
            <Typography variant="h6">Overtime Records</Typography>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '6px' }}>
            {selectedOtInfo && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* OT Type */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: 'white',
                        borderRadius: 1,
                        boxShadow: 1,
                        height: '100%'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        OT Type
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedOtInfo.otType}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* OT Category */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: 'white',
                        borderRadius: 1,
                        boxShadow: 1,
                        height: '100%'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        OT Category
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedOtInfo.otCategory}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Company OT Policy */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: 'white',
                        borderRadius: 1,
                        boxShadow: 1,
                        height: '100%'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Company OT Policy
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedOtInfo.companyOtPolicy}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Search Field */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search records..."
                      value={dialogSearchQuery}
                      onChange={(e) => setDialogSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: dialogSearchQuery && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={clearDialogSearch}>
                              <Clear fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '44px',
                          backgroundColor: 'white',
                          boxShadow: 1
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ flex: 1, overflow: 'auto', minHeight: '300px' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>
                      <Checkbox
                        color="primary"
                        size="small"
                        indeterminate={
                          filteredSearchResults.some((item) => item.isSelected) && !filteredSearchResults.every((item) => item.isSelected)
                        }
                        checked={filteredSearchResults.length > 0 && filteredSearchResults.every((item) => item.isSelected)}
                        onChange={handleSelectAllRecords}
                      />
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>Code</TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>Name</TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>Date</TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>Check In</TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>Check Out</TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>OT Hours</TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>OT Amount</TableCell>
                    <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', padding: '8px' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSearchResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ padding: '16px' }}>
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSearchResults.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ padding: '8px' }}>
                          <Checkbox size="small" checked={item.isSelected} onChange={() => handleSelectRecord(item.id)} />
                        </TableCell>
                        <TableCell sx={{ padding: '8px' }}>{item.employeeCode}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>{item.employeeName}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>{dayjs(item.date).format('DD-MM-YYYY')}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>{item.checkIn}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>{item.checkOut}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>{formatNumberWithCommas(item.otHours)}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>{formatNumberWithCommas(item.bankOtAmount)}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>{item.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>

            {/* Bottom information and pagination */}
            <Box sx={{ mt: 1, p: 1, borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Selected: {filteredSearchResults.filter((item) => item.isSelected).length} of {filteredSearchResults.length} records
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSearchResults.length}
                    rowsPerPage={dialogRowsPerPage}
                    page={dialogPage}
                    onPageChange={(e, newPage) => setDialogPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setDialogRowsPerPage(parseInt(e.target.value, 10));
                      setDialogPage(0);
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ padding: '16px' }}>
            <Button onClick={handleDialogClose} color="primary" size="small">
              Cancel
            </Button>
            <Button onClick={handleAddSelected} color="primary" variant="contained" size="small">
              Confirm Selection
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default OverTimeMaster;
