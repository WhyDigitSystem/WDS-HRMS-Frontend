// assets
import {
  IconUserSearch,
  IconCalendarCheck,
  IconBeach,
  IconSun,
  IconReceipt2,
  IconFileDollar,
  IconCalculator,
  IconChartBar,
  IconIdBadge2
} from '@tabler/icons-react';

// Utility to check screen access
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// Define children with permission checks
const employeeMasterChildren = [
  hasScreenAccess('ED') && {
    id: 'employeeDetails',
    title: 'Employee Details',
    type: 'item',
    url: '/employeeMaster/employeeDetails',
    icon: IconUserSearch
  },
  hasScreenAccess('LT') && {
    id: 'leaveType',
    title: 'Leave Type',
    type: 'item',
    url: '/leaveMaster/LeaveType',
    icon: IconBeach
  },
  hasScreenAccess('SP') && {
    id: 'salaryProcess',
    title: 'Salary Process',
    type: 'item',
    url: '/salaryMaster/SalaryProcess',
    icon: IconCalculator
  },
  hasScreenAccess('SAPP') && {
    id: 'salaryApproval',
    title: 'Salary Approval',
    type: 'item',
    url: '/salaryMaster/SalaryApproval',
    icon: IconCalculator
  },
  hasScreenAccess('OT') && {
    id: 'overTime',
    title: 'OverTime Approval',
    type: 'item',
    url: '/basicMaster/OverTime',
    icon: IconIdBadge2
  },
  // hasScreenAccess('AD') && {
  //   id: 'advance',
  //   title: 'Advance',
  //   type: 'item',
  //   url: '/salaryMaster/Advance',
  //   icon: IconSun
  // },
  // hasScreenAccess('SH') && {
  //   id: 'salaryHeads',
  //   title: 'Salary Heads',
  //   type: 'item',
  //   url: '/salaryMaster/salaryHeads',
  //   icon: IconReceipt2
  // },
  // hasScreenAccess('SS') && {
  //   id: 'salaryStructure',
  //   title: 'Salary Structure',
  //   type: 'item',
  //   url: '/salaryMaster/SalaryStructure',
  //   icon: IconFileDollar
  // },
  // hasScreenAccess('GSS') && {
  //   id: 'groupSalaryStructure',
  //   title: 'Group Salary Structure',
  //   type: 'item',
  //   url: '/salaryMaster/groupSalaryStructure',
  //   icon: IconFileDollar
  // },
  // hasScreenAccess('SP') && {
  //   id: 'salaryProcess',
  //   title: 'Salary Process',
  //   type: 'item',
  //   url: '/salaryMaster/SalaryProcess',
  //   icon: IconCalculator
  // },
  // hasScreenAccess('SR') && {
  //   id: 'SalaryReport',
  //   title: 'Salary Report',
  //   type: 'item',
  //   url: '/salaryMaster/SalaryReport',
  //   icon: IconChartBar
  // }
].filter(Boolean); // Remove false values if access denied

// Final export only if user has any access
const employeeMaster =
  employeeMasterChildren.length > 0
    ? {
      id: 'employeeMaster',
      type: 'group',
      children: [
        {
          id: 'employeeMasterCollapse',
          title: 'Payroll',
          type: 'collapse',
          icon: IconUserSearch,
          children: employeeMasterChildren
        }
      ]
    }
    : null;

export default employeeMaster;
