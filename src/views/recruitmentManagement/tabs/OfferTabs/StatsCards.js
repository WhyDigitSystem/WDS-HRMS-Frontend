// src/components/AdvancedOfferLetterSystem/common/StatsCards.js
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar, Divider, CircularProgress } from '@mui/material';
import {
  AssignmentTurnedIn as OfferIcon,
  HourglassBottom as PendingIcon,
  CheckCircle as AcceptedIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';

const StatsCards = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');

  // Fetch offer counts from API
  const getOfferCounts = async () => {
    try {
      const response = await apiCalls(
        'get', 
        `recruitmentmanagement/getCreateOfferCountByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );

      if (response.status === true && response.paramObjectsMap.createOfferVO) {
        const counts = response.paramObjectsMap.createOfferVO[0];
        setStatsData(counts);
      } else {
        console.error('API Error:', response);
        setError('Failed to load offer statistics');
      }
    } catch (error) {
      console.error('Error fetching offer counts:', error);
      setError('Error loading statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOfferCounts();
  }, []);

  const stats = [
    {
      label: 'Total Offers',
      value: statsData?.totalCount || '0',
      icon: <OfferIcon />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    },
    {
      label: 'Pending',
      value: statsData?.pendingCount || '0',
      icon: <PendingIcon />,
      color: '#ed6c02',
      gradient: 'linear-gradient(135deg, #FFF4E3 0%, #FFE0B2 100%)',
    },
    {
      label: 'Accepted',
      value: statsData?.approvedCount || '0',
      icon: <AcceptedIcon />,
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Card
            elevation={3}
            sx={{
              height: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            {/* --- Card Header (Icon Area) --- */}
            <Box
              sx={{
                background: stat.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: stat.color,
                  color: '#fff',
                  width: 42,
                  height: 42,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {stat.icon}
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: stat.color,
                }}
              >
                {stat.value}
              </Typography>
            </Box>

            <Divider />

            {/* --- Card Content --- */}
            <CardContent sx={{ py: 0, px: 2.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  position: 'relative',
                  top: 12,
                  textAlign: 'left',
                }}
              >
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;