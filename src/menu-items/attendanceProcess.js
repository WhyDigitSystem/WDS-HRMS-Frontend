import {
  IconClock,
  IconCalendarStats,
  IconChecklist,
  IconCalendarTime,
  IconUserCheck,
  IconCalendarCheck,
  IconCalendarEvent
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// Define children based on access
const attendanceChildren = [
  hasScreenAccess('MA') && {
    id: 'monthlyAttendance',
    title: 'Monthly Attendance',
    type: 'item',
    url: '/attendanceProcess/MonthlyAttendance',
    icon: IconCalendarStats
  },
  hasScreenAccess('AP') && {
    id: 'attendanceProcess',
    title: 'Attendance Process',
    type: 'item',
    url: '/attendanceProcess/AttendenceProcess',
    icon: IconUserCheck
  },
  hasScreenAccess('AA') && {
    id: 'attendanceApproval',
    title: 'Approval',
    type: 'item',
    url: '/attendanceProcess/AttendanceApproval',
    icon: IconUserCheck
  },
  hasScreenAccess('LA') && {
    id: 'leaveApproval',
    title: 'Leave Approval',
    type: 'item',
    url: '/team/LeaveApproval',
    icon: IconCalendarCheck
  },
  hasScreenAccess('PA') && {
    id: 'permissionApproval',
    title: 'Permission Approval',
    type: 'item',
    url: '/team/PermissionApproval',
    icon: IconUserCheck
  },
  hasScreenAccess('TA') && {
    id: 'todayAttendance',
    title: 'Daily Attendance',
    type: 'item',
    url: '/team/DailyAttendance',
    icon: IconCalendarEvent
  },
].filter(Boolean);

// Only show parent group if any child is accessible
const attendanceProcess =
  attendanceChildren.length > 0
    ? {
      id: 'attendanceProcess',
      type: 'group',
      children: [
        {
          id: 'attendanceProcessCollapse',
          title: 'Attendance Tracker',
          type: 'collapse',
          icon: IconCalendarTime,
          children: attendanceChildren
        }
      ]
    }
    : null;

export default attendanceProcess;
