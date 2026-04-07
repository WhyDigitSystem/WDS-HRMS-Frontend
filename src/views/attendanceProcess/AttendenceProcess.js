import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FormControl from '@mui/material/FormControl';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import {
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  Tooltip,
  Typography,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  IconButton
} from '@mui/material';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
// import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import Box from '@mui/material/Box';
import CommonMonthTotalWorkingDays from 'views/basicMaster/CommonMonthTotalWorkingDays';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper,
  Table,
  TableRow,
  TableBody,
  TextField,
  FormHelperText,
  InputAdornment,
  Chip
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import handleSampleFileAttendence from '../../../src/assets/sample-files/Attendance_Process_Sample.xlsx';
import handleSampleFileCheckOut from '../../assets/sample-files/Uploadcheckin_Sample_File.xlsx';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import Autocomplete from '@mui/material/Autocomplete';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';

const AttendenceProcess = () => {
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoLoading, setGoIsLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isPullLoading, setIsPullLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [value, setValue] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCodeQuery, setSearchCodeQuery] = useState('');
  const [uploadFile, setUploadFile] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openMissingDialog, setOpenMissingDialog] = useState(false);
  const [selectedMissingDates, setSelectedMissingDates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTableData, setDialogTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogSearchTerm, setDialogSearchTerm] = useState('');
  const [otConfirmationDialog, setOtConfirmationDialog] = useState(false);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFormData, setDeleteFormData] = useState({
    month: '',
    year: '',
    department: 'All',
    branch: 'All'
  });
  const [deleteFieldErrors, setDeleteFieldErrors] = useState({
    month: '',
    year: '',
    department: '',
    branch: ''
  });
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [pullAttendanceDialog, setPullAttendanceDialog] = useState(false);
  const [pullFormData, setPullFormData] = useState({
    fromDate: null,
    toDate: null
  });
  const [pullFieldErrors, setPullFieldErrors] = useState({
    fromDate: null,
    toDate: null
  });

  // const [isHidden, setIsHidden] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    department: 'All',
    branch: 'All',
    employeeType: 'Employee',
    contractor: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    fromDate: null,
    toDate: null,
    employeeType: '',
    contractor: ''
  });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'employeeName', header: 'Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Code', size: 140 },
    // { accessorKey: 'totalCompanyWorkingDays', header: 'Working Days', size: 140 },
    { accessorKey: 'totalLeave', header: 'Leave', size: 140 },
    { accessorKey: 'empTotalWorkingDays', header: 'Present', size: 140 },
    { accessorKey: 'empSalaryDays', header: 'Salary Days', size: 140 },
    { accessorKey: 'otHours', header: 'otHours', size: 140 },
    { accessorKey: 'lopLeave', header: 'LOP', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [allLeave, setAllLeave] = useState([]);
  const [contractList, setContractList] = useState([]);

  useEffect(() => {
    // getLeaveProcessByOrgId();
    getAllDepartment();
    getAllBranches();
    getAllContractList();
  }, []);

  const getAllLeaveProcess = async () => {
    const errors = {
      fromDate: !formData.fromDate ? 'From Date is required' : '',
      toDate: !formData.toDate ? 'To Date is required' : '',
      department: !formData.department ? 'Department is required' : '',
      branch: !formData.branch ? 'Branch is required' : '',
      employeeType: !formData.employeeType ? 'Employee Type is required' : '',
      contractor: formData.employeeType === 'Contractor' && !formData.contractor ? 'Contractor is required' : ''
    };

    // Check if any errors exist
    if (Object.values(errors).some((error) => error !== '')) {
      setFieldErrors(errors);
      return;
    }

    setGoIsLoading(true);

    try {
      // Build the API URL with all parameters
      let apiUrl = `/checkinout/getLeaveDetailsForAttendanceProcess?branch=${formData.branch}&department=${formData.department}&fromDate=${formData.fromDate}&orgId=${orgId}&toDate=${formData.toDate}&type=${formData.employeeType}`;

      // Add contractor parameter if employee type is Contractor
      if (formData.employeeType === 'Contractor') {
        apiUrl += `&contractor=${formData.contractor}`;
      }

      const response = await apiCalls('get', apiUrl);

      if (response.status === true && Array.isArray(response.paramObjectsMap.attendanceProcessVO)) {
        const processedData = response.paramObjectsMap.attendanceProcessVO.map((item) => ({
          employeeName: item.employeeName,
          employeeCode: item.employeeCode,
          department: item.department,
          branch: item.branch,
          year: item.year,
          month: item.month,
          totalDays: item.totalDays,
          presentDays: item.presentDays,
          absent: item.absent,
          leaves: item.leaves,
          holidays: item.holidays,
          weekOffs: item.weekOffs,
          lop: item.lop,
          salaryDays: item.salaryDays,
          otHours: item.otHours
        }));
        setOriginalTableData(processedData);
        setDialogTableData(processedData);
        setDialogSearchTerm('');
        setSelectedRows([]);
        setDialogOpen(true);
      } else {
        setFieldErrors({
          fromDate: '',
          toDate: '',
          department: '',
          branch: '',
          employeeType: '',
          contractor: ''
        });
        showToast('error', response.paramObjectsMap?.errorMessage || 'No attendance data found');
      }
    } catch (error) {
      setFieldErrors({
        fromDate: '',
        toDate: '',
        department: '',
        branch: '',
        employeeType: '',
        contractor: ''
      });
      showToast('error', 'Failed to fetch attendance details. Please try again later.');
    } finally {
      setGoIsLoading(false);
    }
  };

  const handleDialogSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setDialogSearchTerm(term);

    if (term === '') {
      setDialogTableData(originalTableData);
    } else {
      const filteredData = originalTableData.filter(
        (item) => item.employeeName.toLowerCase().includes(term) || item.employeeCode.toLowerCase().includes(term)
      );
      setDialogTableData(filteredData);
    }
  };

  const isSelected = (employeeCode) => selectedRows.includes(employeeCode);

  const handleClick = (employeeCode) => {
    const selectedIndex = selectedRows.indexOf(employeeCode);
    let newSelected = [...selectedRows];

    if (selectedIndex === -1) {
      newSelected.push(employeeCode);
    } else {
      newSelected.splice(selectedIndex, 1);
    }

    setSelectedRows(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const allCodes = dialogTableData.map((row) => row.employeeCode);
      setSelectedRows(allCodes);
    } else {
      setSelectedRows([]);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      if (allLeave.length > 0) {
        setSelectedRows(allLeave.map((item) => item.employeeCode));
      } else {
        setSelectedRows([]); // reset if no confirmed data
      }
    }
  }, [dialogOpen, allLeave]);

  // const handleAddSelected = () => {
  //   const selectedData = dialogTableData.filter((row) => selectedRows.includes(row.employeeCode));
  //   setAllLeave(selectedData);
  //   setDialogOpen(false);
  // };

  const handleAddSelected = () => {
    // Filter from originalTableData instead of dialogTableData
    const selectedData = originalTableData.filter((row) => selectedRows.includes(row.employeeCode));
    setAllLeave(selectedData);
    setDialogOpen(false);
  };

  const handlePopupCancel = () => {
    setSelectedRows([]);
    setDialogOpen(false);
  };

  const handleDateChange = (name, date) => {
    if (date && dayjs(date).isValid()) {
      const dateString = dayjs(date).format('YYYY-MM-DD'); // Ensure correct format
      setFormData((prev) => ({ ...prev, [name]: dateString }));
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }));
      setFieldErrors((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleClear = () => {
    setFormData({
      fromDate: null,
      toDate: null,
      department: 'All',
      branch: 'All',
      employeeType: 'Employee',
      contractor: ''
    });
    setFieldErrors({
      fromDate: null,
      toDate: null,
      employeeType: '',
      contractor: ''
    });
    setAllLeave([]);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const handleSave = async () => {
  //   const errors = {};

  //   if (!formData.fromDate) {
  //     errors.fromDate = 'From Date is required';
  //   }
  //   if (!formData.toDate) {
  //     errors.toDate = 'To Date is required';
  //   }

  //   if (allLeave.length === 0) {
  //     errors.table = 'No data available in the table. Please add employees before saving.';
  //   }

  //   if (Object.keys(errors).length === 0) {
  //     setOtConfirmationDialog(true);
  //   } else {
  //     setFieldErrors(errors);
  //   }
  // };

  // const handleConfirmedSave = async () => {
  //   setIsSaveLoading(true);
  //   setOtConfirmationDialog(false);

  //   try {
  //     const saveData = allLeave.map((leave) => ({
  //       absent: parseFloat(leave.absent) || 0,
  //       approveBy: '',
  //       approveOn: '',
  //       approveStatus: '',
  //       branch: branch,
  //       branchCode: branchCode,
  //       createdBy: loginUserName,
  //       department: leave.department || '',
  //       empCode: leave.employeeCode || '',
  //       empName: leave.employeeName || '',
  //       finyear: leave.year || '',
  //       holidays: parseFloat(leave.holidays) || 0,
  //       leaves: parseFloat(leave.leaves) || 0,
  //       lop: parseFloat(leave.lop) || 0,
  //       month: parseInt(leave.month) || 0,
  //       orgId: orgId,
  //       present: parseFloat(leave.presentDays) || 0,
  //       salarydays: parseFloat(leave.salaryDays) || 0,
  //       otHours: parseFloat(leave.otHours) || 0,
  //       totalDays: parseFloat(leave.totalDays) || 0,
  //       weekoff: parseFloat(leave.weekOffs) || 0
  //     }));
  //     const response = await apiCalls('put', '/checkinout/createUpdateAttendanceSummary', saveData);

  //     if (response.status === true) {
  //       console.log('Response:', response);

  //       // Ensure correct toast usage
  //       showToast('success', 'Attendance Process created successfully');

  //       handleClear();
  //     } else {
  //       showToast('error', response.paramObjectsMap?.errorMessage || 'Attendance Process creation failed');
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     showToast('error', 'Attendance Process creation failed');
  //   } finally {
  //     setIsSaveLoading(false);
  //   }
  // };

  const handleSave = async () => {
    // Validation checks
    const errors = {};

    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }

    if (allLeave.length === 0) {
      errors.table = 'No data available in the table. Please add employees before saving.';
    }

    // If there are validation errors, show them and stop execution
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return; // Stop the function here if validation fails
    }

    // If validation passes, show confirmation and proceed with save
    setIsSaveLoading(true);

    try {
      const saveData = allLeave.map((leave) => ({
        absent: parseFloat(leave.absent) || 0,
        approveBy: '',
        approveOn: '',
        approveStatus: '',
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        department: leave.department || '',
        empCode: leave.employeeCode || '',
        empName: leave.employeeName || '',
        finyear: leave.year || '',
        holidays: parseFloat(leave.holidays) || 0,
        leaves: parseFloat(leave.leaves) || 0,
        lop: parseFloat(leave.lop) || 0,
        month: parseInt(leave.month) || 0,
        orgId: orgId,
        present: parseFloat(leave.presentDays) || 0,
        salarydays: parseFloat(leave.salaryDays) || 0,
        otHours: parseFloat(leave.otHours) || 0,
        totalDays: parseFloat(leave.totalDays) || 0,
        weekoff: parseFloat(leave.weekOffs) || 0
      }));

      const response = await apiCalls('put', '/checkinout/createUpdateAttendanceSummary', saveData);

      if (response.status === true) {
        console.log('Response:', response);
        showToast('success', 'Attendance Process created successfully');
        handleClear();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Attendance Process creation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Attendance Process creation failed');
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleNavigateToOTApproval = () => {
    // Save current state to localStorage/sessionStorage
    localStorage.setItem(
      'attendanceProcessData',
      JSON.stringify({
        formData,
        allLeave,
        dialogTableData,
        originalTableData
      })
    );

    setOtConfirmationDialog(false);
    navigate('/basicMaster/OverTime', {
      state: { fromAttendanceProcess: true }
    });
  };

  useEffect(() => {
    const savedData = localStorage.getItem('attendanceProcessData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData.formData);
      setAllLeave(parsedData.allLeave);
      setDialogTableData(parsedData.dialogTableData);
      setOriginalTableData(parsedData.originalTableData);

      // Clear the saved data after restoring
      localStorage.removeItem('attendanceProcessData');
    }
  }, []);

  const handleView = () => {
    // setIsHidden(!isHidden);
    setListView(!listView);
    // if (!listView) {
    //   getAllLeaveProcess(); // Fetch data when switching to List View
    // }
    setFieldErrors('');
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleSubmit = async () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
    // getLeaveProcessByOrgId();
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const filteredData = allLeave.filter(
    (row) =>
      row.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      row.employeeCode?.toLowerCase().includes(searchCodeQuery.toLowerCase())
  );
  //
  const getAllBranches = async () => {
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

  const getAllContractList = async () => {
    try {
      const response = await apiCalls('get', `shiftmaster/getAllContractMasterByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        setContractList(response.paramObjectsMap.contractMasterVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setDialogTableData(originalTableData);
    } else {
      const filteredData = originalTableData.filter(
        (item) => item.employeeName.toLowerCase().includes(term) || item.employeeCode.toLowerCase().includes(term)
      );
      setDialogTableData(filteredData);
    }
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);

    // Return dash for zero values
    if (num === 0) return '-';
    if (num === null || num === undefined || num === '0' || num === '0.0' || num === '0.00') {
      return '-';
    }

    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  };

  const handlePullAttendance = () => {
    setPullAttendanceDialog(true);
  };

  const handlePullDateChange = (name, date) => {
    if (date && dayjs(date).isValid()) {
      const dateString = dayjs(date).format('YYYY-MM-DD');
      setPullFormData((prev) => ({ ...prev, [name]: dateString }));
      setPullFieldErrors((prev) => ({ ...prev, [name]: false }));
    } else {
      setPullFormData((prev) => ({ ...prev, [name]: null }));
      setPullFieldErrors((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handlePullSubmit = async () => {
    const errors = {
      fromDate: !pullFormData.fromDate ? 'From Date is required' : '',
      toDate: !pullFormData.toDate ? 'To Date is required' : ''
    };

    if (Object.values(errors).some((error) => error !== '')) {
      setPullFieldErrors(errors);
      return;
    }

    try {
      setIsPullLoading(true);

      // API call to pull attendance (without branch parameter)
      const apiUrl = `/checkinout/createCheckInOutBiometricDevice?createdBy=${loginUserName}&fromDate=${pullFormData.fromDate}&orgId=${orgId}&toDate=${pullFormData.toDate}&branch=${branch}&branchCode=${branchCode}`;

      const response = await apiCalls('put', apiUrl);

      if (response.status === true) {
        showToast('success', `Attendance pulled successfully.`);
        setPullAttendanceDialog(false);
        setPullFormData({
          fromDate: null,
          toDate: null
        });
      } else {
        showToast('error', response.paramObjectsMap?.message || 'Failed to pull attendance');
      }
    } catch (error) {
      console.error('Error pulling attendance:', error);
      showToast('error', 'Error pulling attendance data');
    } finally {
      setIsPullLoading(false);
    }
  };

  const handlePullCancel = () => {
    setPullAttendanceDialog(false);
    setPullFormData({
      fromDate: null,
      toDate: null
    });
    setPullFieldErrors({
      fromDate: null,
      toDate: null
    });
  };

  const handleDeleteAttendance = async () => {
    const errors = {
      month: !deleteFormData.month ? 'Month is required' : '',
      year: !deleteFormData.year ? 'Year is required' : '',
      department: !deleteFormData.department ? 'Department is required' : '',
      branch: !deleteFormData.branch ? 'Branch is required' : ''
    };

    if (Object.values(errors).some((error) => error !== '')) {
      setDeleteFieldErrors(errors);
      return;
    }

    setIsDeleteLoading(true);

    try {
      const apiUrl = `/checkinout/deleteAttendanceSummary?branchCode=${branchCode}&department=${deleteFormData.department}&finYear=${deleteFormData.year}&month=${deleteFormData.month}&orgId=${orgId}`;

      const response = await apiCalls('delete', apiUrl);

      if (response.status === true) {
        // Get the deleted count from response
        const deletedCount = response.paramObjectsMap?.deletedCount || 0;
        const message = response.paramObjectsMap?.message || 'Attendance summary deleted successfully';

        // Show toast with deleted count
        showToast('success', `${message}. ${deletedCount} record(s) deleted.`);

        setDeleteDialogOpen(false);
        // Reset form
        setDeleteFormData({
          month: '',
          year: '',
          department: 'All',
          branch: 'All'
        });
        // Clear the table data after successful deletion
        setAllLeave([]);
        setOriginalTableData([]);
        setDialogTableData([]);
      } else {
        showToast('error', response.paramObjectsMap?.message || 'Failed to delete attendance summary');
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      showToast('error', 'Error deleting attendance data');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    // Reset form when opening dialog
    setDeleteFormData({
      month: '',
      year: '',
      department: 'All',
      branch: 'All'
    });
    setDeleteFieldErrors({
      month: '',
      year: '',
      department: '',
      branch: ''
    });
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteFormData({
      month: '',
      year: '',
      department: 'All',
      branch: 'All'
    });
    setDeleteFieldErrors({
      month: '',
      year: '',
      department: '',
      branch: ''
    });
  };

  const handleDeleteInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteFormData((prev) => ({ ...prev, [name]: value }));
    if (deleteFieldErrors[name]) {
      setDeleteFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={getAllLeaveProcess} /> */}
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} /> */}
            <ActionButton title="Save" icon={SaveIcon} isLoading={isSaveLoading} onClick={handleSave} />
            <ActionButton
              title="Upload"
              icon={UploadIcon}
              isLoading={isLoading}
              onClick={() => {
                setUploadFile({
                  title: 'Upload Attendance Process',
                  apiUrl: '/checkinout/checkInOutUploadExcel',
                  sampleFileDownload: handleSampleFileAttendence,
                  sampleFileName: 'AttendenceProcess Sample File',
                  loginUser: loginUserName
                });
                setUploadOpen(true);
              }}
            />
            <ActionButton
              title="Pull Attendance"
              icon={CloudDownloadIcon} // You might need to import this
              onClick={handlePullAttendance}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{
                  background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  height: '40px',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                    boxShadow: '0px 6px 12px rgba(63, 81, 181, 0.3)'
                  }
                }}
                onClick={() => {
                  setUploadFile({
                    title: 'Upload Check Out',
                    apiUrl: '/leaveprocess/uploadcheckin',
                    sampleFileDownload: handleSampleFileCheckOut,
                    sampleFileName: 'CheckOut Sample File'
                  });
                  setUploadOpen(true);
                }}
              >
                Check In&out
              </Button>

              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteDialogOpen}
                sx={{
                  background: 'linear-gradient(193deg, #d32f2f 30%, #f44336 90%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  height: '40px',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: '0px 4px 8px rgba(211, 47, 47, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(193deg, #b71c1c 30%, #d32f2f 90%)',
                    boxShadow: '0px 6px 12px rgba(211, 47, 47, 0.3)'
                  }
                }}
              >
                Delete
              </Button>
            </Box>

          </div>
        </div>
        {!listView && (
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
                      minDate={dayjs().subtract(1, 'year').startOf('year')} // Start of previous year
                      maxDate={dayjs().endOf('month')} // End of current month (no future)
                      shouldDisableYear={(date) => {
                        const year = date.year();
                        const currentYear = dayjs().year();
                        return year < currentYear - 1 || year > currentYear; // Only allow previous and current year
                      }}
                      shouldDisableMonth={(date) => {
                        const currentDate = dayjs();
                        const currentYear = currentDate.year();
                        const currentMonth = currentDate.month();
                        const dateYear = date.year();
                        const dateMonth = date.month();

                        // If the date is in current year, disable months beyond current month
                        if (dateYear === currentYear && dateMonth > currentMonth) {
                          return true;
                        }
                        return false;
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
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
                      label="To Date"
                      value={formData.toDate ? dayjs(formData.toDate) : null}
                      onChange={(date) => handleDateChange('toDate', date)}
                      format="DD-MM-YYYY"
                      minDate={formData.fromDate ? dayjs(formData.fromDate) : dayjs().subtract(1, 'year').startOf('year')}
                      maxDate={dayjs().endOf('month')} // End of current month (no future)
                      disabled={!formData.fromDate}
                      shouldDisableYear={(date) => {
                        const year = date.year();
                        const currentYear = dayjs().year();
                        return year < currentYear - 1 || year > currentYear; // Only allow previous and current year
                      }}
                      shouldDisableMonth={(date) => {
                        const currentDate = dayjs();
                        const currentYear = currentDate.year();
                        const currentMonth = currentDate.month();
                        const dateYear = date.year();
                        const dateMonth = date.month();

                        // If the date is in current year, disable months beyond current month
                        if (dateYear === currentYear && dateMonth > currentMonth) {
                          return true;
                        }
                        return false;
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.toDate,
                          helperText: fieldErrors.toDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.department}>
                  <InputLabel id="department-label">Department *</InputLabel>
                  <Select
                    labelId="department-label"
                    label="Department *"
                    name="department"
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {departmentList?.map((row) => (
                      <MenuItem key={row.id} value={row.departmentName}>
                        {row.departmentName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.department && <FormHelperText>{fieldErrors.department}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                  <InputLabel id="branch-label">Branch *</InputLabel>
                  <Select
                    labelId="branch-label"
                    label="Branch *"
                    name="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {branchList?.map((row) => (
                      <MenuItem key={row.id} value={row.branch}>
                        {row.branch}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={['Employee']}
                  getOptionLabel={(option) => option}
                  sx={{ width: '100%' }}
                  size="small"
                  value={formData.employeeType}
                  onChange={(event, newValue) => {
                    handleInputChange({ target: { name: 'employeeType', value: newValue || '' } });
                    // if (newValue !== 'Contractor') {
                    //   handleInputChange({ target: { name: 'contractor', value: '' } });
                    // }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Type *"
                      name="employeeType"
                      error={!!fieldErrors.employeeType}
                      helperText={fieldErrors.employeeType}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* {formData.employeeType === 'Contractor' && (
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={contractList}
                    getOptionLabel={(option) => option.contractor || ''}
                    sx={{ width: '100%' }}
                    size="small"
                    value={contractList.find((c) => c.contractor === formData.contractor) || null}
                    onChange={(event, newValue) => {
                      handleInputChange({
                        target: {
                          name: 'contractor',
                          value: newValue ? newValue.contractor : ''
                        }
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Contractor *"
                        name="contractor"
                        error={!!fieldErrors.contractor}
                        helperText={fieldErrors.contractor}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: 40 }
                        }}
                      />
                    )}
                  />
                </div>
              )} */}

              <div className="col-md-1 mb-3">
                <Tooltip title="Add">
                  <Button
                    variant="contained"
                    onClick={getAllLeaveProcess}
                    disabled={isGoLoading} // Disable button when loading
                    sx={{
                      borderRadius: '8px',
                      boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                      textTransform: 'none',
                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                      '&:disabled': {
                        background: '#cccccc' // Optional: change background when disabled
                      }
                    }}
                  >
                    {isGoLoading ? (
                      <CircularProgress size={24} color="inherit" /> // Show loader when loading
                    ) : (
                      'Go'
                    )}
                  </Button>
                </Tooltip>
              </div>
              {/* <div className="col-md-3 mb-3 mt-2">
                {allLeave.length > 0 && allLeave[0] && (
                  <p className="font-weight-bold" style={{ fontSize: '15px' }}>
                    <strong>
                      {dayjs()
                        .month(allLeave[0]?.month - 1)
                        .format('MMMM')}{' '}
                      {allLeave[0]?.year} - working days {allLeave[0]?.totalCompanyWorkingDays}
                    </strong>
                  </p>
                )}
              </div> */}
            </div>

            {uploadOpen && (
              <CommonBulkUpload
                open={uploadOpen}
                handleClose={handleBulkUploadClose}
                dialogTitle="Upload Files"
                uploadText="Browse File"
                onSubmit={handleSubmit}
                sampleFileDownload={uploadFile.sampleFileDownload}
                fileName={uploadFile.sampleFileName}
                downloadText="Download File"
                handleFileUpload={handleFileUpload}
                apiUrl={uploadFile.apiUrl}
                screen="AttendenceProcess"
                loginUser={uploadFile.loginUser}
                includeCreatedBy={uploadFile.includeCreatedBy}
                orgId={orgId}
                showAttendanceProcessing={true}
              />
            )}
            <div className="row">
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <TableContainer component={Paper}>
                              <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                  <TableRow>
                                    <TableCell align='center' sx={{ color: 'white' }}>
                                      <strong>#</strong>
                                    </TableCell>
                                    <TableCell align='center' sx={{ color: 'white' }}>
                                      <strong>Code</strong>
                                    </TableCell>
                                    <TableCell align='center' sx={{ color: 'white' }}>
                                      <strong>Name</strong>
                                    </TableCell>
                                    {/* {formData.branch === 'All' && (
                                      <TableCell>
                                        <strong>Branch</strong>
                                      </TableCell>
                                    )} */}
                                    {formData.department === 'All' && (
                                      <TableCell align='center' sx={{ color: 'white' }}>
                                        <strong>Department</strong>
                                      </TableCell>
                                    )}
                                    <TableCell align='center' sx={{ color: 'white' }}>
                                      <strong>Total Days</strong>
                                    </TableCell>
                                    {/* <TableCell>
                                      <strong>Holidays</strong>
                                    </TableCell>
                                    <TableCell>
                                      <strong>Week Offs</strong>
                                    </TableCell>
                                    <TableCell>
                                      <strong>Leave</strong>
                                    </TableCell>
                                    <TableCell>
                                      <strong>Absent</strong>
                                    </TableCell> */}
                                    <TableCell align='center' sx={{ color: 'white' }}>
                                      <strong>Present</strong>
                                    </TableCell>
                                    {/* <TableCell align='center' sx={{ color: 'white' }}>
                                      <strong>LOP</strong>
                                    </TableCell> */}
                                    {/* <TableCell>
                                      <strong>Paid Days</strong>
                                    </TableCell> */}
                                    <TableCell align='center' sx={{ color: 'white' }}>
                                      <strong>OT Hours</strong>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {filteredData.length > 0 ? (
                                    filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                      <TableRow key={row.employeeCode || index} hover>
                                        <TableCell align='center'>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell align='left'>{row.employeeCode}</TableCell>
                                        <TableCell align='left'>{row.employeeName}</TableCell>
                                        {/* {formData.branch === 'All' && <TableCell>{row.branch}</TableCell>} */}
                                        {formData.department === 'All' && <TableCell align='left'>{row.department}</TableCell>}
                                        <TableCell align='right'>{formatNumber(row.totalDays)}</TableCell>
                                        {/* <TableCell>{formatNumber(row.holidays)}</TableCell>
                                        <TableCell>{formatNumber(row.weekOffs)}</TableCell>
                                        <TableCell>{formatNumber(row.leaves)}</TableCell>
                                        <TableCell>{formatNumber(row.absent)}</TableCell> */}
                                        {/* <TableCell>{formatNumber(row.presentDays)}</TableCell> */}
                                        <TableCell align='right'>{formatNumber(row.salaryDays)}</TableCell>
                                        {/* <TableCell align='right'>{formatNumber(row.lop)}</TableCell> */}
                                        <TableCell align='right'>{formatNumber(row.otHours)}</TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={100} align="center">
                                        No data available
                                      </TableCell>
                                    </TableRow>
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        )}
      </div>
      <Dialog open={errorDialog.open} onClose={() => setErrorDialog({ open: false, message: '' })}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog({ open: false, message: '' })} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMissingDialog}
        onClose={() => setOpenMissingDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(to right, #f0f2f5, #e3f2fd)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            p: 2
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
            color: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          Missing Dates
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {selectedMissingDates.length > 0 ? (
            <ul style={{ paddingLeft: '20px' }}>
              {selectedMissingDates.map((date, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: '8px',
                    color: '#1a237e',
                    fontWeight: 500,
                    background: '#e3f2fd',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    listStyleType: 'disc'
                  }}
                >
                  {date}
                </li>
              ))}
            </ul>
          ) : (
            <Typography color="textSecondary" align="center">
              No missing dates
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenMissingDialog(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2,
              px: 4,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(90deg, #303f9f, #1976d2)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        sx={{ '& .MuiDialog-paper': { overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1000, boxShadow: '0px 2px 4pxGo rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Select Employees</span>
            {/* <TextField
              variant="outlined"
              size="small"
              placeholder="Search by name or code..."
              sx={{ width: '300px' }}
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm === '') {
                  setDialogTableData(originalTableData);
                } else {
                  const filteredData = originalTableData.filter(
                    (item) => item.employeeName.toLowerCase().includes(searchTerm) || item.employeeCode.toLowerCase().includes(searchTerm)
                  );
                  setDialogTableData(filteredData);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            /> */}
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              sx={{ width: '300px' }}
              value={dialogSearchTerm} // Use the dialog-specific search term
              onChange={handleDialogSearch} // Use the new handler
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </div>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, position: 'relative', height: '400px' }}>
          {dialogTableData.length === 0 ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                flexDirection: 'column'
              }}
            >
              <SearchOffIcon fontSize="large" color="disabled" />
              <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                No employees found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search
              </Typography>
            </div>
          ) : (
            <div style={{ position: 'relative', height: '100%' }}>
              <Table stickyHeader sx={{ '& .MuiTable-root': { borderCollapse: 'separate' } }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    {/* <TableCell
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                      padding="checkbox"
                    >
                      <Checkbox
                        indeterminate={selectedRows.length > 0 && selectedRows.length < dialogTableData.length}
                        checked={dialogTableData.length > 0 && selectedRows.length === dialogTableData.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell> */}
                    <TableCell
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                      padding="checkbox"
                    >
                      <Checkbox
                        indeterminate={selectedRows.length > 0 && selectedRows.length < dialogTableData.length}
                        checked={dialogTableData.length > 0 && selectedRows.length === dialogTableData.length}
                        onChange={handleSelectAllClick}
                        sx={{
                          color: '#e9dcdc', // Default color
                          '&.Mui-checked': {
                            color: 'white', // White color when checked
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: 'white', // White color when indeterminate
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align='center' style={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)', color: '#e9dcdc' }}>
                      <strong>Code</strong>
                    </TableCell>
                    <TableCell
                      align='center'
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Name</strong>
                    </TableCell>
                    {/* {formData.branch === 'All' && (
                      <TableCell
                        style={{
                          background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                          color: '#e9dcdc'
                        }}
                      >
                        <strong>Branch</strong>
                      </TableCell>
                    )} */}
                    {formData.department === 'All' && (
                      <TableCell
                        align='center'
                        style={{
                          background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                          color: '#e9dcdc'
                        }}
                      >
                        <strong>Department</strong>
                      </TableCell>
                    )}
                    <TableCell
                      align='center'
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Total</strong>
                    </TableCell>
                    {/* <TableCell
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Holidays</strong>
                    </TableCell>
                    <TableCell
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Week Offs</strong>
                    </TableCell>
                    <TableCell
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Leave</strong>
                    </TableCell>
                    <TableCell
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Absent</strong>
                    </TableCell> */}
                    <TableCell
                      align='center'
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Present</strong>
                    </TableCell>
                    {/* <TableCell
                    align='center'
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>LOP</strong>
                    </TableCell> */}
                    {/* <TableCell
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>Paid Days</strong>
                    </TableCell> */}
                    <TableCell
                      align='center'
                      style={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: '#e9dcdc'
                      }}
                    >
                      <strong>OT Hours</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dialogTableData.map((row) => {
                    const isItemSelected = isSelected(row.employeeCode);
                    return (
                      <TableRow
                        key={row.employeeCode}
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={() => handleClick(row.employeeCode)} />
                        </TableCell>
                        <TableCell align='left'>{row.employeeCode}</TableCell>
                        <TableCell align='left'>{row.employeeName}</TableCell>
                        {/* {formData.branch === 'All' && <TableCell>{row.branch}</TableCell>} */}
                        {formData.department === 'All' && <TableCell align='left'>{row.department}</TableCell>}
                        <TableCell align='right'>{formatNumber(row.totalDays)}</TableCell>
                        {/* <TableCell>{formatNumber(row.holidays)}</TableCell>
                        <TableCell>{formatNumber(row.weekOffs)}</TableCell>
                        <TableCell>{formatNumber(row.leaves)}</TableCell>
                        <TableCell>{formatNumber(row.absent)}</TableCell> */}
                        {/* <TableCell>{formatNumber(row.presentDays)}</TableCell> */}
                        <TableCell align='right'>{formatNumber(row.salaryDays)}</TableCell>
                        {/* <TableCell align='right'>{formatNumber(row.lop)}</TableCell> */}
                        <TableCell align='right'>{formatNumber(row.otHours)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            padding: '16px 24px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="textSecondary">
            {selectedRows.length} / {dialogTableData.length}
          </Typography>
          <div>
            <Button variant="contained" onClick={handleAddSelected} disabled={selectedRows.length === 0}>
              Confirm
            </Button>
            <Button onClick={handlePopupCancel} color="secondary" sx={{ mr: 1 }}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
      {/* <Dialog open={otConfirmationDialog} onClose={() => setOtConfirmationDialog(false)} aria-labelledby="ot-confirmation-dialog">
        <DialogTitle id="ot-confirmation-dialog" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Confirm OT Approval
          <IconButton onClick={() => setOtConfirmationDialog(false)} size="small" sx={{ marginLeft: 'auto' }}>
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Confirm OT Approval Before Attendance.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmedSave} color="primary" autoFocus>
            Yes
          </Button>
          <Button onClick={handleNavigateToOTApproval} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog> */}
      {/* Pull Attendance Dialog */}
      <Dialog open={pullAttendanceDialog} onClose={handlePullCancel} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          Pull Attendance
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <div className="row">
            <div className="col-md-6 mt-3">
              <FormControl fullWidth variant="filled" size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From *"
                    value={pullFormData.fromDate ? dayjs(pullFormData.fromDate) : null}
                    onChange={(date) => handlePullDateChange('fromDate', date)}
                    format="DD-MM-YYYY"
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
                        error: !!pullFieldErrors.fromDate,
                        helperText: pullFieldErrors.fromDate
                      }
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>

            <div className="col-md-6 mt-3">
              <FormControl fullWidth variant="filled" size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To *"
                    value={pullFormData.toDate ? dayjs(pullFormData.toDate) : null}
                    onChange={(date) => handlePullDateChange('toDate', date)}
                    format="DD-MM-YYYY"
                    minDate={pullFormData.fromDate ? dayjs(pullFormData.fromDate) : dayjs().subtract(1, 'year').startOf('year')}
                    maxDate={dayjs().endOf('year')} // End of current year
                    disabled={!pullFormData.fromDate}
                    shouldDisableYear={(date) => {
                      const year = date.year();
                      const currentYear = dayjs().year();
                      return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        error: !!pullFieldErrors.toDate,
                        helperText: pullFieldErrors.toDate
                      }
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handlePullSubmit}
            variant="contained"
            disabled={isPullLoading}
            startIcon={isPullLoading ? <CircularProgress size={16} /> : null}
          >
            {isPullLoading ? 'Pulling...' : 'Pull Data'}
          </Button>
          <Button onClick={handlePullCancel} color="secondary" disabled={isLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: 'linear-gradient(193deg, #d32f2f 30%, #f44336 90%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          Delete Attendance Summary
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <FormControl size="small" variant="outlined" fullWidth error={!!deleteFieldErrors.year}>
                <InputLabel id="year-label">Year *</InputLabel>
                <Select
                  labelId="year-label"
                  label="Year *"
                  name="year"
                  value={deleteFormData.year}
                  onChange={handleDeleteInputChange}
                >
                  <MenuItem value="">Select Year</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2026">2026</MenuItem>
                </Select>
                {deleteFieldErrors.year && <FormHelperText>{deleteFieldErrors.year}</FormHelperText>}
              </FormControl>
            </div>

            <div className="col-md-6 mb-3">
              <FormControl size="small" variant="outlined" fullWidth error={!!deleteFieldErrors.month}>
                <InputLabel id="month-label">Month *</InputLabel>
                <Select
                  labelId="month-label"
                  label="Month *"
                  name="month"
                  value={deleteFormData.month}
                  onChange={handleDeleteInputChange}
                >
                  <MenuItem value="">Select Month</MenuItem>
                  <MenuItem value="1">January</MenuItem>
                  <MenuItem value="2">February</MenuItem>
                  <MenuItem value="3">March</MenuItem>
                  <MenuItem value="4">April</MenuItem>
                  <MenuItem value="5">May</MenuItem>
                  <MenuItem value="6">June</MenuItem>
                  <MenuItem value="7">July</MenuItem>
                  <MenuItem value="8">August</MenuItem>
                  <MenuItem value="9">September</MenuItem>
                  <MenuItem value="10">October</MenuItem>
                  <MenuItem value="11">November</MenuItem>
                  <MenuItem value="12">December</MenuItem>
                </Select>
                {deleteFieldErrors.month && <FormHelperText>{deleteFieldErrors.month}</FormHelperText>}
              </FormControl>
            </div>

            <div className="col-md-6 mb-3">
              <FormControl size="small" variant="outlined" fullWidth error={!!deleteFieldErrors.department}>
                <InputLabel id="delete-department-label">Department *</InputLabel>
                <Select
                  labelId="delete-department-label"
                  label="Department *"
                  name="department"
                  value={deleteFormData.department}
                  onChange={handleDeleteInputChange}
                >
                  <MenuItem value="All">All</MenuItem>
                  {departmentList?.map((row) => (
                    <MenuItem key={row.id} value={row.departmentName}>
                      {row.departmentName}
                    </MenuItem>
                  ))}
                </Select>
                {deleteFieldErrors.department && <FormHelperText>{deleteFieldErrors.department}</FormHelperText>}
              </FormControl>
            </div>

            <div className="col-md-6 mb-3">
              <FormControl size="small" variant="outlined" fullWidth error={!!deleteFieldErrors.branch}>
                <InputLabel id="delete-branch-label">Branch *</InputLabel>
                <Select
                  labelId="delete-branch-label"
                  label="Branch *"
                  name="branch"
                  value={deleteFormData.branch}
                  onChange={handleDeleteInputChange}
                >
                  <MenuItem value="All">All</MenuItem>
                  {branchList?.map((row) => (
                    <MenuItem key={row.id} value={row.branch}>
                      {row.branch}
                    </MenuItem>
                  ))}
                </Select>
                {deleteFieldErrors.branch && <FormHelperText>{deleteFieldErrors.branch}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          <DialogContentText sx={{ mt: 2, color: '#d32f2f' }}>
            Warning: This action will permanently delete the attendance summary for the selected criteria. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteAttendance}
            variant="contained"
            disabled={isDeleteLoading}
            startIcon={isDeleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{
              background: 'linear-gradient(193deg, #d32f2f 30%, #f44336 90%)',
              '&:hover': {
                background: 'linear-gradient(193deg, #b71c1c 30%, #d32f2f 90%)'
              }
            }}
          >
            {isDeleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
          <Button onClick={handleDeleteDialogClose} color="secondary" disabled={isDeleteLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default AttendenceProcess;