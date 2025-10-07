import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Divider,
    Tabs,
    Tab,
    Typography,
    Paper,
    useMediaQuery,
} from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTheme } from '@mui/material/styles';
import Birthday from './Birthday';
import WorkAnniversaries from './workAnniversaries';
import NewJoiner from './NewJoiner';

const Index = () => {
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const renderSectionHeader = (icon, text) => (
        <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                ml={1.5}
                fontWeight="bold"
                color="primary.dark"
            >
                {text}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ px: isMobile ? 1 : 3, py: 2 }}>
            <Card
                sx={{
                    borderRadius: isMobile ? 2 : 4,
                    boxShadow: 6,
                    width: '100%',
                    background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)',
                    p: isMobile ? 2 : 3,
                    border: '1px solid #d1d5db',
                    borderLeft: '4px solid #264952',
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <Box
                        sx={{
                            width: '100%',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            TabIndicatorProps={{
                                style: { backgroundColor: '#1976d2', height: '3px' },
                            }}
                            sx={{
                                backgroundColor: '#ffffff',
                                borderRadius: 2,
                                mb: 2,
                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                                minWidth: 'max-content', // Prevents tab container from shrinking too much
                                '& .MuiTab-root': {
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    py: 1.5,
                                    minWidth: 100,
                                    px: 2,
                                    whiteSpace: 'nowrap', // Prevents text wrapping
                                },
                            }}
                        >
                            <Tab
                                label="Birthday"
                                icon={<CakeIcon />}
                                iconPosition="start"
                                sx={{
                                    color: tabValue === 0 ? '#1976d2' : '#6b7280',
                                    backgroundColor: tabValue === 0 ? '#e3f2fd' : 'transparent',
                                }}
                            />
                            <Tab
                                label="Work Anniversaries"
                                icon={<PeopleIcon />}
                                iconPosition="start"
                                sx={{
                                    color: tabValue === 1 ? '#1976d2' : '#6b7280',
                                    backgroundColor: tabValue === 1 ? '#e3f2fd' : 'transparent',
                                }}
                            />
                            <Tab
                                label="New Joiners"
                                icon={<PersonAddIcon />}
                                iconPosition="start"
                                sx={{
                                    color: tabValue === 2 ? '#1976d2' : '#6b7280',
                                    backgroundColor: tabValue === 2 ? '#e3f2fd' : 'transparent',
                                }}
                            />
                        </Tabs>
                    </Box>

                    <Divider sx={{ my: 2, backgroundColor: '#cbd5e1' }} />

                    <Paper
                        elevation={2}
                        sx={{
                            p: isMobile ? 1.5 : 1,
                            background: 'linear-gradient(to right, #fdfcfb, #e2d1c3)',
                            borderRadius: isMobile ? 2 : 3,
                            border: '1px solid #e0e0e0',
                            width: '100%',
                            overflowX: 'auto', // Prevent horizontal overflow on small screens
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            {tabValue === 0 && (
                                <>
                                    {/* {renderSectionHeader(<CakeIcon color="primary" />, 'Birthday Today')} */}
                                    <Birthday />
                                </>
                            )}
                            {tabValue === 1 && (
                                <>
                                    {/* {renderSectionHeader(<PeopleIcon color="primary" />, 'Work Anniversaries')} */}
                                    <WorkAnniversaries />
                                </>
                            )}
                            {tabValue === 2 && (
                                <>
                                    {/* {renderSectionHeader(<PersonAddIcon color="primary" />, 'New Joiners')} */}
                                    <NewJoiner />
                                </>
                            )}
                        </Box>
                    </Paper>

                </CardContent>
            </Card>
        </Box>
    );
};

export default Index;
