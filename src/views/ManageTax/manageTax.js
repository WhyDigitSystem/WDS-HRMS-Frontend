import React, { useState } from 'react';
import {
    Tabs, Tab, Box, Paper, Divider, useMediaQuery, useTheme
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import SavingsIcon from '@mui/icons-material/Savings';
import Declaration from './Declaration';
import Previous from './Previous';
import Forms from './Forms';
import TaxFiling from './TaxFiling';
import TaxSavingInvestment from './TaxSavingInvestment';

const TabPanel = ({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box sx={{ py: { xs: 2, md: 3 } }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const ManageTax = () => {
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
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, sm: 3, md: 4 },
                bgcolor: '#f9f9f9',
                minHeight: '100vh'
            }}
        >
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                <Divider sx={{ mb: 2 }} />

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
                        mb: 3,
                        '.MuiTab-root': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            minHeight: 'auto',
                            py: { xs: 1, sm: 1.5 }
                        }
                    }}
                >
                    <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="Declaration" />
                    <Tab icon={<HistoryIcon />} iconPosition="start" label="Previous Income" />
                    <Tab icon={<DescriptionIcon />} iconPosition="start" label="Forms" />
                    <Tab icon={<GavelIcon />} iconPosition="start" label="Tax Filing" />
                    <Tab icon={<SavingsIcon />} iconPosition="start" label="Tax Saving Investment" />
                </Tabs>

                {/* Tab Panels */}
                <TabPanel value={activeTab} index={0}>
                    <Declaration />
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                    <Previous />
                </TabPanel>
                <TabPanel value={activeTab} index={2}>
                    <Forms />
                </TabPanel>
                <TabPanel value={activeTab} index={3}>
                    <TaxFiling />
                </TabPanel>
                <TabPanel value={activeTab} index={4}>
                    <TaxSavingInvestment />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default ManageTax;
