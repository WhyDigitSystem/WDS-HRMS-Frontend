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
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';

const PreGoalsApproval = () => {
  const [listViewData, setListViewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orgId, setOrgId] = useState(''); // Store orgId in state

  useEffect(() => {
    // Get orgId from localStorage
    const storedOrgId = localStorage.getItem('orgId');
    if (storedOrgId) {
      setOrgId(storedOrgId);
      fetchReportingPersonCode(storedOrgId);
    } else {
      showToast('error', 'Organization ID not found in localStorage');
    }
  }, []);

  const fetchReportingPersonCode = async (orgId) => {
    try {
      console.log('Fetching reporting person with orgId:', orgId);
      const response = await apiCalls('get', `/goalsController/getReportingPerson?orgId=${orgId}`);
      
      console.log('Full response from getReportingPerson:', response);

      // Extract supCode from response - adjust based on actual response structure
      let reportingCode;
      if (response && typeof response === 'object') {
        // Check various possible locations for supCode
        reportingCode = response.data?.supCode || response.supCode || response?.data?.supCode;
      }

      console.log('Extracted supCode:', reportingCode);

      if (reportingCode) {
        console.log('Found supCode, now fetching report...');
        getPreGoalsApprovedReport(reportingCode, orgId);
      } else {
        console.log('Supervisor code not found in response');
        showToast('error', 'Supervisor code not found');
      }
    } catch (error) {
      console.error('Failed to fetch reporting person code:', error);
      showToast('error', 'Failed to fetch supervisor code');
    }
  };

  const getPreGoalsApprovedReport = async (supCode, orgId) => {
    setLoading(true);
    try {
      console.log(`Calling API with: finYear=2025, orgId=${orgId}, supCode=${supCode}`);
      
      const result = await apiCalls(
        'get',
        `/goalsController/getPreGoalsApprovedReport?finYear=2025&orgId=${orgId}&supCode=${supCode}`
      );

      console.log('API response:', result);

      // Map API response to match UI keys
      if (result?.paramObjectsMap?.employeeVO) {
        const mappedData = result.paramObjectsMap.employeeVO.map(item => ({
          employeeCode: item.empCode,
          empName: item.empName,
          submittedOn: item.submittedOn,
          supervisorCode: item.supCode,
          supervisorName: item.supName,
          approvedOn: item.approvedOn
        }));
        console.log('Mapped data:', mappedData);
        setListViewData(mappedData);
      } else {
        console.log('No employeeVO found in response');
        setListViewData([]);
        showToast('info', 'No data available for pre-goals approval');
      }
    } catch (error) {
      console.error('API call failed:', error);
      showToast('error', 'Failed to fetch goals approval report');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = listViewData.filter(item =>
    (item.empName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (item.employeeCode?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  // Function to determine status and color
  const getStatusInfo = (row) => {
    if (row.approvedOn) return { color: 'green', text: 'Approved' };
    if (row.submittedOn) return { color: '#FFA500', text: 'Pending' };
    return { color: 'black', text: 'Not Submitted' };
  };

  return (
    <div style={{ padding: 20 }}>
      <ToastContainer />
      <Typography variant="h6" gutterBottom>Pre Goals Approval</Typography>

      {/* Status Legends */}
      <Box display="flex" alignItems="center" justifyContent="right" gap={2} mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={16} height={16} bgcolor="green" borderRadius="50%" />
          <span>Approved</span>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={16} height={16} bgcolor="#FFA500" borderRadius="50%" />
          <span>Pending</span>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={16} height={16} bgcolor="black" borderRadius="50%" />
          <span>Not Submitted</span>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        variant="outlined"
        placeholder="Search by Employee Name or Code"
        fullWidth
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Employee Code</strong></TableCell>
                  <TableCell><strong>Employee Name</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Submitted On</strong></TableCell>
                  <TableCell><strong>Supervisor Code</strong></TableCell>
                  <TableCell><strong>Supervisor Name</strong></TableCell>
                  <TableCell><strong>Approved On</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const statusInfo = getStatusInfo(row);
                      return (
                        <TableRow key={index} hover>
                          <TableCell>{row.employeeCode}</TableCell>
                          <TableCell>{row.empName}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box width={16} height={16} bgcolor={statusInfo.color} borderRadius="50%" />
                              {statusInfo.text}
                            </Box>
                          </TableCell>
                          <TableCell>{row.submittedOn || '-'}</TableCell>
                          <TableCell>{row.supervisorCode || '-'}</TableCell>
                          <TableCell>{row.supervisorName || '-'}</TableCell>
                          <TableCell>{row.approvedOn || '-'}</TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
          </>
        )}
      </TableContainer>
    </div>
  );
};

export default PreGoalsApproval;