import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import Autocomplete from '@mui/material/Autocomplete';
import {
  FormControl,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Paper,
  Table,
  TableRow,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  FormHelperText
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import ActionButton from 'utils/ActionButton';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
import { CircularProgress } from '@mui/material';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 2 }, (_, index) => currentYear - index);

const MonthlyAttendance = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [contractList, setContractList] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [formData, setFormData] = useState({
    branch: 'All',
    department: 'All',
    month: dayjs().month() + 1,
    year: dayjs().year(),
    employeeType: 'Employee',
    contractor: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [shiftHoursMap, setShiftHoursMap] = useState({});

  useEffect(() => {
    getAllDepartment();
    getAllBranches();
    getAllContractList();
    getCompanyDetails();
  }, []);

  // Function to fetch shift hours for each employee
  const fetchShiftHours = async (employeeCode, branchCode) => {
    try {
      const response = await apiCalls(
        'get',
        `/checkinout/getEmployeeShiftHoursForMonthlyReport?branchCode=${branchCode}&empCode=${employeeCode}&month=${formData.month}&orgId=${orgId}&year=${formData.year}`
      );

      if (response.status === true && response.paramObjectsMap.shiftMasterVO) {
        return response.paramObjectsMap.shiftMasterVO[0]?.hours || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching shift hours:', error);
      return null;
    }
  };

  // Function to convert time string to decimal hours
  const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;

    // Handle decimal format (e.g., "9.5")
    if (!isNaN(parseFloat(timeStr)) && isFinite(timeStr)) {
      return parseFloat(timeStr);
    }

    // Handle time format (e.g., "9:30")
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours + minutes / 60;
    }

    return 0;
  };

  const fetchMonthlyAttendance = async () => {
    setIsLoading(true);
    try {
      let url = `/checkinout/getMonthlyProcess?branch=${formData.branch}&department=${formData.department}&month=${formData.month.toString().padStart(2, '0')}&orgId=${orgId}&year=${formData.year}&type=${formData.employeeType}`;

      if (formData.employeeType === 'Contractor' && formData.contractor) {
        url += `&contractor=${encodeURIComponent(formData.contractor)}`;
      }

      const response = await apiCalls('get', url);

      if (response.status === true && Array.isArray(response.paramObjectsMap.monthlyProcess)) {
        const attendanceData = response.paramObjectsMap.monthlyProcess;

        // Create a map to store shift hours for each employee
        const hoursMap = {};

        // Fetch shift hours for each employee
        for (const employee of attendanceData) {
          // Extract branch code (assuming first 3 letters of branch name)
          const branchCode = employee.branch ? employee.branch.substring(0, 3).toUpperCase() : 'ALL';

          const shiftHours = await fetchShiftHours(employee.code, branchCode);
          hoursMap[employee.code] = shiftHours;
        }

        setShiftHoursMap(hoursMap);
        setAttendanceData(attendanceData);
        setDialogOpen(true);
      } else {
        showToast('error', response.paramObjectsMap?.message || 'No attendance data found');
        setAttendanceData([]);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch attendance data. Please try again later.');
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClear = () => {
    setFormData({
      branch: 'All',
      department: 'All',
      month: dayjs().month() + 1,
      year: dayjs().year(),
      employeeType: 'Employee',
      contractor: ''
    });
    setFieldErrors({});
    setAttendanceData([]);
    setShiftHoursMap({});
  };

  const getAllContractList = async () => {
    try {
      const response = await apiCalls('get', `shiftmaster/getAllContractMasterByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        setContractList(response.paramObjectsMap.contractMasterVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredData = attendanceData.filter(
    (row) => row.name?.toLowerCase().includes(searchQuery.toLowerCase()) || row.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dayColumns = Array.from({ length: 31 }, (_, i) => `day_${i + 1}`);

  const getDayCellStyle = (value, employeeCode, day) => {
    // Handle leave days
    if (value === 'L') {
      return {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        fontWeight: 'bold'
      };
    }

    // Handle absent/empty days
    if (!value || value === '0' || value === '0.0' || value === '0.00') {
      return {
        backgroundColor: '#f5f5f5',
        color: '#9e9e9e'
      };
    }

    // Get expected hours for this employee
    const expectedHoursStr = shiftHoursMap[employeeCode];
    if (!expectedHoursStr) {
      // No shift data available
      return {
        backgroundColor: '#fff3e0',
        color: '#ef6c00',
        fontWeight: 'bold'
      };
    }

    // Convert to decimal for comparison
    const expectedHours = timeToDecimal(expectedHoursStr);
    const actualHours = timeToDecimal(value);

    // Compare actual hours with expected hours
    if (Math.abs(actualHours - expectedHours) < 0.1) {
      // Hours match expected (within small tolerance)
      return {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        fontWeight: 'bold'
      };
    } else if (actualHours < expectedHours) {
      // Less than expected hours
      return {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        fontWeight: 'bold'
      };
    } else {
      // More than expected hours
      return {
        backgroundColor: '#fff3e0',
        color: '#ef6c00',
        fontWeight: 'bold'
      };
    }
  };

  // Update export functions to include shift hours comparison
  const exportToExcel = async ({ logo }) => {
    if (filteredData.length === 0) {
      showToast('error', 'No data');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Monthly Attendance');

    // Add logo if available
    if (logo) {
      try {
        const base64Data = logo.split(',')[1] || logo;
        if (base64Data.length >= 100) {
          const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
          const imageId = workbook.addImage({
            base64: base64Data,
            extension
          });
          sheet.mergeCells('A1:B4');
          sheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 140, height: 100 }
          });
        }
      } catch (err) {
        console.error('Error adding logo:', err);
      }
    }

    //
    const allBorders = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    const titleRow = sheet.getRow(2);
    sheet.mergeCells('C2:H3');
    const titleCell = sheet.getCell('C2');
    titleCell.value = 'Monthly Attendance';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const metaRow = sheet.getRow(5);
    // metaRow.getCell(1).value = `Branch: ${formData.branch === 'All' ? 'All' : formData.branch}`;
    // {formData.department !== 'All' && (
    // metaRow.getCell(1).value = `Department: ${formData.department === 'All' ? 'All' : formData.department}`
    // )
    // }
    // metaRow.getCell(2).value = `Month: ${formData.month ? dayjs().month(formData.month - 1).format('MMMM')  : '-'}`;
    // metaRow.getCell(3).value = `Year: ${formData.year}`;
    // metaRow.getCell(4).value = `Type: ${formData.employeeType}`;
    // metaRow.getCell(5).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')} `;
    // metaRow.getCell(6).value = `Printed By: ${loginUserName || 'Admin'}`;
    // 
    let colIndex = 1;
if (formData.department !== 'All') {
  metaRow.getCell(colIndex).value = `Department: ${formData.department}`;
  colIndex++;
}
metaRow.getCell(colIndex++).value = `Month: ${formData.month ? dayjs().month(formData.month - 1).format('MMMM') : '-'}`;
metaRow.getCell(colIndex++).value = `Year: ${formData.year}`;
metaRow.getCell(colIndex++).value = `Type: ${formData.employeeType}`;
metaRow.getCell(colIndex++).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')}`;
metaRow.getCell(colIndex++).value = `Printed By: ${loginUserName || 'Admin'}`;
   
for (let i = 1; i < colIndex; i++) {
  const cell = metaRow.getCell(i);
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF593C8F' }
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.border = allBorders;
}

// 
    // for (let i = 1; i <= 6; i++) {
    //   const cell = metaRow.getCell(i);
    //   cell.fill = {
    //     type: 'pattern',
    //     pattern: 'solid',
    //     fgColor: { argb: 'FF593C8F' }
    //   };
    //   cell.alignment = { vertical: 'middle', horizontal: 'center' };
    //   cell.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    //   cell.border = allBorders;
    // }

    const headers = [
      'Code',
      'Name',
      ...(formData.branch === 'All' ? ['Branch'] : []),
      ...(formData.department === 'All' ? ['Dept'] : []),
      'Shift',
      ...dayColumns.map((day) => `D${day.split('_')[1]}`)
    ];

    const columnWidths = headers.map(() => ({ width: 20 }));
    sheet.columns = headers.map((header, i) => ({
      key: header,
      ...columnWidths[i]
    }));

    const headerRow = sheet.getRow(6);
    headerRow.height = 20;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3F51B5' }
      };
      cell.border = allBorders;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    const formatValue = (val) => (val === 0 || val === null || val === '' ? '-' : val);
    filteredData.forEach((row) => {
      const rowData = [];

      rowData.push(formatValue(row.code));
      rowData.push(formatValue(row.name));

      if (formData.branch === 'All') {
        rowData.push(formatValue(row.branch));
      }

      if (formData.department === 'All') {
        rowData.push(formatValue(row.department));
      }

      rowData.push(formatValue(row.shifttype));

      // Add each day column value (formatted)
      dayColumns.forEach((day) => {
        rowData.push(formatValue(row[day]));
      });
      const dataRow = sheet.addRow(rowData);
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F3F3F3' }
        };
        cell.border = allBorders;
        if (cell.value === '-') {
          cell.alignment = {
            horizontal: 'right',
            indent: 1
          };
        } else {
          cell.alignment = {
            indent: 1
          };
        }
      });
    });

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 6 }];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, `Monthly_Attendance.xlsx`);
  };

  const exportToPDF = ({ logo }) => {
    if (filteredData.length === 0) {
      showToast('error', 'No data');
      return;
    }
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    //
    const title = 'Monthly Attendance';
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titlePaddingX = 6;
    const titlePaddingY = 4;
    const titleHeight = 10;
    const titleX = (pageW - (titleWidth + titlePaddingX * 2)) / 2;
    const titleY = 15;

    doc.setFillColor(220, 240, 255); // Light blue
    doc.roundedRect(titleX, titleY - titlePaddingY, titleWidth + titlePaddingX * 2, titleHeight, 4, 4, 'F');
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageW / 2, titleY + 3, { align: 'center' });

    // Logo
    if (logo) doc.addImage(logo, 'PNG', 5, 0, 40, 30);
    //
    const filterY = 25;
    const labelValuePairs = [
      // { label: 'Branch:', value: formData.branch === 'All' ? 'All' : formData.branch },
       ...(formData.department !== 'All'
    ? [{
        label: 'Department:',
        value: formData.department
      }]
    : []),
      {
        label: 'Month:',
        value: dayjs()
          .month(formData.month - 1)
          .format('MMMM')
      },
      { label: 'Year:', value: formData.year },
      { label: 'Employee:', value: formData.employeeType === 'All' ? 'All' : formData.employeeType }
    ];
    doc.setFontSize(10);
    const padding = 3;
    let totalTextWidth = 0;
    labelValuePairs.forEach((pair, idx) => {
      doc.setFont('helvetica', 'bold');
      const labelW = doc.getTextWidth(pair.label + ' ');
      doc.setFont('helvetica', 'normal');
      const valueW = doc.getTextWidth(pair.value + (idx < labelValuePairs.length - 1 ? ' | ' : ''));
      totalTextWidth += labelW + valueW;
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const rectX = (pageWidth - (totalTextWidth + padding * 2)) / 2;
    const rectY = filterY;
    const rectW = totalTextWidth + padding * 2;
    const rectH = 8;
    const borderRadius = 5;
    doc.setFillColor(220, 240, 255);
    doc.roundedRect(rectX, rectY, rectW, rectH, borderRadius, borderRadius, 'F');
    let cursorX = rectX + padding;
    labelValuePairs.forEach((pair, idx) => {
      // Bold label
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(pair.label, cursorX, rectY + 6);
      const labelW = doc.getTextWidth(pair.label + ' ');
      cursorX += labelW;

      // Normal value
      doc.setFont('helvetica', 'normal');
      const valueText = pair.value + (idx < labelValuePairs.length - 1 ? ' | ' : '');
      doc.text(valueText, cursorX, rectY + 6);
      const valueW = doc.getTextWidth(valueText);
      cursorX += valueW;
    });

    const includeBranch = formData.branch === 'All';
    const includeDepartment = formData.department === 'All';
    const head = [
      [
        'Code',
        'Name',
        ...(includeBranch ? ['Branch'] : []),
        ...(includeDepartment ? ['Dept'] : []),
        'Shift',
        ...dayColumns.map((day) => `D${day.split('_')[1]}`)
      ]
    ];
    const formatValue = (val) => (val === 0 || val === null || val === '' ? '-' : val);
    const body = filteredData.map((row) => {
      return [
        row.code,
        row.name,
        ...(includeBranch ? [row.branch] : []),
        ...(includeDepartment ? [row.department] : []),
        row.shifttype,
        ...dayColumns.map((day) => formatValue(row[day]))
      ];
    });
    let columnStyles = {};
    let colIndex = 0;

    columnStyles[colIndex++] = { halign: 'left' };
    columnStyles[colIndex++] = { halign: 'left' };
    if (includeBranch) columnStyles[colIndex++] = { halign: 'left' };
    if (includeDepartment) columnStyles[colIndex++] = { halign: 'left' };
    columnStyles[colIndex++] = { halign: 'left' };
    columnStyles[colIndex++] = { halign: 'left' };
    dayColumns.forEach((day) => {
      columnStyles[colIndex++] = { halign: 'left' };
    });
    doc.autoTable({
      startY: rectY + rectH + 5,
      head: head,
      body: body,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [42, 75, 77],
        textColor: 255,
        halign: 'center'
      },
      margin: { left: 0, right: 0 },
      columnStyles: columnStyles,
      didDrawPage: (data) => {
        // const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(`Print On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
        doc.text(`Monthly Attendance - ${currentPage}`, pageW / 2, pageH - 10, { align: 'center' });
        doc.text(`Printed By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });
      }
    });
    doc.save('Monthly_Attendance.pdf');
  };

  // Company details
  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
      setCompanyDetails(response.paramObjectsMap.companyVO);
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('Error fetching company details', 'error');
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            {/* <ActionButton title="Fetch Data" icon={FormatListBulletedIcon} onClick={fetchMonthlyAttendance} isLoading={isLoading} /> */}
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth>
              <InputLabel id="branch-label">Branch</InputLabel>
              <Select labelId="branch-label" label="Branch" name="branch" value={formData.branch} onChange={handleInputChange}>
                <MenuItem value="All">All</MenuItem>
                {branchList?.map((row) => (
                  <MenuItem key={row.id} value={row.branch}>
                    {row.branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth>
              <InputLabel id="department-label">Department</InputLabel>
              <Select
                labelId="department-label"
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              >
                <MenuItem value="All">All</MenuItem>
                {departmentList?.map((row) => (
                  <MenuItem key={row.id} value={row.departmentName}>
                    {row.departmentName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth>
              <InputLabel id="month-label">Month</InputLabel>
              <Select labelId="month-label" label="Month" name="month" value={formData.month} onChange={handleInputChange}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} value={m}>
                    {dayjs()
                      .month(m - 1)
                      .format('MMMM')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.year}>
              <InputLabel id="year-label">Year</InputLabel>
              <Select labelId="year-label" label="Year" name="year" value={formData.year} onChange={handleInputChange}>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.year && <FormHelperText>{fieldErrors.year}</FormHelperText>}
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <Autocomplete
              // options={['All', 'Employee', 'Contractor']}
             options={['Employee']}
              getOptionLabel={(option) => option}
              sx={{ width: '100%' }}
              size="small"
              value={formData.employeeType}
              onChange={(event, newValue) => {
                handleInputChange({ target: { name: 'employeeType', value: newValue || '' } });
                // if (newValue !== 'Contractor') {
                //   handleInputChange({ target: { name: 'contractor', value: '' } });
                // }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type"
                  name="employeeType"
                  InputProps={{
                    ...params.InputProps,
                    style: { height: 40 }
                  }}
                />
              )}
            />
          </div>

          {/* {formData.employeeType === 'Contractor' && (
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={contractList}
                getOptionLabel={(option) => option.contractor || ''}
                sx={{ width: '100%' }}
                size="small"
                value={contractList.find((c) => c.contractor === formData.contractor) || null}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: {
                      name: 'contractor',
                      value: newValue ? newValue.contractor : ''
                    }
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Contractor"
                    name="contractor"
                    InputProps={{
                      ...params.InputProps,
                      style: { height: 40 }
                    }}
                  />
                )}
              />
            </div>
          )} */}

          <div className="col-md-1 mb-3 d-flex align-items-end">
            <Button
              variant="contained"
              onClick={fetchMonthlyAttendance}
              disabled={isLoading}
              fullWidth
              // sx={{
              //   height: '40px',
              //   background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)'
              // }}
              sx={{
                borderRadius: '8px',
                boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                textTransform: 'none',
                background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                '&:disabled': {
                  background: '#cccccc'
                }
              }}
            >
              {/* {isLoading ? 'Loading...' : 'Go'} */}
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Go'}
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xl"
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              Monthly Attendance Details{' '}
              {/* {dayjs()
                .month(formData.month - 1)
                .format('MMMM')}{' '}
              {formData.year} */}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Download Excel">
                  <IconButton size="small" onClick={() => exportToExcel({ logo: companyDetails[0]?.companyLogo })}>
                    <DownloadIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download PDF">
                  <IconButton size="small" onClick={() => exportToPDF({ logo: companyDetails[0]?.companyLogo })}>
                    <PictureAsPdfIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ marginTop: 5, marginBottom: 5, fontWeight: 'bold' }}>
            {dayjs()
              .month(formData.month - 1)
              .format('MMMM YYYY')}
          </div>
          <Box sx={{ width: '100%', height: '60vh', display: 'flex', flexDirection: 'column' }}>
            <TableContainer
              component={Paper}
              sx={{
                flex: 1,
                overflow: 'auto',
                maxHeight: 'calc(60vh - 64px)',
                position: 'relative'
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}
                >
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    {formData.branch === 'All' && <TableCell>Branch</TableCell>}
                    {formData.department === 'All' && <TableCell>Department</TableCell>}
                    <TableCell>Shift</TableCell>
                    {/* <TableCell>Expected Hours</TableCell> */}
                    {dayColumns.map((day) => (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{
                          color: 'white'
                        }}
                      >
                        D{day.split('_')[1]}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow key={`${row.code}-${index}`} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        {formData.branch === 'All' && <TableCell>{row.branch}</TableCell>}
                        {formData.department === 'All' && <TableCell>{row.department}</TableCell>}
                        <TableCell>{row.shifttype}</TableCell>
                        {/* <TableCell>{shiftHoursMap[row.code] || 'N/A'}</TableCell> */}
                        {dayColumns.map((day) => (
                          <TableCell key={`${row.code}-${day}`} align="center" sx={getDayCellStyle(row[day], row.code, day)}>
                            {row[day]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={38} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'white',
                borderTop: '1px solid',
                borderTopColor: 'divider'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default MonthlyAttendance;
