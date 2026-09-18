import React, { useState, useEffect } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    CssBaseline,
    Container
} from '@mui/material';
import {
    ReceiptLong,
    FlightTakeoff,
    CheckCircleOutline,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import ExpenceTracking from './ExpenceTracking';
import TravelRequest from './TravelRequest';
import Approvals from './Approvals';
import DashboardExpenseTravel from './DashboardExpenseTravel';

const ExpenceManagement = ({ config = {} }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [assets, setAssets] = useState([]);
    // 
    const [userRole, setUserRole] = useState('');
    const roles = localStorage.getItem("ROLES");
    useEffect(() => {
        if (roles) {
            const parsedRoles = JSON.parse(roles);
            const userRole = parsedRoles[0].role;

            setUserRole(userRole);
        }
    }, [])

    console.log(userRole);
    // 

    const defaultConfig = {
        systemTitle: "Expense Management System",
        companyName: "Your Company Name",
        footerText: "© 2025 All Rights Reserved",
        primaryColor: "#3a6b6d",
        surfaceColor: "#ffffff",
        textColor: "#1f2937",
        successColor: "#2a4b4d",
        secondaryColor: "#64748b"
    };

    const mergedConfig = { ...defaultConfig, ...config };

    useEffect(() => {
        console.log('App initialized with config:', mergedConfig);
    }, []);

    const tabComponents = [
        <ExpenceTracking key="exp" assets={assets} config={mergedConfig} />,
        <TravelRequest key="travel" assets={assets} config={mergedConfig} />,
        ...(userRole === "ADMIN"
            ? [
                <Approvals key="approval" assets={assets} config={mergedConfig} />,
                <DashboardExpenseTravel key="dash" assets={assets} config={mergedConfig} />,
            ] : [])

    ];

    const tabs = [
        {
            label: "Expense Claims",
            icon: <ReceiptLong />,
            color: "#3a6b6d",
            gradient: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)"
        },
        {
            label: "Travel Requests",
            icon: <FlightTakeoff />,
            color: "#3a6b6d",
            gradient: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)"
        },
        ...(userRole === 'ADMIN'
            ? [
                {
                    label: "Approvals",
                    icon: <CheckCircleOutline />,
                    color: "#3a6b6d",
                    gradient: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)"
                },
                {
                    label: "Dashboard",
                    icon: <DashboardIcon />,
                    color: "#3a6b6d",
                    gradient: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)"
                }
            ]
            : [])
    ];

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <CssBaseline />

            {/* Navigation Tabs */}
            <Box
                sx={{
                    borderBottom: '1px solid #e2e8f0',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 18px rgba(15,23,42,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    borderRadius: '0 0 18px 18px'
                }}
            >
                <Container maxWidth="xl">
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant="scrollable"
                        scrollButtons
                        allowScrollButtonsMobile
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                justifyContent: { xs: 'flex-start', md: 'left' }
                            },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                minHeight: 55,
                                px: 2.5,
                                py: 1,
                                color: '#475569',
                                borderRadius: '14px 14px 0 0',
                                marginRight: '6px',
                                transition: 'all 0.25s ease',

                                '&:hover': {
                                    background: 'rgba(58,107,109,0.08)',
                                    color: '#2a4b4d'
                                },

                                '&.Mui-selected': {
                                    color: '#2a4b4d',
                                    background: 'rgba(58,107,109,0.08)'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                height: 4,
                                borderRadius: '10px 10px 0 0'
                            }
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                icon={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 30,
                                            height: 30,
                                            borderRadius: '50%',
                                            background: activeTab === index ? tab.gradient : 'rgba(0,0,0,0.05)',
                                            color: activeTab === index ? 'white' : tab.color,
                                            boxShadow:
                                                activeTab === index ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                            transition: 'all 0.3s ease',
                                            mr: 1.5
                                        }}
                                    >
                                        {React.cloneElement(tab.icon, { sx: { fontSize: 20 } })}
                                    </Box>
                                }
                                label={
                                    <Typography
                                        sx={{
                                            fontSize: '0.95rem',
                                            color:
                                                activeTab === index ? mergedConfig.primaryColor : 'text.primary'
                                        }}
                                    >
                                        {tab.label}
                                    </Typography>
                                }
                                iconPosition="start"
                            />
                        ))}
                    </Tabs>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ py: 1 }}>
                {tabComponents[activeTab]}
            </Container>
        </Box>
    );
};

export default ExpenceManagement;
