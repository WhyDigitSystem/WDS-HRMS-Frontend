// src/components/Dashboard/UpcomingEvents.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Avatar,
    Grid,
    LinearProgress,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Celebration,
    Close,
    Event,
    Cake,
    Work,
    ArrowForward
} from '@mui/icons-material';
import apiCalls from 'apicall';
import dayjs from 'dayjs';

const UpcomingEvents = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [openDialog, setOpenDialog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State for different event types
    const [holidays, setHolidays] = useState([]);
    const [birthdays, setBirthdays] = useState([]);
    const [anniversaries, setAnniversaries] = useState([]);

    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));

    useEffect(() => {
        if (orgId && loginUserName) {
            fetchAllData();
        }
    }, [orgId, loginUserName]);

    const fetchAllData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchHolidays(),
            fetchBirthdays(),
            fetchAnniversaries()
        ]);
        setIsLoading(false);
    };

    // Format date to DD-MM-YYYY
    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('DD-MM-YYYY');
    };

    // Fetch Holidays
    const fetchHolidays = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);
            if (result?.paramObjectsMap?.holidayVO) {
                const allHolidays = result.paramObjectsMap.holidayVO;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcoming = allHolidays
                    .filter(holiday => {
                        const holidayDate = new Date(holiday.holidayDate);
                        holidayDate.setHours(0, 0, 0, 0);
                        return holidayDate >= today;
                    })
                    .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));

                setHolidays(upcoming.map(h => ({
                    name: h.festival,
                    title: h.festival,
                    date: formatDateToDDMMYYYY(h.holidayDate),
                    fullDate: h.holidayDate,
                    description: h.description || '',
                    type: h.holidayType || 'Holiday',
                    branch: h.branch,
                    daysUntil: daysUntil(h.holidayDate),
                    isToday: isTodayDate(h.holidayDate),
                    holidayDate: h.holidayDate
                })));
            }
        } catch (err) {
            console.error('Error fetching holidays:', err);
        }
    };

    // Fetch Birthdays
    const fetchBirthdays = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/getEmpDob?orgId=${orgId}`);
            if (result?.status && result?.paramObjectsMap?.empDob?.length > 0) {
                const allBirthdays = result.paramObjectsMap.empDob;
                const today = dayjs().startOf('day');
                const endDate = today.add(30, 'day');

                const upcomingBirthdays = [];

                allBirthdays.forEach(emp => {
                    const birthDate = dayjs(emp.dob, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD-MM-YYYY']);
                    let birthdayThisYear = dayjs(`${today.year()}-${birthDate.format('MM-DD')}`);

                    if (birthdayThisYear.isBefore(today, 'day')) {
                        birthdayThisYear = birthdayThisYear.add(1, 'year');
                    }

                    if (birthdayThisYear.isAfter(today) && birthdayThisYear.isBefore(endDate)) {
                        upcomingBirthdays.push({
                            name: emp.empName || emp.name || 'Employee',
                            employeeId: emp.empCode || emp.employeeId || 'N/A',
                            date: formatDateToDDMMYYYY(birthdayThisYear.format('YYYY-MM-DD')),
                            fullDate: birthdayThisYear,
                            image: emp.profileImage || '',
                            daysUntil: birthdayThisYear.diff(today, 'day'),
                            isToday: birthdayThisYear.isSame(today, 'day'),
                            designation: emp.designation || ''
                        });
                    }
                });

                setBirthdays(upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 3));
            }
        } catch (err) {
            console.error('Error fetching birthdays:', err);
        }
    };

    // Fetch Work Anniversaries
    const fetchAnniversaries = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/Getworkaniversary?orgId=${orgId}`);
            if (result?.status  && result?.paramObjectsMap?.employee?.length > 0) {
                console.log(result,'Sheik');
                const today = dayjs();
                const endDate = today.add(30, 'day');

                const upcomingAnniversaries = result.paramObjectsMap.employee
                    .map(emp => {
                        const joinDate = dayjs(emp.dateofjoining);
                        let anniversaryThisYear = dayjs(`${today.year()}-${joinDate.format('MM-DD')}`);

                        if (anniversaryThisYear.isBefore(today, 'day')) {
                            anniversaryThisYear = anniversaryThisYear.add(1, 'year');
                        }

                        return {
                            name: emp.employee || emp.employeeName || emp.name || 'Employee',
                            employeeId: emp.employeecode || emp.employeeId || 'N/A',
                            role: emp.designation || 'Employee',
                            years: emp.noofyears || 0,
                            image: emp.profileImage || '',
                            date: formatDateToDDMMYYYY(anniversaryThisYear.format('YYYY-MM-DD')),
                            fullDate: anniversaryThisYear,
                            daysUntil: anniversaryThisYear.diff(today, 'day'),
                            isWithinRange: anniversaryThisYear.isAfter(today) && anniversaryThisYear.isBefore(endDate),
                            isToday: anniversaryThisYear.isSame(today, 'day')
                        };
                    })
                    // .filter(emp => emp.isWithinRange)
                    .filter(emp => emp.isWithinRange || emp.isToday)
                    .sort((a, b) => a.daysUntil - b.daysUntil)
                    .slice(0, 3);

                setAnniversaries(upcomingAnniversaries);
            }
        } catch (err) {
            console.error('Error fetching anniversaries:', err);
        }
    };

    const daysUntil = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const holidayDate = new Date(dateString);
        holidayDate.setHours(0, 0, 0, 0);
        const diffTime = holidayDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const isTodayDate = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(dateString);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.getTime() === today.getTime();
    };

    // Event Card Component
    const EventCard = ({ event, type }) => {
        const getIcon = () => {
            switch (type) {
                case 'holiday':
                    return <Event sx={{ fontSize: 18 }} />;
                case 'birthday':
                    return <Cake sx={{ fontSize: 18 }} />;
                case 'anniversary':
                    return <Work sx={{ fontSize: 18 }} />;
                default:
                    return <Celebration sx={{ fontSize: 18 }} />;
            }
        };

        const getColor = () => {
            switch (type) {
                case 'holiday':
                    return { bg: '#dbeafe', color: '#2563eb' };
                case 'birthday':
                    return { bg: '#fce7f3', color: '#db2777' };
                case 'anniversary':
                    return { bg: '#e0f2fe', color: '#0284c7' };
                default:
                    return { bg: '#f3e8ff', color: '#9333ea' };
            }
        };

        const colors = getColor();

        return (
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    background: '#ffffffcc',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    transition: '0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    },
                }}
            >
                <Box display="flex" alignItems="center" gap={1.2} mb={1}>
                    <Avatar
                        sx={{
                            width: 38,
                            height: 38,
                            background: colors.bg,
                            color: colors.color,
                        }}
                    >
                        {getIcon()}
                    </Avatar>

                    <Box flex={1}>
                        <Typography
                            sx={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                lineHeight: 1.3,
                            }}
                        >
                            {type === 'holiday' ? (
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#0f172a',
                                    }}
                                >
                                    {event.name}
                                </Box>
                            ) : (
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#0f172a',
                                    }}
                                >
                                    {event.name}
                                </Box>
                            )}
                            {type !== 'holiday' && event.employeeId && (
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: 500,
                                        color: '#64748b',
                                        ml: 0.5,
                                    }}
                                >
                                    ({event.employeeId})
                                </Box>
                            )}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: '0.68rem',
                                color: '#64748b',
                                fontWeight: 600,
                                mt: 0.2,
                            }}
                        >
                            {event.date}
                        </Typography>
                    </Box>

                    {event.isToday && (
                        <Chip
                            label="Today"
                            size="small"
                            sx={{
                                height: 22,
                                borderRadius: '7px',
                                background: '#4caf50',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.64rem',
                            }}
                        />
                    )}

                    {event.daysUntil > 0 && !event.isToday && (
                        <Chip
                            label={`${event.daysUntil}d`}
                            size="small"
                            sx={{
                                height: 22,
                                borderRadius: '7px',
                                background: colors.bg,
                                color: colors.color,
                                fontWeight: 700,
                                fontSize: '0.64rem',
                            }}
                        />
                    )}
                </Box>

                {event.description && (
                    <Typography
                        sx={{
                            fontSize: '0.72rem',
                            color: '#64748b',
                            lineHeight: 1.5,
                            fontWeight: 500,
                        }}
                    >
                        {event.description}
                    </Typography>
                )}

                {type === 'anniversary' && (
                    <>
                        {event.role && (
                            <Typography
                                sx={{
                                    fontSize: '0.72rem',
                                    color: '#64748b',
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                    mt: 0.5,
                                }}
                            >
                                {event.role} • {event.years} year{event.years > 1 ? 's' : ''}
                            </Typography>
                        )}
                    </>
                )}
            </Box>
        );
    };

    const EventDialog = ({ type, open, onClose, data, title }) => {
        return (
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 1,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '1rem',
                        fontWeight: 800,
                    }}
                >
                    {title}
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.2,
                        }}
                    >
                        {data.map((item, idx) => (
                            <EventCard key={idx} event={item} type={type} />
                        ))}
                        {data.length === 0 && (
                            <Typography textAlign="center" sx={{ py: 4, color: '#64748b' }}>
                                No upcoming {title.toLowerCase()} found
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        );
    };

    const SectionCard = ({ title, icon, data, type, color }) => {
        const IconComponent = icon;

        return (
            <Grid item xs={12} sm={6} md={4}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: '22px',
                        border: '1px solid #e2e8f0',
                        background: 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        height: '100%',
                        minHeight: 280,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: `${color}20`,
                            top: -60,
                            right: -50,
                        }}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.8} position="relative" zIndex={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, background: color, color: 'white' }}>
                                <IconComponent sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                                {title}
                            </Typography>
                        </Box>

                        <Button
                            size="small"
                            onClick={() => setOpenDialog({ type, data, title })}
                            endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                            sx={{
                                textTransform: 'none',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '8px',
                                color: '#2563eb',
                                minWidth: 'auto',
                                px: 1,
                            }}
                        >
                            View All
                        </Button>
                    </Box>

                    <Box sx={{ position: 'relative', zIndex: 2, flex: 1 }}>
                        {isLoading ? (
                            <LinearProgress color="primary" />
                        ) : data.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                {data.slice(0, 3).map((item, idx) => (
                                    <EventCard key={idx} event={item} type={type} />
                                ))}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    minHeight: 180,
                                }}
                            >
                                <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                                    No upcoming {title.toLowerCase()} found
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Grid>
        );
    };

    return (
        <>
            <Grid container spacing={2}>
                <SectionCard
                    title="Upcoming Holidays"
                    icon={Event}
                    data={holidays}
                    type="holiday"
                    color="#2563eb"
                />

                <SectionCard
                    title="Upcoming Birthdays"
                    icon={Cake}
                    data={birthdays}
                    type="birthday"
                    color="#db2777"
                />

                <SectionCard
                    title="Work Anniversaries"
                    icon={Work}
                    data={anniversaries}
                    type="anniversary"
                    color="#0284c7"
                />
            </Grid>

            {/* Dialog Popups */}
            {openDialog && (
                <EventDialog
                    type={openDialog.type}
                    open={!!openDialog}
                    onClose={() => setOpenDialog(null)}
                    data={openDialog.data}
                    title={openDialog.title}
                />
            )}
        </>
    );
};

export default UpcomingEvents;