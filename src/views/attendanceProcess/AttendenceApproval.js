import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Tooltip,
  TextField,
  TablePagination,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SearchIcon from '@mui/icons-material/Search';
import { getAllActiveBranches } from 'utils/CommonFunctions';

const AttendenceApproval = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [branch, setBranch] = useState(localStorage.getItem('branch') || 'All');
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveAllDialogOpen, setApproveAllDialogOpen] = useState(false);
  const [loginUserName] = useState(localStorage.getItem('userName'));

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Common month/year state
  const [commonMonthYear, setCommonMonthYear] = useState('');

  // Function to format numeric values (show '-' for 0)
  const formatValue = (value) => {
    return value === 0 || value === '0' ? '-' : value;
  };

  useEffect(() => {
    fetchAttendanceData();
    getAllBranches();
  }, [branch]);

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm) {
      const filtered = attendanceData.filter(
        (item) =>
          item.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(attendanceData);
    }
    setPage(0); // Reset to first page when search changes
  }, [searchTerm, attendanceData]);

  useEffect(() => {
    // Extract common month/year when data changes
    if (attendanceData.length > 0) {
      const firstRecord = attendanceData[0];
      const monthYear = `${new Date(2000, firstRecord.month - 1).toLocaleString('default', { month: 'long' })} ${firstRecord.finyear}`;
      setCommonMonthYear(monthYear);
    } else {
      setCommonMonthYear('');
    }
  }, [attendanceData]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const url = `/checkinout/getPendingAttendanceSummaryByOrgId?orgId=${orgId}&branch=${branch}`;
      const response = await apiCalls('get', url);

      if (response.status && response.paramObjectsMap?.attendanceSummaryVO) {
        setAttendanceData(response.paramObjectsMap.attendanceSummaryVO);
        setFilteredData(response.paramObjectsMap.attendanceSummaryVO);
      } else {
        setAttendanceData([]);
        setFilteredData([]);
        showToast('info', 'No pending attendance records found');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      showToast('error', 'Failed to fetch attendance data');
      setAttendanceData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList([{ branch: 'All', branchCode: 'ALL' }, ...branchData]);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  const handleSelectRow = (empCode) => {
    const selectedIndex = selectedRows.indexOf(empCode);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, empCode];
    } else {
      newSelected = selectedRows.filter((code) => code !== empCode);
    }

    setSelectedRows(newSelected);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allCodes = filteredData.map((row) => row.empCode);
      setSelectedRows(allCodes);
    } else {
      setSelectedRows([]);
    }
  };

  const handleApproveSelected = async () => {
    if (selectedRows.length === 0) {
      showToast('warning', 'Please select at least one record to approve');
      return;
    }
    setApproveDialogOpen(true);
  };

  const handleApproveAll = () => {
    if (filteredData.length === 0) {
      showToast('warning', 'No records available to approve');
      return;
    }
    setApproveAllDialogOpen(true);
  };

  const handleSaveApproval = async (approveAll = false) => {
    try {
      setIsLoading(true);

      // Get the IDs of records to approve
      const recordsToApprove = approveAll
        ? filteredData.map((row) => row.id)
        : filteredData.filter((row) => selectedRows.includes(row.empCode)).map((row) => row.id);

      // Prepare API calls for each record
      const approvalPromises = recordsToApprove.map((id) =>
        apiCalls('put', `/checkinout/createApprovalAttendanceSummary?action=Approved&actionBy=${loginUserName}&id=${id}&orgId=${orgId}`)
      );

      // Execute all approval requests
      const results = await Promise.all(approvalPromises);

      // Check if all approvals were successful
      const allSuccess = results.every((result) => result.status);

      if (allSuccess) {
        showToast('success', `Successfully approved ${recordsToApprove.length} record(s)`);
        fetchAttendanceData(); // Refresh the data
        setSelectedRows([]); // Clear selection
      } else {
        const errorMessages = results
          .filter((result) => !result.status)
          .map((result) => result.paramObjectsMap?.errorMessage || 'Unknown error')
          .join(', ');

        showToast('error', `Some approvals failed: ${errorMessages}`);
      }
    } catch (error) {
      console.error('Error approving records:', error);
      showToast('error', 'Failed to approve records');
    } finally {
      setIsLoading(false);
      setApproveDialogOpen(false);
      setApproveAllDialogOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedRows([]);
    setBranch('All');
    setSearchTerm('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      {/* Month/Year Display Card */}
      <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
        <ActionButton title="Refresh" icon={FormatListBulletedTwoToneIcon} onClick={fetchAttendanceData} />
        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
        <ActionButton
          title="Approve Selected"
          icon={CheckCircleIcon}
          onClick={handleApproveSelected}
          disabled={selectedRows.length === 0 || isLoading}
          sx={{ backgroundColor: '#4caf50' }}
        />
        <ActionButton
          title="Approve All"
          icon={DoneAllIcon}
          onClick={handleApproveAll}
          disabled={filteredData.length === 0 || isLoading}
          sx={{ backgroundColor: '#2e7d32' }}
        />
      </div>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="branch-label">Branch</InputLabel>
            <Select labelId="branch-label" label="Branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branchList.map((branchItem) => (
                <MenuItem key={branchItem.branchCode} value={branchItem.branch}>
                  {branchItem.branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            placeholder="Search"
          />
        </Grid>
        {commonMonthYear && (
          <Grid item xs={12} sm={3}>
            <Card sx={{ backgroundColor: '#f0f8ff' }}>
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'bold' }}>
                  {commonMonthYear}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        {commonMonthYear && (
          <Grid item xs={12} sm={commonMonthYear ? 3 : 6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Chip label={`${selectedRows.length} / ${filteredData.length}`} variant="outlined" sx={{ mr: 1 }} />
          </Grid>
        )}
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                  checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                  onChange={handleSelectAll}
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
              <TableCell>
                <strong>Code</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              {/* <TableCell>
                <strong>Branch</strong>
              </TableCell> */}
              <TableCell>
                <strong>Department</strong>
              </TableCell>
              <TableCell>
                <strong>Total</strong>
              </TableCell>
              <TableCell>
                <strong>Present</strong>
              </TableCell>
              {/* <TableCell>
                <strong>Absent</strong>
              </TableCell>
              <TableCell>
                <strong>Leave</strong>
              </TableCell> */}
              <TableCell>
                <strong>LOP</strong>
              </TableCell>
              {/* <TableCell>
                <strong>Paid Days</strong>
              </TableCell> */}
              <TableCell>
                <strong>OT Hours</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedRows.includes(row.empCode)} onChange={() => handleSelectRow(row.empCode)} />
                  </TableCell>
                  <TableCell>{row.empCode}</TableCell>
                  <TableCell>{row.empName}</TableCell>
                  {/* <TableCell>{row.branch}</TableCell> */}
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{formatValue(row.totalDays)}</TableCell>
                  {/* <TableCell>{formatValue(row.present)}</TableCell> */}
                  {/* <TableCell>{formatValue(row.absent)}</TableCell>
                    <TableCell>{formatValue(row.leaves)}</TableCell> */}
                  <TableCell>{formatValue(row.salarydays)}</TableCell>
                  <TableCell>{formatValue(row.lop)}</TableCell>
                  <TableCell>{formatValue(row.otHours)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        color: row.approveStatus === 'PENDING' ? 'orange' : 'green',
                        fontWeight: 'bold'
                      }}
                    >
                      {row.approveStatus}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  {isLoading ? 'Loading...' : 'No pending attendance records found'}
                </TableCell>
              </TableRow>
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={13} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Approve Selected Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Confirm Approval</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve {selectedRows.length} selected attendance record(s)?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSaveApproval(false)} color="primary" variant="contained" disabled={isLoading}>
            {isLoading ? 'Approving...' : 'Approve'}
          </Button>
          <Button onClick={() => setApproveDialogOpen(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve All Dialog */}
      <Dialog open={approveAllDialogOpen} onClose={() => setApproveAllDialogOpen(false)}>
        <DialogTitle>Confirm Approval</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve all {filteredData.length} pending attendance records?</Typography>
          {/* <Typography>Proceed with approving the records?</Typography> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSaveApproval(true)} color="primary" variant="contained" disabled={isLoading}>
            {isLoading ? 'Approving...' : 'Approve All'}
          </Button>
          <Button onClick={() => setApproveAllDialogOpen(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default AttendenceApproval;
