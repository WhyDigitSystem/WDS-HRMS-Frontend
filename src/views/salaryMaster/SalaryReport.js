import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import apiCalls from 'apicall';
import { useState, useEffect, useRef } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { MenuItem, IconButton } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { FaEllipsisV } from 'react-icons/fa';
import { TableCell, TableContainer, TableHead, TablePagination, Tooltip, Typography, Checkbox, Button } from '@mui/material';
import { Table, TableBody, TableRow, TableFooter, TableSortLabel, Paper, Box } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
// import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const months = [
  { name: 'January', value: '01' },
  { name: 'February', value: '02' },
  { name: 'March', value: '03' },
  { name: 'April', value: '04' },
  { name: 'May', value: '05' },
  { name: 'June', value: '06' },
  { name: 'July', value: '07' },
  { name: 'August', value: '08' },
  { name: 'September', value: '09' },
  { name: 'October', value: '10' },
  { name: 'November', value: '11' },
  { name: 'December', value: '12' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 2 }, (_, index) => currentYear - index);

const SalaryReport = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [formData, setFormData] = useState({ month: '', year: '' });
  const [fieldErrors, setFieldErrors] = useState({ month: '', year: '' });
  const [listView, setListView] = useState(false);
  const [allSalary, setAllSalary] = useState([]);
  const [showSelectedMonthYear, setShowSelectedMonthYear] = useState(false);
  const [noDataFound, setNoDataFound] = useState(false);
  const [mainTableData, setMainTableData] = useState([]);
  const tableRef = useRef();

  // Function to format numeric values (show '-' for 0)
  const formatValue = (value) => {
    return value === 0 || value === '0' || value === null || value === undefined ? '-' : value;
  };

  // Function to format currency values without decimals for whole numbers
  const formatCurrency = (amount) => {
    if (amount === 0 || amount === '0' || amount === null || amount === undefined) {
      return '-';
    }

    const num = parseFloat(amount);
    if (isNaN(num)) return amount;

    // Check if it's a whole number
    if (num % 1 === 0) {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num);
    } else {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.month) {
      errors.month = 'Month is required';
      isValid = false;
    }

    if (!formData.year) {
      errors.year = 'Year is required';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleMonthChange = (event) => {
    const selected = months.find((m) => m.name === event.target.value);
    setSelectedMonth(selected?.name || '');
    setFormData({ ...formData, month: selected?.value || '' });
    // Clear error when user selects a value
    if (selected?.value) {
      setFieldErrors({ ...fieldErrors, month: '' });
    }
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    setFormData({ ...formData, year: year });

    // Clear error when user selects a value
    if (year) {
      setFieldErrors({ ...fieldErrors, year: '' });
    }

    // Reset month selection if it's no longer valid for the selected year
    if (selectedMonth) {
      const availableMonths = getAvailableMonths(year);
      const currentMonthObj = months.find(m => m.name === selectedMonth);

      if (!availableMonths.some(m => m.value === currentMonthObj?.value)) {
        setSelectedMonth('');
        setFormData(prev => ({ ...prev, month: '' }));
      }
    }
  };

  const getAllSalaryReport = async () => {
    // Validate form before making API call
    if (!validateForm()) {
      showToast('error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setNoDataFound(false);
      const selectedMonth = formData.month ? formData.month : '0';
      const selectedYear = formData.year ? formData.year : 'All';

      const response = await apiCalls(
        'get',
        `employeemaster/getApprovedSalaryProcessReport?month=${selectedMonth}&orgId=${orgId}&Year=${selectedYear}`
      );

      setShowSelectedMonthYear(true);

      if (response.status === true) {
        const salaryData = response.paramObjectsMap.salaryProcessVO;
        setAllSalary(salaryData);
        setMainTableData(salaryData);
        if (salaryData.length === 0) {
          setNoDataFound(true);
          showToast('error', 'No salary data found for the selected criteria', 'info');
        }
      } else {
        console.error('API Error:', response);
        setNoDataFound(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setNoDataFound(true);
      showToast('Error fetching salary data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleCancel = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthValue = String(currentDate.getMonth() + 1).padStart(2, '0');

    // Find current month name
    const currentMonthObj = months.find(m => m.value === currentMonthValue);

    if (currentMonthObj) {
      setSelectedMonth(currentMonthObj.name);
      setSelectedYear(currentYear.toString());
      setFormData({
        month: currentMonthValue,
        year: currentYear.toString()
      });
    }

    setFieldErrors({ month: '', year: '' }); // Reset errors
    setAllSalary([]); // Clear table data
    setShowSelectedMonthYear(false); // Hide text
    setMainTableData([]);
  };

  const handleDownloadPDF = ({ logo }) => {
    const doc = new jsPDF(
      {
        orientation: 'landscape',
      }
    );
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    //
    const title = 'Salary Report';
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titlePaddingX = 6;
    const titlePaddingY = 4;
    const titleHeight = 10;
    const titleX = (pageW - (titleWidth + titlePaddingX * 2)) / 2;
    const titleY = 15;
    doc.setFillColor(220, 240, 255); // Light blue
    doc.roundedRect(
      titleX,
      titleY - titlePaddingY,
      titleWidth + titlePaddingX * 2,
      titleHeight,
      4,
      4,
      'F'
    );
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageW / 2, titleY + 3, { align: 'center' });
    if (logo) {
      doc.addImage(logo, 'PNG', 5, 0, 40, 30); // X, Y, width, height
    }
    const filterY = 25;
    const labelValuePairs = [
      { label: 'Month:', value: selectedMonth },
      { label: 'Year', value: selectedYear },
      // { label: 'Total Days', value: allSalary.length > 0 ? allSalary[0].totalCompanyWorkingDays : '-' },
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

    doc.autoTable({
      startY: rectY + rectH + 5,
      head: [['Code', 'Name', 'Total', 'Present', 'OT', 'Earnings', 'LOP',
        'Advance',
        'PF',
        'ESI','Deductions','Net','Status']],
      body: allSalary.map((row) => {
        const formatValue = (val) => (val === 0 || val === null || val === '' ? '-' : val);
        const formatCurrency = (amount) => {
          if (amount === 0 || amount === null || amount === undefined) return '-';
          const num = parseFloat(amount);
          if (isNaN(num)) return amount;
          if (num % 1 === 0) {
            return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
          } else {
            return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
          }
        };

        return [
          formatValue(row.employeeCode),
          formatValue(row.employeeName),
          formatCurrency(row.totalCompanyWorkingDays),
          formatCurrency(row.empTotalWorkingDays),
          formatCurrency(row.bankOtAmount),
          formatCurrency(row.totalEarnings),
          formatCurrency(row.lopLeave),
          formatCurrency(row.bankAdvance),
          formatCurrency(row.pfAmount),
          formatCurrency(row.esiAmount),
          formatCurrency(row.totalDeductions),
          formatCurrency(row.bankAmount),
          formatValue(row.approvedStatus)
        ]
      }),
      styles: {
        fontSize: 8, cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { fillColor: [42, 75, 77], textColor: 255, halign: 'center' },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
        10: { halign: 'right' },
        11: { halign: 'right' },
        12: { halign: 'right' },
      },
      didDrawPage: (data) => {
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(
          `Print On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
          pageW - 15,
          pageH - 10,
          { align: 'right' }
        );
        doc.text(
          `Salary Report - ${currentPage}`,
          pageW / 2,
          pageH - 10,
          { align: 'center' }
        );
        doc.text(
          `Printed By: ${loginUserName}`,
          15,
          pageH - 10,
          { align: 'left' }
        );
      }
    })

    doc.save(`salary_report_.pdf`);
  };

  const handleDownloadExcel = async ({ logo }) => {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Salary Report');
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
            tl: { col: 0, row: 0 }, // A1
            ext: { width: 140, height: 100 }
          });
        }
      } catch (err) {
        console.error('Error adding logo:', err);
      }
    }
    const allBorders = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    // --- Add Report Title (Employee Details) ---
    const titleRow = sheet.getRow(2);
    sheet.mergeCells('C2:H3');
    const titleCell = sheet.getCell('C2');
    titleCell.value = 'Salary Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const metaRow = sheet.getRow(5);

    metaRow.getCell(1).value = `Month: ${selectedMonth}`;
    metaRow.getCell(2).value = `Year: ${selectedYear}`;
    // metaRow.getCell(3).value = `Total Days ${allSalary.length > 0 ? allSalary[0].totalCompanyWorkingDays : '-'}`
    metaRow.getCell(3).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')} `;
    metaRow.getCell(4).value = `Printed By: ${loginUserName || 'Admin'}`;
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
    const headers = [
      'Code',
      'Name',
      'Total',
      'Present',
      'OT',
      'Earnings',
      'LOP',
      'Advance',
      'PF',
      'ESI',
      'Deductions',
       'Net',
      'Status'
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
    const formatCurrency = (amount) => {
      if (amount === 0 || amount === null || amount === undefined) return '-';
      const num = parseFloat(amount);
      if (isNaN(num)) return amount;
      if (num % 1 === 0) {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
      } else {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
      }
    };

    allSalary.forEach((row) => {
      const rowData = [];
      rowData.push(
       formatValue(row.employeeCode),
          formatValue(row.employeeName),
          formatCurrency(row.totalCompanyWorkingDays),
          formatCurrency(row.empTotalWorkingDays),
          formatCurrency(row.bankOtAmount),
          formatCurrency(row.totalEarnings),
          formatCurrency(row.lopLeave),
          formatCurrency(row.bankAdvance),
          formatCurrency(row.pfAmount),
          formatCurrency(row.esiAmount),
          formatCurrency(row.totalDeductions),
          formatCurrency(row.bankAmount),
          formatValue(row.approvedStatus)
      )

  const dataRow = sheet.addRow(rowData);
dataRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };   // employeeCode
dataRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };   // employeeName
dataRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };  // totalCompanyWorkingDays
dataRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };  // empTotalWorkingDays
dataRow.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };  // bankOtAmount
dataRow.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' };  // totalEarnings
dataRow.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' };  // lopLeave
dataRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'right' };  // bankAdvance
dataRow.getCell(9).alignment = { vertical: 'middle', horizontal: 'right' };  // pfAmount
dataRow.getCell(10).alignment = { vertical: 'middle', horizontal: 'right' }; // esiAmount
dataRow.getCell(11).alignment = { vertical: 'middle', horizontal: 'right' }; // totalDeductions
dataRow.getCell(12).alignment = { vertical: 'middle', horizontal: 'right' }; // bankAmount
dataRow.getCell(13).alignment = { vertical: 'middle', horizontal: 'left' }; // approvedStatus
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

    saveAs(blob, `Salary_Report.xlsx`);
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
      setCompanyDetails(response.paramObjectsMap.companyVO);
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('Error fetching company details', 'error');
    }
  };

  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthValue = String(currentDate.getMonth() + 1).padStart(2, '0');

    // Find current month name
    const currentMonthObj = months.find(m => m.value === currentMonthValue);

    if (currentMonthObj) {
      setSelectedMonth(currentMonthObj.name);
      setSelectedYear(currentYear.toString());
      setFormData({
        month: currentMonthValue,
        year: currentYear.toString()
      });
    }

    getCompanyDetails();
  }, []);

  // Updated formatNumberWithCommas function
  const formatNumberWithCommas = (value) => {
    if (value === 'Loading...' || value === 'Error' || value === 'Pending') {
      return value;
    }

    // Show dash for zero values
    if (value === 0 || value === '0' || value === null || value === undefined) {
      return '-';
    }

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Format without decimals for whole numbers, with 2 decimals for others
    if (num % 1 === 0) {
      return num.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      });
    } else {
      return num.toLocaleString('en-IN', {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1
      });
    }
  };

  const getAvailableMonths = (selectedYear) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    if (!selectedYear) {
      return months; // Show all months when no year is selected
    }

    if (parseInt(selectedYear) === currentYear) {
      // For current year, show current month and last 2 months (total 3 months)
      const startMonth = Math.max(1, currentMonth - 2); // Ensure we don't go below January
      return months.filter(month => {
        const monthValue = parseInt(month.value);
        return monthValue >= startMonth && monthValue <= currentMonth;
      });
    } else {
      // For previous years, show all months
      return months;
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleCancel} />
          </div>

          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small" error={!!fieldErrors.year}>
              <InputLabel>Year *</InputLabel>
              <Select label="Year *" value={selectedYear} onChange={handleYearChange}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.year && (
                <Typography variant="caption" color="error">
                  {fieldErrors.year}
                </Typography>
              )}
            </FormControl>
          </div>

          {/* Select Month */}
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small" error={!!fieldErrors.month}>
              <InputLabel>Month *</InputLabel>
              <Select label="Month *" value={selectedMonth} onChange={handleMonthChange}>
                {getAvailableMonths(selectedYear).map((m) => (
                  <MenuItem key={m.value} value={m.name}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.month && (
                <Typography variant="caption" color="error">
                  {fieldErrors.month}
                </Typography>
              )}
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <Button
              variant="contained"
              onClick={getAllSalaryReport}
              sx={{
                borderRadius: '8px',
                boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                textTransform: 'none',
                background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                marginTop: '8px'
              }}
            >
              Go
            </Button>
          </div>
        </div>

        <>
          {/* Selected Salary Data Table */}
          {allSalary.length > 0 && (
            <>
              <div className="row mt-2">
                <div className="col-lg-12">
                  <div className="d-flex justify-content-end mb-2">
                    <Tooltip title="Download PDF">
                      <IconButton onClick={() => handleDownloadPDF({ logo: companyDetails[0]?.companyLogo })}>
                        <PictureAsPdfIcon color="error" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Excel">
                      <IconButton onClick={() => handleDownloadExcel({ logo: companyDetails[0]?.companyLogo })}>
                        <DownloadIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div className="table-responsive">
                    <TableContainer component={Paper}>
                      <Table id="salaryTable" ref={tableRef}>
                        <TableHead
                          sx={{
                            background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                            color: 'white'
                          }}
                        >
                          <TableRow>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>#</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Code</strong>
                            </TableCell>
                            <TableCell align='center'sx={{color:'white'}} >
                              <strong>Name</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Total</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Present</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>OT</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Earnings</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>LOP</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Advance</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>PF</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>ESI</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Deductions</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Net</strong>
                            </TableCell>
                            <TableCell align='center' sx={{color:'white'}}>
                              <strong>Status</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allSalary.length > 0 ? (
                            allSalary.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave, index) => (
                              <TableRow key={leave.employeeCode} hover>
                                <TableCell align='center'>{page * rowsPerPage + index + 1}</TableCell>
                                <TableCell align='left'>{leave.employeeCode}</TableCell>
                                <TableCell align='left'>{leave.employeeName}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.totalCompanyWorkingDays)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.empTotalWorkingDays)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.bankOtAmount)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.totalEarnings)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.lopLeave)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.bankAdvance)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.pfAmount)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.esiAmount)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.totalDeductions)}</TableCell>
                                <TableCell align='right'>{formatNumberWithCommas(leave.bankAmount)}</TableCell>
                                <TableCell align='left' style={{ color: leave.approvedStatus === 'Approved' ? 'green' : 'inherit' }}>
                                  {leave.approvedStatus}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={14} className="text-center">
                                No data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={allSalary.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      </div>
      <ToastContainer />
    </>
  );
};

export default SalaryReport;