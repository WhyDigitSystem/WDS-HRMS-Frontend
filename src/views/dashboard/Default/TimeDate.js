import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    useMediaQuery,
    Paper,
    Chip,
    Divider
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const CardWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
    },
    borderRadius: theme.shape.borderRadius * 3,
    background: '#0f0f0f',
    backgroundImage: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
    color: '#00ffe7',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(0, 255, 255, 0.2)',
}));

const TimeDate = ({ isLoading }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [location, setLocation] = useState({ city: '', country: '' });
    const [weather, setWeather] = useState({ temperature: '', condition: '' });

    const WEATHER_API_KEY = '33fb936b8c658a7d2743cfef282557cf';

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchLocationAndWeather = async () => {
            try {
                const locationResponse = await fetch('https://ipapi.co/json/');
                if (!locationResponse.ok) throw new Error('Failed to fetch location');
                const locationData = await locationResponse.json();
                setLocation({ city: locationData.city, country: locationData.country_name });

                const weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${locationData.city}&appid=${WEATHER_API_KEY}&units=metric`
                );
                if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
                const weatherData = await weatherResponse.json();

                setWeather({
                    temperature: `${Math.round(weatherData.main.temp)}°C`,
                    condition: weatherData.weather[0].main
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setLocation({ city: 'Unknown', country: '' });
                setWeather({ temperature: 'N/A', condition: 'N/A' });
            }
        };

        fetchLocationAndWeather();
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    });
    const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const getGreeting = () => {
        const hour = currentDateTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <CardWrapper className="mt-lg-2 mt-2">
            <Grid container spacing={4} direction="row" justifyContent="space-between" alignItems="center">
                <Grid item xs={12} sm={6}>
                    <Box display="flex" flexDirection="column" alignItems={isMobile ? 'center' : 'flex-start'} textAlign={isMobile ? 'center' : 'left'}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <AccessTimeIcon sx={{ fontSize: isMobile ? 36 : 48, mr: 1, color: '#00ffe7' }} />
                            <Typography
                                variant={isMobile ? 'h6' : 'h3'}
                                sx={{
                                    fontWeight: 700,
                                    color: '#00ffe7',
                                    textShadow: '0 0 10px #00ffe7',
                                    letterSpacing: 1,
                                }}
                            >
                                {getGreeting()}
                            </Typography>
                        </Box>

                        <Typography
                            variant={isMobile ? 'h5' : 'h2'}
                            sx={{
                                fontWeight: 'bold',
                                color: '#ffffff',
                                textShadow: '0 0 8px #00ffe7',
                                mb: isMobile ? 2 : 1,
                            }}
                        >
                            {formattedTime}
                        </Typography>

                        <Typography variant="body1" sx={{ mt: 1, color: '#a0f0ff' }}>
                            {formattedDate}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box display="flex" flexDirection="column" alignItems={isMobile ? 'center' : 'flex-end'} textAlign={isMobile ? 'center' : 'right'}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <LocationOnIcon sx={{ fontSize: isMobile ? 36 : 48, mr: 1, color: '#00ffe7' }} />
                            <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                                {location.city}, {location.country}
                            </Typography>
                        </Box>

                        {/* <Divider sx={{ my: 1, bgcolor: '#00ffe766', width: isMobile ? '90%' : '100%' }} /> */}

                        <Box display="flex" justifyContent={isMobile ? 'center' : 'flex-end'} flexWrap="wrap" gap={1}>
                            <Chip
                                icon={<AccessTimeIcon />}
                                label={`Time Zone: ${timeZone}`}
                                sx={{
                                    bgcolor: '#1e293b',
                                    color: '#00ffe7',
                                    borderRadius: 2,
                                    border: '1px solid #00ffe7',
                                    fontSize: isMobile ? '0.8rem' : 'inherit',
                                    padding: isMobile ? '2px 6px' : '6px 12px',
                                    '&:hover': {
                                        bgcolor: '#334155',
                                    }
                                }}
                            />
                            <Chip
                                icon={<WbSunnyIcon />}
                                label={`${weather.temperature} | ${weather.condition}`}
                                sx={{
                                    bgcolor: '#1e293b',
                                    color: '#00ffe7',
                                    borderRadius: 2,
                                    border: '1px solid #00ffe7',
                                    fontSize: isMobile ? '0.8rem' : 'inherit',
                                    padding: isMobile ? '2px 6px' : '6px 12px',
                                    '&:hover': {
                                        bgcolor: '#334155',
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Decorative background icon */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    fontSize: 160,
                    opacity: 0.05,
                    color: '#00ffe7',
                    pointerEvents: 'none',
                }}
            >
                <WbSunnyIcon fontSize="inherit" />
            </Box>
        </CardWrapper>
    );
};

TimeDate.propTypes = {
    isLoading: PropTypes.bool
};

export default TimeDate;
