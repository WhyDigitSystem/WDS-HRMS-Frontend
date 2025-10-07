import React, { useState, useEffect, useCallback } from 'react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Box, Button, Card, Typography, Paper } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const LeaveApproval = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const orgId = localStorage.getItem('orgId');
  const employeeCode = localStorage.getItem('employeeCode');

  useEffect(() => {
    getAllApprovedLeaveForTeam();
  }, []);

  // In your getAllHolidayByOrgId function
  const getAllApprovedLeaveForTeam = useCallback(async () => {
    try {
      // Fetching approved leaves for the team
      const result = await apiCalls(
        'get',
        `/leaveprocess/getAllApprovedLeaveForTeam?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
      );

      const approvedLeaves = result?.paramObjectsMap?.leaveRequestVO || [];

      // Optionally reverse the list if you want the latest leaves first
      const reversedApprovedLeaves = [...approvedLeaves];
      setListViewData(reversedApprovedLeaves);

      if (reversedApprovedLeaves.length > 0 && reversedApprovedLeaves[0].branchCode) {
        setBranchCode(reversedApprovedLeaves[0].branchCode);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [branchCode, orgId, employeeCode]);

  const listViewColumns = [
    { accessorKey: 'employeeName', header: 'Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Code', size: 140 },
    { accessorKey: 'employeeEmail', header: 'Email', size: 140 },
    { accessorKey: 'reason', header: 'Reason', size: 140 },
    { accessorKey: 'leaveType', header: 'Leave Type', size: 140 },
    { accessorKey: 'totalDays', header: 'Total Days', size: 140 },
    { accessorKey: 'startDate', header: 'Start Date', size: 140 },
    { accessorKey: 'endDate', header: 'End Date', size: 140 },
    { accessorKey: 'screenName', header: 'Screen Name', size: 140 }
  ];

  return (
    <>
      <Card
        sx={{
          padding: 4,
          backgroundColor: '#ffffff',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          borderRadius: 4,
          maxWidth: '100%',
          mt: 3
        }}
      >
        <ToastContainer position="top-right" autoClose={5000} />
        <Box sx={{ mt: 0 }}>
          {listViewData.length > 0 ? (
            <Paper sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit showActions={true} enableEditing={false} hideActions />
            </Paper>
          ) : (
            <Box
              sx={{
                py: 1,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: 16,
                fontWeight: 500
              }}
            >
              <SearchOffIcon sx={{ fontSize: 40, mb: 1, color: 'grey.500' }} />
              <div>No data found</div>
            </Box>
          )}
        </Box>
      </Card>
    </>
  );
};

export default LeaveApproval;
