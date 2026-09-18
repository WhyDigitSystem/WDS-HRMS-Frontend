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
            iconColor: "#0f766e",
            gradient: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)",
            description: "Manage inventory"
        },
        {
            label: "Asset Allocation",
            icon: <AssignmentInd />,
            iconColor: "#0d9488",
            gradient: "linear-gradient(135deg, #2f7a7c 0%, #24585a 100%)",
            description: "Assign assets"
        },
        {
            label: "Return Asset",
            icon: <AssignmentReturn />,
            iconColor: "#0f766e",
            gradient: "linear-gradient(135deg, #356d70 0%, #234547 100%)",
            description: "Return assigned assets"
        },
        {
            label: "Dashboard",
            icon: <Dashboard />,
            iconColor: "#134e4a",
            gradient: "linear-gradient(135deg, #3f7c7e 0%, #2d5658 100%)",
            description: "Analytics & insights"
        }
    ];

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <CssBaseline />

            {/* Enhanced Navigation Tabs */}
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}
            >
                <Container
                    maxWidth="xl"
                    sx={{
                        px: { xs: 0.5, sm: 2 }
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            minHeight: { xs: 56, sm: 'auto' },

                            '& .MuiTabs-flexContainer': {
                                flexWrap: {
                                    xs: 'nowrap',
                                    md: 'nowrap'
                                }
                            },

                            '& .MuiTab-root': {
                                minHeight: { xs: 56, sm: 30 },
                                minWidth: 'fit-content',
                                fontSize: {
                                    xs: '0.78rem',
                                    sm: '0.95rem'
                                },
                                fontWeight: 600,
                                textTransform: 'none',
                                color: '#64748b',
                                transition: 'all 0.3s ease',
                                py: { xs: 1, sm: 2 },
                                px: { xs: 1.5, sm: 3 },
                                flexShrink: 0,

                                '&:hover': {
                                    background: 'rgba(58, 107, 109, 0.06)'
                                },

                                '&.Mui-selected': {
                                    color: '#2a4b4d'
                                }
                            },

                            '& .MuiTabs-indicator': {
                                background:
                                    'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
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
                                            width: { xs: 22, sm: 25 },
                                            height: { xs: 22, sm: 25 },
                                            borderRadius: '12px',
                                            background:
                                                activeTab === index
                                                    ? 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)'
                                                    : 'rgba(58, 107, 109, 0.08)',

                                            color:
                                                activeTab === index
                                                    ? '#fff'
                                                    : '#3a6b6d',

                                            transition: 'all 0.3s ease',
                                            transform:
                                                activeTab === index
                                                    ? 'scale(1.1)'
                                                    : 'scale(1)',

                                            boxShadow:
                                                activeTab === index
                                                    ? '0 6px 14px rgba(42,75,77,0.18)'
                                                    : 'none',

                                            mr: { xs: 0.8, sm: 1.5 }
                                        }}
                                    >
                                        {React.cloneElement(tab.icon, {
                                            sx: {
                                                fontSize: {
                                                    xs: 16,
                                                    sm: 20
                                                },
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
                                                fontSize: {
                                                    xs: '0.72rem',
                                                    sm: '0.95rem'
                                                },
                                                whiteSpace: 'nowrap',
                                                color:
                                                    activeTab === index
                                                        ? '#2a4b4d'
                                                        : '#334155'
                                            }}
                                        >
                                            {tab.label}
                                        </Typography>
                                    </Box>
                                }
                                iconPosition="start"
                                sx={{
                                    borderRadius: 2,
                                    mx: { xs: 0.2, sm: 0.5 },

                                    '&.Mui-selected': {
                                        background:
                                            'rgba(58, 107, 109, 0.08)'
                                    }
                                }}
                            />
                        ))}
                    </Tabs>
                </Container>
            </Box>

            {/* Main Content */}
            <Container
                maxWidth="xl"
                sx={{
                    py: { xs: 1, sm: 2 },
                    px: { xs: 1, sm: 2 }
                }}
            >
                {tabComponents[activeTab]}
            </Container>
        </Box>
    );
};

export default AssetManagementSystem;