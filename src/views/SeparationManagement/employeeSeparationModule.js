import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Container,
    Tabs,
    Tab,
    AppBar,
    Paper
} from '@mui/material';
import {
    ListAlt as AllCasesIcon,
    Checklist as ClearanceIcon,
    Payment as FinalSettlementIcon,
    PeopleAlt as ExitInterviewIcon,
    BarChart as AnalyticsIcon,
    PersonAddDisabled as InitiateSeparationIcon,
    Description as ExperienceLetterIcon,
    AssignmentTurnedIn as RelievingLetterIcon
} from '@mui/icons-material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// Import tab components
import StatsCards from './StatsCards';
import InitiateSeparationForm from './SeparationTabs/InitiateSeparationForm';
import AllCasesSeparation from './SeparationTabs/AllCasesSeparation';
import ClearanceManagement from './SeparationTabs/Clearance';
import ExitInterviewManagement from './SeparationTabs/ExitInterview';
import ExperienceLetter from './SeparationTabs/ExperienceLetter';
import RelievingLetter from './SeparationTabs/RelievingLetter';
import apiCalls from 'apicall';
import ExitQuestions from './SeparationTabs/ExitQuestions';
import UserInterview from './SeparationTabs/UserInterview';
import HrClearance from './SeparationTabs/HrClearance';

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
        <Box sx={{ display: value === index ? 'block' : 'none' }}>
            {children}
        </Box>
    </div>
);

const EmployeeSeparationModule = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [refreshStats, setRefreshStats] = useState(0);
    const [seperationDetails, setSeperationDetails] = useState([]);
    const [hasClearanceAccess, setHasClearanceAccess] = useState(false);

    const [orgId] = useState(localStorage.getItem('orgId'));
    const loginUserRole = localStorage.getItem('designation');
    const department = localStorage.getItem('department');
    const branchCode = localStorage.getItem('branchCode');
    const employeeCode = localStorage.getItem('employeeCode');

    useEffect(() => {
        getCompanyDetails();
    }, []);

    const funcRef = useRef();

    useEffect(() => {
        if (funcRef.current === handleSeparationCreated) {
            console.log('✅ Same function');
        } else {
            console.log('❌ New function created');
        }
        funcRef.current = handleSeparationCreated;
    });

    useEffect(() => {
        getAllExitQuestions();
    }, []);

    const getAllExitQuestions = async () => {
        try {
            const result = await apiCalls(
                'get',
                `/employeseparation/getDepartmentHeadByOrgId?orgId=${orgId}&branchCode=${branchCode}`
            );

            if (result) {
                const deptHeads = result.paramObjectsMap.departmentHeadVO || [];

                const apiEmployeeCodes = deptHeads.flatMap(
                    (dh) => dh.reportingHeadVO?.map((rh) => rh.employeeCode) || []
                );

                const isAllowed = apiEmployeeCodes.includes(employeeCode);

                setHasClearanceAccess(isAllowed);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getCompanyDetails = async () => {
        try {
            const response = await apiCalls('get', `commonmaster/company/${orgId}`);

            if (response.status === true) {
                const company = response.paramObjectsMap.companyVO[0];

                setSeperationDetails(
                    company.separation
                        ? company.separation.split(',').map((d) => d.trim())
                        : []
                );
            }
        } catch (error) {
            console.error('Error fetching company:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleSeparationCreated = useCallback(() => {
        setRefreshStats((prev) => prev + 1);
    }, []);

    const tabs = [
    ...(seperationDetails.includes(loginUserRole)
        ? [
              {
                  label: 'Initiate Separation',
                  icon: <InitiateSeparationIcon sx={{ color: '#ffffff' }} />,
                  component: InitiateSeparationForm
              }
          ]
        : []),

    {
        label: 'All Cases',
        icon: <AllCasesIcon sx={{ color: '#ffffff' }} />,
        component: AllCasesSeparation
    },

    ...(hasClearanceAccess
        ? [
              {
                  label: 'Clearance',
                  icon: <ClearanceIcon sx={{ color: '#ffffff' }} />,
                  component: ClearanceManagement
              }
          ]
        : []),

    ...(seperationDetails.includes(loginUserRole)
        ? [
              {
                  label: 'Clearance Details',
                  icon: <ClearanceIcon sx={{ color: '#ffffff' }} />,
                  component: HrClearance
              }
          ]
        : []),

    ...(seperationDetails.includes(loginUserRole)
        ? [
              {
                  label: 'Exit Questions',
                  icon: <QuestionAnswerIcon sx={{ color: '#ffffff' }} />,
                  component: ExitQuestions
              }
          ]
        : []),

    ...(!seperationDetails.includes(loginUserRole)
        ? [
              {
                  label: 'Exit Interview',
                  icon: <ExitInterviewIcon sx={{ color: '#ffffff' }} />,
                  component: UserInterview
              }
          ]
        : []),

    ...(seperationDetails.includes(loginUserRole)
        ? [
              {
                  label: 'Interview Feedback',
                  icon: <ExitInterviewIcon sx={{ color: '#ffffff' }} />,
                  component: ExitInterviewManagement
              }
          ]
        : []),

    ...(seperationDetails.includes(loginUserRole)
        ? [
              {
                  label: 'Experience Letter',
                  icon: <ExperienceLetterIcon sx={{ color: '#ffffff' }} />,
                  component: ExperienceLetter
              }
          ]
        : []),

    ...(seperationDetails.includes(loginUserRole)
        ? [
              {
                  label: 'Relieving Letter',
                  icon: <RelievingLetterIcon sx={{ color: '#ffffff' }} />,
                  component: RelievingLetter
              }
          ]
        : [])
];

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                py: 2,
                px: 1,
                background: '#f8fafc',
                minHeight: '100vh'
            }}
        >
            {!seperationDetails.includes(loginUserRole) ? null : (
                <StatsCards refreshTrigger={refreshStats} />
            )}

            <Paper
                sx={{
                    width: '100%',
                    mt: 2,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '1px solid rgba(226,232,240,0.8)',
                    background: '#ffffff',
                    boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
                }}
            >
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        background:
                            'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                        borderBottom: 'none'
                    }}
                >
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="on"
                        allowScrollButtonsMobile
                        TabIndicatorProps={{
                            style: {
                                background: '#ffffff',
                                height: 4,
                                borderRadius: '8px 8px 0 0'
                            }
                        }}
                        sx={{
                            px: 1,
                            py: 0.5,

                            '& .MuiTabs-scrollButtons': {
                                color: '#ffffff',
                                '&.Mui-disabled': {
                                    opacity: 0.3
                                }
                            },

                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 62,
                                borderRadius: '14px',
                                mx: 0.5,
                                px: 2,
                                color: 'rgba(255,255,255,0.75)',
                                transition: 'all 0.25s ease',
                                transform: 'translateY(0)',
                                fontSize: '13px'
                            },

                            '& .MuiTab-root:hover': {
                                background: 'rgba(255,255,255,0.10)',
                                color: '#ffffff'
                            },

                            '& .Mui-selected': {
                                background: 'rgba(255,255,255,0.16)',
                                color: '#ffffff !important',
                                backdropFilter: 'blur(10px)',
                                boxShadow:
                                    'inset 0 0 0 1px rgba(255,255,255,0.08)'
                            }
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                icon={tab.icon}
                                iconPosition="start"
                                label={tab.label}
                            />
                        ))}
                    </Tabs>
                </AppBar>

                <Box
                    sx={{
                        background: '#f8fafc',
                        minHeight: '500px',
                        p: {
                            xs: 1,
                            sm: 1.5,
                            md: 2
                        }
                    }}
                >
                    {tabs.map((tab, index) => {
                        const TabComponent = tab.component;

                        return (
                            <TabPanel
                                key={index}
                                value={currentTab}
                                index={index}
                            >
                                {currentTab === index && TabComponent ? (
                                    <TabComponent
                                        onSeparationCreated={
                                            handleSeparationCreated
                                        }
                                    />
                                ) : null}
                            </TabPanel>
                        );
                    })}
                </Box>
            </Paper>
        </Container>
    );
};

export default EmployeeSeparationModule;