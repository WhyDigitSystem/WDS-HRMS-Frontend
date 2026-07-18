// assets
import {
  IconCopyright,
  IconSquareRoundedPlus,
  IconSettingsPlus,
  IconCalendarDollar
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const userType = localStorage.getItem('userType');

  // ADMIN can access all except Create Company condition handled separately
  if (userType === 'ADMIN') {
    return true;
  }

  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];

  return access?.canRead || access?.canWrite || access?.canDelete;
};

const userType = localStorage.getItem('userType');

// Menu items for company setup
const companySetupChildren = [
  // Only SADMIN can see Create Company
  userType === 'SADMIN' && {
    id: 'createCompany',
    title: 'Create Company',
    type: 'item',
    url: '/companysetup/createcompany',
    icon: IconSquareRoundedPlus
  },

  // ADMIN and other users with access can see Company Setup
  userType !== 'SADMIN' &&
  hasScreenAccess('CS') && {
    id: 'company',
    title: 'Company Setup',
    type: 'item',
    url: '/companysetup/companysetup',
    icon: IconSettingsPlus
  },

  // If needed later
  // userType !== 'SADMIN' &&
  // hasScreenAccess('FINYEAR') && {
  //   id: 'finYear',
  //   title: 'FinYear',
  //   type: 'item',
  //   url: '/companysetup/finYear',
  //   icon: IconCalendarDollar
  // }
].filter(Boolean);

// Final export with collapse group
const companySetup =
  companySetupChildren.length > 0
    ? {
      id: 'companySetup',
      type: 'group',
      children: [
        {
          id: 'companySetupCollapse',
          title: 'Company Configuration',
          type: 'collapse',
          icon: IconCopyright,
          children: companySetupChildren
        }
      ]
    }
    : null;

export default companySetup;