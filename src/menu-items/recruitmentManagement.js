// assets
import { IconUserCheck } from '@tabler/icons-react';

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
const recruitmentManagementChildren = [
  hasScreenAccess('ASM') && {
    id: 'RecruitmentManagement',
    title: 'Recruitment',
    type: 'item',
    url: '/RecruitmentManagement/RecruitmentManagement',
    icon: IconUserCheck
  }
].filter(Boolean);

const RecruitmentManagement =
  recruitmentManagementChildren.length > 0
    ? {
        id: 'RecruitmentManagement',
        type: 'group',
        children: recruitmentManagementChildren
      }
    : null;

export default RecruitmentManagement;
