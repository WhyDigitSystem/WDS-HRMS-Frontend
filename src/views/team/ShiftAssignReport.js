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
  IconButton,
  Tooltip,
  CircularProgress,
  Typography
} from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { ToastContainer } from 'react-toastify';

const ShiftAssignReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [shiftAssignments, setShiftAssignments] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [shiftTypeList, setShiftTypeList] = useState([]);
  const [contractList, setContractList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    shiftType: '',
    employeeType: '',
    contractor: '',
    departmentName: 'ALL'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDialogClose = () => {
    setDialogOpen(false);
    handleAllClear();
  };

  const handleAllClear = () => {
    setFormData({
      fromDate: null,
      toDate: null,
      shiftType: '',
      employeeType: '',
      contractor: '',
      departmentName: 'ALL'
    });
    setFieldErrors({});
  };

  const handleClick = async () => {
    const errors = {};
    if (!formData.fromDate) errors.fromDate = 'From Date is required';
    if (!formData.toDate) errors.toDate = 'To Date is required';
    if (!formData.shiftType) errors.shiftType = 'Shift Type is required';
    if (!formData.employeeType) errors.employeeType = 'Employee Type is required';
    if (formData.employeeType === 'Contractor' && !formData.contractor) errors.contractor = 'Contractor is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const params = {
        department: formData.departmentName,
        effectiveFrom: dayjs(formData.fromDate).format('YYYY-MM-DD'),
        effectiveTo: dayjs(formData.toDate).format('YYYY-MM-DD'),
        orgId: orgId,
        shifttype: formData.shiftType,
        type: formData.employeeType
      };

      if (formData.employeeType === 'Contractor') {
        params.contractorName = formData.contractor;
      }

      const result = await apiCalls('get', '/advance/getAllShiftDetails', null, params);

      if (result?.status) {
        const assignments = result.paramObjectsMap.shiftAssignVO || [];
        setShiftAssignments(assignments);
        setDialogOpen(true);
      } else {
        showToast('error', result.message || 'No shift assignments found');
      }
    } catch (err) {
      showToast('error', 'Error fetching shift assignments');
      console.error(err);
    } finally {
      setIsLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    getAllShiftType();
    getAllContractList();
    getAllDepartment();
  }, []);

  const handleDownloadPDF = () => {
    if (shiftAssignments.length === 0) {
      showToast('error', 'No data to download');
      return;
    }

    const doc = new jsPDF('landscape'); // Use landscape for better fit
    doc.setFontSize(16);
    doc.text('Shift Assignment Report', 14, 20);

    const fromDate = formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '';
    const toDate = formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '';
    doc.setFontSize(12);
    doc.text(`From: ${fromDate} - To: ${toDate}`, 14, 28);

    // Define columns based on employee type
    const columns = [
      { header: 'Code', dataKey: 'employeeCode', width: 20 },
      { header: 'Name', dataKey: 'employeeName', width: 25 }
    ];

    if (formData.employeeType === 'Contractor') {
      columns.push(
        { header: 'Contractor', dataKey: 'contractor', width: 30 },
        { header: 'Contact Person', dataKey: 'contactPerson', width: 25 },
        { header: 'Contact', dataKey: 'contact', width: 35 }
      );
    }

    columns.push(
      { header: 'Shift', dataKey: 'shiftType', width: 15 },
      { header: 'In Time', dataKey: 'inTime', width: 15 },
      { header: 'Out Time', dataKey: 'outTime', width: 15 },
      { header: 'Hours', dataKey: 'hours', width: 15 },
      { header: 'Department', dataKey: 'department', width: 25 },
      { header: 'Effective From', dataKey: 'effectiveFrom', width: 25 },
      { header: 'Effective To', dataKey: 'effectiveTo', width: 25 },
      { header: 'Status', dataKey: 'status', width: 15 }
    );

    // Prepare data
    const data = shiftAssignments.flatMap((assignment) =>
      assignment.shiftAssignDetailsVO.map((detail) => {
        const row = {
          employeeCode: detail.employeeCode,
          employeeName: detail.employeeName,
          shiftType: detail.shiftType,
          inTime: detail.inTime,
          outTime: detail.outTime,
          hours: detail.hours,
          department: detail.department,
          effectiveFrom: detail.effectiveFrom,
          effectiveTo: detail.effectiveTo,
          status: detail.active ? 'Active' : 'Inactive'
        };

        if (formData.employeeType === 'Contractor') {
          row.contractor = assignment.contractor;
          row.contactPerson = assignment.contactPerson;
          row.contact = `${assignment.contactNumber || ''}${assignment.contactNumber && assignment.contactEmail ? '\n' : ''}${assignment.contactEmail || ''}`;
        }

        return row;
      })
    );

    // Add table with proper configuration
    autoTable(doc, {
      startY: 35,
      columns: columns,
      body: data,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'center'
      },
      headStyles: {
        fillColor: [42, 75, 77],
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        halign: 'center',
        valign: 'middle'
      },
      margin: { left: 5, right: 5 },
      tableWidth: 'auto',
      showHead: 'everyPage',
      pageBreak: 'auto'
    });

    doc.save(`Shift_Assignment_Report_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
  };

  const handleDownloadExcel = () => {
    if (shiftAssignments.length === 0) {
      showToast('error', 'No data to download');
      return;
    }

    const headers = {
      employeeCode: 'Code',
      employeeName: 'Name',
      shiftType: 'Shift',
      inTime: 'In Time',
      outTime: 'Out Time',
      hours: 'Hours',
      department: 'Department',
      effectiveFrom: 'Effective From',
      effectiveTo: 'Effective To',
      active: 'Status'
    };

    if (formData.employeeType === 'Contractor') {
      headers.contractor = 'Contractor';
      headers.contactPerson = 'Contact Person';
      headers.contactNumber = 'Contact Number';
      headers.contactEmail = 'Contact Email';
    }

    const data = shiftAssignments.flatMap((assignment) =>
      assignment.shiftAssignDetailsVO.map((detail) => {
        const row = {
          employeeCode: detail.employeeCode,
          employeeName: detail.employeeName,
          shiftType: detail.shiftType,
          inTime: detail.inTime,
          outTime: detail.outTime,
          hours: detail.hours,
          department: detail.department,
          effectiveFrom: detail.effectiveFrom,
          effectiveTo: detail.effectiveTo,
          active: detail.active
        };

        if (formData.employeeType === 'Contractor') {
          row.contractor = assignment.contractor;
          row.contactPerson = assignment.contactPerson;
          row.contactNumber = assignment.contactNumber;
          row.contactEmail = assignment.contactEmail;
        }

        return row;
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(data, { header: Object.keys(headers) });

    // Add header styling
    const headerKeys = Object.keys(headers);
    headerKeys.forEach((_, colIdx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].v = headers[headerKeys[colIdx]]; // Set display text
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: '2a4b4d' } },
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center' }
      };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shift Assignments');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, `Shift_Assignments_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  const filteredData = shiftAssignments
    .flatMap((assignment) =>
      assignment.shiftAssignDetailsVO
        .filter((detail) => Object.values(detail).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())))
        .map((detail) => ({ ...detail, assignment }))
    )
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={handleClick} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleAllClear} />
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
                      error: !!fieldErrors.fromDate,
                      helperText: fieldErrors.fromDate
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
                      error: !!fieldErrors.toDate,
                      helperText: fieldErrors.toDate
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small" error={!!fieldErrors.shiftType}>
              <InputLabel id="shiftType-label">Shift Type *</InputLabel>
              <Select
                labelId="shiftType-label"
                id="shiftType"
                name="shiftType"
                value={formData.shiftType}
                label="Shift Type *"
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
              options={['Employee', 'Contractor']}
              getOptionLabel={(option) => option}
              sx={{ width: '100%' }}
              size="small"
              value={formData.employeeType || null}
              onChange={(event, newValue) =>
                handleInputChange({
                  target: { name: 'employeeType', value: newValue || '' }
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee *"
                  name="employeeType"
                  error={Boolean(fieldErrors.employeeType)}
                  helperText={fieldErrors.employeeType || ''}
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
          {isLoading && (
            <div className="col-md-12" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <CircularProgress size={40} />
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth>
          <DialogTitle
            sx={{
              backgroundColor: '#f5f5f5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            Shift Assignment Report
            <div style={{ display: 'flex', gap: '10px' }}>
              <Tooltip title="Download Excel">
                <IconButton onClick={handleDownloadExcel}>
                  <DownloadIcon color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton onClick={handleDownloadPDF}>
                  <PictureAsPdfIcon color="error" />
                </IconButton>
              </Tooltip>
            </div>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              {/* Filter Details - Left Side */}
              <Box
                sx={{
                  // backgroundColor: '#f5f5f5',
                  p: 1.5,
                  borderRadius: 1,
                  flexGrow: 1,
                  minWidth: '300px'
                }}
              >
                <Typography variant="body2" sx={{ color: '#333' }}>
                  <strong>Period:</strong> {formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : 'N/A'} to{' '}
                  {formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  <strong>Shift Type:</strong> {formData.shiftType || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  <strong>Employee:</strong> {formData.employeeType || 'N/A'}
                </Typography>
                {formData.employeeType === 'Contractor' && (
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    <strong>Contractor:</strong> {formData.contractor || 'N/A'}
                  </Typography>
                )}
              </Box>

              {/* Search - Right Side */}
              <Box
                sx={{
                  minWidth: '300px',
                  maxWidth: '400px',
                  flexShrink: 0
                }}
              >
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    sx: {
                      backgroundColor: '#fff'
                    }
                  }}
                />
              </Box>
            </Box>

            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Code</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Name</TableCell>
                  {formData.employeeType === 'Contractor' && (
                    <>
                      <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Contractor</TableCell>
                      <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Contact Person</TableCell>
                      <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Contact</TableCell>
                    </>
                  )}
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Shift</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>In Time</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Out Time</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Hours</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Department</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Effective From</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Effective To</TableCell>
                  <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={formData.employeeType === 'Contractor' ? 12 : 9} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.employeeCode}</TableCell>
                      <TableCell>{detail.employeeName}</TableCell>
                      {formData.employeeType === 'Contractor' && (
                        <>
                          <TableCell>{detail.assignment.contractor}</TableCell>
                          <TableCell>{detail.assignment.contactPerson}</TableCell>
                          <TableCell>
                            {detail.assignment.contactNumber}
                            {detail.assignment.contactEmail && <div>{detail.assignment.contactEmail}</div>}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{detail.shiftType}</TableCell>
                      <TableCell>{detail.inTime}</TableCell>
                      <TableCell>{detail.outTime}</TableCell>
                      <TableCell>{detail.hours}</TableCell>
                      <TableCell>{detail.department}</TableCell>
                      <TableCell>{dayjs(detail.effectiveFrom).format('DD-MM-YYYY')}</TableCell>
                      <TableCell>{dayjs(detail.effectiveTo).format('DD-MM-YYYY')}</TableCell>
                      <TableCell>{detail.active}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={shiftAssignments.flatMap((a) => a.shiftAssignDetailsVO).length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={handleDialogClose} sx={{ backgroundColor: '#2a4b4d' }}>
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ShiftAssignReport;