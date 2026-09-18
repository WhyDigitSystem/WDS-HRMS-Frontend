// assets
import {
  IconCash,
  IconFileInvoice,
  IconReport,
  IconReportMoney
} from '@tabler/icons-react';

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

const financeChildren = [
  hasScreenAccess('PS') && {
    id: 'payslip',
    title: 'Payslip',
    type: 'item',
    url: '/finance/payslip',
    icon: IconFileInvoice
  },
  hasScreenAccess('ESIR') && {
    id: 'esi-report',
    title: 'ESI Report',
    type: 'item',
    url: '/finance/ESIReport',
    icon: IconReportMoney
  },
  hasScreenAccess('PFR') && {
    id: 'pf-report',
    title: 'PF Report',
    type: 'item',
    url: '/finance/PFCalculationReport',
    icon: IconReport
  }
].filter(Boolean);

const finance =
  financeChildren.length > 0
    ? {
        id: 'finance',
        type: 'group',
        children: [
          {
            id: 'financeCollapse',
            title: 'Finance',
            type: 'collapse',
            icon: IconCash,
            children: financeChildren
          }
        ]
      }
    : null;

export default finance;
