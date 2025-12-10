import React, { useState, useEffect } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    CssBaseline,
    Container
} from '@mui/material';
import {
    Inventory2,
    AssignmentInd,
    Dashboard,
    Star,
    AssignmentReturn,
    BusinessCenter,
    TrackChanges
} from '@mui/icons-material';
import AssetMaster from './AssetMaster';
import AssetAllocation from './AssetAllocation';
import AssetManagement from './DashboardAssetManagement';
import ReturnAsset from './ReturnAsset';

const AssetManagementSystem = ({ config = {} }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [assets, setAssets] = useState([]);

    // Default configuration
    const defaultConfig = {
        systemTitle: "Asset Management System",
        companyName: "Your Company Name",
        footerText: "© 2024 All Rights Reserved",
        primaryColor: "#2563eb",
        surfaceColor: "#ffffff",
        textColor: "#1f2937",
        successColor: "#059669",
        secondaryColor: "#6b7280"
    };

    const mergedConfig = { ...defaultConfig, ...config };

    useEffect(() => {
        // Load initial data or connect to SDK
        console.log('App initialized with config:', mergedConfig);
    }, []);

    const handleAddAsset = (assetData) => {
        if (assets.length >= 999) {
            return false;
        }
        setAssets(prev => [...prev, assetData]);
        return true;
    };

    const handleDeleteAsset = (assetId) => {
        setAssets(prev => prev.filter(asset => asset.id !== assetId));
        return true;
    };

    const handleAllocateAsset = (assetData) => {
        setAssets(prev => prev.map(asset =>
            asset.id === assetData.id ? assetData : asset
        ));
        return true;
    };

    const handleReturnAsset = (assetId) => {
        setAssets(prev => prev.map(asset =>
            asset.id === assetId
                ? {
                    ...asset,
                    status: 'Available',
                    assigned_to: '',
                    employee_id: '',
                    allocation_date: '',
                    return_date: new Date().toISOString().split('T')[0]
                }
                : asset
        ));
        return true;
    };

    const handleShowAllocation = () => {
        setActiveTab(1); // Switch to Allocation tab
    };

    const tabComponents = [
        <AssetMaster
            key="master"
            assets={assets}
            onAddAsset={handleAddAsset}
            onDeleteAsset={handleDeleteAsset}
            config={mergedConfig}
        />,
        <AssetAllocation
            key="allocation"
            assets={assets}
            onAllocateAsset={handleAllocateAsset}
            onReturnAsset={handleReturnAsset}
            config={mergedConfig}
        />,
         <ReturnAsset
            key="return"
            assets={assets}
            // onAllocateAsset={handleAllocateAsset}
            // onReturnAsset={handleReturnAsset}
            config={mergedConfig}
        />,
        <AssetManagement
            key="management"
            assets={assets}
            onReturnAsset={handleReturnAsset}
            onShowAllocation={handleShowAllocation}
            config={mergedConfig}
        />
    ];

    // Tab configuration with icons and colors
    const tabs = [
        {
            label: "Asset Master",
            icon: <Inventory2 />,
            iconColor: "#2563eb", // Blue
            gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
            description: "Manage inventory"
        },
        {
            label: "Asset Allocation",
            icon: <AssignmentInd />,
            iconColor: "#059669", // Green
            gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            description: "Assign assets"
        },
        {
    label: "Return Asset",
    icon: <AssignmentReturn />,
    iconColor: "#0284c7", // Blue
    gradient: "linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)",
    description: "Return assigned assets"
},
        {
            label: "Dashboard",
            icon: <Dashboard />,
            iconColor: "#7c3aed", // Purple
            gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
            description: "Analytics & insights"
        }
    ];

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <CssBaseline />

            {/* Enhanced Navigation Tabs */}
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
                <Container maxWidth="xl">
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 30,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                },
                                transition: 'all 0.3s ease',
                                py: 2,
                                px: 3
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
                                            width: 25,
                                            height: 25,
                                            borderRadius: '12px',
                                            background: activeTab === index ? tab.gradient : 'rgba(0, 0, 0, 0.04)',
                                            color: activeTab === index ? 'white' : tab.iconColor,
                                            transition: 'all 0.3s ease',
                                            transform: activeTab === index ? 'scale(1.1)' : 'scale(1)',
                                            boxShadow: activeTab === index ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                            mr: 1.5
                                        }}
                                    >
                                        {React.cloneElement(tab.icon, {
                                            sx: {
                                                fontSize: 20,
                                                transition: 'all 0.3s ease'
                                            }
                                        })}
                                    </Box>
                                }
                                label={
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography
                                            variant="body1"
                                            fontWeight={600}
                                            sx={{
                                                fontSize: '0.95rem',
                                                color: activeTab === index ? mergedConfig.primaryColor : 'text.primary'
                                            }}
                                        >
                                            {tab.label}
                                        </Typography>
                                    </Box>
                                }
                                iconPosition="start"
                                sx={{
                                    borderRadius: 2,
                                    mx: 0.5,
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(37, 99, 235, 0.04)',
                                    }
                                }}
                            />
                        ))}
                    </Tabs>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ py: 2 }}>
                {tabComponents[activeTab]}
            </Container>

        </Box>
    );
};

export default AssetManagementSystem;