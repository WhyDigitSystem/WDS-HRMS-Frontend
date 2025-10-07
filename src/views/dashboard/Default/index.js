import { useEffect, useState } from 'react';

// material-ui
import { Grid, Box } from '@mui/material';

// project imports
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { gridSpacing } from 'store/constant';
import EarningCard from './EarningCard';
// import PopularCard from './PopularCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';

import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import CurrencyExchangeRates from './ExRateDash';
import UpcomingHolidayCard from './UpcomingHolidayCard';
import LeaveBalance from './LeaveBalance';
import CheckinDetails from './CheckinDetails';
import Announcement from './Announcements/Announcements';
import Organization from './Organization';
import Inbox from './Inbox';
import TimeDate from './TimeDate';
import BirthdayNews from './BirthdayNews';
import Main from './SocialMedia/Main';
import Home from './Announcements/Home';
import Pendingupload from './Pendingupload';
import News from './News/index';

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    if (localStorage.getItem('LoginMessage') === 'true') {
      toast.success('Login Successful, Welcome!', {
        autoClose: 2000,
        theme: 'colored'
      });

      const timeoutId = setTimeout(() => {
        localStorage.setItem('LoginMessage', false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing} sx={{ pt: { lg: 2, xs: 0 } }}>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <CheckinDetails isLoading={isLoading} />
              <TimeDate isLoading={isLoading} />
            </Box>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Main isLoading={isLoading} />
            </Box>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <UpcomingHolidayCard isLoading={isLoading} />
            </Box>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Home />
            </Box>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              {/* <BirthdayNews isLoading={isLoading} /> */}
              <News isLoading={isLoading} />
            </Box>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Pendingupload isLoading={isLoading} />
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={gridSpacing} sx={{ pt: { lg: 2, xs: 0 } }}>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              {/* <BirthdayNews isLoading={isLoading} /> */}
              {/* <Inbox isLoading={isLoading} /> */}
            </Box>
          </Grid>
          <Grid item sm={12} xs={12} md={12} lg={6} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              {/* <Organization isLoading={isLoading} /> */}
            </Box>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              {/* <UpcomingHolidayCard isLoading={isLoading} /> */}
            </Box>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              {/* <LeaveBalance isLoading={isLoading} /> */}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
