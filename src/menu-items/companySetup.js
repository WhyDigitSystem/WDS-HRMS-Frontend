// assets
import {
  IconCopyright,
  IconSquareRoundedPlus,
  IconSettingsPlus,
  IconCalendarDollar
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// Menu items for company setup
const companySetupChildren = [
  // hasScreenAccess('CC') && {
  //   id: 'createCompany',
  //   title: 'Create Company',
  //   type: 'item',
  //   url: '/companysetup/createcompany',
  //   icon: IconSquareRoundedPlus
  // },
  hasScreenAccess('CS') && {
    id: 'company',
    title: 'Company Setup',
    type: 'item',
    url: '/companysetup/companysetup',
    icon: IconSettingsPlus
  },
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
