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
  Autocomplete,
  Grid,
  Card,
  CardContent,
  Button,
  Checkbox,
} from '@mui/material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';

const SetGoalsApproval = () => {
  const [listViewData, setListViewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orgId, setOrgId] = useState('');

  // State for employee selection
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [goalsData, setGoalsData] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // State for FinYear
  const [finYearOptions, setFinYearOptions] = useState([]);
  const [selectedFinYear, setSelectedFinYear] = useState(null);
  const [loadingFinYear, setLoadingFinYear] = useState(false);

  // State for bulk selection
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedOrgId = localStorage.getItem('orgId');
    if (storedOrgId) {
      setOrgId(storedOrgId);
      fetchReportingPersonCode(storedOrgId);
      getAllEmployees(storedOrgId);
      getAllAppraisalPeriod(storedOrgId);
    } else {
      showToast('error', 'Organization ID not found in localStorage');
    }
  }, []);

  // Fetch all employees
  const getAllEmployees = async (orgIdVal) => {
    const branchCode = localStorage.getItem('branch');

    if (!orgIdVal || !branchCode) return;

    setIsLoadingEmployees(true);
    try {
      const response = await apiCalls('get', `master/getAllEmployeeByOrgId?orgId=${orgIdVal}&branchCode=${branchCode}`);

      if (response.status === true) {
        const employees = response.paramObjectsMap.employeeVO || [];
        const formattedEmployees = employees.map(emp => ({
          code: emp.employeeCode,
          name: emp.employee,
          designation: emp.designation,
          reportingPersonCode: emp.reportingPersonCode,
          reportingPerson: emp.reportingPerson,
          reportingPersonRole: emp.reportingRole,
          branch: emp.branch,
          email: emp.email,
          mobileNo: emp.mobileNo
        }));
        setEmployeeOptions(formattedEmployees);
      } else {
        showToast('error', response.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast('error', 'Failed to fetch employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Fetch appraisal periods for FinYear
  const getAllAppraisalPeriod = async (orgIdVal) => {
    setLoadingFinYear(true);
    try {
      const response = await apiCalls('get', `/goalsController/getAppraisalPeriodByOrgId?orgId=${orgIdVal}`);
      if (response.status) {
        const appraisalData = response.paramObjectsMap.appraisalVO || [];
        const formattedFinYears = appraisalData.map(item => ({
          id: item.id,
          finYear: item.finYear,
          type: item.type,
          appraisalId: item.appraisalId,
          effectiveFrom: item.effectiveForm,
          effectiveTo: item.effectiveTo,
          active: item.active
        }));
        setFinYearOptions(formattedFinYears);

        // Auto-select the first active fin year if available
        const activeFinYear = formattedFinYears.find(fy => fy.active === 'Active');
        if (activeFinYear) {
          setSelectedFinYear(activeFinYear);
        }
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error fetching appraisal periods:', error);
      showToast('error', 'Failed to fetch financial years');
    } finally {
      setLoadingFinYear(false);
    }
  };

  // Fetch goals for selected employee and fin year
  const fetchGoalsByEmployee = async (empCode, finYear) => {
    if (!empCode || !orgId || !finYear) return;

    setLoadingGoals(true);
    try {
      const response = await apiCalls(
        'get',
        `/goalsController/getSelfGoalsByOrgIdAndEmpCodeAndFinyear?empCode=${empCode}&finYear=${finYear}&orgId=${orgId}`
      );

      console.log('Goals API response:', response);

      if (response.status === true && response.paramObjectsMap?.selfGoalsVO?.length > 0) {
        const selfGoalsVO = response.paramObjectsMap.selfGoalsVO[0];
        const details = selfGoalsVO.selfGoalsDetailsVO || [];

        // Use status from API response
        const goalsWithStatus = details.map(goal => ({
          ...goal,
          status: goal.status || (selfGoalsVO.approvedOn ? 'APPROVED' : (selfGoalsVO.submittedOn ? 'PENDING' : 'NOT_SUBMITTED')),
          approvedOn: selfGoalsVO.approvedOn,
          submittedOn: selfGoalsVO.submittedOn,
          appraisalId: selfGoalsVO.appraisalId,
          empCode: selfGoalsVO.code,
          empName: selfGoalsVO.name
        }));

        setGoalsData(goalsWithStatus);
        setSelectedGoals([]);
        setSelectAll(false);

        if (goalsWithStatus.length === 0) {
          showToast('info', 'No goals found for this employee');
        }
      } else {
        setGoalsData([]);
        setSelectedGoals([]);
        setSelectAll(false);
        showToast('info', 'No goals data available for this employee');
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      showToast('error', 'Failed to fetch goals data');
      setGoalsData([]);
      setSelectedGoals([]);
      setSelectAll(false);
    } finally {
      setLoadingGoals(false);
    }
  };

  const fetchReportingPersonCode = async (orgId) => {
    try {
      console.log('Fetching reporting person with orgId:', orgId);
      const response = await apiCalls('get', `/goalsController/getReportingPerson?orgId=${orgId}`);

      let reportingCode;
      if (response && typeof response === 'object') {
        reportingCode = response.data?.supCode || response.supCode || response?.data?.supCode;
      }

      if (reportingCode) {
        getPreGoalsApprovedReport(reportingCode, orgId);
      } else {
        console.log('Supervisor code not found in response');
      }
    } catch (error) {
      console.error('Failed to fetch reporting person code:', error);
      showToast('error', 'Failed to fetch supervisor code');
    }
  };

  const getPreGoalsApprovedReport = async (supCode, orgId) => {
    setLoading(true);
    try {
      const result = await apiCalls(
        'get',
        `/goalsController/getPreGoalsApprovedReport?finYear=2026&orgId=${orgId}&supCode=${supCode}`
      );

      if (result?.paramObjectsMap?.employeeVO) {
        const mappedData = result.paramObjectsMap.employeeVO.map(item => ({
          employeeCode: item.empCode,
          empName: item.empName,
          submittedOn: item.submittedOn,
          supervisorCode: item.supCode,
          supervisorName: item.supName,
          approvedOn: item.approvedOn
        }));
        setListViewData(mappedData);
      } else {
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

  // Handle employee selection
  const handleEmployeeChange = (event, newValue) => {
    setSelectedEmployee(newValue);
    if (newValue && newValue.code && selectedFinYear) {
      fetchGoalsByEmployee(newValue.code, selectedFinYear.finYear);
    } else {
      setGoalsData([]);
      setSelectedGoals([]);
      setSelectAll(false);
    }
  };

  // Handle FinYear selection
  const handleFinYearChange = (event, newValue) => {
    setSelectedFinYear(newValue);
    if (selectedEmployee && selectedEmployee.code && newValue) {
      fetchGoalsByEmployee(selectedEmployee.code, newValue.finYear);
    } else {
      setGoalsData([]);
      setSelectedGoals([]);
      setSelectAll(false);
    }
  };

  // Handle single goal selection
  const handleGoalSelection = (goalId) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedGoals([]);
    } else {
      const pendingGoalIds = goalsData
        .filter(goal => goal.status === 'PENDING')
        .map(goal => goal.id);
      setSelectedGoals(pendingGoalIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle Approve/Reject actions
  const handleAction = async (action, goalIds = null) => {
    const detailIds = goalIds || selectedGoals;

    if (detailIds.length === 0) {
      showToast('warning', `Please select at least one goal to ${action}`);
      return;
    }

    setSubmitting(true);
    try {
      const updatedBy = localStorage.getItem('userCode') || 'WDS008';

      // Build URL with multiple detailIds parameters
      let url = `/goalsController/approveSelfGoalsDetails?status=${action.toUpperCase()}&updatedBy=${updatedBy}`;
      detailIds.forEach(id => {
        url += `&detailIds=${id}`;
      });

      console.log('Action URL:', url);

      const response = await apiCalls('put', url, {});

      if (response.status === true) {
        showToast('success', `${detailIds.length} goal(s) ${action === 'approved' ? 'approved' : 'rejected'} successfully`);

        // Refresh goals data
        if (selectedEmployee && selectedFinYear) {
          await fetchGoalsByEmployee(selectedEmployee.code, selectedFinYear.finYear);
        }
      } else {
        showToast('error', response.message || `Failed to ${action} goal(s)`);
      }
    } catch (error) {
      console.error(`Error ${action}ing goal(s):`, error);
      showToast('error', `Failed to ${action} goal(s). Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = listViewData.filter(item =>
    (item.empName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (item.employeeCode?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const getStatusInfo = (row) => {
    if (row.approvedOn) return { color: 'green', text: 'Approved' };
    if (row.submittedOn) return { color: '#FFA500', text: 'Pending' };
    return { color: 'black', text: 'Not Submitted' };
  };

  // Get status color for goals table
  const getGoalStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'PENDING': return '#FFA500';
      default: return 'black';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'PENDING': return 'Pending';
      default: return 'Not Submitted';
    }
  };

  const pendingGoalsCount = goalsData.filter(goal => goal.status === 'PENDING').length;

  return (
    <div style={{ padding: 20 }}>
      <ToastContainer />
      <Typography variant="h6" gutterBottom>Set Goals Approval</Typography>

      {/* Employee Selection Section with Code, Name and FinYear */}
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={employeeOptions}
              loading={isLoadingEmployees}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="Search by employee code"
                />
              )}
              isOptionEqualToValue={(option, value) => option.code === value?.code}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={employeeOptions}
              loading={isLoadingEmployees}
              getOptionLabel={(option) => option.name}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="Search by employee name"
                />
              )}
              isOptionEqualToValue={(option, value) => option.code === value?.code}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={finYearOptions}
              loading={loadingFinYear}
              getOptionLabel={(option) => `${option.finYear}`}
              value={selectedFinYear}
              onChange={handleFinYearChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Financial Year"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="Select financial year"
                />
              )}
              isOptionEqualToValue={(option, value) => option.finYear === value?.finYear}
            />
          </Grid>
        </Grid>
      </CardContent>

      {/* Goals Table Section */}
      {selectedEmployee && selectedFinYear && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Goals Details for {selectedEmployee.code} - {selectedEmployee.name} (FY: {selectedFinYear.finYear})
            </Typography>
            {pendingGoalsCount > 0 && (
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleAction('approved')}
                  disabled={selectedGoals.length === 0 || submitting}
                  sx={{ mr: 1 }}
                >
                  Approve Selected ({selectedGoals.length})
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleAction('rejected')}
                  disabled={selectedGoals.length === 0 || submitting}
                >
                  Reject Selected ({selectedGoals.length})
                </Button>
              </Box>
            )}
          </Box>

          <TableContainer component={Paper}>
            {loadingGoals ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedGoals.length > 0 && selectedGoals.length < pendingGoalsCount}
                          checked={selectAll && pendingGoalsCount > 0}
                          onChange={handleSelectAll}
                          disabled={pendingGoalsCount === 0}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#f5f5f5' }}><strong>Area (KRA)</strong></TableCell>
                      <TableCell sx={{ color: '#f5f5f5' }}><strong>Key Performance Indicators (KPI)</strong></TableCell>
                      <TableCell sx={{ color: '#f5f5f5' }}><strong>Goals</strong></TableCell>
                      <TableCell sx={{ color: '#f5f5f5' }}><strong>Status</strong></TableCell>
                      <TableCell sx={{ color: '#f5f5f5' }}><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {goalsData.length > 0 ? (
                      goalsData.map((goal, index) => {
                        const statusColor = getGoalStatusColor(goal.status);
                        const statusText = getStatusText(goal.status);
                        const isPending = goal.status === 'PENDING';
                        const isApproved = goal.status === 'APPROVED';
                        const isRejected = goal.status === 'REJECTED';

                        return (
                          <TableRow key={goal.id || index} hover>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedGoals.includes(goal.id)}
                                onChange={() => handleGoalSelection(goal.id)}
                                disabled={!isPending}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{goal.area || '-'}</TableCell>
                            <TableCell>{goal.keyPerformanceIndicator || '-'}</TableCell>
                            <TableCell>{goal.goals || '-'}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box width={12} height={12} bgcolor={statusColor} borderRadius="50%" />
                                {statusText}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {isPending && (
                                <Box display="flex" gap={1}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() => handleAction('approved', [goal.id])}
                                    disabled={submitting}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={() => handleAction('rejected', [goal.id])}
                                    disabled={submitting}
                                  >
                                    Reject
                                  </Button>
                                </Box>
                              )}
                              {isApproved && (
                                <Typography variant="caption" color="green">
                                  Already Approved
                                </Typography>
                              )}
                              {isRejected && (
                                <Typography variant="caption" color="error">
                                  Already Rejected
                                </Typography>
                              )}
                              {!isPending && !isApproved && !isRejected && (
                                <Typography variant="caption" color="textSecondary">
                                  Not Submitted
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No goals data available for this employee
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </TableContainer>
        </>
      )}

      {/* Status Legends */}
      <Box display="flex" alignItems="center" justifyContent="right" gap={2} mb={2} mt={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={12} height={12} bgcolor="green" borderRadius="50%" />
          <span>Approved</span>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={12} height={12} bgcolor="#FFA500" borderRadius="50%" />
          <span>Pending</span>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={12} height={12} bgcolor="black" borderRadius="50%" />
          <span>Not Submitted</span>
        </Box>
      </Box>
    </div>
  );
};

export default SetGoalsApproval;