// src/components/Dashboard/PendingApprovalsSummary.jsx

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  CircularProgress,
  Tooltip
} from '@mui/material';

import { Assignment, EventNote, Work, Close as CloseIcon, ThumbDown, ThumbUp, ArrowForward } from '@mui/icons-material';

import { styled, useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import emailjs from '@emailjs/browser';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IncrementViewDialog from 'utils/IncrementViewDialog';
import { showToast } from 'utils/toast-component';

const IconButtonStyled = styled(IconButton)(({ theme, actiontype }) => ({
  width: 40,
  height: 40,
  backgroundColor: actiontype === 'approve' ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: actiontype === 'approve' ? theme.palette.success.dark : theme.palette.error.dark,
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[2]
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled
  }
}));

const PendingApprovalsSummary = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [employeeName] = useState(localStorage.getItem('employeeName'));
  const [employeeCode] = useState(localStorage.getItem('employeeCode'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [userType] = useState(localStorage.getItem('userType'));
  const [selectedIncrement, setSelectedIncrement] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const isAdmin = userType?.toUpperCase() === 'ADMIN';

  // Helper function to normalize API responses
  const normalize = (data) => (Array.isArray(data) ? data : [data].filter(Boolean));

  // Filter only PENDING requests
  const filterPending = (arr) => arr.filter((r) => !r.approveStatus || r.approveStatus === 'PENDING');

  // Fetch all pending requests
  const getAllRequests = async () => {
    try {
      setLoading(true);

      // ================= ADMIN FLOW =================
      if (userType === 'ADMIN') {
        const [leaveResponse, permissionResponse, compoOffResponse, checkInOutResult, incrementResponse, expenseClaims, travelExpense, WFHResponse] =
          await Promise.all([
            apiCalls(
              'get',
              `leaveprocess/getLeaveRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`
            ),
            apiCalls(
              'get',
              `employeemaster/getPendingPermissionRequest?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`
            ),
            apiCalls(
              'get',
              `leaveprocess/getCompoffRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`
            ),
            apiCalls('get', `basicmaster/getRequestCheckInOutByOrgId?branch=${branch}&orgId=${orgId}&reportingPersoncode=${employeeCode}`),
            apiCalls(
              'get',
              `incrementmanagement/getIncrementManagementForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
            ),
            apiCalls(
              'get',
              `/assetmanagement/getExpenseClaimsForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
            ),
            apiCalls(
              'get',
              `/assetmanagement/getTravelRequestsForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
            ),
              apiCalls(
              'get',
              `leaveprocess/getPendingWorkFromHomeForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
            ),
          ]);

        const leaveRequestsData = normalize(leaveResponse?.paramObjectsMap?.leaveRequestVO);
        const permissionRequests = normalize(permissionResponse?.paramObjectsMap?.permissionRequestVO);
        const compoOffRequests = normalize(compoOffResponse?.paramObjectsMap?.compensatoryOffVO);
        const incrementManagementRequests = normalize(incrementResponse?.paramObjectsMap?.incrementManagementVO);
        const expenseRequests = normalize(expenseClaims?.paramObjectsMap?.expenseClaimsVO);
        const travelRequests = normalize(travelExpense?.paramObjectsMap?.travelRequestsVO);
        const WFHRequests = normalize(WFHResponse?.paramObjectsMap?.workFromHomeVO);


        // Process CheckInOut Adjustment
        const rawCheckInOut = normalize(checkInOutResult?.paramObjectsMap?.checkInOutAdjustmentVO);
        const grouped = {};

        rawCheckInOut.forEach((item) => {
          const key = `${item.employeeCode}_${item.checkInDate}`;
          if (!grouped[key]) {
            grouped[key] = {
              ...item,
              id: key,
              entryTime: '',
              exitTime: '',
              checkInTime: '',
              checkOutTime: '',
              employeeEmail: item.email || item.employeeEmail || '',
              records: []
            };
          }
          grouped[key].records.push(item);
        });

        const checkInOutRequests = Object.values(grouped).map((group) => {
          const sortedRecords = group.records.sort((a, b) => a.entryTime.localeCompare(b.entryTime));
          // Find IN and OUT entries based on time or other logic
          const inEntry = sortedRecords.find((r) => r.entryTime && (!r.exitTime || r.entryTime < (r.exitTime || '23:59:59')));
          const outEntry = sortedRecords.find((r) => r.entryTime && (!inEntry || r.entryTime > inEntry.entryTime));

          const entry = inEntry?.entryTime || '';
          const exit = outEntry?.entryTime || '';

          return {
            ...group,
            entryTime: entry,
            exitTime: exit,
            checkInTime: entry,
            checkOutTime: exit,
            approveStatus: group.records[0]?.approveStatus || 'PENDING',
            screenName: group.records[0]?.screenName || 'CHECKINOUTADJUSTMENT'
          };
        });

        const combinedRequests = [
          ...filterPending(leaveRequestsData),
          ...filterPending(permissionRequests),
          ...filterPending(compoOffRequests),
          ...filterPending(checkInOutRequests),
          ...filterPending(incrementManagementRequests),
          ...filterPending(expenseRequests),
          ...filterPending(travelRequests),
          ...filterPending(WFHRequests)
        ];

        setLeaveRequests(combinedRequests);
      }
      // ================= USER FLOW =================
      else {
        // Use the new API endpoint for non-admin users
        const result = await apiCalls('get', `/newdashboard/pendingApprovalForDashBoard?employeeCode=${employeeCode}&orgId=${orgId}`);
        const pendingApprovals = result?.paramObjectsMap?.pendingApprovalVO || [];

        // Transform the new API response to match the existing format
        const mappedRequests = pendingApprovals.map((item) => {
          return {
            id: item.id,
            screenName: item.screenname || 'LEAVE REQUEST',
            approveStatus: item.status,
            startDate: item.fromdate,
            endDate: item.todate,
            totalDays: item.totaldays || '',
            employeeName: item.employeename,
            employeeCode: item.employeecode,
            reason: '',
            leaveType: item.leavetype,
            employeeEmail: '',
            createdOn: item.createdon,
            screenCode: item.screencode,
            time: item.time
          };
        });

        const pendingOnly = mappedRequests.filter((r) => r.approveStatus === 'PENDING');
        setLeaveRequests(pendingOnly);
      }
    } catch (error) {
      console.error('Error fetching dashboard requests:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllRequests();
  }, [orgId, employeeCode, userType]);

  // Group requests by type for display
  const getGroupedRequests = () => {
    const groups = {};
    leaveRequests.forEach((request) => {
      const type = request.screenName;
      if (!groups[type]) {
        groups[type] = {
          type: type,
          count: 0,
          data: []
        };
      }
      groups[type].count++;
      groups[type].data.push(request);
    });
    return Object.values(groups);
  };

  // Approve All Handler
  const handleApproveAll = async () => {
    if (leaveRequests.length === 0) return;

    setProcessingId('ALL');

    for (const request of leaveRequests) {
      try {
        if (request.screenName === 'INCREMENT MANAGEMENT') {
          continue;
        }

        if (request.screenName === 'LEAVE REQUEST') {
          await handleActionLeave(request, 'APPROVED');
        } else if (request.screenName === 'PERMISSION REQUEST') {
          await handleActionPermission(request, 'APPROVED');
        } else if (request.screenName === 'COMPENSATORY OFF') {
          await handleActionCompoOff(request, 'APPROVED');
        } else if (request.screenName === 'CHECKINOUT') {
          await handleActionCheckout(request, 'APPROVED');
        } else if (request.screenName === 'CHECKINOUTADJUSTMENT') {
          await handleCheckInOutApprove(request, 'APPROVED');
        } else if (request.screenName === 'EXPENSE CLAIMS') {
          await handleActionExpense(request, 'APPROVED');
        } else if (request.screenName === 'TRAVEL REQUEST') {
          await handleActionTravel(request, 'APPROVED');
        }else if (request.screenName === 'WFH') {
          await handleActionWFH(request, 'APPROVED');
        }
      } catch (error) {
        console.error(`Error approving request ID ${request.id}:`, error);
      }
    }

    toast.success('All pending requests approved successfully', { autoClose: 3000 });
    setProcessingId(null);
  };

  // Action handlers for different request types
  const handleActionLeave = async (request, action) => {
    setProcessingId(request.id);
    try {
      await apiCalls(
        'put',
        `/leaveprocess/createApprovalLeave?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}&email=${request.email}`
      );

      setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));

      const isApproved = action === 'APPROVED';
      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        leave_type: request.leaveType,
        start_date: dayjs(request.startDate).format('DD-MM-YYYY'),
        end_date: dayjs(request.endDate).format('DD-MM-YYYY'),
        total_days: request.totalDays,
        status: action,
        status_message: isApproved ? 'Approved' : 'Rejected',
        remarks: request.remarks || 'N/A',
        email: request.employeeEmail
      };

      await emailjs.send('service_hff8dd7', 'template_0pmh0cu', templateParams, 'G6cKiPBXzCvlFaOuo');
      if (processingId !== 'ALL') {
        toast.success(`Request ${action.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleActionPermission = async (request, action) => {
    setProcessingId(request.permissionRequestId || request.id);
    try {
      await apiCalls(
        'put',
        `/employeemaster/createApprovalPermissionRequest?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.permissionRequestId || request.id}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}`
      );

      setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));

      const isApproved = action === 'APPROVED';
      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        start_date: dayjs(request.startDate).format('DD-MM-YYYY'),
        status: action,
        status_message: isApproved ? 'Approved' : 'Rejected',
        remarks: request.remarks || 'N/A',
        email: request.employeeEmail
      };

      await emailjs.send('service_9ucz1v3', 'template_om3wfui', templateParams, 'Opp4e1xb0JkW0bocB');
      if (processingId !== 'ALL') {
        toast.success(`Request ${action.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleActionCompoOff = async (request, action) => {
    setProcessingId(request.id);
    try {
      await apiCalls(
        'put',
        `/leaveprocess/createApprovalCompOff?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}`
      );

      setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));

      const isApproved = action === 'APPROVED';
      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        date: dayjs(request.compOffDate).format('DD-MM-YYYY'),
        status: action,
        status_message: isApproved ? 'Approved' : 'Rejected',
        remarks: request.remarks || 'N/A',
        email: request.employeeEmail
      };

      await emailjs.send('service_y4jqb7q', 'template_qf406wl', templateParams, '4wxbCMaMoQh0TD6tx');
      if (processingId !== 'ALL') {
        toast.success(`Request ${action.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleActionCheckout = async (request, action) => {
    setProcessingId(request.id);
    try {
      await apiCalls(
        'put',
        `/basicmaster/createApprovalCheckOut?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&checkOutDate=${request.checkInDate}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}`
      );

      setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));

      const isApproved = action === 'APPROVED';
      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        checkInDate: dayjs(request.checkInDate).format('DD-MM-YYYY'),
        entryTime: request.entryTime,
        status: action,
        status_message: isApproved ? 'Approved' : 'Rejected',
        email: request.employeeEmail
      };

      await emailjs.send('service_d3c7xso', 'template_tf8a8po', templateParams, 'uMcVJdror6W86lK6z');
      if (processingId !== 'ALL') {
        toast.success(`Request ${action.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleCheckInOutApprove = async (request, action) => {
    setProcessingId(request.id);
    try {
      const response = await apiCalls(
        'put',
        `/basicmaster/createApprovalCheckInOutAdjustment?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&checkOutDate=${request.checkInDate}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}`
      );

      const isSuccess = response?.data?.status === true;
      if (!isSuccess) {
        toast.error(response?.data?.paramObjectsMap?.errorMessage || 'Request could not be processed.');
        return;
      }

      setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));

      const isApproved = action === 'APPROVED';
      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        checkInDate: dayjs(request.checkInDate).format('DD-MM-YYYY'),
        entryTime: request.checkInTime || request.entryTime,
        exitTime: request.checkOutTime || request.exitTime,
        status: action,
        status_message: isApproved ? 'Approved' : 'Rejected',
        email: request.employeeEmail
      };

      await emailjs.send('service_q42xewl', 'template_i87in0m', templateParams, 'yPqDOZm63k5U6JbRJ');
      if (processingId !== 'ALL') {
        toast.success(`Request ${action.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleActionIncrementManagement = async (request, action) => {
    setProcessingId(request.id);
    try {
      const response = await apiCalls(
        'put',
        `/incrementmanagement/createApprovalIncrementManagement?action=${action}&actionBy=${employeeName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}`
      );

      if (response.status === true) {
        setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));
        if (processingId !== 'ALL') {
          toast.success(`Increment request ${action.toLowerCase()} successfully`);
        }
        setViewDialogOpen(false);
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} increment request`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing increment request:`, error);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} increment request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleActionExpense = async (request, action) => {
    setProcessingId(request.id);
    try {
      const response = await apiCalls(
        'put',
        `/assetmanagement/createApprovalExpenseClaims?action=${action}&actionBy=${employeeName}&employeeCode=${request.employeeCode}&id=${request.id}&notify=${employeeCode}&notifyCode=${employeeCode}&orgId=${orgId}&screenName=${request.screenName}&approvedAmount=${request.amount}`
      );

      if (response.status === true) {
        setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));
        if (processingId !== 'ALL') {
          toast.success(`Expense request ${action.toLowerCase()} successfully`);
        }
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} expense request`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing expense request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} expense request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleActionTravel = async (request, action) => {
    setProcessingId(request.id);
    try {
      const response = await apiCalls(
        'put',
        `/assetmanagement/createApprovalTravelRequests?action=${action}&actionBy=${employeeName}&employeeCode=${request.employeeCode}&id=${request.id}&notify=${employeeCode}&notifyCode=${employeeCode}&orgId=${orgId}&screenName=${request.screenName}&approvedAmount=${request.estimatedCost}`
      );

      if (response.status === true) {
        setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));
        if (processingId !== 'ALL') {
          toast.success(`Travel request ${action.toLowerCase()} successfully`);
        }
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} travel request`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing travel request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} travel request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleActionWFH = async (request, action) => {
    setProcessingId(request.id);
    try {
      const response = await apiCalls(
        'put',
        `leaveprocess/createApprovalWorkFromHome?action=${action}&actionBy=${employeeName}&employeeCode=${request.employeeCode}&id=${request.id}&notify=${employeeCode}&notifyCode=${employeeCode}&orgId=${orgId}&screenName=${request.screenName}&approvedAmount=${request.estimatedCost}`
      );

      if (response.status === true) {
        setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));
        if (processingId !== 'ALL') {
          toast.success(`Travel request ${action.toLowerCase()} successfully`);
        }
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} travel request`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing travel request:`, error);
      setLeaveRequests((prev) => [...prev, request]);
      if (processingId !== 'ALL') {
        toast.error(`Failed to ${action.toLowerCase()} travel request`);
      }
    } finally {
      if (processingId !== 'ALL') {
        setProcessingId(null);
      }
    }
  };

  const handleViewAll = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleViewIncrement = (incrementData) => {
    setSelectedIncrement(incrementData);
    setViewDialogOpen(true);
  };

  const ActionButtons = ({ request }) => {
    const isProcessing = processingId === request.id;
    const isPending = !request.approveStatus || request.approveStatus === 'PENDING';

    if (request.screenName === 'INCREMENT MANAGEMENT') {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleViewIncrement(request)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          View
        </Button>
      );
    }

    if (!isPending) {
      return (
        <Chip
          label={request.approveStatus}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: request.approveStatus === 'APPROVED' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            color: request.approveStatus === 'APPROVED' ? theme.palette.success.dark : theme.palette.error.dark
          }}
        />
      );
    }

    const getActionHandler = (action) => {
      switch (request.screenName) {
        case 'LEAVE REQUEST':
          return () => handleActionLeave(request, action);
        case 'PERMISSION REQUEST':
          return () => handleActionPermission(request, action);
        case 'COMPENSATORY OFF':
          return () => handleActionCompoOff(request, action);
        case 'CHECKINOUT':
          return () => handleActionCheckout(request, action);
        case 'CHECKINOUTADJUSTMENT':
          return () => handleCheckInOutApprove(request, action);
        case 'EXPENSE CLAIMS':
          return () => handleActionExpense(request, action);
        case 'TRAVEL REQUEST':
          return () => handleActionTravel(request, action);
        case 'WORKFROMHOME':
          return () => handleActionWFH(request, action);
        default:
          return () => {};
      }
    };

    return (
      <Box display="flex" gap={1}>
        <Tooltip title="Approve">
          <IconButtonStyled actiontype="approve" onClick={getActionHandler('APPROVED')} disabled={isProcessing}>
            {isProcessing ? <CircularProgress size={20} color="inherit" /> : <ThumbUp fontSize="small" />}
          </IconButtonStyled>
        </Tooltip>
        <Tooltip title="Reject">
          <IconButtonStyled actiontype="reject" onClick={getActionHandler('REJECTED')} disabled={isProcessing}>
            {isProcessing ? <CircularProgress size={20} color="inherit" /> : <ThumbDown fontSize="small" />}
          </IconButtonStyled>
        </Tooltip>
      </Box>
    );
  };

  const groupedRequests = getGroupedRequests();
  const totalCount = leaveRequests.length;

  const getTypeStyles = (type) => {
    if (type.includes('LEAVE') || type.includes('COMPENSATORY')) {
      return { icon: <EventNote />, color: '#ff9800', bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' };
    }
    if (type.includes('TIMESHEET')) {
      return { icon: <Work />, color: '#4caf50', bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' };
    }
    return { icon: <Assignment />, color: '#2196f3', bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' };
  };

  if (loading && leaveRequests.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" mt={2}>
          Loading requests...
        </Typography>
      </Paper>
    );
  }

  // Function to render request details based on screen type
  const renderRequestDetails = (request) => {
    if (request.screenName === 'CHECKINOUTADJUSTMENT') {
      return (
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mt: 1.7, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>{request.requestReason || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Check In Time</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#10b981' }}>
              {request.checkInTime || request.entryTime || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Check Out Time</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#ef4444' }}>
              {request.checkOutTime || request.exitTime || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              {dayjs(request.checkInDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
        </Box>
      );
    } else if (request.screenName === 'LEAVE REQUEST') {
      return (
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mt: 1.7, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>{request.reason || '-'}</Typography>
          </Box>
          
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Duration</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>{request.totalDays || '-'} days</Typography>
          </Box>

          {request.startDate === request.endDate ? (
            <>
             <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>{dayjs(request.startDate).format('DD-MM-YYYY')}</Typography>
          </Box>
          </>
          ):(
            <>
            <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>From Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              {dayjs(request.startDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>To Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              {dayjs(request.endDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
          </>
          )
          }
         
        </Box>
      );
    } else if (request.screenName === 'PERMISSION REQUEST') {
      return (
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mt: 1.7, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>{request.reason || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>From Time</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.fromTime || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>To Time</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.toTime || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              {dayjs(request.startDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
        </Box>
      );
    }
       else if (request.screenName === 'EXPENSE CLAIMS') {
      return (
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mt: 1.7, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>{request.description || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>From Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                 {dayjs(request.startDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>To Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                {dayjs(request.endDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
        </Box>
      );
    } 
     else if (request.screenName === 'TRAVEL REQUEST') {
      return (
        <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={4}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mt: 1.7, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>{request.businessPurpose || '-'}</Typography>
          </Box>
            <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>From</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.from || '-'}</Typography>
          </Box>
           <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>To</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.to || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>From Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                 {dayjs(request.startDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>To Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                {dayjs(request.endDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
        </Box>
      );
    }
    else if (request.screenName === 'WORKFROMHOME') {
      return (
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mt: 1.7, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>{request.reason || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                 {dayjs(request.wfhDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
         
        </Box>
      );
    }
    else if (request.screenName === 'COMPENSATORY OFF') {
      return (
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                 {dayjs(request.compOffDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
           <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.reason || '-'}</Typography>
          </Box>
         
        </Box>
      );
    }
    else {
      return (
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Type</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.screenName || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>From Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              {dayjs(request.startDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>To Date</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              {dayjs(request.endDate).format('DD-MM-YYYY')}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7b8794', mb: 0.5, textTransform: 'uppercase' }}>Reason</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{request.reason || '-'}</Typography>
          </Box>
        </Box>
      );
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          height: '100%',
          minHeight: '220px',
          maxHeight: '220px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.8rem', color: '#111827' }}>
              Pending Approvals
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.65rem' }}>
              Quick overview of pending actions
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Button
              size="small"
              onClick={handleViewAll}
              sx={{
                textTransform: 'none',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#2196f3',
                minWidth: 'auto',
                px: 1,
                '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' }
              }}
              endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
            >
              View All ({totalCount})
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : groupedRequests.length > 0 ? (
          <Box display="flex" flexDirection="column" gap={1}>
            {groupedRequests.slice(0, 2).map((cat) => {
              const styles = getTypeStyles(cat.type);
              return (
                <Box
                  key={cat.type}
                  sx={{
                    p: 1.5,
                    borderRadius: '14px',
                    background: styles.bg,
                    transition: '0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.5)',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: 'white', width: 28, height: 28, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                        {React.cloneElement(styles.icon, { sx: { color: styles.color, fontSize: 16 } })}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.75rem', color: '#111827' }}>
                          {cat.type}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.6rem' }}>
                          {cat.count} pending {cat.count === 1 ? 'request' : 'requests'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: styles.color, lineHeight: 1, mr: 1 }}>
                        {cat.count}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              No pending requests
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog for viewing all requests with Approve All button */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', bgcolor: '#f4f7fb', boxShadow: '0 20px 45px rgba(15,23,42,0.12)' } }}
      >
        <Box sx={{ px: 3, py: 2, background: 'linear-gradient(90deg, #1e3a5f 0%, #294d73 100%)', borderBottom: '1px solid #dbe3ec' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: 0.3 }}>
                All Pending Requests
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.76rem', mt: 0.4 }}>
                Total {totalCount} pending {totalCount === 1 ? 'request' : 'requests'} awaiting approval
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {isAdmin && leaveRequests.length > 0 && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleApproveAll}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 2,
                    borderRadius: '8px'
                  }}
                  disabled={processingId === 'ALL'}
                >
                  {processingId === 'ALL' ? <CircularProgress size={16} color="inherit" /> : 'Approve All'}
                </Button>
              )}
              <IconButton
                onClick={handleCloseDialog}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.12)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' }
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ p: 2.5, bgcolor: '#f4f7fb' }}>
          {groupedRequests.map((category, catIdx) => (
            <Box key={catIdx} sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 1.5, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box sx={{ width: 4, height: 20, bgcolor: '#2196f3', borderRadius: 2 }} />
                {category.type} ({category.count})
              </Typography>
              <List sx={{ p: 0 }}>
                {category.data.map((request, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      p: 2.2,
                      mb: 2,
                      borderRadius: '18px',
                      bgcolor: '#ffffff',
                      border: '1px solid #dbe3ec',
                      display: 'grid',
                      gridTemplateColumns: '280px 1fr 120px',
                      alignItems: 'center',
                      gap: 3,
                      transition: '0.25s ease',
                      '&:hover': { boxShadow: '0 8px 24px rgba(30,58,95,0.08)', borderColor: '#bfd0e2' }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 58,
                          height: 58,
                          bgcolor: '#2f5d8a',
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: '0 4px 10px rgba(47,93,138,0.18)'
                        }}
                      >
                        {request.employeeName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.94rem', color: '#1e293b' }}>
                          {request.employeeName || 'Unknown'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.4 }}>
                          Employee ID - {request.employeeCode || '-'}
                        </Typography>
                      </Box>
                    </Box>

                    {renderRequestDetails(request)}

                    {isAdmin && <ActionButtons request={request} />}
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </DialogContent>

        <DialogActions sx={{ py: 2, px: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: '8px', px: 3, py: 1, fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <IncrementViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        data={selectedIncrement}
        onApprove={() => handleActionIncrementManagement(selectedIncrement, 'APPROVED')}
        onReject={() => handleActionIncrementManagement(selectedIncrement, 'REJECTED')}
        isProcessing={processingId === selectedIncrement?.id}
      />
    </>
  );
};

export default PendingApprovalsSummary;
