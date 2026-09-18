import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  keyframes,
  Avatar,
  useMediaQuery,
  useTheme,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiCalls from 'apicall';

import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CelebrationIcon from '@mui/icons-material/Celebration';
import TodayIcon from '@mui/icons-material/Today';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const UpcomingHolidayCard = () => {
  const [allHolidays, setAllHolidays] = useState([]);
  const [activeHolidays, setActiveHolidays] = useState([]);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [viewMoreDialogOpen, setViewMoreDialogOpen] = useState(false);
  const [leaveInfo, setLeaveInfo] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalHolidays: 0,
    upcomingHolidays: 0,
    holidaysThisMonth: 0,
    holidaysNextMonth: 0,
    branchDistribution: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await getAllHolidayByOrgId();
      await getLeaveInformation();
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const filterActiveHolidays = (holidays) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidays
      .filter((holiday) => {
        const holidayDate = new Date(holiday.holidayDate);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= today;
      })
      .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));
  };

  const getAllHolidayByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);
      if (result?.paramObjectsMap?.holidayVO) {
        const holidays = result.paramObjectsMap.holidayVO;
        setAllHolidays(holidays);
        const active = filterActiveHolidays(holidays);
        setActiveHolidays(active);

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const nextMonth = (currentMonth + 1) % 12;

        const thisMonthHolidays = active.filter((h) => {
          const date = new Date(h.holidayDate);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const nextMonthHolidays = active.filter((h) => {
          const date = new Date(h.holidayDate);
          return date.getMonth() === nextMonth && date.getFullYear() === (nextMonth < currentMonth ? currentYear + 1 : currentYear);
        });

        setStats({
          totalHolidays: holidays.length,
          upcomingHolidays: active.length,
          holidaysThisMonth: thisMonthHolidays.length,
          holidaysNextMonth: nextMonthHolidays.length,
          branchDistribution: []
        });
      } else {
        setAllHolidays([]);
        setActiveHolidays([]);
        setStats({
          totalHolidays: 0,
          upcomingHolidays: 0,
          holidaysThisMonth: 0,
          holidaysNextMonth: 0,
          branchDistribution: []
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setAllHolidays([]);
      setActiveHolidays([]);
      setStats({
        totalHolidays: 0,
        upcomingHolidays: 0,
        holidaysThisMonth: 0,
        holidaysNextMonth: 0,
        branchDistribution: []
      });
    }
  };

  const getLeaveInformation = async () => {
    try {
      const result = await apiCalls('get', `/leave/getLeaveBalanceByUser?userName=${loginUserName}&orgId=${orgId}`);
      if (result?.paramObjectsMap?.leaveBalance) {
        setLeaveInfo(result.paramObjectsMap.leaveBalance);
      }
    } catch (err) {
      console.error('Error fetching leave data:', err);
      setLeaveInfo([]);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDayName = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const getHolidayStatus = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(dateString);
    holidayDate.setHours(0, 0, 0, 0);

    if (holidayDate.getTime() === today.getTime()) return 'today';
    return holidayDate < today ? 'past' : 'upcoming';
  };

  const daysUntilHoliday = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(dateString);
    const diffTime = holidayDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleViewMoreOpen = () => setViewMoreDialogOpen(true);
  const handleViewMoreClose = () => setViewMoreDialogOpen(false);

  const HolidayCard = ({ holiday, isHighlighted = false }) => {
    const status = getHolidayStatus(holiday.holidayDate);
    const daysUntil = daysUntilHoliday(holiday.holidayDate);

    return (
      <Paper
        elevation={isHighlighted ? 3 : 1}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: isHighlighted ? '#fff8e1' : 'background.paper',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderLeft: `4px solid ${status === 'today' ? '#4CAF50' : status === 'past' ? '#9E9E9E' : '#FF9800'}`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[6]
          }
        }}
      >
        {status === 'today' && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: '#4CAF50',
              color: 'white',
              px: 1.5,
              py: 0.5,
              fontSize: 12,
              fontWeight: 'bold',
              borderBottomLeftRadius: 8
            }}
          >
            TODAY!
          </Box>
        )}

        <Box display="flex" alignItems="center" mb={1}>
          <CelebrationIcon
            sx={{
              mr: 1,
              color: status === 'today' ? '#4CAF50' : status === 'past' ? '#9E9E9E' : '#FF9800',
              fontSize: 24
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              color: status === 'past' ? 'text.secondary' : 'text.primary'
            }}
          >
            {holiday.festival}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1.5}>
          <TodayIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
            {status === 'upcoming' && (
              <Chip
                label={`in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: '#E3F2FD',
                  color: '#1976D2',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            )}
          </Typography>
        </Box>

        {holiday?.holidayType && (
          <Box display="flex" mb={1}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <InfoIcon sx={{ fontSize: 16, mr: 0.5 }} /> Type:
            </Typography>
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {holiday.holidayType}
            </Typography>
          </Box>
        )}

        {holiday?.description && (
          <Box mb={1}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                color: 'text.secondary'
              }}
            >
              Description:
            </Typography>
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {holiday.description}
            </Typography>
          </Box>
        )}

        {holiday?.branch && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                color: 'text.secondary'
              }}
            >
              Branch:
            </Typography>
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {holiday.branch}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {isLoading ? (
        <Box sx={{ width: '100%', p: 3 }}>
          <LinearProgress color="primary" />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Total Holidays Card */}
            <Grid item xs={12} sm={6} md={6}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e3e9f2 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(63, 81, 181, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <EventIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'text.secondary',
                      mb: 0.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <EventIcon sx={{ fontSize: 18, mr: 1 }} /> Total Holidays
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      mt: 1
                    }}
                  >
                    {stats.upcomingHolidays} upcoming
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Holidays This Month Card */}
            <Grid item xs={12} sm={6} md={6}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f2e9 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 40, color: '#4CAF50', opacity: 0.3 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'text.secondary',
                      mb: 0.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <CalendarMonthIcon sx={{ fontSize: 18, mr: 1 }} /> This Month
                  </Typography>
                  {stats.holidaysThisMonth === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No holidays this month
                    </Typography>
                  ) : (
                    <>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 'bold',
                          color: '#4CAF50',
                          display: 'flex',
                          alignItems: 'flex-end',
                          lineHeight: 1
                        }}
                      >
                        {stats.holidaysThisMonth}
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            color: 'text.secondary',
                            lineHeight: 1.2
                          }}
                        >
                          in {new Date().toLocaleString('default', { month: 'long' })}
                        </Typography>
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mt: 1
                        }}
                      >
                        {stats.holidaysNextMonth} in next month
                      </Typography>
                    </>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>

          {activeHolidays.length > 0 && (
            <Card
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                borderLeft: '4px solid #3f51b5',
                background: 'linear-gradient(to right, #f8f9fa, #ffffff)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  mb: 3
                }}
              >
                <Box display="flex" alignItems="center">
                  <CelebrationIcon
                    sx={{
                      fontSize: 32,
                      mr: 2,
                      color: 'primary.main',
                      animation: `${pulse} 2s infinite`
                    }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Upcoming Holiday
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeHolidays.length} upcoming holidays this year
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ExpandMoreIcon />}
                  onClick={handleViewMoreOpen}
                  sx={{
                    borderRadius: 10,
                    textTransform: 'none',
                    mt: { xs: 2, sm: 0 },
                    px: 3,
                    py: 1,
                    background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                    boxShadow: '0 2px 10px rgba(63, 81, 181, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #2196f3, #3f51b5)',
                      boxShadow: '0 4px 14px rgba(33, 150, 243, 0.4)'
                    }
                  }}
                >
                  View All Holidays
                </Button>
              </Box>

              <Grid container spacing={3}>
                {activeHolidays.slice(0, 1).map((holiday, index) => {
                  const daysUntil = daysUntilHoliday(holiday.holidayDate);
                  const isToday = getHolidayStatus(holiday.holidayDate) === 'today';

                  return (
                    <Grid item xs={12} key={index}>
                      <Box
                        sx={{
                          p: 4,
                          borderRadius: 4,
                          background: isToday
                            ? 'linear-gradient(to right, #e8f5e9, #c8e6c9)'
                            : 'linear-gradient(to right, #fff3e0, #ffe0b2)',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.01)'
                          }
                        }}
                      >
                        {isToday && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: '#4CAF50',
                              color: 'white',
                              px: 3,
                              py: 1,
                              fontSize: 14,
                              fontWeight: 'bold',
                              borderBottomLeftRadius: 12,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <TodayIcon sx={{ mr: 0.5, fontSize: 18 }} />
                            CELEBRATE TODAY!
                          </Box>
                        )}

                        <Grid container spacing={3} alignItems="center" >
                          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Avatar
                              src={holiday.holidaysImage ? `data:image/png;base64,${holiday.holidaysImage}` : ''}
                              onClick={() => setOpenProfileDialog(true)}
                              sx={{
                                width: 120,
                                height: 120,
                                bgcolor: holiday.holidaysImage ? 'transparent' : '#1976d2',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: 36,
                                border: '4px solid white',
                                boxShadow: theme.shadows[4]
                              }}
                            >
                              {!holiday.holidaysImage && (holiday.name?.[0] || holiday.festival?.[0] || 'H')}
                            </Avatar>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5 }}>
                              🎊 {holiday.festival}
                            </Typography>

                            <Box display="flex" alignItems="center" mb={1.5}>
                              <TodayIcon sx={{ mr: 1, fontSize: 24, color: 'text.secondary',textAlign: 'center' }} />
                              <Box>
                                <Typography variant="h6" sx={{ color: '#4e342e' }}>
                                  {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
                                </Typography>
                                {!isToday && (
                                  <Typography variant="subtitle2" sx={{ color: '#6d4c41', mt: 0.5,textAlign: 'center' }}>
                                    {daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days to go`}
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            {holiday.holidayType && (
                              <Box display="flex" alignItems="center" mb={1}>
                                <Chip
                                  label={holiday.holidayType}
                                  size="small"
                                  sx={{
                                    bgcolor: '#E3F2FD',
                                    color: '#1976D2',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </Box>
                            )}
                          </Grid>

                          {/* <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{
                              bgcolor: isToday ? '#4CAF50' : '#FF9800',
                              color: 'white',
                              p: 2,
                              borderRadius: 2,
                              textAlign: 'center',
                              width: '100%',
                              maxWidth: 200
                            }}>
                              <Typography   sx={{ mb: 1,color:'black'}}>
                                {isToday ? "It's Today!" : "Countdown"}
                              </Typography>
                              <Typography  sx={{ fontWeight: 'bold',fontSize: '1rem'}}>
                                {isToday ? "🎉" : daysUntil}
                              </Typography>
                              <Typography sx={{ color:'black' }}>
                                {isToday ? "Enjoy your holiday!" : `day${daysUntil !== 1 ? 's' : ''} remaining`}
                              </Typography>
                            </Box>
                          </Grid> */}
                          <Grid item xs={12} sm={4} md={3} display="flex" justifyContent={{ xs: 'center', md: 'flex-end' }}>
                            <Box
                              sx={{
                                bgcolor: isToday ? '#4CAF50' : '#FF9800',
                                color: 'white',
                                p: { xs: 1, sm: 1.5, md: 2 },
                                borderRadius: 2,
                                textAlign: 'center',
                                width: { xs: '100%', sm: '90%', md: 160 },
                                minHeight: { xs: 'auto', md: 120 }
                              }}
                            >
                              <Typography
                                sx={{
                                  mb: 0.5,
                                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                  color: 'black'
                                }}
                              >
                                {isToday ? "It's Today!" : 'Countdown'}
                              </Typography>

                              <Typography
                                sx={{
                                  fontWeight: 'bold',
                                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem' },
                                  lineHeight: 1
                                }}
                              >
                                {isToday ? '🎉' : daysUntil}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                  color: 'black'
                                }}
                              >
                                {isToday ? 'Enjoy your holiday!' : `day${daysUntil !== 1 ? 's' : ''} remaining`}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {(holiday.description || holiday.branch) && (
                          <Box mt={3}>
                            {holiday.description && (
                              <Typography
                                variant="body1"
                                sx={{
                                  color: '#6d4c41',
                                  fontStyle: 'italic',
                                  mb: holiday.branch ? 1 : 0
                                }}
                              >
                                "{holiday.description}"
                              </Typography>
                            )}
                            {holiday.branch && (
                              <Typography variant="body2" sx={{ color: '#6d4c41' }}>
                                <strong>Applicable for:</strong> {holiday.branch}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Card>
          )}

          <Dialog
            open={viewMoreDialogOpen}
            onClose={handleViewMoreClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                minHeight: '80vh'
              }
            }}
          >
            <DialogTitle
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                px: 3
              }}
            >
              <Box display="flex" alignItems="center">
                <CelebrationIcon sx={{ mr: 2, fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {new Date().getFullYear()} Holiday Calendar
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                    {allHolidays.length} holidays • {activeHolidays.length} upcoming
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleViewMoreClose}
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              dividers
              sx={{
                p: 0,
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px'
                }
              }}
            >
              <Box sx={{ p: 3, px: 4, py: 2 }}>
                <Grid container spacing={3}>
                  {allHolidays
                    .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate))
                    .map((holiday, index) => {
                      const status = getHolidayStatus(holiday.holidayDate);
                      const daysUntil = daysUntilHoliday(holiday.holidayDate);
                      const isToday = status === 'today';

                      return (
                        <>
                          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card
                              sx={{
                                p: 1,
                                borderRadius: 2,
                                background: isToday
                                  ? 'linear-gradient(145deg, #e0f7e9, #b9f6ca)'
                                  : status === 'past'
                                    ? 'linear-gradient(145deg, #f0f0f0, #e0e0e0)'
                                    : 'linear-gradient(145deg, #ffffff, #f9f9fb)',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: 0,
                                animation: `${fadeIn} 0.4s ease-out ${index * 0.04}s forwards`,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-3px)',
                                  boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                                },
                                borderLeft: `3px solid ${isToday ? '#43a047' : status === 'past' ? '#9E9E9E' : '#fb8c00'}`
                              }}
                            >
                              {isToday && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    px: 1,
                                    py: 0.2,
                                    fontSize: 9,
                                    fontWeight: 600,
                                    color: '#fff',
                                    background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)',
                                    borderBottomLeftRadius: 8,
                                    boxShadow: 1
                                  }}
                                >
                                  TODAY
                                </Box>
                              )}

                              <Box display="flex" alignItems="center" mb={1}>
                                <Box
                                  sx={{
                                    bgcolor: isToday ? '#66bb6a' : status === 'past' ? '#bdbdbd' : '#ffb74d',
                                    width: 26,
                                    height: 26,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1
                                  }}
                                >
                                  <CelebrationIcon sx={{ color: '#fff', fontSize: 16 }} />
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                    {holiday.festival || 'Holiday'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    {holiday.holidayType}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box display="flex" alignItems="center" mb={0.5}>
                                <TodayIcon
                                  sx={{
                                    mr: 0.5,
                                    fontSize: 14,
                                    color: isToday ? '#4caf50' : status === 'past' ? '#9E9E9E' : '#fb8c00'
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                  {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
                                </Typography>
                              </Box>

                              {holiday.description && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#616161',
                                    fontStyle: 'italic',
                                    fontSize: '0.7rem',
                                    mb: 0.5
                                  }}
                                >
                                  {holiday.description}
                                </Typography>
                              )}

                              {holiday.branch && (
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#455a64' }}>
                                  📍 <strong>{holiday.branch}</strong>
                                </Typography>
                              )}

                              {status === 'upcoming' && !isToday && (
                                <Box my={1}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(100, (1 - daysUntil / 365) * 100)}
                                    sx={{
                                      height: 4,
                                      borderRadius: 2,
                                      bgcolor: '#E0E0E0',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: '#fb8c00'
                                      }
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#fb8c00', mt: 0.2 }}>
                                    {daysUntil} day{daysUntil !== 1 ? 's' : ''} to go
                                  </Typography>
                                </Box>
                              )}

                              <Box mt={1} pt={0.5} borderTop="1px dashed #ccc" display="flex" justifyContent="space-between">
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999' }}>
                                  {status.toUpperCase()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.65rem',
                                    color: '#0288d1',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                  onClick={() => console.log('More Info')}
                                >
                                  More Info
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        </>
                      );
                    })}
                </Grid>
              </Box>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default UpcomingHolidayCard;
