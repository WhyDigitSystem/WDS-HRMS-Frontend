// assets
import { IconDashboard } from '@tabler/icons-react';

// constant
const icons = { IconDashboard };

// Utility to check screen access
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //
const dashboard =
  // hasScreenAccess('DB')
  // ?
  {
    id: 'dashboard',
    type: 'group',
    children: [
      {
        id: 'default',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard/default',
        icon: icons.IconDashboard,
        breadcrumbs: false
      },
      // {
      //   id: 'dashboardpg',
      //   title: 'Dashboard',
      //   type: 'item',
      //   url: '/dashboardpg',
      //   icon: icons.IconDashboard,
      //   breadcrumbs: false
      // }
    ]
  };
// : null;

export default dashboard;
