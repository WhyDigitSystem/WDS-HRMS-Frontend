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
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import Draggable from 'react-draggable';
import Autocomplete from '@mui/material/Autocomplete';
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
  const [formData, setFormData] = useState({
    currMonth: dayjs().format('MMM'),
    currMonthNum: dayjs().format('M'),
    currYear: dayjs().format('YYYY'),
    branch: 'All',
    employeeCode: 'All',
    empDepartment: 'All'
  });
  const [fieldErrors, setFieldErrors] = useState({
    currMonth: '',
    currYear: '',
    branch: '',
    employeeCode: '',
    empDepartment: ''
  });
  const handleClear = () => {
    setListView(false);
    setFormData({
      currMonth: dayjs().format('MMM'),
      currMonthNum: dayjs().format('M'),
      currYear: dayjs().format('YYYY'),
      branch: 'All',
      employeeCode: 'All',
      empDepartment: 'All'
    });
    setFieldErrors({
      currMonth: '',
      currYear: '',
      branch: '',
      employeeCode: '',
      empDepartment: ''
    });
    setRowData([]);
  };
  const handleDateChange = (field, date) => {
    if (!date) {
      setFormData((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    if (field === 'currMonth') {
      setFormData((prev) => ({
        ...prev,
        currMonth: date.format('MMM'),
        currMonthNum: date.format('M')
      }));
    } else if (field === 'currYear') {
      setFormData((prev) => ({ ...prev, currYear: date.format('YYYY') }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: date.format('YYYY-MM-DD') }));
    }
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
          // setEmpCodeName([]);
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
    const errors = {};
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setListView(false);
      try {
        let response = await apiCalls(
          'get',
          `/timesheet/getAllEmployeeTask?branchCode=${branchCode}&department=${formData.empDepartment}&employeecode=${formData.employeeCode}&month=${formData.currMonthNum}&orgId=${orgId}&year=${formData.currYear}`
        );
        if (response.status === true) {
          console.log('Response:', response);
          setRowData(response.paramObjectsMap.timeSheetVO || []);
          console.log('Res', response.paramObjectsMap.timeSheetVO || []);
          setIsLoading(false);
          setListView(true);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Report Fetch failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Report Fetch failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
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
      ['Month', filters?.currMonth || '-'],
      ['Year', filters?.currYear || '-'],
      ['Branch', filters?.branch || '-'],
      ['Department', filters?.empDepartment || '-']
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
      ['Month', filters?.currMonth || '-'],
      ['Year', filters?.currYear || '-'],
      ['Branch', filters?.branch || '-'],
      ['Department', filters?.empDepartment || '-']
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
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
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
                    views={['month']}
                    label="Month"
                    value={dayjs(formData.currMonth, 'MMM')}
                    onChange={(date) => handleDateChange('currMonth', date)}
                    format="MMM"
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        size: 'small',
                        error: fieldErrors.currMonth,
                        helperText: fieldErrors.currMonth
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
                    views={['year']}
                    label="Year"
                    value={dayjs(formData.currYear, 'YYYY')}
                    onChange={(date) => handleDateChange('currYear', date)}
                    format="YYYY"
                    slotProps={{
                      textField: {
                        size: 'small',
                        error: fieldErrors.currYear,
                        helperText: fieldErrors.currYear
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
                  if (option.employeeCode === 'All') return 'All'; // ✅ Show only "All"
                  return `${option.employeeCode} - ${option.employee}`;
                }}
                value={
                  [{ employeeCode: 'All', employee: 'All Employees' }, ...empCodeName].find(
                    (item) => item.employeeCode === formData.employeeCode
                  ) || null
                }
                onChange={(event, newValue) => handleChange('employeeCode', newValue?.employeeCode || '')}
                isOptionEqualToValue={(option, value) => option.employeeCode === value.employeeCode} // ✅ Fix equality issue
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
                startIcon={<TaskAltIcon />}
                sx={{
                  borderRadius: '30px',
                  padding: '6px 14px',
                  fontWeight: '100',
                  fontSize: '12px',
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                  boxShadow: '0 2spx 10px rgba(25, 118, 210, 0.4)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0, #1e88e5)',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.6)'
                  },
                  '&:active': {
                    transform: 'scale(0.97)'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={14} sx={{ color: 'white' }} /> : 'Show Tasks'}
              </Button>
            </div>
            {/* <div className="col-md-1 mb-1">
              <Button
                variant="contained"
                onClick={handleClear}
                // disabled={isLoading}
                startIcon={<ClearIcon />}
                sx={{
                  borderRadius: '30px',
                  padding: '6px 14px',
                  fontWeight: '100',
                  fontSize: '12px',
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                  boxShadow: '0 2spx 10px rgba(25, 118, 210, 0.4)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0, #1e88e5)',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.6)'
                  },
                  '&:active': {
                    transform: 'scale(0.97)'
                  }
                }}
              >
                <CircularProgress size={14} sx={{ color: 'white' }} />
              </Button>
            </div> */}
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
            sx: { p: 0, m: 0, borderRadius: 1 }
          }}
        >
          <DialogTitle style={{ cursor: 'move', backgroundColor: '#0f0f1a', color: 'white' }} id="draggable-dialog-title">
            Task Details
            {/* Download Icon */}
            <Tooltip title="Download">
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  position: 'absolute',
                  right: 40,
                  top: 2,
                  color: 'white'
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} PaperProps={{ sx: { minWidth: 150 } }}>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  exportToExcel({
                    logo: listViewData[0]?.companyLogo,
                    empName: formData.employeeCode === 'All' ? 'All Employees' : formData.employeeCode,
                    filters: formData,
                    rowData: rowData
                  });
                }}
              >
                <TableViewIcon sx={{ mr: 1, color: 'green' }} /> Excel
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  exportToPDF({
                    logo: listViewData[0]?.companyLogo,
                    loginUserName,
                    fileName: 'Employee Task Report',
                    empName: formData.employeeCode === 'All' ? 'All Employees' : formData.employeeCode,
                    filters: formData,
                    rowData: rowData
                  });
                }}
              >
                <PictureAsPdfIcon sx={{ mr: 1, color: 'red' }} /> PDF
              </MenuItem>
            </Menu>
            <IconButton
              onClick={() => setListView(false)}
              sx={{
                position: 'absolute',
                right: 2,
                top: 2,
                color: 'white'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              p: 0,
              backgroundColor: '#0f0f1a'
            }}
          >
            <>
              {/* <Typography variant="subtitle1" gutterBottom>
                Date Range: {filters.dateRange.start} to {filters.dateRange.end}
              </Typography> */}
              <TableContainer component={Paper}>
                <Table stickyHeader aria-label="employee task report table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 110, fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ minWidth: 90, fontWeight: 'bold' }}>Tot Hrs</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                      <TableCell sx={{ minWidth: 50, maxWidth: 70, fontWeight: 'bold' }}>Screens</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>From</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>To</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>WIP%</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rowData.map((row, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        <TableRow sx={{ backgroundColor: 'blue' }}>
                          <TableCell colSpan={11} style={{ fontWeight: 'bold' }}>
                            {(() => {
                              const totalDays = row.timesheets.length;
                              const presentDays = row.timesheets.filter((ts) => ts.status === 'TIMESHEET').length;

                              // Leave days = Absent + any status that includes "LEAVE"
                              const leaveDays = row.timesheets.filter(
                                (ts) =>
                                  ts.status === 'ABSENT' || ts.status === 'COMPENSATORY OFF' || ts.status?.toUpperCase().includes('LEAVE')
                              ).length;
                              return (
                                <>
                                  <span style={{ color: '#FFFFFF' }}>{row.empcodename}</span> &nbsp; | &nbsp;
                                  <span style={{ color: '#FFFFFF' }}>Total Days: {totalDays}</span> &nbsp; | &nbsp;
                                  <span style={{ color: '#FFFFFF' }}>Present: {presentDays}</span> &nbsp; | &nbsp;
                                  <span style={{ color: '#FFFFFF' }}>Leave: {leaveDays}</span>
                                </>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                        {/* Timesheet Loop */}
                        {/* {row.timesheets.map((ts, tsIndex) => {
                          const details = ts.timeSheetDetailsVO || [];
                          const detailCount = details.length || 1; */}
                        {[...row.timesheets]
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((ts, tsIndex) => {
                            const details = ts.timeSheetDetailsVO || [];
                            const detailCount = details.length || 1;
                            // ✅ Case 1: Timesheet with task details
                            if (ts.status === 'TIMESHEET' && details.length > 0) {
                              return details.map((task, i) => (
                                <TableRow key={`${rowIndex}-${tsIndex}-${i}`}>
                                  {/* Show Date/Status/Hours only once, span all rows */}
                                  {i === 0 && (
                                    <>
                                      <TableCell rowSpan={detailCount} sx={{ verticalAlign: 'middle', fontWeight: 'bold' }}>
                                        {dayjs(ts.date).format('DD/MM/YYYY')}
                                      </TableCell>
                                      <TableCell rowSpan={detailCount} sx={{ verticalAlign: 'middle' }}>
                                        {ts.totalhours} h
                                      </TableCell>
                                    </>
                                  )}

                                  {/* Task details */}
                                  <TableCell>{task.projectName}</TableCell>
                                  <TableCell>{task.project}</TableCell>
                                  <TableCell>
                                    <StatusBadge status={task.status} />
                                  </TableCell>
                                  <TableCell>{task.fromTime}</TableCell>
                                  <TableCell>{task.toTime}</TableCell>
                                  <TableCell>{task.wip}</TableCell>
                                  <TableCell>{task.description}</TableCell>
                                  <TableCell>{task.remarks}</TableCell>
                                </TableRow>
                              ));
                            }
                            // ✅ Case 2: Any other status (holiday, leave, absent, weekend, etc.)
                            return (
                              <TableRow
                                key={`${rowIndex}-${tsIndex}`}
                                sx={{
                                  backgroundColor: '#ffeaea',
                                  textAlign: 'center'
                                }}
                              >
                                <TableCell sx={{ textAlign: 'start', fontWeight: 'bold' }}>{dayjs(ts.date).format('DD/MM/YYYY')}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                  {ts.totalhours}
                                  {ts.totalhours ? 'hrs' : ''}
                                </TableCell>
                                <TableCell
                                  colSpan={8}
                                  sx={{
                                    textAlign: 'center',
                                    fontStyle: 'italic',
                                    fontWeight: 'bold',
                                    color: '#d32f2f'
                                  }}
                                >
                                  {ts.status}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
export default OverAllReport;
