import { IconPackages } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
    const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
    const access = screenAccess?.[screenId];
    return access?.canRead || access?.canWrite || access?.canDelete;
};

// Build calendar menu only if user has access
const expenceManagementChildren = [
    hasScreenAccess('EXT') && {
        id: 'ExpenceManagement',
        title: 'Expense',
        type: 'item',
        url: '/ExpenceManagement/ExpenceManagement',
        icon: IconPackages
    }
].filter(Boolean);

const ExpenceTrack =
    expenceManagementChildren.length > 0
        ? {
            id: 'ExpenceManagement',
            type: 'group',
            children: expenceManagementChildren
        }
        : null;

export default ExpenceTrack;
