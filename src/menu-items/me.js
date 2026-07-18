// assets
import {
  IconUsers,
  IconUserPause,
  IconDeviceLaptop,
  IconFingerprint,
  IconClockCheck,
  IconFileInvoice
} from '@tabler/icons-react';
import { FaPersonWalkingLuggage, FaUserClock } from 'react-icons/fa6';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

// Icon collection
const icons = {
  IconUsers,
  FaPersonWalkingLuggage,
  FaUserClock,
  IconUserPause,
  IconDeviceLaptop,
  BeachAccessIcon,
  AccessTimeIcon,
  FlightTakeoffIcon,
  IconFingerprint,
  IconClockCheck,
  IconFileInvoice
};

// Permission check
const hasScreenAccess = (screenId) => {
  const userType = localStorage.getItem('userType');

  if (userType === 'ADMIN') {
    return true;
  }

  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];

  return access?.canRead || access?.canWrite || access?.canDelete;
};

// Children items with permission checks
const meChildren = [
  // hasScreenAccess('HR') && {
  //   id: 'holidayReport',
  //   title: 'Holiday Report',
  //   type: 'item',
  //   url: '/me/HolidayReport',
  //   icon: icons.BeachAccessIcon
  // },
  hasScreenAccess('PR') && {
    id: 'permissionRequest',
    title: 'Permission Request',
    type: 'item',
    url: '/me/permissionRequest',
    icon: icons.FaUserClock
  },
  hasScreenAccess('LR') && {
    id: 'leaveRequest',
    title: 'Leave Request',
    type: 'item',
    url: '/me/leaveRequest',
    icon: icons.FaPersonWalkingLuggage
  },
  hasScreenAccess('TR') && {
    id: 'TravelRequest',
    title: 'Travel Request',
    type: 'item',
    url: '/me/TravelRequest',
    icon: icons.FlightTakeoffIcon
  },
  hasScreenAccess('COF') && {
    id: 'comp_Off',
    title: 'Comp_Off',
    type: 'item',
    url: '/me/Comp_Off',
    icon: icons.AccessTimeIcon
  },
  hasScreenAccess('WFH') && {
    id: 'WorkFromHome',
    title: 'WFH',
    type: 'item',
    url: '/me/WFH',
    icon: icons.IconDeviceLaptop
  },
  hasScreenAccess('TS') && {
    id: 'timeSheet',
    title: 'Timesheet',
    type: 'item',
    url: '/me/TimeSheet',
    icon: icons.AccessTimeIcon
  },
  hasScreenAccess('SISO') && {
    id: 'swipeInSwipeOut',
    title: 'Check-In/Out',
    type: 'item',
    url: '/me/CheckInOut',
    icon: icons.IconFingerprint
  },
  hasScreenAccess('PS') && {
    id: 'payslip',
    title: 'Payslip',
    type: 'item',
    url: '/finance/payslip',
    icon: IconFileInvoice
  },
  hasScreenAccess('TK') && {
    id: 'task',
    title: 'Task',
    type: 'item',
    url: '/team/Task',
    icon: IconFileInvoice
  },
].filter(Boolean); // filter out inaccessible screens

// Export final menu
const me =
  meChildren.length > 0
    ? {
      id: 'me',
      type: 'group',
      children: [
        {
          id: 'me',
          title: 'Me',
          type: 'collapse',
          icon: icons.IconUsers,
          children: meChildren
        }
      ]
    }
    : null;

export default me;
