// import ClearIcon from '@mui/icons-material/Clear';
// import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
// import SaveIcon from '@mui/icons-material/Save';
// import SearchIcon from '@mui/icons-material/Search';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import Select from '@mui/material/Select';
// import apiCalls from 'apicall';
// import { useState, useEffect } from 'react';
// import 'react-tabs/style/react-tabs.css';
// import { ToastContainer } from 'react-toastify';
// import dayjs from 'dayjs';
// import 'react-toastify/dist/ReactToastify.css';
// import ActionButton from 'utils/ActionButton';
// import { showToast } from 'utils/toast-component';
// import { MenuItem } from '@mui/material';
// import { FormControlLabel, FormHelperText } from '@mui/material';
// import { TableCell, TableContainer, TableHead, TablePagination, Tooltip, Typography, Checkbox, IconButton } from '@mui/material';
// import SearchOffIcon from '@mui/icons-material/SearchOff';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Button,
//   Paper,
//   Table,
//   TableRow,
//   TableBody,
//   TextField,
//   InputAdornment
// } from '@mui/material';
// import Autocomplete from '@mui/material/Autocomplete';
// import { CircularProgress } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// const currentYear = new Date().getFullYear();
// const currentMonth = new Date().getMonth() + 1; // January is 1
// const years = Array.from({ length: 2 }, (_, index) => currentYear - index);

// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// };

// const SalaryProcess = () => {
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isGoLoading, setGoIsLoading] = useState(false);
//   const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
//   const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
//   const [branch, setBranch] = useState(localStorage.getItem('branch'));
//   const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [formData, setFormData] = useState({ month: '', year: '', branch: 'ALL', departmentName: 'ALL', employeeType: '', contractor: '' });
//   const [fieldErrors, setFieldErrors] = useState({ month: '', year: '', branch: '', departmentName: '', employeeType: '', contractor: '' });
//   const [allSalary, setAllSalary] = useState([]);
//   const [showSelectedMonthYear, setShowSelectedMonthYear] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState({});
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [mainTableData, setMainTableData] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [branchList, setBranchList] = useState([]);
//   const [departmentList, setDepartmentList] = useState([]);
//   const [contractList, setContractList] = useState([]);
//   const [formResetKey, setFormResetKey] = useState(0);
//   const [originalSalary, setOriginalSalary] = useState([]);
//   const [isDataLoading, setIsDataLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const debouncedSearchTerm = useDebounce(searchTerm, 300);
//   const [otConfirmationDialog, setOtConfirmationDialog] = useState(false);
//   const navigate = useNavigate();
//   const [availableYearsMonths, setAvailableYearsMonths] = useState([]);
//   const [years, setYears] = useState([]);
//   const [availableMonths, setAvailableMonths] = useState([]);

//   useEffect(() => {
//     fetchYearsAndMonths();
//   }, []);

//   const fetchYearsAndMonths = async () => {
//     try {
//       const response = await apiCalls('get', `employeemaster/getYearAndMonth?orgId=${orgId}`);

//       if (response.status === true && Array.isArray(response.paramObjectsMap.yearMonth)) {
//         const yearMonthData = response.paramObjectsMap.yearMonth;
//         setAvailableYearsMonths(yearMonthData);

//         // Extract unique years and sort in ascending order
//         const uniqueYears = [...new Set(yearMonthData.map(item => item.year))]
//           .sort((a, b) => parseInt(a) - parseInt(b));
//         setYears(uniqueYears);

//         // Set initial year and available months
//         if (uniqueYears.length > 0) {
//           const initialYear = uniqueYears[0];
//           setFormData(prev => ({ ...prev, year: initialYear }));
//           updateAvailableMonths(initialYear);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching years and months:', error);
//       showToast('error', 'Error fetching available months and years');
//     }
//   };

//   const updateAvailableMonths = (selectedYear) => {
//     const monthsForYear = availableYearsMonths
//       .filter(item => item.year === selectedYear)
//       .map(item => ({
//         value: item.month,
//         name: getMonthName(item.month)
//       }))
//       .sort((a, b) => parseInt(a.value) - parseInt(b.value)); // Sort months in ascending order

//     setAvailableMonths(monthsForYear);

//     // Auto-select first month if available
//     if (monthsForYear.length > 0) {
//       setSelectedMonth(monthsForYear[0].name);
//       setFormData(prev => ({ ...prev, month: monthsForYear[0].value }));
//     } else {
//       setSelectedMonth('');
//       setFormData(prev => ({ ...prev, month: '' }));
//     }
//   };

//   const getMonthName = (monthNumber) => {
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return monthNames[parseInt(monthNumber) - 1] || '';
//   };

//   // Update year change handler
//   const handleYearChange = (e) => {
//     const selectedYear = e.target.value;
//     setFormData(prev => ({ ...prev, year: selectedYear }));
//     updateAvailableMonths(selectedYear);
//     setFieldErrors(prev => ({ ...prev, year: '' }));
//   };

//   // Update month change handler
//   const handleMonthChange = (event) => {
//     const selected = availableMonths.find((m) => m.name === event.target.value);
//     setSelectedMonth(selected?.name || '');
//     setFormData(prev => ({ ...prev, month: selected?.value || '' }));
//     setFieldErrors(prev => ({ ...prev, month: '' }));
//   };

//   useEffect(() => {
//     if (debouncedSearchTerm === '') {
//       setAllSalary(originalSalary);
//     } else {
//       const filteredData = originalSalary.filter(
//         (item) =>
//           item.employeeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//           item.employeeCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
//       );
//       setAllSalary(filteredData);
//     }
//   }, [debouncedSearchTerm, originalSalary]);

//   useEffect(() => {
//     getAllBranch();
//     getAllDepartment();
//     getAllContractList();
//   }, []);

//   // const handleMonthChange = (event) => {
//   //   const selected = months.find((m) => m.name === event.target.value);
//   //   setSelectedMonth(selected?.name || ''); // For display
//   //   setFormData((prev) => ({ ...prev, month: selected?.value || '' })); // For API
//   //   setFieldErrors((prev) => ({ ...prev, month: '' })); // Clear month error
//   // };

//   const getAllSalaryProcess = async () => {
//     try {
//       // Build the base URL
//       let apiUrl = `employeemaster/getLeaveDetailsforSalaryProcess?month=${formData.month}&orgId=${orgId}&year=${formData.year}&branch=${formData.branch}&department=${formData.departmentName}`;

//       // Add employee type parameter
//       apiUrl += `&type=${formData.employeeType}`;

//       // Add contractor parameter if employee type is Contractor
//       if (formData.employeeType === 'Contractor' && formData.contractor) {
//         apiUrl += `&contractor=${formData.contractor}`;
//       }

//       setGoIsLoading(true);
//       setIsDataLoading(true);

//       const response = await apiCalls('get', apiUrl);

//       setShowSelectedMonthYear(true);

//       if (response.status === true && Array.isArray(response.paramObjectsMap.salaryProcessVO)) {
//         const salaryData = response.paramObjectsMap.salaryProcessVO.map((employee) => ({
//           ...employee,
//           totalLeave: parseFloat(employee.totalLeave).toString(),
//           totalCompanyWorkingDays: parseFloat(employee.totalCompanyWorkingDays).toString(),
//           lopLeave: parseFloat(employee.lopLeave).toString(),
//           empSalaryDays: parseFloat(employee.empSalaryDays).toString(),
//           empTotalWorkingDays: parseFloat(employee.empTotalWorkingDays).toString(),
//           // Initialize calculated fields as loading
//           totalEarnings: 'Loading...',
//           totalDeductions: 'Loading...',
//           pfAmount: 'Loading...',
//           esiAmount: 'Loading...',
//           bankAmount: 'Loading...',
//           cashAmount: 'Loading...',
//           cashAdvance: 'Loading...',
//           bankAdvance: 'Loading...',
//           bankOtAmount: 'Loading...'
//         }));

//         setAllSalary(salaryData);
//         setOriginalSalary(salaryData);
//         setDialogOpen(true);

//         // Now call fetchBankCashSalaries with the data
//         await fetchBankCashSalaries(salaryData);
//       } else {
//         console.error('API Error:', response);
//         showToast('error', 'Failed to fetch salary data');
//       }
//     } catch (error) {
//       console.error('Error fetching leave data:', error);
//       showToast('error', 'Error fetching salary data');
//     } finally {
//       setGoIsLoading(false);
//     }
//   };

//   const handleGetSalaryProcess = () => {
//     const errors = {};

//     if (!selectedMonth) {
//       errors.month = 'Month is required';
//     }

//     if (!formData.year) {
//       errors.year = 'Year is required';
//     }

//     if (!formData.employeeType) {
//       errors.employeeType = 'Employee Type is required';
//     }

//     // Add validation for contractor when employee type is Contractor
//     if (formData.employeeType === 'Contractor' && !formData.contractor) {
//       errors.contractor = 'Contractor is required';
//     }

//     setFieldErrors(errors);

//     if (Object.keys(errors).length === 0) {
//       getAllSalaryProcess();
//     }
//   };

//   const handleSelectChange = (e) => {
//     const { name, value } = e.target;

//     if (value === 'ALL') {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: 'ALL'
//       }));

//       setFieldErrors((prev) => ({
//         ...prev,
//         [name]: ''
//       }));
//       return;
//     }

//     if (name === 'branch') {
//       const selectedBranch = branchList.find((b) => b.branch === value);
//       if (selectedBranch) {
//         setFormData((prev) => ({
//           ...prev,
//           branch: selectedBranch.branch
//         }));
//         setFieldErrors((prev) => ({
//           ...prev,
//           branch: ''
//         }));
//       }
//     }

//     if (name === 'departmentName') {
//       const selectedDepartment = departmentList.find((d) => d.departmentName === value);
//       if (selectedDepartment) {
//         setFormData((prev) => ({
//           ...prev,
//           departmentName: selectedDepartment.departmentName
//         }));
//         setFieldErrors((prev) => ({
//           ...prev,
//           departmentName: ''
//         }));
//       }
//     }
//   };

//   const fetchBankCashSalaries = async (salaryData) => {
//     try {
//       setIsDataLoading(true);

//       const updatedData = await Promise.all(
//         salaryData.map(async (employee) => {
//           try {
//             // Get Bank/Cash amounts from API (which now includes PF/ESI)
//             const bankCashData = await getBankCashAmounts(employee);

//             return {
//               ...employee,
//               totalEarnings: bankCashData.totalEarnings === 'Pending' ? 'Pending' : parseFloat(bankCashData.totalEarnings).toFixed(2),
//               totalDeductions: bankCashData.totalDeductions === 'Pending' ? 'Pending' : parseFloat(bankCashData.totalDeductions).toFixed(2),
//               // Use PF/ESI from the same API response
//               pfAmount: bankCashData.pfAmount === 'Pending' ? 'Pending' : parseFloat(bankCashData.pfAmount).toFixed(2),
//               esiAmount: bankCashData.esiAmount === 'Pending' ? 'Pending' : parseFloat(bankCashData.esiAmount).toFixed(2),
//               // Add bank/cash fields
//               bankAmount: bankCashData.bankAmount || '0.00',
//               cashAmount: bankCashData.cashAmount || '0.00',
//               cashAdvance: bankCashData.cashAdvance || '0.00',
//               bankAdvance: bankCashData.bankAdvance || '0.00',
//               bankOtAmount: bankCashData.bankOtAmount || '0.00'
//             };
//           } catch (error) {
//             console.error(`Error processing employee ${employee.employeeCode}:`, error);
//             return {
//               ...employee,
//               totalEarnings: 'Error',
//               totalDeductions: 'Error',
//               pfAmount: 'Error',
//               esiAmount: 'Error',
//               bankAmount: 'Error',
//               cashAmount: 'Error',
//               cashAdvance: 'Error',
//               bankAdvance: 'Error',
//               bankOtAmount: 'Error'
//             };
//           }
//         })
//       );

//       setAllSalary(updatedData);
//       setOriginalSalary(updatedData);
//     } catch (error) {
//       console.error('Error building full salary data:', error);
//       showToast('error', 'Error calculating salary details');
//     } finally {
//       setIsDataLoading(false);
//     }
//   };

//   const getBankCashAmounts = async (employee) => {
//     try {
//       const response = await apiCalls(
//         'get',
//         `employeemaster/getBankAndCashAmtForSalaryProcess?branchCode=${branchCode}&employeeCode=${employee.employeeCode}&empSalaryDays=${employee.empSalaryDays}&month=${formData.month}&orgId=${orgId}&totalCompanyWorkingDays=${employee.totalCompanyWorkingDays}&year=${formData.year}`
//       );

//       if (response.status === true && response.paramObjectsMap.salaryProcessVO?.length > 0) {
//         const data = response.paramObjectsMap.salaryProcessVO[0];
//         return {
//           totalEarnings: data.totalEarnings || 0,
//           totalDeductions: data.totalDeductions || 0,
//           bankAmount: data.bankAmount || 0,
//           cashAmount: data.cashAmount || 0,
//           cashAdvance: data.cashAdvance || 0,
//           bankAdvance: data.bankAdvance || 0,
//           bankOtAmount: data.bankOtAmount || 0,
//           // Add PF/ESI from the API response
//           pfAmount: data.pfAmount || 0,
//           esiAmount: data.esiAmount || 0
//         };
//       }
//       return {
//         totalEarnings: 0,
//         totalDeductions: 0,
//         bankAmount: 0,
//         cashAmount: 0,
//         cashAdvance: 0,
//         bankAdvance: 0,
//         bankOtAmount: 0,
//         pfAmount: 0,
//         esiAmount: 0
//       };
//     } catch (error) {
//       console.error('Error fetching bank/cash amounts:', error);
//       return {
//         totalEarnings: 0,
//         totalDeductions: 0,
//         bankAmount: 0,
//         cashAmount: 0,
//         cashAdvance: 0,
//         bankAdvance: 0,
//         bankOtAmount: 0,
//         pfAmount: 0,
//         esiAmount: 0
//       };
//     }
//   };

//   const getAllBranch = async () => {
//     try {
//       const response = await apiCalls('get', `master/branch?orgid=${orgId}`);
//       console.log('API Response:', response);

//       if (response.status === true) {
//         setBranchList(response.paramObjectsMap.branchVO);
//       } else {
//         console.error('API Error:', response);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const getAllDepartment = async () => {
//     try {
//       const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
//       console.log('API Response:', response);

//       if (response.status === true) {
//         setDepartmentList(response.paramObjectsMap.departmentVO);
//       } else {
//         console.error('API Error:', response);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const getAllContractList = async () => {
//     try {
//       const response = await apiCalls('get', `shiftmaster/getAllContractMasterByOrgId?orgId=${orgId}`);
//       if (response.status === true) {
//         setContractList(response.paramObjectsMap.contractMasterVO);
//       } else {
//         console.error('API Error:', response);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const handleSave = () => {
//     const errors = {};

//     if (!formData.month) {
//       errors.month = 'Month is required';
//     }
//     if (!formData.year) {
//       errors.year = 'Year is required';
//     }

//     if (mainTableData.length === 0) {
//       errors.table = 'No data available in the table. Please add employees before saving.';
//     }

//     setFieldErrors(errors);

//     if (Object.keys(errors).length === 0) {
//       // Show OT confirmation dialog instead of directly saving
//       setOtConfirmationDialog(true);
//     } else {
//       setFieldErrors(errors);
//     }
//   };

//   const handleConfirmedSave = async () => {
//     setIsLoading(true);
//     setOtConfirmationDialog(false);

//     try {
//       const saveDataArray = mainTableData.map((employee) => ({
//         branch: branch,
//         branchCode: branchCode,
//         createdBy: loginUserName,
//         empSalaryDays: parseFloat(employee.empSalaryDays) || 0,
//         empTotalWorkingDays: parseFloat(employee.empTotalWorkingDays) || 0,
//         employeeCode: employee.employeeCode,
//         employeeName: employee.employeeName,
//         totalEarnings: parseFloat(employee.totalEarnings) || 0,
//         totalDeductions: parseFloat(employee.totalDeductions) || 0,
//         lopLeave: parseFloat(employee.lopLeave) || 0,
//         totalCompanyWorkingDays: parseFloat(employee.totalCompanyWorkingDays) || 0,
//         totalLeave: parseFloat(employee.totalLeave) || 0,
//         otHours: parseFloat(employee.otHours) || 0,
//         orgId: parseInt(orgId),
//         month: parseInt(formData.month),
//         year: formData.year,
//         // Add bank/cash fields
//         bankAmount: parseFloat(employee.bankAmount) || 0,
//         cashAmount: parseFloat(employee.cashAmount) || 0,
//         cashAdvance: parseFloat(employee.cashAdvance) || 0,
//         bankAdvance: parseFloat(employee.bankAdvance) || 0,
//         bankOtAmount: parseFloat(employee.bankOtAmount) || 0,
//         cashOtAmount: parseFloat(employee.cashOtAmount) || 0,
//         pfAmount: parseFloat(employee.pfAmount) || 0,
//         esiAmount: parseFloat(employee.esiAmount) || 0
//       }));

//       console.log('Saving Selected Employee Data:', saveDataArray);
//       const response = await apiCalls('put', '/employeemaster/createUpdateSalaryProcess', saveDataArray);

//       if (response.status === true) {
//         showToast('success', 'Salary Process created successfully');
//         handleCancel();
//       } else {
//         const errorMsg = response.paramObjectsMap?.errorMessage || 'Salary Process creation failed';
//         showToast('error', errorMsg);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       showToast('error', 'Salary Process creation failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleNavigateToOTApproval = () => {
//     // Save current state to localStorage/sessionStorage
//     localStorage.setItem(
//       'salaryProcessData',
//       JSON.stringify({
//         formData,
//         mainTableData,
//         selectedMonth,
//         allSalary,
//         originalSalary
//       })
//     );

//     setOtConfirmationDialog(false);
//     navigate('/basicMaster/OverTime', {
//       state: { fromSalaryProcess: true }
//     });
//   };

//   useEffect(() => {
//     const savedData = localStorage.getItem('salaryProcessData');
//     if (savedData) {
//       const parsedData = JSON.parse(savedData);
//       setFormData(parsedData.formData);
//       setMainTableData(parsedData.mainTableData);
//       setSelectedMonth(parsedData.selectedMonth);
//       setAllSalary(parsedData.allSalary);
//       setOriginalSalary(parsedData.originalSalary);

//       // Clear the saved data after restoring
//       localStorage.removeItem('salaryProcessData');
//     }
//   }, []);

//   const handleCancel = () => {
//     // const currentMonthData = months.find(month => parseInt(month.value) === currentMonth);

//     // setSelectedMonth(currentMonthData?.name || '');
//     setFormData({
//       // month: currentMonthData?.value || '',
//       year: currentYear.toString(),
//       branch: 'ALL',
//       departmentName: 'ALL',
//       employeeType: '',
//       contractor: ''
//     });
//     setFieldErrors({
//       month: false,
//       year: false,
//       branch: false,
//       departmentName: false,
//       employeeType: false,
//       contractor: false
//     });
//     setAllSalary([]);
//     setShowSelectedMonthYear(false);
//     setMainTableData([]);
//     setDialogOpen(false);
//     setFormResetKey((prev) => prev + 1);
//   };
//   const handleRowSelect = (employeeCode) => {
//     setSelectedRows((prev) => (prev.includes(employeeCode) ? prev.filter((code) => code !== employeeCode) : [...prev, employeeCode]));
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedRows([]);
//     } else {
//       setSelectedRows(allSalary.map((item) => item.employeeCode));
//     }
//     setSelectAll(!selectAll);
//   };

//   useEffect(() => {
//     if (dialogOpen) {
//       if (mainTableData.length > 0) {
//         setSelectedRows(mainTableData.map((item) => item.employeeCode));
//       } else {
//         setSelectedRows([]); // reset if no confirmed data
//       }
//     }
//   }, [dialogOpen, mainTableData]);

//   const handleConfirmSelection = () => {
//     // Use originalSalary instead of allSalary to ensure we have all data
//     const selectedData = originalSalary.filter((item) => selectedRows.includes(item.employeeCode));
//     setMainTableData(selectedData);
//     setDialogOpen(false);
//   };

//   const handlePopupCancel = () => {
//     setSelectedRows([]);
//     setDialogOpen(false);
//     setGoIsLoading(false);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (fieldErrors[name]) {
//       setFieldErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const formatNumberWithCommas = (value) => {
//     // Handle special strings
//     if (value === 'Loading...' || value === 'Error' || value === 'Pending') {
//       return value;
//     }

//     // If null, undefined, or empty string → return empty
//     if (value === null || value === undefined || value === '0' || value === '0.0' || value === '0.00') {
//       return '-';
//     }

//     const num = parseFloat(value);
//     if (isNaN(num)) return '';

//     // Integer formatting
//     if (Number.isInteger(num)) {
//       return num.toLocaleString('en-IN', {
//         maximumFractionDigits: 0,
//         minimumFractionDigits: 0
//       });
//     }

//     // Decimal formatting (up to 1 decimal, no trailing zero)
//     return num.toLocaleString('en-IN', {
//       maximumFractionDigits: 1,
//       minimumFractionDigits: 0
//     });
//   };

//   // Function to get available months based on selected year
//   // const getAvailableMonths = (selectedYear) => {
//   //   if (selectedYear === currentYear.toString()) {
//   //     const availableMonths = [];

//   //     // const currentMonthData = months.find(month => parseInt(month.value) === currentMonth);
//   //     if (currentMonthData) {
//   //       availableMonths.push(currentMonthData);
//   //     }

//   //     for (let i = 1; i <= 2; i++) {
//   //       let prevMonth = currentMonth - i;
//   //       let yearAdjustment = 0;

//   //       if (prevMonth <= 0) {
//   //         prevMonth += 12;
//   //         yearAdjustment = -1;
//   //       }

//   //       if (yearAdjustment === 0) {
//   //         const prevMonthData = months.find(month => parseInt(month.value) === prevMonth);
//   //         if (prevMonthData) {
//   //           availableMonths.push(prevMonthData);
//   //         }
//   //       }
//   //     }

//   //     return availableMonths.sort((a, b) => parseInt(b.value) - parseInt(a.value));
//   //   } else {
//   //     return months;
//   //   }
//   // };

//   // useEffect(() => {
//   //   const currentMonthData = months.find(month => parseInt(month.value) === currentMonth);
//   //   if (currentMonthData) {
//   //     setSelectedMonth(currentMonthData.name);
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       month: currentMonthData.value,
//   //       year: currentYear.toString()
//   //     }));
//   //   }
//   // }, []);

//   return (
//     <>
//       <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
//         <div className="row d-flex ml">
//           <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
//             <ActionButton title="Clear" icon={ClearIcon} onClick={handleCancel} />
//             <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
//           </div>

//           {/* <div className="col-md-3 mb-3">
//             <FormControl fullWidth error={!!fieldErrors.year} size="small">
//               <InputLabel>Year</InputLabel>
//               <Select
//                 label="Year"
//                 value={formData.year}
//                 size="small"
//                 onChange={(e) => {
//                   const selectedYear = e.target.value;
//                   setFormData((prev) => ({
//                     ...prev,
//                     year: selectedYear
//                   }));

//                   // Reset month when year changes to ensure valid selection
//                   setSelectedMonth('');
//                   setFormData(prev => ({ ...prev, month: '' }));

//                   setFieldErrors((prev) => ({
//                     ...prev,
//                     year: ''
//                   }));
//                 }}
//               >
//                 {years.map((year) => (
//                   <MenuItem key={year} value={year}>
//                     {year}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {fieldErrors.year && <FormHelperText>{fieldErrors.year}</FormHelperText>}
//             </FormControl>
//           </div>

//           <div className="col-md-3 mb-3">
//             <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.month}>
//               <InputLabel>Month</InputLabel>
//               <Select label="Month" value={selectedMonth} onChange={handleMonthChange}>
//                 {getAvailableMonths(formData.year).map((m) => (
//                   <MenuItem key={m.value} value={m.name}>
//                     {m.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {fieldErrors.month && <FormHelperText>{fieldErrors.month}</FormHelperText>}
//             </FormControl>
//           </div> */}

//           <div className="col-md-3 mb-3">
//             <FormControl fullWidth error={!!fieldErrors.year} size="small">
//               <InputLabel>Year</InputLabel>
//               <Select
//                 label="Year"
//                 value={formData.year}
//                 size="small"
//                 onChange={handleYearChange}
//               >
//                 {years.map((year) => (
//                   <MenuItem key={year} value={year}>
//                     {year}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {fieldErrors.year && <FormHelperText>{fieldErrors.year}</FormHelperText>}
//             </FormControl>
//           </div>

//           <div className="col-md-3 mb-3">
//             <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.month}>
//               <InputLabel>Month</InputLabel>
//               <Select
//                 label="Month"
//                 value={selectedMonth}
//                 onChange={handleMonthChange}
//                 disabled={availableMonths.length === 0}
//               >
//                 {availableMonths.map((m) => (
//                   <MenuItem key={m.value} value={m.name}>
//                     {m.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {fieldErrors.month && <FormHelperText>{fieldErrors.month}</FormHelperText>}
//             </FormControl>
//           </div>

//           <div className="col-md-3 mb-3">
//             <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
//               <InputLabel id="branch-label">Branch</InputLabel>
//               <Select labelId="branch-label" label="Branch" value={formData.branch} onChange={handleSelectChange} name="branch">
//                 <MenuItem value="ALL">ALL</MenuItem>
//                 {branchList.length > 0 &&
//                   branchList.map((group, index) => (
//                     <MenuItem key={index} value={group.branch}>
//                       {group.branch}
//                     </MenuItem>
//                   ))}
//               </Select>
//               {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
//             </FormControl>
//           </div>
//           <div className="col-md-3 mb-3">
//             <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.departmentName}>
//               <InputLabel id="departmentName-label">Department</InputLabel>
//               <Select
//                 labelId="departmentName-label"
//                 label="Department"
//                 value={formData.departmentName}
//                 onChange={handleSelectChange}
//                 name="departmentName"
//               >
//                 <MenuItem value="ALL">ALL</MenuItem>
//                 {departmentList.length > 0 &&
//                   departmentList.map((group, index) => (
//                     <MenuItem key={index} value={group.departmentName}>
//                       {group.departmentName}
//                     </MenuItem>
//                   ))}
//               </Select>
//               {fieldErrors.departmentName && <FormHelperText>{fieldErrors.departmentName}</FormHelperText>}
//             </FormControl>
//           </div>
//           <div className="col-md-3 mb-3">
//             <Autocomplete
//               key={formResetKey}
//               options={['All', 'Employee', 'Contractor']}
//               getOptionLabel={(option) => option}
//               sx={{ width: '100%' }}
//               size="small"
//               value={formData.employeeType}
//               onChange={(event, newValue) => {
//                 handleInputChange({ target: { name: 'employeeType', value: newValue || 'All' } });
//                 if (newValue !== 'Contractor') {
//                   handleInputChange({ target: { name: 'contractor', value: '' } });
//                 }
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Employee Type *"
//                   name="employeeType"
//                   error={!!fieldErrors.employeeType}
//                   helperText={fieldErrors.employeeType}
//                   InputProps={{
//                     ...params.InputProps,
//                     style: { height: 40 }
//                   }}
//                 />
//               )}
//             />
//           </div>

//           {formData.employeeType === 'Contractor' && (
//             <div className="col-md-3 mb-3">
//               <Autocomplete
//                 options={contractList}
//                 getOptionLabel={(option) => option.contractor || ''}
//                 sx={{ width: '100%' }}
//                 size="small"
//                 value={contractList.find((c) => c.contractor === formData.contractor) || null}
//                 onChange={(event, newValue) => {
//                   handleInputChange({
//                     target: {
//                       name: 'contractor',
//                       value: newValue ? newValue.contractor : ''
//                     }
//                   });
//                 }}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     label="Contractor *"
//                     name="contractor"
//                     error={!!fieldErrors.contractor}
//                     helperText={fieldErrors.contractor}
//                     InputProps={{
//                       ...params.InputProps,
//                       style: { height: 40 }
//                     }}
//                   />
//                 )}
//               />
//             </div>
//           )}

//           <div className="col-md-3 mb-3">
//             <Button
//               variant="contained"
//               onClick={handleGetSalaryProcess}
//               disabled={isGoLoading}
//               sx={{
//                 borderRadius: '8px',
//                 boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
//                 textTransform: 'none',
//                 background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                 '&:disabled': {
//                   background: '#cccccc'
//                 }
//               }}
//             >
//               {isGoLoading ? <CircularProgress size={24} color="inherit" /> : 'Go'}
//             </Button>
//           </div>
//         </div>

//         <>
//           <div className="row mt-2">
//             <div className="col-lg-12">
//               <div className="table-responsive">
//                 <TableContainer component={Paper}>
//                   <Table>
//                     <TableHead
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <TableRow>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>#</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>Code</strong>
//                         </TableCell>
//                         <TableCell
//                           align='center'
//                           sx={{
//                             color: 'white',
//                             // width: '200px', // Fixed width
//                             // minWidth: '200px', // Ensure minimum width
//                           }}>
//                           <strong>Name</strong>
//                         </TableCell>
//                         {/* {formData.branch === 'ALL' ? (
//                           <TableCell>
//                             <strong>Branch</strong>
//                           </TableCell>
//                         ) : (
//                           ''
//                         )} */}
//                         {formData.departmentName === 'ALL' ? (
//                           <TableCell align='center' sx={{ color: 'white' }}>
//                             <strong>Department</strong>
//                           </TableCell>
//                         ) : (
//                           ''
//                         )}
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>Total</strong>
//                         </TableCell>
//                         {/* <TableCell>
//                           <strong>Leave</strong>
//                         </TableCell> */}
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>Present</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>OT</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>Earnings</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>LOP</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>Advance</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>PF</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>ESI</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>Deductions</strong>
//                         </TableCell>
//                         <TableCell align='center' sx={{ color: 'white' }}>
//                           <strong>Net</strong>
//                         </TableCell>
//                       </TableRow>
//                     </TableHead>

//                     <TableBody>
//                       {mainTableData.length > 0 ? (
//                         mainTableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave, index) => (
//                           <TableRow key={leave.employeeCode} hover>
//                             <TableCell>{page * rowsPerPage + index + 1}</TableCell>
//                             <TableCell align='left'>{leave.employeeCode}</TableCell>
//                             <TableCell align='left'>{leave.employeeName}</TableCell>
//                             {/* {formData.branch === 'ALL' ? <TableCell>{leave.branch}</TableCell> : null} */}
//                             {formData.departmentName === 'ALL' ? <TableCell align='left'>{leave.department}</TableCell> : null}
//                             <TableCell align='right'>{formatNumberWithCommas(leave.totalCompanyWorkingDays)}</TableCell>
//                             {/* <TableCell>{formatNumberWithCommas(leave.totalLeave)}</TableCell> */}
//                             <TableCell align='right'>{formatNumberWithCommas(leave.empTotalWorkingDays)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.bankOtAmount)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.totalEarnings)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.lopLeave)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.bankAdvance)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.pfAmount)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.esiAmount)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.totalDeductions)}</TableCell>
//                             <TableCell align='right'>{formatNumberWithCommas(leave.bankAmount)}</TableCell>
//                           </TableRow>
//                         ))
//                       ) : (
//                         <TableRow>
//                           <TableCell colSpan={formData.branch === 'ALL' || formData.departmentName === 'ALL' ? 17 : 15} align="center">
//                             No data available
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                   <TablePagination
//                     rowsPerPageOptions={[5, 10, 25]}
//                     component="div"
//                     count={mainTableData.length}
//                     rowsPerPage={rowsPerPage}
//                     page={page}
//                     onPageChange={(e, newPage) => setPage(newPage)}
//                     onRowsPerPageChange={(e) => {
//                       setRowsPerPage(parseInt(e.target.value, 10));
//                       setPage(0);
//                     }}
//                   />
//                 </TableContainer>
//               </div>
//             </div>
//           </div>

//           <ToastContainer />
//         </>
//       </div>

//       <Dialog
//         open={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         fullWidth
//         maxWidth="lg"
//         sx={{
//           '& .MuiDialog-paper': {
//             overflow: 'hidden',
//             display: 'flex',
//             flexDirection: 'column',
//             height: '80vh'
//           }
//         }}
//       >
//         <DialogTitle
//           sx={{
//             position: 'sticky',
//             top: 0,
//             backgroundColor: 'white',
//             zIndex: 1000,
//             boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
//             padding: '16px 24px'
//           }}
//         >
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <span>Select Employees</span>
//             <TextField
//               variant="outlined"
//               size="small"
//               placeholder="Search"
//               sx={{ width: '300px' }}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon />
//                   </InputAdornment>
//                 ),
//                 endAdornment: searchTerm && (
//                   <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')}>
//                     <ClearIcon fontSize="small" />
//                   </InputAdornment>
//                 )
//               }}
//             />
//           </div>
//         </DialogTitle>

//         <DialogContent
//           sx={{
//             padding: 0,
//             flex: 1,
//             overflow: 'hidden',
//             display: 'flex',
//             flexDirection: 'column'
//           }}
//         >
//           {isDataLoading ? (
//             <div
//               style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: '200px',
//                 flexDirection: 'column'
//               }}
//             >
//               <CircularProgress />
//               <Typography variant="body1" sx={{ mt: 2 }}>
//                 Loading salary details...
//               </Typography>
//             </div>
//           ) : allSalary.length === 0 ? (
//             <div
//               style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: '200px',
//                 flexDirection: 'column'
//               }}
//             >
//               <SearchOffIcon fontSize="large" color="disabled" />
//               <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
//                 No employees found
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Try adjusting your search
//               </Typography>
//             </div>
//           ) : (
//             <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell
//                       padding="checkbox"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <Checkbox
//                         indeterminate={selectedRows.length > 0 && selectedRows.length < allSalary.length}
//                         checked={allSalary.length > 0 && selectedRows.length === allSalary.length}
//                         onChange={handleSelectAll}
//                         sx={{
//                           color: '#e9dcdc', // Default color
//                           '&.Mui-checked': {
//                             color: 'white', // White color when checked
//                           },
//                           '&.MuiCheckbox-indeterminate': {
//                             color: 'white', // White color when indeterminate
//                           }
//                         }}
//                       />
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white',
//                       }}
//                     >
//                       <strong>Code</strong>
//                     </TableCell>
//                     {/* <TableCell
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Name</strong>
//                     </TableCell> */}
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white',
//                         // width: '200px', // Fixed width
//                         // minWidth: '200px', // Ensure minimum width
//                       }}
//                     >
//                       <strong>Name</strong>
//                     </TableCell>
//                     {/* {formData.branch === 'ALL' && (
//                       <TableCell
//                         sx={{
//                           background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                           color: 'white'
//                         }}
//                       >
//                         <strong>Branch</strong>
//                       </TableCell>
//                     )} */}
//                     {formData.departmentName === 'ALL' && (
//                       <TableCell
//                         align="center"
//                         sx={{
//                           background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                           color: 'white',
//                           align: 'center',
//                         }}
//                       >
//                         <strong>Department</strong>
//                       </TableCell>
//                     )}
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Total</strong>
//                     </TableCell>
//                     {/* <TableCell
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Leave</strong>
//                     </TableCell> */}
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Present</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>OT</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Earnings</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>LOP</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Advance</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>PF</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>ESI</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Deductions</strong>
//                     </TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{
//                         background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                         color: 'white'
//                       }}
//                     >
//                       <strong>Net</strong>
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {allSalary.map((leave) => {
//                     const isItemSelected = selectedRows.includes(leave.employeeCode);
//                     return (
//                       <TableRow
//                         key={leave.employeeCode}
//                         hover
//                         role="checkbox"
//                         aria-checked={isItemSelected}
//                         selected={isItemSelected}
//                         sx={{ cursor: 'pointer' }}
//                       >
//                         <TableCell padding="checkbox">
//                           <Checkbox
//                             checked={isItemSelected}
//                             onChange={() => handleRowSelect(leave.employeeCode)}
//                           // disabled={leave.grossPay === 'Loading...' || leave.grossPay === 'Error'}
//                           />
//                         </TableCell>
//                         <TableCell>{leave.employeeCode}</TableCell>
//                         <TableCell>{leave.employeeName}</TableCell>
//                         {/* {formData.branch === 'ALL' && <TableCell>{leave.branch}</TableCell>} */}
//                         {formData.departmentName === 'ALL' && <TableCell>{leave.department}</TableCell>}
//                         <TableCell align='right'>{formatNumberWithCommas(leave.totalCompanyWorkingDays)}</TableCell>
//                         {/* <TableCell>{formatNumberWithCommas(leave.totalLeave)}</TableCell> */}
//                         <TableCell align='right'>{formatNumberWithCommas(leave.empTotalWorkingDays)}</TableCell>
//                         <TableCell align='right'>{formatNumberWithCommas(leave.bankOtAmount)}</TableCell>
//                         <TableCell align='right'>{formatNumberWithCommas(leave.totalEarnings)}</TableCell>
//                         <TableCell align='right'>{formatNumberWithCommas(leave.lopLeave)}</TableCell>
//                         <TableCell align='right'>{formatNumberWithCommas(leave.bankAdvance)}</TableCell>
//                         <TableCell align='right'>{formatNumberWithCommas(leave.pfAmount)}</TableCell>
//                         <TableCell align='right'>{formatNumberWithCommas(leave.esiAmount)}</TableCell>
//                         {/* <TableCell>
//                           {leave.pfAmount === 'Loading...' ? (
//                             <CircularProgress size={16} />
//                           ) : leave.pfAmount === 'Error' ? (
//                             <Tooltip title="Error loading value">
//                               <span style={{ color: 'red' }}>Error</span>
//                             </Tooltip>
//                           ) : (
//                             formatNumberWithCommas(leave.pfAmount)
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           {leave.esiAmount === 'Loading...' ? (
//                             <CircularProgress size={16} />
//                           ) : leave.esiAmount === 'Error' ? (
//                             <Tooltip title="Error loading value">
//                               <span style={{ color: 'red' }}>Error</span>
//                             </Tooltip>
//                           ) : (
//                             formatNumberWithCommas(leave.esiAmount)
//                           )}
//                         </TableCell> */}
//                         <TableCell align='right'>{formatNumberWithCommas(leave.totalDeductions)}</TableCell>
//                         <TableCell align='right'>{formatNumberWithCommas(leave.bankAmount)}</TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </DialogContent>
//         <div
//           style={{
//             position: 'sticky',
//             bottom: 0,
//             backgroundColor: 'white',
//             padding: '16px 24px',
//             borderTop: '1px solid #e0e0e0',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center'
//           }}
//         >
//           <Typography variant="body2" color="textSecondary">
//             {selectedRows.length} / {allSalary.length}
//           </Typography>
//           <div>
//             <Button variant="contained" onClick={handleConfirmSelection} disabled={selectedRows.length === 0}>
//               Confirm
//             </Button>
//             <Button onClick={handlePopupCancel} color="secondary" sx={{ mr: 1 }}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Dialog>
//       <Dialog open={otConfirmationDialog} onClose={() => setOtConfirmationDialog(false)} aria-labelledby="ot-confirmation-dialog">
//         <DialogTitle id="ot-confirmation-dialog" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
//           Confirm OT Approval
//           <IconButton onClick={() => setOtConfirmationDialog(false)} size="small" sx={{ marginLeft: 'auto' }}>
//             <ClearIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent>
//           <DialogContentText>Confirm OT Approval Before Salary.</DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleConfirmedSave} color="primary" autoFocus>
//             Yes
//           </Button>
//           <Button onClick={handleNavigateToOTApproval} color="primary">
//             No
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default SalaryProcess;

import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { MenuItem } from '@mui/material';
import { FormControlLabel, FormHelperText } from '@mui/material';
import { TableCell, TableContainer, TableHead, TablePagination, Tooltip, Typography, Checkbox, IconButton } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
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
  InputAdornment
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SalaryProcess = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoLoading, setGoIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [selectedMonth, setSelectedMonth] = useState('');
  const [formData, setFormData] = useState({ month: '', year: '', branch: 'ALL', departmentName: 'ALL', employeeType: '', contractor: '' });
  const [fieldErrors, setFieldErrors] = useState({ month: '', year: '', branch: '', departmentName: '', employeeType: '', contractor: '' });
  const [allSalary, setAllSalary] = useState([]);
  const [showSelectedMonthYear, setShowSelectedMonthYear] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [mainTableData, setMainTableData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [contractList, setContractList] = useState([]);
  const [formResetKey, setFormResetKey] = useState(0);
  const [originalSalary, setOriginalSalary] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [otConfirmationDialog, setOtConfirmationDialog] = useState(false);
  const navigate = useNavigate();

  // New state for API-based years and months
  const [availableYearsMonths, setAvailableYearsMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    if (debouncedSearchTerm === '') {
      setAllSalary(originalSalary);
    } else {
      const filteredData = originalSalary.filter(
        (item) =>
          item.employeeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          item.employeeCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setAllSalary(filteredData);
    }
  }, [debouncedSearchTerm, originalSalary]);

  useEffect(() => {
    getAllBranch();
    getAllDepartment();
    getAllContractList();
    fetchYearsAndMonths(); // Fetch years and months from API
  }, []);

  // Fetch years and months from API
  // const fetchYearsAndMonths = async () => {
  //   try {
  //     const response = await apiCalls('get', `employeemaster/getYearAndMonth?orgId=${orgId}`);

  //     console.log('Full API Response:', response); // Debug the full response

  //     // Check if the response structure is different
  //     let yearMonthData = [];

  //     if (response.status === true) {
  //       // Try different possible response structures
  //       if (Array.isArray(response.paramObjectsMap.yearMonth)) {
  //         yearMonthData = response.paramObjectsMap.yearMonth;
  //       } else if (response.paramObjectsMap && typeof response.paramObjectsMap === 'object') {
  //         // If it's a single object instead of array, convert to array
  //         yearMonthData = [response.paramObjectsMap.yearMonth].filter(Boolean);
  //       }

  //       console.log('Processed yearMonthData:', yearMonthData);

  //       setAvailableYearsMonths(yearMonthData);

  //       if (yearMonthData.length > 0) {
  //         // Extract unique years and sort in ascending order
  //         const uniqueYears = [...new Set(yearMonthData.map(item => item.year))]
  //           .sort((a, b) => parseInt(a) - parseInt(b));
  //         setYears(uniqueYears);

  //         // Set initial year and available months
  //         const initialYear = uniqueYears[0];
  //         setFormData(prev => ({ ...prev, year: initialYear }));
  //         updateAvailableMonths(initialYear);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching years and months:', error);
  //     showToast('error', 'Error fetching available months and years');
  //   }
  // };

  const fetchYearsAndMonths = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getYearAndMonth?orgId=${orgId}`);

      console.log('Full API Response:', response);

      let yearMonthData = [];

      if (response.status === true) {
        if (Array.isArray(response.paramObjectsMap.yearMonth)) {
          yearMonthData = response.paramObjectsMap.yearMonth;
        } else if (response.paramObjectsMap && typeof response.paramObjectsMap === 'object') {
          yearMonthData = [response.paramObjectsMap.yearMonth].filter(Boolean);
        }

        console.log('Processed yearMonthData:', yearMonthData);

        setAvailableYearsMonths(yearMonthData);

        if (yearMonthData.length > 0) {
          const uniqueYears = [...new Set(yearMonthData.map(item => item.year))]
            .sort((a, b) => parseInt(a) - parseInt(b));
          setYears(uniqueYears);

          const initialYear = uniqueYears[0];

          // Set form data first
          setFormData(prev => ({
            ...prev,
            year: initialYear
          }));

          // Then update available months and auto-select first month
          updateAvailableMonths(initialYear);
        }
      }
    } catch (error) {
      console.error('Error fetching years and months:', error);
      showToast('error', 'Error fetching available months and years');
    }
  };

  // const updateAvailableMonths = (selectedYear) => {
  //   const monthsForYear = availableYearsMonths
  //     .filter(item => item.year === selectedYear)
  //     .map(item => ({
  //       value: item.month,
  //       name: getMonthName(item.month)
  //     }))
  //     .sort((a, b) => parseInt(a.value) - parseInt(b.value)); // Sort months in ascending order

  //   console.log('Available months for year', selectedYear, ':', monthsForYear); // Debug log

  //   setAvailableMonths(monthsForYear);

  //   // Auto-select first month if available
  //   if (monthsForYear.length > 0) {
  //     setSelectedMonth(monthsForYear[0].name); // Fixed typo: was monthsForthsForYear
  //     setFormData(prev => ({ ...prev, month: monthsForYear[0].value })); // Fixed typo: was monthsForthsForYear
  //   } else {
  //     setSelectedMonth('');
  //     setFormData(prev => ({ ...prev, month: '' }));
  //   }
  // };

  const updateAvailableMonths = (selectedYear) => {
    const monthsForYear = availableYearsMonths
      .filter(item => item.year === selectedYear)
      .map(item => ({
        value: item.month,
        name: getMonthName(item.month)
      }))
      .sort((a, b) => parseInt(a.value) - parseInt(b.value)); // Sort months in ascending order

    console.log('Available months for year', selectedYear, ':', monthsForYear);

    setAvailableMonths(monthsForYear);

    // Auto-select first month if available
    if (monthsForYear.length > 0) {
      const firstMonth = monthsForYear[0];
      setSelectedMonth(firstMonth.name);
      setFormData(prev => ({
        ...prev,
        month: firstMonth.value,
        year: selectedYear
      }));
    } else {
      setSelectedMonth('');
      setFormData(prev => ({ ...prev, month: '' }));
    }
  };

  // const getMonthName = (monthNumber) => {
  //   const monthNames = [
  //     'January', 'February', 'March', 'April', 'May', 'June',
  //     'July', 'August', 'September', 'October', 'November', 'December'
  //   ];
  //   return monthNames[parseInt(monthNumber) - 1] || '';
  // };

  const getMonthName = (monthNumber) => {
    // Convert to number if it's a string
    const monthNum = parseInt(monthNumber);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNum - 1] || '';
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setFormData(prev => ({ ...prev, year: selectedYear }));
    updateAvailableMonths(selectedYear);
    setFieldErrors(prev => ({ ...prev, year: '' }));
  };

  // const handleMonthChange = (event) => {
  //   const selected = availableMonths.find((m) => m.name === event.target.value);
  //   setSelectedMonth(selected?.name || '');
  //   setFormData(prev => ({ ...prev, month: selected?.value || '' }));
  //   setFieldErrors(prev => ({ ...prev, month: '' }));
  // };

  const handleMonthChange = (event) => {
    const selectedMonthName = event.target.value;
    const selected = availableMonths.find((m) => m.name === selectedMonthName);

    if (selected) {
      setSelectedMonth(selected.name);
      setFormData(prev => ({
        ...prev,
        month: selected.value
      }));
    } else {
      setSelectedMonth('');
      setFormData(prev => ({ ...prev, month: '' }));
    }

    setFieldErrors(prev => ({ ...prev, month: '' }));
  };

  const getAllSalaryProcess = async () => {
    try {
      // Build the base URL
      let apiUrl = `employeemaster/getLeaveDetailsforSalaryProcess?month=${formData.month}&orgId=${orgId}&year=${formData.year}&branch=${formData.branch}&department=${formData.departmentName}`;

      // Add employee type parameter
      apiUrl += `&type=${formData.employeeType}`;

      // Add contractor parameter if employee type is Contractor
      if (formData.employeeType === 'Contractor' && formData.contractor) {
        apiUrl += `&contractor=${formData.contractor}`;
      }

      setGoIsLoading(true);
      setIsDataLoading(true);

      const response = await apiCalls('get', apiUrl);

      setShowSelectedMonthYear(true);

      if (response.status === true && Array.isArray(response.paramObjectsMap.salaryProcessVO)) {
        const salaryData = response.paramObjectsMap.salaryProcessVO.map((employee) => ({
          ...employee,
          totalLeave: parseFloat(employee.totalLeave).toString(),
          totalCompanyWorkingDays: parseFloat(employee.totalCompanyWorkingDays).toString(),
          lopLeave: parseFloat(employee.lopLeave).toString(),
          empSalaryDays: parseFloat(employee.empSalaryDays).toString(),
          empTotalWorkingDays: parseFloat(employee.empTotalWorkingDays).toString(),
          // Initialize calculated fields as loading
          totalEarnings: 'Loading...',
          totalDeductions: 'Loading...',
          pfAmount: 'Loading...',
          esiAmount: 'Loading...',
          bankAmount: 'Loading...',
          cashAmount: 'Loading...',
          cashAdvance: 'Loading...',
          bankAdvance: 'Loading...',
          bankOtAmount: 'Loading...'
        }));

        setAllSalary(salaryData);
        setOriginalSalary(salaryData);
        setDialogOpen(true);

        // Now call fetchBankCashSalaries with the data
        await fetchBankCashSalaries(salaryData);
      } else {
        console.error('API Error:', response);
        showToast('error', 'Failed to fetch salary data');
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      showToast('error', 'Error fetching salary data');
    } finally {
      setGoIsLoading(false);
    }
  };

  const handleGetSalaryProcess = () => {
    const errors = {};

    if (!selectedMonth) {
      errors.month = 'Month is required';
    }

    if (!formData.year) {
      errors.year = 'Year is required';
    }

    if (!formData.employeeType) {
      errors.employeeType = 'Employee Type is required';
    }

    // Add validation for contractor when employee type is Contractor
    if (formData.employeeType === 'Contractor' && !formData.contractor) {
      errors.contractor = 'Contractor is required';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      getAllSalaryProcess();
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    if (value === 'ALL') {
      setFormData((prev) => ({
        ...prev,
        [name]: 'ALL'
      }));

      setFieldErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
      return;
    }

    if (name === 'branch') {
      const selectedBranch = branchList.find((b) => b.branch === value);
      if (selectedBranch) {
        setFormData((prev) => ({
          ...prev,
          branch: selectedBranch.branch
        }));
        setFieldErrors((prev) => ({
          ...prev,
          branch: ''
        }));
      }
    }

    if (name === 'departmentName') {
      const selectedDepartment = departmentList.find((d) => d.departmentName === value);
      if (selectedDepartment) {
        setFormData((prev) => ({
          ...prev,
          departmentName: selectedDepartment.departmentName
        }));
        setFieldErrors((prev) => ({
          ...prev,
          departmentName: ''
        }));
      }
    }
  };

  const fetchBankCashSalaries = async (salaryData) => {
    try {
      setIsDataLoading(true);

      const updatedData = await Promise.all(
        salaryData.map(async (employee) => {
          try {
            // Get Bank/Cash amounts from API (which now includes PF/ESI)
            const bankCashData = await getBankCashAmounts(employee);

            return {
              ...employee,
              totalEarnings: bankCashData.totalEarnings === 'Pending' ? 'Pending' : parseFloat(bankCashData.totalEarnings).toFixed(2),
              totalDeductions: bankCashData.totalDeductions === 'Pending' ? 'Pending' : parseFloat(bankCashData.totalDeductions).toFixed(2),
              // Use PF/ESI from the same API response
              pfAmount: bankCashData.pfAmount === 'Pending' ? 'Pending' : parseFloat(bankCashData.pfAmount).toFixed(2),
              esiAmount: bankCashData.esiAmount === 'Pending' ? 'Pending' : parseFloat(bankCashData.esiAmount).toFixed(2),
              // Add bank/cash fields
              bankAmount: bankCashData.bankAmount || '0.00',
              cashAmount: bankCashData.cashAmount || '0.00',
              cashAdvance: bankCashData.cashAdvance || '0.00',
              bankAdvance: bankCashData.bankAdvance || '0.00',
              bankOtAmount: bankCashData.bankOtAmount || '0.00'
            };
          } catch (error) {
            console.error(`Error processing employee ${employee.employeeCode}:`, error);
            return {
              ...employee,
              totalEarnings: 'Error',
              totalDeductions: 'Error',
              pfAmount: 'Error',
              esiAmount: 'Error',
              bankAmount: 'Error',
              cashAmount: 'Error',
              cashAdvance: 'Error',
              bankAdvance: 'Error',
              bankOtAmount: 'Error'
            };
          }
        })
      );

      setAllSalary(updatedData);
      setOriginalSalary(updatedData);
    } catch (error) {
      console.error('Error building full salary data:', error);
      showToast('error', 'Error calculating salary details');
    } finally {
      setIsDataLoading(false);
    }
  };

  const getBankCashAmounts = async (employee) => {
    try {
      const response = await apiCalls(
        'get',
        `employeemaster/getBankAndCashAmtForSalaryProcess?branchCode=${branchCode}&employeeCode=${employee.employeeCode}&empSalaryDays=${employee.empSalaryDays}&month=${formData.month}&orgId=${orgId}&totalCompanyWorkingDays=${employee.totalCompanyWorkingDays}&year=${formData.year}`
      );

      if (response.status === true && response.paramObjectsMap.salaryProcessVO?.length > 0) {
        const data = response.paramObjectsMap.salaryProcessVO[0];
        return {
          totalEarnings: data.totalEarnings || 0,
          totalDeductions: data.totalDeductions || 0,
          bankAmount: data.bankAmount || 0,
          cashAmount: data.cashAmount || 0,
          cashAdvance: data.cashAdvance || 0,
          bankAdvance: data.bankAdvance || 0,
          bankOtAmount: data.bankOtAmount || 0,
          // Add PF/ESI from the API response
          pfAmount: data.pfAmount || 0,
          esiAmount: data.esiAmount || 0
        };
      }
      return {
        totalEarnings: 0,
        totalDeductions: 0,
        bankAmount: 0,
        cashAmount: 0,
        cashAdvance: 0,
        bankAdvance: 0,
        bankOtAmount: 0,
        pfAmount: 0,
        esiAmount: 0
      };
    } catch (error) {
      console.error('Error fetching bank/cash amounts:', error);
      return {
        totalEarnings: 0,
        totalDeductions: 0,
        bankAmount: 0,
        cashAmount: 0,
        cashAdvance: 0,
        bankAdvance: 0,
        bankOtAmount: 0,
        pfAmount: 0,
        esiAmount: 0
      };
    }
  };

  const getAllBranch = async () => {
    try {
      const response = await apiCalls('get', `master/branch?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setBranchList(response.paramObjectsMap.branchVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  // const handleSave = () => {
  //   const errors = {};

  //   if (!formData.month) {
  //     errors.month = 'Month is required';
  //   }
  //   if (!formData.year) {
  //     errors.year = 'Year is required';
  //   }

  //   if (mainTableData.length === 0) {
  //     errors.table = 'No data available in the table. Please add employees before saving.';
  //   }

  //   setFieldErrors(errors);

  //   if (Object.keys(errors).length === 0) {
  //     // Show OT confirmation dialog instead of directly saving
  //     setOtConfirmationDialog(true);
  //   } else {
  //     setFieldErrors(errors);
  //   }
  // };

  // const handleConfirmedSave = async () => {
  //   setIsLoading(true);
  //   setOtConfirmationDialog(false);

  //   try {
  //     const saveDataArray = mainTableData.map((employee) => ({
  //       branch: branch,
  //       branchCode: branchCode,
  //       createdBy: loginUserName,
  //       empSalaryDays: parseFloat(employee.empSalaryDays) || 0,
  //       empTotalWorkingDays: parseFloat(employee.empTotalWorkingDays) || 0,
  //       employeeCode: employee.employeeCode,
  //       employeeName: employee.employeeName,
  //       totalEarnings: parseFloat(employee.totalEarnings) || 0,
  //       totalDeductions: parseFloat(employee.totalDeductions) || 0,
  //       lopLeave: parseFloat(employee.lopLeave) || 0,
  //       totalCompanyWorkingDays: parseFloat(employee.totalCompanyWorkingDays) || 0,
  //       totalLeave: parseFloat(employee.totalLeave) || 0,
  //       otHours: parseFloat(employee.otHours) || 0,
  //       orgId: parseInt(orgId),
  //       month: parseInt(formData.month),
  //       year: formData.year,
  //       // Add bank/cash fields
  //       bankAmount: parseFloat(employee.bankAmount) || 0,
  //       cashAmount: parseFloat(employee.cashAmount) || 0,
  //       cashAdvance: parseFloat(employee.cashAdvance) || 0,
  //       bankAdvance: parseFloat(employee.bankAdvance) || 0,
  //       bankOtAmount: parseFloat(employee.bankOtAmount) || 0,
  //       cashOtAmount: parseFloat(employee.cashOtAmount) || 0,
  //       pfAmount: parseFloat(employee.pfAmount) || 0,
  //       esiAmount: parseFloat(employee.esiAmount) || 0
  //     }));

  //     console.log('Saving Selected Employee Data:', saveDataArray);
  //     const response = await apiCalls('put', '/employeemaster/createUpdateSalaryProcess', saveDataArray);

  //     if (response.status === true) {
  //       showToast('success', 'Salary Process created successfully');
  //       handleCancel();
  //     } else {
  //       const errorMsg = response.paramObjectsMap?.errorMessage || 'Salary Process creation failed';
  //       showToast('error', errorMsg);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     showToast('error', 'Salary Process creation failed');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSave = async () => {
    // Validation checks
    const errors = {};

    if (!formData.month) {
      errors.month = 'Month is required';
    }
    if (!formData.year) {
      errors.year = 'Year is required';
    }

    if (mainTableData.length === 0) {
      errors.table = 'No data available in the table. Please add employees before saving.';
    }

    // If there are validation errors, show them and stop execution
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return; // Stop the function here if validation fails
    }

    // Clear any previous errors
    setFieldErrors({});

    // If validation passes, proceed with saving
    setIsLoading(true);

    try {
      const saveDataArray = mainTableData.map((employee) => ({
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        empSalaryDays: parseFloat(employee.empSalaryDays) || 0,
        empTotalWorkingDays: parseFloat(employee.empTotalWorkingDays) || 0,
        employeeCode: employee.employeeCode,
        employeeName: employee.employeeName,
        totalEarnings: parseFloat(employee.totalEarnings) || 0,
        totalDeductions: parseFloat(employee.totalDeductions) || 0,
        lopLeave: parseFloat(employee.lopLeave) || 0,
        totalCompanyWorkingDays: parseFloat(employee.totalCompanyWorkingDays) || 0,
        totalLeave: parseFloat(employee.totalLeave) || 0,
        otHours: parseFloat(employee.otHours) || 0,
        orgId: parseInt(orgId),
        month: parseInt(formData.month),
        year: formData.year,
        // Add bank/cash fields
        bankAmount: parseFloat(employee.bankAmount) || 0,
        cashAmount: parseFloat(employee.cashAmount) || 0,
        cashAdvance: parseFloat(employee.cashAdvance) || 0,
        bankAdvance: parseFloat(employee.bankAdvance) || 0,
        bankOtAmount: parseFloat(employee.bankOtAmount) || 0,
        cashOtAmount: parseFloat(employee.cashOtAmount) || 0,
        pfAmount: parseFloat(employee.pfAmount) || 0,
        esiAmount: parseFloat(employee.esiAmount) || 0
      }));

      console.log('Saving Selected Employee Data:', saveDataArray);
      const response = await apiCalls('put', '/employeemaster/createUpdateSalaryProcess', saveDataArray);

      if (response.status === true) {
        showToast('success', 'Salary Process created successfully');
        handleCancel();
      } else {
        const errorMsg = response.paramObjectsMap?.errorMessage || 'Salary Process creation failed';
        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Salary Process creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToOTApproval = () => {
    // Save current state to localStorage/sessionStorage
    localStorage.setItem(
      'salaryProcessData',
      JSON.stringify({
        formData,
        mainTableData,
        selectedMonth,
        allSalary,
        originalSalary
      })
    );

    setOtConfirmationDialog(false);
    navigate('/basicMaster/OverTime', {
      state: { fromSalaryProcess: true }
    });
  };

  useEffect(() => {
    const savedData = localStorage.getItem('salaryProcessData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData.formData);
      setMainTableData(parsedData.mainTableData);
      setSelectedMonth(parsedData.selectedMonth);
      setAllSalary(parsedData.allSalary);
      setOriginalSalary(parsedData.originalSalary);

      // Clear the saved data after restoring
      localStorage.removeItem('salaryProcessData');
    }
  }, []);

  // const handleCancel = () => {
  //   // Reset to first available year and month from API
  //   if (years.length > 0) {
  //     const firstYear = years[0];
  //     setFormData(prev => ({
  //       ...prev,
  //       year: firstYear,
  //       month: '',
  //       branch: 'ALL',
  //       departmentName: 'ALL',
  //       employeeType: '',
  //       contractor: ''
  //     }));
  //     updateAvailableMonths(firstYear);
  //   } else {
  //     setFormData({
  //       month: '',
  //       year: '',
  //       branch: 'ALL',
  //       departmentName: 'ALL',
  //       employeeType: '',
  //       contractor: ''
  //     });
  //     setSelectedMonth('');
  //   }

  //   setFieldErrors({
  //     month: false,
  //     year: false,
  //     branch: false,
  //     departmentName: false,
  //     employeeType: false,
  //     contractor: false
  //   });
  //   setAllSalary([]);
  //   setShowSelectedMonthYear(false);
  //   setMainTableData([]);
  //   setDialogOpen(false);
  //   setFormResetKey((prev) => prev + 1);
  // };

  const handleCancel = () => {
    // Reset to first available year and month from API
    if (years.length > 0) {
      const firstYear = years[0];

      // Reset form data first
      setFormData(prev => ({
        ...prev,
        year: firstYear,
        month: '',
        branch: 'ALL',
        departmentName: 'ALL',
        employeeType: '',
        contractor: ''
      }));

      // Then update months - this will auto-select the first month
      updateAvailableMonths(firstYear);
    } else {
      setFormData({
        month: '',
        year: '',
        branch: 'ALL',
        departmentName: 'ALL',
        employeeType: '',
        contractor: ''
      });
      setSelectedMonth('');
    }

    setFieldErrors({
      month: false,
      year: false,
      branch: false,
      departmentName: false,
      employeeType: false,
      contractor: false
    });
    setAllSalary([]);
    setShowSelectedMonthYear(false);
    setMainTableData([]);
    setDialogOpen(false);
    setFormResetKey((prev) => prev + 1);
  };

  const handleRowSelect = (employeeCode) => {
    setSelectedRows((prev) => (prev.includes(employeeCode) ? prev.filter((code) => code !== employeeCode) : [...prev, employeeCode]));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allSalary.map((item) => item.employeeCode));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (dialogOpen) {
      if (mainTableData.length > 0) {
        setSelectedRows(mainTableData.map((item) => item.employeeCode));
      } else {
        setSelectedRows([]); // reset if no confirmed data
      }
    }
  }, [dialogOpen, mainTableData]);

  // Add this useEffect to handle initial data setup
  useEffect(() => {
    if (availableYearsMonths.length > 0 && years.length > 0 && !formData.month) {
      const firstYear = years[0];
      updateAvailableMonths(firstYear);
    }
  }, [availableYearsMonths, years]);

  const handleConfirmSelection = () => {
    // Use originalSalary instead of allSalary to ensure we have all data
    const selectedData = originalSalary.filter((item) => selectedRows.includes(item.employeeCode));
    setMainTableData(selectedData);
    setDialogOpen(false);
  };

  const handlePopupCancel = () => {
    setSelectedRows([]);
    setDialogOpen(false);
    setGoIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const formatNumberWithCommas = (value) => {
    // Handle special strings
    if (value === 'Loading...' || value === 'Error' || value === 'Pending') {
      return value;
    }

    // If null, undefined, or empty string → return empty
    if (value === null || value === undefined || value === '0' || value === '0.0' || value === '0.00') {
      return '-';
    }

    const num = parseFloat(value);
    if (isNaN(num)) return '';

    // Integer formatting
    if (Number.isInteger(num)) {
      return num.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      });
    }

    // Decimal formatting (up to 1 decimal, no trailing zero)
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0
    });
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleCancel} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>

          <div className="col-md-3 mb-3">
            <FormControl fullWidth error={!!fieldErrors.year} size="small">
              <InputLabel>Year</InputLabel>
              <Select
                label="Year"
                value={formData.year}
                size="small"
                onChange={handleYearChange}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.year && <FormHelperText>{fieldErrors.year}</FormHelperText>}
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.month}>
              <InputLabel>Month</InputLabel>
              <Select
                label="Month"
                value={selectedMonth}
                onChange={handleMonthChange}
                disabled={availableMonths.length === 0}
              >
                {availableMonths.map((m) => (
                  <MenuItem key={m.value} value={m.name}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.month && <FormHelperText>{fieldErrors.month}</FormHelperText>}
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
              <InputLabel id="branch-label">Branch</InputLabel>
              <Select labelId="branch-label" label="Branch" value={formData.branch} onChange={handleSelectChange} name="branch">
                <MenuItem value="ALL">ALL</MenuItem>
                {branchList.length > 0 &&
                  branchList.map((group, index) => (
                    <MenuItem key={index} value={group.branch}>
                      {group.branch}
                    </MenuItem>
                  ))}
              </Select>
              {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.departmentName}>
              <InputLabel id="departmentName-label">Department</InputLabel>
              <Select
                labelId="departmentName-label"
                label="Department"
                value={formData.departmentName}
                onChange={handleSelectChange}
                name="departmentName"
              >
                <MenuItem value="ALL">ALL</MenuItem>
                {departmentList.length > 0 &&
                  departmentList.map((group, index) => (
                    <MenuItem key={index} value={group.departmentName}>
                      {group.departmentName}
                    </MenuItem>
                  ))}
              </Select>
              {fieldErrors.departmentName && <FormHelperText>{fieldErrors.departmentName}</FormHelperText>}
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <Autocomplete
              key={formResetKey}
              options={['All', 'Employee', 'Contractor']}
              getOptionLabel={(option) => option}
              sx={{ width: '100%' }}
              size="small"
              value={formData.employeeType}
              onChange={(event, newValue) => {
                handleInputChange({ target: { name: 'employeeType', value: newValue || 'All' } });
                if (newValue !== 'Contractor') {
                  handleInputChange({ target: { name: 'contractor', value: '' } });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee *"
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

          {formData.employeeType === 'Contractor' && (
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
          )}

          <div className="col-md-3 mb-3">
            <Button
              variant="contained"
              onClick={handleGetSalaryProcess}
              disabled={isGoLoading}
              sx={{
                borderRadius: '8px',
                boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                textTransform: 'none',
                background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                '&:disabled': {
                  background: '#cccccc'
                }
              }}
            >
              {isGoLoading ? <CircularProgress size={24} color="inherit" /> : 'Go'}
            </Button>
          </div>
        </div>

        <>
          <div className="row mt-2">
            <div className="col-lg-12">
              <div className="table-responsive">
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <TableRow>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>#</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>Code</strong>
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{
                            color: 'white',
                          }}>
                          <strong>Name</strong>
                        </TableCell>
                        {formData.departmentName === 'ALL' ? (
                          <TableCell align='center' sx={{ color: 'white' }}>
                            <strong>Department</strong>
                          </TableCell>
                        ) : (
                          ''
                        )}
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>Present</strong>
                        </TableCell>
                        {/* <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>OT</strong>
                        </TableCell> */}
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>Earnings</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>LOP</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>Advance</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>PF</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>ESI</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>Deductions</strong>
                        </TableCell>
                        <TableCell align='center' sx={{ color: 'white' }}>
                          <strong>Net</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {mainTableData.length > 0 ? (
                        mainTableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave, index) => (
                          <TableRow key={leave.employeeCode} hover>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell align='left'>{leave.employeeCode}</TableCell>
                            <TableCell align='left'>{leave.employeeName}</TableCell>
                            {formData.departmentName === 'ALL' ? <TableCell align='left'>{leave.department}</TableCell> : null}
                            <TableCell align='right'>{formatNumberWithCommas(leave.totalCompanyWorkingDays)}</TableCell>
                            <TableCell align='right'>{formatNumberWithCommas(leave.empTotalWorkingDays)}</TableCell>
                            {/* <TableCell align='right'>{formatNumberWithCommas(leave.bankOtAmount)}</TableCell> */}
                            <TableCell align='right'>{formatNumberWithCommas(leave.totalEarnings)}</TableCell>
                            <TableCell align='right'>{formatNumberWithCommas(leave.lopLeave)}</TableCell>
                            <TableCell align='right'>{formatNumberWithCommas(leave.bankAdvance)}</TableCell>
                            <TableCell align='right'>{formatNumberWithCommas(leave.pfAmount)}</TableCell>
                            <TableCell align='right'>{formatNumberWithCommas(leave.esiAmount)}</TableCell>
                            <TableCell align='right'>{formatNumberWithCommas(leave.totalDeductions)}</TableCell>
                            <TableCell align='right'>{formatNumberWithCommas(leave.bankAmount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={formData.departmentName === 'ALL' ? 14 : 13} align="center">
                            No data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={mainTableData.length}
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

          <ToastContainer />
        </>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '80vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 1000,
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            padding: '16px 24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Select Employees</span>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              sx={{ width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </div>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: 0,
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {isDataLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                flexDirection: 'column'
              }}
            >
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading salary details...
              </Typography>
            </div>
          ) : allSalary.length === 0 ? (
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
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <Checkbox
                        indeterminate={selectedRows.length > 0 && selectedRows.length < allSalary.length}
                        checked={allSalary.length > 0 && selectedRows.length === allSalary.length}
                        onChange={handleSelectAll}
                        sx={{
                          color: '#e9dcdc',
                          '&.Mui-checked': {
                            color: 'white',
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: 'white',
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white',
                      }}
                    >
                      <strong>Code</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white',
                      }}
                    >
                      <strong>Name</strong>
                    </TableCell>
                    {formData.departmentName === 'ALL' && (
                      <TableCell
                        align="center"
                        sx={{
                          background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                          color: 'white',
                          align: 'center',
                        }}
                      >
                        <strong>Department</strong>
                      </TableCell>
                    )}
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>Total Days</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>Present</strong>
                    </TableCell>
                    {/* <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>OT</strong>
                    </TableCell> */}
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>Earnings</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>LOP</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>Advance</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>PF</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>ESI</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>Deductions</strong>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                        color: 'white'
                      }}
                    >
                      <strong>Net</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allSalary.map((leave) => {
                    const isItemSelected = selectedRows.includes(leave.employeeCode);
                    return (
                      <TableRow
                        key={leave.employeeCode}
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onChange={() => handleRowSelect(leave.employeeCode)}
                          />
                        </TableCell>
                        <TableCell>{leave.employeeCode}</TableCell>
                        <TableCell>{leave.employeeName}</TableCell>
                        {formData.departmentName === 'ALL' && <TableCell>{leave.department}</TableCell>}
                        <TableCell align='right'>{formatNumberWithCommas(leave.totalCompanyWorkingDays)}</TableCell>
                        <TableCell align='right'>{formatNumberWithCommas(leave.empTotalWorkingDays)}</TableCell>
                        {/* <TableCell align='right'>{formatNumberWithCommas(leave.bankOtAmount)}</TableCell> */}
                        <TableCell align='right'>{formatNumberWithCommas(leave.totalEarnings)}</TableCell>
                        <TableCell align='right'>{formatNumberWithCommas(leave.lopLeave)}</TableCell>
                        <TableCell align='right'>{formatNumberWithCommas(leave.bankAdvance)}</TableCell>
                        <TableCell align='right'>{formatNumberWithCommas(leave.pfAmount)}</TableCell>
                        <TableCell align='right'>{formatNumberWithCommas(leave.esiAmount)}</TableCell>
                        <TableCell align='right'>{formatNumberWithCommas(leave.totalDeductions)}</TableCell>
                        <TableCell align='right'>{formatNumberWithCommas(leave.bankAmount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
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
            {selectedRows.length} / {allSalary.length}
          </Typography>
          <div>
            <Button variant="contained" onClick={handleConfirmSelection} disabled={selectedRows.length === 0}>
              Confirm
            </Button>
            <Button onClick={handlePopupCancel} color="secondary" sx={{ mr: 1 }}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
      {/* <Dialog open={otConfirmationDialog} onClose={() => setOtConfirmationDialog(false)} aria-labelledby="ot-confirmation-dialog">
        <DialogTitle id="ot-confirmation-dialog" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
          Confirm OT Approval
          <IconButton onClick={() => setOtConfirmationDialog(false)} size="small" sx={{ marginLeft: 'auto' }}>
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Confirm OT Approval Before Salary.</DialogContentText>
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
    </>
  );
};

export default SalaryProcess;