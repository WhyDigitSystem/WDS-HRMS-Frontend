// getMenuItems.js

import dashboard from './dashboard';
import calendar from './calendar';
import attendanceProcess from './attendanceProcess';
import employeeMaster from './employeeMaster';
import me from './me';
import finance from './finance';
import team from './team';
import basicMaster from './basicMaster';
import companySetup from './companySetup';
import admin from './admin';
import salaryMaster from './salaryMaster';
import Appraisal from './Appraisal';
import AssetManagement from './assetManagement';
// Import other dynamically filtered modules as needed

const filterValid = (items) => items.filter(Boolean);

const getMenuItems = () => {
  return {
    items: filterValid([
      dashboard,
      calendar,
      attendanceProcess,
      employeeMaster,
      me,
      // finance,
      team,
      Appraisal,
      AssetManagement,
      basicMaster,
      salaryMaster,
      companySetup,
      admin
    ])
  };
};

export default getMenuItems();
