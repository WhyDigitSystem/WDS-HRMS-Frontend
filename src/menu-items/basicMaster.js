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
  IconBeach,
  IconMessageQuestion,
  IconBriefcase,
  IconClock,
  IconCalendar,
  IconFileText,
  IconClockHour4,
  IconUserStar,
  IconChartBar,
  IconCalendarEvent,
  IconScale,
  IconAward,
  IconTarget,
  IconTrophy
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
  hasScreenAccess('PT') && {
    id: 'project',
    title: 'Project',
    type: 'item',
    url: '/basicMaster/ProjectMaster',
    icon: IconBriefcase
  },
  hasScreenAccess('SM') && {
    id: 'shiftMaster',
    title: 'Shift',
    type: 'item',
    url: '/basicMaster/ShiftMaster',
    icon: IconClock
  },
  hasScreenAccess('SA') && {
    id: 'shiftAssign',
    title: 'Shift Assign',
    type: 'item',
    url: '/basicMaster/ShiftAssign',
    icon: IconCalendar
  },
  hasScreenAccess('CM') && {
    id: 'contractMaster',
    title: 'Contract',
    type: 'item',
    url: '/basicMaster/ContractMaster',
    icon: IconFileText
  },
  hasScreenAccess('OTM') && {
    id: 'overTimeMaster',
    title: 'OT',
    type: 'item',
    url: '/basicMaster/OT',
    icon: IconClockHour4
  },
  hasScreenAccess('LT') && {
    id: 'leaveType',
    title: 'Leave Types',
    type: 'item',
    url: '/leaveMaster/LeaveTypes',
    icon: IconBeach
  },
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
  hasScreenAccess('EXI') && {
    id: 'exitInterview',
    title: 'Exit Interview',
    type: 'item',
    url: '/basicMaster/exitInterview',
    icon: IconMessageQuestion
  },
  hasScreenAccess('DEPHEAD') && {
    id: 'departmentHead',
    title: 'Department Head',
    type: 'item',
    url: '/basicMaster/departmentHead',
    icon: IconUserStar
  },
  hasScreenAccess('KPI') && {
    id: 'KRAKPI',
    title: 'KRAKPI',
    type: 'item',
    url: '/basicMaster/KRAKPI',
    icon: IconChartBar
  },
  hasScreenAccess('APP') && {
    id: 'appraisalPeriod',
    title: 'Appraisal Period',
    type: 'item',
    url: '/basicMaster/AppraisalPeroid',
    icon: IconCalendarEvent
  },
  hasScreenAccess('WEI') && {
    id: 'weightage',
    title: 'Weightage',
    type: 'item',
    url: '/basicMaster/Weightage',
    icon: IconScale
  },
  hasScreenAccess('GRADE') && {
    id: 'grade',
    title: 'Grade',
    type: 'item',
    url: '/basicMaster/Grade',
    icon: IconAward
  },
  hasScreenAccess('GOALS') && {
    id: 'goals',
    title: 'Goals',
    type: 'item',
    url: '/basicMaster/Goals',
    icon: IconTarget
  },
  hasScreenAccess('SCORE') && {
    id: 'score',
    title: 'Score',
    type: 'item',
    url: '/basicMaster/Score',
    icon: IconTrophy
  }
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