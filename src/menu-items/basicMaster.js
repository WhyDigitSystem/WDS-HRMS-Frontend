// assets
import {
  IconCashBanknote,
  IconDatabaseStar,
  IconBuildingFactory2,
  IconIdBadge2,
  IconMapQuestion,
  IconUsersGroup,
  IconWorld,
  IconMap,
  IconBuildingSkyscraper,
  IconSun,
  IconListDetails,
  IconBeach
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

const basicMasterChildren = [
  hasScreenAccess('CO') && {
    id: 'country',
    title: 'Country',
    type: 'item',
    url: '/basicMaster/country',
    icon: IconWorld
  },
  hasScreenAccess('ST') && {
    id: 'state',
    title: 'State',
    type: 'item',
    url: '/basicMaster/state',
    icon: IconMap
  },
  hasScreenAccess('CT') && {
    id: 'city',
    title: 'City',
    type: 'item',
    url: '/basicMaster/city',
    icon: IconBuildingSkyscraper
  },
  hasScreenAccess('CU') && {
    id: 'currency',
    title: 'Currency',
    type: 'item',
    url: '/basicMaster/currency',
    icon: IconCashBanknote
  },
  hasScreenAccess('RG') && {
    id: 'region',
    title: 'Region',
    type: 'item',
    url: '/basicMaster/RegionMaster',
    icon: IconMapQuestion
  },
  hasScreenAccess('DP') && {
    id: 'department',
    title: 'Department',
    type: 'item',
    url: '/basicMaster/Department',
    icon: IconBuildingFactory2
  },
  hasScreenAccess('DS') && {
    id: 'designation',
    title: 'Designation',
    type: 'item',
    url: '/basicMaster/Designation',
    icon: IconIdBadge2
  },
  hasScreenAccess('SM') && {
    id: 'shiftMaster',
    title: 'Shift',
    type: 'item',
    url: '/basicMaster/ShiftMaster',
    icon: IconIdBadge2
  },
  hasScreenAccess('SA') && {
    id: 'shiftAssign',
    title: 'Shift Assign',
    type: 'item',
    url: '/basicMaster/ShiftAssign',
    icon: IconIdBadge2
  },
  hasScreenAccess('CM') && {
    id: 'contractMaster',
    title: 'Contract',
    type: 'item',
    url: '/basicMaster/ContractMaster',
    icon: IconIdBadge2
  },
  hasScreenAccess('OTM') && {
    id: 'overTimeMaster',
    title: 'OT',
    type: 'item',
    url: '/basicMaster/OT',
    icon: IconIdBadge2
  },
  hasScreenAccess('LT') && {
    id: 'leaveType',
    title: 'Leave Types',
    type: 'item',
    url: '/leaveMaster/LeaveTypes',
    icon: IconBeach
  },
  // hasScreenAccess('OT') && {
  //   id: 'overTime',
  //   title: 'OverTime Approval',
  //   type: 'item',
  //   url: '/basicMaster/OverTime',
  //   icon: IconIdBadge2
  // },
  // hasScreenAccess('OT') && {
  //   id: 'OverTimeApproval',
  //   title: 'OverTime Approval Report',
  //   type: 'item',
  //   url: '/basicMaster/OverTimeApproval',
  //   icon: IconIdBadge2
  // },
  hasScreenAccess('GR') && {
    id: 'groupMaster',
    title: 'Group Master',
    type: 'item',
    url: '/basicMaster/groupMaster',
    icon: IconUsersGroup
  },
  hasScreenAccess('HD') && {
    id: 'holidays',
    title: 'Holidays',
    type: 'item',
    url: '/leaveMaster/Holidays',
    icon: IconSun
  },
  hasScreenAccess('LOV') && {
    id: 'listOfValues',
    title: 'List Of Values',
    type: 'item',
    url: '/basicMaster/ListOfValues',
    icon: IconListDetails
  },
].filter(Boolean);

const basicMaster =
  basicMasterChildren.length > 0
    ? {
      id: 'basicMaster',
      type: 'group',
      children: [
        {
          id: 'basicMasterCollapse',
          title: 'Basic Master',
          type: 'collapse',
          icon: IconDatabaseStar,
          children: basicMasterChildren
        }
      ]
    }
    : null;

export default basicMaster;
