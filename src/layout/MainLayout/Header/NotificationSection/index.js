import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconBell, IconX, IconCake, IconCalendarEvent, IconTicket, IconUserPlus, IconMail } from '@tabler/icons-react';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import dayjs from 'dayjs';
import { IconCalendar } from '@tabler/icons-react';

// Import notification sound
import notificationSound from '../../../../assets/sounds/positive-notification-alert-351299.mp3';

const NotificationSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [open, setOpen] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
  const [calendarNotifications, setCalendarNotifications] = useState([]);
  const [birthdayNotifications, setBirthdayNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const anchorRef = useRef(null);
  const audioRef = useRef(null);
  const seenNotificationIdsRef = useRef(new Set());
  const isFirstRender = useRef(true);
  const [todayJoiners, setTodayJoiners] = useState([]);
  const [upcomingJoiners, setUpcomingJoiners] = useState([]);
  const orgId = localStorage.getItem('orgId');
  const loginUserName = localStorage.getItem('userName');
  const empCode = localStorage.getItem('employeeCode');
  const branchCode = localStorage.getItem('branchCode');
  const [todayAnniversaries, setTodayAnniversaries] = useState([]);
  const userId = localStorage.getItem('userId');

  // Separate notifications by type
  const leaveNotifications = notificationList.filter((n) => n.notificationType === 'LEAVE REQUEST');
  const ticketCount = 0; // Tickets are now part of notificationList if they have TICKET type
  const calendarCount = calendarNotifications.length;
  const birthdayCount = birthdayNotifications.length;
  const anniversaryCount = todayAnniversaries.length;
  const newJoinerCount = todayJoiners.length;
  const upcomingJoinerCount = upcomingJoiners.length;
  const totalNotifications =
    notificationList.length + calendarCount + birthdayCount + anniversaryCount + newJoinerCount + upcomingJoinerCount;

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.5;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play sound when new notifications arrive
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentTotal =
      notificationList.length +
      calendarNotifications.length +
      birthdayNotifications.length +
      todayAnniversaries.length +
      todayJoiners.length +
      upcomingJoiners.length;

    if (currentTotal > 0 && !hasPlayedSound && !open) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.error('Failed to play notification sound:', error);
        });
        setHasPlayedSound(true);
      } catch (error) {
        console.error('Error with audio playback:', error);
      }
    }

    if (currentTotal === 0) {
      setHasPlayedSound(false);
    }
  }, [
    notificationList,
    calendarNotifications,
    birthdayNotifications,
    todayAnniversaries,
    todayJoiners,
    upcomingJoiners,
    open,
    hasPlayedSound
  ]);

  const fetchNewJoinerData = async () => {
    try {
      setIsLoading(true);
      const result = await apiCalls('get', `/basicmaster/GetnewJoineDetails?orgId=${orgId}`);

      if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
        const allJoiners = result.paramObjectsMap.employee;
        const today = dayjs();

        const todayList = [];
        const upcomingList = [];

        allJoiners.forEach((emp) => {
          if (!emp.joinDate) return;

          const joinDate = dayjs(emp.joinDate);
          const diffDays = joinDate.diff(today, 'day');

          if (joinDate.isSame(today, 'day')) {
            todayList.push({
              name: emp.employee || emp.employeecode || 'New Employee',
              initials: (emp.employee?.[0] || emp.employeecode?.[0] || 'N').toUpperCase(),
              employeeId: emp.employeecode || 'N/A',
              image: emp.profileImage || '',
              role: emp.designation || 'Employee',
              department: emp.department || '',
              joinDate: joinDate.format('MMM DD, YYYY')
            });
          } else if (diffDays > 0 && diffDays <= 7) {
            upcomingList.push({
              name: emp.employee || emp.employeecode || 'New Employee',
              employeeId: emp.employeecode || 'N/A',
              date: joinDate.format('MMM DD'),
              joinDate: joinDate.format('MMM DD, YYYY'),
              image: emp.profileImage || '',
              role: emp.designation || 'Employee',
              department: emp.department || '',
              daysUntil: diffDays
            });
          }
        });

        setTodayJoiners(todayList);
        setUpcomingJoiners(upcomingList);
      } else {
        setTodayJoiners([]);
        setUpcomingJoiners([]);
      }
    } catch (error) {
      console.error('Error fetching new joiner data:', error);
      setTodayJoiners([]);
      setUpcomingJoiners([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkAnniversaries = async () => {
    setIsLoading(true);
    try {
      const result = await apiCalls('get', `/basicmaster/Getworkaniversary?orgId=${orgId}`);
      if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
        const anniversaries = result.paramObjectsMap.employee.map((emp) => ({
          name: emp.employee || emp.employeecode || 'Employee',
          initials: (emp.employee?.[0] || emp.employeecode?.[0] || 'E').toUpperCase(),
          employeeId: emp.employeecode || emp.employeeid || 'N/A',
          role: emp.designation || 'Employee',
          gender: emp.gender || '',
          years: emp.noofyears || 0,
          image: emp.profileImage || '',
          department: emp.department || ''
        }));
        setTodayAnniversaries(anniversaries);
      } else {
        setTodayAnniversaries([]);
      }
    } catch (error) {
      console.error('Error fetching work anniversaries:', error);
      setTodayAnniversaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // New API: Get all notifications by userId
  const getAllNotifications = async () => {
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiCalls('get', `/notification/byUserId?userId=${userId}`);

      if (response?.status === true && response?.paramObjectsMap?.notificationVO) {
        // Filter out deleted notifications
        const activeNotifications = response.paramObjectsMap.notificationVO.filter((notification) => !notification.deleted);
        setNotificationList(activeNotifications);
      } else if (Array.isArray(response)) {
        setNotificationList(response.filter((n) => !n.deleted));
      } else {
        setNotificationList([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotificationList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear single notification
  const clearNotification = async (notificationId) => {
    try {
      const response = await apiCalls('put', `/notification/clear?id=${notificationId}`);
      if (response?.status === true) {
        // Remove the notification from the list
        setNotificationList((prev) => prev.filter((notification) => notification.id !== notificationId));
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!userId) return;

    try {
      const response = await apiCalls('put', `/notification/clearAll?userId=${userId}`);
      if (response?.status === true) {
        setNotificationList([]);
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const getCalendarNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiCalls(
        'get',
        `basicmaster/getCalendarNotificationByOrgId?branchCode=${branchCode}&empCode=${empCode}&orgId=${orgId}`
      );

      let calendarData = [];
      if (Array.isArray(response)) {
        calendarData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        calendarData = response.data;
      } else if (response?.paramObjectsMap?.calendarVO) {
        calendarData = response.paramObjectsMap.calendarVO;
      } else if (response?.data?.paramObjectsMap?.calendarVO) {
        calendarData = response.data.paramObjectsMap.calendarVO;
      } else if (response?.calendarNotifications) {
        calendarData = response.calendarNotifications;
      }

      const now = dayjs();
      const filteredEvents = calendarData.filter((event) => {
        if (!event.date) return false;
        const eventDate = dayjs(event.date);
        return eventDate.isSame(now, 'day') || eventDate.isAfter(now, 'day');
      });

      setCalendarNotifications(filteredEvents);
    } catch (error) {
      console.error('Error fetching calendar notifications:', error);
      setCalendarNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBirthdayNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiCalls('get', `basicmaster/getEmpDob?orgId=${orgId}`);

      let birthdayData = [];
      if (response?.status && response?.paramObjectsMap?.empDob) {
        birthdayData = response.paramObjectsMap.empDob;
      }

      const today = dayjs().format('MM-DD');
      const upcomingBirthdays = birthdayData
        .filter((item) => item.dob && dayjs(item.dob).format('MM-DD') === today)
        .map((item) => ({
          employeeName: item.empName || 'Unknown',
          empCode: item.empCode || '',
          dob: item.dob,
          profileImage: item.profileImage || ''
        }));

      setBirthdayNotifications(upcomingBirthdays);
    } catch (error) {
      console.error('Error fetching birthday notifications:', error);
      setBirthdayNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllNotifications();
    getCalendarNotifications();
    getBirthdayNotifications();
    if (orgId) {
      fetchWorkAnniversaries();
      fetchNewJoinerData();
    }
  }, [orgId, loginUserName, empCode, branchCode, userId]);

  const handleToggle = () => {
    if (!open) {
      getAllNotifications();
      getCalendarNotifications();
      getBirthdayNotifications();
      fetchWorkAnniversaries();
      fetchNewJoinerData();
    }
    setOpen((prev) => !prev);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleClear = async (identifier, type, clear) => {
    try {
      setIsLoading(true);
      if (type === 'notification') {
        if (clear === 'clearAll') {
          await clearAllNotifications();
        } else {
          await clearNotification(identifier);
        }
      } else if (type === 'calendar') {
        if (clear === 'clearAll') {
          setCalendarNotifications([]);
        } else {
          setCalendarNotifications((prev) => prev.filter((_, idx) => idx !== identifier));
        }
      } else if (type === 'birthday') {
        if (clear === 'clearAll') {
          setBirthdayNotifications([]);
        } else {
          setBirthdayNotifications((prev) => prev.filter((_, idx) => idx !== identifier));
        }
      } else if (type === 'anniversary') {
        if (clear === 'clearAll') {
          setTodayAnniversaries([]);
        } else {
          setTodayAnniversaries((prev) => prev.filter((_, idx) => idx !== identifier));
        }
      } else if (type === 'joiner') {
        if (clear === 'clearAll') {
          setTodayJoiners([]);
          setUpcomingJoiners([]);
        } else {
          setTodayJoiners((prev) => prev.filter((_, idx) => idx !== identifier));
          setUpcomingJoiners((prev) => prev.filter((_, idx) => idx !== identifier));
        }
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    handleClear(null, 'notification', 'clearAll');
    handleClear(null, 'calendar', 'clearAll');
    handleClear(null, 'birthday', 'clearAll');
    handleClear(null, 'anniversary', 'clearAll');
    handleClear(null, 'joiner', 'clearAll');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatDob = (dobString) => {
    if (!dobString) return 'Unknown date';
    try {
      const dobDate = new Date(dobString);
      return dobDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dobString;
    }
  };

  const getRelativeDate = (dateString) => {
    if (!dateString) return '';
    const date = dayjs(dateString);
    const today = dayjs().startOf('day');
    if (date.isSame(today, 'day')) {
      return 'Today';
    } else if (date.isSame(today.add(1, 'day'), 'day')) {
      return 'Tomorrow';
    } else {
      return date.format('MMM D');
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      return dayjs(dateTimeString, 'DD-MM-YYYY HH:mm:ss A').format('MMM D, h:mm A');
    } catch (e) {
      return dateTimeString;
    }
  };

  return (
    <>
      <Box sx={{ ml: 1, [theme.breakpoints.down('md')]: { mr: 0 } }}>
        <IconButton ref={anchorRef} onClick={handleToggle} size="large">
          <Badge color="error" badgeContent={totalNotifications}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                color: '#fff',
                borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.28)'
                }
              }}
            >
              <IconBell stroke={1.5} size="1.3rem" />
            </Avatar>
          </Badge>
        </IconButton>
      </Box>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [matchesXs ? 5 : 0, 20] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              sx={{
                width: 440,
                overflow: 'hidden',
                borderRadius: '24px',
                border: '1px solid rgba(58,107,109,0.15)',
                background: '#fff',
                boxShadow: '0 20px 45px rgba(15,23,42,0.15)'
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={0} content={false}>
                  <Box sx={{ px: 2, pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600
                        }}
                      >
                        Notifications
                      </Typography>
                      {totalNotifications > 0 && (
                        <Button
                          size="small"
                          onClick={handleClearAll}
                          sx={{
                            color: '#64748b',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(220, 38, 38, 0.15)',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,

                            '&:hover': {
                              color: '#dc2626',
                              backgroundColor: 'rgba(220, 38, 38, 0.08)',
                              borderColor: 'rgba(220, 38, 38, 0.25)',
                              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.12)'
                            }
                          }}
                        >
                          Clear All
                        </Button>
                      )}
                    </Stack>

                    {totalNotifications > 0 && (
                      <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 1 }} flexWrap="wrap">
                        {/* Notifications */}
                        {notificationList.length > 0 && (
                          <Chip
                            icon={<IconMail size={16} />}
                            label={`${notificationList.length} Notification${notificationList.length > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              backgroundColor: '#E8F0FF',
                              color: '#1E40AF',
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: '#1E40AF' }
                            }}
                          />
                        )}

                        {/* Calendar Events */}
                        {calendarCount > 0 && (
                          <Chip
                            icon={<IconCalendarEvent size={16} />}
                            label={`${calendarCount} Event${calendarCount > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              backgroundColor: '#F3E8FF',
                              color: '#6D28D9',
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: '#6D28D9' }
                            }}
                          />
                        )}

                        {/* Birthday */}
                        {birthdayCount > 0 && (
                          <Chip
                            icon={<IconCake size={16} />}
                            label={`${birthdayCount} Birthday${birthdayCount > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              backgroundColor: '#FFE4E6',
                              color: '#BE123C',
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: '#BE123C' }
                            }}
                          />
                        )}

                        {/* Anniversary */}
                        {anniversaryCount > 0 && (
                          <Chip
                            icon={<IconCalendar size={16} />}
                            label={`${anniversaryCount} Anniversary${anniversaryCount > 1 ? 'ies' : ''}`}
                            size="small"
                            sx={{
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: '#166534' }
                            }}
                          />
                        )}

                        {/* New Joiner */}
                        {newJoinerCount > 0 && (
                          <Chip
                            icon={<IconUserPlus size={16} />}
                            label={`${newJoinerCount} New Joiner${newJoinerCount > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              backgroundColor: '#CCFBF1',
                              color: '#0F766E',
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: '#0F766E' }
                            }}
                          />
                        )}

                        {/* Upcoming Joiner */}
                        {upcomingJoinerCount > 0 && (
                          <Chip
                            icon={<IconUserPlus size={16} />}
                            label={`${upcomingJoinerCount} Upcoming`}
                            size="small"
                            sx={{
                              backgroundColor: '#F1F5F9',
                              color: '#334155',
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: '#334155' }
                            }}
                          />
                        )}
                      </Stack>
                    )}
                  </Box>

                  <Divider sx={{ mt: 1 }} />

                  <Box
                    sx={{
                      maxHeight: 500,
                      overflowY: 'auto',
                      px: 2,
                      '&::-webkit-scrollbar': {
                        width: '6px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#94a3b8',
                        borderRadius: '10px'
                      }
                    }}
                  >
                    {isLoading ? (
                      <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
                        <CircularProgress size={24} />
                      </Stack>
                    ) : totalNotifications === 0 ? (
                      <Typography variant="body2" align="center" sx={{ py: 5 }}>
                        No new notifications
                      </Typography>
                    ) : (
                      <>
                        {/* General Notifications from API */}
                        {notificationList.length > 0 && (
                          <>
                            {/* Header */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                mt: 2,
                                mb: 2,
                                px: 2,
                                py: 1.2,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(15,23,42,0.06)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <IconMail size={18} color="#2a4b4d" />
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: '#0f172a',
                                    letterSpacing: 0.2
                                  }}
                                >
                                  Notifications
                                </Typography>
                              </Stack>

                              <Chip
                                size="small"
                                label={notificationList.length}
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(42,75,77,0.08)',
                                  color: '#2a4b4d',
                                  border: '1px solid rgba(42,75,77,0.15)'
                                }}
                              />
                            </Stack>

                            {/* List */}
                            {notificationList.map((item, index) => {
                              let icon = <IconMail size={18} color="#64748b" />;
                              let tone = '#64748b';

                              if (item.notificationType === 'LEAVE REQUEST') {
                                icon = <IconCalendar size={18} color="#f59e0b" />;
                                tone = '#f59e0b';
                              } else if (item.notificationType === 'TICKET') {
                                icon = <IconTicket size={18} color="#3b82f6" />;
                                tone = '#3b82f6';
                              }

                              return (
                                <NotificationItem
                                  key={`notification-${item.id || index}`}
                                  icon={
                                    <Box
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(15,23,42,0.03)'
                                      }}
                                    >
                                      {icon}
                                    </Box>
                                  }
                                  title={
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        color: '#0f172a'
                                      }}
                                    >
                                      {item.notificationType || 'Notification'}
                                    </Typography>
                                  }
                                  description={
                                    <Typography
                                      sx={{
                                        color: '#475569',
                                        fontSize: '0.85rem',
                                        mt: 0.3
                                      }}
                                    >
                                      {item.message || 'No description available'}
                                    </Typography>
                                  }
                                  meta={
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                      <Chip
                                        size="small"
                                        label={item.notificationType || 'General'}
                                        sx={{
                                          height: 20,
                                          fontSize: '0.65rem',
                                          fontWeight: 600,
                                          bgcolor: `${tone}15`,
                                          color: tone
                                        }}
                                      />

                                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.createdBy || 'System'}</Typography>

                                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                        {formatDateTime(item.commonDate?.createdon)}
                                      </Typography>

                                      {!item.read && (
                                        <Chip
                                          label="New"
                                          sx={{
                                            height: 14,
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            bgcolor: 'rgba(239,68,68,0.08)',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            '& .MuiChip-label': {
                                              px: 0.5
                                            }
                                          }}
                                        />
                                      )}
                                    </Stack>
                                  }
                                  onClear={() => handleClear(item.id, 'notification', 'clear')}
                                  sx={{
                                    mb: 1,
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    border: '1px solid rgba(15,23,42,0.06)',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                                      borderColor: 'rgba(15,23,42,0.1)'
                                    }
                                  }}
                                />
                              );
                            })}
                          </>
                        )}

                        {calendarCount > 0 && (
                          <>
                            {/* Header (same pattern as Notifications) */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                mt: 2,
                                mb: 2,
                                px: 2,
                                py: 1.2,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(15,23,42,0.06)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <IconCalendarEvent size={18} color="#2a4b4d" />
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: '#0f172a',
                                    letterSpacing: 0.2
                                  }}
                                >
                                  Calendar Events
                                </Typography>
                              </Stack>

                              <Chip
                                size="small"
                                label={calendarCount}
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(42,75,77,0.08)',
                                  color: '#2a4b4d',
                                  border: '1px solid rgba(42,75,77,0.15)'
                                }}
                              />
                            </Stack>

                            {/* List */}
                            {calendarNotifications.map((item, index) => {
                              const formattedTime =
                                item.fromTime && item.toTime ? `${formatTime(item.fromTime)} - ${formatTime(item.toTime)}` : 'All day';

                              return (
                                <NotificationItem
                                  key={`calendar-${item.id || index}`}
                                  icon={
                                    <Box
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(42,75,77,0.06)'
                                      }}
                                    >
                                      <IconCalendarEvent size={18} color="#2a4b4d" />
                                    </Box>
                                  }
                                  title={
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        color: '#0f172a'
                                      }}
                                    >
                                      {item.eventTitle || 'Event'}
                                    </Typography>
                                  }
                                  description={
                                    <Typography
                                      sx={{
                                        color: '#475569',
                                        fontSize: '0.85rem',
                                        mt: 0.3
                                      }}
                                    >
                                      {item.description || 'No description available'}
                                    </Typography>
                                  }
                                  meta={
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                      <Chip
                                        size="small"
                                        label={formattedTime}
                                        sx={{
                                          height: 20,
                                          fontSize: '0.65rem',
                                          fontWeight: 600,
                                          backgroundColor: '#F1F5F9',
                                          color: '#334155'
                                        }}
                                      />

                                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        {item.branchName || 'Not specified'}
                                      </Typography>

                                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>{getRelativeDate(item.date)}</Typography>

                                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.createdBy || 'Unknown'}</Typography>
                                    </Stack>
                                  }
                                  onClear={() => handleClear(index, 'calendar', 'clear')}
                                  sx={{
                                    mb: 1,
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    border: '1px solid rgba(15,23,42,0.06)',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                                      borderColor: 'rgba(15,23,42,0.1)'
                                    }
                                  }}
                                />
                              );
                            })}
                          </>
                        )}

                        {birthdayCount > 0 && (
                          <>
                            {/* Header (glass style like others) */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                mt: 2,
                                mb: 2,
                                px: 2,
                                py: 1.2,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(15,23,42,0.06)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <IconCake size={18} color="#2a4b4d" />
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: '#0f172a',
                                    letterSpacing: 0.2
                                  }}
                                >
                                  Today's Birthdays
                                </Typography>
                              </Stack>

                              <Chip
                                size="small"
                                label={`${birthdayCount} ${birthdayCount > 1 ? 'Birthdays' : 'Birthday'}`}
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(42,75,77,0.08)',
                                  color: '#2a4b4d',
                                  border: '1px solid rgba(42,75,77,0.15)'
                                }}
                              />
                            </Stack>

                            {/* List */}
                            {birthdayNotifications.map((item, index) => (
                              <NotificationItem
                                key={`birthday-${item.id || index}`}
                                icon={
                                  item.profileImage ? (
                                    <Avatar
                                      src={`data:image/jpeg;base64,${item.profileImage}`}
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        border: '2px solid rgba(42,75,77,0.25)'
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(42,75,77,0.08)'
                                      }}
                                    >
                                      <IconCake size={18} color="#2a4b4d" />
                                    </Box>
                                  )
                                }
                                title={
                                  <Stack>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        color: '#0f172a'
                                      }}
                                    >
                                      {item.employeeName}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: '0.7rem',
                                        color: '#64748b'
                                      }}
                                    >
                                      {item.empCode}
                                    </Typography>
                                  </Stack>
                                }
                                description={
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <IconCake size={16} color="#2a4b4d" />
                                    <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>{formatDob(item.dob)}</Typography>
                                  </Stack>
                                }
                                meta={
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      size="small"
                                      label="Birthday"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        backgroundColor: '#FCE7F3',
                                        color: '#9D174D'
                                      }}
                                    />

                                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>Today</Typography>
                                  </Stack>
                                }
                                onClear={() => handleClear(index, 'birthday', 'clear')}
                                sx={{
                                  mb: 1,
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  border: '1px solid rgba(15,23,42,0.06)',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                                    borderColor: 'rgba(15,23,42,0.1)'
                                  }
                                }}
                              />
                            ))}
                          </>
                        )}

                        {anniversaryCount > 0 && (
                          <>
                            {/* Header (matched to Notifications style) */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                mt: 2,
                                mb: 2,
                                px: 2,
                                py: 1.2,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(15,23,42,0.06)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <IconCalendar size={18} color="#2a4b4d" />
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: '#0f172a',
                                    letterSpacing: 0.2
                                  }}
                                >
                                  Work Anniversaries
                                </Typography>
                              </Stack>

                              <Chip
                                size="small"
                                label={anniversaryCount}
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(42,75,77,0.08)',
                                  color: '#2a4b4d',
                                  border: '1px solid rgba(42,75,77,0.15)'
                                }}
                              />
                            </Stack>

                            {/* List */}
                            {todayAnniversaries.map((item, index) => (
                              <NotificationItem
                                key={`anniversary-${index}`}
                                icon={
                                  <Box
                                    sx={{
                                      width: 38,
                                      height: 38,
                                      borderRadius: 2,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'rgba(22, 101, 52, 0.08)',
                                      border: '1px solid rgba(22, 101, 52, 0.15)'
                                    }}
                                  >
                                    {item.image ? (
                                      <Avatar
                                        src={`data:image/jpeg;base64,${item.image}`}
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          border: '2px solid rgba(42,75,77,0.3)'
                                        }}
                                      />
                                    ) : (
                                      <Avatar
                                        sx={{
                                          width: 28,
                                          height: 28,
                                          bgcolor: 'transparent',
                                          color: '#166534',
                                          fontSize: '0.95rem',
                                          fontWeight: 600
                                        }}
                                      >
                                        {item.initials}
                                      </Avatar>
                                    )}
                                  </Box>
                                }
                                title={
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: '0.8rem',
                                      color: '#0f172a'
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                }
                                description={
                                  <Typography
                                    sx={{
                                      color: '#475569',
                                      fontSize: '0.85rem',
                                      mt: 0.3
                                    }}
                                  >
                                    {item.years} year{item.years !== 1 ? 's' : ''} at company
                                  </Typography>
                                }
                                meta={
                                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Chip
                                      size="small"
                                      label="Anniversary"
                                      sx={{
                                        height: 22,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,

                                        backgroundColor: '#DCFCE7',
                                        color: '#166534',

                                        border: '1px solid rgba(22, 101, 52, 0.15)',

                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />

                                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                                      {item.department} • {item.role}
                                    </Typography>
                                  </Stack>
                                }
                                onClear={() => handleClear(index, 'anniversary', 'clear')}
                                sx={{
                                  mb: 1,
                                  borderRadius: 2,
                                  border: '1px solid rgba(15,23,42,0.06)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                                    borderColor: 'rgba(15,23,42,0.1)'
                                  }
                                }}
                              />
                            ))}
                          </>
                        )}

                        {newJoinerCount > 0 && (
                          <>
                            {/* Header (glass unified style) */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                mt: 2,
                                mb: 2,
                                px: 2,
                                py: 1.2,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(15,23,42,0.06)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <IconUserPlus size={18} color="#2a4b4d" />
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: '#0f172a',
                                    letterSpacing: 0.2
                                  }}
                                >
                                  New Joiners Today
                                </Typography>
                              </Stack>

                              <Chip
                                size="small"
                                label={`${newJoinerCount} New`}
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(42,75,77,0.08)',
                                  color: '#2a4b4d',
                                  border: '1px solid rgba(42,75,77,0.15)'
                                }}
                              />
                            </Stack>

                            {/* List */}
                            {todayJoiners.map((item, index) => (
                              <NotificationItem
                                key={`today-joiner-${item.id || index}`}
                                icon={
                                  item.image ? (
                                    <Avatar
                                      src={`data:image/jpeg;base64,${item.image}`}
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        border: '2px solid rgba(42,75,77,0.25)'
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(42,75,77,0.08)',
                                        fontWeight: 600,
                                        color: '#2a4b4d',
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      {item.initials}
                                    </Box>
                                  )
                                }
                                title={
                                  <Stack>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        color: '#0f172a'
                                      }}
                                    >
                                      {item.name}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: '0.7rem',
                                        color: '#64748b'
                                      }}
                                    >
                                      {item.employeeId}
                                    </Typography>
                                  </Stack>
                                }
                                description={
                                  <Typography
                                    sx={{
                                      fontSize: '0.85rem',
                                      color: '#475569'
                                    }}
                                  >
                                    Joined today
                                  </Typography>
                                }
                                meta={
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      size="small"
                                      label={item.department}
                                      sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        bgcolor: 'rgba(42,75,77,0.08)',
                                        color: '#2a4b4d'
                                      }}
                                    />

                                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.role}</Typography>
                                  </Stack>
                                }
                                onClear={() => handleClear(index, 'joiner', 'clear')}
                                sx={{
                                  mb: 1,
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  border: '1px solid rgba(15,23,42,0.06)',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                                    borderColor: 'rgba(15,23,42,0.1)'
                                  }
                                }}
                              />
                            ))}
                          </>
                        )}

                        {upcomingJoinerCount > 0 && (
                          <>
                            {/* Header (glass unified style) */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                mt: 2,
                                mb: 2,
                                px: 2,
                                py: 1.2,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(15,23,42,0.06)'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <IconUserPlus size={18} color="#2a4b4d" />
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: '#0f172a',
                                    letterSpacing: 0.2
                                  }}
                                >
                                  Upcoming Joiners
                                </Typography>
                              </Stack>

                              <Chip
                                size="small"
                                label={`${upcomingJoinerCount} Upcoming`}
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(42,75,77,0.08)',
                                  color: '#2a4b4d',
                                  border: '1px solid rgba(42,75,77,0.15)'
                                }}
                              />
                            </Stack>

                            {/* List */}
                            {upcomingJoiners.map((item, index) => (
                              <NotificationItem
                                key={`upcoming-joiner-${item.id || index}`}
                                icon={
                                  item.image ? (
                                    <Avatar
                                      src={`data:image/jpeg;base64,${item.image}`}
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        border: '2px solid rgba(42,75,77,0.25)'
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(42,75,77,0.06)',
                                        color: '#2a4b4d',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                      }}
                                    >
                                      {item.initials}
                                    </Box>
                                  )
                                }
                                title={
                                  <Stack>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        color: '#0f172a'
                                      }}
                                    >
                                      {item.name}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: '0.7rem',
                                        color: '#64748b'
                                      }}
                                    >
                                      {item.employeeId}
                                    </Typography>
                                  </Stack>
                                }
                                description={
                                  <Typography
                                    sx={{
                                      fontSize: '0.85rem',
                                      color: '#475569'
                                    }}
                                  >
                                    Joining in {item.daysUntil} day{item.daysUntil !== 1 ? 's' : ''} • {item.joinDate}
                                  </Typography>
                                }
                                meta={
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      size="small"
                                      label={item.department}
                                      sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        bgcolor: 'rgba(42,75,77,0.08)',
                                        color: '#2a4b4d'
                                      }}
                                    />

                                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.role}</Typography>
                                  </Stack>
                                }
                                onClear={() => handleClear(index, 'joiner', 'clear')}
                                sx={{
                                  mb: 1,
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  border: '1px solid rgba(15,23,42,0.06)',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                                    borderColor: 'rgba(15,23,42,0.1)'
                                  }
                                }}
                              />
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </Box>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

const NotificationItem = ({ icon, title, description, meta, onClear, sx }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(58,107,109,0.15)',
        boxShadow: '0 8px 24px rgba(58,107,109,0.08)',
        transition: 'all 0.25s ease',

        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        width: '100%',

        '&:hover': {
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef6f6 100%)',
          borderColor: '#3a6b6d',
          transform: 'translateY(-2px)',
          boxShadow: '0 14px 30px rgba(58,107,109,0.18)'
        },

        ...sx
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          flex: 1,
          minWidth: 0,
          alignItems: 'flex-start'
        }}
      >
        <Box sx={{ pt: 0.5 }}>{icon}</Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {typeof title === 'string' ? (
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{
                color: '#2a4b4d'
              }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}

          {description && (
            <Box sx={{ mt: 0.5 }}>
              {typeof description === 'string' ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569'
                  }}
                >
                  {description}
                </Typography>
              ) : (
                description
              )}
            </Box>
          )}

          {meta && (
            <Box sx={{ mt: 0.25, lineHeight: 1.2 }}>
              {typeof meta === 'string' ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.68rem',
                    lineHeight: 1.2
                  }}
                >
                  {meta}
                </Typography>
              ) : (
                meta
              )}
            </Box>
          )}
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          flexShrink: 0
        }}
      >
        <Tooltip title="Clear">
          <IconButton
            size="small"
            onClick={onClear}
            sx={{
              flexShrink: 0,
              alignSelf: 'flex-start',
              p: 0.5,
              mt: -0.5,
              color: '#3a6b6d',
              borderRadius: '10px',

              '&:hover': {
                color: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.12)'
              }
            }}
          >
            <IconX size="1rem" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default NotificationSection;
