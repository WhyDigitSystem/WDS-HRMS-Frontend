import React, { useState,useEffect } from 'react';
import { Tabs, Tab, Box, Paper, Divider, useMediaQuery, useTheme,Autocomplete, TextField  } from '@mui/material';
import TaxDeclarations from '../manageTaxNew/pages/TaxDeclarations';
import TDSSummary from '../manageTaxNew/pages/TDSSummary';
import TaxRegime from '../manageTaxNew/pages/TaxRegime';
import Form from '../manageTaxNew/pages/Form';
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
  const [employeeData,setEmployeeData] = useState([]);
  const [employeeCode,setEmployeeCode] = useState('');
  const [employeeName,setEmployeeName] = useState('');
  
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 0; i <= currentYear + 1; i++) {
  yearOptions.push(i);
}
const [selectedYear, setSelectedYear] = useState(currentYear);

  const getEmployeeData = async () =>{
    try{
      const res = await apiCalls('get',`master/getReportingNameForEmployee?orgId=${orgId}&branchCode=${branchCode}&employeeCode=undefined`)
      if(res.status === true){
        setEmployeeData(res?.paramObjectsMap?.employeeVO || []);
      }
    }catch(err){
      console.log(err?.paramObjectsMap?.message);
    }
  }

  useEffect(()=>{
    if(designation === 'HR MANAGER'){
    getEmployeeData();
    }
  },[]);


  const handleEmployeeData = (value) =>{
    if (!value) return;
    setEmployeeCode(value?.employeeCode || '');
   setEmployeeName(value?.employeeName || '');
  }

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
    onChange={(event, newValue) => handleEmployeeData(newValue)}
    // defaultValue={employeeData.find((item) => item.employeeCode === employeeCode)}
    getOptionLabel={(option) =>
    `${option.employeeCode} - ${option.employeeName}`
  }
    sx={{
      width: 250,
      '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff'
      }
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        placeholder="Select Employee"
        size="small"
      />
    )}
  />
   <Autocomplete
      disablePortal
      size="small"
      options={yearOptions}
      value={selectedYear}
      onChange={(event, newValue) =>
        setSelectedYear(newValue)
      }
      sx={{
        width: 180,
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          backgroundColor: '#fff'
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Year"
          size="small"
        />
      )}
    />

  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.7,
      px: 1.5,
      py: 0.7,
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      cursor: 'pointer',
      backgroundColor: '#fff',
      transition: '0.2s',
      fontSize: '13px',
      fontWeight: 500,
      color: '#334155',
      '&:hover': {
        backgroundColor: '#f8fafc',
        borderColor: '#cbd5e1'
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
          <Tab label="Form 16"   />
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
          <Form employeeCode={employeeCode} employeeName={employeeName} selectedYear={selectedYear}/>
        </TabPanel>
         <TabPanel value={activeTab} index={4}>
          <ProofSubmission />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ManageTaxNew;
