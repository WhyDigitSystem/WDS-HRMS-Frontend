import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';
import { Select, MenuItem, InputLabel, FormControl, FormHelperText, IconButton, Box, Autocomplete, Button, Grid } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TablePagination,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export const ShiftAssign = () => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const branch = localStorage.getItem('branch');
  const branchCode = localStorage.getItem('branchCode');
  const finYear = localStorage.getItem('finYear');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [shiftTypeList, setShiftTypeList] = useState([]);
  const [contractList, setContractList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editId, setEditId] = useState('');
  const [searchTermDialog, setSearchTermDialog] = useState('');
  const [searchTermMain, setSearchTermMain] = useState('');
  const [page, setPage] = useState(0);

  const [formData, setFormData] = useState({
    active: true,
    shiftType: '',
    employeeType: '',
    contractor: '',
    departmentName: '',
    effectiveFrom: null,
    effectiveTo: null,
    description: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    shiftType: '',
    employeeType: '',
    contractor: '',
    departmentName: '',
    effectiveFrom: '',
    effectiveTo: ''
  });

  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'shiftType', header: 'Shift Type', size: 140 },
    { accessorKey: 'type', header: 'Employee Type', size: 140 },
    { accessorKey: 'description', header: 'Description', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  const [slabRows, setSlabRows] = useState([]);

  useEffect(() => {
    getAllShiftType();
    getAllContractList();
    getAllDepartment();
    getAllShiftAssign();
  }, []);

  const getAllShiftAssign = async () => {
    try {
      const result = await apiCalls('get', `shiftmaster/getAllShiftAssignByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.shiftAssignVO.reverse());
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllShiftType = async () => {
    try {
      const result = await apiCalls('get', `shiftmaster/getAllShiftMasterByOrgId?orgId=${orgId}`);
      setShiftTypeList(result.paramObjectsMap.shiftMasterVO.reverse());
    } catch (err) {
      console.log('error', err);
    }
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

  const calculateTotalHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '';

    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);

    let start = new Date(0, 0, 0, inH, inM);
    let end = new Date(0, 0, 0, outH, outM);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const diff = new Date(end - start);
    const hours = diff.getUTCHours();
    const minutes = diff.getUTCMinutes();

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getShiftAssignList = async () => {
    const { employeeType, contractor, departmentName, shiftType, effectiveFrom } = formData;

    // Format the date properly for the API
    const formatDateForAPI = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedEffectiveFrom = formatDateForAPI(effectiveFrom);

    const selectedShift = shiftTypeList.find((item) => item.shift === shiftType);
    const shiftCode = selectedShift?.shiftCode || '';
    const shiftName = selectedShift?.shift || '';

    try {
      const response = await apiCalls(
        'get',
        `shiftmaster/getAllEmployeeAndShiftMasterDetails?branchCode=${branchCode}&department=${departmentName}&contractor=${contractor}&orgId=${orgId}&shift=${shiftName}&shiftCode=${shiftCode}&type=${employeeType}&effectiveFrom=${formattedEffectiveFrom}`
      );

      if (response.status === true && response.paramObjectsMap?.shiftAssignVO) {
        const shiftListWithHours = response.paramObjectsMap.shiftAssignVO.map((item) => ({
          ...item,
          totalHours: calculateTotalHours(item.inTime, item.outTime),
          selected: false,
          effectiveFrom: formData.effectiveFrom,
          effectiveTo: formData.effectiveTo
        }));

        setEmployeeList(shiftListWithHours);
        setSelectedEmployees([]);
        setSelectAll(false);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClear = () => {
    setFormData({
      active: true,
      shiftType: '',
      employeeType: '',
      contractor: '',
      departmentName: '',
      effectiveFrom: null,
      effectiveTo: null,
      description: ''
    });
    setFieldErrors({});
    setEditId('');
    setSlabRows([]);
  };

  const getShiftAssignById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `shiftmaster/getShiftAssignById?id=${row.original.id}`);
      if (response.status === true) {
        const data = response.paramObjectsMap.shiftAssignVO;

        // Convert string dates to Date objects
        const effectiveFromDate = data.shiftAssignDetailsVO[0]?.effectiveFrom ? new Date(data.shiftAssignDetailsVO[0].effectiveFrom) : null;

        const effectiveToDate = data.shiftAssignDetailsVO[0]?.effectiveTo ? new Date(data.shiftAssignDetailsVO[0].effectiveTo) : null;

        // Set main form data
        setFormData({
          shiftType: data.shiftType,
          employeeType: data.type,
          contractor: data.contractor,
          departmentName: data.department,
          effectiveFrom: effectiveFromDate,
          effectiveTo: effectiveToDate,
          description: data.description,
          active: data.active === 'Active'
        });

        // Map the shift assignment details to slabRows
        const mappedSlabs = data.shiftAssignDetailsVO.map((item) => ({
          employeeCode: item.employeeCode,
          employeeName: item.employeeName,
          shiftType: item.shiftType,
          inTime: item.inTime,
          outTime: item.outTime,
          department: item.department,
          totalHours: item.hours,
          effectiveFrom: item.effectiveFrom ? new Date(item.effectiveFrom) : null,
          effectiveTo: item.effectiveTo ? new Date(item.effectiveTo) : null,
          active: item.active === 'Active' ? true : false,
          errors: {}
        }));

        setSlabRows(mappedSlabs);
        setListView(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterEmployees = (employees, searchTerm) => {
    if (!searchTerm) return employees;
    return employees.filter(
      (emp) =>
        emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.shiftType) errors.shiftType = 'Shift Type is required';
    if (!formData.employeeType) errors.employeeType = 'Type is required';
    if (formData.employeeType === 'Contractor' && !formData.contractor) errors.contractor = 'Contractor is required';
    if (!formData.departmentName) errors.departmentName = 'Department is required';
    if (!formData.effectiveFrom) errors.effectiveFrom = 'Effective From is required';
    if (!formData.effectiveTo) errors.effectiveTo = 'Effective To is required';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (slabRows.length === 0) {
      showToast('error', 'Please select at least one employee');
      return;
    }

    setIsLoading(true);

    // Format dates for API
    const formatDateForAPI = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Find the selected shift to get shiftCode
    const selectedShift = shiftTypeList.find((item) => item.shift === formData.shiftType);
    const shiftCode = selectedShift?.shiftCode || '';

    // Find the selected contractor details if employeeType is Contractor
    let contactPerson = '';
    let contactNumber = '';
    let contactEmail = '';

    if (formData.employeeType === 'Contractor') {
      const selectedContractor = contractList.find((c) => c.contractor === formData.contractor);
      if (selectedContractor) {
        contactPerson = selectedContractor.contactPerson || '';
        contactNumber = selectedContractor.contactNumber || '';
        contactEmail = selectedContractor.email || '';
      }
    }

    const shiftAssignDetailsDTO = slabRows.map((row) => ({
      ...(editId && { id: parseInt(editId) }),
      active: row.active !== false, // Default to true if not set
      effectiveFrom: formatDateForAPI(row.effectiveFrom),
      effectiveTo: formatDateForAPI(row.effectiveTo),
      employeeCode: row.employeeCode,
      employeeName: row.employeeName,
      outTime: row.outTime,
      hours: row.totalHours,
      shiftType: formData.shiftType,
      shiftCode: shiftCode,
      inTime: row.inTime,
      department: row.department
    }));

    const payload = {
      ...(editId && { id: parseInt(editId) }),
      active: formData.active,
      branch,
      branchCode,
      contactPerson,
      contactNumber,
      contactEmail,
      contractor: formData.contractor,
      createdBy: loginUserName,
      description: formData.description,
      department: formData.departmentName,
      finYear,
      orgId: parseInt(orgId),
      shiftType: formData.shiftType,
      shiftCode: shiftCode,
      type: formData.employeeType,
      shiftAssignDetailsDTO
    };

    try {
      const result = await apiCalls('put', '/shiftmaster/createUpdateShiftAssign', payload);
      if (result.status === true) {
        showToast('success', editId ? 'Shift Assignment Updated Successfully' : 'Shift Assignment Created Successfully');
        handleClear();
        getAllShiftAssign(); // Refresh the list view
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'API Error during save');
    }

    setIsLoading(false);
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleCheckboxChange = (event) => {
    setFormData({ ...formData, active: event.target.checked });
  };

  const handleSelectEmployee = (employeeCode) => {
    const updatedEmployees = employeeList.map((emp) => (emp.employeeCode === employeeCode ? { ...emp, selected: !emp.selected } : emp));

    setEmployeeList(updatedEmployees);

    const selected = updatedEmployees.filter((emp) => emp.selected);
    setSelectedEmployees(selected);
    setSelectAll(selected.length === updatedEmployees.length);
  };

  const handleSelectAll = (event) => {
    const isSelected = event.target.checked;
    setSelectAll(isSelected);

    const updatedEmployees = employeeList.map((emp) => ({
      ...emp,
      selected: isSelected,
      effectiveFrom: formData.effectiveFrom,
      effectiveTo: formData.effectiveTo
    }));
    setEmployeeList(updatedEmployees);

    setSelectedEmployees(isSelected ? [...updatedEmployees] : []);
  };
  const handleAddSelected = () => {
    const selected = employeeList.filter((emp) => emp.selected);

    setSlabRows((prevRows) => {
      const existingEmployeeCodes = new Set(prevRows.map((row) => row.employeeCode));
      const newEmployees = selected
        .filter((emp) => !existingEmployeeCodes.has(emp.employeeCode))
        .map((emp) => ({
          ...emp,
          effectiveFrom: formData.effectiveFrom, // Add this line
          effectiveTo: formData.effectiveTo // Add this line
        }));

      return [...prevRows, ...newEmployees];
    });

    setDialogOpen(false);
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (index, field, value) => {
    const updated = [...slabRows];
    updated[index][field] = value;
    setSlabRows(updated);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
        </div>

        {listView ? (
          <CommonListViewTable
            data={listViewData}
            columns={listViewColumns}
            blockEdit={true}
            enableEditing={true}
            toEdit={getShiftAssignById}
          />
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.shiftType}>
                  <InputLabel id="shiftType-label">Shift Type</InputLabel>
                  <Select
                    labelId="shiftType-label"
                    id="shiftType"
                    name="shiftType"
                    value={formData.shiftType}
                    label="Shift Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Select Shift Type</em>
                    </MenuItem>
                    {shiftTypeList.map((item) => (
                      <MenuItem key={item.id} value={item.shift}>
                        {item.shift}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{fieldErrors.shiftType}</FormHelperText>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={['All', 'Employee', 'Contractor']}
                  getOptionLabel={(option) => option}
                  sx={{ width: '100%' }}
                  size="small"
                  value={formData.employeeType || null}
                  onChange={(event, newValue) => handleInputChange({ target: { name: 'employeeType', value: newValue || '' } })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Type *"
                      name="employeeType"
                      error={Boolean(fieldErrors.employeeType)}
                      helperText={fieldErrors.employeeType || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
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
                      handleInputChange({ target: { name: 'contractor', value: newValue?.contractor || '' } });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Contractor *"
                        name="contractor"
                        error={Boolean(fieldErrors.contractor)}
                        helperText={fieldErrors.contractor || ''}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: 40 }
                        }}
                      />
                    )}
                  />
                </div>
              )}
              <div className="col-md-3 mb-3">
                <Box display="flex" alignItems="center">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.departmentName}>
                    <InputLabel id="departmentName-label">Department</InputLabel>
                    <Select
                      labelId="departmentName-label"
                      label="Department"
                      value={formData.departmentName}
                      onChange={handleInputChange}
                      name="departmentName"
                    >
                      <MenuItem value="ALL">ALL</MenuItem>
                      {departmentList.map((group, index) => (
                        <MenuItem key={index} value={group.departmentName}>
                          {group.departmentName}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.departmentName && <FormHelperText>{fieldErrors.departmentName}</FormHelperText>}
                  </FormControl>
                </Box>
              </div>
              <div className="col-md-3 mb-3">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Effective From *"
                    value={formData.effectiveFrom}
                    onChange={(newValue) => {
                      setFormData({ ...formData, effectiveFrom: newValue });
                    }}
                    format="dd/MM/yyyy"
                    minDate={new Date(new Date().getFullYear() - 1, 0, 1)} // January 1st of previous year
                    maxDate={new Date(new Date().getFullYear(), 11, 31)} // December 31st of current year
                    shouldDisableYear={(date) => {
                      const year = date.getFullYear();
                      const currentYear = new Date().getFullYear();
                      return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!fieldErrors.effectiveFrom,
                        helperText: fieldErrors.effectiveFrom,
                        variant: 'outlined'
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className="col-md-3 mb-3">
                <Box display="flex" alignItems="center">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Effective To *"
                      value={formData.effectiveTo}
                      onChange={(newValue) => {
                        setFormData({ ...formData, effectiveTo: newValue });
                      }}
                      format="dd/MM/yyyy"
                      minDate={formData.effectiveFrom || new Date(new Date().getFullYear() - 1, 0, 1)} // Minimum from selected from date or Jan 1 of previous year
                      maxDate={new Date(new Date().getFullYear(), 11, 31)} // December 31st of current year
                      shouldDisableYear={(date) => {
                        const year = date.getFullYear();
                        const currentYear = new Date().getFullYear();
                        return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!fieldErrors.effectiveTo,
                          helperText: fieldErrors.effectiveTo,
                          variant: 'outlined'
                        }
                      }}
                    />
                  </LocalizationProvider>
                  {formData.effectiveTo && (
                    <Button
                      variant="contained"
                      onClick={getShiftAssignList}
                      sx={{
                        ml: 1,
                        height: 40,
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)'
                        }
                      }}
                    >
                      Go
                    </Button>
                  )}
                </Box>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  fullWidth
                  size="small"
                  id="description"
                  name="description"
                  label="Description"
                  variant="outlined"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                  label="Active"
                  labelPlacement="end"
                />
              </div>
            </div>
            <Box className="mt-4">
              {/* Search Box */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <TextField
                  size="small"
                  placeholder="Search employees..."
                  variant="outlined"
                  value={searchTermMain}
                  onChange={(e) => setSearchTermMain(e.target.value)}
                  sx={{
                    width: { xs: '100%', sm: 300 },
                    '& .MuiOutlinedInput-root': {
                      height: 36,
                      borderRadius: 1
                    }
                  }}
                />
              </Box>

              {/* Table Container with Horizontal Scroll */}
              <Box sx={{ mt: 4 }}>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  {/* Table Header - Desktop */}
                  <Box
                    display={{ xs: 'none', sm: 'grid' }}
                    gridTemplateColumns="repeat(9, minmax(0, 1fr))"
                    bgcolor="#2a4b4d"
                    color="white"
                    p={1}
                    textAlign="center"
                    fontSize={13}
                    fontWeight="bold"
                    gap={1}
                    minWidth={800}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Active</Box>
                    <Box>Name</Box>
                    <Box>Code</Box>
                    <Box>Department</Box>
                    <Box>Shift</Box>
                    <Box>In Time</Box>
                    <Box>Out Time</Box>
                    <Box>Effective From</Box>
                    <Box>Effective To</Box>
                  </Box>

                  {/* Mobile Table Header */}
                  <Box
                    display={{ xs: 'block', sm: 'none' }}
                    bgcolor="#2a4b4d"
                    color="white"
                    p={1}
                    textAlign="center"
                    fontSize={13}
                    fontWeight="bold"
                  >
                    Employee Shift Assignments
                  </Box>

                  {/* Table Content */}
                  {filterEmployees(slabRows, searchTermMain).length > 0 ? (
                    <>
                      {/* Desktop Rows */}
                      <Box display={{ xs: 'none', sm: 'block' }}>
                        {filterEmployees(slabRows, searchTermMain)
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row, index) => {
                            const actualIndex = page * rowsPerPage + index;
                            return (
                              <Box
                                key={actualIndex}
                                display="grid"
                                gridTemplateColumns="repeat(9, minmax(0, 1fr))"
                                gap={1}
                                p={1}
                                alignItems="center"
                                bgcolor="#fff"
                                sx={{
                                  borderBottom: '1px solid #e0e0e0',
                                  '&:hover': { backgroundColor: '#f5f5f5' },
                                  minWidth: 800
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                  <Checkbox
                                    size="small"
                                    checked={row.active !== false}
                                    onChange={(e) => {
                                      const updated = [...slabRows];
                                      updated[actualIndex].active = e.target.checked;
                                      setSlabRows(updated);
                                    }}
                                    sx={{ padding: 0.5 }}
                                  />
                                </Box>
                                <TextField
                                  size="small"
                                  value={row.employeeName || ''}
                                  fullWidth
                                  disabled
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                                <TextField
                                  size="small"
                                  value={row.employeeCode || ''}
                                  fullWidth
                                  disabled
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                                <TextField
                                  size="small"
                                  value={row.department || ''}
                                  fullWidth
                                  disabled
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                                <TextField
                                  size="small"
                                  value={formData.shiftType || ''}
                                  fullWidth
                                  disabled
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                                <TextField
                                  size="small"
                                  value={row.inTime || ''}
                                  fullWidth
                                  disabled
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                                <TextField
                                  size="small"
                                  value={row.outTime || ''}
                                  fullWidth
                                  disabled
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                                <TextField
                                  size="small"
                                  type="date"
                                  value={formatDateForInput(row.effectiveFrom)}
                                  onChange={(e) => handleDateChange(actualIndex, 'effectiveFrom', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                                <TextField
                                  size="small"
                                  type="date"
                                  value={formatDateForInput(row.effectiveTo)}
                                  onChange={(e) => handleDateChange(actualIndex, 'effectiveTo', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  sx={{ input: { padding: '6px 8px', fontSize: 13 } }}
                                />
                              </Box>
                            );
                          })}
                      </Box>

                      {/* Mobile Rows */}
                      <Box display={{ xs: 'block', sm: 'none' }}>
                        {filterEmployees(slabRows, searchTermMain)
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row, index) => {
                            const actualIndex = page * rowsPerPage + index;
                            return (
                              <Box key={actualIndex} mb={1} bgcolor="#fff" p={2} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {row.employeeName}
                                  </Typography>
                                  <Checkbox
                                    size="small"
                                    checked={row.active !== false}
                                    onChange={(e) => {
                                      const updated = [...slabRows];
                                      updated[actualIndex].active = e.target.checked;
                                      setSlabRows(updated);
                                    }}
                                  />
                                </Box>

                                <Grid container spacing={1}>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      Code:
                                    </Typography>
                                    <Typography>{row.employeeCode}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      Department:
                                    </Typography>
                                    <Typography>{row.department}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      Shift:
                                    </Typography>
                                    <Typography>{formData.shiftType}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      Timing:
                                    </Typography>
                                    <Typography>
                                      {row.inTime} - {row.outTime}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      From:
                                    </Typography>
                                    <TextField
                                      size="small"
                                      type="date"
                                      value={row.effectiveFrom || ''}
                                      onChange={(e) => handleDateChange(actualIndex, 'effectiveFrom', e.target.value)}
                                      InputLabelProps={{ shrink: true }}
                                      fullWidth
                                      sx={{ mt: 0.5 }}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      To:
                                    </Typography>
                                    <TextField
                                      size="small"
                                      type="date"
                                      value={row.effectiveTo || ''}
                                      onChange={(e) => handleDateChange(actualIndex, 'effectiveTo', e.target.value)}
                                      InputLabelProps={{ shrink: true }}
                                      fullWidth
                                      sx={{ mt: 0.5 }}
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            );
                          })}
                      </Box>
                    </>
                  ) : (
                    <Box p={2} textAlign="center" bgcolor="#fff">
                      No data available
                    </Box>
                  )}
                </Paper>

                {/* Pagination */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filterEmployees(slabRows, searchTermMain).length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </Box>
            </Box>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle style={{ fontSize: '16px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>SHIFT ASSIGN</span>
            <TextField
              size="small"
              placeholder="Search..."
              variant="outlined"
              value={searchTermDialog}
              onChange={(e) => setSearchTermDialog(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {filterEmployees(employeeList, searchTermDialog).length > 0 ? (
            <Table size="small">
              <TableHead sx={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                    <Checkbox checked={selectAll} onChange={handleSelectAll} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
                  </TableCell>
                  {[
                    'Name',
                    'Code',
                    'Department',
                    'Shift',
                    'In Time',
                    'Out Time',
                    'Shift Hours',
                    'Active',
                    'Effective From',
                    'Effective To'
                  ].map((header, i) => (
                    <TableCell key={i} sx={{ color: 'white', fontWeight: 'bold' }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filterEmployees(employeeList, searchTermDialog).map((emp, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox checked={emp.selected || false} onChange={() => handleSelectEmployee(emp.employeeCode)} />
                    </TableCell>
                    <TableCell>{emp.employeeName}</TableCell>
                    <TableCell>{emp.employeeCode}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.shift || ''}</TableCell>
                    <TableCell>{emp.inTime || ''}</TableCell>
                    <TableCell>{emp.outTime || ''}</TableCell>
                    <TableCell>{emp.totalHours || ''}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={emp.active !== false}
                        onChange={(e) => {
                          const updated = [...employeeList];
                          updated[index].active = e.target.checked;
                          setEmployeeList(updated);
                        }}
                      />
                    </TableCell>
                    {/* FIXED: Format Date objects to strings */}
                    <TableCell>{emp.effectiveFrom ? emp.effectiveFrom.toLocaleDateString() : ''}</TableCell>
                    <TableCell>{emp.effectiveTo ? emp.effectiveTo.toLocaleDateString() : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>No data found</div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSelected} variant="contained" color="primary" disabled={selectedEmployees.length === 0}>
            Add Selected ({selectedEmployees.length})
          </Button>
        </DialogActions>
      </Dialog>

      <ToastComponent />
    </>
  );
};

export default ShiftAssign;
