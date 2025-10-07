import React, { useState } from 'react';
import { Avatar, Box, Card, CardContent, Grid, Typography, Divider, Tabs, Tab, IconButton } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';

const BirthdayNews = () => {
    const [tabValue, setTabValue] = useState(0);
    const [wishesCount, setWishesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleWish = () => {
        setWishesCount(wishesCount + 1);
    };

    const handleComment = () => {
        setCommentsCount(commentsCount + 1);
    };

    // Sample data (Replace with API data)
    const todayBirthdays = [
        { name: 'Dinesh', initials: 'D', employeeId: 'EMP123', role: 'Software Engineer' },
    ];

    const upcomingBirthdays = [
        { name: 'Mani', date: '09 March', image: 'https://via.placeholder.com/40' },
        { name: 'Karthi', date: '10 March', image: 'https://via.placeholder.com/40' },
        { name: 'Sasi', date: '11 March', image: 'https://via.placeholder.com/40' },
    ];

    const workAnniversaries = [
        { name: 'Ramesh', years: '5', image: 'https://via.placeholder.com/40', employeeId: 'EMP789', role: 'Team Lead' },
        { name: 'Sneha', years: '2', image: 'https://via.placeholder.com/40', employeeId: 'EMP101', role: 'UX Designer' },
    ];

    return (
        <Card style={{
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            width: '100%',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            overflow: 'hidden',
        }}>
            <CardContent>
                <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="fullWidth"
                    TabIndicatorProps={{
                        style: { backgroundColor: '#1976d2', height: '3px' },
                    }}
                    textColor="primary"
                >
                    <Tab
                        label="Birthdays"
                        icon={<CakeIcon style={{ color: tabValue === 0 ? '#1976d2' : '#757575' }} />}
                        style={{ fontWeight: tabValue === 0 ? 'bold' : 'normal', color: tabValue === 0 ? '#1976d2' : '#757575' }}
                    />
                    <Tab
                        label="Work Anniversaries"
                        icon={<PeopleIcon style={{ color: tabValue === 1 ? '#1976d2' : '#757575' }} />}
                        style={{ fontWeight: tabValue === 1 ? 'bold' : 'normal', color: tabValue === 1 ? '#1976d2' : '#757575' }}
                    />
                    <Tab
                        label="0 New Joiners"
                        style={{ fontWeight: tabValue === 2 ? 'bold' : 'normal', color: tabValue === 2 ? '#1976d2' : '#757575' }}
                    />
                </Tabs>
                <Divider style={{ margin: '16px 0', backgroundColor: '#e0e0e0' }} />

                {tabValue === 0 && (
                    <>
                        <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                            🎉 Birthdays Today
                        </Typography>
                        {todayBirthdays.length > 0 ? (
                            todayBirthdays.map((person, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                    <Avatar sx={{ backgroundColor: '#1976d2', color: '#fff' }}>{person.initials}</Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 'bold' }}>{person.name}</Typography>
                                        <Typography variant="caption" sx={{ color: '#757575' }}>
                                            {person.employeeId} | {person.role}
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={handleWish} color="primary" aria-label="wish">
                                        <FavoriteIcon />
                                    </IconButton>
                                    <Typography variant="caption">{wishesCount} Wishes</Typography>
                                    <IconButton onClick={handleComment} color="secondary" aria-label="comment">
                                        <CommentIcon />
                                    </IconButton>
                                    <Typography variant="caption">{commentsCount} Comments</Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" style={{ color: '#757575' }}>No birthdays today.</Typography>
                        )}
                        <Divider style={{ margin: '16px 0', backgroundColor: '#e0e0e0' }} />

                        <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                            🗓️ Upcoming Birthdays
                        </Typography>
                        <Grid container spacing={2} style={{ marginTop: '8px' }}>
                            {upcomingBirthdays.map((person, index) => (
                                <Grid
                                    item
                                    key={index}
                                    xs={4}
                                    sm={4}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: '#f5f5f5',
                                    }}
                                >
                                    <Avatar src={person.image} alt={person.name} style={{ marginBottom: '8px', border: '2px solid #1976d2' }} />
                                    <Typography variant="body2" align="center" style={{ fontWeight: 'bold' }}>{person.name}</Typography>
                                    <Typography variant="caption" style={{ color: '#757575' }} align="center">{person.date}</Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}

                {tabValue === 1 && (
                    <>
                        <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                            🎖️ Work Anniversaries
                        </Typography>
                        <Grid container spacing={2} style={{ marginTop: '8px' }}>
                            {workAnniversaries.map((person, index) => (
                                <Grid
                                    item
                                    key={index}
                                    xs={6}
                                    sm={6}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: '#f5f5f5',
                                    }}
                                >
                                    <Avatar src={person.image} alt={person.name} style={{ marginBottom: '8px', border: '2px solid #1976d2' }} />
                                    <Typography variant="body2" align="center" style={{ fontWeight: 'bold' }}>{person.name}</Typography>
                                    <Typography variant="caption" style={{ color: '#757575' }} align="center">
                                        {person.employeeId} | {person.role}
                                    </Typography>
                                    <Typography variant="caption" style={{ color: '#1976d2', fontWeight: 'bold' }} align="center">
                                        {person.years} Years
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}

                {tabValue === 2 && (
                    <Typography variant="body2" style={{ color: '#757575' }}>
                        No new joiners this week.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default BirthdayNews;
