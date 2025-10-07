// assets
import { IconCash, IconReceipt2, IconFileDollar, IconCalculator, IconCoins, IconSun, IconUserSearch } from '@tabler/icons-react';

const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

const salaryMasterChildren = [
  hasScreenAccess('SH') && {
    id: 'salaryHeads',
    title: 'Heads',
    type: 'item',
    url: '/salaryMaster/salaryHeads',
    icon: IconReceipt2
  },
  hasScreenAccess('SS') && {
    id: 'salaryStructure',
    title: 'Structure',
    type: 'item',
    url: '/salaryMaster/SalaryStructure',
    icon: IconFileDollar
  },
  hasScreenAccess('GSS') && {
    id: 'groupSalaryStructure',
    title: 'Group Salary Structure',
    type: 'item',
    url: '/salaryMaster/groupSalaryStructure',
    icon: IconFileDollar
  },
  // hasScreenAccess('SP') && {
  //   id: 'salaryProcess',
  //   title: 'Salary Process',
  //   type: 'item',
  //   url: '/salaryMaster/SalaryProcess',
  //   icon: IconCalculator
  // },
  // hasScreenAccess('SAPP') && {
  //   id: 'salaryApproval',
  //   title: 'Salary Approval',
  //   type: 'item',
  //   url: '/salaryMaster/SalaryApproval',
  //   icon: IconCalculator
  // },
  hasScreenAccess('OP') && {
    id: 'otherPayments',
    title: 'Other Payment',
    type: 'item',
    url: '/salaryMaster/OtherPayments',
    icon: IconCoins
  },
  hasScreenAccess('AD') && {
    id: 'advance',
    title: 'Advance',
    type: 'item',
    url: '/salaryMaster/Advance',
    icon: IconSun
  },
  // hasScreenAccess('SR') && {
  //   id: 'SalaryReport',
  //   title: 'Salary Report',
  //   type: 'item',
  //   url: '/salaryMaster/SalaryReport',
  //   icon: IconChartBar
  // }
].filter(Boolean);

const salaryMaster =
  salaryMasterChildren.length > 0
    ? {
        id: 'employeeMaster',
        type: 'group',
        children: [
          {
            id: 'employeeMasterCollapse',
            title: 'Salary',
            type: 'collapse',
            icon: IconCash,
            children: salaryMasterChildren
          }
        ]
      }
    : null;

export default salaryMaster;
