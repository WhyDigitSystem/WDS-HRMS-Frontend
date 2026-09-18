import React from 'react';
import { TextFieldFormControl, TextField, FormControl } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Typography, Box } from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import ClearIcon from '@mui/icons-material/Clear';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button, CircularProgress } from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import Draggable from 'react-draggable';
import Autocomplete from '@mui/material/Autocomplete';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const StatusBadge = ({ status }) => {
  const colorMap = {
    Done: 'success',
    'In Progress': 'warning',
    'Yet Start': 'default',
    Pending: 'error',
    Testing: 'info'
  };
  return <Chip label={status || ''} color={colorMap[status] || 'default'} size="small" />;
};

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

function OverAllReport() {
  const [listViewData, setListViewData] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [isLoading, setIsLoading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [empCodeName, setEmpCodeName] = useState([]);

  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [screenList, setScreenList] = useState([]);
  const [screenFilter, setScreenFilter] = useState('All');
  const [dateList, setDateList] = useState([]);
  const [dateFilter, setDateFilter] = useState('All');

  const [formData, setFormData] = useState({
    fromDate: dayjs().format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
    branch: 'All',
    employeeCode: 'All',
    empDepartment: 'All'
  });

  const [fieldErrors, setFieldErrors] = useState({
    fromDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
    branch: '',
    employeeCode: '',
    empDepartment: ''
  });

  // Extract unique screens from rowData and remove duplicates
  const extractScreenList = (data) => {
    const screens = new Set(['All']);

    data.forEach((row) => {
      row.timesheets.forEach((ts) => {
        // Only include screens from working timesheets
        if (ts.status === 'TIMESHEET' && ts.timeSheetDetailsVO?.length > 0) {
          ts.timeSheetDetailsVO.forEach((task) => {
            if (task.project?.trim()) {
              screens.add(task.project.trim());
            }
          });
        }
      });
    });

    return Array.from(screens).sort((a, b) => a.localeCompare(b));
  };

  // Extract unique dates from rowData
  const extractDateList = (data) => {
    const dates = new Set(['All']);

    data.forEach((row) => {
      row.timesheets.forEach((ts) => {
        if (ts.date) {
          dates.add(ts.date);
        }
      });
    });

    return Array.from(dates)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        value: date,
        label: dayjs(date).format('DD/MM/YYYY')
      }));
  };

  // Filter data by screen - show only tasks matching the selected screen
  const filterDataByScreen = (data, screen) => {
    if (screen === 'All') return data;

    return data
      .map((row) => {
        // Filter only relevant timesheets
        const validTimesheets = row.timesheets
          .filter((ts) => ts.status === 'TIMESHEET') // ✅ exclude leave/holiday
          .map((ts) => ({
            ...ts,
            timeSheetDetailsVO: ts.timeSheetDetailsVO ? ts.timeSheetDetailsVO.filter((task) => task.project?.trim() === screen) : []
          }))
          .filter((ts) => ts.timeSheetDetailsVO.length > 0);

        return { ...row, timesheets: validTimesheets };
      })
      .filter((row) => row.timesheets.length > 0); // remove employees with no matches
  };

  // Filter data by date - show only tasks matching the selected date
  const filterDataByDate = (data, date) => {
    if (date === 'All') return data;

    return data
      .map((row) => {
        // Filter timesheets for the selected date
        const validTimesheets = row.timesheets.filter((ts) => ts.date === date);

        return { ...row, timesheets: validTimesheets };
      })
      .filter((row) => row.timesheets.length > 0); // remove employees with no matches
  };

  // Apply both screen and date filters
  const applyFilters = (data, screen, date) => {
    let filteredData = data;

    if (screen !== 'All') {
      filteredData = filterDataByScreen(filteredData, screen);
    }

    if (date !== 'All') {
      filteredData = filterDataByDate(filteredData, date);
    }

    return filteredData;
  };

  // ✅ Screen filter change handler
  const handleScreenFilterChange = (screen) => {
    setScreenFilter(screen);
    const filteredData = applyFilters(rowData, screen, dateFilter);
    setFilteredRowData(filteredData);
  };

  // ✅ Date filter change handler
  const handleDateFilterChange = (date) => {
    setDateFilter(date);
    const filteredData = applyFilters(rowData, screenFilter, date);
    setFilteredRowData(filteredData);
  };

  const handleClear = () => {
    setListView(false);
    setFormData({
      fromDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      toDate: dayjs().format('YYYY-MM-DD'),
      branch: 'All',
      employeeCode: 'All',
      empDepartment: 'All'
    });
    setFieldErrors({
      fromDate: null,
      toDate: dayjs().format('YYYY-MM-DD'),
      branch: '',
      employeeCode: '',
      empDepartment: ''
    });
    setRowData([]);
    setFilteredRowData([]);
    setScreenFilter('All');
    setScreenList([]);
    setDateFilter('All');
    setDateList([]);
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.format('YYYY-MM-DD') : ''
    }));
  };

  const handleChange = async (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: ''
    }));
    if (field === 'empDepartment') {
      try {
        if (value === 'All') {
          setEmpCodeName([{ empCode: 'All', empName: '' }]);
          getEmployeeCodeName(value);
        } else {
          getEmployeeCodeName(value);
        }
        setFormData((prev) => ({ ...prev, employeeCode: '' }));
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    }
  };

  useEffect(() => {
    getBranch();
    getAllDepartment();
    getCompanyDetails();
    getEmployeeCodeName('All');
  }, []);

  const getEmployeeCodeName = async (dept) => {
    try {
      const response = await apiCalls(
        'get',
        `/timesheet/getEmployeeDetailsForAllTaskReport?branchCode=${branchCode}&department=${dept}&orgId=${orgId}`
      );
      setEmpCodeName(response.paramObjectsMap.employeeVO);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getBranch = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearchTasks = async () => {
    setIsLoading(true);
    setListView(false);
    try {
      const response = await apiCalls(
        'get',
        `/timesheet/getAllEmployeeTask?branchCode=${branchCode}&department=${formData.empDepartment}&employeecode=${formData.employeeCode}&fromDate=${formData.fromDate}&orgId=${orgId}&toDate=${formData.toDate}`
      );
      if (response.status === true) {
        const data = response.paramObjectsMap.timeSheetVO || [];
        setRowData(data);
        setFilteredRowData(data);
        setScreenList(extractScreenList(data));
        setDateList(extractDateList(data));
        setScreenFilter('All');
        setDateFilter('All');
        setListView(true);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'Report Fetch failed');
      }
    } catch (error) {
      showToast('error', 'Report Fetch failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      console.log('API Response:', response);
      setListViewData(response.paramObjectsMap.companyVO.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const exportToExcel = async ({ logo, empName, filters, rowData }) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Task Report');

    // ===== 1) LOGO =====
    sheet.mergeCells('A1:A5');
    if (logo) {
      const base64Data = logo.split(',')[1] || logo;
      const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
      const imageId = workbook.addImage({ base64: base64Data, extension });
      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 80 }
      });
    }

    // ===== 2) TITLE =====
    sheet.mergeCells('B1:E1');
    const titleCell = sheet.getCell('B1');
    titleCell.value = 'Employee Task Report';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF34449B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // ===== 3) PARAMS =====
    let metaRowIndex = 2;
    const paramEntries = [
      ['Employee', empName || '-'],
      ['From Date', filters?.fromDate ? dayjs(filters.fromDate).format('DD-MM-YYYY') : '-'],
      ['To Date', filters?.toDate ? dayjs(filters.toDate).format('DD-MM-YYYY') : '-'],
      // ['From Date', filters?.fromDate.format('DD-MM-YYYY') || '-'],
      // ['To Date', filters?.toDate.format('DD-MM-YYYY') || '-'],
      ['Branch', filters?.branch || '-'],
      ['Department', filters?.empDepartment || '-'],
      ['Screen Filter', screenFilter !== 'All' ? screenFilter : 'All Screens'],
      ['Date Filter', dateFilter !== 'All' ? dayjs(dateFilter).format('DD/MM/YYYY') : 'All Dates']
    ];
    paramEntries.forEach(([label, value]) => {
      const row = sheet.getRow(metaRowIndex++);
      row.getCell(2).value = label;
      row.getCell(2).font = { bold: true };
      row.getCell(3).value = value;
    });

    metaRowIndex += 1; // gap before headers

    // ===== 4) HEADERS =====
    const headers = ['Employee', 'Date', 'Tot Hrs', 'Project Name', 'Screens', 'Status', 'From', 'To', 'WIP%', 'Description', 'Remarks'];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF34449B' }
      };
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
    });

    // ===== 5) DATA =====
    (rowData || []).forEach((row) => {
      const totalDays = row.timesheets.length;
      const presentDays = row.timesheets.filter((ts) => ts.status === 'TIMESHEET').length;
      const leaveDays = row.timesheets.filter(
        (ts) => ts.status === 'ABSENT' || ts.status === 'COMPENSATORY OFF' || ts.status?.toUpperCase().includes('LEAVE')
      ).length;

      // 🔹 Employee Summary Row
      const summaryRow = sheet.addRow([`${row.empcodename} | Total Days: ${totalDays} | Present: ${presentDays} | Leave: ${leaveDays}`]);
      summaryRow.font = { bold: true };
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFBBDEFB' }
      };
      sheet.mergeCells(`A${summaryRow.number}:K${summaryRow.number}`);
      summaryRow.alignment = { horizontal: 'start' };

      // 🔹 Timesheets
      [...row.timesheets]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((ts) => {
          const details = ts?.timeSheetDetailsVO || [];
          const detailCount = details.length || 1;

          if (ts.status === 'TIMESHEET' && details.length > 0) {
            details.forEach((task, i) => {
              const rowArr = [];

              // 🔹 Always put employee name in first column
              if (i === 0) {
                rowArr.push(row.employeename || '-'); // Employee
                rowArr.push(dayjs(ts.date).format('DD/MM/YYYY')); // Date
                rowArr.push(ts.totalhours || '-'); // Tot Hrs
              } else {
                rowArr.push(null); // Employee merged
                rowArr.push(null); // Date merged
                rowArr.push(null); // Tot Hrs merged
              }

              rowArr.push(task.projectName || '-');
              rowArr.push(task.project || '-');
              rowArr.push(task.status || '-');
              rowArr.push(task.fromTime || '-');
              rowArr.push(task.toTime || '-');
              rowArr.push(task.wip || '-');
              rowArr.push(task.description || '-');
              rowArr.push(task.remarks || '-');

              const addedRow = sheet.addRow(rowArr);

              // merge Employee + Date + Tot Hrs vertically across tasks
              if (i === detailCount - 1 && detailCount > 1) {
                const startRow = addedRow.number - detailCount + 1;
                const endRow = addedRow.number;

                sheet.mergeCells(`A${startRow}:A${endRow}`); // Employee column
                sheet.mergeCells(`B${startRow}:B${endRow}`); // Date column
                sheet.mergeCells(`C${startRow}:C${endRow}`); // Tot Hrs column
              }
            });
          } else {
            // Leave/Holiday Row
            const leaveRow = sheet.addRow([row.employeename || '-', dayjs(ts.date).format('DD/MM/YYYY'), ts.status]);
            sheet.mergeCells(`C${leaveRow.number}:K${leaveRow.number}`);
            leaveRow.eachCell((c) => {
              c.font = { italic: true, bold: true, color: { argb: 'FFD32F2F' } };
              c.alignment = { horizontal: 'start' };
            });
            leaveRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFEAEA' }
            };
          }
        });
    });
    // ===== 6) AUTO WIDTH =====
    sheet.columns.forEach((col, index) => {
      let maxLen = 8;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLen) maxLen = len;
      });

      // Description (col 10 → index 9)
      if (index === 9) {
        col.width = Math.min(maxLen + 2, 35);
        col.alignment = { wrapText: true };
      }
      // Remarks (col 11 → index 10)
      else if (index === 10) {
        col.width = Math.min(maxLen + 2, 25);
        col.alignment = { wrapText: true };
      }
      // Screens (col 5 → index 4)
      else if (index === 4) {
        col.width = Math.min(maxLen + 2, 18); // cap screens at 18 chars
        col.alignment = { wrapText: true };
      } else {
        col.width = Math.min(maxLen + 2, 20);
      }
    });
    // ===== 7) SAVE =====
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Task_Report_${dayjs().format('YYYY_MM_DD_HHmmss')}.xlsx`);
  };

  const exportToPDF = ({ logo, loginUserName, fileName, empName, filters, rowData }) => {
    const doc = new jsPDF('landscape');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ===== 1) LOGO =====
    if (logo) doc.addImage(logo, 'PNG', 10, 10, 30, 23);

    // ===== 2) TITLE =====
    const title = fileName || 'Employee Task Report';
    doc.setFontSize(14).setFont(undefined, 'bold').setTextColor('#34449B');
    doc.text(title, pageW / 2, 25, { align: 'center' });

    // ===== 3) PARAMS =====
    doc.setFontSize(10).setTextColor('#000000');
    let metaY = 40;
    const paramEntries = [
      ['Employee', empName || '-'],
      ['From Date', filters?.fromDate ? dayjs(filters.fromDate).format('DD-MM-YYYY') : '-'],
      ['To Date', filters?.toDate ? dayjs(filters.toDate).format('DD-MM-YYYY') : '-'],
      ['Branch', filters?.branch || '-'],
      ['Department', filters?.empDepartment || '-'],
      ['Screen Filter', screenFilter !== 'All' ? screenFilter : 'All Screens'],
      ['Date Filter', dateFilter !== 'All' ? dayjs(dateFilter).format('DD/MM/YYYY') : 'All Dates']
    ];

    paramEntries.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 15, metaY);
      metaY += 6;
    });

    // ===== 4) TABLE =====
    const tableColumn = ['Date', 'Tot Hrs', 'Project Name', 'Screens', 'Status', 'From', 'To', 'WIP%', 'Description', 'Remarks'];
    let tableRows = [];

    rowData.forEach((row) => {
      const totalDays = row.timesheets.length;
      const presentDays = row.timesheets.filter((ts) => ts.status === 'TIMESHEET').length;
      const leaveDays = row.timesheets.filter(
        (ts) => ts.status === 'ABSENT' || ts.status === 'COMPENSATORY OFF' || ts.status?.toUpperCase().includes('LEAVE')
      ).length;

      // 🔹 Employee Summary Row
      tableRows.push([
        {
          content: `${row.empcodename} | Total Days: ${totalDays} | Present: ${presentDays} | Leave: ${leaveDays}`,
          colSpan: 10,
          styles: { halign: 'center', fillColor: [187, 222, 251], fontStyle: 'bold' }
        }
      ]);

      row.timesheets
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((ts) => {
          const details = ts.timeSheetDetailsVO || [];

          if (ts.status === 'TIMESHEET' && details.length > 0) {
            details.forEach((task, idx) => {
              let rowCells = [];
              if (idx === 0) {
                rowCells.push({
                  content: dayjs(ts.date).format('DD/MM/YYYY'),
                  rowSpan: details.length,
                  styles: { halign: 'center', fontStyle: 'bold' }
                });
                rowCells.push({
                  content: ts.totalhours || '-',
                  rowSpan: details.length,
                  styles: { halign: 'center' }
                });
              }
              rowCells.push(task.projectName || '-');
              rowCells.push(task.project || '-');
              rowCells.push(task.status || '-');
              rowCells.push(task.fromTime || '-');
              rowCells.push(task.toTime || '-');
              rowCells.push(task.wip || '-');
              rowCells.push(task.description || '-');
              rowCells.push(task.remarks || '-');

              tableRows.push(rowCells);
            });
          } else {
            // Leave/Holiday Row
            tableRows.push([
              { content: dayjs(ts.date).format('DD/MM/YYYY'), styles: { halign: 'center', fontStyle: 'bold' } },
              { content: ts.totalhours || '-', styles: { halign: 'center' } },
              {
                content: ts.status,
                colSpan: 8,
                styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 234, 234], textColor: [211, 47, 47] }
              }
            ]);
          }
        });
    });

    // ===== 5) TABLE WITH FOOTER HOOK =====
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: metaY + 5,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [52, 68, 155], textColor: 255, halign: 'center' },
      bodyStyles: { valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 20 }, // Date
        1: { cellWidth: 15 }, // Tot Hrs
        2: { cellWidth: 35 }, // Project Name
        3: { cellWidth: 20 }, // Screens
        4: { cellWidth: 20 }, // Status
        5: { cellWidth: 20 }, // From
        6: { cellWidth: 20 }, // To
        7: { cellWidth: 15 }, // WIP%
        8: { cellWidth: 60 }, // Description
        9: { cellWidth: 40 } // Remarks
      },
      theme: 'grid',
      didDrawPage: (data) => {
        // Footer (left & right)
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
        doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });

        // Page numbers (center)
        const pageNumber = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber}`, pageW / 2, pageH - 10, { align: 'center' });
      }
    });

    // ===== 6) SAVE =====
    doc.save(`${fileName || 'Task_Report'}_${dayjs().format('YYYY_MM_DD_HHmmss')}.pdf`);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [screenFilterAnchorEl, setScreenFilterAnchorEl] = React.useState(null);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const screenFilterOpen = Boolean(screenFilterAnchorEl);
  const dateFilterOpen = Boolean(dateFilterAnchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleScreenFilterMenuOpen = (event) => {
    setScreenFilterAnchorEl(event.currentTarget);
  };

  const handleScreenFilterMenuClose = () => {
    setScreenFilterAnchorEl(null);
  };

  const handleDateFilterMenuOpen = (event) => {
    setDateFilterAnchorEl(event.currentTarget);
  };

  const handleDateFilterMenuClose = () => {
    setDateFilterAnchorEl(null);
  };

  return (
    <>
      <div>
        <ToastComponent />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <>
          <div className="row">
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled" size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From Date"
                    value={formData.fromDate ? dayjs(formData.fromDate) : null}
                    onChange={(date) => handleDateChange('fromDate', date)}
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        size: 'small',
                        // error: !!fieldErrors.fromDate,
                        // helperText: fieldErrors.fromDate
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
                    label="To Date"
                    value={formData.toDate ? dayjs(formData.toDate) : null}
                    onChange={(date) => handleDateChange('toDate', date)}
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        size: 'small'
                        // error: !!fieldErrors.toDate,
                        // helperText: fieldErrors.toDate
                      }
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={['All', ...branchList.map((row) => row.branch)]}
                value={formData.branch || null}
                onChange={(event, newValue) => handleChange('branch', newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Branch <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    error={!!fieldErrors.branch}
                    helperText={fieldErrors.branch}
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={[{ departmentName: 'All' }, ...departmentList]}
                getOptionLabel={(option) => option?.departmentName || ''}
                sx={{ width: '100%' }}
                size="small"
                value={
                  [{ departmentName: 'All' }, ...departmentList].find((c) => c.departmentName === formData.empDepartment) || {
                    departmentName: 'All'
                  }
                }
                isOptionEqualToValue={(option, value) => option.departmentName === value.departmentName}
                onChange={(event, newValue) => handleChange('empDepartment', newValue?.departmentName || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    name="empDepartment"
                    InputProps={{
                      ...params.InputProps,
                      style: { height: 40 }
                    }}
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={[{ employeeCode: 'All', employee: 'All Employees' }, ...empCodeName]}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  if (option.employeeCode === 'All') return 'All';
                  return `${option.employeeCode} - ${option.employee}`;
                }}
                value={
                  [{ employeeCode: 'All', employee: 'All Employees' }, ...empCodeName].find(
                    (item) => item.employeeCode === formData.employeeCode
                  ) || null
                }
                onChange={(event, newValue) => handleChange('employeeCode', newValue?.employeeCode || '')}
                isOptionEqualToValue={(option, value) => option.employeeCode === value.employeeCode}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Emp Code/Name <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    error={!!fieldErrors.employeeCode}
                    helperText={fieldErrors.employeeCode}
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="col-md-2 mb-0">
              <Button
                variant="contained"
                onClick={handleSearchTasks}
                disabled={isLoading}
                startIcon={!isLoading && <TaskAltIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '10px',
                  px: 2,
                  py: 0.8,
                  minWidth: 140,
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
                  transition: 'all 0.25s ease',

                  '&:hover': {
                    background: 'linear-gradient(135deg, #325c5e 0%, #223d3f 100%)',
                    boxShadow: '0 6px 16px rgba(15,23,42,0.18)',
                    transform: 'translateY(-1px)'
                  },

                  '&:active': {
                    transform: 'scale(0.98)'
                  },

                  '&.Mui-disabled': {
                    background: '#90a4ae',
                    color: '#fff'
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress
                    size={16}
                    thickness={5}
                    sx={{
                      color: '#fff'
                    }}
                  />
                ) : (
                  'Show Tasks'
                )}
              </Button>
            </div>
          </div>
        </>
        <Dialog
          open={listView}
          onClose={() => setListView(false)}
          fullWidth
          maxWidth="xl"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
          PaperProps={{
            sx: {
              borderRadius: {
                xs: '14px',
                sm: '22px'
              },
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: '0 18px 45px rgba(15,23,42,0.20)',
              border: '1px solid rgba(255,255,255,0.15)',
              width: {
                xs: 'calc(100vw - 10px)',
                sm: '95vw'
              },
              maxWidth: {
                xs: 'calc(100vw - 10px)',
                xl: '1600px'
              },
              m: {
                xs: '5px auto',
                sm: 2
              },
              maxHeight: '96vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundImage: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
            }
          }}
        >
          {/* HEADER */}
          <DialogTitle
            id="draggable-dialog-title"
            sx={{
              cursor: 'move',
              px: {
                xs: 1.5,
                sm: 2.5
              },
              py: 1.5,
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '60px',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  fontSize: {
                    xs: '15px',
                    sm: '18px'
                  }
                }}
              >
                Task Details
              </Typography>

              <Typography
                sx={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.75)',
                  mt: 0.3
                }}
              >
                Employee Task Report Summary
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.7
              }}
            >
              <Tooltip title="Download">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    width: 34,
                    height: 34,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.22)'
                    }
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Close">
                <IconButton
                  onClick={() => setListView(false)}
                  size="small"
                  sx={{
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    width: 34,
                    height: 34,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.22)'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* DOWNLOAD MENU */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  minWidth: 180,
                  boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
                  mt: 1
                }
              }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  exportToExcel({
                    logo: listViewData[0]?.companyLogo,
                    empName:
                      formData.employeeCode === 'All'
                        ? 'All Employees'
                        : formData.employeeCode,
                    filters: formData,
                    rowData: filteredRowData
                  });
                }}
                sx={{
                  py: 1,
                  fontSize: '13px'
                }}
              >
                <TableViewIcon
                  sx={{
                    mr: 1.2,
                    color: 'green'
                  }}
                />
                Export Excel
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  exportToPDF({
                    logo: listViewData[0]?.companyLogo,
                    loginUserName,
                    fileName: 'Employee Task Report',
                    empName:
                      formData.employeeCode === 'All'
                        ? 'All Employees'
                        : formData.employeeCode,
                    filters: formData,
                    rowData: filteredRowData
                  });
                }}
                sx={{
                  py: 1,
                  fontSize: '13px'
                }}
              >
                <PictureAsPdfIcon
                  sx={{
                    mr: 1.2,
                    color: 'red'
                  }}
                />
                Export PDF
              </MenuItem>
            </Menu>
          </DialogTitle>

          {/* BODY */}
          <DialogContent
            sx={{
              background: '#f8fafc',
              p: {
                xs: 1,
                sm: 1.5
              },
              overflow: 'auto'
            }}
          >
            {/* FILTER BAR */}
            {(screenFilter !== 'All' || dateFilter !== 'All') && (
              <Paper
                elevation={0}
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: '16px',
                  background:
                    'linear-gradient(90deg, #eef7ff 0%, #d8ecff 100%)',
                  border: '1px solid #bbdefb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: '#1565c0',
                        fontSize: '13px'
                      }}
                    >
                      Active Filters :
                    </Typography>

                    {screenFilter !== 'All' && (
                      <Chip
                        label={`Screen : ${screenFilter}`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          background: '#1976d2',
                          color: '#fff'
                        }}
                      />
                    )}

                    {dateFilter !== 'All' && (
                      <Chip
                        label={`Date : ${dayjs(dateFilter).format('DD/MM/YYYY')}`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          background: '#7b1fa2',
                          color: '#fff'
                        }}
                      />
                    )}
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<FilterListOffIcon />}
                    onClick={() => {
                      handleScreenFilterChange('All');
                      handleDateFilterChange('All');
                    }}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 0.7,
                      background:
                        'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.10)',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #325c5e 0%, #223d3f 100%)'
                      }
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Paper>
            )}

            {/* TABLE */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                background: '#fff'
              }}
            >
              <TableContainer
                sx={{
                  maxHeight: '72vh',
                  overflow: 'auto',

                  '&::-webkit-scrollbar': {
                    height: 8,
                    width: 8
                  },

                  '&::-webkit-scrollbar-thumb': {
                    background: '#cbd5e1',
                    borderRadius: 10
                  }
                }}
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    minWidth: 1250,

                    '& .MuiTableCell-root': {
                      borderColor: '#eef2f7'
                    }
                  }}
                >
                  {/* HEADER */}
                  <TableHead>
                    <TableRow>
                      {[
                        'Date',
                        'Tot Hrs',
                        'Project',
                        'Screens',
                        'Status',
                        'From',
                        'To',
                        'WIP%',
                        'Description',
                        'Remarks'
                      ].map((head, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            background: '#f1f5f9',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '12px',
                            py: 1.5,
                            whiteSpace: 'nowrap',
                            textAlign:
                              head === 'Description' ||
                                head === 'Remarks'
                                ? 'left'
                                : 'center'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                head === 'Description' ||
                                  head === 'Remarks'
                                  ? 'flex-start'
                                  : 'center',
                              gap: 0.5
                            }}
                          >
                            {head}

                            {head === 'Date' && (
                              <Tooltip title="Filter by Date">
                                <IconButton
                                  onClick={handleDateFilterMenuOpen}
                                  size="small"
                                  sx={{
                                    p: 0.3,
                                    color: '#3a6b6d'
                                  }}
                                >
                                  <CalendarMonthIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {head === 'Screens' &&
                              formData.employeeCode !== 'All' &&
                              formData.employeeCode !== '' && (
                                <Tooltip title="Filter by Screen">
                                  <IconButton
                                    onClick={handleScreenFilterMenuOpen}
                                    size="small"
                                    sx={{
                                      p: 0.3,
                                      color: '#3a6b6d'
                                    }}
                                  >
                                    <FilterListIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  {/* BODY */}
                  <TableBody>
                    {filteredRowData.length > 0 ? (
                      filteredRowData.map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                          {/* EMPLOYEE HEADER */}
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              sx={{
                                background:
                                  'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                py: 1.3,
                                px: 2,
                                borderBottom: 'none'
                              }}
                            >
                              {(() => {
                                const totalDays = row.timesheets.length;

                                const presentDays = row.timesheets.filter(
                                  (ts) => ts.status === 'TIMESHEET'
                                ).length;

                                const leaveDays = row.timesheets.filter(
                                  (ts) =>
                                    ts.status === 'ABSENT' ||
                                    ts.status === 'COMPENSATORY OFF' ||
                                    ts.status?.toUpperCase().includes('LEAVE')
                                ).length;

                                return (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: {
                                        xs: 'flex-start',
                                        sm: 'center'
                                      },
                                      alignItems: {
                                        xs: 'flex-start',
                                        sm: 'center'
                                      },
                                      flexDirection: {
                                        xs: 'column',
                                        sm: 'row'
                                      },
                                      flexWrap: 'wrap',
                                      gap: {
                                        xs: 0.5,
                                        sm: 2
                                      }
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        color: '#fff',
                                        fontSize: {
                                          xs: '13px',
                                          sm: '14px'
                                        }
                                      }}
                                    >
                                      {row.empcodename}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        color: '#e0f2f1',
                                        fontSize: '12px'
                                      }}
                                    >
                                      Total Days : {totalDays}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        color: '#c8e6c9',
                                        fontSize: '12px'
                                      }}
                                    >
                                      Present : {presentDays}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        color: '#ffcdd2',
                                        fontSize: '12px'
                                      }}
                                    >
                                      Leave : {leaveDays}
                                    </Typography>
                                  </Box>
                                );
                              })()}
                            </TableCell>
                          </TableRow>

                          {[...row.timesheets]
                            .sort(
                              (a, b) =>
                                new Date(a.date) - new Date(b.date)
                            )
                            .map((ts, tsIndex) => {
                              const details =
                                ts.timeSheetDetailsVO || [];

                              const detailCount =
                                details.length || 1;

                              if (
                                ts.status === 'TIMESHEET' &&
                                details.length > 0
                              ) {
                                return details.map((task, i) => (
                                  <TableRow
                                    key={`${rowIndex}-${tsIndex}-${i}`}
                                    hover
                                    sx={{
                                      '&:nth-of-type(even)': {
                                        backgroundColor: '#fcfcfd'
                                      },

                                      '&:hover': {
                                        backgroundColor: '#f8fafc'
                                      }
                                    }}
                                  >
                                    {i === 0 && (
                                      <>
                                        <TableCell
                                          rowSpan={detailCount}
                                          sx={{
                                            verticalAlign: 'middle',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            textAlign: 'center',
                                            fontSize: '12px'
                                          }}
                                        >
                                          {dayjs(ts.date).format(
                                            'DD/MM/YYYY'
                                          )}
                                        </TableCell>

                                        <TableCell
                                          rowSpan={detailCount}
                                          sx={{
                                            verticalAlign: 'middle',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: '12px'
                                          }}
                                        >
                                          {ts.totalhours} h
                                        </TableCell>
                                      </>
                                    )}

                                    <TableCell
                                      sx={{
                                        fontSize: '12px'
                                      }}
                                    >
                                      {task.projectName}
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        textAlign: 'center',
                                        fontSize: '12px'
                                      }}
                                    >
                                      {task.project}
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        textAlign: 'center'
                                      }}
                                    >
                                      <StatusBadge
                                        status={task.status}
                                      />
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        textAlign: 'center',
                                        fontSize: '12px'
                                      }}
                                    >
                                      {task.fromTime}
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        textAlign: 'center',
                                        fontSize: '12px'
                                      }}
                                    >
                                      {task.toTime}
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        textAlign: 'center',
                                        fontSize: '12px'
                                      }}
                                    >
                                      {task.wip}
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        minWidth: 240,
                                        fontSize: '12px',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {task.description}
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        minWidth: 220,
                                        fontSize: '12px',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {task.remarks}
                                    </TableCell>
                                  </TableRow>
                                ));
                              }

                              return (
                                <TableRow
                                  key={`${rowIndex}-${tsIndex}`}
                                  sx={{
                                    background: '#fff7f7'
                                  }}
                                >
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      textAlign: 'center',
                                      fontSize: '12px'
                                    }}
                                  >
                                    {dayjs(ts.date).format(
                                      'DD/MM/YYYY'
                                    )}
                                  </TableCell>

                                  <TableCell
                                    sx={{
                                      textAlign: 'center',
                                      fontSize: '12px'
                                    }}
                                  >
                                    {ts.totalhours}
                                    {ts.totalhours ? ' hrs' : ''}
                                  </TableCell>

                                  <TableCell
                                    colSpan={8}
                                    sx={{
                                      textAlign: 'center',
                                      fontWeight: 700,
                                      color: '#dc2626',
                                      letterSpacing: 0.3,
                                      fontSize: '12px'
                                    }}
                                  >
                                    {ts.status}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          align="center"
                          sx={{
                            py: 6
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#64748b',
                              fontWeight: 500
                            }}
                          >
                            No data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default OverAllReport;
