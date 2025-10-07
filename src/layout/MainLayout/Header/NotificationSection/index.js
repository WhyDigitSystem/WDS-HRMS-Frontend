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
import { IconBell, IconX, IconCake, IconCalendarEvent, IconTicket, IconUserPlus } from '@tabler/icons-react';
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

  // Notification type counts
  const ticketCount = notificationList.length;
  const calendarCount = calendarNotifications.length;
  const birthdayCount = birthdayNotifications.length;
  const anniversaryCount = todayAnniversaries.length;
  const newJoinerCount = todayJoiners.length;
  const upcomingJoinerCount = upcomingJoiners.length;
  const totalNotifications = ticketCount + calendarCount + birthdayCount + anniversaryCount + newJoinerCount + upcomingJoinerCount;

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

    const currentTotal = notificationList.length + calendarNotifications.length +
      birthdayNotifications.length + todayAnniversaries.length + todayJoiners.length + upcomingJoiners.length;

    if (currentTotal > 0 && !hasPlayedSound && !open) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
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
  }, [notificationList, calendarNotifications, birthdayNotifications, todayAnniversaries, todayJoiners, upcomingJoiners, open, hasPlayedSound]);

  const fetchNewJoinerData = async () => {
    try {
      setIsLoading(true);
      const result = await apiCalls('get', `/basicmaster/GetnewJoineDetails?orgId=${orgId}`);
      
      if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
        const allJoiners = result.paramObjectsMap.employee;
        const today = dayjs();

        const todayList = [];
        const upcomingList = [];

        allJoiners.forEach(emp => {
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
        const anniversaries = result.paramObjectsMap.employee.map(emp => ({
          name: emp.employee || emp.employeecode || 'Employee',
          initials: (emp.employee?.[0] || emp.employeecode?.[0] || 'E').toUpperCase(),
          employeeId: emp.employeecode || emp.employeeid || 'N/A',
          role: emp.designation || 'Employee',
          gender: emp.gender || '',
          years: emp.noofyears || 0,
          image: emp.profileImage || '',
          department: emp.department || '',
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

  const getAllNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiCalls(
        'get',
        `ticketcontroller/getTicketNotification?orgId=${orgId}&userName=${loginUserName}`
      );
      if (response?.status === true) {
        setNotificationList(response.paramObjectsMap?.ticketVOs || []);
      }
    } catch (error) {
      console.error('Error fetching ticket notifications:', error);
    } finally {
      setIsLoading(false);
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
      const filteredEvents = calendarData.filter(event => {
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
        .filter(item => item.dob && dayjs(item.dob).format('MM-DD') === today)
        .map(item => ({
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
  }, [orgId, loginUserName, empCode, branchCode]);

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
      if (type === 'ticket') {
        if (clear === 'clearAll') {
          setNotificationList([]);
        } else {
          setNotificationList(prev => prev.filter((_, idx) => idx !== identifier));
        }
      } else if (type === 'calendar') {
        if (clear === 'clearAll') {
          setCalendarNotifications([]);
        } else {
          setCalendarNotifications(prev => prev.filter((_, idx) => idx !== identifier));
        }
      } else if (type === 'birthday') {
        if (clear === 'clearAll') {
          setBirthdayNotifications([]);
        } else {
          setBirthdayNotifications(prev => prev.filter((_, idx) => idx !== identifier));
        }
      } else if (type === 'anniversary') {
        if (clear === 'clearAll') {
          setTodayAnniversaries([]);
        } else {
          setTodayAnniversaries(prev => prev.filter((_, idx) => idx !== identifier));
        }
      } else if (type === 'joiner') {
        if (clear === 'clearAll') {
          setTodayJoiners([]);
          setUpcomingJoiners([]);
        } else {
          setTodayJoiners(prev => prev.filter((_, idx) => idx !== identifier));
          setUpcomingJoiners(prev => prev.filter((_, idx) => idx !== identifier));
        }
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    handleClear(null, 'ticket', 'clearAll');
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

  return (
    <>
      <Box sx={{ ml: 1, [theme.breakpoints.down('md')]: { mr: 0 } }}>
        <IconButton ref={anchorRef} onClick={handleToggle} size="large">
          <Badge color="error" badgeContent={totalNotifications}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.dark,
                '&:hover': {
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.light,
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
            <Paper sx={{ width: 380, borderRadius: 2, boxShadow: 6 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={0} content={false}>
                  <Box sx={{ px: 2, pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Notifications</Typography>
                      {totalNotifications > 0 && (
                        <Button color="error" size="small" onClick={handleClearAll}>
                          Clear All
                        </Button>
                      )}
                    </Stack>

                    {totalNotifications > 0 && (
                      <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 1 }} flexWrap="wrap">
                        {ticketCount > 0 && (
                          <Chip
                            icon={<IconTicket size={16} />}
                            label={`${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
                            color="info"
                            size="small"
                          />
                        )}
                        {calendarCount > 0 && (
                          <Chip
                            icon={<IconCalendarEvent size={16} />}
                            label={`${calendarCount} Event${calendarCount > 1 ? 's' : ''}`}
                            color="secondary"
                            size="small"
                          />
                        )}
                        {birthdayCount > 0 && (
                          <Chip
                            icon={<IconCake size={16} />}
                            label={`${birthdayCount} Birthday${birthdayCount > 1 ? 's' : ''}`}
                            color="warning"
                            size="small"
                          />
                        )}
                        {anniversaryCount > 0 && (
                          <Chip
                            icon={<IconCalendar size={16} />}
                            label={`${anniversaryCount} Anniversary${anniversaryCount > 1 ? 'ies' : ''}`}
                            color="success"
                            size="small"
                          />
                        )}
                        {newJoinerCount > 0 && (
                          <Chip
                            icon={<IconUserPlus size={16} />}
                            label={`${newJoinerCount} New Joiner${newJoinerCount > 1 ? 's' : ''}`}
                            color="primary"
                            size="small"
                          />
                        )}
                        {upcomingJoinerCount > 0 && (
                          <Chip
                            icon={<IconUserPlus size={16} />}
                            label={`${upcomingJoinerCount} Upcoming`}
                            color="default"
                            size="small"
                          />
                        )}
                      </Stack>
                    )}
                  </Box>

                  <Divider sx={{ mt: 1 }} />

                  <Box sx={{ maxHeight: 400, overflowY: 'auto', px: 2 }}>
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
                        {ticketCount > 0 && (
                          <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1 }}>
                              <IconTicket size={20} color={theme.palette.info.main} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Ticket Notifications
                              </Typography>
                            </Stack>
                            {notificationList.map((item, index) => (
                              <NotificationItem
                                key={`ticket-${item.ticketId || index}`}
                                icon={<IconTicket size={18} color={theme.palette.info.main} />}
                                title={item.subject || 'Ticket Notification'}
                                description={item.description || 'No description available'}
                                meta={
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip size="small" label="Ticket" color="info" />
                                    <Chip
                                      size="small"
                                      label={item.status || 'Unknown'}
                                      color={
                                        item.status === 'Open'
                                          ? 'primary'
                                          : item.status === 'Closed'
                                            ? 'success'
                                            : 'warning'
                                      }
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      by {item.createdBy || 'Unknown'}
                                    </Typography>
                                  </Stack>
                                }
                                onClear={() => handleClear(index, 'ticket', 'clear')}
                              />
                            ))}
                          </>
                        )}

                        {calendarCount > 0 && (
                          <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1 }}>
                              <IconCalendarEvent size={20} color={theme.palette.secondary.main} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Calendar Events
                              </Typography>
                            </Stack>
                            {calendarNotifications.map((item, index) => {
                              const formattedDate = item.date ? dayjs(item.date).format('MMM D, YYYY') : 'Unknown date';
                              const formattedTime = item.fromTime && item.toTime
                                ? `${formatTime(item.fromTime)} - ${formatTime(item.toTime)}`
                                : 'All day';

                              return (
                                <NotificationItem
                                  key={`calendar-${index}`}
                                  icon={<IconCalendarEvent size={18} color={theme.palette.secondary.main} />}
                                  title={item.eventTitle || 'Event'}
                                  description={item.description || 'No description'}
                                  meta={
                                    <Stack direction="column" spacing={0.5} alignItems="flex-start">
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        <strong>When:</strong> {getRelativeDate(item.date)} • {formattedTime}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        <strong>Where:</strong> {item.branchName || 'Not specified'}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        <strong>Organizer:</strong> {item.createdBy || 'Unknown'}
                                      </Typography>
                                    </Stack>
                                  }
                                  onClear={() => handleClear(index, 'calendar', 'clear')}
                                />
                              );
                            })}
                          </>
                        )}

                        {birthdayCount > 0 && (
                          <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{
                              mt: 2,
                              mb: 1,
                              p: 1,
                              backgroundColor: theme.palette.warning.light,
                              borderRadius: 1
                            }}>
                              <IconCake size={20} color={theme.palette.warning.dark} />
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: theme.palette.warning.dark
                              }}>
                                Today's Birthdays
                              </Typography>
                              <Chip
                                label={`${birthdayCount} ${birthdayCount > 1 ? 'Birthdays' : 'Birthday'}`}
                                size="small"
                                sx={{
                                  ml: 'auto',
                                  backgroundColor: theme.palette.warning.main,
                                  color: '#fff'
                                }}
                              />
                            </Stack>

                            {birthdayNotifications.map((item, index) => (
                              <NotificationItem
                                key={`birthday-${index}`}
                                icon={
                                  item.profileImage ? (
                                    <Avatar
                                      src={`data:image/jpeg;base64,${item.profileImage}`}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        border: `2px solid ${theme.palette.warning.main}`
                                      }}
                                    />
                                  ) : (
                                    <Avatar sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: theme.palette.warning.light,
                                      color: theme.palette.warning.dark,
                                      border: `2px solid ${theme.palette.warning.main}`
                                    }}>
                                      <IconCake size={20} />
                                    </Avatar>
                                  )
                                }
                                title={
                                  <Stack>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                      {item.employeeName}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {item.empCode}
                                    </Typography>
                                  </Stack>
                                }
                                description={
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <IconCake size={16} color={theme.palette.warning.main} />
                                    <Typography variant="body2">
                                      {formatDob(item.dob)}
                                    </Typography>
                                  </Stack>
                                }
                                meta={null}
                                onClear={() => handleClear(index, 'birthday', 'clear')}
                                sx={{
                                  borderLeft: `4px solid ${theme.palette.warning.main}`,
                                  backgroundColor: theme.palette.warning.lighter
                                }}
                              />
                            ))}
                          </>
                        )}

                        {anniversaryCount > 0 && (
                          <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{
                              mt: 2,
                              mb: 1,
                              p: 1,
                              backgroundColor: theme.palette.success.light,
                              borderRadius: 1
                            }}>
                              <IconCalendar size={20} color={theme.palette.success.dark} />
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: theme.palette.success.dark
                              }}>
                                Work Anniversaries
                              </Typography>
                              <Chip
                                label={`${anniversaryCount} ${anniversaryCount > 1 ? 'Anniversaries' : 'Anniversary'}`}
                                size="small"
                                sx={{
                                  ml: 'auto',
                                  backgroundColor: theme.palette.success.main,
                                  color: '#fff'
                                }}
                              />
                            </Stack>

                            {todayAnniversaries.map((item, index) => (
                              <NotificationItem
                                key={`anniversary-${index}`}
                                icon={
                                  item.image ? (
                                    <Avatar
                                      src={`data:image/jpeg;base64,${item.image}`}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        border: `2px solid ${theme.palette.success.main}`
                                      }}
                                    />
                                  ) : (
                                    <Avatar sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: theme.palette.success.light,
                                      color: theme.palette.success.dark,
                                      border: `2px solid ${theme.palette.success.main}`
                                    }}>
                                      {item.initials}
                                    </Avatar>
                                  )
                                }
                                title={
                                  <Stack>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                      {item.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {item.employeeId}
                                    </Typography>
                                  </Stack>
                                }
                                description={
                                  <Typography variant="body2">
                                    {item.years} year{item.years !== 1 ? 's' : ''} at company
                                  </Typography>
                                }
                                meta={
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {item.department} • {item.role}
                                  </Typography>
                                }
                                onClear={() => handleClear(index, 'anniversary', 'clear')}
                                sx={{
                                  borderLeft: `4px solid ${theme.palette.success.main}`,
                                  backgroundColor: theme.palette.success.lighter
                                }}
                              />
                            ))}
                          </>
                        )}

                        {newJoinerCount > 0 && (
                          <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{
                              mt: 2,
                              mb: 1,
                              p: 1,
                              backgroundColor: theme.palette.primary.light,
                              borderRadius: 1
                            }}>
                              <IconUserPlus size={20} color={theme.palette.primary.dark} />
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.dark
                              }}>
                                New Joiners Today
                              </Typography>
                              <Chip
                                label={`${newJoinerCount} New`}
                                size="small"
                                sx={{
                                  ml: 'auto',
                                  backgroundColor: theme.palette.primary.main,
                                  color: '#fff'
                                }}
                              />
                            </Stack>

                            {todayJoiners.map((item, index) => (
                              <NotificationItem
                                key={`today-joiner-${index}`}
                                icon={
                                  item.image ? (
                                    <Avatar
                                      src={`data:image/jpeg;base64,${item.image}`}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        border: `2px solid ${theme.palette.primary.main}`
                                      }}
                                    />
                                  ) : (
                                    <Avatar sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: theme.palette.primary.light,
                                      color: theme.palette.primary.dark,
                                      border: `2px solid ${theme.palette.primary.main}`
                                    }}>
                                      {item.initials}
                                    </Avatar>
                                  )
                                }
                                title={
                                  <Stack>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                      {item.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {item.employeeId}
                                    </Typography>
                                  </Stack>
                                }
                                description={
                                  <Typography variant="body2">
                                    Joined today
                                  </Typography>
                                }
                                meta={
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {item.department} • {item.role}
                                  </Typography>
                                }
                                onClear={() => handleClear(index, 'joiner', 'clear')}
                                sx={{
                                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                                  backgroundColor: theme.palette.primary.lighter
                                }}
                              />
                            ))}
                          </>
                        )}

                        {upcomingJoinerCount > 0 && (
                          <>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{
                              mt: 2,
                              mb: 1,
                              p: 1,
                              backgroundColor: theme.palette.grey[200],
                              borderRadius: 1
                            }}>
                              <IconUserPlus size={20} color={theme.palette.grey[800]} />
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: theme.palette.grey[800]
                              }}>
                                Upcoming Joiners
                              </Typography>
                              <Chip
                                label={`${upcomingJoinerCount} Upcoming`}
                                size="small"
                                sx={{
                                  ml: 'auto',
                                  backgroundColor: theme.palette.grey[500],
                                  color: '#fff'
                                }}
                              />
                            </Stack>

                            {upcomingJoiners.map((item, index) => (
                              <NotificationItem
                                key={`upcoming-joiner-${index}`}
                                icon={
                                  item.image ? (
                                    <Avatar
                                      src={`data:image/jpeg;base64,${item.image}`}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        border: `2px solid ${theme.palette.grey[500]}`
                                      }}
                                    />
                                  ) : (
                                    <Avatar sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: theme.palette.grey[200],
                                      color: theme.palette.grey[800],
                                      border: `2px solid ${theme.palette.grey[500]}`
                                    }}>
                                      {item.initials}
                                    </Avatar>
                                  )
                                }
                                title={
                                  <Stack>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                      {item.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {item.employeeId}
                                    </Typography>
                                  </Stack>
                                }
                                description={
                                  <Typography variant="body2">
                                    Joining in {item.daysUntil} day{item.daysUntil !== 1 ? 's' : ''} ({item.joinDate})
                                  </Typography>
                                }
                                meta={
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {item.department} • {item.role}
                                  </Typography>
                                }
                                onClear={() => handleClear(index, 'joiner', 'clear')}
                                sx={{
                                  borderLeft: `4px solid ${theme.palette.grey[500]}`,
                                  backgroundColor: theme.palette.grey[100]
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
        background: theme.palette.background.paper,
        p: 2,
        mb: 1.5,
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        boxShadow: theme.shadows[1],
        '&:hover': {
          background: theme.palette.action.hover,
          boxShadow: theme.shadows[2]
        },
        ...sx
      }}
    >
      <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: 'flex-start' }}>
        <Box sx={{ pt: 0.5 }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          {typeof title === 'string' ? (
            <Typography variant="subtitle2" fontWeight={600}>
              {title}
            </Typography>
          ) : (
            title
          )}
          {description && (
            <Box sx={{ mt: 0.5 }}>
              {typeof description === 'string' ? (
                <Typography variant="body2">
                  {description}
                </Typography>
              ) : (
                description
              )}
            </Box>
          )}
          {meta && (
            <Box sx={{ mt: 0.5 }}>
              {typeof meta === 'string' ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {meta}
                </Typography>
              ) : (
                meta
              )}
            </Box>
          )}
        </Box>
      </Stack>
      <Tooltip title="Clear">
        <IconButton
          size="small"
          onClick={onClear}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.error.main,
              backgroundColor: theme.palette.error.lighter
            }
          }}
        >
          <IconX size="1rem" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default NotificationSection;