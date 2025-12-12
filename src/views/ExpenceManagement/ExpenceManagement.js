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
    },[])
 
console.log(userRole);
// 

    const defaultConfig = {
        systemTitle: "Expense Management System",
        companyName: "Your Company Name",
        footerText: "© 2025 All Rights Reserved",
        primaryColor: "#2563eb",
        surfaceColor: "#ffffff",
        textColor: "#1f2937",
        successColor: "#059669",
        secondaryColor: "#6b7280"
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
      ]: [])
       
    ];

    const tabs = [
        {
            label: "Expense Claims",
            icon: <ReceiptLong />,
            color: "#2563eb",
            gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
        },
        {
            label: "Travel Requests",
            icon: <FlightTakeoff />,
            color: "#059669",
            gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
        },
        ...(userRole === 'ADMIN'
    ? [
       
        {
            label: "Approvals",
            icon: <CheckCircleOutline />,
            color: "#f59e0b",
            gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
        },
        {
            label: "Dashboard",
            icon: <DashboardIcon />,
            color: "#7c3aed",
            gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
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
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                   
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
                                fontSize: '1rem',
                                fontWeight: 600,
                                // borderRadius: 20,
                                minHeight: 40,
                                px: 3,
                                py: 0,
                                color: '#374151',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.04)'
                                },
                                '&.Mui-selected': {
                                    color: mergedConfig.primaryColor
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: mergedConfig.primaryColor,
                                height: 3,
                                borderRadius: '3px 3px 0 0'
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
