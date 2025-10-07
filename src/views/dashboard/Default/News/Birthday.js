import React, { useState, useEffect } from 'react';
import {
    Avatar, Box, Typography, Paper, Grid, Divider
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import birthdayBackground from '../../../../assets/images/birthday-background_1.webp';
import Slider from 'react-slick';

dayjs.extend(isBetween);

function Birthday() {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [todayBirthdays, setTodayBirthdays] = useState([]);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);

    useEffect(() => {
        if (orgId && loginUserName) fetchBirthdayData();
    }, [orgId, loginUserName]);

    const fetchBirthdayData = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/getEmpDob?orgId=${orgId}`);
            if (result?.status && result?.paramObjectsMap?.empDob?.length > 0) {
                const allBirthdays = result.paramObjectsMap.empDob;
                const today = dayjs().startOf('day');
                const endDate = today.add(7, 'day');
                const todayFormatted = today.format('MM-DD');

                const todayList = [];
                const upcomingList = [];

                allBirthdays.forEach(emp => {
                    const birthDate = dayjs(emp.dob, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD-MM-YYYY']);
                    let birthdayThisYear = dayjs(`${today.year()}-${birthDate.format('MM-DD')}`);
                    if (birthdayThisYear.isBefore(today, 'day')) {
                        birthdayThisYear = birthdayThisYear.add(1, 'year');
                    }

                    const personData = {
                        name: emp.empName,
                        employeeId: emp.empCode,
                        dob: emp.dob,
                        image: emp.profileImage || '',
                        date: birthdayThisYear.format('MMM DD'),
                    };

                    if (birthDate.format('MM-DD') === todayFormatted) {
                        todayList.push(personData);
                    } else if (birthdayThisYear.isAfter(today) && birthdayThisYear.isBefore(endDate)) {
                        upcomingList.push(personData);
                    }
                });

                setTodayBirthdays(todayList);
                setUpcomingBirthdays(upcomingList);
            }
        } catch (error) {
            console.error('Error fetching birthday data:', error);
        }
    };

    const BirthdayCard = ({ person }) => (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                textAlign: 'center',
                mx: 'auto',
                maxWidth: 250,
                minHeight: 180,
            }}
        >
            <Avatar
                src={person.image ? `data:image/png;base64,${person.image}` : ''}
                sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#1976d2',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 20,
                    mx: 'auto',
                    mb: 1,
                }}
            >
                {!person.image && person.name?.[0]}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
                {person.employeeId} - {person.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
                {dayjs(person.dob).format('DD-MM-YYYY')}
            </Typography>
        </Paper>
    );

    const carouselSettings = {
        dots: true,
        infinite: todayBirthdays.length > 1,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* 🎉 Today's Birthdays */}
            {todayBirthdays.length > 0 ? (
                <Box
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        backgroundImage: `url(${birthdayBackground})`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            color: '#fff',
                            mb: 2,
                            textAlign: 'center',
                            textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        {/* <CelebrationIcon /> Today's Birthdays */}
                    </Typography>

                    <Box sx={{ width: '100%', maxWidth: 300 }}>
                        <Slider {...carouselSettings}>
                            {todayBirthdays.map((person, idx) => (
                                <Box key={idx}>
                                    <BirthdayCard person={person} />
                                </Box>
                            ))}
                        </Slider>
                    </Box>
                </Box>
            ) : (
                <Typography
                    variant="body2"
                    sx={{ color: '#888', textAlign: 'center' }}
                >
                    No birthdays today.
                </Typography>
            )}

            {/* Divider */}
            {/* {upcomingBirthdays.length > 0 && todayBirthdays.length > 0 && (
                <Divider sx={{ my: 0 }} />
            )} */}

            {/* 🗓 Upcoming Birthdays */}
            {upcomingBirthdays.length > 0 && (
                <Box sx={{ borderRadius: 3, mt: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#fb8c00',
                            mb: 0
                        }}
                    >
                        <CalendarMonthIcon /> Upcoming Birthdays
                    </Typography>
                    <Grid container spacing={2}>
                        {upcomingBirthdays.map((person, idx) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                                <BirthdayCard person={person} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default Birthday;
