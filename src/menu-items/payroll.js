// assets
import { 
    IconKey,
    IconId,
    IconUserSearch,
    IconFingerprint,
    IconCalendarCheck
  } from '@tabler/icons-react';
  
  // constant
  const icons = {
    IconKey,
    IconId,
    IconUserSearch,
    IconFingerprint,
    IconCalendarCheck
  };
  
  const userType = localStorage.getItem('userType');
  const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];
  
  const screenMapping = {
    'EMPLOYEE CODE GENERATION': 'employeeCodeGeneration',
    'EMPLOYEE DETAILS': 'employeeDetails',
    'ATTENDENCE PROCESS': 'attendenceProcess'
  };
  
  const allScreens = [
    // { 
    //   id: 'employeeCodeGeneration', 
    //   title: 'Employee Code Generation', 
    //   type: 'item', 
    //   url: '/employeeMaster/employeeCodeGeneration',
    //   icon: icons.IconId  // ID icon for code generation
    // },
    { 
      id: 'employeeDetails', 
      title: 'Employee Details', 
      type: 'item', 
      url: '/employeeMaster/employeeDetails',
      icon: icons.IconUserSearch  // User search icon for details
    },
    { 
      id: 'attendenceProcess', 
      title: 'Attendance Process', 
      type: 'item', 
      url: '/employeeMaster/AttendenceProcess',
      icon: icons.IconCalendarCheck  // Calendar check icon for attendance
    }
  ];
  
  const allowedScreenIds =
    userType === 'ADMIN'
      ? allScreens.map((screen) => screen.id) 
      : allowedScreens.map((screen) => screenMapping[screen]).filter(Boolean);
  
  const payroll = {
    id: 'payroll',
    type: 'group',
    children: [
      {
        id: 'payroll',
        title: 'Payroll',
        type: 'collapse',
        icon: icons.IconUserSearch,  // Fingerprint icon for Employee Master
        children: allScreens.filter((item) => allowedScreenIds.includes(item.id))
      }
    ]
  };
  
  export default payroll;