// assets
import { IconDoorExit } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// Build calendar menu only if user has access
const separationManagementChildren = [
  hasScreenAccess('SPM') && {
    id: 'SeparationManagement',
    title: 'Separation',
    type: 'item',
    url: '/SeparationManagement/SeparationManagement',
    icon: IconDoorExit
  }
].filter(Boolean);

const SeparationManagement =
  separationManagementChildren.length > 0
    ? {
        id: 'SeparationManagement',
        type: 'group',
        children: separationManagementChildren
      }
    : null;

export default SeparationManagement;
