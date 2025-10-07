import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
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

const TimeSheet = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [alProject, setAllProject] = useState([]);
  const [timeSheetData, setTimeSheetData] = useState({});
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTableOpen, setReportTableOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [allTimeSheetData, setAllTimeSheetData] = useState([]);
  const [errors, setErrors] = useState({ fromDate: '', toDate: '' });

  const [loading, setLoading] = useState(false);
  const [weekOff, setWeekOff] = useState([]);
  const [formRows, setFormRows] = useState([{ projectName: '', fromTime: '', toTime: '', description: '' }]);
  const handleAddRow = () => {
    setFormRows([...formRows, { projectName: '', fromTime: '', toTime: '', description: '' }]);
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

  const handleDownload = () => {
    const rows = [];

    // Extract employee details from the first working entry
    const firstEntry = allTimeSheetData.find((entry) => entry.employeeName !== 'LEAVE' && entry.employeeName !== 'HOLIDAY');

    const employeeName = firstEntry?.employeeName || '';
    const employeeCode = firstEntry?.employeeCode || '';

    // Add Employee details at the top
    rows.push({ A: `Employee Name: ${employeeName}` });
    rows.push({ A: `Employee Code: ${employeeCode}` });
    rows.push({}); // Empty row for spacing

    // Add the column headers
    rows.push({
      Date: 'Date',
      Project: 'Project',
      'From Time': 'From Time',
      'To Time': 'To Time',
      Description: 'Description',
      'Total Hours': 'Total Hours'
    });

    // Fill in timesheet data
    allTimeSheetData.forEach((entry) => {
      const details = entry.timeSheetDetailsVO || [];

      if (entry.employeeName === 'LEAVE' || entry.employeeName === 'HOLIDAY') {
        rows.push({
          Date: entry.date,
          Project: details[0]?.projectName || '',
          'From Time': '',
          'To Time': '',
          Description: '',
          'Total Hours': ''
        });
      } else {
        details.forEach((detail, index) => {
          rows.push({
            Date: index === 0 ? entry.date : '',
            Project: detail.projectName,
            'From Time': detail.fromTime,
            'To Time': detail.toTime,
            Description: detail.description,
            'Total Hours': index === 0 ? entry.totalhours : ''
          });
        });
      }
    });

    // Create and download the workbook
    const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TimeSheet');

    XLSX.writeFile(workbook, 'TimeSheetReport.xlsx');
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
  }, []);

  // const renderTimeInputs = (date) => {
  //   const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  //   if (weekOff.includes(dayName)) return null;

  //   const dateKey = date.toDateString();
  //   const data = timeSheetData[dateKey] || {};

  //   if (data.status === 'LEAVE') {
  //     return (
  //       <div
  //         style={{
  //           marginTop: '4px',
  //           fontSize: '12px',
  //           fontWeight: 'bold',
  //           color: '#b91c1c',
  //           backgroundColor: '#fee2e2',
  //           padding: '4px 8px',
  //           borderRadius: '4px',
  //           textAlign: 'center'
  //         }}
  //       >
  //         On Leave 🏖️
  //       </div>
  //     );
  //   }

  //   const formatTime = (timeStr) => {
  //     if (!timeStr || typeof timeStr !== 'string') return '0:00';
  //     const parts = timeStr.split(':');
  //     if (parts.length >= 2) {
  //       const [hour, minute] = parts;
  //       return `${hour}:${minute}`;
  //     } else {
  //       return `${timeStr}:00`;
  //     }
  //   };

  //   return (
  //     <div className="mt-1 text-xs text-left">
  //       {data.checkIn && (
  //         <div>
  //           {formatTime(data.checkIn)}
  //           {data.checkOut && ` | ${formatTime(data.checkOut)}`}
  //         </div>
  //       )}
  //       <div>Total: {formatTime(data.totalHours)} hrs</div>
  //     </div>
  //   );
  // };

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

  // const handleDateClick = async (date) => {
  //   const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  //   // Check for week off
  //   if (weekOff.includes(dayName)) return;

  //   const dateKey = date.toDateString();
  //   const timeSheetStatus = timeSheetData[dateKey];

  //   // Check if the selected date is marked as LEAVE
  //   if (timeSheetStatus?.status === 'LEAVE') return;

  //   const formattedDate = dayjs(date).format('YYYY-MM-DD');
  //   setSelectedDate(date);

  //   try {
  //     const response = await apiCalls('get', `/timesheet/getTimeSheetByOrgId?date=${formattedDate}&empCode=${employeeCode}&orgId=${orgId}`);

  //     if (response?.status && response?.paramObjectsMap?.timeSheetVO) {
  //       const allTimeSheetEntries = response.paramObjectsMap.timeSheetVO;

  //       const mergedDetails = allTimeSheetEntries.flatMap((entry) => entry.timeSheetDetailsVO || []);

  //       const formattedRows = mergedDetails.map((item) => ({
  //         projectName: item.projectName || '',
  //         fromTime: item.fromTime || '',
  //         toTime: item.toTime || '',
  //         description: item.description || ''
  //       }));

  //       setFormRows(
  //         formattedRows.length > 0
  //           ? formattedRows
  //           : [
  //               {
  //                 projectName: '',
  //                 fromTime: '',
  //                 toTime: '',
  //                 description: ''
  //               }
  //             ]
  //       );
  //     } else {
  //       setFormRows([
  //         {
  //           projectName: '',
  //           fromTime: '',
  //           toTime: '',
  //           description: ''
  //         }
  //       ]);
  //     }

  //     setModalOpen(true);
  //   } catch (error) {
  //     console.error('Error fetching timesheet:', error);
  //     showToast('error', 'Failed to fetch timesheet data');
  //     setFormRows([
  //       {
  //         projectName: '',
  //         fromTime: '',
  //         toTime: '',
  //         description: ''
  //       }
  //     ]);
  //     setModalOpen(true);
  //   }
  // };

  const handleDateClick = async (date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    if (weekOff.includes(formatted)) return;

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dateKey = date.toDateString();
    const timeSheetStatus = timeSheetData[dateKey];

    if (timeSheetStatus?.status === 'LEAVE') return;

    setSelectedDate(date);

    try {
      const response = await apiCalls('get', `/timesheet/getTimeSheetByOrgId?date=${formatted}&empCode=${employeeCode}&orgId=${orgId}`);

      if (response?.status && response?.paramObjectsMap?.timeSheetVO) {
        const allTimeSheetEntries = response.paramObjectsMap.timeSheetVO;
        const mergedDetails = allTimeSheetEntries.flatMap((entry) => entry.timeSheetDetailsVO || []);

        const formattedRows = mergedDetails.map((item) => ({
          projectName: item.projectName || '',
          fromTime: item.fromTime || '',
          toTime: item.toTime || '',
          description: item.description || ''
        }));

        setFormRows(formattedRows.length > 0 ? formattedRows : [{ projectName: '', fromTime: '', toTime: '', description: '' }]);
      } else {
        setFormRows([{ projectName: '', fromTime: '', toTime: '', description: '' }]);
      }

      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      showToast('error', 'Failed to fetch timesheet data');
      setFormRows([{ projectName: '', fromTime: '', toTime: '', description: '' }]);
      setModalOpen(true);
    }
  };

  const isCurrentMonth = (date) => {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  };

  const handleSubmit = async () => {
    const errors = {};

    if (!isCurrentMonth(selectedDate)) {
      showToast('error', 'Editing is only allowed for the current month.');
      return;
    }

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
        active: true,
        branch,
        branchCode,
        createdBy: loginUserName,
        date: formattedDate,
        employeeCode,
        employeeName,
        orgId: parseInt(orgId),
        timeSheetDetailsDTO: formRows.map((row) => ({
          description: row.description,
          fromTime: row.fromTime,
          projectName: row.projectName,
          toTime: row.toTime
        }))
      };

      try {
        const response = await apiCalls('put', 'timesheet/createUpdateTimeSheet', saveData);

        if (response.status === true) {
          showToast('success', 'TimeSheet submitted successfully');
          setModalOpen(false);
          setFormRows([{ projectName: '', fromTime: '', toTime: '', description: '' }]);
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
    setSelectedDate(null);
    setModalOpen(false);
    setFormRows([
      {
        projectName: '',
        fromTime: '',
        toTime: '',
        description: ''
      }
    ]);
  };

  const getAllSwipeInandOut = async () => {
    setLoading(true);
    try {
      const today = new Date(); // Current date
      console.log('bbhd', today);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 1st of current month
      console.log('efeef', startOfMonth);
      const formattedData = {};

      // Loop from startOfMonth to today
      for (let d = new Date(startOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
        const loopDate = new Date(d); // Create a new date instance to avoid mutation
        console.log('loopDate', loopDate);

        // const loopDateStr = loopDate.toISOString().split('T')[0]; // yyyy-mm-dd format
        const loopDateStr = new Date(loopDate.getTime() - loopDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];

        console.log('loopDateStr', loopDateStr);

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
      console.error('Error fetching time sheet entries:', err);
    } finally {
      setLoading(false);
    }
  };

  // const getCompanyWeekOff = async () => {
  //   try {
  //     const result = await apiCalls('get', `commonmaster/company/${orgId}`);
  //     const weekOffDays = result.paramObjectsMap.companyVO[0].companyWeekOffVO.map((item) => item.weekOffDays.toUpperCase());
  //     setWeekOff(weekOffDays);
  //   } catch (error) {
  //     console.error('Error', error);
  //   }
  // };

  const isWeekOff = (date) => {
    return weekOff.includes(dayjs(date).format('YYYY-MM-DD'));
  };

  // const getCompanyWeekOff = async () => {
  //   try {
  //     const result = await apiCalls('get', `commonmaster/company/${orgId}`);
  //     const weekOffConfig = result.paramObjectsMap.companyVO[0].companyWeekOffVO;

  //     const currentMonth = dayjs().month(); // 0-based (June = 5)
  //     const currentYear = dayjs().year();

  //     const offDates = [];

  //     for (const config of weekOffConfig) {
  //       const dayName = config.weekOffDays.toUpperCase(); // e.g., 'MONDAY'
  //       const weekNumbers = config.weekNumbers; // e.g., [-1] or [1, 3]

  //       const dayIndex = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].indexOf(dayName);
  //       if (dayIndex === -1) continue;

  //       // Get all dates in the current month matching the given weekday
  //       const daysInMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`).daysInMonth();
  //       const matchedDates = [];

  //       for (let day = 1; day <= daysInMonth; day++) {
  //         const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
  //         if (date.day() === dayIndex) {
  //           matchedDates.push(date);
  //         }
  //       }

  //       // Check if -1 is present => all occurrences of that day are off
  //       if (weekNumbers.includes(-1)) {
  //         matchedDates.forEach((date) => {
  //           offDates.push(date.format('YYYY-MM-DD'));
  //         });
  //       } else {
  //         // Only specific week numbers like 1st, 3rd etc.
  //         for (const weekNumber of weekNumbers) {
  //           if (weekNumber >= 1 && weekNumber <= matchedDates.length) {
  //             const specificDate = matchedDates[weekNumber - 1];
  //             if (specificDate) offDates.push(specificDate.format('YYYY-MM-DD'));
  //           }
  //         }
  //       }
  //     }

  //     setWeekOff(offDates); // Example: ['2025-06-01', '2025-06-02', ...]
  //   } catch (error) {
  //     console.error('Error fetching week off:', error);
  //   }
  // };

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
    setFormRows([
      {
        projectName: '',
        fromTime: '',
        toTime: '',
        description: ''
      }
    ]);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      formRows
        .map((row) => `Project: ${row.projectName}\nFrom: ${row.fromTime}\nTo: ${row.toTime}\nDescription: ${row.description}`)
        .join('\n\n')
    );
    window.location.href = `whatsapp://send?text=${message}`;
  };

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      <div className="row d-flex ml">
        <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton
            title="Save"
            icon={SaveIcon}
            isLoading={isLoading}
            // onClick={handleSave}
            // margin="0 10px 0 10px"
          />
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
          <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">Add Entry for {selectedDate.toDateString()}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>

              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Action</th>
                        <th>Project Name</th>
                        <th>From Time</th>
                        <th>To Time</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formRows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteRow(index)}
                              disabled={!isCurrentMonth(selectedDate)}
                            >
                              Delete
                            </button>
                          </td>
                          <td>
                            <select
                              name="projectName"
                              value={row.projectName}
                              onChange={(e) => handleRowChange(index, 'projectName', e.target.value)}
                              className="form-select form-select-sm w-100"
                              disabled={!isCurrentMonth(selectedDate)}
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
                              type="time"
                              value={row.fromTime}
                              onChange={(e) => handleRowChange(index, 'fromTime', e.target.value)}
                              className="form-control form-control-sm"
                              disabled={!isCurrentMonth(selectedDate)}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={row.toTime}
                              onChange={(e) => handleRowChange(index, 'toTime', e.target.value)}
                              className="form-control form-control-sm"
                              disabled={!isCurrentMonth(selectedDate)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                              className="form-control form-control-sm"
                              placeholder="Enter description"
                              disabled={!isCurrentMonth(selectedDate)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-end mt-2">
                  <button className="btn btn-sm btn-success" onClick={handleAddRow} disabled={!isCurrentMonth(selectedDate)}>
                    + Add Row
                  </button>
                </div>
              </div>

              <div className="modal-footer d-flex flex-wrap justify-content-between gap-2">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={!isCurrentMonth(selectedDate)}>
                  Cancel
                </button>
                <button className="btn btn-warning" onClick={handleModalClear} disabled={!isCurrentMonth(selectedDate)}>
                  Clear
                </button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={!isCurrentMonth(selectedDate)}>
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
              Time Sheet Report
            </Typography>
            <IconButton onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {allTimeSheetData.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">
                <strong>Name:</strong> {allTimeSheetData[0]?.employeeName || 'N/A'}
              </Typography>
              <Typography variant="h6">
                <strong>Code:</strong> {allTimeSheetData[0]?.employeeCode || 'N/A'}
              </Typography>
            </Box>
          )}

          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Hours</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>From Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>To Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
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
                          <TableCell rowSpan={details.length}>{entry.date}</TableCell>
                          <TableCell rowSpan={details.length}>{entry.totalhours}</TableCell>
                        </>
                      )}
                      {detailIndex !== 0 && null}
                      <TableCell>{detail.projectName}</TableCell>
                      <TableCell>{detail.fromTime}</TableCell>
                      <TableCell>{detail.toTime}</TableCell>
                      <TableCell>{detail.description}</TableCell>
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

export default TimeSheet;
