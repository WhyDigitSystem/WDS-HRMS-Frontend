import React, { useState } from 'react';
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
    PersonAddDisabled as InitiateSeparationIcon
} from '@mui/icons-material';

// Import tab components
import StatsCards from './StatsCards';
import InitiateSeparationForm from './SeparationTabs/InitiateSeparationForm';
import AllCasesSeparation from './SeparationTabs/AllCasesSeparation';
import ClearanceManagement from './SeparationTabs/Clearance';
import ExitInterviewManagement from './SeparationTabs/ExitInterview';

const TabPanel = ({ children, value, index, ...other }) => (
    <div hidden={value !== index} {...other}>
        {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
);

const EmployeeSeparationModule = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const tabs = [
        {
            label: 'Initiate Separation',
            icon: <InitiateSeparationIcon sx={{ color: '#ef4444' }} />,
            component: InitiateSeparationForm
        },
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
        {
            label: 'Exit Interview',
            icon: <ExitInterviewIcon sx={{ color: '#8b5cf6' }} />,
            component: ExitInterviewManagement
        },
        {
            label: 'Final Settlement',
            icon: <FinalSettlementIcon sx={{ color: '#10b981' }} />,
        },
        {
            label: 'Analytics',
            icon: <AnalyticsIcon sx={{ color: '#0ea5e9' }} />,
        },
    ];

    return (
        <Container
            maxWidth={false} // ✅ allows full-width layout
            disableGutters // ✅ removes default left/right padding
            sx={{
                py: 2, // small vertical padding
                px: 1, // minimal horizontal padding
            }}
        >
            {/* Stats Cards */}
            <StatsCards />

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
                        scrollButtons="on" // ✅ always show arrows (prevents flicker)
                        allowScrollButtonsMobile // ✅ improves mobile UX
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
                                // ✅ Prevent hover from changing layout
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
                            {TabComponent ? <TabComponent /> : null}
                        </TabPanel>
                    );
                })}
            </Paper>
        </Container>
    );
};

export default EmployeeSeparationModule;
