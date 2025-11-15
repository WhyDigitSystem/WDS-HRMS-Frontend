// src/components/AdvancedOfferLetterSystem/MainComponent.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Container
} from '@mui/material';
import {
  AddCircleOutline as CreateIcon,
  DescriptionOutlined as TemplateIcon,
  ListAltOutlined as OffersIcon,
  SettingsOutlined as WorkflowIcon,
  InsightsOutlined as AnalyticsIcon,
  GroupOutlined as BulkIcon,
  VisibilityOutlined as PreviewIcon
} from '@mui/icons-material';
import StatsCards from './OfferTabs/StatsCards';
import CreateOffer from './OfferTabs/CreateOffer';
import AllOffers from './OfferTabs/AllOffer';
import Preview from './OfferTabs/OfferPreview';
import WorkFlow from './OfferTabs/WorkFlowPendingApprovals';
import { useLocation } from "react-router-dom";

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdvancedOfferLetterSystem = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const location = useLocation();
  const selectedOffer = location.state?.offer || null;

  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setCurrentTab(location.state.tab);
    }
  }, [location.state]);


  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // 🎨 Define colors for icons
  const tabColors = [
    '#3b82f6', // blue - Create Offer
    '#10b981', // green - All Offers
    '#f59e0b', // amber - Workflow
    '#8b5cf6', // violet - Analytics
    '#ec4899', // pink - Bulk Actions
    '#6366f1', // indigo - Preview
  ];

  const tabs = [
    { label: 'Create Offer', icon: <CreateIcon />, component: CreateOffer },
    { label: 'All Offers', icon: <OffersIcon />, component: AllOffers },
    { label: 'Workflow', icon: <WorkflowIcon />, component: WorkFlow },
    { label: 'Preview', icon: <PreviewIcon />, component: Preview },
  ];

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 0 }}>
      {/* Stats Section */}
      <Box sx={{ px: 3, pt: 0 }}>
        <StatsCards />
      </Box>

      {/* Main Tabs Section */}
      <Paper
        sx={{
          width: '100%',
          mt: 3,
          borderRadius: 2,
          boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="offer letter system tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                minHeight: 48,
                px: 2.5,
                transition: 'all 0.3s ease',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.05)',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: 2,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={
                  <Box
                    component="span"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        currentTab === index
                          ? tabColors[index]
                          : `${tabColors[index]}99`, // slightly transparent when inactive
                      transition: 'color 0.3s ease',
                      '& svg': {
                        fontSize: 20,
                      },
                    }}
                  >
                    {tab.icon}
                  </Box>
                }
                iconPosition="start"
                label={
                  <Typography
                    sx={{
                      color:
                        currentTab === index
                          ? '#111827'
                          : 'text.secondary',
                    }}
                  >
                    {tab.label}
                  </Typography>
                }
              />
            ))}
          </Tabs>
        </AppBar>

        {/* Tab Content */}
        {tabs.map((tab, index) => {
          const TabComponent = tab.component;
          return (
            <TabPanel key={index} value={currentTab} index={index}>
              {index === 3 ? (
                <TabComponent offer={selectedOffer} />
              ) : (
                <TabComponent />
              )}
            </TabPanel>
          );
        })}
      </Paper>
    </Container>
  );
};

export default AdvancedOfferLetterSystem;
