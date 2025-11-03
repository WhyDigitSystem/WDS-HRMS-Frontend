// assets
import {
  IconCash,
  IconReceipt,
  IconFileInvoice,
  IconWallet,
  IconCoin,
  IconTarget,
  IconUser,
  IconUsers,
  IconListCheck,
  IconPlus,
  IconThumbUp,
  IconUserCheck,
  IconUserShield
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// menu items with permission check
const appraisalChildren = [
  hasScreenAccess('SG') && {
    id: 'SelfGoals',
    title: 'Self Goals',
    type: 'item',
    url: '/Appraisal/SelfGoals',
    icon: IconTarget
  },
  hasScreenAccess('APE') && {
    id: 'Appraisee',
    title: 'Appraisee',
    type: 'item',
    url: '/Appraisal/Appraisee',
    icon: IconUser
  },
  hasScreenAccess('APR') && {
    id: 'Appraiser',
    title: 'Appraiser',
    type: 'item',
    url: '/Appraisal/Appraiser',
    icon: IconUsers
  },
  hasScreenAccess('PG') && {
    id: 'PreGoals',
    title: 'Pre Goals',
    type: 'item',
    url: '/Appraisal/PreGoals',
    icon: IconListCheck
  },
  hasScreenAccess('AG') && {
    id: 'AdditionalGoals',
    title: 'Additional Goals',
    type: 'item',
    url: '/Appraisal/AdditionalGoals',
    icon: IconPlus
  },
  hasScreenAccess('PGA') && {
    id: 'PreGoalsApproval',
    title: 'Pre Goals Approval',
    type: 'item',
    url: '/Appraisal/PreGoalsApproval',
    icon: IconThumbUp
  },
  hasScreenAccess('S1I') && {
    id: 'Supervisor1_Input',
    title: 'Supervisor-1 Input',
    type: 'item',
    url: '/Appraisal/Supervisor1_Input',
    icon: IconUserCheck
  },
  hasScreenAccess('HRR') && {
    id: 'HR_Review',
    title: 'HR Review',
    type: 'item',
    url: '/Appraisal/HR_Review',
    icon: IconUserShield
  },
  hasScreenAccess('PGS') && {
    id: 'performanceGoals',
    title: 'Performance Goals',
    type: 'item',
    url: '/Appraisal/performanceGoals',
    icon: IconUserShield
  },
  hasScreenAccess('APRR') && {
    id: 'appraiserReview',
    title: 'Appraiser Review',
    type: 'item',
    url: '/Appraisal/appraiserReview',
    icon: IconUserShield
  },
  hasScreenAccess('ARR') && {
    id: 'appraisalReport',
    title: 'Appraisal Report',
    type: 'item',
    url: '/Appraisal/appraisalReport',
    icon: IconUserShield
  },
  hasScreenAccess('ADB') && {
    id: 'appraisalDashboard',
    title: 'Dashboard',
    type: 'item',
    url: '/Appraisal/appraisalDashboard',
    icon: IconUserShield
  },
  hasScreenAccess('ICM') && {
    id: 'incrementManagement',
    title: 'Increment Management',
    type: 'item',
    url: '/Appraisal/incrementManagement',
    icon: IconUserShield
  }
].filter(Boolean);

// full appraisal menu
const Appraisal =
  appraisalChildren.length > 0
    ? {
        id: 'Appraisal',
        type: 'group',
        children: [
          {
            id: 'Appraisal',
            title: 'Appraisal',
            type: 'collapse',
            icon: IconCash,
            children: appraisalChildren
          }
        ]
      }
    : null;

export default Appraisal;
