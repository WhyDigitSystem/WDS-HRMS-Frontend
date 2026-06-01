// src/components/AdvancedOfferLetterSystem/common/StatsCards.js
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar, Divider, CircularProgress } from '@mui/material';
import { AssignmentTurnedIn as OfferIcon, HourglassBottom as PendingIcon, CheckCircle as AcceptedIcon } from '@mui/icons-material';
import apiCalls from 'apicall';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

const StatsCards = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');

  // Fetch offer counts from API
  const getOfferCounts = async () => {
    try {
      const response = await apiCalls('get', `recruitmentmanagement/getCreateOfferCountByOrgId?branchCode=${branchCode}&orgId=${orgId}`);

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
      icon: <OfferIcon fontSize="inherit" />,
      color: '#3a6b6d',
      bg: 'rgba(58,107,109,0.10)'
    },
    {
      label: 'Pending',
      value: statsData?.pendingCount || '0',
      icon: <PendingIcon fontSize="inherit" />,
      color: '#3a6b6d',
      bg: 'rgba(58,107,109,0.10)'
    },
    {
      label: 'Accepted',
      value: statsData?.approvedCount || '0',
      icon: <AcceptedIcon fontSize="inherit" />,
      color: '#3a6b6d',
      bg: 'rgba(58,107,109,0.10)'
    },
    {
      label: 'Rejected',
      value: statsData?.rejectedCount || '0',
      icon: <CancelRoundedIcon fontSize="inherit" />,
      color: '#3a6b6d',
      bg: 'rgba(58,107,109,0.10)'
    }
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
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            elevation={0}
            sx={{
              height: 78,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              borderTop: `3px solid ${stat.color}`,
              background: '#fff',
              boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
              transition: 'all .25s ease',

              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(58,107,109,0.12)'
              }
            }}
          >
            <CardContent
              sx={{
                p: 1.5,
                height: '100%',
                '&:last-child': { pb: 1.5 }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748b',
                      lineHeight: 1.2
                    }}
                  >
                    {stat.label}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      mt: 0.3,
                      lineHeight: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: `${stat.color}15`,
                    color: stat.color,

                    '& svg': {
                      fontSize: 14
                    }
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
