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
  hasScreenAccess('PG') && {
    id: 'PreGoals',
    title: 'Set Goals',
    type: 'item',
    url: '/Appraisal/SetGoals',
    icon: IconListCheck
  },
  hasScreenAccess('SG') && {
    id: 'SelfGoals',
    title: 'My Goals',
    type: 'item',
    url: '/Appraisal/MyGoals',
    icon: IconTarget
  },
  // hasScreenAccess('APE') && {
  //   id: 'Appraisee',
  //   title: 'Appraisee',
  //   type: 'item',
  //   url: '/Appraisal/Appraisee',
  //   icon: IconUser
  // },
  // hasScreenAccess('APR') && {
  //   id: 'Appraiser',
  //   title: 'Appraiser',
  //   type: 'item',
  //   url: '/Appraisal/Appraiser',
  //   icon: IconUsers
  // },
  // hasScreenAccess('AG') && {
  //   id: 'AdditionalGoals',
  //   title: 'Additional Goals',
  //   type: 'item',
  //   url: '/Appraisal/AdditionalGoals',
  //   icon: IconPlus
  // },
  hasScreenAccess('PGA') && {
    id: 'PreGoalsApproval',
    title: 'Set Goals Approval',
    type: 'item',
    url: '/Appraisal/SetGoalsApproval',
    icon: IconThumbUp
  },
  hasScreenAccess('PGS') && {
    id: 'performanceGoals',
    title: 'Performance Goals',
    type: 'item',
    url: '/Appraisal/performanceGoals',
    icon: IconUserShield
  },
  hasScreenAccess('S1I') && {
    id: 'Supervisor1_Input',
    title: 'First-Level Supervisor Input',
    type: 'item',
    url: '/Appraisal/First_LevelSupervisorInput',
    icon: IconUserCheck
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
  hasScreenAccess('HRR') && {
    id: 'HR_Review',
    title: 'HR Feedback',
    type: 'item',
    url: '/Appraisal/HRFeedback',
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
    title: 'Increment',
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
          title: 'Performance',
          type: 'collapse',
          icon: IconCash,
          children: appraisalChildren
        }
      ]
    }
    : null;

export default Appraisal;
