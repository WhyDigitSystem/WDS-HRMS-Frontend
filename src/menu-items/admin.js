// assets
import {
  IconAppWindow,
  IconCalendarDollar,
  IconCopyright,
  IconFileTypeDoc,
  IconSettingsPlus,
  IconSquareRoundedPlus,
  IconUserPlus,
  IconShield,
  IconListDetails,
  IconCalendarEvent,
  IconUserSearch
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const userType = localStorage.getItem('userType');

  if (userType === 'ADMIN') {
    return true;
  }

  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];

  return access?.canRead || access?.canWrite || access?.canDelete;
};

// menu items with permission check
const adminChildren = [
  hasScreenAccess('UC') && {
    id: 'admin',
    title: 'User Creation',
    type: 'item',
    url: '/admin/user-creation/userCreation',
    icon: IconUserPlus
  },
  hasScreenAccess('RR') && {
    id: 'rolesAndResponsibilities',
    title: 'Roles And Responsibilities',
    type: 'item',
    url: '/basicMaster/roles',
    icon: IconShield
  },
  hasScreenAccess('SN') && {
    id: 'screenNames',
    title: 'Screens',
    type: 'item',
    url: '/companysetup/Screens',
    icon: IconListDetails
  },
  hasScreenAccess('SCA') && {
    id: 'screenAccess',
    title: 'Screen Access',
    type: 'item',
    url: '/companysetup/ScreenAccess',
    icon: IconListDetails
  },
  hasScreenAccess('LAD') && {
    id: 'leaveAssigned',
    title: 'Leave Assigned',
    type: 'item',
    url: '/companysetup/LeaveAssigned',
    icon: IconCalendarEvent
  },
  hasScreenAccess('ED') && {
    id: 'employeeDetails',
    title: 'Employee Profile',
    type: 'item',
    url: '/employeeMaster/employeeProfile',
    icon: IconUserSearch
  },
].filter(Boolean);

// full admin menu
const admin =
  adminChildren.length > 0
    ? {
        id: 'admin',
        type: 'group',
        children: [
          {
            id: 'admin',
            title: 'User Mgmt',
            type: 'collapse',
            icon: IconShield,
            children: adminChildren
          }
        ]
      }
    : null;

export default admin;
