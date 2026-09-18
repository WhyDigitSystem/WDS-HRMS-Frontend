import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Avatar, Box, Grid, Typography, Button, useMediaQuery, Dialog, DialogContent, Checkbox, FormControlLabel } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${'#264952'} 30%, ${'#23869f'} 90%)`,
  color: '#fff',
  borderRadius: '16px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

const CheckinDetails = ({ isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [empcode] = useState(localStorage.getItem('employeeCode'));
  const [empName] = useState(localStorage.getItem('employeeName'));
  const [designation] = useState(localStorage.getItem('designation'));
  const [profileImage, setProfileImage] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [hoursWorked, setHoursWorked] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [reportingPersonMail, setReportingPersonMail] = useState('');
  const [reportingPerson, setReportingPerson] = useState('');
  const [reportingPersonCode, setReportingPersonCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [empCode] = useState(localStorage.getItem('employeeCode'));
  const [isWorkFromHome, setIsWorkFromHome] = useState(false);
  const [isHybrid, setIsHybrid] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getCheckInOutStatus();
    getReportingPerson();
    getCompanyDetails();
    getReportingPerson();
  }, []);

  const getReportingPerson = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `master/getAllEmployeeByOrgIdAndEmployeeCode?employeeCode=${empCode}&orgId=${orgId}`);

      if (result?.paramObjectsMap?.employeeVO?.length) {
        const employee = result.paramObjectsMap.employeeVO[0];
        setReportingPerson(employee?.reportnigPerson || '');
        setReportingPersonCode(employee?.reportningPersonCode || '');
        setReportingPersonMail(employee?.reportnigPersonEmail || '');
        setEmployeeEmail(employee?.email || '');
        setProfileImage(employee?.profileImage || '')
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyDetails = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `commonmaster/company/${orgId}`);

      if (result?.paramObjectsMap?.companyVO?.length) {
        const company = result.paramObjectsMap.companyVO[0];
        setIsHybrid(company.hybrid === true);
        setLatitude(company.latitude || null);
        setLongitude(company.longitude || null);
        setLocationAddress(company.locationAddress || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    const now = new Date(); // Freeze current time
    const saveCheckIN = {
      status: true,
      orgId,
      branch,
      branchCode,
      empcode,
      empName,
      email: employeeEmail,
      notify: reportingPerson,
      notifyCode: reportingPersonCode,
      notifyEmail: reportingPersonMail,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      locationAddress: locationAddress || '',
      workFromHome: isWorkFromHome ? 'YES' : 'NO'
    };

    try {
      const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);
      if (result.status === true) {
        showToast('success', 'Check-In Success');

        setCheckInTime(now); // Freeze and store time
        localStorage.setItem('checkInTime', now.toISOString()); // Persist

        setIsCheckedIn(true);
        setCheckOutTime(null); // Clear old checkout
        setHoursWorked(null); // Clear old duration
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Check-In Failed');
      }
    } catch (err) {
      showToast('error', 'Check-In Failed');
    }
  };

  const handleCheckOut = async () => {
    const checkOut = new Date(); // Freeze current time
    const saveCheckIN = {
      status: false,
      orgId,
      branch,
      branchCode,
      empcode,
      empName,
      email: employeeEmail,
      notify: reportingPerson,
      notifyCode: reportingPersonCode,
      notifyEmail: reportingPersonMail,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      locationAddress: locationAddress || '',
      workFromHome: isWorkFromHome ? 'YES' : 'NO'
    };

    try {
      const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);
      if (result.status === true) {
        showToast('success', 'Check-Out Success');

        setIsCheckedIn(false);
        setCheckOutTime(checkOut); // Freeze and store

        if (checkInTime) {
          const start = new Date(checkInTime);
          const diffMs = checkOut - start;

          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setHoursWorked(`${hours} hours ${minutes} minutes`);
        }

        localStorage.removeItem('checkInTime'); // Clean up
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Check-Out Failed');
      }
    } catch (err) {
      showToast('error', 'Check-Out Failed');
    }
  };

  const getCheckInOutStatus = async () => {
    try {
      const response = await apiCalls('get', `basicmaster/chkStatus/${empcode}`);
      if (response.status === true) {
        const employeeStatus = response.paramObjectsMap.EmployeeStatus;
        const status = employeeStatus.status;

        const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
        const inTime = new Date(`${today}T${employeeStatus.latestIn}`);
        const outTime = new Date(`${today}T${employeeStatus.latestOut}`);

        if (status === 'In') {
          setIsCheckedIn(true);
          setCheckInTime(inTime);
          localStorage.setItem('checkInTime', inTime.toISOString());
        } else {
          setIsCheckedIn(false);
          setCheckInTime(inTime);
          setCheckOutTime(outTime);
          localStorage.removeItem('checkInTime');
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  return isLoading ? (
    <SkeletonEarningCard />
  ) : (
    <>
      <Box>
        <Grid item>
          <Typography variant="h6" sx={{ mb: 0, mt: 0, color: 'black', fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }}>
            Quick Access
          </Typography>
        </Grid>

        <CardWrapper border={false} content={false} sx={{ mt: 4 }}>
          <Box sx={{ p: isMobile ? 1.5 : 2.25 }}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={`data:image/png;base64,${profileImage}`}
                      onClick={() => setOpenProfileDialog(true)}
                      sx={{
                        width: isMobile ? 56 : 64,
                        height: isMobile ? 56 : 64,
                        border: `2px solid ${isCheckedIn ? '#4caf50' : '#f44336'}`,
                        cursor: 'pointer'
                      }}
                    />
                    <Box>
                      <Typography variant="h5" color="secondary.light" sx={{ fontSize: isMobile ? '16px' : '18px' }}>
                        {empName}
                      </Typography>
                      <Typography variant="body2" color="secondary.light" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                        {empcode} - {designation}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 2,
                    justifyContent: { xs: 'center', lg: 'flex-start' },
                    flexDirection: { xs: 'row', sm: 'row' },
                    mb: 2,
                    pl: { lg: 5 },
                    ml: { lg: 5 },
                    width: '100%',
                    alignItems: 'center'
                  }}
                >
                  {!isCheckedIn && !checkInTime ? (
                    <Button
                      variant="contained"
                      startIcon={<LoginIcon />}
                      color="primary"
                      sx={{
                        minWidth: isMobile ? 48 : 120,
                        px: isMobile ? 1.5 : 2,
                        py: 1,
                        borderRadius: '10px',
                        textTransform: 'none',
                        bgcolor: 'success.main',
                        '&:hover': {
                          bgcolor: 'success.dark'
                        }
                      }}
                      onClick={handleCheckIn}
                    >
                      {!isMobile && 'Check-In'}
                    </Button>
                  ) : checkInTime instanceof Date && isCheckedIn ? (
                    <Box
                      sx={{
                        minWidth: isMobile ? 48 : 120,
                        px: 2,
                        py: 1,
                        borderRadius: '10px',
                        bgcolor: 'grey.300'
                      }}
                    >
                      <Typography variant="body2" align="center">
                        <LoginIcon /> In at {checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<LoginIcon />}
                      color="primary"
                      sx={{
                        minWidth: isMobile ? 48 : 120,
                        px: isMobile ? 1.5 : 2,
                        py: 1,
                        borderRadius: '10px',
                        textTransform: 'none',
                        bgcolor: 'success.main',
                        '&:hover': {
                          bgcolor: 'success.dark'
                        }
                      }}
                      onClick={handleCheckIn}
                    >
                      {!isMobile && 'Check-In'}
                    </Button>
                  )}

                  {isCheckedIn ? (
                    <Button
                      variant="contained"
                      startIcon={<LogoutIcon />}
                      color="secondary"
                      sx={{
                        minWidth: isMobile ? 48 : 120,
                        px: isMobile ? 1.5 : 2,
                        py: 1,
                        borderRadius: '10px',
                        textTransform: 'none',
                        bgcolor: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.dark'
                        }
                      }}
                      onClick={handleCheckOut}
                    >
                      {!isMobile && 'Check-Out'}
                    </Button>
                  ) : checkOutTime instanceof Date ? (
                    <Box
                      sx={{
                        minWidth: isMobile ? 48 : 120,
                        px: 2,
                        py: 1,
                        borderRadius: '10px',
                        bgcolor: 'grey.300'
                      }}
                    >
                      <Typography variant="body2" align="center">
                        <LogoutIcon /> Out at {checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  ) : null}
                  {isHybrid && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isWorkFromHome}
                          onChange={(e) => setIsWorkFromHome(e.target.checked)}
                          sx={{
                            color: 'white',
                            '&.Mui-checked': {
                              color: 'success.main'
                            }
                          }}
                        />
                      }
                      label="WFH"
                      sx={{
                        ml: 2,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    />
                  )}
                </Box>

                {/* <List sx={{ color: '#fff', pl: { lg: 5 }, ml: { lg: 5 } }}>
                {checkInTime && (
                  <ListItem>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    Checked In At: {checkInTime.toLocaleTimeString()}
                  </ListItem>
                )}
                {checkOutTime && (
                  <ListItem>
                    <AccessTimeFilledIcon sx={{ mr: 1 }} />
                    Checked Out At: {checkOutTime.toLocaleTimeString()}
                  </ListItem>
                )}
                {hoursWorked && <ListItem>⏱ Total Time Worked: {hoursWorked}</ListItem>}
              </List> */}
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      </Box>
      <Dialog
        open={openProfileDialog}
        onClose={() => setOpenProfileDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent', // No background
            boxShadow: 'none', // No shadow
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }
        }}
      >
        <Box
          component="img"
          src={`data:image/png;base64,${profileImage}`}
          alt="Profile"
          onClick={() => setOpenProfileDialog(false)}
          sx={{
            width: 250,
            height: 250,
            borderRadius: '50%', // Round shape
            objectFit: 'cover',
            cursor: 'pointer'
          }}
        />
      </Dialog>
    </>
  );
};

CheckinDetails.propTypes = {
  isLoading: PropTypes.bool
};

export default CheckinDetails;
