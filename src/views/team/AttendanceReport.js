// import React, { useState, useEffect } from 'react';
// import FormControl from '@mui/material/FormControl';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import ActionButton from 'utils/ActionButton';
// import SearchIcon from '@mui/icons-material/Search';
// import ClearIcon from '@mui/icons-material/Clear';
// import Alert from '@mui/material/Alert';
// import Autocomplete from '@mui/material/Autocomplete';
// import TextField from '@mui/material/TextField';
// import apiCalls from 'apicall';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Button,
//   MenuItem,
//   Select,
//   InputLabel,
//   IconButton,
//   Tooltip,
//   TablePagination
// } from '@mui/material';
// import ToastComponent, { showToast } from 'utils/toast-component';
// import { getAllActiveBranches } from 'utils/CommonFunctions';
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// import DownloadIcon from '@mui/icons-material/Download';
// // import * as XLSX from 'xlsx';
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import dayjs from 'dayjs';

// const AttendanceReport = () => {
//   const [companyDetails, setCompanyDetails] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState(dayjs());
//   const [selectedYear, setSelectedYear] = useState(dayjs());
//   const [error, setError] = useState('');
//   const [empList, setEmpList] = useState([]);
//   const [branchList, setBranchList] = useState([]);
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

//   const [formData, setFormData] = useState({
//     employeeCode: 'All',
//     branch: 'All'
//   });

//   const [orgId] = useState(localStorage.getItem('orgId'));

//   // Fetch employee list
//   const getAllUsers = async () => {
//     try {
//       const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?orgId=${orgId}`);
//       if (response.status === true) {
//         const employees = response.paramObjectsMap.employeeVO.map((emp) => ({
//           ...emp,
//           employeeName: emp.employee || 'Unknown',
//           label: `${emp.employeeCode} - ${emp.employee || 'Unknown'}`
//         }));
//         setEmpList([{ employeeCode: 'All', employeeName: 'All Employees', label: 'All Employees' }, ...employees]);
//         setSelectedEmployee({ employeeCode: 'All', employeeName: 'All Employees', label: 'All Employees' });
//       } else {
//         console.error('API Error:', response);
//       }
//     } catch (error) {
//       console.error('Error fetching employee data:', error);
//     }
//   };

//   // Fetch branch list
//   const getAllBranches = async () => {
//     try {
//       const branchData = await getAllActiveBranches(orgId);
//       setBranchList([{ id: 0, branch: 'All', branchCode: 'All' }, ...branchData]);
//     } catch (error) {
//       console.error('Error fetching branch data:', error);
//     }
//   };

//   useEffect(() => {
//     getAllUsers();
//     getAllBranches();
//     getCompanyDetails();
//   }, []);

//   const handleSearch = async () => {
//     if (!selectedMonth || !selectedYear) {
//       showToast('error', 'Please select month and year');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const monthVal = selectedMonth ? selectedMonth.month() + 1 : '';
//       const yearVal = selectedYear ? selectedYear.year() : '';
//       const employeeCode = formData.employeeCode === 'All' ? 'All' : formData.employeeCode;
//       const branch = formData.branch === 'All' ? 'All' : formData.branch;

//       const result = await apiCalls(
//         'get',
//         `checkinout/getApprovedAttendanceSummaryByOrgId?branch=${branch}&empCode=${employeeCode}&finYear=${yearVal}&month=${monthVal}&orgId=${orgId}`
//       );

//       if (result?.status) {
//         const attendance = result?.paramObjectsMap?.attendanceSummaryVO || [];
//         setAttendanceData(attendance);
//         setDialogOpen(true);
//       } else {
//         showToast('error', result?.paramObjectsMap?.message || 'No records found');
//       }
//     } catch (err) {
//       showToast('error', 'Error fetching attendance data');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDialogClose = () => {
//     setDialogOpen(false);
//     setSearchQuery('');
//     setPage(0);
//   };

//   const handleClear = () => {
//     setSelectedMonth(dayjs()); // Reset to current month
//     setSelectedYear(dayjs()); // Reset to current year
//     setFormData({
//       employeeCode: 'All',
//       branch: 'All'
//     });
//     setError('');
//     setSelectedEmployee({ employeeCode: 'All', employeeName: 'All Employees', label: 'All Employees' });
//     setSearchQuery('');
//   };

//   // Filter data based on search query
//   const filteredData = attendanceData.filter((row) =>
//     Object.values(row).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   // Pagination
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // PDF Download
//   const handleDownloadPDF = ({ logo }) => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text('ATTANCE SUMMARY', 80, 17);

//     // Page size values
//     const pageW = doc.internal.pageSize.getWidth();
//     const pageH = doc.internal.pageSize.getHeight();
//     // logo section
//     const logoBase64 = logo;
//     if (logoBase64) {
//       doc.addImage(logoBase64, 'PNG', 5, 0, 40, 30);
//     }
//     // Add filters information
//     doc.setFontSize(10);
//     const filterLine =
//       `Branch: ${formData.branch === 'All' ? 'All' : formData.branch} | ` +
//       `Employee: ${formData.employeeCode === 'All' ? 'All' : formData.employeeCode} | ` +
//       `Month: ${selectedMonth ? selectedMonth.format('MMMM') : ''} | ` +
//       `Year: ${selectedYear ? selectedYear.format('YYYY') : ''}`;

//     doc.text(filterLine, 14, 30);
//     // doc.text(`Branch: ${formData.branch === 'All' ? 'All' : formData.branch}`, 14, 30);
//     // doc.text(`Employee: ${formData.employeeCode === 'All' ? 'All' : formData.employeeCode}`, 14, 36);
//     // doc.text(`Month: ${selectedMonth ? selectedMonth.format('MMMM') : ''}`, 14, 42);
//     // doc.text(`Year: ${selectedYear ? selectedYear.format('YYYY') : ''}`, 14, 48);

//     doc.autoTable({
//       startY: 32,
//       head: [
//         [
//           'Code',
//           'Name',
//           'Branch',
//           'Department',
//           'Total Days',
//           'Holidays',
//           'Weekoff',
//           'Leaves',
//           'LOP',
//           'Absent',
//           'Present',
//           'Salary Days',
//           'Status'
//         ]
//       ],
//       body: attendanceData.map((row) => [
//         row.empCode,
//         row.empName,
//         row.branch,
//         row.department,
//         row.totalDays,
//         row.holidays,
//         row.weekoff,
//         row.leaves,
//         row.lop,
//         row.absent,
//         row.present,
//         row.salarydays,
//         row.approveStatus
//       ]),
//       styles: { fontSize: 8 },
//       headStyles: { fillColor: [42, 75, 77] }
//     });
//     doc.autoTable({
//       didDrawPage: (data) => {
//         doc.setFontSize(8).setTextColor('#555555');
//         doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
//         doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });
//       }
//     });
//     doc.save('attendance_summary.pdf');
//   };
//   // Excel Download
//   const handleDownloadExcel = async ({ logo }) => {
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Attendance Summary');
//     // logo
//     sheet.mergeCells('A1:B4');
//     if (logo) {
//       try {
//         const base64Data = logo.split(',')[1] || logo;
//         if (base64Data.length >= 100) {
//           const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
//           const imageId = workbook.addImage({
//             base64: base64Data,
//             extension
//           });
//           sheet.addImage(imageId, {
//             tl: { col: 0, row: 0 }, // A1
//             ext: { width: 140, height: 100 }
//           });
//         }
//       } catch (err) {
//         console.error('Error adding logo:', err);
//       }
//     }
//     // --- Add Report Title (Employee Details) ---
//     const titleRow = sheet.getRow(2);
//     sheet.mergeCells('C2:H3'); // merge a wide area after logo
//     const titleCell = sheet.getCell('C2');
//     titleCell.value = 'ATTANCE SUMMARY';
//     titleCell.font = { size: 16, bold: true };
//     titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

//     const metaRow = sheet.getRow(4);
//     metaRow.getCell(3).value = `Branch: ${formData.branch === 'All' ? 'All' : formData.branch}`;
//     metaRow.getCell(4).value = `Employee: ${formData.employeeCode === 'All' ? 'All' : formData.employeeCode}`;
//     metaRow.getCell(5).value = `Month: ${selectedMonth ? selectedMonth.format('MMMM') : ''}`;
//     metaRow.getCell(6).value = `Year: ${selectedYear ? selectedYear.format('YYYY') : ''}`;
//     metaRow.getCell(7).value = `Generated On: ${dayjs().format('DD-MM-YYYY HH:mm')} `;
//     metaRow.getCell(8).value = `Generated By: ${loginUserName || 'Admin'}`;
//     metaRow.font = { size: 11, bold: true };
//     const headers = [
//       'Code',
//       'Name',
//       'Branch',
//       'Department',
//       'Total Days',
//       'Holidays',
//       'Weekoff',
//       'Leaves',
//       'LOP',
//       'Absent',
//       'Present',
//       'Salary Days',
//       'Status'
//     ];
//     const columnWidths = headers.map(() => ({ width: 20 }));
//     sheet.columns = headers.map((header, i) => ({
//       key: header,
//       ...columnWidths[i]
//     }));
//     const headerRow = sheet.getRow(5);
//     headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     headerRow.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: '3F51B5' }
//     };
//     headers.forEach((header, index) => {
//       const cell = headerRow.getCell(index + 1);
//       cell.value = header;
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: '3F51B5' }
//       };
//     });

//     attendanceData.forEach((row, rowIndex) => {
//       const rowData = {
//         Code: row.empCode,
//         Name: row.empName,
//         Branch: row.branch,
//         Department: row.department,
//         'Total Days': row.totalDays,
//         Holidays: row.holidays,
//         Weekoff: row.weekoff,
//         Leaves: row.leaves,
//         LOP: row.lop,
//         Absent: row.absent,
//         Present: row.present,
//         'Salary Days': row.salarydays,
//         Status: row.approveStatus
//       };
//       const dataRow = sheet.addRow(rowData);
//       dataRow.eachCell((cell) => {
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'F3F3F3' }
//         };
//       });
//     });
//     sheet.views = [{ state: 'frozen', ySplit: 5 }];
//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     });

//     saveAs(blob, `Attance_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
//   };

//   const getCompanyDetails = async () => {
//     try {
//       const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
//       setCompanyDetails(response.paramObjectsMap.companyVO);
//     } catch (error) {
//       console.error('Error fetching company details:', error);
//       showToast('Error fetching company details', 'error');
//     }
//   };

//   return (
//     <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
//       <div className="row d-flex ml">
//         <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
//           <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} disabled={isLoading} />
//           <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} disabled={isLoading} />
//         </div>
//       </div>

//       {error && (
//         <div className="row">
//           <div className="col-md-6 mb-3">
//             <Alert severity="error">{error}</Alert>
//           </div>
//         </div>
//       )}

//       <div className="row">
//         <div className="col-md-3 mb-3">
//           <FormControl size="small" variant="outlined" fullWidth>
//             <InputLabel id="branch-label">Branch</InputLabel>
//             <Select
//               labelId="branch-label"
//               label="Branch"
//               name="branch"
//               value={formData.branch}
//               onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
//             >
//               {branchList.map((branch) => (
//                 <MenuItem key={branch.id || 0} value={branch.branchCode}>
//                   {branch.branch}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </div>
//         <div className="col-md-3 mb-3">
//           <Autocomplete
//             options={empList}
//             getOptionLabel={(option) => option.label || ''}
//             sx={{ width: '100%' }}
//             size="small"
//             value={selectedEmployee}
//             onChange={(event, newValue) => {
//               const selectedEmp = newValue || { employeeCode: 'All', employeeName: 'All Employees' };
//               setSelectedEmployee(selectedEmp);
//               setFormData((prev) => ({
//                 ...prev,
//                 employeeCode: selectedEmp.employeeCode
//               }));
//             }}
//             renderInput={(params) => <TextField {...params} label="Employee" variant="outlined" fullWidth />}
//             isOptionEqualToValue={(option, value) => option.employeeCode === value.employeeCode}
//           />
//         </div>

//         <div className="col-md-3 mb-3">
//           <FormControl fullWidth>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 views={['month']}
//                 label="Select Month"
//                 value={selectedMonth}
//                 slotProps={{
//                   textField: {
//                     size: 'small'
//                   }
//                 }}
//                 onChange={(newValue) => setSelectedMonth(newValue)}
//               />
//             </LocalizationProvider>
//           </FormControl>
//         </div>

//         <div className="col-md-3 mb-3">
//           <FormControl fullWidth>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 views={['year']}
//                 label="Select Year"
//                 value={selectedYear}
//                 slotProps={{
//                   textField: {
//                     size: 'small'
//                   }
//                 }}
//                 onChange={(newValue) => setSelectedYear(newValue)}
//               />
//             </LocalizationProvider>
//           </FormControl>
//         </div>
//       </div>

//       {/* Dialog for showing attendance report */}
//       <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth>
//         <DialogTitle
//           sx={{
//             fontWeight: 'bold',
//             fontSize: '20px',
//             backgroundColor: '#f5f5f5',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center'
//           }}
//         >
//           Attendance Summary Report
//           <div>
//             <Tooltip title="Download PDF">
//               <IconButton onClick={() => handleDownloadPDF({ logo: companyDetails[0]?.companyLogo })}>
//                 <PictureAsPdfIcon color="error" />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title="Download Excel">
//               <IconButton onClick={() => handleDownloadExcel({ logo: companyDetails[0]?.companyLogo })}>
//                 <DownloadIcon color="primary" />
//               </IconButton>
//             </Tooltip>
//           </div>
//         </DialogTitle>

//         <DialogContent>
//           <div className="col-md-3 mt-3">
//             <TextField
//               label="Search"
//               variant="outlined"
//               size="small"
//               fullWidth
//               sx={{ mb: 2 }}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               InputProps={{
//                 startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
//               }}
//             />
//           </div>

//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {[
//                   'Code',
//                   { label: 'Name', width: '200px' },
//                   'Branch',
//                   { label: 'Department', width: '200px' },
//                   'Total Days',
//                   'Holidays',
//                   'Weekoff',
//                   'Leaves',
//                   'LOP',
//                   'OT Hours',
//                   'Absent',
//                   'Present',
//                   'Salary Days',
//                   'Status'
//                 ].map((heading, index) => (
//                   <TableCell
//                     key={index}
//                     sx={{
//                       background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
//                       color: '#fff',
//                       fontWeight: 'bold',
//                       textAlign: 'center',
//                       minWidth: typeof heading === 'object' ? heading.width : 'auto'
//                     }}
//                   >
//                     {typeof heading === 'object' ? heading.label : heading}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {filteredData.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={13} align="center" sx={{ padding: 3, fontStyle: 'italic', color: '#777' }}>
//                     No records found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
//                   <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
//                     <TableCell align="center">{row.empCode}</TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{ minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
//                     >
//                       {row.empName}
//                     </TableCell>
//                     <TableCell align="center">{row.branch}</TableCell>
//                     <TableCell
//                       align="center"
//                       sx={{ minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
//                     >
//                       {row.department}
//                     </TableCell>
//                     <TableCell align="center">{row.totalDays}</TableCell>
//                     <TableCell align="center">{row.holidays}</TableCell>
//                     <TableCell align="center">{row.weekoff}</TableCell>
//                     <TableCell align="center">{row.leaves}</TableCell>
//                     <TableCell align="center">{row.lop}</TableCell>
//                     <TableCell align="center">{row.otHours}</TableCell>
//                     <TableCell align="center">{row.absent}</TableCell>
//                     <TableCell align="center">{row.present}</TableCell>
//                     <TableCell align="center">{row.salarydays}</TableCell>
//                     <TableCell align="center">{row.approveStatus}</TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>

//           <TablePagination
//             rowsPerPageOptions={[10, 25, 50]}
//             component="div"
//             count={filteredData.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//           />

//           <div style={{ marginTop: 20, textAlign: 'right' }}>
//             <Button
//               variant="contained"
//               sx={{
//                 background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)'
//               }}
//               onClick={handleDialogClose}
//             >
//               Close
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//       <ToastComponent />
//     </div>
//   );
// };

// export default AttendanceReport;

import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ActionButton from 'utils/ActionButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
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
  MenuItem,
  Select,
  InputLabel,
  IconButton,
  Tooltip,
  TablePagination,
  Box,
  InputAdornment
} from '@mui/material';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { meta } from 'eslint-plugin-prettier';

const AttendanceReport = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [selectedYear, setSelectedYear] = useState(dayjs());
  const [error, setError] = useState('');
  const [empList, setEmpList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    employeeCode: 'All',
    branch: 'All'
  });

  const [orgId] = useState(localStorage.getItem('orgId'));

  // Fetch employee list
  const getAllUsers = async () => {
    try {
      const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        const employees = response.paramObjectsMap.employeeVO.map((emp) => ({
          ...emp,
          employeeName: emp.employee || 'Unknown',
          label: `${emp.employeeCode} - ${emp.employee || 'Unknown'}`
        }));
        setEmpList([{ employeeCode: 'All', employeeName: 'All Employees', label: 'All Employees' }, ...employees]);
        setSelectedEmployee({ employeeCode: 'All', employeeName: 'All Employees', label: 'All Employees' });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  // Fetch branch list
  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList([{ id: 0, branch: 'All', branchCode: 'All' }, ...branchData]);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  useEffect(() => {
    getAllUsers();
    getAllBranches();
    getCompanyDetails();
  }, []);

  const handleSearch = async () => {
    if (!selectedMonth || !selectedYear) {
      showToast('error', 'Please select month and year');
      return;
    }

    setIsLoading(true);

    try {
      const monthVal = selectedMonth ? selectedMonth.month() + 1 : '';
      const yearVal = selectedYear ? selectedYear.year() : '';
      const employeeCode = formData.employeeCode === 'All' ? 'All' : formData.employeeCode;
      const branch = formData.branch === 'All' ? 'All' : formData.branch;

      const result = await apiCalls(
        'get',
        `checkinout/getApprovedAttendanceSummaryByOrgId?branch=${branch}&empCode=${employeeCode}&finYear=${yearVal}&month=${monthVal}&orgId=${orgId}`
      );

      if (result?.status) {
        const attendance = result?.paramObjectsMap?.attendanceSummaryVO || [];
        setAttendanceData(attendance);
        setDialogOpen(true);
      } else {
        showToast('error', result?.paramObjectsMap?.message || 'No records found');
      }
    } catch (err) {
      showToast('error', 'Error fetching attendance data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSearchQuery('');
    setPage(0);
  };

  const handleClear = () => {
    setSelectedMonth(dayjs()); // Reset to current month
    setSelectedYear(dayjs()); // Reset to current year
    setFormData({
      employeeCode: 'All',
      branch: 'All'
    });
    setError('');
    setSelectedEmployee({ employeeCode: 'All', employeeName: 'All Employees', label: 'All Employees' });
    setSearchQuery('');
  };

  // Filter data based on search query
  const filteredData = attendanceData.filter((row) =>
    Object.values(row).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // PDF Download
const handleDownloadPDF = ({ logo }) => {
   if (attendanceData.length === 0) {
        showToast('error', 'No data to download');
        return;
      }
  const doc = new jsPDF({
     orientation: 'landscape',
});

  // Page dimensions
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ==== Title with Background ====
  const title = 'Attendance Report';
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');

  const titleWidth = doc.getTextWidth(title);
  const titlePaddingX = 6;
  const titlePaddingY = 4;
  const titleHeight = 10;
  const titleX = (pageW - (titleWidth + titlePaddingX * 2)) / 2;
  const titleY = 15;

  // Draw background behind title
  doc.setFillColor(220, 240, 255); // Light blue
  doc.roundedRect(
    titleX,
    titleY - titlePaddingY,
    titleWidth + titlePaddingX * 2,
    titleHeight,
    4,
    4,
    'F'
  );

  // Draw title text on top
  doc.setTextColor(40, 40, 40);
  doc.text(title, pageW / 2, titleY + 3, { align: 'center' });

  
  if (logo) {
    doc.addImage(logo, 'PNG', 5, 0, 40, 30); // X, Y, width, height
  }

  // ==== Filter Info Section ====
  const filterY = 25;
  // let cursorX = 100;

//   const labelValuePairs = [
//     // { label: 'Branch:', value: formData.branch === 'All' ? 'All' : formData.branch },
  
//     {
//   label: '',
//   value:
//     formData.employeeCode === 'All' || selectedEmployee?.employeeName === 'All Employees'
//       ? ''
//       : `${formData.employeeCode} | ${selectedEmployee?.employeeName || '-'}`
// },
//     { label: '', value: selectedMonth ? selectedMonth.format('MMMM') : '-' },
//     { label: '', value: selectedYear ? selectedYear.format('YYYY') : '-' },
//     // { label: 'Total Days:', value: attendanceData.length > 0 ? attendanceData[0].totalDays : '-' }
//   ];

const labelValuePairs = [
 
  ...(formData.employeeCode !== 'All' && selectedEmployee?.employeeName !== 'All Employees'
    ? [{
        label: '',
        value: `${formData.employeeCode} | ${selectedEmployee?.employeeName || '-'}`
      }]
    : []
  ),
  { label: '', value: selectedMonth ? selectedMonth.format('MMMM') : '-' },
  { label: '', value: selectedYear ? selectedYear.format('YYYY') : '-' },
];


  doc.setFontSize(10);
  // Calculate total width for background
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
  // Bold label
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(pair.label, cursorX, rectY + 6);
  const labelW = doc.getTextWidth(pair.label + ' ');
  cursorX += labelW;

  // Normal value
  doc.setFont('helvetica', 'normal');
  const valueText = pair.value + (idx < labelValuePairs.length - 1 ? ' | ' : '');
  doc.text(valueText, cursorX, rectY + 6);
  const valueW = doc.getTextWidth(valueText);
  cursorX += valueW;
});

  // ==== Attendance Table ====
  // 
 const includeEmpCode = formData.employeeCode === 'All';
const includeEmpName = selectedEmployee?.employeeName === 'All Employees';
// const includeBranch = formData.branch === 'All';
// Header Row
const head = [[
  ...(includeEmpCode ? ['Code'] : []),
  ...(includeEmpName ? ['Name'] : []),
  // ...(includeBranch ? ['Branch'] : []),
  'Department',
  'Total',
  'Present',
  // 'LOP',
  'OT Hours',
  // 'Paid Days',
  // 'Status'
]];
const formatValue = (val) => (val === 0 || val === null || val === ''? '-' : val);
const body = attendanceData.map((row) => {
  return [
    ...(includeEmpCode ? formatValue([row.empCode]) : []),
    ...(includeEmpName ? formatValue([row.empName]) : []),
    // ...(includeBranch ? [row.branch] : []),
    formatValue(row.department),
    formatValue(row.totalDays),
    formatValue(row.salarydays),
    // formatValue(row.lop),
    formatValue(row.otHours),
    // formatValue(row.salarydays),
    // row.approveStatus
  ];
});
let columnStyles = {};
let colIndex = 0;

if (includeEmpCode) columnStyles[colIndex++] = { halign: 'left' };    // Code
if (includeEmpName) columnStyles[colIndex++] = { halign: 'left' };    // Name
// if (includeBranch)  columnStyles[colIndex++] = { halign: 'left' };    // Branch
columnStyles[colIndex++] = { halign: 'left' };    // Department
columnStyles[colIndex++] = { halign: 'right' };   // Present
columnStyles[colIndex++] = { halign: 'right' };   // OT Hours
columnStyles[colIndex++] = { halign: 'right' };   // LOP
columnStyles[colIndex++] = { halign: 'right' };   // Paid Days
// columnStyles[colIndex++] = { halign: 'left' };
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
    halign: 'center',
  },
  margin: { left: 14, right: 14 },
  columnStyles: columnStyles,

  // Add footer with Generated On / Generated By
  didDrawPage: (data) => {
  // const pageCount = doc.internal.getNumberOfPages();
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8).setTextColor('#555555');
    doc.text(
      `Print On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
      pageW - 15,
      pageH - 10,
      { align: 'right' }
    );
    doc.text(
      `Attendance Report - ${currentPage}`,
       pageW / 2,
      pageH - 10,
    { align: 'center' }
    );
    doc.text(
      `Printed By: ${loginUserName}`,
      15,
      pageH - 10,
      { align: 'left' }
    );
  }
});


  // ==== Save PDF ====
  doc.save('Attendance_Report.pdf');
};

  // Excel Download
  const handleDownloadExcel = async ({ logo }) => {
      if (attendanceData.length === 0) {
        showToast('error', 'No data to download');
        return;
      }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');
    // logo
    sheet.mergeCells('A1:B4');
    if (logo) {
      try {
        const base64Data = logo.split(',')[1] || logo;
        if (base64Data.length >= 100) {
          const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
          const imageId = workbook.addImage({
            base64: base64Data,
            extension
          });
          sheet.addImage(imageId, {
            tl: { col: 0, row: 0 }, 
            ext: { width: 140, height: 100 }
          });
        }
      } catch (err) {
        console.error('Error adding logo:', err);
      }
    }

    // Border

const allBorders = {
  top:    { style: 'thin' },
  left:   { style: 'thin' },
  bottom: { style: 'thin' },
  right:  { style: 'thin' }
};
    // Add Report Title (Employee Details)
    const titleRow = sheet.getRow(2);
    sheet.mergeCells('C2:H3'); 
    const titleCell = sheet.getCell('C2');
    titleCell.value = 'Attendance Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
   
    const metaRow = sheet.getRow(5);
    // metaRow.getCell(1).value = `Branch: ${formData.branch === 'All' ? 'All' : formData.branch}`;

    metaRow.getCell(1).value = formData.employeeCode === 'All' || selectedEmployee?.employeeName === 'All Employees'
      ? ''
      : `${formData.employeeCode} | ${selectedEmployee?.employeeName || ''}`
    metaRow.getCell(2).value = `${selectedMonth ? selectedMonth.format('MMMM') : ''}`;
    metaRow.getCell(3).value = `${selectedYear ? selectedYear.format('YYYY') : ''}`;
    // metaRow.getCell(5).value = `Total Days: ${attendanceData.length > 0 ? attendanceData[0].totalDays : '-'}`;
    metaRow.getCell(4).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')} `;
    metaRow.getCell(5).value = `Printed By: ${loginUserName || 'Admin'}`;
  for (let i = 1; i <= 5; i++) {
  const cell = metaRow.getCell(i);
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF593C8F'} 
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.border = allBorders;
}

    const headers = [

      ...(formData.employeeCode === 'All' ? ['Code'] : []),
       
       ...(selectedEmployee?.employeeName === 'All Employees' ? ['Name'] : []),

      //  ...(formData.branch === 'All' ? ['Branch'] : []),
        'Department',
        'Total Days',
           'Present',
            // 'LOP',
           'OT Hours',
        // 'Total Days',
        // 'Leaves',
        
        // 'Absent',
        // 'Paid Days',
        // 'Status'
    ];
    
    const columnWidths = headers.map(() => ({ width: 20 }));
    sheet.columns = headers.map((header, i) => ({
      key: header,
      ...columnWidths[i]
    }));
    
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

const formatValue = (val) => (val === 0 || val === null || val === ''? '-' : val);

    attendanceData.forEach((row) => {
    const rowData = [];
    if (formData.employeeCode === 'All') rowData.push(formatValue(row.empCode));
    if (selectedEmployee?.employeeName === 'All Employees') rowData.push(formatValue(row.empName));
    // if (formData.branch === 'All') rowData.push(row.branch);
    
    rowData.push(
      formatValue(row.department),
      formatValue(row.totalDays),
    formatValue(row.salarydays),
      // row.totalDays,
      // row.leaves,
    //  formatValue(row.lop),
       formatValue(row.otHours),
     
      // row.absent,
      // formatValue(row.salarydays),
      // row.approveStatus
    );
      
      
     
      const dataRow = sheet.addRow(rowData);
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F3F3F3' }
        };
         cell.border = allBorders;
//          cell.alignment = {  
//          indent: 1            
// };
 if (cell.value === '-') {
      cell.alignment = {
        horizontal: 'right',
        indent: 1
      };
    } else {
      cell.alignment = {
        indent: 1
      };
    }
      });
    });



    
    sheet.views = [{ state: 'frozen', ySplit: 6 }];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, `Attendance_Report.xlsx`);
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
      setCompanyDetails(response.paramObjectsMap.companyVO);
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('Error fetching company details', 'error');
    }
  };

  // Get year options (current year and previous year)
  const getYearOptions = () => {
    const currentYear = dayjs().year();
    return [currentYear - 1, currentYear];
  };

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      <div className="row d-flex ml">
        <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
          <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} disabled={isLoading} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} disabled={isLoading} />
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-md-6 mb-3">
            <Alert severity="error">{error}</Alert>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-3 mb-3">
          <FormControl size="small" variant="outlined" fullWidth>
            <InputLabel id="branch-label">Branch</InputLabel>
            <Select
              labelId="branch-label"
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
            >
              {branchList.map((branch) => (
                <MenuItem key={branch.id || 0} value={branch.branch}>
                  {branch.branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="col-md-3 mb-3">
          <Autocomplete
            options={empList}
            getOptionLabel={(option) => option.label || ''}
            sx={{ width: '100%' }}
            size="small"
            value={selectedEmployee}
            onChange={(event, newValue) => {
              const selectedEmp = newValue || { employeeCode: 'All', employeeName: 'All Employees' };
              setSelectedEmployee(selectedEmp);
              setFormData((prev) => ({
                ...prev,
                employeeCode: selectedEmp.employeeCode
              }));
            }}
            renderInput={(params) => <TextField {...params} label="Employee" variant="outlined" fullWidth />}
            isOptionEqualToValue={(option, value) => option.employeeCode === value.employeeCode}
          />
        </div>

        <div className="col-md-3 mb-3">
          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={['month']}
                label="Month"
                value={selectedMonth}
                slotProps={{
                  textField: {
                    size: 'small'
                  }
                }}
                onChange={(newValue) => setSelectedMonth(newValue)}
              />
            </LocalizationProvider>
          </FormControl>
        </div>

        <div className="col-md-3 mb-3">
          <FormControl fullWidth>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              label="Year"
              value={selectedYear.year()}
              onChange={(e) => setSelectedYear(dayjs().year(e.target.value))}
              size="small"
            >
              {getYearOptions().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Dialog for showing attendance report */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            fontSize: '20px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          Attendance  Report
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              sx={{ width: 250, mr: 2 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            <Tooltip title="Download PDF">
              <IconButton onClick={() => handleDownloadPDF({ logo: companyDetails[0]?.companyLogo })}>
                <PictureAsPdfIcon color="error" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Excel">
              <IconButton onClick={() => handleDownloadExcel({ logo: companyDetails[0]?.companyLogo })}>
                <DownloadIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        <DialogContent>
  {/* <div style={{ marginTop: 5, fontWeight: 'bold' }}>
  Branch: {formData.branch} | Employee: {formData.employeeCode} - {selectedEmployee?.employeeName || ''} | 
  Select Month: {selectedMonth ? selectedMonth.format('MMMM') : ''} | 
  Select Year: {selectedYear ? selectedYear.format('YYYY') : ''}
</div> */}
<div style={{ marginTop: 5, fontWeight: 'bold' }}>
  {/* Branch: {formData.branch} &nbsp;|&nbsp;  */}
  {formData.employeeCode === 'All' ? '' : formData.employeeCode}
  {selectedEmployee?.employeeName === 'All Employees' ? '' : ` - ${selectedEmployee?.employeeName || ''}`} {formData.employeeCode !== 'All'  && selectedEmployee?.employeeName !== 'All Employees' ? '|' : ''} 
  {selectedMonth ? selectedMonth.format('MMMM') : ''} &nbsp;|&nbsp; 
  {selectedYear ? selectedYear.format('YYYY') : ''}
  {/* Total Days:{attendanceData.length > 0 ? attendanceData[0].totalDays : '-'} */}
</div>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  // 'Code',
                  ...(formData.employeeCode === 'All' ? ['Code'] : []),
                  ...(selectedEmployee?.employeeName === 'All Employees' ? ['Name'] : []),
                  // ...(formData.branch === 'All' ? ['Branch'] : []),
                  { label: 'Department', width: '200px' },
                    'Total Days',
                   'Present',
                    // 'LOP',
                   'OT Hours',
                  // 'Paid Days',
                  // 'Status'
                ].map((heading, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      minWidth: typeof heading === 'object' ? heading.width : 'auto'
                    }}
                  >
                    {typeof heading === 'object' ? heading.label : heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ padding: 3, fontStyle: 'italic', color: '#777' }}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                    {formData.employeeCode === 'All' ?
                    <TableCell align="left">{row.empCode === '' || row.empCode === null || row.empCode === 0 ? '-' : row.empCode}</TableCell>
                    : ''}
                   
                    {selectedEmployee.employeeName === 'All Employees' ? 
                    <TableCell
                      align="left"
                      sx={{ minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {row.empName === '' || row.empName === null || row.empName === 0 ? '-' : row.empName}
                    </TableCell>
                    : ''}
                    
                    {/* {formData.branch === 'All' ? 
                    <TableCell align="center">{row.branch}</TableCell>
                    :''} */}
                     <TableCell
                      align="left"
                      sx={{ minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {row.department === '' || row.department === null || row.department === 0 ? '-' : row.department}
                    </TableCell>
                    <TableCell align="right">{row.totalDays === '' || row.totalDays === null || row.totalDays === 0 ? '-' : row.totalDays}</TableCell>
                      {/* <TableCell align="center">{row.present}</TableCell> */}
                       <TableCell align="right">{row.salarydays === '' || row.salarydays === null || row.salarydays === 0 ? '-' : row.salarydays}</TableCell>
                      {/* <TableCell align="right">{row.lop === '' || row.lop === null || row.lop === 0 ? '-' : row.lop}</TableCell>   */}
                      <TableCell align="right">{row.otHours === '' || row.otHours === null || row.otHours === 0 ? '-' : row.otHours}</TableCell>              
                                      
                       {/* <TableCell align="center">{row.salarydays}</TableCell> */}
                        {/* <TableCell align="center">{row.approveStatus}</TableCell> */}
                   
                   
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          <div style={{ marginTop: 0, textAlign: 'right' }}>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)'
              }}
              onClick={handleDialogClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ToastComponent />
    </div>
  );
};

export default AttendanceReport;