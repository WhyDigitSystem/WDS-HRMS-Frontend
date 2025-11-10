// assets
import {
  IconUsers,
  IconCalendarCheck,
  IconClockCheck,
  IconChartBar,
  IconCalendarEvent,
  IconUserCheck,
  IconIdBadge2,
  IconBeach,
  IconReportMoney,
  IconReport,
  IconFileInvoice
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

const teamChildren = [
  hasScreenAccess('AR') && {
    id: 'attendanceReport',
    title: 'Attendance',
    type: 'item',
    url: '/team/AttendanceReport',
    icon: IconChartBar
  },
  hasScreenAccess('CIOR') && {
    id: 'checkInOutReport',
    title: 'Check In & Out',
    type: 'item',
    url: '/team/EmployeeAttanceReport',
    icon: IconUsers
  },
  hasScreenAccess('SAR') && {
    id: 'shiftAssignReport',
    title: 'Shift Assign',
    type: 'item',
    url: '/team/ShiftAssignReport',
    icon: IconClockCheck
  },
  hasScreenAccess('HR') && {
    id: 'holidayReport',
    title: 'Holiday',
    type: 'item',
    url: '/me/Holiday',
    icon: IconBeach
  },
  //   hasScreenAccess('HR') && {
  //   id: 'holidays',
  //   title: 'Holidays',
  //   type: 'item',
  //   url: '/leaveMaster/Holidays',
  //   icon: IconBeach
  // },
  hasScreenAccess('SR') && {
    id: 'SalaryReport',
    title: 'Salary',
    type: 'item',
    url: '/salaryMaster/SalaryReport',
    icon: IconChartBar
  },
  hasScreenAccess('OT') && {
    id: 'OverTimeApproval',
    title: 'OT Approval',
    type: 'item',
    url: '/basicMaster/OTApproval',
    icon: IconIdBadge2
  },
  hasScreenAccess('ESIR') && {
    id: 'esi-report',
    title: 'ESI',
    type: 'item',
    url: '/finance/ESIReport',
    icon: IconReportMoney
  },
  hasScreenAccess('PFR') && {
    id: 'pf-report',
    title: 'PF',
    type: 'item',
    url: '/finance/PFCalculationReport',
    icon: IconReport
  },
  hasScreenAccess('PSG') && {
    id: 'payslipGenerate',
    title: 'Payslip',
    type: 'item',
    url: '/team/PayslipGenerate',
    icon: IconClockCheck
  },
    hasScreenAccess('OATR') && {
    id: 'overAllReport',
    title: 'Over All Task Report',
    type: 'item',
    url: '/me/OverAllReport',
    icon: IconFileInvoice
  },
  // hasScreenAccess('LA') && {
  //   id: 'leaveApproval',
  //   title: 'Leave Approval',
  //   type: 'item',
  //   url: '/team/LeaveApproval',
  //   icon: IconCalendarCheck
  // },
  // hasScreenAccess('PA') && {
  //   id: 'permissionApproval',
  //   title: 'Permission Approval',
  //   type: 'item',
  //   url: '/team/PermissionApproval',
  //   icon: IconUserCheck
  // },
  // hasScreenAccess('TA') && {
  //   id: 'todayAttendance',
  //   title: 'Today Attendance',
  //   type: 'item',
  //   url: '/team/TodayAttendance',
  //   icon: IconCalendarEvent
  // },

].filter(Boolean);

const team =
  teamChildren.length > 0
    ? {
      id: 'team',
      type: 'group',
      children: [
        {
          id: 'teamCollapse',
          title: 'Reports',
          type: 'collapse',
          icon: IconUsers,
          children: teamChildren
        }
      ]
    }
    : null;

export default team;
