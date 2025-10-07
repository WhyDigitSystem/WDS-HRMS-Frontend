import React, { useState, useEffect } from 'react';
import {
    Avatar, Box, Typography, Divider, Card
} from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';

function NewJoiner() {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [todayJoiners, setTodayJoiners] = useState([]);
    const [upcomingJoiners, setUpcomingJoiners] = useState([]);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);

    useEffect(() => {
        if (orgId && loginUserName) {
            fetchNewJoinerData();
        }
    }, [orgId, loginUserName]);

    const fetchNewJoinerData = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/GetnewJoineDetails?orgId=${orgId}`);
            if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
                const allJoiners = result.paramObjectsMap.employee;
                const today = dayjs();

                const todayList = [];
                const upcomingList = [];

                allJoiners.forEach(emp => {
                    const joinDate = dayjs(emp.joinDate || dayjs());
                    const diffDays = joinDate.diff(today, 'day');

                    if (joinDate.isSame(today, 'day')) {
                        todayList.push({
                            name: emp.employee || emp.employeecode,
                            initials: (emp.employee || emp.employeecode)[0],
                            employeeId: emp.employeecode,
                            image: emp.profileImage || '',
                            role: emp.designation || 'Employee',
                        });
                    } else if (diffDays > 0 && diffDays <= 7) {
                        upcomingList.push({
                            name: emp.employee || emp.employeecode,
                            employeeId: emp.employeecode,
                            date: joinDate.format('MMM DD'),
                            image: emp.profileImage || '',
                            role: emp.designation || 'Employee',
                        });
                    }
                });

                setTodayJoiners(todayList);
                setUpcomingJoiners(upcomingList);
            }
        } catch (error) {
            console.error('Error fetching new joiner data:', error);
            showToast('Failed to fetch new joiner data', 'error');
        }
    };

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <Box sx={{ padding: '16px' }}>
            {/* New Joiners Today Section */}
            {todayJoiners.length > 0 ? (
                <>
                    <Typography variant="h6" sx={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                        🎉 New Joiners Today
                    </Typography>

                    {todayJoiners.length === 1 ? (
                        <Card sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '12px' }}>
                            <Avatar
                                src={todayJoiners[0].image ? `data:image/png;base64,${todayJoiners[0].image}` : ''}
                                onClick={() => setOpenProfileDialog(true)}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                }}
                            >
                                {!todayJoiners[0].image && todayJoiners[0].name[0]}
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                                    {todayJoiners[0].name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                    {todayJoiners[0].employeeId} | {todayJoiners[0].role}
                                </Typography>
                            </Box>
                        </Card>
                    ) : (
                        <Slider {...sliderSettings}>
                            {todayJoiners.map((person, index) => (
                                <Box key={index} sx={{ px: 1 }}>
                                    <Card sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '12px' }}>
                                        <Avatar
                                            src={person.image ? `data:image/png;base64,${person.image}` : ''}
                                            onClick={() => setOpenProfileDialog(true)}
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                bgcolor: '#1976d2',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: 20,
                                            }}
                                        >
                                            {!person.image && person.name[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                                                {person.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#757575' }}>
                                                {person.employeeId} | {person.role}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Box>
                            ))}
                        </Slider>
                    )}
                </>
            ) : (
                <Typography variant="body2" sx={{ color: '#757575' }}>
                    No new joiners today.
                </Typography>
            )}

            <Divider sx={{ margin: '16px 0' }} />

            {/* Upcoming Joiners Section */}
            {upcomingJoiners.length > 0 ? (
                <>
                    <Typography variant="h6" sx={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                        🚀 Upcoming Joiners
                    </Typography>
                    {upcomingJoiners.map((person, index) => (
                        <Card key={index} sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '12px' }}>
                            <Avatar
                                src={person.image ? `data:image/png;base64,${person.image}` : ''}
                                onClick={() => setOpenProfileDialog(true)}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                }}
                            >
                                {!person.image && person.name[0]}
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                                    {person.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                    {person.employeeId} | {person.role}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                    Joining on: {person.date}
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                </>
            ) : (
                <Typography variant="body2" sx={{ color: '#757575' }}>
                    No upcoming joiners in the next 7 days.
                </Typography>
            )}
        </Box>
    );
}

export default NewJoiner;
