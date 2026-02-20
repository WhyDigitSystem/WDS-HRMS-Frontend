import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import { ThumbUp, ThumbDown, Close, ArrowForward } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import apiCalls from 'apicall';
import emailjs from '@emailjs/browser';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import IncrementViewDialog from 'utils/IncrementViewDialog';
import { showToast } from 'utils/toast-component';

// Background image component
const BackgroundImage = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
        opacity: 0.15,
        backgroundImage:
          'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(2px)'
      }}
    />
  );
};

// Gradient overlay for better readability
const GradientOverlay = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        zIndex: -1
      }}
    />
  );
};

const StyledCard = styled(MainCard)(({ theme }) => ({
  background: `rgba(255, 255, 255, 0.85)`,
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid rgba(255, 255, 255, 0.3)`,
  borderLeft: `4px solid #364152`, // Added left border color
  '&:hover': {
    boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

const RequestItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: '16px',
  background: theme.palette.background.paper,
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  border: `1px solid ${theme.palette.divider}`,
  borderLeft: `4px solid #364152`, // Added left border color
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.1)'
  }
}));

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

const ViewAllButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  color: theme.palette.primary.main,
  padding: '6px 12px',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.primary.light}`,
  background: 'rgba(25, 118, 210, 0.05)',
  '&:hover': {
    background: 'rgba(25, 118, 210, 0.1)',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
  },
  '& .MuiButton-endIcon': {
    marginLeft: '4px',
    transition: 'transform 0.2s ease'
  },
  '&:hover .MuiButton-endIcon': {
    transform: 'translateX(2px)'
  }
}));

const PendingApproval = ({ isLoading }) => {
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [screenNames, setScreenNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [empCode, setEmpCode] = useState(localStorage.getItem('employeeCode'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [userType] = useState(localStorage.getItem('userType'));
  const employeeCode = localStorage.getItem('employeeCode');
  const isProcessing = processingId !== null;
  const [selectedIncrement, setSelectedIncrement] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [EMPLOYEECODE] = useState("WDS051");
  const isAdmin = userType?.toUpperCase() === "ADMIN";

  useEffect(() => {
    getAllRequests();
  }, [orgId, employeeCode]);

  console.log('Leave', leaveRequests)

  // const getAllRequests = async () => {
  //   try {
  //     setLoading(true);

  //     const [
  //       leaveResponse,
  //       permissionResponse,
  //       compoOffResponse,
  //       checkOutResponse,
  //       checkInOutResult,
  //       incrementResponse,
  //       expenseClaims,
  //       travelExpense
  //     ] = await Promise.all([
  //       apiCalls(
  //         'get',
  //         `leaveprocess/getLeaveRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `employeemaster/getPendingPermissionRequest?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `leaveprocess/getCompoffRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `basicmaster/getRequestCheckOutByOrgId?branch=${branch}&orgId=${orgId}&reportingPersoncode=${employeeCode}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `basicmaster/getRequestCheckInOutByOrgId?branch=${branch}&orgId=${orgId}&reportingPersoncode=${employeeCode}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `incrementmanagement/getIncrementManagementForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `/assetmanagement/getExpenseClaimsForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `/assetmanagement/getTravelRequestsForDashBoard?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
  //       )
  //     ]);

  //     // ===== Normalize all responses =====
  //     const normalize = (data) =>
  //       Array.isArray(data) ? data : [data].filter(Boolean);

  //     const leaveRequests = normalize(leaveResponse?.paramObjectsMap?.leaveRequestVO);
  //     const permissionRequests = normalize(permissionResponse?.paramObjectsMap?.permissionRequestVO);
  //     const compoOffRequests = normalize(compoOffResponse?.paramObjectsMap?.compensatoryOffVO);
  //     const incrementManagementRequests = normalize(incrementResponse?.paramObjectsMap?.incrementManagementVO);
  //     const expenseRequests = normalize(expenseClaims?.paramObjectsMap?.expenseClaimsVO);
  //     const travelRequests = normalize(travelExpense?.paramObjectsMap?.travelRequestsVO);

  //     let checkOutRequests = normalize(checkOutResponse?.paramObjectsMap?.checkInVO).map((item) => ({
  //       ...item,
  //       employeeEmail: item.email || item.employeeEmail || ''
  //     }));

  //     // ===== Process CheckInOut Adjustment =====
  //     const rawCheckInOut = normalize(checkInOutResult?.paramObjectsMap?.checkInOutAdjustmentVO);

  //     const grouped = {};

  //     rawCheckInOut.forEach((item) => {
  //       const key = `${item.employeeCode}_${item.checkInDate}`;

  //       if (!grouped[key]) {
  //         grouped[key] = {
  //           ...item,
  //           id: key,
  //           entryTime: '',
  //           exitTime: '',
  //           employeeEmail: item.email || item.employeeEmail || '',
  //           records: []
  //         };
  //       }

  //       grouped[key].records.push(item);
  //     });

  //     const checkInOutRequests = Object.values(grouped).map((group) => {
  //       const sortedRecords = group.records.sort((a, b) =>
  //         a.entryTime.localeCompare(b.entryTime)
  //       );

  //       const entry = sortedRecords[0]?.entryTime || '';
  //       const exit = sortedRecords[sortedRecords.length - 1]?.entryTime || '';

  //       return {
  //         ...group,
  //         entryTime: entry,
  //         exitTime: exit,
  //         approveStatus: group.records[0]?.approveStatus || 'PENDING',
  //         screenName: group.records[0]?.screenName || 'CHECKINOUTADJUSTMENT'
  //       };
  //     });

  //     // ===== Filter only PENDING requests =====
  //     const filterPending = (arr) => arr.filter((r) => !r.approveStatus || r.approveStatus === 'PENDING');

  //     const combinedRequests = [
  //       ...filterPending(leaveRequests),
  //       ...filterPending(permissionRequests),
  //       ...filterPending(compoOffRequests),
  //       ...filterPending(checkOutRequests),
  //       ...filterPending(checkInOutRequests),
  //       ...filterPending(incrementManagementRequests),
  //       ...filterPending(expenseRequests),
  //       ...filterPending(travelRequests),
  //     ];

  //     // ===== Set State =====
  //     setLeaveRequests(combinedRequests);
  //     setScreenNames(combinedRequests.map((item) => item.screenName));
  //   } catch (error) {
  //     console.error('Error fetching combined requests:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const mapUserDashboardToAdminFormat = (list = []) => {
    const grouped = {};

    list.forEach((item, index) => {
      const key = `${item.type}_${item.fromdate}`;

      if (!grouped[key]) {
        let screenName = "";

        if (item.type === "CHECKINOUT_ADJUSTMENT") {
          screenName = "CHECKINOUTADJUSTMENT";
        } else if (item.type === "COMPENSATORY_OFF") {
          screenName = "COMPENSATORY OFF";
        } else {
          screenName = item.type.replace(/_/g, " ");
        }

        grouped[key] = {
          id: index + 1,
          screenName,
          approveStatus: item.approvalstatus,

          startDate: item.fromdate,
          endDate: item.todate,
          checkInDate: item.fromdate,

          // CompOff specific
          compOffDate:
            item.type === "COMPENSATORY_OFF"
              ? item.fromdate
              : undefined,

          totalDays:
            item.type === "COMPENSATORY_OFF"
              ? "1"
              : item.duration || "",

          employeeName,
          employeeCode,

          reason: item.reason || "",
          leaveType:
            item.type === "COMPENSATORY_OFF"
              ? "Compensatory Off"
              : "",

          entryTime: "",
          exitTime: "",
          records: []
        };
      }

      grouped[key].records.push(item);
    });

    return Object.values(grouped).map((group) => {
      if (group.screenName === "CHECKINOUTADJUSTMENT") {
        const inEntry = group.records.find(r => r.status === "IN");
        const outEntry = group.records.find(r => r.status === "OUT");

        group.entryTime = inEntry?.time || "";
        group.exitTime = outEntry?.time || "";
      }

      delete group.records;
      return group;
    });
  };

  const getAllRequests = async () => {
    try {
      setLoading(true);

      const userType = localStorage.getItem("userType");

      // ================= ADMIN FLOW =================
      if (userType === "ADMIN") {

        const [
          leaveResponse,
          permissionResponse,
          compoOffResponse,
          checkOutResponse,
          checkInOutResult,
          incrementResponse,
          expenseClaims,
          travelExpense
        ] = await Promise.all([
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
          apiCalls(
            'get',
            `basicmaster/getRequestCheckOutByOrgId?branch=${branch}&orgId=${orgId}&reportingPersoncode=${employeeCode}`
          ),
          apiCalls(
            'get',
            `basicmaster/getRequestCheckInOutByOrgId?branch=${branch}&orgId=${orgId}&reportingPersoncode=${employeeCode}`
          ),
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
          )
        ]);

        const normalize = (data) =>
          Array.isArray(data) ? data : [data].filter(Boolean);

        const leaveRequests = normalize(leaveResponse?.paramObjectsMap?.leaveRequestVO);
        const permissionRequests = normalize(permissionResponse?.paramObjectsMap?.permissionRequestVO);
        const compoOffRequests = normalize(compoOffResponse?.paramObjectsMap?.compensatoryOffVO);
        const incrementManagementRequests = normalize(incrementResponse?.paramObjectsMap?.incrementManagementVO);
        const expenseRequests = normalize(expenseClaims?.paramObjectsMap?.expenseClaimsVO);
        const travelRequests = normalize(travelExpense?.paramObjectsMap?.travelRequestsVO);

        let checkOutRequests = normalize(checkOutResponse?.paramObjectsMap?.checkInVO).map((item) => ({
          ...item,
          employeeEmail: item.email || item.employeeEmail || ''
        }));

        // ===== Process CheckInOut Adjustment =====
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
              employeeEmail: item.email || item.employeeEmail || '',
              records: []
            };
          }

          grouped[key].records.push(item);
        });

        const checkInOutRequests = Object.values(grouped).map((group) => {
          const sortedRecords = group.records.sort((a, b) =>
            a.entryTime.localeCompare(b.entryTime)
          );

          const entry = sortedRecords[0]?.entryTime || '';
          const exit = sortedRecords[sortedRecords.length - 1]?.entryTime || '';

          return {
            ...group,
            entryTime: entry,
            exitTime: exit,
            approveStatus: group.records[0]?.approveStatus || 'PENDING',
            screenName: group.records[0]?.screenName || 'CHECKINOUTADJUSTMENT'
          };
        });

        const filterPending = (arr) =>
          arr.filter((r) => !r.approveStatus || r.approveStatus === 'PENDING');

        const combinedRequests = [
          ...filterPending(leaveRequests),
          ...filterPending(permissionRequests),
          ...filterPending(compoOffRequests),
          ...filterPending(checkOutRequests),
          ...filterPending(checkInOutRequests),
          ...filterPending(incrementManagementRequests),
          ...filterPending(expenseRequests),
          ...filterPending(travelRequests)
        ];

        setLeaveRequests(combinedRequests);
        setScreenNames(combinedRequests.map((item) => item.screenName));
      }

      // ================= USER FLOW =================
      else {

        const result = await apiCalls(
          'get',
          `/basicmaster/getDashBoardApprovalStatusDetails/${employeeCode}`
        );

        const dashboardData =
          result?.paramObjectsMap?.dashBoard || [];

        const mapped = mapUserDashboardToAdminFormat(dashboardData);

        const pendingOnly = mapped.filter(
          (r) => !r.approveStatus || r.approveStatus === "PENDING"
        );

        setLeaveRequests(pendingOnly);
        setScreenNames(pendingOnly.map((i) => i.screenName));
      }

    } catch (error) {
      console.error("Error fetching dashboard requests:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log('Permission', screenNames);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  const handleActionLeave = async (request, action) => {
    setProcessingId(request.id);

    try {
      // 1. Make API call to approve/reject
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
        status_class: isApproved ? 'status-approved' : 'status-rejected',
        remarks: request.remarks || 'N/A',
        email: request.employeeEmail
      };
      console.log('Payload', request.fromDate);

      // 3. Send email notification
      await emailjs.send('service_hff8dd7', 'template_0pmh0cu', templateParams, 'G6cKiPBXzCvlFaOuo');

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000
      });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleActionPermission = async (request, action) => {
    setProcessingId(request.permissionRequestId);

    try {
      // 1. Make API call to approve/reject
      await apiCalls(
        'put',
        `/employeemaster/createApprovalPermissionRequest?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.permissionRequestId}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}`
      );

      setLeaveRequests((prev) => prev.filter((r) => r.id !== request.permissionRequestId));

      const isApproved = action === 'APPROVED';

      const fromTimeFormatted = request.fromTime ? dayjs(request.fromTime, ['HH:mm', 'HHmm']).format('HH:mm') : '';

      const toTimeFormatted = request.toTime ? dayjs(request.toTime, ['HH:mm', 'HHmm']).format('HH:mm') : '';

      let totalHoursFormatted = request.totalHours || '';
      if (totalHoursFormatted.length === 4 && !totalHoursFormatted.includes(':')) {
        // e.g., "0100" => "01:00"
        totalHoursFormatted = `${totalHoursFormatted.slice(0, 2)}:${totalHoursFormatted.slice(2)}`;
      }

      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        start_date: dayjs(request.fromDate).format('DD-MM-YYYY'),
        from_time: fromTimeFormatted,
        to_time: toTimeFormatted,
        total_hours: totalHoursFormatted,
        status: action,
        status_message: isApproved ? 'Approved' : 'Rejected',
        status_class: isApproved ? 'status-approved' : 'status-rejected',
        remarks: request.remarks || 'N/A',
        email: request.employeeEmail
      };

      // 3. Send email notification
      await emailjs.send('service_9ucz1v3', 'template_om3wfui', templateParams, 'Opp4e1xb0JkW0bocB');

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000
      });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleActionCompoOff = async (request, action) => {
    setProcessingId(request.id);

    try {
      // 1. Make API call to approve/reject
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
        status_class: isApproved ? 'status-approved' : 'status-rejected',
        remarks: request.remarks || 'N/A',
        email: request.employeeEmail
      };

      // 3. Send email notification
      await emailjs.send('service_y4jqb7q', 'template_qf406wl', templateParams, '4wxbCMaMoQh0TD6tx');

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000
      });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleActionCheckout = async (request, action) => {
    setProcessingId(request.id);

    try {
      // 1. Make API call to approve/reject
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
        status_class: isApproved ? 'status-approved' : 'status-rejected',
        email: request.employeeEmail
      };

      // 3. Send email notification
      await emailjs.send('service_d3c7xso', 'template_tf8a8po', templateParams, 'uMcVJdror6W86lK6z');

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000
      });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckInOutApprove = async (request, action) => {
    setProcessingId(request.id);

    try {
      // 1. Make approval/rejection API call
      const response = await apiCalls(
        'put',
        `/basicmaster/createApprovalCheckInOutAdjustment?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&checkOutDate=${request.checkInDate}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${request.screenName}`
      );

      const isSuccess = response?.data?.status === true;

      if (!isSuccess) {
        toast.error(response?.data?.paramObjectsMap?.errorMessage || 'Check In/Out request could not be processed.', {
          autoClose: 3000
        });
        return;
      }

      // 2. Remove the request from UI
      setLeaveRequests((prev) => prev.filter((r) => r.id !== request.id));

      // 3. Extract IN and OUT times from backend response
      const backendDataList = response?.data?.paramObjectsMap?.checkInOutAdjustmentVO || [];

      // Case-insensitive match for status
      const inEntry = backendDataList.find(item => item.status?.toUpperCase() === 'IN');
      const outEntry = backendDataList.find(item => item.status?.toUpperCase() === 'OUT');

      const isApproved = action === 'APPROVED';

      // 4. Compose email parameters
      const templateParams = {
        name: request.employeeName || inEntry?.empName || outEntry?.empName || 'Employee',
        from_name: employeeName,
        checkInDate: dayjs(request.checkInDate || inEntry?.checkInDate || outEntry?.checkInDate).format('DD-MM-YYYY'),
        entryTime: inEntry?.entryTime || '',
        exitTime: outEntry?.entryTime || '',
        status: action,
        status_message: isApproved ? 'Approved' : 'Rejected',
        status_class: isApproved ? 'status-approved' : 'status-rejected',
        email: request.employeeEmail || inEntry?.email || outEntry?.email || ''
      };

      if (!templateParams.email) {
        toast.warning('Recipient email not found. Email not sent.', { autoClose: 3000 });
        return;
      }

      // 5. Send email
      await emailjs.send('service_q42xewl', 'template_i87in0m', templateParams, 'yPqDOZm63k5U6JbRJ');

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000
      });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing Check In/Out request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
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

        toast.success(`Increment request ${action.toLowerCase()} successfully`, {
          autoClose: 3000
        });
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} increment request`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing increment request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} increment request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
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

        toast.success(`Expense request ${action.toLowerCase()} successfully`, {
          autoClose: 3000
        });
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} expense request`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing expense request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} expense request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
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

        toast.success(`Travel request ${action.toLowerCase()} successfully`, {
          autoClose: 3000
        });
      } else {
        throw new Error(response.message || `Failed to ${action.toLowerCase()} travel request`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing travel request:`, error);

      // Revert UI if error occurs
      setLeaveRequests((prev) => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} travel request`, {
        autoClose: 3000
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async () => {
    if (leaveRequests.length === 0) return;

    setProcessingId('ALL');

    for (const request of leaveRequests) {
      try {
        // Skip increment management from bulk approval
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
        } else if (request.screenName === 'CHECKINOUTADJUSTMENT') {
          await handleCheckInOutApprove(request, 'APPROVED');
        } else if (request.screenName === 'EXPENSE CLAIMS') {
          await handleActionExpense(request, 'APPROVED');
        } else if (request.screenName === 'TRAVEL REQUEST') {
          await handleActionTravel(request, 'APPROVED');
        }
      } catch (error) {
        console.error(`Error approving request ID ${request.id}:`, error);
      }
    }

    toast.success('All pending requests approved', { autoClose: 3000 });
    setProcessingId(null);
  };

  const handleViewIncrement = (incrementData) => {
    setSelectedIncrement(incrementData);
    setViewDialogOpen(true);
  };

  const handleApproveIncrement = async (incrementData) => {
    try {
      // Call the increment management approval API
      await handleActionIncrementManagement(incrementData, 'APPROVED');
      setViewDialogOpen(false);
      // showToast('success', 'Increment approved successfully');
    } catch (error) {
      showToast('error', 'Failed to approve increment');
    }
  };

  const handleRejectIncrement = async (incrementData) => {
    try {
      await handleActionIncrementManagement(incrementData, 'REJECTED');
      setViewDialogOpen(false);
      showToast('success', 'Increment rejected successfully');
    } catch (error) {
      showToast('error', 'Failed to reject increment');
    }
  };

  const ActionButtons = ({ request }) => {
    const isProcessing = processingId === request.id;
    const isPending = !request.approveStatus || request.approveStatus === 'PENDING';

    // Check for Increment Management - Only show View button in main list
    if (request.screenName === 'INCREMENT MANAGEMENT') {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleViewIncrement(request)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          View
        </Button>
      );
    }

    // Normal approve/reject logic for other screens
    if (!isPending) {
      return (
        <Chip
          label={request.approveStatus}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor:
              request.approveStatus === 'APPROVED'
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(244, 67, 54, 0.1)',
            color:
              request.approveStatus === 'APPROVED'
                ? theme.palette.success.dark
                : theme.palette.error.dark
          }}
        />
      );
    }

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        {/* APPROVE Button for other request types */}
        <Tooltip title="Approve request">
          <span>
            <IconButtonStyled
              actiontype="approve"
              onClick={() => {
                if (request.screenName === 'LEAVE REQUEST') handleActionLeave(request, 'APPROVED');
                if (request.screenName === 'PERMISSION REQUEST') handleActionPermission(request, 'APPROVED');
                if (request.screenName === 'COMPENSATORY OFF') handleActionCompoOff(request, 'APPROVED');
                if (request.screenName === 'CHECKINOUT') handleActionCheckout(request, 'APPROVED');
                if (request.screenName === 'CHECKINOUTADJUSTMENT') handleCheckInOutApprove(request, 'APPROVED');
                if (request.screenName === 'EXPENSE CLAIMS') handleActionExpense(request, 'APPROVED');
                if (request.screenName === 'TRAVEL REQUEST') handleActionTravel(request, 'APPROVED');
              }}
              disabled={isProcessing}
            >
              {isProcessing ? <CircularProgress size={20} color="inherit" /> : <ThumbUp fontSize="small" />}
            </IconButtonStyled>
          </span>
        </Tooltip>

        {/* REJECT Button for other request types */}
        <Tooltip title="Reject request">
          <span>
            <IconButtonStyled
              actiontype="reject"
              onClick={() => {
                if (request.screenName === 'LEAVE REQUEST') handleActionLeave(request, 'REJECTED');
                if (request.screenName === 'PERMISSION REQUEST') handleActionPermission(request, 'REJECTED');
                if (request.screenName === 'COMPENSATORY OFF') handleActionCompoOff(request, 'REJECTED');
                if (request.screenName === 'CHECKINOUT') handleActionCheckout(request, 'REJECTED');
                if (request.screenName === 'CHECKINOUTADJUSTMENT') handleCheckInOutApprove(request, 'REJECTED');
                if (request.screenName === 'EXPENSE CLAIMS') handleActionExpense(request, 'REJECTED');
                if (request.screenName === 'TRAVEL REQUEST') handleActionTravel(request, 'REJECTED');
              }}
              disabled={isProcessing}
            >
              {isProcessing ? <CircularProgress size={20} color="inherit" /> : <ThumbDown fontSize="small" />}
            </IconButtonStyled>
          </span>
        </Tooltip>
      </Stack>
    );
  };

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <BackgroundImage />
      <GradientOverlay />
      <StyledCard sx={{ p: 3, height: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="700" color="primary">
            Pending Approvals
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            {userType?.toUpperCase() === "ADMIN" && leaveRequests.length > 0 && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleApproveAll}
                sx={{ textTransform: 'none', color: 'white', fontWeight: 'bold' }}
                disabled={isProcessing === 'ALL'}
              >
                {isProcessing === 'ALL' ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  'Approve All'
                )}
              </Button>
            )}

            {leaveRequests.length > 3 && (
              <ViewAllButton
                onClick={handleOpenModal}
                endIcon={<ArrowForward sx={{ fontSize: '18px' }} />}
              >
                View All ({leaveRequests.length})
              </ViewAllButton>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="h6" mt={2} color="text.secondary">
              Loading requests...
            </Typography>
          </Box>
        ) : leaveRequests.length > 0 ? (
          <Stack spacing={2.5}>
            {leaveRequests.slice(0, 3).map((leaveRequest, index) => (
              <RequestItem key={index}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 44,
                          height: 44,
                          mr: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        {leaveRequest.employeeName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          {/* {userType === "Admin"
                            ? (leaveRequest.employeeName || "Unknown Employee")
                            : (employeeName || "Unknown Employee")} */}
                          {leaveRequest.employeeName || "Unknown Employee"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {leaveRequest.screenName || 'No type specified'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box display="flex" justifyContent="flex-end">
                      {isAdmin ? (
                        <ActionButtons request={leaveRequest} />
                      ) : (
                        <Stack spacing={0.5} alignItems="flex-end">
                          {/* FROM */}
                          <Typography fontSize="0.8rem" color="text.secondary">
                            From{" "}
                            <Box component="span" fontWeight={600} color="text.primary">
                              {dayjs(leaveRequest.startDate).format("DD-MM-YYYY")}
                            </Box>
                          </Typography>

                          {/* TO */}
                          <Typography fontSize="0.8rem" color="text.secondary">
                            To{" "}
                            <Box component="span" fontWeight={600} color="text.primary">
                              {dayjs(leaveRequest.endDate).format("DD-MM-YYYY")}
                            </Box>
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </RequestItem>
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Pending Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any leave requests to approve right now.
            </Typography>
          </Box>
        )}

        {/* Modal Dialog for All Requests */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: '20px',
              p: 0,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              py: 2,
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h3" fontWeight="700">
                Pending Requests
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ py: 3, px: 4 }}>
            <Stack spacing={3}>
              {leaveRequests.map((request, index) => {
                const screen = request.screenName;
                return (
                  <Box key={index}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 52,
                              height: 52,
                              mr: 2,
                              fontSize: '1.3rem',
                              fontWeight: 600,
                              boxShadow: theme.shadows[3]
                            }}
                          >
                            {request.employeeName?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="600">
                              {`${request.employeeName || 'Unknown Employee'} - ${request.employeeCode || ''}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.department || 'No department specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                          {screen === 'LEAVE REQUEST' && (
                            <>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" color="text.secondary">
                                  Leave Type
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.leaveType || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" color="text.secondary">
                                  Duration
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.totalDays || 0} day{request.totalDays !== '1.00' ? 's' : ''}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" color="text.secondary">
                                  From Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.startDate || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" color="text.secondary">
                                  To Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.endDate || '-'}
                                </Typography>
                              </Grid>
                            </>
                          )}

                          {screen === 'PERMISSION REQUEST' && (
                            <>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Permission Request
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.date}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Time
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.fromTime} - {request.toTime}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Total Hours
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.totalHours}
                                </Typography>
                              </Grid>
                            </>
                          )}

                          {screen === 'COMPENSATORY OFF' && (
                            <>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Leave Type
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.leaveType}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Comp Off Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.compOffDate}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Total Days
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.totalDays}
                                </Typography>
                              </Grid>
                            </>
                          )}

                          {screen === 'CHECKINOUT' && (
                            <>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  CheckOut Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.checkInDate}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  CheckOut Time
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.entryTime}
                                </Typography>
                              </Grid>
                            </>
                          )}

                          {screen === 'CHECKINOUTADJUSTMENT' && (
                            <>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  CheckINOut Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.checkInDate}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  CheckIn Time
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.entryTime || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  CheckOut Time
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.exitTime || '-'}
                                </Typography>
                              </Grid>
                            </>
                          )}

                          {screen === 'INCREMENT MANAGEMENT' && (
                            <>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Increment Cycle
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.incrementCycle}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Increase %
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.totalCtcPercentage}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  New Designation
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.newDesignation || '-'}
                                </Typography>
                              </Grid>
                            </>
                          )}
                          {screen === 'EXPENSE CLAIMS' && (
                            <>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Category
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.category}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Amount
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {`${request.amount}-${request.currency}`}
                                </Typography>
                              </Grid>
                              {/* <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Exp Limit
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {`${request.expenseLimit}`}
                                </Typography>
                              </Grid> */}
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Expense Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.expenseDate ? dayjs(request.expenseDate).format('DD-MM-YYYY') : '-'}
                                </Typography>
                              </Grid>
                            </>
                          )}
                          {screen === 'TRAVEL REQUEST' && (
                            <>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Category
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {request.screenName}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Est. Amount
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {`${request.estimatedCost}`}
                                </Typography>
                              </Grid>
                              {/* <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Exp Limit
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {`${request.expenseLimit}`}
                                </Typography>
                              </Grid> */}
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {`${request.departureDate ? dayjs(request.departureDate).format('DD/MM/YYYY') : '-'} to 
                                  ${request.returnDate ? dayjs(request.returnDate).format('DD/MM/YYYY') : '-'}`}
                                </Typography>
                              </Grid>
                            </>
                          )}
                        </Grid>

                        {request.reason && (
                          <Box mt={2}>
                            <Typography variant="body2" color="text.secondary">
                              Reason
                            </Typography>
                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                              {request.reason}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>

                    <Box mt={3} display="flex" justifyContent="flex-end">
                      {
                        isAdmin ? (
                          <ActionButtons request={request} />
                        ) : null
                      }

                    </Box>

                    {index < leaveRequests.length - 1 && <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.1)' }} />}
                  </Box>
                );
              })}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ py: 2, px: 3 }}>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                px: 3,
                py: 1,
                borderWidth: '1px',
                fontWeight: 600,
                '&:hover': {
                  borderWidth: '1px',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Increment View Dialog */}
        <IncrementViewDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          data={selectedIncrement}
          onApprove={handleApproveIncrement}
          onReject={handleRejectIncrement}
          isProcessing={processingId === selectedIncrement?.id}
        />
      </StyledCard>
    </Box>
  );
};

PendingApproval.propTypes = {
  isLoading: PropTypes.bool
};

export default PendingApproval;