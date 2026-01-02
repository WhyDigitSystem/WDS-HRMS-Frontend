import React, { useRef, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { useEffect } from 'react';
import { 
  Autocomplete, 
  FormControl, 
  TextField,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer } from 'react-toastify';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EfficiencyIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';

const EmployeeAttanceReport = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [empList, setEmpList] = useState([]);
  const [formData, setFormData] = useState({
    fromDate: dayjs().startOf('month'),
    toDate: dayjs(),
    name: 'ALL',
    employeeCode: 'ALL'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('ALL');
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState('ALL');
  const [activeTab, setActiveTab] = useState(0);
  const [efficiencyData, setEfficiencyData] = useState([]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return attendanceReport;
    
    return attendanceReport.filter((row) =>
      Object.values(row).some((value) => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [attendanceReport, searchQuery]);

  // Enhanced function to parse time strings - handles both "HH:MM:SS", "HH:MM", and plain number "8"
  const parseTimeToHours = (timeStr) => {
    if (!timeStr || timeStr === '-' || timeStr === '00:00' || timeStr === '00:00:00') return 0;
    
    try {
      // If it's just a number (like "8"), convert to hours
      if (!timeStr.includes(':')) {
        const hours = parseFloat(timeStr);
        return isNaN(hours) ? 0 : hours;
      }
      
      // Handle "HH:MM:SS" or "HH:MM" format
      const parts = timeStr.split(':');
      let hours = 0;
      
      if (parts.length >= 1) hours += parseInt(parts[0]) || 0;
      if (parts.length >= 2) hours += (parseInt(parts[1]) || 0) / 60;
      if (parts.length >= 3) hours += (parseInt(parts[2]) || 0) / 3600;
      
      return hours;
    } catch {
      return 0;
    }
  };

  // Format hours to HH:MM for display
  const formatHoursDisplay = (hours) => {
    if (hours === 0) return '-';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Format hours for export (different from display)
  const formatHoursForExport = (val) => {
    if (!val || val === '-' || val === '00:00' || val === '00:00:00') return '-';
    
    // If it's already in HH:MM format, return as is
    if (typeof val === 'string' && val.includes(':')) {
      return val.length > 5 ? val.substring(0, 5) : val;
    }
    
    // If it's a number string like "8", format it
    const hours = parseFloat(val);
    if (!isNaN(hours)) {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return val;
  };

  // Calculate efficiency metrics
  const efficiencyMetrics = useMemo(() => {
  if (!attendanceReport.length) return {};

  const metrics = {};
  const monthlyData = {};

  // First, calculate total working days per month
  const monthlyWorkingDays = {};
  
  // Get unique months from the data
  attendanceReport.forEach(record => {
    if (record.entryDate) {
      const month = dayjs(record.entryDate, 'DD-MM-YYYY').format('YYYY-MM');
      if (!monthlyWorkingDays[month]) {
        monthlyWorkingDays[month] = new Set();
      }
      monthlyWorkingDays[month].add(record.entryDate);
    }
  });

  // Convert sets to counts
  const monthlyDaysCount = {};
  Object.keys(monthlyWorkingDays).forEach(month => {
    monthlyDaysCount[month] = monthlyWorkingDays[month].size;
  });

  // Process attendance data
  attendanceReport.forEach(record => {
    const employeeId = record.employeeCode;
    const month = record.entryDate ? 
      dayjs(record.entryDate, 'DD-MM-YYYY').format('YYYY-MM') : 
      'unknown';
    
    if (!metrics[employeeId]) {
      metrics[employeeId] = {
        name: record.employeeName,
        code: record.employeeCode,
        totalDays: 0,
        totalGrossHours: 0,
        totalEffectiveHours: 0,
        totalOTHours: 0,
        totalWorkingDays: 0,
        monthlyData: {}
      };
    }

    // Parse time values
    const grossHours = parseTimeToHours(record.grossHours);
    const effectiveHours = parseTimeToHours(record.effectiveHours);
    const otHours = parseTimeToHours(record.otHours);

    // Update totals
    metrics[employeeId].totalDays++;
    metrics[employeeId].totalGrossHours += grossHours;
    metrics[employeeId].totalEffectiveHours += effectiveHours;
    metrics[employeeId].totalOTHours += otHours;

    // Monthly data
    if (!metrics[employeeId].monthlyData[month]) {
      metrics[employeeId].monthlyData[month] = {
        month,
        totalGrossHours: 0,
        totalEffectiveHours: 0,
        totalOTHours: 0,
        totalDays: 0,
        expectedHours: 0,
        workingDaysInMonth: monthlyDaysCount[month] || 0
      };
    }
    metrics[employeeId].monthlyData[month].totalGrossHours += grossHours;
    metrics[employeeId].monthlyData[month].totalEffectiveHours += effectiveHours;
    metrics[employeeId].monthlyData[month].totalOTHours += otHours;
    metrics[employeeId].monthlyData[month].totalDays++;
    
    // Calculate expected hours for this month (based on company policy)
    // Assuming 8 hours per working day as standard
    const standardHoursPerDay = 9;
    if (metrics[employeeId].monthlyData[month].workingDaysInMonth > 0) {
      metrics[employeeId].monthlyData[month].expectedHours = 
        metrics[employeeId].monthlyData[month].workingDaysInMonth * standardHoursPerDay;
    }
  });

  // Calculate efficiency percentages and trends
  Object.keys(metrics).forEach(empId => {
    const emp = metrics[empId];
    
    // Calculate total expected hours based on attended days
    // This accounts for partial month attendance
    emp.totalExpectedHours = 0;
    
    // First calculate monthly efficiencies
    Object.keys(emp.monthlyData).forEach(month => {
      const monthly = emp.monthlyData[month];
      
      // Calculate attendance ratio (days attended / working days in month)
      monthly.attendanceRatio = monthly.workingDaysInMonth > 0 
        ? (monthly.totalDays / monthly.workingDaysInMonth) * 100 
        : 0;
      
      // Calculate monthly efficiency
      if (monthly.totalGrossHours > 0) {
        // Basic efficiency
        monthly.basicEfficiency = (monthly.totalEffectiveHours / monthly.totalGrossHours) * 100;
        
        // Efficiency against expected hours (considers working days)
        if (monthly.expectedHours > 0) {
          monthly.expectedEfficiency = (monthly.totalEffectiveHours / monthly.expectedHours) * 100;
        } else {
          monthly.expectedEfficiency = 0;
        }
        
        // Weighted efficiency (combines both metrics)
        monthly.efficiency = (monthly.basicEfficiency * 0.7) + (monthly.expectedEfficiency * 0.3);
      } else {
        monthly.basicEfficiency = 0;
        monthly.expectedEfficiency = 0;
        monthly.efficiency = 0;
      }
      
      monthly.avgEffectiveHours = monthly.totalDays > 0 ? monthly.totalEffectiveHours / monthly.totalDays : 0;
      monthly.avgGrossHours = monthly.totalDays > 0 ? monthly.totalGrossHours / monthly.totalDays : 0;
      monthly.avgOTHours = monthly.totalDays > 0 ? monthly.totalOTHours / monthly.totalDays : 0;
      
      // Add to total expected hours
      emp.totalExpectedHours += monthly.expectedHours;
    });

    // Overall efficiency calculations
    // Option 1: Weighted average of monthly efficiencies
    const totalMonthlyEfficiency = Object.values(emp.monthlyData).reduce((sum, monthly) => sum + monthly.efficiency, 0);
    const monthsCount = Object.keys(emp.monthlyData).length;
    emp.weightedEfficiency = monthsCount > 0 ? totalMonthlyEfficiency / monthsCount : 0;
    
    // Option 2: Overall efficiency considering expected hours
    if (emp.totalExpectedHours > 0) {
      emp.expectedOverallEfficiency = (emp.totalEffectiveHours / emp.totalExpectedHours) * 100;
    } else {
      emp.expectedOverallEfficiency = 0;
    }
    
    // Option 3: Basic overall efficiency
    emp.basicOverallEfficiency = emp.totalGrossHours > 0 
      ? (emp.totalEffectiveHours / emp.totalGrossHours) * 100 
      : 0;
    
    // Final efficiency score (weighted combination)
    // 40% basic efficiency + 60% expected efficiency (to emphasize working days)
    emp.overallEfficiency = (emp.basicOverallEfficiency * 0.4) + (emp.expectedOverallEfficiency * 0.6);
    
    // Calculate attendance percentage
    emp.totalWorkingDays = Object.values(emp.monthlyData).reduce((sum, monthly) => sum + monthly.workingDaysInMonth, 0);
    emp.attendancePercentage = emp.totalWorkingDays > 0 
      ? (emp.totalDays / emp.totalWorkingDays) * 100 
      : 0;

    // Calculate trend (current month vs previous if available)
    const months = Object.keys(emp.monthlyData).sort();
    if (months.length >= 2) {
      const currentMonth = emp.monthlyData[months[months.length - 1]].efficiency;
      const prevMonth = emp.monthlyData[months[months.length - 2]].efficiency;
      emp.trend = currentMonth - prevMonth;
      emp.trendDirection = emp.trend > 0 ? 'up' : emp.trend < 0 ? 'down' : 'stable';
    } else {
      emp.trend = 0;
      emp.trendDirection = 'stable';
    }

    // Efficiency rating - now includes attendance factor
    let adjustedEfficiency = emp.overallEfficiency;
    
    // Penalize low attendance (below 80%)
    if (emp.attendancePercentage < 80) {
      adjustedEfficiency = adjustedEfficiency * (emp.attendancePercentage / 100);
    }
    
    // Reward high attendance (above 95%)
    if (emp.attendancePercentage > 95) {
      adjustedEfficiency = adjustedEfficiency * 1.05; // 5% bonus
    }
    
    // Apply rating based on adjusted efficiency
    if (adjustedEfficiency >= 100) emp.rating = 'Excellent';
    else if (adjustedEfficiency >= 90) emp.rating = 'Very Good';
    else if (adjustedEfficiency >= 80) emp.rating = 'Good';
    else if (adjustedEfficiency >= 70) emp.rating = 'Average';
    else if (adjustedEfficiency >= 60) emp.rating = 'Below Average';
    else emp.rating = 'Needs Improvement';
    
    // Store additional metrics for display
    emp.adjustedEfficiency = adjustedEfficiency;
    emp.standardHoursPerDay = 9; // For reference
  });

  // Convert to array and sort by adjusted efficiency
  const efficiencyArray = Object.values(metrics)
    .sort((a, b) => b.adjustedEfficiency - a.adjustedEfficiency)
    .map((emp, index) => ({
      ...emp,
      rank: index + 1
    }));

  setEfficiencyData(efficiencyArray);
  
  // Calculate company-wide metrics
  const totalWorkingDays = Object.values(monthlyDaysCount).reduce((sum, days) => sum + days, 0);
  const totalExpectedHours = totalWorkingDays * 9; // Assuming 8 hours per day
  
  return {
    totalEmployees: efficiencyArray.length,
    avgEfficiency: efficiencyArray.reduce((sum, emp) => sum + emp.adjustedEfficiency, 0) / (efficiencyArray.length || 1),
    avgAttendance: efficiencyArray.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / (efficiencyArray.length || 1),
    totalWorkingDays,
    totalExpectedHours,
    topPerformer: efficiencyArray[0],
    lowPerformer: efficiencyArray[efficiencyArray.length - 1],
    monthlyStats: monthlyDaysCount
  };
}, [attendanceReport]);

  const handleClick = async () => {
    const errors = {};
    if (!formData.fromDate) errors.fromDate = 'From Date is required';
    if (!formData.toDate) errors.toDate = 'To Date is required';
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('error', 'Please fill in all required fields');
      return;
    }

    if (dayjs(formData.toDate).diff(formData.fromDate, 'day') > 365) {
      showToast('error', 'Date range cannot exceed 1 year');
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
        const formattedAttendance = result.paramObjectsMap.checkInVO.map((item) => ({
          ...item,
          checkInTime: item.checkInTime ? item.checkInTime.substring(0, 5) : '',
          checkOutTime: item.checkOutTime ? item.checkOutTime.substring(0, 5) : '',
          grossHours: item.grossHours,
          effectiveHours: item.effectiveHours,
          otHours: item.otHours
        }));

        console.log('API Response formatted:', formattedAttendance); // Debug log
        
        setAttendanceReport(formattedAttendance);
        setSelectedEmployeeName(selectedName);
        setSelectedEmployeeCode(selectedCode);
        setDialogOpen(true);
        setActiveTab(0);
      } else {
        showToast('info', 'No attendance records found for the selected criteria');
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
        setEmpList(response.paramObjectsMap.employeeVO || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    getAllUsers();
    getCompanyDetails();
  }, []);

  const handleAllClear = () => {
    setFormData({
      fromDate: dayjs().startOf('month'),
      toDate: dayjs(),
      name: 'ALL',
      employeeCode: 'ALL'
    });
    setFieldErrors({});
    setSearchQuery('');
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
      setCompanyDetails(response.paramObjectsMap.companyVO);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  // PDF Download Function
  const handleDownloadPDF = ({ logo }) => {
    if (attendanceReport.length === 0) {
      showToast('error', 'No data to download');
      return;
    }
    
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    
    // Page dimensions
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    
    // Title
    const title = 'Attendance & Efficiency Report';
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titlePaddingX = 6;
    const titlePaddingY = 4;
    const titleHeight = 10;
    const titleX = (pageW - (titleWidth + titlePaddingX * 2)) / 2;
    const titleY = 15;
    
    // Draw background behind title
    doc.setFillColor(220, 240, 255);
    doc.roundedRect(titleX, titleY - titlePaddingY, titleWidth + titlePaddingX * 2, titleHeight, 4, 4, 'F');
    doc.setTextColor(40, 40, 40);
    doc.text(title, pageW / 2, titleY + 3, { align: 'center' });

    // Add logo if available
    if (logo) {
      doc.addImage(logo, 'PNG', 5, 0, 40, 30);
    }

    // Filter criteria
    const filterY = 25;
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
              label: 'Employee:',
              value: `${selectedEmployeeCode} - ${selectedEmployeeName}`,
            }
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
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(pair.label, cursorX, rectY + 6);
      const labelW = doc.getTextWidth(pair.label + ' ');
      cursorX += labelW;

      doc.setFont('helvetica', 'normal');
      const valueText = pair.value + (idx < labelValuePairs.length - 1 ? ' | ' : '');
      doc.text(valueText, cursorX, rectY + 6);
      const valueW = doc.getTextWidth(valueText);
      cursorX += valueW;
    });

    // Table headers
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
        'Efficiency %',
        'OT Hours'
      ]
    ];
    
    const body = attendanceReport.map((row) => {
      const grossHours = parseTimeToHours(row.grossHours);
      const effectiveHours = parseTimeToHours(row.effectiveHours);
      const efficiency = grossHours > 0 ? (effectiveHours / grossHours) * 100 : 0;
      
      return [
        ...(includeEmpCode ? [row.employeeCode] : []),
        ...(includeEmpName ? [row.employeeName] : []),
        row.entryDate,
        formatHoursForExport(row.checkInTime),
        formatHoursForExport(row.checkOutTime),
        formatHoursForExport(row.grossHours),
        formatHoursForExport(row.effectiveHours),
        `${efficiency.toFixed(1)}%`,
        formatHoursForExport(row.otHours)
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
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(`Print On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
        doc.text(`Attendance & Efficiency Report - ${currentPage}`, pageW / 2, pageH - 10, { align: 'center' });
        doc.text(`Printed By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });
      }
    });

    doc.save('Attendance_Efficiency_Report.pdf');
  };

  // Excel Download Function
  const handleDownloadExcel = async ({ logo }) => {
    if (attendanceReport.length === 0) {
      showToast('error', 'No data to download');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');
    
    // Add logo
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

    // Border style
    const allBorders = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Report Title
    sheet.mergeCells('C2:H3');
    const titleCell = sheet.getCell('C2');
    titleCell.value = 'Attendance & Efficiency Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Meta info row
    const metaRow = sheet.getRow(5);
    metaRow.getCell(1).value = `From: ${formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '-'}`;
    metaRow.getCell(2).value = `To: ${formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '-'}`;
    
    if (selectedEmployeeCode !== 'ALL' && selectedEmployeeName !== 'ALL') {
      metaRow.getCell(3).value = `Employee: ${selectedEmployeeCode} - ${selectedEmployeeName}`;
      metaRow.getCell(5).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')}`;
      metaRow.getCell(6).value = `Printed By: ${loginUserName || 'Admin'}`;
    } else {
      metaRow.getCell(3).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')}`;
      metaRow.getCell(4).value = `Printed By: ${loginUserName || 'Admin'}`;
    }

    // Format meta row
    const metaCellsCount = selectedEmployeeCode !== 'ALL' && selectedEmployeeName !== 'ALL' ? 6 : 4;
    for (let i = 1; i <= metaCellsCount; i++) {
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

    // Table headers
    const headers = [
      ...(selectedEmployeeCode === 'ALL' ? ['Code'] : []),
      ...(selectedEmployeeName === 'ALL' ? ['Name'] : []),
      'Date',
      'Check In',
      'Check Out',
      'Gross Hours',
      'Effective Hours',
      'Efficiency %',
      'OT Hours'
    ];

    sheet.columns = headers.map(() => ({ width: 20 }));
    
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

    // Table data
    attendanceReport.forEach((row, rowIndex) => {
      const grossHours = parseTimeToHours(row.grossHours);
      const effectiveHours = parseTimeToHours(row.effectiveHours);
      const efficiency = grossHours > 0 ? (effectiveHours / grossHours) * 100 : 0;
      
      const rowData = [];
      if (selectedEmployeeCode === 'ALL') rowData.push(row.employeeCode);
      if (selectedEmployeeName === 'ALL') rowData.push(row.employeeName);
      rowData.push(
        row.entryDate,
        formatHoursForExport(row.checkInTime),
        formatHoursForExport(row.checkOutTime),
        formatHoursForExport(row.grossHours),
        formatHoursForExport(row.effectiveHours),
        `${efficiency.toFixed(1)}%`,
        formatHoursForExport(row.otHours)
      );
      
      const dataRow = sheet.addRow(rowData);
      
      // Set alignments
      let cellIndex = 1;
      if (selectedEmployeeCode === 'ALL') {
        dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'left' };
      }
      if (selectedEmployeeName === 'ALL') {
        dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'left' };
      }
      dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'left' };
      dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'right' };
      dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'right' };
      dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'right' };
      dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'right' };
      dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'right' };
      dataRow.getCell(cellIndex++).alignment = { vertical: 'middle', horizontal: 'right' };
      
      // Style the row
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowIndex % 2 === 0 ? 'F3F3F3' : 'FFFFFF' }
        };
        cell.border = allBorders;
        cell.font = { size: 10 };
      });
    });

    // Add Efficiency Summary sheet
    if (efficiencyData.length > 0) {
      const summarySheet = workbook.addWorksheet('Efficiency Summary');
      
      // Summary sheet headers
      const summaryHeaders = ['Rank', 'Employee Code', 'Name', 'Total Days', 'Gross Hours', 
                             'Effective Hours', 'OT Hours', 'Efficiency %', 'Rating', 'Trend'];
      summarySheet.columns = summaryHeaders.map(() => ({ width: 15 }));
      
      const summaryHeaderRow = summarySheet.getRow(1);
      summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      summaryHeaders.forEach((header, index) => {
        const cell = summaryHeaderRow.getCell(index + 1);
        cell.value = header;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '2a4b4d' }
        };
        cell.border = allBorders;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      
      // Summary sheet data
      efficiencyData.forEach((emp, index) => {
        const rowData = [
          emp.rank,
          emp.code,
          emp.name,
          emp.totalDays,
          formatHoursDisplay(emp.totalGrossHours),
          formatHoursDisplay(emp.totalEffectiveHours),
          formatHoursDisplay(emp.totalOTHours),
          `${emp.overallEfficiency.toFixed(1)}%`,
          emp.rating,
          emp.trendDirection === 'up' ? '↑ Improving' : 
          emp.trendDirection === 'down' ? '↓ Declining' : '→ Stable'
        ];
        
        const dataRow = summarySheet.addRow(rowData);
        
        // Color code based on rating
        let fillColor = 'F3F3F3';
        if (emp.rating === 'Excellent') fillColor = 'C8E6C9';
        else if (emp.rating === 'Very Good') fillColor = 'A5D6A7';
        else if (emp.rating === 'Good') fillColor = 'BBDEFB';
        else if (emp.rating === 'Average') fillColor = 'FFF9C4';
        else if (emp.rating === 'Below Average') fillColor = 'FFE0B2';
        else fillColor = 'FFCDD2';
        
        dataRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor }
          };
          cell.border = allBorders;
          cell.font = { size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });
    }

    sheet.views = [{ state: 'frozen', ySplit: 6 }];
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `Attendance_Efficiency_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const EfficiencyCard = ({ data }) => (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <EfficiencyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Employee #{data.rank}: {data.name}
          </Typography>
          <Chip 
            label={data.rating} 
            size="small"
            color={
              data.rating === 'Excellent' ? 'success' :
              data.rating === 'Very Good' ? 'success' :
              data.rating === 'Good' ? 'primary' :
              data.rating === 'Average' ? 'warning' :
              data.rating === 'Below Average' ? 'warning' : 'error'
            }
            sx={{ ml: 'auto' }}
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Efficiency
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h4">
                {data.overallEfficiency.toFixed(1)}%
              </Typography>
              {data.trend !== 0 && (
                <Chip
                  icon={data.trendDirection === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${Math.abs(data.trend).toFixed(1)}%`}
                  size="small"
                  color={data.trendDirection === 'up' ? 'success' : 'error'}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Total Days
            </Typography>
            <Typography variant="h6">{data.totalDays}</Typography>
          </Grid>
        </Grid>
        
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Hours Breakdown
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="caption" display="block">
                Gross
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatHoursDisplay(data.totalGrossHours)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" display="block">
                Effective
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatHoursDisplay(data.totalEffectiveHours)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" display="block">
                OT
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatHoursDisplay(data.totalOTHours)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={Math.min(data.overallEfficiency, 100)} 
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
          color={
            data.overallEfficiency >= 100 ? 'success' :
            data.overallEfficiency >= 90 ? 'success' :
            data.overallEfficiency >= 80 ? 'primary' :
            data.overallEfficiency >= 70 ? 'warning' :
            data.overallEfficiency >= 60 ? 'warning' : 'error'
          }
        />
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
          {data.overallEfficiency > 100 ? 'Exceeded target' : `${(100 - data.overallEfficiency).toFixed(1)}% from target`}
        </Typography>
      </CardContent>
    </Card>
  );

  const SummaryStats = () => (
    <Box mb={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Employees
            </Typography>
            <Typography variant="h4" color="primary">
              {efficiencyData.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Avg Efficiency
            </Typography>
            <Typography variant="h4" color="primary">
              {efficiencyMetrics.avgEfficiency?.toFixed(1) || 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Top Performer
            </Typography>
            <Typography variant="h6" noWrap>
              {efficiencyMetrics.topPerformer?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="success.main">
              {efficiencyMetrics.topPerformer?.overallEfficiency?.toFixed(1) || 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Needs Attention
            </Typography>
            <Typography variant="h6" noWrap>
              {efficiencyMetrics.lowPerformer?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="error.main">
              {efficiencyMetrics.lowPerformer?.overallEfficiency?.toFixed(1) || 0}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <Box mb={3}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Attendance & Efficiency Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track employee attendance and analyze work efficiency based on gross vs effective hours
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From Date *"
                  format="DD-MM-YYYY"
                  value={formData.fromDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({ ...prev, fromDate: newValue }));
                    setFieldErrors(prev => ({ ...prev, fromDate: '' }));
                  }}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!fieldErrors.fromDate,
                      helperText: fieldErrors.fromDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To Date *"
                  format="DD-MM-YYYY"
                  value={formData.toDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({ ...prev, toDate: newValue }));
                    setFieldErrors(prev => ({ ...prev, toDate: '' }));
                  }}
                  minDate={formData.fromDate}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!fieldErrors.toDate,
                      helperText: fieldErrors.toDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Autocomplete
                size="small"
                options={['ALL', ...empList.map(row => row.employee)]}
                value={formData.name}
                onChange={(e, newValue) => {
                  const selectedEmp = empList.find(emp => emp.employee === newValue);
                  setFormData(prev => ({
                    ...prev,
                    name: newValue || '',
                    employeeCode: selectedEmp?.employeeCode || ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Employee Name" />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
              <ActionButton 
                title="Search" 
                icon={SearchIcon} 
                onClick={handleClick}
                disabled={isLoading}
                fullWidth
              />
              <ActionButton 
                title="Clear" 
                icon={ClearIcon} 
                onClick={handleAllClear}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
          
          {isLoading && (
            <Box mt={2} display="flex" justifyContent="center">
              <CircularProgress size={30} />
            </Box>
          )}
        </Paper>

        {/* Dialog with enhanced UI */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="xl"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              maxHeight: '95vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h6">Attendance & Efficiency Report</Typography>
              <Typography variant="body2">
                {formData.fromDate && formData.toDate && 
                  `${dayjs(formData.fromDate).format('DD-MM-YYYY')} to ${dayjs(formData.toDate).format('DD-MM-YYYY')}`
                }
                {selectedEmployeeName !== 'ALL' && ` • ${selectedEmployeeName}`}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Export PDF">
                <IconButton size="small" sx={{ color: 'white' }} 
                  onClick={() => handleDownloadPDF({ logo: companyDetails?.[0]?.companyLogo })}>
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Excel">
                <IconButton size="small" sx={{ color: 'white' }}
                  onClick={() => handleDownloadExcel({ logo: companyDetails?.[0]?.companyLogo })}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Attendance Details" />
              <Tab label="Efficiency Analysis" />
            </Tabs>
          </Box>

          <DialogContent sx={{ pt: 3 }}>
            {activeTab === 0 ? (
              <>
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                  <TextField
                    label="Search records..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 300 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredData.length} of {attendanceReport.length} records
                  </Typography>
                </Box>

                <Box sx={{ overflow: 'auto', maxHeight: '60vh' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {selectedEmployeeName === 'ALL' && (
                          <>
                            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                              Code
                            </TableCell>
                            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                              Name
                            </TableCell>
                          </>
                        )}
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="right">Check In</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="right">Check Out</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="right">Gross Hours</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="right">Effective Hours</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="right">Efficiency</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="right">OT Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={selectedEmployeeName === 'ALL' ? 9 : 7} align="center" sx={{ py: 3 }}>
                            <Typography color="text.secondary">No records found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const grossHours = parseTimeToHours(row.grossHours);
                            const effectiveHours = parseTimeToHours(row.effectiveHours);
                            const efficiency = grossHours > 0 ? (effectiveHours / grossHours) * 100 : 0;
                            
                            return (
                              <TableRow key={`${row.employeeCode}-${row.entryDate}`} hover>
                                {selectedEmployeeName === 'ALL' && (
                                  <>
                                    <TableCell>{row.employeeCode || '-'}</TableCell>
                                    <TableCell>{row.employeeName || '-'}</TableCell>
                                  </>
                                )}
                                <TableCell>{row.entryDate || '-'}</TableCell>
                                <TableCell align="right">{formatHoursForExport(row.checkInTime) || '-'}</TableCell>
                                <TableCell align="right">{formatHoursForExport(row.checkOutTime) || '-'}</TableCell>
                                <TableCell align="right">{formatHoursForExport(row.grossHours) || '-'}</TableCell>
                                <TableCell align="right">{formatHoursForExport(row.effectiveHours) || '-'}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`${efficiency.toFixed(1)}%`}
                                    size="small"
                                    variant="outlined"
                                    color={
                                      efficiency >= 100 ? 'success' :
                                      efficiency >= 90 ? 'success' :
                                      efficiency >= 80 ? 'primary' :
                                      efficiency >= 70 ? 'warning' :
                                      efficiency >= 60 ? 'warning' : 'error'
                                    }
                                  />
                                </TableCell>
                                <TableCell align="right">{formatHoursForExport(row.otHours) || '-'}</TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </Box>

                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </>
            ) : (
              <>
                {attendanceReport.length > 0 ? (
                  <>
                    <SummaryStats />
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center">
                        <InfoIcon sx={{ mr: 1 }} />
                        <div>
                          <Typography variant="body2" fontWeight="bold">
                            Efficiency Formula: (Effective Hours / Gross Hours) × 100%
                          </Typography>
                          <Typography variant="caption">
                            • 100%+ = Excellent (Exceeded expectations)<br />
                            • 90-99% = Very Good<br />
                            • 80-89% = Good<br />
                            • 70-79% = Average<br />
                            • 60-69% = Below Average<br />
                            • Below 60% = Needs Improvement
                          </Typography>
                        </div>
                      </Box>
                    </Alert>

                    <Grid container spacing={2}>
                      {efficiencyData.map((emp) => (
                        <Grid item xs={12} sm={6} md={4} key={emp.code}>
                          <EfficiencyCard data={emp} />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                ) : (
                  <Box textAlign="center" py={4}>
                    <AccessTimeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No attendance data to analyze
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate attendance report first to see efficiency analysis
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </DialogContent>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={() => setDialogOpen(false)} variant="contained">
              Close
            </Button>
          </Box>
        </Dialog>
      </div>
    </>
  );
};

export default EmployeeAttanceReport;