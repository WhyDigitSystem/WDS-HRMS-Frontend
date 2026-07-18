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
  TextField,
  TablePagination,
  InputAdornment,
  IconButton,
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

const PayrollApproval = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [branch, setBranch] = useState(localStorage.getItem('branch') || 'All');
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveAllDialogOpen, setApproveAllDialogOpen] = useState(false);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Common month/year state
  const [commonMonthYear, setCommonMonthYear] = useState('');

  // Function to format numeric values (show '-' for 0)
  const formatValue = (value) => {
    return value === 0 || value === '0' || value === null || value === undefined ? '-' : value;
  };

  // Function to format currency values (show '-' for 0)
  const formatCurrency = (amount) => {
    if (amount === 0 || amount === '0' || amount === '0.0' || amount === '0.00' || amount === null || amount === undefined) {
      return '-';
    }
    return new Intl.NumberFormat('en-IN', {
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    fetchSalaryData();
    getAllBranches();
  }, [branch]);

  // Filter data when search term or branch changes
  useEffect(() => {
    let result = salaryData;

    // Filter by branch
    if (branch !== 'All') {
      result = result.filter((item) => item.branch === branch);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.employeeName.toLowerCase().includes(term) ||
          item.employeeCode.toLowerCase().includes(term) ||
          (item.branch && item.branch.toLowerCase().includes(term)) ||
          (item.department && item.department.toLowerCase().includes(term))
      );
    }

    setFilteredData(result);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, branch, salaryData]);

  // useEffect TO EXTRACT COMMON MONTH/YEAR
  useEffect(() => {
    // Extract common month/year when data changes
    if (salaryData.length > 0) {
      const firstRecord = salaryData[0];
      const monthYear = `${new Date(2000, firstRecord.month - 1).toLocaleString('default', { month: 'long' })} ${firstRecord.year}`;
      setCommonMonthYear(monthYear);
    } else {
      setCommonMonthYear('');
    }
  }, [salaryData]);

  const fetchSalaryData = async () => {
    try {
      setIsLoading(true);
      const url = `/employeemaster/getPendingSalaryProcessByOrgId?branch=${branch}&orgId=${orgId}`;
      const response = await apiCalls('get', url);

      if (response.status && response.paramObjectsMap?.salaryProcessVO) {
        setSalaryData(response.paramObjectsMap.salaryProcessVO);
      } else {
        setSalaryData([]);
        showToast('info', 'No pending salary records found');
      }
    } catch (error) {
      console.error('Error fetching salary data:', error);
      showToast('error', 'Failed to fetch salary data');
      setSalaryData([]);
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

  const handleSelectRow = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, id];
    } else {
      newSelected = selectedRows.filter((rowId) => rowId !== id);
    }

    setSelectedRows(newSelected);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredData.map((row) => row.id);
      setSelectedRows(allIds);
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
        : filteredData.filter((row) => selectedRows.includes(row.id)).map((row) => row.id);

      // Prepare API calls for each record
      const approvalPromises = recordsToApprove.map((id) =>
        apiCalls('put', `/employeemaster/createApprovalSalaryProcess?action=Approved&actionBy=${loginUserName}&id=${id}&orgId=${orgId}`)
      );

      // Execute all approval requests
      const results = await Promise.all(approvalPromises);

      // Check if all approvals were successful
      const allSuccess = results.every((result) => result.status);

      if (allSuccess) {
        showToast('success', `Successfully approved ${recordsToApprove.length} salary record(s)`);
        fetchSalaryData(); // Refresh the data
        setSelectedRows([]); // Clear selection
      } else {
        const errorMessages = results
          .filter((result) => !result.status)
          .map((result) => result.paramObjectsMap?.errorMessage || 'Unknown error')
          .join(', ');

        showToast('error', `Some approvals failed: ${errorMessages}`);
      }
    } catch (error) {
      console.error('Error approving salary records:', error);
      showToast('error', 'Failed to approve salary records');
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

  // Calculate paginated data
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
        <ActionButton title="Refresh" icon={FormatListBulletedTwoToneIcon} onClick={fetchSalaryData} />
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

      {/* Grid layout similar to Attendance Approval */}
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
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )
            }}
            placeholder="Search"
          />
        </Grid>

        {/* Month/Year Display Card */}
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

        {/* Chip display */}
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
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Present</strong></TableCell>
              <TableCell><strong>OT</strong></TableCell>
              <TableCell><strong>Earnings</strong></TableCell>
              <TableCell><strong>LOP</strong></TableCell>
              <TableCell><strong>Advance</strong></TableCell>
              <TableCell><strong>PF</strong></TableCell>
              <TableCell><strong>ESI</strong></TableCell>
              <TableCell><strong>Deductions</strong></TableCell>
              <TableCell><strong>Net</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedRows.includes(row.id)} onChange={() => handleSelectRow(row.id)} />
                  </TableCell>
                  <TableCell>{row.employeeCode}</TableCell>
                  <TableCell>{row.employeeName}</TableCell>
                  <TableCell>{formatValue(row.totalCompanyWorkingDays)}</TableCell>
                  <TableCell>{formatValue(row.empTotalWorkingDays)}</TableCell>
                  <TableCell>{formatCurrency(row.bankOtAmount)}</TableCell>
                  <TableCell>{formatCurrency(row.totalEarnings)}</TableCell>
                  <TableCell>{formatValue(row.lopLeave)}</TableCell>
                  <TableCell>{formatCurrency(row.bankAdvance)}</TableCell>
                  <TableCell>{formatCurrency(row.pfAmount)}</TableCell>
                  <TableCell>{formatCurrency(row.esiAmount)}</TableCell>
                  <TableCell>{formatCurrency(row.totalDeductions)}</TableCell>
                  <TableCell>{formatCurrency(row.bankAmount)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        color: row.approvedStatus === 'PENDING' ? 'orange' : 'green',
                        fontWeight: 'bold'
                      }}
                    >
                      {row.approvedStatus}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={14} align="center">
                  {isLoading ? 'Loading...' : 'No pending salary records found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
        <DialogTitle>Confirm Salary Approval</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve {selectedRows.length} selected salary record(s)?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleSaveApproval(false)} color="primary" variant="contained" disabled={isLoading}>
            {isLoading ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve All Dialog */}
      <Dialog open={approveAllDialogOpen} onClose={() => setApproveAllDialogOpen(false)}>
        <DialogTitle>Confirm Salary Approval</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve all {filteredData.length} pending salary records?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveAllDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleSaveApproval(true)} color="primary" variant="contained" disabled={isLoading}>
            {isLoading ? 'Approving...' : 'Approve All'}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default PayrollApproval;