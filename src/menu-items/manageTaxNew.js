// assets
import { IconPackages } from '@tabler/icons-react';

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

// Build calendar menu only if user has access
const manageTaxNewChildren = [
  hasScreenAccess('ASM') && {
    id: 'manageTaxNew',
    title: 'Manage Tax New',
    type: 'item',
    url: '/ManageTaxNew/ManageTaxNew',
    icon: IconPackages
  }
].filter(Boolean);

const manageTaxNew =
  manageTaxNewChildren.length > 0
    ? {
        id: 'ManageTaxNew',
        type: 'group',
        children: manageTaxNewChildren
      }
    : null;

export default manageTaxNew;
