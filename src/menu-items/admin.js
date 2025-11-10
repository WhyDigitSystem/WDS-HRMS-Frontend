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
  IconCalendarEvent
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
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
  }
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
            title: 'User Management',
            type: 'collapse',
            icon: IconShield,
            children: adminChildren
          }
        ]
      }
    : null;

export default admin;
