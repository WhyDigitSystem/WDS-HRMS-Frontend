// assets
import { 
  IconCalendar,
  IconBeach,
  IconSun,
  IconCalendarEvent,
  IconCalendarOff
} from '@tabler/icons-react';

// constant
const icons = {
  IconCalendar,
  IconBeach,
  IconSun,
  IconCalendarEvent,
  IconCalendarOff
};

const userType = localStorage.getItem("userType");
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  "LEAVE TYPE": 'leaveType',
  // "LEAVE PROCESS": 'leaveProcess',
  // "LEAVE CREDIT CONTROL": 'leaveCreditControl',
  HOLIDAY: 'holidays'
};

const allScreens = [
  { 
    id: "leaveType", 
    title: "Leave Type", 
    type: "item", 
    url: "/leaveMaster/LeaveType",
    icon: icons.IconBeach  // Beach icon for leave types
  },
  { 
    id: "holidays", 
    title: "Holidays", 
    type: "item", 
    url: "/leaveMaster/Holidays",
    icon: icons.IconSun  // Sun icon for holidays
  },
];

const allowedScreenIds = userType === "ADMIN"
  ? allScreens.map(screen => screen.id) // Show all screens for ADMIN
  : allowedScreens.map(screen => screenMapping[screen]).filter(Boolean);

const leaveMaster = {
  id: 'leaveMaster',
  type: 'group',
  children: [
    {
      id: 'leaveMaster',
      title: 'Leave Master',
      type: 'collapse',
      icon: icons.IconCalendar,  // Calendar icon for Leave Master
      children: [
        {
          id: 'leaveType',
          title: 'Leave Type',
          type: 'item',
          url: '/leaveMaster/LeaveType',
          icon: icons.IconBeach
        },
        // {
        //   id: 'leaveProcess',
        //   title: 'Leave Process',
        //   type: 'item',
        //   url: '/leaveMaster/LeaveProcess',
        //   icon: icons.IconCalendarEvent
        // },
        // {
        //   id: 'leaveCreditControl',
        //   title: 'Leave Credit Control',
        //   type: 'item',
        //   url: '/leaveMaster/LeaveCreditControl',
        //   icon: icons.IconCalendarOff
        // },
        {
          id: 'holidays',
          title: 'Holidays',
          type: 'item',
          url: '/leaveMaster/Holidays',
          icon: icons.IconSun
        },
      ].filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default leaveMaster;