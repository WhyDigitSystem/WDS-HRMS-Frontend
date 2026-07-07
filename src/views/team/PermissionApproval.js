import React, { useState, useEffect, useCallback } from 'react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Box, Button, Card, Typography, Paper } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const PermissionApproval = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName, setBranchName] = useState(localStorage.getItem('branchName'));
  const orgId = localStorage.getItem('orgId');
  const employeeCode = localStorage.getItem('employeeCode');

  useEffect(() => {
    getApprovedPermissionRequestforTeam();
  }, []);

  const getApprovedPermissionRequestforTeam = useCallback(async () => {
    try {
      const result = await apiCalls(
        'get',
        `/employeemaster/getApprovedPermissionRequestforTeam?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
      );

      const approvedPermissions = result?.paramObjectsMap?.permissionRequestVO || [];
      const reversedApprovedPermissions = [...approvedPermissions].reverse();

      setListViewData(reversedApprovedPermissions);

      // Dynamically set branch name if available in the response
      if (reversedApprovedPermissions.length > 0 && reversedApprovedPermissions[0].branch) {
        setBranchName(reversedApprovedPermissions[0].branch);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [branchCode, orgId, employeeCode]);

  const listViewColumns = [
    { accessorKey: 'employeename', header: 'Name', size: 140 },
    { accessorKey: 'employeecode', header: 'Code', size: 140 },
    { accessorKey: 'date', header: 'Date', size: 140 },
    { accessorKey: 'fromtime', header: 'From Time', size: 140 },
    { accessorKey: 'totime', header: 'To Time', size: 140 },
    { accessorKey: 'totalhours', header: 'Total Hours', size: 140 },
    { accessorKey: 'employeeemail', header: 'Email', size: 140 },
    { accessorKey: 'notes', header: 'Reason', size: 140 },
    // { accessorKey: 'branch', header: 'Branch', size: 140 } // Now visible in the table
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
              <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit showActions={false} enableEditing={false} hideActions />
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

export default PermissionApproval;
