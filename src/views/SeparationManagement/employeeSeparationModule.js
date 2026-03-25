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

    const [orgId] = useState(localStorage.getItem('orgId'));
    const loginUserRole = localStorage.getItem('designation');

    useEffect(() => {
        getCompanyDetails();
    }, []);

    const funcRef = useRef();

    useEffect(() => {
        if (funcRef.current === handleSeparationCreated) {
            console.log("✅ Same function");
        } else {
            console.log("❌ New function created");
        }
        funcRef.current = handleSeparationCreated;
    });

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

    // const handleSeparationCreated = () => {
    //     setRefreshStats(prev => prev + 1);
    // };

    const handleSeparationCreated = useCallback(() => {
        setRefreshStats(prev => prev + 1);
    }, []);

    const tabs = [
        ...(seperationDetails.includes(loginUserRole)
            ? [
                {
                    label: 'Initiate Separation',
                    icon: <InitiateSeparationIcon sx={{ color: '#ef4444' }} />,
                    component: InitiateSeparationForm
                }
            ]
            : []),

        {
            label: 'All Cases',
            icon: <AllCasesIcon sx={{ color: '#3b82f6' }} />,
            component: AllCasesSeparation
        },
        {
            label: 'Clearance',
            icon: <ClearanceIcon sx={{ color: '#f59e0b' }} />,
            component: ClearanceManagement
        },
        ...(seperationDetails.includes(loginUserRole)
            ? [
                {
                    label: 'Exit Questions',
                    icon: <QuestionAnswerIcon sx={{ color: '#8b5cf6' }} />,
                    component: ExitQuestions
                }
            ]
            : []),
        ...(seperationDetails.includes(loginUserRole)
            ? [
                {
                    label: 'Exit Interview',
                    icon: <ExitInterviewIcon sx={{ color: '#8b5cf6' }} />,
                    component: ExitInterviewManagement
                }
            ]
            : []),

        ...(seperationDetails.includes(loginUserRole)
            ? [
                {
                    label: 'Experience Letter',
                    icon: <ExperienceLetterIcon sx={{ color: '#14b8a6' }} />,
                    component: ExperienceLetter
                }
            ]
            : []),

        ...(seperationDetails.includes(loginUserRole)
            ? [
                {
                    label: 'Relieving Letter',
                    icon: <RelievingLetterIcon sx={{ color: '#6366f1' }} />,
                    component: RelievingLetter
                }
            ]
            : []),
    ];

    return (
        <Container
            maxWidth={false} // allows full-width layout
            disableGutters // removes default left/right padding
            sx={{
                py: 2, // small vertical padding
                px: 1, // minimal horizontal padding
            }}
        >
            {/* Stats Cards */}
            <StatsCards refreshTrigger={refreshStats} />

            {/* Main Tabs Section */}
            <Paper
                sx={{
                    width: '100%',
                    mt: 2,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                }}
            >
                <AppBar
                    position="static"
                    color="default"
                    elevation={0}
                    sx={{
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                    }}
                >
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="on" // always show arrows (prevents flicker)
                        allowScrollButtonsMobile // improves mobile UX
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: '#2563eb',
                                height: 3,
                                borderRadius: '2px 2px 0 0',
                            },
                        }}
                        sx={{
                            px: 1,
                            '& .MuiTabs-scrollButtons': {
                                color: '#64748b',
                                '&.Mui-disabled': { opacity: 0.3 },
                            },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 60,
                                borderRadius: 2,
                                mx: 0.5,
                                px: 1.5,
                                transition: 'background-color 0.3s ease, transform 0.2s ease',
                                // Prevent hover from changing layout
                                transform: 'translateY(0)',
                            },
                            '& .MuiTab-root:hover': {
                                backgroundColor: '#f1f5f9',
                            },
                            '& .Mui-selected': {
                                backgroundColor: '#e0f2fe',
                                color: '#0c4a6e !important',
                                boxShadow: 'inset 0 -2px 0 0 #0ea5e9',
                            },
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

                {/* Tab Content */}
                {tabs.map((tab, index) => {
                    const TabComponent = tab.component;
                    return (
                        <TabPanel key={index} value={currentTab} index={index}>
                            {TabComponent ? (
                                <TabComponent onSeparationCreated={handleSeparationCreated} />
                            ) : null}
                        </TabPanel>
                    );
                })}
            </Paper>
        </Container>
    );
};

export default EmployeeSeparationModule;