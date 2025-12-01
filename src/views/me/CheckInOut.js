import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  TablePagination,
  Modal,
  Box,
  Typography,
  Button,
  MenuItem
} from '@mui/material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';
import emailjs from '@emailjs/browser';
import dayjs from 'dayjs';
import { CircularProgress } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'white',
  p: 4,
  borderRadius: 2,
  boxShadow: 24,
  width: 300
};

const CheckInOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userName] = useState(localStorage.getItem('userName'));
  const [empName, setEmpName] = useState(localStorage.getItem('employeeName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [empCode] = useState(localStorage.getItem('employeeCode'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [listViewData, setListViewData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [reportingPersonMail, setReportingPersonMail] = useState('');
  const [reportingPerson, setReportingPerson] = useState('');
  const [reportingPersonCode, setReportingPersonCode] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [employeeEmail, setEmployeeEmail] = useState('');
  const monthOptions = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month()); // default current month (0-11)

  useEffect(() => {
    getAllSwipeInandOut();
    getReportingPerson();
  }, []);

  useEffect(() => {
    getAllSwipeInandOut(selectedMonth);
  }, [selectedMonth]); // ✅ Added selectedMonth as dependency

  const getAllSwipeInandOut = async (monthIndex = selectedMonth) => {
    setLoading(true);
    try {
      const monthToSend = monthIndex + 1; // Convert 0-based index to 1-based (e.g., May = 5)

      const result = await apiCalls(
        'get',
        `basicmaster/attendance?branch=${branch}&branchCode=${branchCode}&empcode=${empCode}&month=${monthToSend}&orgId=${orgId}`
      );

      if (result?.paramObjectsMap?.Attendance) {
        // ✅ Filter out Holiday and WeekOff records
        const filteredAttendance = result.paramObjectsMap.Attendance.filter(
          item => item.attendancestatus !== "Holiday" && item.attendancestatus !== "WeekOff"
        );

        const transformed = filteredAttendance.map((item) => ({
          ...item,
          date: formatDate(item.entrydate),
          day: getDay(item.entrydate),
          totalWorkingHours: formatHoursOnly(item.grosshours),
          effectiveFrom: formatHoursOnly(item.effectivehours),
          checkInTime: formatTime(item.checkInTime),
          checkOutTime: formatTime(item.checkOutTime)
        }));

        const sorted = transformed.sort((a, b) => new Date(b.entrydate) - new Date(a.entrydate));

        setListViewData(sorted);
        setFilteredData(sorted);
      } else {
        // If no data or empty response, set empty arrays
        setListViewData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getReportingPerson = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `master/getAllEmployeeByOrgIdAndEmployeeCode?employeeCode=${empCode}&orgId=${orgId}`);

      if (result?.paramObjectsMap?.employeeVO?.length) {
        const employee = result.paramObjectsMap.employeeVO[0];
        setReportingPerson(employee?.reportingPerson || '');
        setReportingPersonCode(employee?.reportingPersonCode || '');
        setReportingPersonMail(employee?.reportingPersonEmail || '');
        setEmployeeEmail(employee?.email || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  const getDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '00:00:00') return '00:00';
    const [h, m] = timeStr.split(':');
    return `${h}:${m}`;
  };

  const formatHoursOnly = (timeStr) => {
    if (!timeStr || timeStr === '00:00:00') return '0';
    const [h] = timeStr.split(':');
    return h; // Return only the hour part
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearchText(val);
    const filtered = listViewData.filter(
      (row) => row.date.toLowerCase().includes(val) || row.day.toLowerCase().includes(val) || row.checkInTime.toLowerCase().includes(val)
    );
    setFilteredData(filtered);
    setPage(0);
  };

  const handleCheckInClick = (row) => {
    const now = new Date().toTimeString().slice(0, 5);
    setSelectedRow(row);
    setCheckInTime(row.checkInTime !== '00:00' ? row.checkInTime : now);
    setCheckOutTime(row.checkOutTime || '00:00');
    setCheckInModalOpen(true);
  };

  const handleCheckOutClick = (row) => {
    const now = new Date().toTimeString().slice(0, 5);
    setSelectedRow(row);
    setCheckOutTime(row.checkOutTime !== '00:00' ? row.checkOutTime : now);
    setCheckOutModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedRow) return;

    let formattedDate = '';
    if (selectedRow.date.includes('/')) {
      const [day, month, year] = selectedRow.date.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      formattedDate = selectedRow.date;
    }

    const payload = {
      screenName: 'CHECKINOUT',
      branch: branch,
      branchCode: branchCode,
      date: formattedDate,
      empCode: empCode,
      empName: empName,
      entryTime: checkOutTime,
      notify: reportingPerson,
      notifyCode: reportingPersonCode,
      notifyEmail: reportingPersonMail,
      orgId: orgId
    };

    setIsLoading(true);

    try {
      const response = await apiCalls('put', '/basicmaster/createRequestCheckOut', payload);

      if (response.status === true) {
        const checkInVO = response.paramObjectsMap.checkInVO || {};
        showToast('success', 'Check-out time submitted successfully');

        await sendEmailNotification({
          ...payload,
          ...checkInVO
        });

        const updatedData = listViewData.map((row) => (row.date === selectedRow.date ? { ...row, checkOutTime } : row));
        setListViewData(updatedData);
        setFilteredData(
          updatedData.filter(
            (row) =>
              row.date.toLowerCase().includes(searchText) ||
              row.day.toLowerCase().includes(searchText) ||
              row.checkInTime.toLowerCase().includes(searchText)
          )
        );

        setCheckOutModalOpen(false);
        getAllSwipeInandOut();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Check-out submission failed');
      }
    } catch (error) {
      console.error('Error submitting check-out:', error);
      showToast('error', 'Check-out submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailNotification = async (row) => {
    try {
      const baseURL = 'http://139.5.190.73:8048/pages/confirmationPage/confirmationPage';
      const approveLink = `${baseURL}?id=${row.id}&action=APPROVED&employeeCode=${row.empCode}&actionBy=${empName}&orgId=${orgId}&notifyCode=${reportingPersonCode}&notify=${reportingPerson}&screenName=${row.screenName}&checkInDate=${row.checkInDate}`;
      const rejectLink = `${baseURL}?id=${row.id}&action=REJECTED&employeeCode=${row.empCode}&actionBy=${empName}&orgId=${orgId}&notifyCode=${reportingPersonCode}&notify=${reportingPerson}&screenName=${row.screenName}&checkInDate=${row.checkInDate}`;

      const emailParams = {
        date: row.checkInDate,
        checkInDate: row.checkInDate,
        name: row.notify,
        from_name: empName,
        entryTime: row.entryTime,
        email: reportingPersonMail,
        checkOut_id: row.id,
        approve_link: approveLink,
        reject_link: rejectLink,
        notifyCode: reportingPersonCode,
        notify: reportingPerson,
        screenName: row.screenName
      };

      console.log('Email Params:', emailParams);

      if (!emailParams.email) {
        console.error('Error: Recipient email is missing!');
        showToast('error', 'Recipient email is missing!');
        return;
      }

      await emailjs.send('service_d3c7xso', 'template_0pef9wb', emailParams, 'uMcVJdror6W86lK6z');
      console.log('Email Sent Successfully for', emailParams.email);
    } catch (error) {
      console.error('Email Sending Failed:', error);
      showToast('error', 'Failed to send email notification. Please try again.');
    }
  };

  const handleCheckInSave = async () => {
    if (!selectedRow) return;

    let formattedDate = '';
    if (selectedRow.date.includes('/')) {
      const [day, month, year] = selectedRow.date.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      formattedDate = selectedRow.date;
    }

    const payload = {
      screenName: 'CHECKINOUTADJUSTMENT',
      branch: branch,
      branchCode: branchCode,
      date: formattedDate,
      empCode: empCode,
      empName: empName,
      entryIn: checkInTime,
      email: employeeEmail,
      entryOut: checkOutTime,
      orgId: orgId,
      reportingPersonMail: reportingPersonMail
    };

    setIsLoading(true);

    try {
      const response = await apiCalls('put', '/basicmaster/createCheckInOutAdjustment', payload);

      if (response.status === true) {
        const checkInOutVO = Array.isArray(response.paramObjectsMap.checkInOutAdjustmentVO)
          ? response.paramObjectsMap.checkInOutAdjustmentVO[0]
          : response.paramObjectsMap.checkInOutAdjustmentVO || {};

        showToast('success', 'Check In & out time submitted successfully');

        await sendEmailNotificationForCheckIn({
          ...payload,
          ...checkInOutVO
        });

        const updatedData = listViewData.map((row) => (row.date === selectedRow.date ? { ...row, checkInTime, checkOutTime } : row));

        setListViewData(updatedData);
        setFilteredData(
          updatedData.filter(
            (row) =>
              row.date.toLowerCase().includes(searchText) ||
              row.day.toLowerCase().includes(searchText) ||
              row.checkInTime.toLowerCase().includes(searchText)
          )
        );

        setCheckInModalOpen(false);
        getAllSwipeInandOut();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Check-In/Out submission failed');
      }
    } catch (error) {
      console.error('Error submitting Check-In/Out:', error);
      showToast('error', 'Check-In/Out submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailNotificationForCheckIn = async (row) => {
    try {
      const baseURL = 'http://139.5.190.73:8048/pages/confirmationPage/confirmationPage';
      const approveLink = `${baseURL}?id=${row.id}&action=APPROVED&employeeCode=${row.empCode}&actionBy=${empName}&orgId=${orgId}&notifyCode=${reportingPersonCode}&notify=${reportingPerson}&screenName=${row.screenName}&checkOutDate=${row.checkInDate}`;
      const rejectLink = `${baseURL}?id=${row.id}&action=REJECTED&employeeCode=${row.empCode}&actionBy=${empName}&orgId=${orgId}&notifyCode=${reportingPersonCode}&notify=${reportingPerson}&screenName=${row.screenName}&checkOutDate=${row.checkInDate}`;

      const emailParams = {
        name: row.empName,
        date: row.checkInDate,
        from_name: empName,
        entryTime: row.entryIn,
        exitTime: row.entryOut,
        email: row.reportingPersonMail,
        checkInOut_id: row.id,
        approve_link: approveLink,
        reject_link: rejectLink,
        notifyCode: reportingPersonCode,
        notify: reportingPerson,
        screenName: row.screenName
      };

      console.log('Email Params:', emailParams);

      if (!emailParams.email) {
        console.error('Error: Recipient email is missing!');
        showToast('error', 'Recipient email is missing!');
        return;
      }

      await emailjs.send('service_q42xewl', 'template_pzyd9ue', emailParams, 'yPqDOZm63k5U6JbRJ');
      console.log('Email Sent Successfully for', emailParams.email);
    } catch (error) {
      console.error('Email Sending Failed:', error);
      showToast('error', 'Failed to send email notification. Please try again.');
    }
  };

  const handleMonthChange = (e) => {
    const selected = e.target.value;
    setSelectedMonth(selected);
    getAllSwipeInandOut(selected);
  };

  return (
    <div style={{ padding: 20 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={2} gap={2}>
        {/* Left: Month & Search */}
        <Box display="flex" alignItems="center" gap={2}>
          <TextField select label="Select Month" size="small" value={selectedMonth} onChange={handleMonthChange} sx={{ minWidth: 150 }}>
            {monthOptions.map((month, index) => (
              <MenuItem key={index} value={index}>
                {month}
              </MenuItem>
            ))}
          </TextField>

          <TextField variant="outlined" label="Search" size="small" value={searchText} onChange={handleSearch} />
        </Box>

        {/* Right: Status Legends */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={16} height={16} bgcolor="#4F7942" borderRadius="50%" />
            <span>Approved</span>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={16} height={16} bgcolor="#FFAC1C" borderRadius="50%" />
            <span>Pending</span>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={16} height={16} bgcolor="#EE4B2B" borderRadius="50%" />
            <span>Not Submitted</span>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead
            sx={{
              background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)'
            }}
          >
            <TableRow>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Day</strong>
              </TableCell>
              <TableCell>
                <strong>Check-In</strong>
              </TableCell>
              <TableCell>
                <strong>Check-Out</strong>
              </TableCell>
              <TableCell>
                <strong>Gross Hours</strong>
              </TableCell>
              <TableCell>
                <strong>Effective Hours</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px" width="100%">
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px" width="100%">
                    <Typography variant="h6" color="textSecondary">
                      No attendance records found for the selected month
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.day}</TableCell>

                  {/* Check-In Cell */}
                  <TableCell
                    onClick={() => {
                      if (row.checkInTime === '00:00') {
                        handleCheckInClick(row);
                      } else {
                        handleCheckInClick(row);
                      }
                    }}
                    style={{
                      color:
                        row.checkInTime === '00:00'
                          ? '#EE4B2B'
                          : row.approvalstatus === 'Approved'
                            ? '#154e04ff'
                            : row.approvalstatus === 'Pending'
                              ? '#FFAC1C'
                              : 'black',
                      cursor: row.checkInTime === '00:00' ? 'pointer' : 'default',
                      textDecoration: row.checkInTime === '00:00' ? 'underline' : 'none',
                      fontWeight:
                        row.checkInTime === '00:00' || row.approvalstatus === 'Approved' || row.approvalstatus === 'Pending'
                          ? 'bold'
                          : 'normal'
                    }}
                  >
                    {row.checkInTime === '00:00' ? 'Missing' : row.checkInTime}
                  </TableCell>

                  {/* Check-Out Cell */}
                  <TableCell
                    onClick={() => {
                      if (row.checkOutTime === '00:00') {
                        handleCheckOutClick(row);
                      } else {
                        handleCheckInClick(row);
                      }
                    }}
                    style={{
                      color:
                        row.checkOutTime === '00:00'
                          ? '#EE4B2B'
                          : row.approvalstatus === 'Approved'
                            ? '#154e04ff'
                            : row.approvalstatus === 'Pending'
                              ? '#FFAC1C'
                              : 'black',
                      cursor: row.checkOutTime === '00:00' ? 'pointer' : 'default',
                      textDecoration: row.checkOutTime === '00:00' ? 'underline' : 'none',
                      fontWeight:
                        row.checkOutTime === '00:00' || row.approvalstatus === 'Approved' || row.approvalstatus === 'Pending'
                          ? 'bold'
                          : 'normal'
                    }}
                  >
                    {row.checkOutTime === '00:00' ? 'Missing' : row.checkOutTime}
                  </TableCell>

                  <TableCell>{row.totalWorkingHours}</TableCell>
                  <TableCell>{row.effectiveFrom}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
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
      </TableContainer>

      <Modal open={checkInModalOpen} onClose={() => setCheckInModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" gutterBottom>
            Set Check-In & Check-Out Time
          </Typography>

          <TextField
            type="time"
            label="Check-In Time"
            fullWidth
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ step: 60 }}
          />

          <TextField
            type="time"
            label="Check-Out Time"
            fullWidth
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ step: 60 }}
          />

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleCheckInSave}>
            Save
          </Button>
        </Box>
      </Modal>
      <Modal open={checkOutModalOpen} onClose={() => setCheckOutModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" gutterBottom>
            Set Check-Out Time
          </Typography>

          <TextField
            type="time"
            label="Check-Out Time"
            fullWidth
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ step: 60 }}
          />

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default CheckInOut;