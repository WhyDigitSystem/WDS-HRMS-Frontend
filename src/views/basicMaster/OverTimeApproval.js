import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Typography,
  Paper,
  TablePagination,
  Tooltip,
  IconButton
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const OverTimeApproval = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    branch: 'All',
    employeeType: 'All',
    departmentName: 'ALL',
    employeeName: '',
    contractor: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [empList, setEmpList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [contractList, setContractList] = useState([]);

  useEffect(() => {
    getAllDepartment();
    getAllUsers();
    getAllBranches();
    getAllContractList();
  }, []);

  const handleAllClear = () => {
    setFormData({
      fromDate: null,
      toDate: null,
      branch: 'All',
      employeeType: 'All',
      departmentName: 'ALL',
      employeeName: '',
      contractor: ''
    });
    setFieldErrors({});
    setReportData([]);
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList([{ id: 0, branch: 'All', branchCode: 'All' }, ...branchData]);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      if (response.status === true) {
        const allEmployeeOption = { employeeCode: 'All', employee: 'All' };
        setEmpList([allEmployeeOption, ...response.paramObjectsMap.employeeVO]);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleClick = async () => {
    const errors = {};
    if (!formData.fromDate) errors.fromDate = 'From Date is required';
    if (!formData.toDate) errors.toDate = 'To Date is required';

    if (formData.fromDate && formData.toDate) {
      const fromDate = dayjs(formData.fromDate);
      const toDate = dayjs(formData.toDate);
      if (fromDate.isAfter(toDate)) {
        errors.dateRange = 'From Date cannot be after To Date';
      }
    }

    // Add contractor validation when employee type is Contractor
    if (formData.employeeType === 'Contractor' && !formData.contractor) {
      errors.contractor = 'Contractor is required';
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
        employeeCode:
          formData.employeeName === 'All'
            ? 'All'
            : formData.employeeName
              ? empList.find((e) => e.employee === formData.employeeName)?.employeeCode || 'All'
              : 'All',
        fromDate: dayjs(formData.fromDate).format('YYYY-MM-DD'),
        toDate: dayjs(formData.toDate).format('YYYY-MM-DD'),
        orgId: orgId,
        type: formData.employeeType === 'All' ? 'All' : formData.employeeType,
        ...(formData.employeeType === 'Contractor' && { contractor: formData.contractor })
      };

      const result = await apiCalls('get', '/checkinout/getApprovedOTHoursByOrgId', null, params);

      if (result?.status) {
        const reportItems = result.paramObjectsMap.otCalculationVO || [];
        const transformedData = reportItems.map((item) => ({
          id: item.id,
          employeeCode: item.empcode,
          employeeName: item.empname,
          date: item.checkindate,
          checkIn: item.intime,
          checkOut: item.outtime,
          otHours: item.othours,
          otAmount: item.otamount,
          rate: item.rate,
          otType: item.ottype,
          otCategory: item.otcategory,
          companyOtPolicy: item.companyOtPolicy,
          status: item.status,
          approvedBy: item.approveBy,
          approvedOn: item.approveOn
        }));

        setReportData(transformedData);
      } else {
        showToast('error', result.message || 'No approved overtime data found');
      }
    } catch (err) {
      showToast('error', 'Error fetching approved overtime data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
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

  const filteredData = reportData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDownloadExcel = () => {
    if (reportData.length === 0) {
      showToast('error', 'No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map((item) => ({
        Code: item.employeeCode,
        Name: item.employeeName,
        Date: dayjs(item.date).format('DD-MM-YYYY'),
        'Check In': item.checkIn,
        'Check Out': item.checkOut,
        'OT Hours': item.otHours,
        'OT Amount': item.bankOtAmount,
        Status: item.status,
        'Approved By': item.approvedBy,
        'Approved On': item.approvedOn
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Overtime Approval');
    XLSX.writeFile(workbook, `Overtime_Approval_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (reportData.length === 0) {
      showToast('error', 'No data to export');
      return;
    }

    const doc = new jsPDF();
    const title = 'Overtime Approval Report';
    const headers = [['Code', 'Name', 'Date', 'Check In', 'Check Out', 'OT Hours', 'OT Amount', 'Status']];

    const data = reportData.map((item) => [
      item.employeeCode,
      item.employeeName,
      dayjs(item.date).format('DD-MM-YYYY'),
      item.checkIn,
      item.checkOut,
      item.otHours,
      item.bankOtAmount,
      item.status
    ]);

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    let yPosition = 25;

    if (formData.fromDate) {
      doc.text(`From Date: ${dayjs(formData.fromDate).format('DD-MM-YYYY')}`, 14, yPosition);
      yPosition += 5;
    }

    if (formData.toDate) {
      doc.text(`To Date: ${dayjs(formData.toDate).format('DD-MM-YYYY')}`, 14, yPosition);
      yPosition += 5;
    }

    if (formData.branch !== 'All') {
      const branchName = branchList.find((b) => b.branchCode === formData.branch)?.branch || formData.branch;
      doc.text(`Branch: ${branchName}`, 14, yPosition);
      yPosition += 5;
    }

    if (formData.employeeType !== 'All') {
      doc.text(`Employee Type: ${formData.employeeType}`, 14, yPosition);
      yPosition += 5;
    }

    if (formData.departmentName !== 'ALL') {
      doc.text(`Department: ${formData.departmentName}`, 14, yPosition);
      yPosition += 5;
    }

    if (formData.employeeName) {
      doc.text(`Employee: ${formData.employeeName}`, 14, yPosition);
      yPosition += 5;
    }

    doc.text(`Report Generated: ${dayjs().format('DD-MM-YYYY HH:mm')}`, 14, yPosition);
    yPosition += 10;

    doc.autoTable({
      head: headers,
      body: data,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 1,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [42, 75, 77],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    doc.save(`Overtime_Approval_${dayjs().format('YYYY-MM-DD')}.pdf`);
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

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={handleClick} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleAllClear} />
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
              <Tooltip title="Download Excel">
                <IconButton size="small" onClick={handleDownloadExcel} disabled={reportData.length === 0}>
                  <DownloadIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton size="small" onClick={handleDownloadPDF} disabled={reportData.length === 0}>
                  <PictureAsPdfIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
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
              <InputLabel id="employee-type-label">Type</InputLabel>
              <Select
                labelId="employee-type-label"
                label="Employee"
                name="employeeType"
                value={formData.employeeType}
                onChange={handleInputChange}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
                <MenuItem value="Contractor">Contractor</MenuItem>
              </Select>
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
              getOptionLabel={(option) => (option ? `${option.employeeCode} - ${option.employee}` : '')}
              value={empList.find((emp) => emp.employee === formData.employeeName) || null}
              onChange={(event, newValue) => {
                handleInputChange({
                  target: {
                    name: 'employeeName',
                    value: newValue ? newValue.employee : ''
                  }
                });
              }}
              renderInput={(params) => <TextField {...params} label="Name" variant="outlined" fullWidth />}
              isOptionEqualToValue={(option, value) => option.employee === value.employee}
            />
          </div>
          {isLoading && (
            <div className="col-md-12" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <CircularProgress size={40} />
            </div>
          )}
        </div>

        {/* Report Data Table */}
        <Box sx={{ mt: 4 }}>
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
              {filteredData.length > 0 ? (
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
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    {isLoading ? 'Loading...' : 'No data available. Please search with filters.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reportData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      </div>
    </>
  );
};

export default OverTimeApproval;
