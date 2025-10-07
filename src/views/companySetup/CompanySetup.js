import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Company from './Company';
import Branch from './Branch';
import { useEffect, useState } from 'react';

const CompanySetup = () => {
  const [value, setValue] = React.useState(0);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loginUserType, setLoginUserType] = useState(localStorage.getItem('userType'));
  const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

  // useEffect(() => {
  //   if (loginUserType !== 'admin') {
  //     if (allowedScreens.includes('branch') && !allowedScreens.includes('company')) {
  //       setValue(1);
  //     }
  //   }
  // }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <Box sx={{ width: '100%' }}>
          <Tabs value={value} onChange={handleChange} textColor="secondary" indicatorColor="secondary" aria-label="secondary tabs example">
            <Tab value={0} label="Company" />
            <Tab value={1} label="Branch" />
          </Tabs>
          {/* <Tabs value={value} onChange={handleChange} textColor="secondary" indicatorColor="secondary" aria-label="secondary tabs example">
            {allowedScreens.includes('company') && <Tab value={0} label="Company" />}
            {allowedScreens.includes('branch') && <Tab value={1} label="Branch" />}
          </Tabs> */}
        </Box>
        <Box sx={{ padding: 2 }}>
          {value === 0 && <Company />}
          {value === 1 && <Branch />}
        </Box>
      </div>
    </>
  );
};

export default CompanySetup;
