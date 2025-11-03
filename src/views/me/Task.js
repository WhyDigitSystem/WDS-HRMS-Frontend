import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import ActionButton from 'utils/ActionButton';
import apiCalls from 'apicall';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';
import { FaWhatsapp } from 'react-icons/fa';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box
} from '@mui/material';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Task = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [alProject, setAllProject] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [timeSheetData, setTimeSheetData] = useState({});
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTableOpen, setReportTableOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [allTimeSheetData, setAllTimeSheetData] = useState([]);
  const [errors, setErrors] = useState({ fromDate: '', toDate: '' });

  const [loading, setLoading] = useState(false);
  const [weekOff, setWeekOff] = useState([]);
  const [formRows, setFormRows] = useState([
    { projectName: '', screenTask: '', wip: '', status: '', remarks: '', fromTime: '', toTime: '', description: '' }
  ]);
  const handleAddRow = () => {
    setFormRows([
      ...formRows,
      { projectName: '', screenTask: '', wip: '', status: '', remarks: '', fromTime: '', toTime: '', description: '' }
    ]);
  };

  const handleReportIconClick = () => {
    setFromDate('');
    setToDate('');
    setErrors({ fromDate: '', toDate: '' });
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    const newErrors = {};
    if (!fromDate) newErrors.fromDate = 'From Date is required';
    if (!toDate) newErrors.toDate = 'To Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Main timesheet API
      const result = await apiCalls(
        'get',
        `timesheet/getTimeSheetDescByOrgId?branchCode=${branchCode}&empCode=${employeeCode}&fromDate=${fromDate}&orgId=${orgId}&toDate=${toDate}`
      );
      const timeSheetData = result?.paramObjectsMap?.timeSheetVO || [];

      // Get employee name from the first item (if present)
      const empNameFromData = timeSheetData[0]?.employeeName || '';
      const empCodeFromData = timeSheetData[0]?.employeeCode || '';

      // Leave report API
      const leaveRes = await apiCalls(
        'get',
        `timesheet/getApprovedLeaveForTimeSheetReport?branchCode=${branchCode}&employeeCode=${employeeCode}&fromDate=${fromDate}&orgId=${orgId}&toDate=${toDate}`
      );
      const leaveData = leaveRes?.paramObjectsMap?.timeSheetVO || [];

      // Holiday report API
      const holidayRes = await apiCalls(
        'get',
        `timesheet/getHolidaysForTimeSheetReport?branchCode=${branchCode}&fromDate=${fromDate}&orgId=${orgId}&toDate=${toDate}`
      );
      const holidayData = holidayRes?.paramObjectsMap?.timeSheetVO || [];

      // Format leave and holiday data like timesheet for display compatibility
      const formattedLeaveData = leaveData.map((item) => ({
        date: item.leaveDate,
        employeeName: empNameFromData || 'LEAVE',
        employeeCode: empCodeFromData || employeeCode,
        totalhours: '',
        timeSheetDetailsVO: [
          {
            projectName: item.leaveType,
            fromTime: '',
            toTime: '',
            description: ''
          }
        ]
      }));

      const formattedHolidayData = holidayData.map((item) => ({
        date: item.leaveDate,
        employeeName: empNameFromData || 'HOLIDAY',
        employeeCode: empCodeFromData || employeeCode,
        totalhours: '',
        timeSheetDetailsVO: [
          {
            projectName: item.leaveType,
            fromTime: '',
            toTime: '',
            description: ''
          }
        ]
      }));

      const combinedData = [...timeSheetData, ...formattedLeaveData, ...formattedHolidayData];

      // Optional: sort by date if needed
      combinedData.sort((a, b) => new Date(a.date) - new Date(b.date));

      setAllTimeSheetData(combinedData);
      setReportDialogOpen(false);
      setReportTableOpen(true);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const handleDownloadExcel = async ({ logo }) => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Task Report');
      sheet.state = 'visible';

      // ====== LOGO ======
      sheet.mergeCells('A1:B5');
      if (logo) {
        try {
          const base64Data = logo.split(',')[1] || logo;
          if (base64Data.length >= 100) {
            const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
            const imageId = workbook.addImage({ base64: base64Data, extension });
            sheet.addImage(imageId, {
              tl: { col: 0, row: 0 },
              ext: { width: 120, height: 80 }
            });
          }
        } catch (err) {
          console.error('Error adding logo:', err);
        }
      }

      // ====== TITLE ======
      sheet.mergeCells('C1:I1');
      const titleCell = sheet.getCell('C1');
      titleCell.value = 'Task Report';
      titleCell.font = { size: 18, bold: true, color: { argb: 'FF34449B' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // ====== METADATA ======
      const metadata = [];
      // metadata.push({ label: 'From Date', value: dayjs(formData.fromDate).format('DD-MM-YYYY') });
      // metadata.push({ label: 'To Date', value: dayjs(formData.toDate).format('DD-MM-YYYY') });
      metadata.push({ label: 'Name', value: allTimeSheetData[0]?.employeeName || 'N/A' });
      metadata.push({ label: 'Code', value: allTimeSheetData[0]?.employeeCode || 'N/A' });
      metadata.push({ label: 'Tot Working Days', value: allTimeSheetData[0]?.totworkingdays });
      metadata.push({ label: 'Leaves Taken', value: allTimeSheetData[0]?.leavestaken });
      // metadata.push({ label: 'Generated By', value: localStorage.getItem('userName') || 'System' });
      // metadata.push({ label: 'Generated On', value: dayjs().format('DD-MM-YYYY HH:mm') });

      metadata.forEach((meta, index) => {
        const rowIndex = (index % 4) + 2;
        const colGroup = Math.floor(index / 4);
        const colStart = 4 + colGroup * 2;
        const row = sheet.getRow(rowIndex);
        row.getCell(colStart).value = meta.label;
        row.getCell(colStart).font = { bold: true };
        row.getCell(colStart + 1).value = meta.value;
      });

      // ====== HEADERS ======
      const headerRowIndex = 6;
      const headerRow = sheet.getRow(headerRowIndex);
      const headers = ['Date', 'Total Hrs', 'Project', 'Screen/Task', 'Description', 'Work IP%', 'Status', 'From', 'To', 'Remarks'];
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34449B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      headerRow.height = 20;

      // ====== DATA ROWS (same as table rendering) ======
      allTimeSheetData.forEach((entry) => {
        const details = entry.timeSheetDetailsVO || [];

        const isLeaveOrHoliday = entry.employeeName === 'LEAVE' || entry.employeeName === 'HOLIDAY';

        if (isLeaveOrHoliday) {
          const row = sheet.addRow([
            `${dayjs(entry.date).format('DD-MM-YYYY')} - ${entry.employeeName} (${details[0]?.projectName || ''})`
          ]);
          // Merge across all 10 columns
          sheet.mergeCells(`A${row.number}:J${row.number}`);
          row.getCell(1).alignment = { horizontal: 'center' };
          row.getCell(1).font = { bold: true, color: { argb: 'FFd32f2f' } };
          return;
        }

        details.forEach((detail, detailIndex) => {
          const row = sheet.addRow([
            detailIndex === 0 ? (entry.date ? dayjs(entry.date).format('DD-MM-YYYY') : '') : '',
            detailIndex === 0 ? entry.totalhours || '-' : '',
            detail.projectName || '',
            detail.project || '',
            detail.description || '',
            detail.wip || '',
            detail.status || '',
            detail.fromTime || '',
            detail.toTime || '',
            detail.remarks || ''
          ]);

          // Apply border to every cell
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      });

      // ====== COLUMN WIDTHS ======
      sheet.columns = [
        { width: 15 }, // Date
        { width: 12 }, // Total Hrs
        { width: 20 }, // Project
        { width: 20 }, // Screen/Task
        { width: 25 }, // Description
        { width: 12 }, // Work IP%
        { width: 15 }, // Status
        { width: 12 }, // From
        { width: 12 }, // To
        { width: 20 } // Remarks
      ];
      // ====== EXPORT ======
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, `Task_Report_${dayjs().format('YYYY_MM_DD_HHmmss')}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      showToast('error', 'Failed to generate Excel file');
    }
  };

  const handleDeleteRow = (index) => {
    const updatedRows = formRows.filter((_, i) => i !== index);
    setFormRows(updatedRows);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...formRows];
    updatedRows[index][field] = value;
    setFormRows(updatedRows);
  };

  useEffect(() => {
    getAllProject();
    getAllSwipeInandOut();
    getCompanyWeekOff();
    getCompanyDetails();
  }, []);
  const renderTimeInputs = (date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    if (weekOff.includes(formatted)) return null;

    const dateKey = date.toDateString();
    const data = timeSheetData[dateKey] || {};

    if (data.status === 'LEAVE') {
      return (
        <div
          style={{
            marginTop: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#b91c1c',
            backgroundColor: '#fee2e2',
            padding: '4px 8px',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        >
          On Leave 🏖️
        </div>
      );
    }

    const formatTime = (timeStr) => {
      if (!timeStr || typeof timeStr !== 'string') return '0:00';
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const [hour, minute] = parts;
        return `${hour}:${minute}`;
      } else {
        return `${timeStr}:00`;
      }
    };

    return (
      <div className="mt-1 text-xs text-left">
        {data.checkIn && (
          <div>
            {formatTime(data.checkIn)}
            {data.checkOut && ` | ${formatTime(data.checkOut)}`}
          </div>
        )}
        <div>Total: {formatTime(data.totalHours)} hrs</div>
      </div>
    );
  };

  const getAllProject = async () => {
    try {
      const result = await apiCalls('get', `master/getProjectMasterByOrgId?orgId=${orgId}`);
      setAllProject(result.paramObjectsMap.projectMasterVO);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };
  const handleDateClick = async (date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    if (weekOff.includes(formatted)) return;

    setSelectedDate(date);

    try {
      const response = await apiCalls('get', `/timesheet/getTimeSheetByOrgId?date=${formatted}&empCode=${employeeCode}&orgId=${orgId}`);

      if (response) {
        const taskVO = response.paramObjectsMap?.timeSheetVO || [];
        const firstEntry = taskVO.length > 0 ? taskVO[0] : null;

        if (firstEntry) {
          setEditId(firstEntry.id); // ✅ store edit id
          setFormRows(
            firstEntry.timeSheetDetailsVO.map((row) => ({
              id: row.id,
              projectName: row.projectName || '',
              screenTask: row.project || '',
              description: row.description || '',
              wip: row.wip || '',
              status: row.status || '',
              fromTime: row.fromTime || '',
              toTime: row.toTime || '',
              remarks: row.remarks || ''
            }))
          );
        } else {
          setEditId(''); // ✅ no data -> keep it empty
          setFormRows([{ projectName: '', screenTask: '', wip: '', status: '', remarks: '', fromTime: '', toTime: '', description: '' }]);
        }
      }

      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      setEditId('');
      setFormRows([{ projectName: '', screenTask: '', wip: '', status: '', remarks: '', fromTime: '', toTime: '', description: '' }]);
      setModalOpen(true);
    }
  };
  // const isCurrentMonth = (date) => {
  //   const now = new Date();
  //   return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  // };

  const handleSubmit = async () => {
    console.log('Edit id submit', editId);

    const errors = {};

    // if (!isCurrentMonth(selectedDate)) {
    //   showToast('error', 'Editing is only allowed for the current month.');
    //   return;
    // }

    if (formRows.length === 0) {
      errors.formRows = 'At least one entry is required';
    } else {
      formRows.forEach((row, index) => {
        if (!row.projectName || !row.fromTime || !row.toTime || !row.description) {
          errors[`row${index}`] = `All fields are required in row ${index + 1}`;
        }
      });
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const formattedDate = dayjs(selectedDate).isValid() ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

      const saveData = {
        ...(editId && { id: editId }),
        active: true,
        branch,
        branchCode,
        createdBy: loginUserName,
        date: formattedDate,
        employeeCode,
        employeeName,
        orgId: parseInt(orgId),
        timeSheetDetailsDTO: formRows.map((row) => ({
          projectName: row.projectName,
          project: row.screenTask,
          description: row.description,
          wip: row.wip,
          status: row.status,
          fromTime: row.fromTime,
          toTime: row.toTime,
          remarks: row.remarks
        }))
      };

      try {
        const response = await apiCalls('put', '/timesheet/createUpdateTask', saveData);

        if (response.status === true) {
          showToast('success', 'TimeSheet submitted successfully');
          setModalOpen(false);
          handleClear();
          setFormRows([{ projectName: '', screenTask: '', wip: '', status: '', remarks: '', fromTime: '', toTime: '', description: '' }]);
          setSelectedDate(null);
        } else {
          const errorMsg = response.paramObjectsMap?.errorMessage || 'TimeSheet submission failed';
          showToast('error', errorMsg);
        }
      } catch (error) {
        console.error('Submission Error:', error);
        showToast('error', 'Something went wrong while submitting');
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast('error', 'Please fill all required fields.');
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleClear = () => {
    setEditId('');
    setSelectedDate(null);
    setModalOpen(false);
    setFormRows([{ projectName: '', screenTask: '', wip: '', status: '', remarks: '', fromTime: '', toTime: '', description: '' }]);
  };

  const getAllSwipeInandOut = async () => {
    setLoading(true);
    try {
      const today = new Date(); // Current date
      // console.log('bbhd', today);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 1st of current month
      // console.log('efeef', startOfMonth);
      const formattedData = {};

      // Loop from startOfMonth to today
      for (let d = new Date(startOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
        const loopDate = new Date(d); // Create a new date instance to avoid mutation
        // console.log('loopDate', loopDate);

        // const loopDateStr = loopDate.toISOString().split('T')[0]; // yyyy-mm-dd format
        const loopDateStr = new Date(loopDate.getTime() - loopDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];

        // console.log('loopDateStr', loopDateStr);

        const response = await apiCalls(
          'get',
          `timesheet/getApprovedLeaveForTimeSheet?date=${loopDateStr}&employeeCode=${userName}&orgId=${orgId}`
        );

        const entries = response?.paramObjectsMap?.timeSheetVO || [];
        const dateKey = loopDate.toDateString();

        if (entries.length > 0) {
          const entry = entries[0];
          if (entry.employeeStatus === 'PRESENT') {
            formattedData[dateKey] = {
              checkIn: entry.checkIn,
              checkOut: entry.checkOut,
              totalHours: entry.totalHours?.trim() || '0:00',
              status: 'PRESENT'
            };
          } else if (entry.employeeStatus === 'LEAVE') {
            formattedData[dateKey] = {
              leave: true,
              status: 'LEAVE'
            };
          }
        }
      }

      setTimeSheetData((prev) => ({ ...prev, ...formattedData }));
    } catch (err) {
      console.error('Error fetching Task entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const isWeekOff = (date) => {
    return weekOff.includes(dayjs(date).format('YYYY-MM-DD'));
  };

  const getCompanyWeekOff = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/company/${orgId}`);
      const weekOffConfig = result.paramObjectsMap.companyVO[0].companyWeekOffVO;

      const currentYear = dayjs().year();
      const startYear = currentYear - 1;
      const endYear = currentYear;

      const offDates = [];

      for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
          for (const config of weekOffConfig) {
            const dayName = config.weekOffDays.toUpperCase();
            const weekNumbers = config.weekNumbers;

            const dayIndex = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].indexOf(dayName);
            if (dayIndex === -1) continue;

            const daysInMonth = dayjs(`${year}-${month + 1}-01`).daysInMonth();
            const matchedDates = [];

            for (let day = 1; day <= daysInMonth; day++) {
              const date = dayjs(`${year}-${month + 1}-${day}`);
              if (date.day() === dayIndex) {
                matchedDates.push(date);
              }
            }

            if (weekNumbers.includes(-1)) {
              matchedDates.forEach((date) => {
                offDates.push(date.format('YYYY-MM-DD'));
              });
            } else {
              for (const weekNumber of weekNumbers) {
                if (weekNumber >= 1 && weekNumber <= matchedDates.length) {
                  const specificDate = matchedDates[weekNumber - 1];
                  if (specificDate) offDates.push(specificDate.format('YYYY-MM-DD'));
                }
              }
            }
          }
        }
      }

      setWeekOff(offDates);
    } catch (error) {
      console.error('Error fetching week off:', error);
    }
  };

  const handleModalClear = () => {
    setFormRows([{ projectName: '', screenTask: '', wip: '', status: '', remarks: '', fromTime: '', toTime: '', description: '' }]);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      formRows
        .map(
          (row) =>
            `Project: ${row.projectName}\nTask: ${row.screenTask}\nWork IP: ${row.wip}\nStatus: ${row.status}\nFrom: ${row.fromTime}\nTo: ${row.toTime}\nDescription: ${row.description}\nRemarks: ${row.remarks}`
        )
        .join('\n\n')
    );
    window.location.href = `whatsapp://send?text=${message}`;
  };
  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      console.log('API Response:', response);
      setListViewData(response.paramObjectsMap.companyVO);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      <div className="row d-flex ml">
        <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
          {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} />
          <ActionButton title="Report" icon={DescriptionTwoToneIcon} onClick={handleReportIconClick} />
        </div>
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="p-6 bg-white rounded-lg shadow-md w-full">
          {/* <Calendar
            onClickDay={(value, e) => {
              const dayName = value.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
              if (!weekOff.includes(dayName)) {
                handleDateClick(value);
              }
            }}
            tileContent={({ date, view }) => (view === 'month' ? renderTimeInputs(date) : null)}
          /> */}
          <Calendar
            onClickDay={(date) => {
              if (!isWeekOff(date)) {
                handleDateClick(date);
              }
            }}
            // tileDisabled={({ date, view }) => view === 'month' && isWeekOff(date)}
            tileContent={({ date, view }) => (view === 'month' ? renderTimeInputs(date) : null)}
            tileClassName={({ date, view }) => {
              if (view === 'month' && isWeekOff(date)) {
                return 'custom-disabled';
              }
              return null;
            }}
          />
          <style>
            {`
                .custom-disabled {
                color: rgba(133, 138, 142, 1);
                  cursor: not-allowed;
                  disabled: true;
                }
              `}
          </style>
        </div>
      </div>

      {modalOpen && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl modal-fullscreen-sm-down">
            <div className="modal-content shadow-xl">
              <div className="modal-header">
                <h5 className="modal-title">Add Entry for {selectedDate.toDateString()}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>

              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '6%' }}>Action</th>
                        <th style={{ width: '12%' }}>Project</th>
                        <th style={{ width: '12%' }}>Screen/Table</th>
                        <th style={{ width: '22%' }}>Description</th>
                        <th style={{ width: '8%' }}>WIP%</th>
                        <th style={{ width: '12%' }}>Status</th>
                        <th style={{ width: '8%' }}>From</th>
                        <th style={{ width: '8%' }}>To</th>
                        <th style={{ width: '22%' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formRows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <button className="btn btn-danger btn-sm w-100" onClick={() => handleDeleteRow(index)}>
                              Delete
                            </button>
                          </td>

                          <td>
                            <select
                              name="projectName"
                              value={row.projectName}
                              onChange={(e) => handleRowChange(index, 'projectName', e.target.value)}
                              className="form-select form-select-sm"
                            >
                              <option value="">Select Project</option>
                              {alProject.map((project) => (
                                <option key={project.id} value={project.projectCode}>
                                  {project.projectCode} - {project.projectName}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <input
                              type="text"
                              value={row.screenTask}
                              onChange={(e) => handleRowChange(index, 'screenTask', e.target.value)}
                              className="form-control form-control-sm"
                              placeholder="Enter Screen/Task"
                            />
                          </td>

                          {/* Description */}
                          <td>
                            <textarea
                              value={row.description}
                              onChange={(e) => {
                                handleRowChange(index, 'description', e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                              }}
                              className="form-control form-control-sm"
                              placeholder="Enter description"
                              style={{
                                resize: 'none',
                                overflow: 'hidden',
                                minHeight: '40px'
                              }}
                              ref={(el) => {
                                if (el) {
                                  el.style.height = 'auto';
                                  el.style.height = `${el.scrollHeight}px`;
                                }
                              }}
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              value={row.wip}
                              onChange={(e) => {
                                let val = e.target.value;
                                if (val === '') {
                                  handleRowChange(index, 'wip', '');
                                } else {
                                  const num = Math.min(Math.max(Number(val), 0), 100);
                                  handleRowChange(index, 'wip', num);
                                }
                              }}
                              className="form-control form-control-sm text-center"
                              placeholder="%"
                              min={0}
                              max={100}
                            />
                          </td>

                          <td>
                            <select
                              value={row.status}
                              onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                              className="form-select form-select-sm"
                            >
                              <option value="">Select status</option>
                              <option value="Yet Start">Yet Start</option>
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Testing">Testing</option>
                              <option value="Done">Done</option>
                              {/* <option value="PCB">PCB</option> */}
                            </select>
                          </td>

                          <td>
                            <input
                              type="time"
                              value={row.fromTime}
                              onChange={(e) => handleRowChange(index, 'fromTime', e.target.value)}
                              className="form-control form-control-sm"
                            />
                          </td>

                          <td>
                            <input
                              type="time"
                              value={row.toTime}
                              onChange={(e) => handleRowChange(index, 'toTime', e.target.value)}
                              className="form-control form-control-sm"
                            />
                          </td>

                          {/* Remarks */}
                          <td>
                            <textarea
                              value={row.remarks}
                              onChange={(e) => {
                                handleRowChange(index, 'remarks', e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                              }}
                              className="form-control form-control-sm"
                              placeholder="Enter remarks"
                              style={{
                                resize: 'none',
                                overflow: 'hidden',
                                minHeight: '40px'
                              }}
                              ref={(el) => {
                                if (el) {
                                  el.style.height = 'auto';
                                  el.style.height = `${el.scrollHeight}px`;
                                }
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-end mt-2">
                  <button className="btn btn-sm btn-success" onClick={handleAddRow}>
                    + Add Row
                  </button>
                </div>
              </div>

              <div className="modal-footer d-flex flex-wrap justify-content-between gap-2">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-warning" onClick={handleModalClear}>
                  Clear
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Save Entry
                </button>
                <Button onClick={handleShareWhatsApp}>
                  <FaWhatsapp style={{ marginRight: '5px' }} />
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <TextField
            label="From Date"
            type="date"
            fullWidth
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.fromDate}
            helperText={errors.fromDate}
            sx={{ mb: 2 }}
          />
          <TextField
            label="To Date"
            type="date"
            fullWidth
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.toDate}
            helperText={errors.toDate}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitReport}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={reportTableOpen} onClose={() => setReportTableOpen(false)} fullWidth maxWidth="xl">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Task Report
            </Typography>
            <IconButton onClick={() => handleDownloadExcel({ logo: listViewData[0]?.companyLogo })} color="primary">
              <DownloadIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {allTimeSheetData.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">
                <strong>Employee Name:</strong> {allTimeSheetData[0]?.employeeName || 'N/A'}
              </Typography>
              <Typography variant="h6">
                <strong>Employee Code:</strong> {allTimeSheetData[0]?.employeeCode || 'N/A'}
              </Typography>
            </Box>
          )}

          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Hours</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Screen/Task</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Work IP%</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>From</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>To</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Remarks</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {allTimeSheetData.length > 0 ? (
                allTimeSheetData.map((entry, index) => {
                  const details = entry.timeSheetDetailsVO || [];

                  const isLeaveOrHoliday = entry.employeeName === 'LEAVE' || entry.employeeName === 'HOLIDAY';

                  if (isLeaveOrHoliday) {
                    return (
                      <TableRow key={`leave-holiday-${index}`}>
                        <TableCell colSpan={6} align="center">
                          <strong>{entry.date}</strong> - <span style={{ color: '#d32f2f' }}>{entry.employeeName}</span> (
                          {details[0]?.projectName || ''})
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return details.map((detail, detailIndex) => (
                    <TableRow key={`${entry.id}-${detail.id}-${detailIndex}`}>
                      {detailIndex === 0 && (
                        <>
                          {/* <TableCell rowSpan={details.length}>{entry.date}</TableCell> */}
                          <TableCell rowSpan={details.length}>{entry.date ? dayjs(entry.date).format('DD/MM/YYYY') : ''}</TableCell>
                          {/* <TableCell rowSpan={details.length}>{entry.date.format(DD-MM-YYYY)}</TableCell> */}
                          <TableCell rowSpan={details.length}>{entry.totalhours}</TableCell>
                        </>
                      )}
                      {detailIndex !== 0 && null}
                      <TableCell style={{ padding: '0px' }}>{detail.projectName}</TableCell>
                      <TableCell style={{ padding: '0px' }}>{detail.project}</TableCell>
                      <TableCell style={{ padding: '0px' }}>{detail.description}</TableCell>
                      <TableCell style={{ padding: '0px' }}>{detail.wip}</TableCell>
                      <TableCell style={{ padding: '0px' }}>{detail.status}</TableCell>
                      <TableCell style={{ padding: '0px' }}>{detail.fromTime}</TableCell>
                      <TableCell style={{ padding: '0px' }}>{detail.toTime}</TableCell>
                      <TableCell style={{ padding: '0px' }}>{detail.remarks}</TableCell>
                    </TableRow>
                  ));
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setReportTableOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default Task;
