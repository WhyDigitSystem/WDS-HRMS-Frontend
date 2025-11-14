import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import { element } from 'prop-types';
import PrivateRoute from './PrivateRoute';
import PayrollApproval from 'views/salaryMaster/PayrollApproval';
import ListOfValues from 'views/basicMaster/ListOfValues';
// import Roles from 'views/basicMaster/roles';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
// const DashboardPG = Loadable(lazy(() => import('views/dashboard/Default/DashboardPG')));
const Calendar = Loadable(lazy(() => import('views/Calendar/Calendar')));

// company Setup
const CreateCompany = Loadable(lazy(() => import('views/companySetup/CreateCompany')));
const CompanySetup = Loadable(lazy(() => import('views/companySetup/CompanySetup')));

// basic Master
const FinYear = Loadable(lazy(() => import('views/basicMaster/finYear')));
const Country = Loadable(lazy(() => import('views/basicMaster/country')));
const State = Loadable(lazy(() => import('views/basicMaster/state')));
const City = Loadable(lazy(() => import('views/basicMaster/city')));
const Currency = Loadable(lazy(() => import('views/basicMaster/currency')));
const Department = Loadable(lazy(() => import('views/basicMaster/department')));
const Designation = Loadable(lazy(() => import('views/basicMaster/designation')));
const Region = Loadable(lazy(() => import('views/basicMaster/RegionMaster')));
const Roles = Loadable(lazy(() => import('views/basicMaster/roles')));
const Screens = Loadable(lazy(() => import('views/basicMaster/Screens')));
const ScreenAccess = Loadable(lazy(() => import('views/basicMaster/screenAccess')));
const LeaveAssigned = Loadable(lazy(() => import('views/basicMaster/leaveAssigned')));
const ProjectMaster = Loadable(lazy(() => import('views/basicMaster/ProjectMaster')));
const ShiftMaster = Loadable(lazy(() => import('views/basicMaster/shiftMaster')));
const ShiftAssign = Loadable(lazy(() => import('views/basicMaster/ShiftAssign')));
const OT = Loadable(lazy(() => import('views/basicMaster/OT')));
const ContractMaster = Loadable(lazy(() => import('views/basicMaster/ContractMaster')));
const OverTime = Loadable(lazy(() => import('views/basicMaster/OverTimeScreen.js')));
const OTApproval = Loadable(lazy(() => import('views/basicMaster/OTApproval')));
const GroupMaster = Loadable(lazy(() => import('views/basicMaster/groupMaster')));
// const AppraisalPeroid = Loadable(lazy(() => import('views/basicMaster/AppraisalPeroid')));
// const KRAKPI = Loadable(lazy(() => import('views/basicMaster/KRAKPI')));
// const Weightage = Loadable(lazy(() => import('views/basicMaster/Weightage')));
// const Grade = Loadable(lazy(() => import('views/basicMaster/Grade')));
// const Goals = Loadable(lazy(() => import('views/basicMaster/Goals')));
// const Score = Loadable(lazy(() => import('views/basicMaster/Score')));

// Employee Master
const EmployeeProfile = Loadable(lazy(() => import('views/employeeMaster/EmployeeProfile')));
const EmployeeCodeGeneration = Loadable(lazy(() => import('views/employeeMaster/EmployeeCodeGeneration')));

// Leave master
const LeaveTypes = Loadable(lazy(() => import('views/leaveMaster/LeaveTypes')));
const LeaveProcess = Loadable(lazy(() => import('views/leaveMaster/LeaveProcess')));
const LeaveCreditControl = Loadable(lazy(() => import('views/leaveMaster/LeaveCreditControl')));
const Holidays = Loadable(lazy(() => import('views/leaveMaster/Holidays')));
const Comp_Off = Loadable(lazy(() => import('views/me/Comp_Off')));

// salary master
const SalaryHeads = Loadable(lazy(() => import('views/salaryMaster/SalaryHeads')));
const SalaryStructure = Loadable(lazy(() => import('views/salaryMaster/SalaryStructure')));
const GroupSalaryStructure = Loadable(lazy(() => import('views/salaryMaster/GroupSalaryStructure')));
const PayrollProcess = Loadable(lazy(() => import('views/salaryMaster/PayrollProcess')));
const SalaryReport = Loadable(lazy(() => import('views/salaryMaster/SalaryReport')));
// const Advance = Loadable(lazy(() => import('views/salaryMaster/Advance')));
const AdvanceUpload = Loadable(lazy(() => import('views/salaryMaster/AdvanceUpload')));
const OtherPayments = Loadable(lazy(() => import('views/salaryMaster/OtherPayments')));

// me
const PermissionRequest = Loadable(lazy(() => import('views/me/PermissionRequest')));
const LeaveRequest = Loadable(lazy(() => import('views/me/LeaveRequest')));
const CheckInOut= Loadable(lazy(() => import('views/me/CheckInOut')));
const Holiday = Loadable(lazy(() => import('views/me/Holiday')));
const TimeSheet = Loadable(lazy(() => import('views/me/TimeSheet')));
const WFH = Loadable(lazy(() => import('views/me/WFH')));
const TravelRequest = Loadable(lazy(() => import('views/me/TravelRequest')));
const Task = Loadable(lazy(() => import('views/me/Task')));

// finance
const Payslip = Loadable(lazy(() => import('views/finance/Payslip')));
const ESIReport = Loadable(lazy(() => import('views/finance/ESIReport')));
const ESI = Loadable(lazy(() => import('views/finance/ESI')));
const PFCalculationReport = Loadable(lazy(() => import('views/finance/PFCalculationReport')));
const PFCalculation = Loadable(lazy(() => import('views/finance/PFCalculation')));

const AttendenceProcess = Loadable(lazy(() => import('views/attendanceProcess/AttendenceProcess')));
const MonthlyAttendance = Loadable(lazy(() => import('views/attendanceProcess/MonthlyAttendance')));
const AttendanceApproval = Loadable(lazy(() => import('views/attendanceProcess/AttendenceApproval')));


//team
const LeaveApproval = Loadable(lazy(() => import('views/team/LeaveApproval')));
const PermissionApproval = Loadable(lazy(() => import('views/team/PermissionApproval')));
const AttendanceReport = Loadable(lazy(() => import('views/team/AttendanceReport')));
const DailyAttendance = Loadable(lazy(() => import('views/team/DailyAttendance')));
const EmployeeAttanceReport = Loadable(lazy(() => import('views/team/EmployeeAttanceReport')));
const ShiftAssignReport = Loadable(lazy(() => import('views/team/ShiftAssignReport')));
const PayslipGenerate = Loadable(lazy(() => import('views/team/PayslipGeneration')));
const OverAllReport = Loadable(lazy(() => import('views/team/OverAllReport')));

// manageTax
const ManageTax = Loadable(lazy(() => import('views/ManageTax/manageTax')));
const DeclarationDate = Loadable(lazy(() => import('views/ManageTax/DeclarationDate')));
const DeclarationInput = Loadable(lazy(() => import('views/ManageTax/DeclarationInput')));

// PreGoals
const Appraisee = Loadable(lazy(() => import('views/Appraisal/Appraisee')));
const Appraiser = Loadable(lazy(() => import('views/Appraisal/Appraiser')));
const AdditionalGoals = Loadable(lazy(() => import('views/Appraisal/AdditionalGoals')));
const SetGoals = Loadable(lazy(() => import('views/Appraisal/SetGoals')));
const SetGoalsApproval = Loadable(lazy(() => import('views/Appraisal/SetGoalsApproval')));
const MyGoals = Loadable(lazy(() => import('views/Appraisal/MyGoals')));
const First_LevelSupervisorInput = Loadable(lazy(() => import('views/Appraisal/First_LevelSupervisorInput')));
const HRFeedback = Loadable(lazy(() => import('views/Appraisal/HRFeedback')));
const PerformanceGoals = Loadable(lazy(() => import('views/Appraisal/PerformanceGoals')));
const AppraiserReview = Loadable(lazy(() => import('views/Appraisal/AppraisalReview')));
const AppraisalReport = Loadable(lazy(() => import('views/Appraisal/AppraisalReport')));
const AppraisalDashboard = Loadable(lazy(() => import('views/Appraisal/AppraisalDashboard')));
const IncrementManagement = Loadable(lazy(() => import('views/Appraisal/IncrementManagement')));


//Asset Management
const AssetManagementSystem = Loadable(lazy(() => import('views/assetManagement/AssetManagement')));

//Expence Management
// const ExpenceTracking = Loadable(lazy(() => import('views/ExpenceManagement/ExpenceTracking')));
const ExpenceManagement = Loadable(lazy(() => import('views/ExpenceManagement/ExpenceManagement')));

//Recruitment Management
const RecruitmentManagement = Loadable(lazy(() => import('views/recruitmentManagement/RecruitmentManagement')));

//Separation Management
const EmployeeSeparationModule = Loadable(lazy(() => import('views/SeparationManagement/employeeSeparationModule')));
// ==============================|| AUTHENTICATION ROUTING ||============================== //

const HrmsRoute = {
  path: '/',
  element: (
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    // {
    //   path: '/dashboardPG',
    //   element: <DashboardPG />
    // },
    {
      path: '/calendar',
      element: <Calendar />
    },
    {
      path: '/companysetup/createcompany',
      element: <CreateCompany />
    },
    {
      path: '/companysetup/companysetup',
      element: <CompanySetup />
    },
    {
      path: '/companysetup/finYear',
      element: <FinYear />
    },
    {
      path: '/basicMaster/country',
      element: <Country />
    },
    {
      path: '/basicMaster/state',
      element: <State />
    },
    {
      path: '/basicMaster/city',
      element: <City />
    },
    {
      path: '/basicMaster/currency',
      element: <Currency />
    },
    {
      path: '/basicMaster/RegionMaster',
      element: <Region />
    },
    {
      path: '/basicMaster/Department',
      element: <Department />
    },
    {
      path: '/basicMaster/Designation',
      element: <Designation />
    },
    {
      path: '/basicMaster/ProjectMaster',
      element: <ProjectMaster />
    },
    {
      path: '/basicMaster/ShiftMaster',
      element: <ShiftMaster />
    },
    {
      path: '/basicMaster/ShiftAssign',
      element: <ShiftAssign />
    },
    {
      path: '/basicMaster/ContractMaster',
      element: <ContractMaster />
    },
    {
      path: '/basicMaster/OT',
      element: <OT />
    },
    {
      path: '/basicMaster/OverTime',
      element: <OverTime />
    },
    {
      path: '/basicMaster/OTApproval',
      element: <OTApproval />
    },
    {
      path: '/basicMaster/groupMaster',
      element: <GroupMaster />
    },
    {
      path: '/basicMaster/roles',
      element: <Roles />
    },
    {
      path: '/basicMaster/ListOfValues',
      element: <ListOfValues />
    },
    // {
    //   path: '/basicMaster/AppraisalPeroid',
    //   element: <AppraisalPeroid />
    // },
    // {
    //   path: '/basicMaster/KRAKPI',
    //   element: <KRAKPI />
    // },
    // {
    //   path: '/basicMaster/Weightage',
    //   element: <Weightage />
    // },
    // {
    //   path: '/basicMaster/Grade',
    //   element: <Grade />
    // },
    // {
    //   path: '/basicMaster/Goals',
    //   element: <Goals />
    // },
    // {
    //   path: '/basicMaster/Score',
    //   element: <Score />
    // },
    {
      path: '/companysetup/Screens',
      element: <Screens />
    },
    {
      path: '/companysetup/ScreenAccess',
      element: <ScreenAccess />
    },
    {
      path: '/companysetup/LeaveAssigned',
      element: <LeaveAssigned />
    },
    {
      path: '/employeeMaster/EmployeeProfile',
      element: <EmployeeProfile />
    },
    {
      path: '/employeeMaster/EmployeeCodeGeneration',
      element: <EmployeeCodeGeneration />
    },
    {
      path: '/attendanceProcess/AttendenceProcess',
      element: <AttendenceProcess />
    },
    {
      path: '/attendanceProcess/MonthlyAttendance',
      element: <MonthlyAttendance />
    },
    {
      path: '/attendanceProcess/AttendanceApproval',
      element: <AttendanceApproval />
    },
    {
      path: '/leaveMaster/LeaveTypes',
      element: <LeaveTypes />
    },
    {
      path: '/leaveMaster/LeaveProcess',
      element: <LeaveProcess />
    },
    {
      path: '/leaveMaster/LeaveCreditControl',
      element: <LeaveCreditControl />
    },
    {
      path: '/leaveMaster/Holidays',
      element: <Holidays />
    },
    {
      path: '/salaryMaster/OtherPayments',
      element: <OtherPayments />
    },
    {
      path: '/salaryMaster/Advance',
      element: <AdvanceUpload />
    },
    {
      path: '/salaryMaster/SalaryHeads',
      element: <SalaryHeads />
    },
    {
      path: '/salaryMaster/SalaryStructure',
      element: <SalaryStructure />
    },
    {
      path: '/salaryMaster/GroupSalaryStructure',
      element: <GroupSalaryStructure />
    },
    {
      path: '/salaryMaster/PayrollProcess',
      element: <PayrollProcess />
    },
    {
      path: '/salaryMaster/PayrollApproval',
      element: <PayrollApproval />
    },
    {
      path: '/salaryMaster/SalaryReport',
      element: <SalaryReport />
    },
    {
      path: '/me/PermissionRequest',
      element: <PermissionRequest />
    },
    {
      path: '/me/LeaveRequest',
      element: <LeaveRequest />
    },
    {
      path: '/me/Holiday',
      element: <Holiday />
    },
    {
      path: '/me/CheckInOut',
      element: <CheckInOut />
    },
    {
      path: '/me/TimeSheet',
      element: <TimeSheet />
    },
    {
      path: '/me/Comp_Off',
      element: <Comp_Off />
    },
    {
      path: '/me/WFH',
      element: <WFH />
    },
    {
      path: '/me/TravelRequest',
      element: <TravelRequest />
    },
    {
      path: '/me/OverAllReport',
      element: <OverAllReport />
    },
    {
      path: '/me/Task',
      element: <Task />
    },
    {
      path: '/finance/Payslip',
      element: <Payslip />
    },
    {
      path: '/finance/ESI',
      element: <ESI />
    },
    {
      path: '/finance/ESIReport',
      element: <ESIReport />
    },
    {
      path: '/finance/PFCalculation',
      element: <PFCalculation />
    },
    {
      path: '/finance/PFCalculationReport',
      element: <PFCalculationReport />
    },
    // Team path
    {
      path: '/team/LeaveApproval',
      element: <LeaveApproval />
    },
    {
      path: '/team/PermissionApproval',
      element: <PermissionApproval />
    },
    {
      path: '/team/AttendanceReport',
      element: <AttendanceReport />
    },
    {
      path: '/team/DailyAttendance',
      element: <DailyAttendance />
    },
    {
      path: '/team/EmployeeAttanceReport',
      element: <EmployeeAttanceReport />
    },
    {
      path: '/team/ShiftAssignReport',
      element: <ShiftAssignReport />
    },
    {
      path: '/team/payslipGenerate',
      element: <PayslipGenerate />
    },
    // manageTax
    {
      path: '/ManageTax/manageTax',
      element: <ManageTax />
    },
    {
      path: '/ManageTax/DeclarationDate',
      element: <DeclarationDate />
    },
    {
      path: '/ManageTax/DeclarationInput',
      element: <DeclarationInput />
    },
    // PreGoals
    {
      path: '/Appraisal/Appraisee',
      element: <Appraisee />
    },
    {
      path: '/Appraisal/Appraiser',
      element: <Appraiser />
    },
    {
      path: '/Appraisal/AdditionalGoals',
      element: <AdditionalGoals />
    },
    {
      path: '/Appraisal/SetGoals',
      element: <SetGoals />
    },
    {
      path: '/Appraisal/SetGoalsApproval',
      element: <SetGoalsApproval />
    },
    {
      path: '/Appraisal/MyGoals',
      element: <MyGoals />
    },
    {
      path: '/Appraisal/First_LevelSupervisorInput',
      element: < First_LevelSupervisorInput/>
    },
    {
      path: '/Appraisal/HRFeedback',
      element: <HRFeedback />
    },
    // {
    //   path: '/Appraisal/HR_Review',
    //   element: <HR_Review />
    // },
    {
      path: '/Appraisal/performanceGoals',
      element: <PerformanceGoals />
    },
    {
      path: '/Appraisal/appraiserReview',
      element: <AppraiserReview />
    },
    {
      path: '/Appraisal/appraisalReport',
      element: <AppraisalReport />
    },
    {
      path: '/Appraisal/appraisalDashboard',
      element: <AppraisalDashboard />
    },
    {
      path: '/Appraisal/incrementManagement',
      element: <IncrementManagement />
    },
    {
      path: '/AssetManagement/AssetManagement',
      element: <AssetManagementSystem />
    },
    {
      path: '/ExpenceManagement/ExpenceManagement',
      element: <ExpenceManagement />
    },
    {
      path: '/RecruitmentManagement/RecruitmentManagement',
      element: <RecruitmentManagement />
    },
    {
      path: '/SeparationManagement/SeparationManagement',
      element: <EmployeeSeparationModule />
    },
  ]
};

export default HrmsRoute;
