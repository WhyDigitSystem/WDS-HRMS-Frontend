import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { Autocomplete } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { FormHelperText, MenuItem } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import emailjs from '@emailjs/browser';
import Select from '@mui/material/Select';

const LeaveRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [department, setDepartment] = useState(localStorage.getItem('department'));
  const [designation, setDesignation] = useState(localStorage.getItem('designation'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [employeeEmail, setEmployeeEmail] = useState(localStorage.getItem('email'));
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [weekOffDays, setWeekOff] = useState([]);
  const [totalLeaveDays, setTotalLeaveDays] = useState([]);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [allReportingPersonList, setAllReportingPersonList] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    leaveTypeCode: '',
    fromDate: null,
    toDate: null,
    selectLeave: '',
    totalDays: '',
    notes: '',
    notify: '',
    notifyEmail: '',
    notifyCode: '',
    compOffDate: null,
    allNotifyPerson: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    leaveType: '',
    fromDate: null,
    toDate: null,
    selectLeave: '',
    totalDays: '',
    notes: '',
    notify: '',
    compOffDate: null,
    allNotifyPerson: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'id', header: 'S.No', size: 140 },
    { accessorKey: 'leaveType', header: 'Leave Type', size: 140 },
    { accessorKey: 'fromDate', header: 'From Date', size: 140 },
    { accessorKey: 'toDate', header: 'To Date', size: 140 },
    { accessorKey: 'totalDays', header: 'Total Days', size: 140 },
    { accessorKey: 'notes', header: 'Notes', size: 140 },
    { accessorKey: 'notify', header: 'Notify', size: 140 },
    { accessorKey: 'approveStatus', header: 'Status', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: ''
  });

  // Function to open the error dialog
  const showErrorDialog = (message) => {
    setErrorDialog({ open: true, message });
  };

  // Function to close the error dialog
  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: '' });
    setFormData((prevData) => ({
      ...prevData,
      toDate: null,
      totalDays: ''
    }));
  };

  useEffect(() => {
    getCompanyWeekOff();
    getLeaveRequestByOrgId();
    getNotifyList();
    getAllReportingPersonList();
    getLeaveType();
  }, [formData.fromDate, formData.toDate, orgId, loginUserName]);

  // List API
  const getLeaveRequestByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/leaveprocess/getLeaveRequestByOrgId?orgId=${orgId}&employeeCode=${employeeCode}`);
      console.log('API Response:', response);

      if (response.status === true) {
        const formattedData = response.paramObjectsMap.leaveRequestVO.map((item) => {
          console.log('Raw fromDate:', item.fromDate);
          console.log('Raw toDate:', item.toDate);

          // Convert fromDate and toDate to Dayjs objects
          const fromDate = item.fromDate && dayjs(item.fromDate, 'YYYY-MM-DD', true).isValid() ? dayjs(item.fromDate) : null;

          const toDate = item.toDate && dayjs(item.toDate, 'YYYY-MM-DD', true).isValid() ? dayjs(item.toDate) : null;

          return { ...item, fromDate, toDate };
        });

        console.log('Formatted Data:', formattedData);
        setListViewData(formattedData);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // getNotifyList
  const getNotifyList = async () => {
    try {
      const result = await apiCalls('get', `employeemaster/getReportingPerson?employeeCode=${loginUserName}&orgId=${orgId}`);

      if (result?.paramObjectsMap?.PermisionRequestVO) {
        const notifyList = result.paramObjectsMap.PermisionRequestVO.map((person) => ({
          reportingPersonCode: person.reportingPersonCode, // Ensure notifyCode is included
          reportingPerson: person.reportingPerson,
          notifyEmail: person.email
        }));

        console.log('🔍 Notify List:', notifyList);
        setCompanyList(notifyList);
      } else {
        console.error('❌ No reporting persons found');
      }
    } catch (error) {
      console.error('❌ Error fetching reporting persons:', error);
    }
  };

  const getLeaveType = async () => {
    try {
      const result = await apiCalls('get', `leaveprocess/getAllLeaveTypeFromLeaveMaster?employeeCode=${employeeCode}&orgId=${orgId}`);

      const formattedLeaveList = result.paramObjectsMap.leaveRequestVO.map((leave) => ({
        ...leave,
        leaveDays: parseFloat(leave.leaveDays).toString()
      }));

      setLeaveTypeList(formattedLeaveList);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const getAllReportingPersonList = async () => {
    try {
      const result = await apiCalls(
        'get',
        `master/getReportingNameForEmployee?branchCode=${branchCode}&employeeCode="Undefined"&orgId=${orgId}`
      );
      const employeeList = result?.paramObjectsMap?.employeeVO || [];
      const mappedList = employeeList.map((emp) => ({
        label: emp.employeeName,
        code: emp.employeeCode,
        email: emp.email,
        role: emp.role
      }));
      setAllReportingPersonList(mappedList);
      console.log('Notify Options:', mappedList);
    } catch (err) {
      console.log('Error fetching notify list', err);
    }
  };

  const getLeaveRequestById = async (row) => {
    console.log('THE SELECTED LEAVE REQUEST ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/leaveprocess/getLeaveRequestById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true && response.paramObjectsMap.leaveRequestVO) {
        const leaveRequestDetails = response.paramObjectsMap.leaveRequestVO;
        const notifyList = leaveRequestDetails.leaveRequestNotifyVO || [];

        console.log('LEAVE REQUEST DETAILS:', leaveRequestDetails);

        const matchedNotifyPersons = allReportingPersonList.filter((person) => notifyList.some((n) => n.notify2Code === person.code));

        setFormData({
          leaveType: leaveRequestDetails.leaveType || '',
          fromDate: leaveRequestDetails.fromDate ? dayjs(leaveRequestDetails.fromDate) : dayjs(),
          toDate: leaveRequestDetails.toDate ? dayjs(leaveRequestDetails.toDate) : dayjs(),
          selectLeave: leaveRequestDetails.selectLeave,
          totalDays: leaveRequestDetails.totalDays,
          notes: leaveRequestDetails.notes || '',
          notify: leaveRequestDetails.notify || '',
          compOffDate: leaveRequestDetails.compOffDate || '',
          allNotifyPerson: matchedNotifyPersons
        });

        setListView(false);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({
      leaveType: '',
      fromDate: null,
      toDate: null,
      selectLeave: '',
      totalDays: '',
      notes: '',
      notify: '',
      compOffDate: null,
      allNotifyPerson: ''
    });

    setFieldErrors({
      leaveType: '',
      fromDate: null,
      toDate: null,
      selectLeave: '',
      totalDays: '',
      notes: '',
      notify: '',
      compOffDate: null,
      allNotifyPerson: ''
    });

    setEditId('');

    setListView(false);
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }
    if (!formData.totalDays) {
      errors.totalDays = 'Total Days is required';
    }
    if (!formData.notes) {
      errors.notes = 'Remarks is required';
    }
    if (!formData.leaveType) {
      errors.leaveType = 'Leave Type is required';
    }
    if (!formData.notify) {
      errors.notify = 'Notify is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const formattedFromDate =
        formData.fromDate && dayjs(formData.fromDate).isValid() ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null;
      const formattedToDate = formData.toDate && dayjs(formData.toDate).isValid() ? dayjs(formData.toDate).format('YYYY-MM-DD') : null;

      const saveData = {
        ...(editId && { id: editId }),
        screenName: 'LEAVE REQUEST',
        leaveType: formData.leaveType,
        leaveCode: formData.leaveTypeCode,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        selectLeave: formData.selectLeave,
        totalDays: formData.totalDays,
        notes: formData.notes,
        notify: formData.notify,
        notifyEmail: formData.notifyEmail,
        notifyCode: formData.notifyCode, // Ensure notifyCode is included here
        compOffDate: formData.compOffDate,
        orgId: orgId,
        branchCode: branchCode,
        branch: branch,
        department: department,
        designation: designation,
        employeeCode: employeeCode,
        employeeName: employeeName,
        email: employeeEmail,
        createdBy: loginUserName,
        leaveRequestNotifyDTO: Array.isArray(formData.allNotifyPerson)
          ? formData.allNotifyPerson.map((item) => ({
              notify2: item.label || '',
              notify2Code: item.code || '',
              notify2Email: item.email || ''
            }))
          : []
      };

      console.log('DATA TO SAVE IS:', saveData);

      try {
        const response = await apiCalls('put', '/leaveprocess/createUpdateLeaveRequest', saveData);

        if (response.status === true) {
          console.log('Response:', response);
          const newId = response.paramObjectsMap.leaveRequestVO?.id;
          console.log('newId', newId);
          if (newId) {
            saveData.id = newId; // 🔁 Add the ID to sendEmailNotification payload
          }
          showToast('success', editId ? 'Leave Request Updated Successfully' : 'Leave Request created successfully');
          await sendEmailNotification([saveData]);
          handleClear();
          getLeaveRequestByOrgId();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Leave Request creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Leave Request creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  // const sendEmailNotification = async (newRows) => {
  //   try {
  //     for (const row of newRows) {
  //       const notify2Emails = (row.leaveRequestNotifyDTO || []).map((p) => p.notify2Email).join(', ');

  //       const emailParams = {
  //         name: row.notify,
  //         from_name: employeeName,
  //         email: row.notifyEmail,
  //         leave_type: row.leaveType,
  //         start_date: dayjs(row.fromDate).format('DD-MM-YYYY'),
  //         end_date: dayjs(row.toDate).format('DD-MM-YYYY'),
  //         total_days: row.totalDays,
  //         notify2Email: notify2Emails,
  //         message: row.notes,
  //         leave_id: row.id,
  //       };

  //       console.log('Email Params:', emailParams);

  //       if (!emailParams.email) {
  //         console.error('Error: Recipient email is missing!');
  //         showToast('error', 'Recipient email is missing!');
  //         continue;
  //       }

  //       await emailjs.send('service_hff8dd7', 'template_bs08toa', emailParams, 'G6cKiPBXzCvlFaOuo');
  //       console.log('Email Sent Successfully for', emailParams.email);
  //     }
  //   } catch (error) {
  //     console.error('Email Sending Failed:', error);
  //     showToast('error', 'Failed to send email notification. Please try again.');
  //   }
  // };

  const sendEmailNotification = async (newRows) => {
    try {
      for (const row of newRows) {
        const notify2Emails = (row.leaveRequestNotifyDTO || []).map((p) => p.notify2Email).join(', ');

        const baseURL = 'http://139.5.190.73:8048/pages/confirmationPage/confirmationPage'; // 🔁 Replace with real backend URL
        const approveLink = `${baseURL}?id=${row.id}&action=APPROVED&employeeCode=${row.employeeCode}&actionBy=${employeeName}&orgId=${orgId}&notifyCode=${row.notifyCode}&notify=${row.notify}&screenName=${row.screenName}`;
        const rejectLink = `${baseURL}?id=${row.id}&action=REJECTED&employeeCode=${row.employeeCode}&actionBy=${employeeName}&orgId=${orgId}&notifyCode=${row.notifyCode}&notify=${row.notify}&screenName=${row.screenName}`;

        const emailParams = {
          name: row.notify,
          from_name: employeeName,
          email: row.notifyEmail,
          leave_type: row.leaveType,
          start_date: dayjs(row.fromDate).format('DD-MM-YYYY'),
          end_date: dayjs(row.toDate).format('DD-MM-YYYY'),
          total_days: row.totalDays,
          notify2Email: notify2Emails,
          message: row.notes || 'N/A',
          leave_id: row.id,
          approve_link: approveLink,
          reject_link: rejectLink,
          notifyCode: row.notifyCode,
          notify: row.notify,
          screenName: row.screenName
        };

        console.log('Email Params:', emailParams);

        if (!emailParams.email) {
          console.error('Error: Recipient email is missing!');
          showToast('error', 'Recipient email is missing!');
          continue;
        }

        // ✅ Send email with EmailJS
        await emailjs.send('service_hff8dd7', 'template_bs08toa', emailParams, 'G6cKiPBXzCvlFaOuo');
        console.log('Email Sent Successfully for', emailParams.email);
      }
    } catch (error) {
      console.error('Email Sending Failed:', error);
      showToast('error', 'Failed to send email notification. Please try again.');
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  // const handleLeaveTypeChange = (event, newValue) => {
  //   if (!newValue) {
  //     setFormData((prevData) => ({ ...prevData, leaveType: '', leaveTypeCode: '', totalDays: 0, effectiveFrom: null }));
  //     return;
  //   }

  //   const selectedLeave = leaveTypeList.find((leave) => leave.leaveType === newValue.leaveType);
  //   if (!selectedLeave) return;

  //   if (selectedLeave.leaveType !== 'LOSS OF PAY' && selectedLeave.leaveDays === '0') {
  //     showErrorDialog(`You don't have leave in ${selectedLeave.leaveType}`);
  //     return;
  //   }

  //   const effectiveFromDate = dayjs(selectedLeave.effectiveFrom);
  //   const today = dayjs();

  //   // Show message only if the effectiveFrom date is in the future
  //   if (effectiveFromDate.isAfter(today)) {
  //     const formattedDate = effectiveFromDate.format('DD-MM-YYYY');
  //     showErrorDialog(`You can take leave for ${selectedLeave.leaveType} from ${formattedDate} onwards only.`);
  //   }

  //   setFormData((prevData) => ({
  //     ...prevData,
  //     leaveType: newValue.leaveType,
  //     leaveTypeCode: selectedLeave.leaveTypeCode,
  //     availableLeaveDays: parseFloat(selectedLeave.leaveDays),
  //     effectiveFrom: selectedLeave.effectiveFrom
  //   }));
  // };

  const handleLeaveTypeChange = (event, newValue) => {
    if (!newValue) {
      setFormData((prevData) => ({ ...prevData, leaveType: '', leaveTypeCode: '', totalDays: 0, effectiveFrom: null }));
      return;
    }

    const selectedLeave = leaveTypeList.find((leave) => leave.leaveType === newValue.leaveType);
    if (!selectedLeave) return;

    // Skip checks if leave type is COMPENSATORY OFF
    if (selectedLeave.leaveType !== 'COMPENSATORY OFF') {
      if (selectedLeave.leaveType !== 'LOSS OF PAY' && selectedLeave.leaveDays === '0') {
        showErrorDialog(`You don't have leave in ${selectedLeave.leaveType}`);
        return;
      }

      const effectiveFromDate = dayjs(selectedLeave.effectiveFrom);
      const today = dayjs();

      if (effectiveFromDate.isAfter(today)) {
        const formattedDate = effectiveFromDate.format('DD-MM-YYYY');
        showErrorDialog(`You can take leave for ${selectedLeave.leaveType} from ${formattedDate} onwards only.`);
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      leaveType: newValue.leaveType,
      leaveTypeCode: selectedLeave.leaveTypeCode,
      availableLeaveDays: parseFloat(selectedLeave.leaveDays),
      effectiveFrom: selectedLeave.effectiveFrom
    }));
  };

  // const handleDateChange = (name, value) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value || null
  //   }));
  // };

  const handleDateChange = (name, value) => {
    const formattedValue = value || null;

    if (name === 'fromDate' && formData.leaveType === 'COMPENSATORY OFF') {
      setFormData((prevData) => ({
        ...prevData,
        fromDate: formattedValue,
        toDate: formattedValue
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedValue
      }));
    }
  };

  // const disableWeekOffDays = (date) => {
  //   const disabledDays = {
  //     SUNDAY: 0,
  //     MONDAY: 1,
  //     TUESDAY: 2,
  //     WEDNESDAY: 3,
  //     THURSDAY: 4,
  //     FRIDAY: 5,
  //     SATURDAY: 6
  //   };

  //   const isWeekOff = weekOffDays.includes(Object.keys(disabledDays).find((day) => disabledDays[day] === date.day()));

  //   const effectiveFromDate = formData.effectiveFrom ? dayjs(formData.effectiveFrom) : null;
  //   const isBeforeEffectiveFrom = effectiveFromDate ? date.isBefore(effectiveFromDate, 'day') : false;

  //   // const sevenDaysAgo = dayjs().subtract(7, 'day');
  //   // const isBefore7Days = date.isBefore(sevenDaysAgo, 'day');

  //   return isWeekOff || isBeforeEffectiveFrom;
  // };

  const disableWeekOffDays = (date) => {
    if (!Array.isArray(weekOffDays)) return false;

    const dayMap = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6
    };

    const day = date.day(); // 0 (Sunday) to 6 (Saturday)
    const dateOfMonth = date.date(); // 1 to 31
    const month = date.month(); // 0 to 11

    const weekOfMonth = Math.ceil(dateOfMonth / 7);
    const isLastWeek = date.add(7, 'day').month() !== month;

    const isWeekOff = weekOffDays.some((item) => {
      const offDay = dayMap[item.weekOffDays];
      const weekNums = item.weekNumbers;

      if (day !== offDay) return false;

      // Case 1: -1 means all Sundays (or all of that day) should be disabled
      if (weekNums.length === 1 && weekNums[0] === -1) return true;

      // Case 2: Disable only specific weeks like 1st, 3rd, etc.
      if (weekNums.includes(weekOfMonth)) return true;

      // Case 3: Disable last week
      if (weekNums.includes(-1) && isLastWeek) return true;

      return false;
    });

    const effectiveFromDate = formData.effectiveFrom ? dayjs(formData.effectiveFrom) : null;
    const isBeforeEffectiveFrom = effectiveFromDate ? date.isBefore(effectiveFromDate, 'day') : false;

    return isWeekOff || isBeforeEffectiveFrom;
  };

  // const getMinSelectableDate = () => {
  //   const sevenDaysAgo = dayjs().subtract(7, 'day');
  //   const effectiveFromDate = formData.effectiveFrom ? dayjs(formData.effectiveFrom) : null;

  //   // Return the later date between sevenDaysAgo and effectiveFrom
  //   if (effectiveFromDate && effectiveFromDate.isAfter(sevenDaysAgo)) {
  //     return effectiveFromDate;
  //   }
  //   return sevenDaysAgo;
  // };

  // const getCompanyWeekOff = async () => {
  //   try {
  //     const result = await apiCalls('get', `commonmaster/company/${orgId}`);
  //     const weekOffDays = result.paramObjectsMap.companyVO[0].companyWeekOffVO.map((item) => item.weekOffDays.toUpperCase());
  //     setWeekOff(weekOffDays);
  //   } catch (error) {
  //     console.error('Error', error);
  //   }
  // };

  const getCompanyWeekOff = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/company/${orgId}`);
      const weekOffData = result.paramObjectsMap.companyVO[0].companyWeekOffVO || [];
      setWeekOff(weekOffData); // Store full objects
    } catch (error) {
      console.error('Error fetching company week off data:', error);
    }
  };

  // const getTotalLeave = async (fromDate, toDate, selectLeave) => {
  //   try {
  //     const formattedFromDate = dayjs(fromDate).format('YYYY-MM-DD');
  //     const formattedToDate = dayjs(toDate).format('YYYY-MM-DD');

  //     const leaveType = dayjs(fromDate).isSame(dayjs(toDate), 'day') ? selectLeave : null;

  //     const result = await apiCalls(
  //       'get',
  //       `leaveprocess/calculateLeavedays?fromDate=${formattedFromDate}&orgId=${orgId}&selectLeave=${leaveType || ''}&toDate=${formattedToDate}`
  //     );

  //     const workingDays = result.workingDays || 0;
  //     const selectedLeave = leaveTypeList.find((leave) => leave.leaveType === formData.leaveType);

  //     if (selectedLeave) {
  //       const availableLeaveDays = parseFloat(selectedLeave.leaveDays);

  //       if (workingDays > availableLeaveDays && formData.leaveType !== 'LOSS OF PAY') {
  //         showErrorDialog(`You have only ${availableLeaveDays} day available for ${formData.leaveType}.`);
  //         setFormData((prevData) => ({
  //           ...prevData,
  //           totalDays: 0
  //         }));
  //         return;
  //       }
  //     }

  //     setFormData((prevData) => ({
  //       ...prevData,
  //       totalDays: workingDays
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching leave data:', error);
  //   }
  // };

  const getTotalLeave = async (fromDate, toDate, selectLeave) => {
    try {
      const formattedFromDate = dayjs(fromDate).format('YYYY-MM-DD');
      const formattedToDate = dayjs(toDate).format('YYYY-MM-DD');

      const leaveType = dayjs(fromDate).isSame(dayjs(toDate), 'day') ? selectLeave : null;

      const result = await apiCalls(
        'get',
        `leaveprocess/calculateLeavedays?fromDate=${formattedFromDate}&orgId=${orgId}&selectLeave=${leaveType || ''}&toDate=${formattedToDate}`
      );

      const workingDays = result.workingDays || 0;
      const selectedLeave = leaveTypeList.find((leave) => leave.leaveType === formData.leaveType);

      if (selectedLeave) {
        const availableLeaveDays = parseFloat(selectedLeave.leaveDays);

        if (workingDays > availableLeaveDays && formData.leaveType !== 'LOSS OF PAY' && formData.leaveType !== 'COMPENSATORY OFF') {
          showErrorDialog(`You have only ${availableLeaveDays} day available for ${formData.leaveType}.`);
          setFormData((prevData) => ({
            ...prevData,
            totalDays: 0
          }));
          return;
        }
      }

      setFormData((prevData) => ({
        ...prevData,
        totalDays: workingDays
      }));
    } catch (error) {
      console.error('Error fetching leave data:', error);
    }
  };

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      if (dayjs(formData.fromDate).isSame(dayjs(formData.toDate), 'day')) {
        getTotalLeave(formData.fromDate, formData.toDate, formData.selectLeave);
      } else {
        getTotalLeave(formData.fromDate, formData.toDate, null);
        setFormData((prevData) => ({
          ...prevData,
          totalDays: 0
        }));
      }
    }
  }, [formData.fromDate, formData.toDate, formData.selectLeave]);

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={false}
              toEdit={getLeaveRequestById}
              // enableEditing={false}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={leaveTypeList}
                  getOptionLabel={(option) => option.leaveType || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={leaveTypeList.find((c) => c.leaveType === formData?.leaveType) || null}
                  onChange={handleLeaveTypeChange} // Use new function for validation
                  renderOption={(props, option) => {
                    let textColor = '#888';
                    if (option.leaveDays === '0') textColor = 'red';
                    else if (parseInt(option.leaveDays) > 5) textColor = 'green';
                    else textColor = 'orange';

                    return (
                      <li {...props} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{option.leaveType}</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: textColor }}>{option.leaveDays} Days</span>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Leave Type"
                      name="leaveType"
                      error={Boolean(fieldErrors?.leaveType)}
                      helperText={fieldErrors?.leaveType || ''}
                      InputProps={{ ...params.InputProps, style: { height: 40 } }}
                    />
                  )}
                />
              </div>

              {/* From Date */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {formData.leaveType ? (
                      <DatePicker
                        label="From Date"
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        value={formData.fromDate || null}
                        onChange={(newValue) => handleDateChange('fromDate', newValue)}
                        shouldDisableDate={disableWeekOffDays}
                        // minDate={formData.effectiveFrom ? dayjs(formData.effectiveFrom) : null} // Prevent selecting dates before effectiveFrom
                        // minDate={getMinSelectableDate()}
                      />
                    ) : (
                      <TextField label="From Date" size="small" value="" placeholder="Select Leave Type First" disabled />
                    )}
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* To Date */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {formData.leaveType ? ( // Render DatePicker only if leaveType is selected
                      <DatePicker
                        label="To Date"
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        value={formData.toDate || null}
                        onChange={(newValue) => handleDateChange('toDate', newValue)}
                        shouldDisableDate={disableWeekOffDays}
                        minDate={formData.fromDate ? dayjs(formData.fromDate) : null}
                      />
                    ) : (
                      <TextField label="To Date" size="small" value="" placeholder="Select Leave Type First" disabled />
                    )}
                  </LocalizationProvider>
                </FormControl>
              </div>

              {formData.fromDate && formData.toDate && dayjs(formData.fromDate).isSame(dayjs(formData.toDate), 'day') && (
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.selectLeave}>
                    <InputLabel id="selectLeave">Select Leave</InputLabel>
                    <Select
                      labelId="selectLeave"
                      id="selectLeave"
                      name="selectLeave"
                      value={formData.selectLeave || ''}
                      onChange={handleInputChange}
                      label="Select Leave"
                    >
                      <MenuItem value="HALF DAY">HALF DAY</MenuItem>
                      {/* <MenuItem value="SECOND HALF">2nd Half</MenuItem> */}
                      <MenuItem value="ALL DAY">ALL DAY</MenuItem>
                    </Select>
                    {fieldErrors.selectLeave && <FormHelperText>{fieldErrors.selectLeave}</FormHelperText>}
                  </FormControl>
                </div>
              )}

              {/* Total Days */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Days"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.totalDays}
                  error={!!fieldErrors.totalDays}
                  helperText={fieldErrors.totalDays}
                  disabled
                />
              </div>

              {/* Notes */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Remarks"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  error={!!fieldErrors.notes}
                  helperText={fieldErrors.notes}
                />
              </div>

              {/* notify */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={companyList}
                  getOptionLabel={(option) => option.reportingPerson || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={companyList.find((c) => c.reportingPerson === formData.notify) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      handleInputChange({
                        target: { name: 'notify', value: newValue.reportingPerson }
                      });
                      handleInputChange({
                        target: { name: 'notifyCode', value: newValue.reportingPersonCode }
                      });
                      handleInputChange({
                        target: { name: 'notifyEmail', value: newValue.notifyEmail }
                      });
                    } else {
                      handleInputChange({
                        target: { name: 'notify', value: '' }
                      });
                      handleInputChange({
                        target: { name: 'notifyCode', value: '' }
                      });
                      handleInputChange({
                        target: { name: 'notifyEmail', value: '' }
                      });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Notify"
                      name="notify"
                      error={Boolean(fieldErrors.notify)}
                      helperText={fieldErrors.notify || ''}
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
                  multiple
                  disableCloseOnSelect
                  options={allReportingPersonList}
                  getOptionLabel={(option) => option.label || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={
                    Array.isArray(formData.allNotifyPerson)
                      ? allReportingPersonList.filter((person) =>
                          formData.allNotifyPerson.some((selected) => selected.code === person.code)
                        )
                      : []
                  }
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: 'allNotifyPerson',
                        value: newValue
                      }
                    });

                    // If you need separate fields like notifyCode & notifyEmail as arrays:
                    handleInputChange({
                      target: {
                        name: 'notify2Code',
                        value: newValue.map((item) => item.code)
                      }
                    });
                    handleInputChange({
                      target: {
                        name: 'notify2Email',
                        value: newValue.map((item) => item.email)
                      }
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="All Notify Person"
                      name="allNotifyPerson"
                      error={Boolean(fieldErrors.allNotifyPerson)}
                      helperText={fieldErrors.allNotifyPerson || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {formData.leaveType?.toUpperCase() === 'COMPENSATORY OFF' && (
                      <DatePicker
                        label="Compensatory Off Date"
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        value={formData.compOffDate || null}
                        onChange={(newValue) => handleDateChange('compOffDate', newValue)}
                      />
                    )}
                  </LocalizationProvider>
                </FormControl>
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
      <Dialog open={errorDialog.open} onClose={handleCloseErrorDialog}>
        <DialogTitle style={{ color: 'red' }}>⚠ Leave Request Error</DialogTitle>
        <DialogContent>
          <Typography>{errorDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default LeaveRequest;
