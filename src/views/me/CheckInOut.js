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
  width: 350
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
  const [reason, setReason] = useState('');
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [liveTime, setLiveTime] = useState(dayjs().format("HH:mm:ss"));
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
  const [todayStatus, setTodayStatus] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month()); // default current month (0-11)
  const currentYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    getAllSwipeInandOut();
    getReportingPerson();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(dayjs().format("HH:mm:ss"));
    }, 1000); // updates every 1 second

    return () => clearInterval(timer); // cleanup
  }, []);

  useEffect(() => {
    getAllSwipeInandOut(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const getAllSwipeInandOut = async (monthIndex = selectedMonth, year = selectedYear) => {
    setLoading(true);
    try {
      const monthToSend = monthIndex + 1;

      const result = await apiCalls(
        'get',
        `basicmaster/attendance?branch=${branch}&branchCode=${branchCode}&empcode=${empCode}&month=${monthToSend}&finYear=${year}&orgId=${orgId}`
      );

      if (result?.paramObjectsMap?.Attendance) {
        // ✅ Filter out Holiday and WeekOff records
        const filteredAttendance = result.paramObjectsMap.Attendance.filter(
          (item) => item.attendancestatus !== 'Holiday' && item.attendancestatus !== 'WeekOff'
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

  const getTodayStatus = async () => {
    try {
      const res = await apiCalls('get', `basicmaster/chkStatus/${empCode}`);
      const status = res?.paramObjectsMap?.EmployeeStatus?.status; // "In" or "Out"
      setTodayStatus(status);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  useEffect(() => {
    getTodayStatus();
  }, []);

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

  const handleCellClick = (row, type) => {
    const now = new Date().toTimeString().slice(0, 5);
    setSelectedRow(row);
    setReason(''); // Reset reason field

    if (type === 'checkIn') {
      setCheckInTime(row.checkInTime !== '00:00' ? row.checkInTime : now);
      setCheckOutTime(row.checkOutTime !== '00:00' ? row.checkOutTime : '00:00');
    } else if (type === 'checkOut') {
      setCheckInTime(row.checkInTime !== '00:00' ? row.checkInTime : '00:00');
      setCheckOutTime(row.checkOutTime !== '00:00' ? row.checkOutTime : now);
    }

    setCheckInModalOpen(true);
  };

  // const handleSave = async () => {
  //   if (!selectedRow) return;

  //   if (!reason.trim()) {
  //     showToast('error', 'Please provide a reason for this adjustment');
  //     return;
  //   }

  //   let formattedDate = '';
  //   if (selectedRow.date.includes('/')) {
  //     const [day, month, year] = selectedRow.date.split('/');
  //     formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  //   } else {
  //     formattedDate = selectedRow.date;
  //   }

  //   const payload = {
  //     screenName: 'CHECKINOUTADJUSTMENT',
  //     branch: branch,
  //     branchCode: branchCode,
  //     date: formattedDate,
  //     empCode: empCode,
  //     empName: empName,
  //     entryIn: checkInTime,
  //     email: employeeEmail,
  //     entryOut: checkOutTime,
  //     orgId: orgId,
  //     reportingPersonMail: reportingPersonMail,
  //     notify: reportingPerson,
  //     notifyCode: reportingPersonCode,
  //     requestReason: reason // Add reason to payload
  //   };

  //   setIsLoading(true);

  //   try {
  //     const response = await apiCalls('put', '/basicmaster/createCheckInOutAdjustment', payload);

  //     if (response.status === true) {
  //       const checkInOutVO = Array.isArray(response.paramObjectsMap.checkInOutAdjustmentVO)
  //         ? response.paramObjectsMap.checkInOutAdjustmentVO[0]
  //         : response.paramObjectsMap.checkInOutAdjustmentVO || {};

  //       showToast('success', 'Check In & Out time submitted successfully');

  //       await sendEmailNotificationForCheckIn({
  //         ...payload,
  //         ...checkInOutVO
  //       });

  //       const updatedData = listViewData.map((row) => (row.date === selectedRow.date ? { ...row, checkInTime, checkOutTime } : row));

  //       setListViewData(updatedData);
  //       setFilteredData(
  //         updatedData.filter(
  //           (row) =>
  //             row.date.toLowerCase().includes(searchText) ||
  //             row.day.toLowerCase().includes(searchText) ||
  //             row.checkInTime.toLowerCase().includes(searchText)
  //         )
  //       );

  //       setCheckInModalOpen(false);
  //       setReason(''); // Reset reason after save
  //       getAllSwipeInandOut();
  //     } else {
  //       showToast('error', response.paramObjectsMap?.errorMessage || 'Check-In/Out submission failed');
  //     }
  //   } catch (error) {
  //     console.error('Error submitting Check-In/Out:', error);
  //     showToast('error', 'Check-In/Out submission failed');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSave = async () => {
    if (!selectedRow) return;

    if (!reason.trim()) {
      showToast('error', 'Please provide a reason for this adjustment');
      return;
    }

    let formattedDate = '';
    if (selectedRow.date.includes('/')) {
      const [day, month, year] = selectedRow.date.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      formattedDate = selectedRow.date;
    }

    const payload = {
      screenName: 'CHECKINOUTADJUSTMENT',
      branch,
      branchCode,
      date: formattedDate,
      empCode,
      empName,
      entryIn: checkInTime,
      email: employeeEmail,
      entryOut: checkOutTime,
      orgId,
      reportingPersonMail,
      notify: reportingPerson,
      notifyCode: reportingPersonCode,
      requestReason: reason
    };

    setIsLoading(true);

    try {
      const response = await apiCalls(
        'put',
        '/basicmaster/createCheckInOutAdjustment',
        payload
      );

      if (response.status === true) {
        showToast('success', 'Check In & Out time submitted successfully');

        const updatedData = listViewData.map((row) =>
          row.date === selectedRow.date
            ? { ...row, checkInTime, checkOutTime }
            : row
        );

        setListViewData(updatedData);

        setFilteredData(
          updatedData.filter(
            (row) =>
              row.date.toLowerCase().includes(searchText.toLowerCase()) ||
              row.day.toLowerCase().includes(searchText.toLowerCase()) ||
              row.checkInTime.toLowerCase().includes(searchText.toLowerCase())
          )
        );

        setCheckInModalOpen(false);
        setReason('');

        await getAllSwipeInandOut();
      } else {
        showToast(
          'error',
          response.paramObjectsMap?.errorMessage ||
          'Check-In/Out submission failed'
        );
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
        screenName: row.screenName,
        reason: row.reason || reason // Add reason to email parameters
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

  const getWorkingHours = (checkInTime) => {
    const now = dayjs();
    const start = dayjs(checkInTime, "HH:mm");

    const diffMinutes = now.diff(start, "minute");
    const hours = Math.floor(diffMinutes / 60);

    return hours; // simple integer
  };

  return (
    <div style={{ padding: 20 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={2} gap={2}>
        {/* Left: Month & Search */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Month */}
          <TextField
            select
            label="Select Month"
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {monthOptions.map((month, index) => (
              <MenuItem key={index} value={index}>
                {month}
              </MenuItem>
            ))}
          </TextField>

          {/* Year */}
          <TextField
            select
            label="Select Year"
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {yearOptions.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            variant="outlined"
            label="Search"
            size="small"
            value={searchText}
            onChange={handleSearch}
          />
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
              filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                const rowDate = dayjs(row.date, 'DD/MM/YYYY').format('YYYY-MM-DD');
                const today = dayjs().format('YYYY-MM-DD');
                let displayCheckOut;
                let displayWorkingHours;
                let displayEffectiveHours;

                // ----------- TODAY LOGIC -----------
                if (rowDate === today) {
                  if (todayStatus === 'In') {
                    // Checkout
                    displayCheckOut = dayjs().format('HH:mm:ss');

                    // Working hours = now - checkIn
                    displayWorkingHours = getWorkingHours(row.checkInTime);

                    // Effective hours = (same logic as working hours or your rule)
                    displayEffectiveHours = getWorkingHours(row.checkInTime);
                  } else {
                    // Today but already checked out
                    displayCheckOut = row.checkOutTime;
                    displayWorkingHours = row.totalWorkingHours;
                    displayEffectiveHours = row.effectiveFrom;
                  }
                }

                // ----------- PREVIOUS DATE LOGIC -----------
                else {
                  // Checkout
                  displayCheckOut = row.checkOutTime === '00:00' ? 'Missing' : row.checkOutTime;

                  // Working Hours
                  displayWorkingHours = row.totalWorkingHours;

                  // Effective Hours
                  displayEffectiveHours = row.effectiveFrom;
                }
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.day}</TableCell>

                    {/* Check-In Cell */}
                    <TableCell
                      onClick={() => {
                        handleCellClick(row, 'checkIn');
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
                        cursor: 'pointer',
                        textDecoration: 'underline',
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
                        handleCellClick(row, 'checkOut');
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
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight:
                          row.checkOutTime === '00:00' || row.approvalstatus === 'Approved' || row.approvalstatus === 'Pending'
                            ? 'bold'
                            : 'normal'
                      }}
                    >
                      {displayCheckOut}
                    </TableCell>

                    <TableCell>{displayWorkingHours}</TableCell>
                    <TableCell>{displayEffectiveHours}</TableCell>
                  </TableRow>
                );
              })
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

      {/* Single Modal for both Check-In and Check-Out adjustments */}
      <Modal
        open={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: {
              xs: '95vw',
              sm: '85vw',
              md: '550px'
            },
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 18px 45px rgba(15,23,42,0.20)',
            p: 0,
            outline: 'none'
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: 1.2
                }}
              >
                Set Check-In & Check-Out Time
              </Typography>

              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '12px',
                  mt: 0.5
                }}
              >
                Update attendance timing details
              </Typography>
            </Box>

            <Button
              onClick={() => setCheckInModalOpen(false)}
              sx={{
                minWidth: '34px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                color: '#fff',
                fontSize: '18px'
              }}
            >
              ✕
            </Button>
          </Box>

          {/* BODY */}
          <Box
            sx={{
              p: 3,
              background: '#f8fafc'
            }}
          >
            <TextField
              type="time"
              label="Check-In Time"
              fullWidth
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              inputProps={{ step: 60 }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#fff'
                }
              }}
            />

            <TextField
              type="time"
              label="Check-Out Time"
              fullWidth
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              inputProps={{ step: 60 }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#fff'
                }
              }}
            />

            <TextField
              label="Reason for Adjustment"
              fullWidth
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for this time adjustment..."
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#fff'
                }
              }}
            />

            {/* FOOTER BUTTON */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
              disabled={isLoading}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                background:
                  'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                boxShadow: 'none',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #345f61 0%, #223d3f 100%)',
                  boxShadow: 'none'
                }
              }}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default CheckInOut;