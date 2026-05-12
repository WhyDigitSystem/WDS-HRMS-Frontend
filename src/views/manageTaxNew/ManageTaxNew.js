import React, { useState } from 'react';
import { Tabs, Tab, Box, Paper, Divider, useMediaQuery, useTheme } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import SavingsIcon from '@mui/icons-material/Savings';
import TaxDeclarations from '../manageTaxNew/pages/TaxDeclarations';
import TDSSummary from '../manageTaxNew/pages/TDSSummary';
import TaxRegime from '../manageTaxNew/pages/TaxRegime';
import Form from '../manageTaxNew/pages/Form';
import ProofSubmission from '../manageTaxNew/pages/ProofSubmission';




const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};

const ManageTaxNew = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1, sm: 2, md: 2 },
        py: { xs: 1, sm: 2, md: 2 },
        bgcolor: '#f9f9f9',
        minHeight: '100vh'
      }}
    >
      <Paper elevation={0} sx={{ px: { xs: 1, sm: 1 } }}>
        <Divider sx={{ mb: 0 }} />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          orientation={isMobile ? 'horizontal' : 'horizontal'}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 0,
            '.MuiTab-root': {
              // fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              // minHeight: 'auto',
              // py: { xs: 1, sm: 1.5 }
            }
          }}
        >
          <Tab label="Tax Declarations" />
          <Tab label="TDS Summary" />
          <Tab label="Tax Regime" />
          <Tab label="Form 16" />
          <Tab label="Proof Submission" />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <TaxDeclarations />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <TDSSummary />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <TaxRegime />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <Form />
        </TabPanel>
         <TabPanel value={activeTab} index={4}>
          <ProofSubmission />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ManageTaxNew;
