// assets
import { IconLayoutDashboard } from '@tabler/icons-react';

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

// dashboard menu
const dashboardChildren = [
  hasScreenAccess('DASH') && 
  {
    id: 'default',
    title: 'Dashboard',
    type: 'item',
    url: '/dashboard/default',
    icon: IconLayoutDashboard,
    breadcrumbs: false
  }
].filter(Boolean);

const dashboard =
  dashboardChildren.length > 0
    ? {
        id: 'dashboard',
        type: 'group',
        children: dashboardChildren
      }
    : null;

export default dashboard;
