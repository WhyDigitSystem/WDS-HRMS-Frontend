// assets
import { IconPackages } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// Build calendar menu only if user has access
const assetManagementChildren = [
  hasScreenAccess('ASM') && {
    id: 'AssetManagement',
    title: 'Asset Management',
    type: 'item',
    url: '/AssetManagement/AssetManagement',
    icon: IconPackages
  }
].filter(Boolean);

const AssetManagement =
  assetManagementChildren.length > 0
    ? {
        id: 'AssetManagement',
        type: 'group',
        children: assetManagementChildren
      }
    : null;

export default AssetManagement;
