import React from 'react';
import { Box, Typography, styled, useTheme, Divider, Card } from '@mui/material';
import { Campaign as CampaignIcon } from '@mui/icons-material';
import Announcements from './Announcements';

// Styled Components
const CardWrapper = styled(Card)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light} 100%)`,
    color: theme.palette.text.primary,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '16px',
    padding: '11px',
    paddingLeft: '20px', // Prevent content from overlapping the strip
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '6px',
        height: '100%',
        backgroundColor: '#364152',
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.primary[800],
        borderRadius: '50%',
        opacity: 0.08,
        top: -85,
        right: -95,
    },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
    background: 'linear-gradient(145deg, #582222 0%, #6d5c9f 100%)',
    padding: '10px 16px',
    borderRadius: '8px',
    color: theme.palette.background.paper,
    transform: 'skewX(-5deg)',
    '& svg': {
        transform: 'rotate(-10deg)',
    },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    borderColor: theme.palette.secondary.main,
    marginBottom: theme.spacing(2),
    borderWidth: '2px',
}));

const Home = () => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', p: 0 }}>
            <CardWrapper sx={{ padding: '21px' }}>
                <HeaderBox>
                    <CampaignIcon color="inherit" fontSize="large" />
                    <Typography variant="h4" sx={{ color: 'inherit' }}>
                        Announcements
                    </Typography>
                </HeaderBox>
                <StyledDivider />
                <Box sx={{ mt:3}}>
                    <Announcements />
                </Box>
            </CardWrapper>
        </Box>
    );
};

export default Home;
