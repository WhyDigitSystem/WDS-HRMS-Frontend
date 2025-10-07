import React, { useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { useState, useEffect } from 'react';
import { Autocomplete, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import {
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
  IconButton
} from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer } from 'react-toastify';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
const EmployeeAttanceReport = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [empList, setEmpList] = useState([]);
  const [empCode, setEmpCode] = useState([]);
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    name: 'ALL',
    employeeCode: 'ALL'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('ALL');
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState('ALL');

  const toDateInputRef = useRef(null);

  const handleDialogClose = () => {
    setDialogOpen(false);
    // handleAllClear();
  };
  const handleAllClear = () => {
    setFormData({
      fromDate: null,
      toDate: null,
      name: 'ALL'
    });
    setFieldErrors({});
  };
  // Fetch employee list

  const handleClick = async () => {
    const errors = {};
    if (!formData.fromDate) errors.fromDate = 'From Date is required';
    if (!formData.toDate) errors.toDate = 'To Date is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    const isAllSelected = formData.name === 'ALL';
    const selectedCode = isAllSelected ? 'ALL' : formData.employeeCode || '';
    const selectedName = isAllSelected ? 'ALL' : formData.name || '';

    try {
      const result = await apiCalls(
        'get',
        `/leaveprocess/getCheckInOutReport?branch=${branch}&employeeCode=${selectedCode}&fromDate=${dayjs(formData.fromDate).format(
          'YYYY-MM-DD'
        )}&orgId=${orgId}&toDate=${dayjs(formData.toDate).format('YYYY-MM-DD')}`
      );

      if (result?.status) {
        // Format time values to show only hours and minutes
        const formattedAttendance = result.paramObjectsMap.checkInVO.map((item) => ({
          ...item,
          checkInTime: item.checkInTime ? item.checkInTime.substring(0, 5) : '',
          checkOutTime: item.checkOutTime ? item.checkOutTime.substring(0, 5) : '',
          grossHours: item.grossHours ? item.grossHours.substring(0, 5) : '',
          effectiveHours: item.effectiveHours ? item.effectiveHours.substring(0, 5) : '',
          otHours: item.otHours ? item.otHours.substring(0, 5) : ''
        }));

        setAttendanceReport(formattedAttendance);
        setSelectedEmployeeName(selectedName);
        setSelectedEmployeeCode(isAllSelected ? 'ALL' : selectedCode);
        setDialogOpen(true);
      } else {
        showToast('error', 'No records found');
      }
    } catch (err) {
      showToast('error', 'Error fetching attendance report');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      if (response.status === true) {
        const employeeList = response.paramObjectsMap.employeeVO || [];
        setEmpList(employeeList);

        // Set first employee's code (or handle as needed)
        setEmpCode(employeeList[0]?.employeeCode || '');
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    getAllUsers();
    getCompanyDetails();
  }, []);

  //
  const handleDownloadPDF = ({ logo }) => {
    if (attendanceReport.length === 0) {
      showToast('error', 'No data to download');
      return;
    }
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    //
    // Page dimensions
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    // ==== Title with Background ====
    const title = 'Check In/Out Report';
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titlePaddingX = 6;
    const titlePaddingY = 4;
    const titleHeight = 10;
    const titleX = (pageW - (titleWidth + titlePaddingX * 2)) / 2;
    const titleY = 15;
    // Draw background behind title
    doc.setFillColor(220, 240, 255); // Light blue
    doc.roundedRect(titleX, titleY - titlePaddingY, titleWidth + titlePaddingX * 2, titleHeight, 4, 4, 'F');
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageW / 2, titleY + 3, { align: 'center' });

    if (logo) {
      doc.addImage(logo, 'PNG', 5, 0, 40, 30);
    }
    const filterY = 25;

    // const labelValuePairs = [
    //   { label: '', value: formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '-' },

    //   {
    //     label: '',
    //     value: formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '-'
    //   },
      
    //   {
    //     label: '',
    //     value: selectedEmployeeCode ? selectedEmployeeCode : '-'
    //   },
    //   {
    //     label: '',
    //     value: selectedEmployeeName ? selectedEmployeeName : '-'
    //   }
    // ];

    const labelValuePairs = [
  {
    label: 'From:',
    value: formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '-',
  },
  {
    label: 'To:',
    value: formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '-',
  },
  ...(selectedEmployeeCode !== 'ALL' && selectedEmployeeName !== 'ALL'
    ? [
        {
          label: '',
          value: selectedEmployeeCode ? selectedEmployeeCode : '-',
        },
        {
          label: '',
          value: selectedEmployeeName ? selectedEmployeeName : '-',
        },
      ]
    : []),
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

    //
    const includeEmpCode = selectedEmployeeCode === 'ALL';
    const includeEmpName = selectedEmployeeName === 'ALL';

    const head = [
      [
        ...(includeEmpCode ? ['Code'] : []),
        ...(includeEmpName ? ['Name'] : []),
        'Date',
        'Check In',
        'Check Out',
        'Gross Hours',
        'Effective Hours',
        'OT Hours'
      ]
    ];
    const formatValue = (val) => (val === 0 || val === null || val === '' || val === `00:00` ? '-' : val);
    const body = attendanceReport.map((row) => {
      return [
        ...(includeEmpCode ? [row.employeeCode] : []),
        ...(includeEmpName ? [row.employeeName] : []),
        row.entryDate,
        formatValue(row.checkInTime),
        formatValue(row.checkOutTime),
        formatValue(row.grossHours),
        formatValue(row.effectiveHours),
        formatValue(row.otHours)
      ];
    });

    let columnStyles = {};
    let colIndex = 0;

    if (includeEmpCode) columnStyles[colIndex++] = { halign: 'left' };
    if (includeEmpName) columnStyles[colIndex++] = { halign: 'left' };
    columnStyles[colIndex++] = { halign: 'left' };
    columnStyles[colIndex++] = { halign: 'right' };
    columnStyles[colIndex++] = { halign: 'right' };
    columnStyles[colIndex++] = { halign: 'right' };
    columnStyles[colIndex++] = { halign: 'right' };
    columnStyles[colIndex++] = { halign: 'right' };

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
      margin: { left: 14, right: 14 },
      columnStyles: columnStyles,

      didDrawPage: (data) => {
        // const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(`Print On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
        doc.text(`Check In/Out Report - ${currentPage}`, pageW / 2, pageH - 10, { align: 'center' });
        doc.text(`Printed By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });
      }
    });

    doc.save('Check In/Out Report_.pdf');
  };

  const handleDownloadExcel = async ({ logo }) => {
    if (attendanceReport.length === 0) {
      showToast('error', 'No data to download');
      return;
    }

    //
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Check In Out Report');
    // logo
    sheet.mergeCells('A1:B4');
    if (logo) {
      try {
        const base64Data = logo.split(',')[1] || logo;
        if (base64Data.length >= 100) {
          const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
          const imageId = workbook.addImage({
            base64: base64Data,
            extension
          });
          sheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 140, height: 100 }
          });
        }
      } catch (err) {
        console.error('Error adding logo:', err);
      }
    }
    // Border

    const allBorders = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    // Add Report Title (Employee Details)
    const titleRow = sheet.getRow(2);
    sheet.mergeCells('C2:H3');
    const titleCell = sheet.getCell('C2');
    titleCell.value = 'Check In/Out Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    const metaRow = sheet.getRow(5);
    metaRow.getCell(1).value = `From: ${formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '-'}`;
    metaRow.getCell(2).value = `To: ${formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '-'}`;
    if (selectedEmployeeCode !== 'ALL' && selectedEmployeeName !== 'ALL' ) {
  metaRow.getCell(3).value = `${selectedEmployeeCode ? selectedEmployeeCode : '-'}`;
  metaRow.getCell(4).value = `${selectedEmployeeName ? selectedEmployeeName : '-'}`;

      }  
      // else {
//   metaRow.getCell(3).value = '-';
//   metaRow.getCell(4).value = '-';
// }
    // metaRow.getCell(3).value = `${selectedEmployeeCode ? selectedEmployeeCode : '-'}`;
    // metaRow.getCell(4).value = `${selectedEmployeeName ? selectedEmployeeName : '-'}`;
   if (selectedEmployeeCode === 'ALL' && selectedEmployeeName === 'ALL') {
  metaRow.getCell(3).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')}`;
  metaRow.getCell(4).value = `Printed By: ${loginUserName || 'Admin'}`;
} else {
  metaRow.getCell(5).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')}`;
  metaRow.getCell(6).value = `Printed By: ${loginUserName || 'Admin'}`;
}

   
   if (selectedEmployeeCode === 'ALL' && selectedEmployeeName === 'ALL') {
  for (let i = 1; i <= 4; i++) {
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
} else {
  for (let i = 1; i <= 6; i++) {
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
}

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
      ...(selectedEmployeeCode === 'ALL' ? ['Code'] : []),

      ...(selectedEmployeeName === 'ALL' ? ['Name'] : []),

      'Date',
      'Check In',
      'Check Out',
      'Gross Hours',
      'Effective Hours',
      'OT Hours'
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

    const formatValue = (val) => (val === 0 || val === null || val === '' || val === `00:00` ? '-' : val);
    attendanceReport.forEach((row) => {
      const rowData = [];
      if (selectedEmployeeCode === 'ALL') rowData.push(row.employeeCode);
      if (selectedEmployeeName === 'ALL') rowData.push(row.employeeName);
      rowData.push(
        row.entryDate,
        formatValue(row.checkInTime),
        formatValue(row.checkOutTime),
        formatValue(row.grossHours),
        formatValue(row.effectiveHours),
        formatValue(row.otHours)
      );
const dataRow = sheet.addRow(rowData);
dataRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };   // employeeCode
dataRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };   // employeeName
dataRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };  // totalCompanyWorkingDays
dataRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };  // empTotalWorkingDays
dataRow.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };  // bankOtAmount
dataRow.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' };  // totalEarnings
dataRow.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' };  // lopLeave
dataRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'right' };  // bankAdvance

  dataRow.eachCell((cell) => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F3F3F3' }
  };
  cell.border = allBorders;
  cell.font = { size: 10 };
});
      // dataRow.eachCell((cell) => {
      //   cell.fill = {
      //     type: 'pattern',
      //     pattern: 'solid',
      //     fgColor: { argb: 'F3F3F3' }
      //   };
      //   cell.border = allBorders;
      //   if (cell.value === '-') {
      //     cell.alignment = {
      //       horizontal: 'right',
      //       indent: 1
      //     };
      //   } else {
      //     cell.alignment = {
      //       indent: 1
      //     };
      //   }
      // });
    });
    sheet.views = [{ state: 'frozen', ySplit: 6 }];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `Check-In/Out Report.xlsx`);
  };

  const filteredData = attendanceReport.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                  value={formData.fromDate ? dayjs(formData.fromDate, 'YYYY-MM-DD') : null}
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
                      clearable: true,
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
                  value={formData.toDate ? dayjs(formData.toDate, 'YYYY-MM-DD') : null}
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
                      clearable: true,
                      error: !!fieldErrors.toDate,
                      helperText: fieldErrors.toDate
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <Autocomplete
              size="small"
              fullWidth
              options={['ALL', ...empList.map((row) => row.employee)]}
              value={formData.name}
              onChange={(e, newValue) => {
                const selectedEmp = empList.find((emp) => emp.employee === newValue);
                setFormData((prev) => ({
                  ...prev,
                  name: newValue || '',
                  employeeCode: selectedEmp?.employeeCode || '' // Store the code
                }));
              }}
              renderInput={(params) => <TextField {...params} label="Name" variant="outlined" />}
            />
          </div>

          {/*  */}
          {isLoading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '5px',
                width: '100%'
              }}
            >
              <CircularProgress size={40} />
            </div>
          )}
        </div>
        {/*  */}
        {/* Dialog for showing attendance report */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          maxWidth="lg"
          fullWidth
          sx={{
            '& .MuiDialog-container': {
              alignItems: 'flex-start' // Align dialog to top
            }
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 'bold',
              fontSize: '16px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              padding: '12px 16px',
              gap: '16px',
              overflow: 'auto', // Allows horizontal scrolling if needed
              whiteSpace: 'nowrap' // Prevents wrapping
            }}
          >
            <span style={{ flexShrink: 0 }}>Check In & Out Report</span>


            {/* <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
              <div>
                <strong>From:</strong> {formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : 'N/A'}
              </div>
              <div>
                <strong>To:</strong> {formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : 'N/A'}
              </div>
            </div> */}

            {/* <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
              <div>
                <strong>Code:</strong> {selectedEmployeeCode}
              </div>
              <div>
                <strong>Name:</strong> {selectedEmployeeName}
              </div>
            </div> */}

            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              sx={{
                width: '200px',
                flexShrink: 0
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
              <Tooltip title="Download Excel">
                <IconButton size="small" onClick={() => handleDownloadExcel({ logo: companyDetails[0]?.companyLogo })}>
                  <DownloadIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton size="small" onClick={() => handleDownloadPDF({ logo: companyDetails[0]?.companyLogo })}>
                  <PictureAsPdfIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            </div>
          </DialogTitle>
          <DialogContent
            sx={{
              // height: 'calc(100vh - 200px)',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
              // paddingBottom: '80px'
            }}
          >
            <div
              style={{
                flex: 1,
                overflow: 'auto'
                // marginBottom: '10px'
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {selectedEmployeeName === 'ALL' && [
                      <TableCell
                        key="code"
                        sx={{
                          background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                          color: '#fff',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}
                      >
                        Code
                      </TableCell>,
                      <TableCell
                        key="name"
                        sx={{
                          background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                          color: '#fff',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}
                      >
                        Name
                      </TableCell>
                    ]}
                    {['Date', 'Check In', 'Check Out', 'Gross Hours', 'Effective Hours', 'OT Hours'].map((heading, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                          // backgroundColor: '#364152',
                          color: '#fff',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}
                      >
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={selectedEmployeeName === 'ALL' ? 8 : 6} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // 👈 apply pagination here
                      .map((row) => (
                        <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                          {selectedEmployeeName === 'ALL' && [
                            <TableCell key="code" align="left">
                              {row.employeeCode === null || row.employeeCode === '' ? '-' : row.employeeCode}
                            </TableCell>,
                            <TableCell key="name" align="left">
                              {row.employeeName === null || row.employeeName === '' ? '-' : row.employeeName}
                            </TableCell>
                          ]}
                          <TableCell align="left">{row.entryDate === null || row.entryDate === ''? '-' : row.entryDate}</TableCell>
                          <TableCell align="right">{row.checkInTime === null || row.checkInTime === ''|| row.checkInTime=== `00:00`||row.checkInTime === 0? '-' : row.checkInTime}</TableCell>
                          <TableCell align="right">{row.checkOutTime === null || row.checkOutTime === ''|| row.checkOutTime=== `00:00`||row.checkOutTime === 0? '-' : row.checkOutTime}</TableCell>
                          {/* <TableCell align="center">{row.grossHours}</TableCell> */}
                          <TableCell align="right">{row.grossHours===null || row.grossHours === '' || row.grossHours === `00:00` || row.grossHours === 0? '-' : row.grossHours}</TableCell>
                          <TableCell align="right">{row.effectiveHours===null || row.effectiveHours === '' || row.effectiveHours === `00:00` || row.effectiveHours === 0? '-' : row.effectiveHours}</TableCell>
                          <TableCell align="right">{row.otHours=== null || row.otHours === '' || row.otHours === `00:00`? '-' : row.otHours}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table> 
            </div>
            <div
              style={{
                position: 'sticky',
                // bottom: 0,
                backgroundColor: 'white',
                // padding: '10px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #f0f0f0',
                zIndex: 1
              }}
            >
              {' '}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0); // Reset to first page on rowsPerPage change
                }}
              />
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)'
                }}
                onClick={handleDialogClose}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default EmployeeAttanceReport;
