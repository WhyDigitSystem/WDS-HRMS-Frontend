import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiCalls from 'apicall';

const StatsCards = () => {
  const [counts, setCounts] = useState({
    totalCount: 0,
    pendingCount: 0,
    completedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));

  // ✅ Fetch API Data
  const getSeparationCounts = async () => {
    setLoading(true);
    try {
      const response = await apiCalls(
        'get',
        `employeseparation/getInitiateSeparationCountByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );

      if (response.status === true) {
        const data = response.paramObjectsMap.initiateSeparationVO?.[0] || {};
        setCounts({
          totalCount: data.totalCount || 0,
          pendingCount: data.pendingCount || 0,
          completedCount: data.completedCount || 0,
        });
      } else {
        console.error('Failed to fetch counts');
      }
    } catch (error) {
      console.error('Error fetching separation counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSeparationCounts();
  }, []);

  // 🧩 Card Config
  const stats = [
    {
      label: 'TOTAL CASES',
      value: counts.totalCount,
      icon: <TrendingUpIcon sx={{ fontSize: 30 }} />,
      color: '#2563eb',
      gradient: 'linear-gradient(145deg, #e3f2fd, #ffffff)',
    },
    {
      label: 'IN PROGRESS',
      value: counts.pendingCount,
      icon: <HourglassBottomIcon sx={{ fontSize: 30 }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(145deg, #fff8e1, #ffffff)',
    },
    {
      label: 'COMPLETED',
      value: counts.completedCount,
      icon: <CheckCircleIcon sx={{ fontSize: 30 }} />,
      color: '#16a34a',
      gradient: 'linear-gradient(145deg, #dcfce7, #ffffff)',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {loading ? (
        <Grid item xs={12} sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
            Loading stats...
          </Typography>
        </Grid>
      ) : (
        stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                background: stat.gradient,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 6px 20px ${stat.color}25`,
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 3,
                  px: 3,
                }}
              >
                {/* Icon Section */}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    boxShadow: `inset 0 0 6px ${stat.color}30`,
                  }}
                >
                  {stat.icon}
                </Box>

                {/* Value & Label */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#1e293b',
                      mb: 0.3,
                      letterSpacing: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      letterSpacing: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default StatsCards;
