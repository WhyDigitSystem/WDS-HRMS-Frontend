// src/components/AdvancedOfferLetterSystem/MainComponent.js
import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Tabs, Tab, AppBar, Container } from '@mui/material';
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
import { useLocation } from 'react-router-dom';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
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

  const tabColors = [
    '#3a6b6d', // Create Offer
    '#2a4b4d', // All Offers
    '#4f8a8b', // Workflow
    '#5f9ea0' // Preview
  ];

  const tabs = [
    { label: 'Create Offer', icon: <CreateIcon />, component: CreateOffer },
    { label: 'All Offers', icon: <OffersIcon />, component: AllOffers },
    { label: 'Workflow', icon: <WorkflowIcon />, component: WorkFlow },
    { label: 'Preview', icon: <PreviewIcon />, component: Preview }
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
          mt: 2,
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          background: '#fff'
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
            borderBottom: 'none'
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="offer letter system tabs"
            sx={{
              px: 1,

              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.75)',
                minHeight: 50,
                px: 2.5,
                transition: 'all 0.3s ease',
                borderRadius: '10px',
                margin: '6px 4px',

                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#fff'
                }
              },

              '& .Mui-selected': {
                color: '#fff !important',
                backgroundColor: 'rgba(255,255,255,0.12)'
              },

              '& .MuiTabs-indicator': {
                backgroundColor: '#fff',
                height: 3,
                borderRadius: 10
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                sx={{
                  color: '#fff !important',

                  '& .MuiSvgIcon-root': {
                    color: '#fff',
                    fontSize: 20
                  },

                  '&.Mui-selected': {
                    color: '#fff'
                  }
                }}
              />
            ))}
          </Tabs>
        </AppBar>

        {/* Tab Content */}
        {tabs.map((tab, index) => {
          const TabComponent = tab.component;
          return (
            <TabPanel key={index} value={currentTab} index={index}>
              {index === 3 ? <TabComponent offer={selectedOffer} /> : <TabComponent />}
            </TabPanel>
          );
        })}
      </Paper>
    </Container>
  );
};

export default AdvancedOfferLetterSystem;
