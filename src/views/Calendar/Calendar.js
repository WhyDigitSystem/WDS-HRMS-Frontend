import React, { useState, useEffect } from 'react';
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';

const Calendar = () => {
  // State declarations
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('calendar');
  const [holidays, setHolidays] = useState([]);
  const [weekOffs, setWeekOffs] = useState([]);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [birthdayEvents, setBirthdayEvents] = useState([]);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  // Local storage values
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [designation] = useState(localStorage.getItem('designation'));
  const [empCode] = useState(localStorage.getItem('employeeCode'));
  const [empName] = useState(localStorage.getItem('employeeName'));

  // Constants
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const fullWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const eventTypeColors = {
    holiday: '#FF6347',
    meeting: '#1E90FF',
    birthday: '#FFD700',
    training: '#32CD32',
    other: '#808080'
  };

  const [newEvent, setNewEvent] = useState({
    eventTitle: '',
    eventType: 'meeting',
    date: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    return Math.ceil((date.getDate() + firstDayOfWeek) / 7);
  };

  // Sort events by time with all-day events first
  const sortEventsByTime = (events) => {
    return [...events].sort((a, b) => {
      // First sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // Then sort by time
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return -1;
      if (!b.startTime) return 1;

      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Get the latest event for a day
  const getLatestEvent = (events) => {
    if (!events || events.length === 0) return null;

    // Find the event with the latest start time
    return events.reduce((latest, event) => {
      if (!event.startTime) return latest || event;
      if (!latest) return event;

      return event.startTime > latest.startTime ? event : latest;
    }, null);
  };

  // Check if event is active
  const isEventActive = (event) => {
    return event.active === 'Active';
  };

  useEffect(() => {
    const updateCalendar = () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const days = [];
      const firstDayIndex = startOfMonth.getDay();
      const totalDays = endOfMonth.getDate();

      // Combine all events
      const combinedEvents = [...calendarEvents, ...holidays, ...birthdayEvents];

      let dayCount = 1;
      for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
          if (i === 0 && j < firstDayIndex) {
            week.push(null);
          } else if (dayCount > totalDays) {
            break;
          } else {
            const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCount);

            const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
            const weekNumber = getWeekNumber(currentDay);

            const isWeekOff = weekOffs.some((off) => {
              if (off.weekOffDays.toUpperCase() !== dayName) return false;
              if (off.weekNumbers.includes(-1)) return true;
              return off.weekNumbers.includes(weekNumber);
            });

            // Get events for this day
            const dayEvents = combinedEvents.filter((event) => {
              try {
                const [year, month, day] = event.date.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day);
                return (
                  eventDate.getDate() === dayCount &&
                  eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear()
                );
              } catch (error) {
                console.error('Invalid date format:', event.date);
                return false;
              }
            });

            // Sort events by time
            const sortedEvents = sortEventsByTime(dayEvents);
            const latestEvent = getLatestEvent(sortedEvents);

            const dayWithEvents = {
              day: dayCount,
              date: currentDay,
              events: sortedEvents,
              latestEvent,
              isWeekOff,
              hasEvents: sortedEvents.length > 0
            };
            week.push(dayWithEvents);
            dayCount++;
          }
        }
        days.push(week);
        if (dayCount > totalDays) break;
      }
      setCalendarDays(days);
    };

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    updateCalendar();
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentDate, calendarEvents, holidays, weekOffs, birthdayEvents]);

  // Fetch data functions
  const getAllCalendarByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllCalendarByOrgId?branchCode=${branchCode}&orgId=${orgId}&empCode=${empCode}`);
      if (result?.paramObjectsMap?.calendarVO) {
        const transformed = result.paramObjectsMap.calendarVO.map((event) => ({
          ...event,
          eventTitle: event.eventTitle === 'Untitled Event' ? '' : event.eventTitle?.trim() || '',
          eventType: event.eventType || 'other',
          empName: event.empName || empName,
          branchName: event.branchName || branchName,
          department: event.department || department,
          startTime: event.fromTime || '',
          endTime: event.toTime || '',
          // Add a timestamp for sorting
          timestamp: event.fromTime ? dayjs(`${event.date} ${event.fromTime}`, 'YYYY-MM-DD HH:mm').valueOf() : dayjs(event.date).valueOf()
        }));
        setCalendarEvents(transformed);
      }
    } catch (err) {
      showToast('error', 'Error fetching calendar events');
    }
  };

  const getAllHolidaysByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      if (result?.paramObjectsMap?.holidayVO) {
        const transformed = result.paramObjectsMap.holidayVO.map((holiday) => ({
          eventTitle: `${holiday.festival} 🎉`,
          eventType: 'holiday',
          date: holiday.holidayDate,
          description: `Date: ${holiday.holidayDate}\nDay: ${holiday.day}\nType: Official Holiday`,
          id: `holiday-${holiday.id}`,
          isHoliday: true,
          startTime: '',
          endTime: '',
          timestamp: dayjs(holiday.holidayDate).valueOf(),
          active: 'Active' // Holidays are always active
        }));
        setHolidays(transformed);
      }
    } catch (err) {
      showToast('error', 'Error fetching holidays');
    }
  };

  const getCompanyWeekOff = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/company/${orgId}`);
      const weekOffConfig = result.paramObjectsMap.companyVO[0].companyWeekOffVO || [];

      const userDesignation = designation?.toUpperCase()?.trim();

      const filteredWeekOffs = weekOffConfig
        .filter((off) => {
          if (!off.type) return false;

          const types = off.type.split(',').map((t) => t.trim().toUpperCase());

          // Allow if type contains ALL or matches designation
          return types.includes('ALL') || types.includes(userDesignation);
        })
        .map((off) => ({
          weekOffDays: off.weekOffDays.toUpperCase(),
          weekNumbers: off.weekNumbers || [-1]
        }));

      setWeekOffs(filteredWeekOffs);
    } catch (error) {
      console.error('Error fetching week off:', error);
      showToast('error', 'Failed to load week-off configuration');
    }
  };

  const fetchBirthdayData = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getEmpDob?orgId=${orgId}`);

      if (!result?.status) {
        console.error('API error:', result?.message);
        showToast('error', 'Failed to fetch birthday data');
        return;
      }

      const allBirthdays = result?.paramObjectsMap?.empDob || result?.data?.empDob || result?.empDob || [];

      if (allBirthdays.length === 0) {
        console.log('No birthday data available');
        return;
      }

      const today = dayjs();
      const todayFormatted = today.format('MM-DD');
      const nextWeek = today.add(7, 'day');

      const todayList = [];
      const upcomingList = [];

      allBirthdays.forEach((emp) => {
        if (!emp.dob || !emp.empName) return;

        try {
          const dob = dayjs(emp.dob, ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'], true);
          if (!dob.isValid()) return;

          const birthdayThisYear = dayjs().year(today.year()).month(dob.month()).date(dob.date());

          if (dob.format('MM-DD') === todayFormatted) {
            todayList.push({
              name: emp.empName,
              date: birthdayThisYear.format('YYYY-MM-DD'),
              department: emp.department || 'N/A'
            });
          } else if (birthdayThisYear.isAfter(today) && birthdayThisYear.isBefore(nextWeek)) {
            upcomingList.push({
              name: emp.empName,
              date: birthdayThisYear.format('YYYY-MM-DD'),
              department: emp.department || 'N/A'
            });
          }
        } catch (error) {
          console.error('Error processing birthday:', emp, error);
        }
      });

      setTodayBirthdays(todayList);
      setUpcomingBirthdays(upcomingList);

      const events = [
        ...todayList.map((bd) => ({
          eventTitle: `${bd.name}'s Birthday 🎂`,
          eventType: 'birthday',
          date: bd.date,
          description: `Wish ${bd.name} a happy birthday!`,
          id: `birthday-${bd.name.replace(/\s+/g, '-')}-${bd.date}`,
          isBirthday: true,
          startTime: '',
          endTime: '',
          timestamp: dayjs(bd.date).valueOf(),
          active: 'Active' // Birthdays are always active
        })),
        ...upcomingList.map((bd) => ({
          eventTitle: `${bd.name}'s Birthday (Upcoming)`,
          eventType: 'birthday',
          date: bd.date,
          description: `Upcoming birthday on ${bd.date}`,
          id: `birthday-upcoming-${bd.name.replace(/\s+/g, '-')}-${bd.date}`,
          isBirthday: true,
          startTime: '',
          endTime: '',
          timestamp: dayjs(bd.date).valueOf(),
          active: 'Active' // Birthdays are always active
        }))
      ];

      setBirthdayEvents(events);
    } catch (error) {
      console.error('Birthday data fetch failed:', error);
      showToast('error', 'Failed to load birthday data');
    }
  };

  // Fetch event details by ID
  const getCalendarEventById = async (id) => {
    setLoadingEvent(true);
    try {
      const result = await apiCalls('get', `/basicmaster/getCalendarById?id=${id}`);

      if (result?.status && result?.paramObjectsMap?.calendarVO) {
        const eventData = result.paramObjectsMap.calendarVO;
        setNewEvent((prev) => ({
          ...prev,
          id: eventData.id,
          eventTitle: eventData.eventTitle || '',
          eventType: eventData.eventType || 'meeting',
          date: eventData.date || '',
          description: eventData.description || '',
          startTime: eventData.fromTime || '',
          endTime: eventData.toTime || '',
          active: eventData.active || 'Active'
        }));
      } else {
        showToast('error', result?.message || 'Failed to load event details');
      }
    } catch (err) {
      console.error('Fetch Event Error:', err);
      showToast('error', 'Error loading event details');
    } finally {
      setLoadingEvent(false);
    }
  };

  useEffect(() => {
    getAllCalendarByOrgId();
    getAllHolidaysByOrgId();
    getCompanyWeekOff();
    fetchBirthdayData();
  }, []);

  // Event handlers
  const handleAddEvent = () => {
    const today = new Date();
    setNewEvent({
      eventTitle: '',
      eventType: 'meeting',
      date: formatDateForInput(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      description: '',
      startTime: '',
      endTime: '',
      id: null,
      active: 'Active'
    });
    setShowModal(true);
  };

  const handleDayClick = (cell) => {
    setSelectedDayEvents(cell.events);
    setNewEvent({
      eventTitle: '',
      eventType: 'meeting',
      date: formatDateForInput(currentDate.getFullYear(), currentDate.getMonth() + 1, cell.day),
      description: '',
      id: null,
      startTime: '',
      endTime: '',
      active: 'Active'
    });
    setShowModal(true);
  };

  const handleEventClick = async (event) => {
    setNewEvent({
      id: event.id,
      eventTitle: event.eventTitle || '',
      eventType: event.eventType || 'meeting',
      date: event.date || '',
      description: event.description || '',
      isHoliday: event.eventType === 'holiday',
      isBirthday: event.eventType === 'birthday',
      startTime: event.startTime || event.fromTime || '',
      endTime: event.endTime || event.toTime || '',
      active: event.active || 'Active'
    });
    setShowModal(true);

    // Only fetch details for calendar events (not holidays or birthdays)
    if (!event.isHoliday && !event.isBirthday && event.id) {
      await getCalendarEventById(event.id);
    }
  };

  const handleSaveEvent = async () => {
    if (!newEvent.eventTitle?.trim()) {
      showToast('error', 'Event title is required');
      return;
    }

    if (!newEvent.date) {
      showToast('error', 'Event date is required');
      return;
    }

    const saveData = {
      ...(newEvent.id && { id: newEvent.id }),
      branchCode: branchCode,
      branchName: branchName,
      createdBy: loginUserName,
      date: newEvent.date,
      department: department,
      description: newEvent.description || '',
      eventTitle: newEvent.eventTitle.trim(),
      eventType: newEvent.eventType,
      fromTime: newEvent.startTime || '',
      toTime: newEvent.endTime || '',
      orgId: orgId,
      empCode: empCode,
      empName: loginUserName,
      active: newEvent.active || 'Active'
    };

    try {
      const result = await apiCalls('put', '/basicmaster/createUpdateCalendar', saveData);

      if (result?.status) {
        showToast('success', 'Event created successfully');
        setShowModal(false);
        await getAllCalendarByOrgId();
      } else {
        showToast('error', result?.message || 'Failed to save event');
      }
    } catch (err) {
      console.error('Save Error:', err);
      showToast('error', 'Error saving event. Please try again.');
    }
  };

  const formatDateForInput = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Responsive helpers
  const getDayCellSize = () => (isMobile ? 50 : 70);
  const getDayFontSize = () => (isMobile ? 10 : 11);
  const getEventFontSize = () => (isMobile ? 8 : 9);

  // UI components
  const EventLegend = () => (
    <div
      style={{
        marginTop: 8,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 6,
        fontSize: isMobile ? 11 : 12
      }}
    >
      <h5 style={{ fontWeight: 'bold', marginBottom: 8 }}>Calendar Legend</h5>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(eventTypeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, backgroundColor: color, borderRadius: '50%' }} />
            <span style={{ textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ccc',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: '#f00',
                transform: 'rotate(-45deg)'
              }}
            />
          </div>
          <span>Closed</span>
        </div>
      </div>
    </div>
  );

  const CalendarGrid = () => {
    const cellSize = getDayCellSize();
    const dayFontSize = getDayFontSize();
    const eventFontSize = getEventFontSize();

    return (
      <div
        style={{
          marginTop: 12,
          padding: isMobile ? 4 : 10,
          backgroundColor: '#fff',
          borderRadius: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid #e0e0e0',
          fontSize: 12,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{ minWidth: '280px' }}>
          {/* Weekdays Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 2,
              borderBottom: '1px solid rgb(179, 18, 18)',
              paddingBottom: 4,
              marginBottom: 4,
              minWidth: '280px'
            }}
          >
            {weekdays.map((day, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 0',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: isMobile ? 10 : 11,
                  color: '#333',
                  backgroundColor: 'rgb(214, 220, 226)',
                  borderRadius: 4,
                  border: '1px solid #d1d5db',
                  minWidth: cellSize
                }}
              >
                {isMobile ? day : fullWeekdays[index]}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: isMobile ? 2 : 4
            }}
          >
            {calendarDays.map((week, wIdx) =>
              week.map((cell, cIdx) => {
                // Build tooltip content
                let tooltipContent = `Date: ${cell?.date.toLocaleDateString()}`;
                if (cell?.isWeekOff) {
                  tooltipContent += '\nWeek Off';
                }
                if (cell?.hasEvents) {
                  tooltipContent += '\n\nEvents:';
                  cell.events.forEach((event) => {
                    tooltipContent += `\n${event.eventTitle}`;
                    if (event.startTime) {
                      tooltipContent += ` (${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''})`;
                    }
                    if (event.active && event.active !== 'Active') {
                      tooltipContent += ' [Closed]';
                    }
                  });
                }

                return (
                  <div
                    key={`${wIdx}-${cIdx}`}
                    title={tooltipContent}
                    style={{
                      minHeight: cellSize,
                      minWidth: cellSize,
                      padding: 4,
                      borderRadius: 5,
                      backgroundColor: cell?.isWeekOff ? '#ffeaea' : cell ? '#fdfdfd' : 'transparent',
                      border: `1px solid ${cell?.isWeekOff ? '#ff6666' : '#dcdcdc'}`,
                      cursor: cell ? 'pointer' : 'default',
                      position: 'relative',
                      fontSize: dayFontSize
                    }}
                    onClick={() => cell && handleDayClick(cell)}
                  >
                    {cell && (
                      <>
                        {/* Date Number */}
                        <div
                          style={{
                            color: cell.isWeekOff ? '#d32f2f' : '#1976d2',
                            fontWeight: 'bold',
                            fontSize: dayFontSize
                          }}
                        >
                          {cell.day}
                        </div>

                        {/* Week Off Label */}
                        {cell.isWeekOff && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              fontSize: 8,
                              color: '#d32f2f',
                              fontWeight: 'bold'
                            }}
                          >
                            Off
                          </div>
                        )}

                        {/* Latest Event Title */}
                        {cell.latestEvent && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              right: 4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: eventFontSize,
                              fontWeight: '500',
                              color: isEventActive(cell.latestEvent) ? '#333' : '#999',
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              padding: '1px 3px',
                              borderRadius: 3
                            }}
                          >
                            {isMobile
                              ? cell.latestEvent.eventTitle.length > 12
                                ? cell.latestEvent.eventTitle.substring(0, 10) + '...'
                                : cell.latestEvent.eventTitle
                              : cell.latestEvent.eventTitle.length > 20
                                ? cell.latestEvent.eventTitle.substring(0, 18) + '...'
                                : cell.latestEvent.eventTitle}
                            {!isEventActive(cell.latestEvent) && <span style={{ color: '#f00', marginLeft: 4 }}>[Closed]</span>}
                          </div>
                        )}

                        {/* Event Count Indicator */}
                        {cell.hasEvents && cell.events.length > 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 4,
                              left: 4,
                              backgroundColor: '#1976d2',
                              color: 'white',
                              borderRadius: '50%',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 9,
                              fontWeight: 'bold'
                            }}
                          >
                            {cell.events.length}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const EventListView = () => {
    // Sort events in ascending order (oldest first, earliest time first)
    const sortedEvents = sortEventsByTime([...calendarEvents]);

    return (
      <div style={{ marginTop: 16, maxHeight: 400, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
          {sortedEvents.map((event, index) => {
            const isActive = isEventActive(event);

            return (
              <div
                key={index}
                onClick={() => handleEventClick(event)}
                title={`${event.eventTitle}\nDate: ${event.date}\n${event.description || ''}`}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: 12,
                  cursor: 'pointer',
                  opacity: isActive ? 1 : 0.7,
                  position: 'relative'
                }}
              >
                {!isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#f44336',
                      color: 'white',
                      padding: '2px 6px',
                      fontSize: 10,
                      borderRadius: '0 6px 0 6px'
                    }}
                  >
                    Closed
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: eventTypeColors[event.eventType],
                      opacity: isActive ? 1 : 0.5
                    }}
                  />
                  <h4
                    style={{
                      fontSize: 13,
                      margin: 0,
                      textDecoration: isActive ? 'none' : 'line-through'
                    }}
                  >
                    {event.eventTitle}
                  </h4>
                </div>
                <div style={{ marginTop: 6, color: isActive ? '#777' : '#aaa', fontSize: 11 }}>
                  {new Date(event.date).toLocaleDateString()}
                  {(event.startTime || event.endTime) && (
                    <span>
                      {' '}
                      • {event.startTime}
                      {event.endTime ? ` - ${event.endTime}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewEvent({
      eventTitle: '',
      eventType: 'meeting',
      date: '',
      description: '',
      startTime: '',
      endTime: '',
      id: null,
      active: 'Active'
    });
    setLoadingEvent(false);
    setSelectedDayEvents([]);
  };

  return (
    <div
      style={{
        margin: '0 auto',
        padding: isMobile ? '12px' : '10px 24px 24px 24px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}
    >
      <ToastComponent />
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 10,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center'
        }}
      >
        <div className="d-flex gap-3" style={{ flexWrap: 'wrap' }}>
          <div>
            <button onClick={() => setActiveTab('calendar')} style={tabStyle(activeTab === 'calendar')}>
              Calendar View
            </button>
          </div>
          <div>
            <button onClick={() => setActiveTab('events')} style={tabStyle(activeTab === 'events')}>
              Events List
            </button>
          </div>
        </div>
      </div>
      {activeTab === 'calendar' ? (
        <>
          {/* Calendar Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 12 : 0
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 'bold',
                  color: '#4a4a4a',
                  margin: 0,
                  marginBottom: isMobile ? 8 : 0
                }}
              >
                {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '4px',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                >
                  <label style={{ color: '#4a4a4a' }}>Time:</label>
                  <span style={{ marginLeft: '6px', color: '#4a4a4a' }}>{currentTime}</span>
                </div>
              </h1>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                gap: 12,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {/* Navigation and Add Event */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: isMobile ? '8px' : '0',
                  order: isMobile ? 2 : 1
                }}
              >
                <button onClick={handlePrevMonth} style={smallButtonStyle}>
                  ←
                </button>
                <button onClick={handleNextMonth} style={smallButtonStyle}>
                  →
                </button>
                <button
                  onClick={handleAddEvent}
                  style={{
                    ...smallButtonStyle,
                    backgroundColor: '#1d4ed8',
                    color: '#fff',
                    padding: '6px 10px',
                    fontWeight: 500,
                    fontSize: isMobile ? 12 : 13
                  }}
                >
                  Add Event
                </button>
              </div>

              {/* Legend - moved to bottom on mobile */}
              <div
                style={{
                  order: isMobile ? 1 : 2,
                  width: isMobile ? '100%' : 'auto',
                  marginTop: isMobile ? 0 : 'auto'
                }}
              >
                <EventLegend />
              </div>
            </div>
          </div>

          <CalendarGrid />
        </>
      ) : (
        <EventListView />
      )}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: isMobile ? 'flex-start' : 'center',
            zIndex: 9999,
            padding: isMobile ? 12 : 0,
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: isMobile ? 12 : 16,
              borderRadius: 8,
              width: isMobile ? '100%' : 500,
              maxWidth: isMobile ? '100%' : 500,
              maxHeight: isMobile ? '100%' : '90vh',
              overflowY: 'auto',
              fontSize: 13,
              marginTop: isMobile ? 0 : 'auto',
              marginBottom: isMobile ? 0 : 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                {loadingEvent
                  ? 'Loading Event...'
                  : newEvent.isHoliday
                    ? '🎉 Holiday Details'
                    : newEvent.isBirthday
                      ? '🎂 Birthday Details'
                      : newEvent.id
                        ? 'Edit Event'
                        : 'New Event'}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {(newEvent.isHoliday || newEvent.isBirthday) && (
              <div
                style={{
                  padding: 10,
                  margin: '8px 0',
                  backgroundColor: '#fff3cd',
                  borderRadius: 6,
                  fontSize: 12
                }}
              >
                <strong>{newEvent.isHoliday ? 'Official Organization Holiday' : 'Employee Birthday'}</strong>
              </div>
            )}

            {selectedDayEvents.length > 0 && (
              <div style={{ margin: '12px 0' }}>
                <h4 style={{ marginBottom: 8, fontSize: 14 }}>Events on this day (sorted by time):</h4>
                <div
                  style={{
                    maxHeight: 150,
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    borderRadius: 6,
                    padding: 8
                  }}
                >
                  {sortEventsByTime(selectedDayEvents).map((event, idx) => {
                    const isActive = isEventActive(event);

                    return (
                      <div
                        key={idx}
                        onClick={() => handleEventClick(event)}
                        style={{
                          padding: '6px 8px',
                          marginBottom: 4,
                          borderRadius: 4,
                          backgroundColor: '#f8f9fa',
                          cursor: 'pointer',
                          borderLeft: `3px solid ${eventTypeColors[event.eventType]}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: isActive ? 1 : 0.7
                        }}
                      >
                        <div>
                          <strong style={{ textDecoration: isActive ? 'none' : 'line-through' }}>{event.eventTitle}</strong>
                          <div style={{ fontSize: 11, color: isActive ? '#666' : '#aaa' }}>
                            {new Date(event.date).toLocaleDateString()}
                            {event.startTime && ` • ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {!isActive && <span style={{ color: '#f00', fontSize: 11 }}>Closed</span>}
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: eventTypeColors[event.eventType],
                              opacity: isActive ? 1 : 0.5
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {loadingEvent ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20
                }}
              >
                <div>Loading event details...</div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEvent();
                }}
                style={{ marginTop: 8 }}
              >
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Title</label>
                  <input
                    name="eventTitle"
                    value={newEvent.eventTitle}
                    onChange={handleEventChange}
                    disabled={newEvent.isHoliday || newEvent.isBirthday}
                    style={inputStyleSmall}
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Date</label>
                  {newEvent.isHoliday || newEvent.isBirthday ? (
                    <div
                      style={{
                        padding: 8,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 6,
                        fontSize: 13
                      }}
                    >
                      {new Date(newEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  ) : (
                    <input type="date" name="date" value={newEvent.date} onChange={handleEventChange} style={inputStyleSmall} />
                  )}
                </div>

                <div style={{ display: isMobile ? 'block' : 'flex', gap: 8 }}>
                  <div style={{ marginBottom: 8, flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={newEvent.startTime}
                      onChange={handleEventChange}
                      disabled={newEvent.isHoliday || newEvent.isBirthday}
                      style={inputStyleSmall}
                    />
                  </div>

                  <div style={{ marginBottom: 8, flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={newEvent.endTime}
                      onChange={handleEventChange}
                      disabled={newEvent.isHoliday || newEvent.isBirthday}
                      style={inputStyleSmall}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Type</label>
                  <select
                    name="eventType"
                    value={newEvent.eventType}
                    onChange={handleEventChange}
                    disabled={newEvent.isHoliday || newEvent.isBirthday}
                    style={inputStyleSmall}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="birthday">Birthday</option>
                    <option value="training">Training</option>
                    <option value="holiday">Holiday</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleEventChange}
                    disabled={newEvent.isHoliday || newEvent.isBirthday}
                    rows={3}
                    style={inputStyleSmall}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={handleCloseModal} style={buttonStyleSmall}>
                      Cancel
                    </button>

                    {!newEvent.isHoliday && !newEvent.isBirthday && (
                      <button
                        type="submit"
                        style={{
                          ...buttonStyleSmall,
                          backgroundColor: '#1d4ed8',
                          color: 'white'
                        }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Style constants
const tabStyle = (isActive) => ({
  padding: '6px 12px',
  fontSize: 12,
  borderRadius: 6,
  border: `1px solid ${isActive ? '#1976d2' : '#ccc'}`,
  backgroundColor: isActive ? '#1976d2' : '#f9f9f9',
  color: isActive ? '#fff' : '#333',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  minWidth: 100,
  textAlign: 'center'
});

const smallButtonStyle = {
  padding: '4px 8px',
  fontSize: 12,
  borderRadius: 6,
  border: '1px solid #ccc',
  backgroundColor: '#f5f5f5',
  color: '#333',
  cursor: 'pointer',
  height: 32
};

const inputStyleSmall = {
  width: '100%',
  padding: '8px',
  fontSize: 13,
  borderRadius: 6,
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const buttonStyleSmall = {
  padding: '8px 16px',
  fontSize: 13,
  borderRadius: 6,
  border: '1px solid #ccc',
  backgroundColor: '#f5f5f5',
  color: '#333',
  cursor: 'pointer'
};

export default Calendar;
