import PropTypes from 'prop-types';
import { useState } from 'react';
import { Avatar, Box, Grid, Typography, List, ListItem, Divider, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskIcon from '@mui/icons-material/Assignment';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '12px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -85,
    right: -95,
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.5,
  }
}));

const EarningCard = ({ isLoading }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Get current month, date, year, and time dynamically
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'long' }); // e.g., January
  const date = currentDate.getDate(); // e.g., 29
  const year = currentDate.getFullYear(); // e.g., 2025
  const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g., 09:30 AM

  // Handle Check-In and Check-Out button clicks
  const handleCheckIn = () => {
    alert("Check-In button clicked");
  };

  const handleCheckOut = () => {
    alert("Check-Out button clicked");
  };

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CardWrapper border={false} content={false}>
            <Box sx={{ p: 2.25 }}>
              <Grid container direction="column">
                {/* Profile Section */}
                <div className='d-lg-flex justify-content-lg-between align-items-lg-center'>
                  <div className='d-lg-flex'>
                    <Grid item>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar alt="Dineshkumar" src="/path/to/avatar.jpg" sx={{ width: 60, height: 60, mr: 2 }} />
                        <Box>
                          <Typography sx={{ fontSize: '1.5rem', fontWeight: 500 }}>Dineshkumar P</Typography>
                          <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>Software Engineer</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item>
                      <Box className="d-lg-flex align-items-center ps-5 ms-4 ps-lg-5 ms-lg-0 pb-3 pb-lg-0 pt-0 pt-lg-2">
                        <Box>
                          <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>{`${month} ${date}, ${year}`}</Typography>
                          <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>{time}</Typography> {/* Display Time */}
                        </Box>
                      </Box>
                    </Grid>
                  </div>
                  <Grid item>
                    <Box className="d-flex justify-content-start justify-content-lg-between align-items-center">
                      {/* Check-In and Check-Out Buttons */}
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          mr: 2,
                          width: '120px',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)', // Slightly enlarges the button
                            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)', // Adds a shadow effect on hover
                          },
                        }}
                        onClick={handleCheckIn}
                      >
                        Check-In
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        className="bg-danger"
                        sx={{
                          width: '120px',
                          zIndex: 1,
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)', // Slightly enlarges the button
                            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)', // Adds a shadow effect on hover
                          },
                        }}
                        onClick={handleCheckOut}
                      >
                        Check-Out
                      </Button>
                    </Box>

                  </Grid>

                </div>

                {/* Recent Activity Section */}
                <Grid item sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, color: theme.palette.secondary[200] }}>
                    Recent Activity
                  </Typography>
                  <List>
                    <ListItem>
                      <AccessTimeIcon sx={{ mr: 2 }} color="white" />
                      <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>
                        Logged in for work at 9:00 AM
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <AccessTimeIcon sx={{ mr: 2 }} color="white" />
                      <Typography sx={{ fontSize: '1rem', color: theme.palette.secondary[200] }}>
                        Logged out for work at 12:30 PM
                      </Typography>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </CardWrapper>
        </motion.div>
      )}
    </>
  );
};

EarningCard.propTypes = {
  isLoading: PropTypes.bool
};

export default EarningCard;
