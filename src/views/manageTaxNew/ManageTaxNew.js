import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Paper, Divider, useMediaQuery, useTheme, Autocomplete, TextField } from '@mui/material';
import TaxDeclarations from '../manageTaxNew/pages/TaxDeclarations';
import TDSSummary from '../manageTaxNew/pages/TDSSummary';
import TaxRegime from '../manageTaxNew/pages/TaxRegime';
import Form from '../manageTaxNew/pages/Form';
import FormUser from './FormUser';
import ProofSubmission from '../manageTaxNew/pages/ProofSubmission';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import apiCalls from 'apicall';

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};

const ManageTaxNew = () => {
  const designation = localStorage.getItem('designation');
  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');

  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [employeeData, setEmployeeData] = useState([]);
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear; i <= currentYear + 1; i++) {
    yearOptions.push(i);
  }

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const getEmployeeData = async () => {
    try {
      const res = await apiCalls(
        'get',
        `master/getReportingNameForEmployee?orgId=${orgId}&branchCode=${branchCode}&employeeCode=undefined`
      );
      if (res.status === true) {
        setEmployeeData(res?.paramObjectsMap?.employeeVO || []);
      }
    } catch (err) {
      console.log(err?.paramObjectsMap?.message);
    }
  };

  useEffect(() => {
    if (designation === 'HR MANAGER') {
      getEmployeeData();
    }
  }, []);

  const handleEmployeeData = (value) => {
    if (!value) return;
    setEmployeeCode(value?.employeeCode || '');
    setEmployeeName(value?.employeeName || '');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1, sm: 2, md: 2 },
        py: { xs: 1, sm: 2, md: 2 },
        bgcolor: '#f4f7f7',
        minHeight: '100vh'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: { xs: 1, sm: 1 },
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(42,75,77,0.08)',
          border: '1px solid #e2ecec'
        }}
      >
        <Divider sx={{ mb: 0 }} />

        {designation === 'HR MANAGER' && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2,
              mb: 1,
              mt: 1,
              flexWrap: 'wrap'
            }}
          >
            <Autocomplete
              disablePortal
              size="small"
              options={employeeData}
              onChange={(e, newValue) => handleEmployeeData(newValue)}
              getOptionLabel={(option) => `${option.employeeCode} - ${option.employeeName}`}
              sx={{
                width: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '& fieldset': { borderColor: '#d6e4e4' },
                  '&:hover fieldset': { borderColor: '#3a6b6d' },
                  '&.Mui-focused fieldset': { borderColor: '#2a4b4d' }
                }
              }}
              renderInput={(params) => <TextField {...params} placeholder="Select Employee" size="small" />}
            />

            <Autocomplete
              disablePortal
              size="small"
              options={yearOptions}
              value={selectedYear}
              onChange={(e, newValue) => setSelectedYear(newValue)}
              sx={{
                width: 180,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  '& fieldset': { borderColor: '#d6e4e4' },
                  '&:hover fieldset': { borderColor: '#3a6b6d' },
                  '&.Mui-focused fieldset': { borderColor: '#2a4b4d' }
                }
              }}
              renderInput={(params) => <TextField {...params} label="Select Year" size="small" />}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.7,
                px: 1.5,
                py: 0.7,
                borderRadius: '10px',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(42,75,77,0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4b8587 0%, #355f61 100%)'
                }
              }}
            >
              <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
              Export Summary
            </Box>
          </Box>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            borderBottom: 1,
            borderColor: '#e2ecec',

            '& .MuiTabs-indicator': {
              backgroundColor: '#3a6b6d',
              height: 3,
              borderRadius: 2
            },

            '& .MuiTab-root': {
              color: '#64748b',
              fontWeight: 500,
              textTransform: 'none'
            },

            '& .Mui-selected': {
              color: '#2a4b4d !important',
              fontWeight: 700
            }
          }}
        >
          <Tab label="Tax Declarations" />
          <Tab label="TDS Summary" />
          <Tab label="Tax Regime" />
          <Tab label="Form 16" />
          <Tab label="Proof Submission" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <TaxDeclarations employee={employeeCode} employeeName={employeeName} selectedYear={selectedYear}  />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TDSSummary />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <TaxRegime />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {designation === 'HR MANAGER' ? (
            <Form employeeCode={employeeCode} employeeName={employeeName} selectedYear={selectedYear} />
          ) : (
            <FormUser />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <ProofSubmission />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ManageTaxNew;
