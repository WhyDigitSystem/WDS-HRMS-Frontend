import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import apiCalls from 'apicall';

const StatsCards = ({ refreshTrigger }) => {
  const [counts, setCounts] = useState({
    totalCount: 0,
    pendingCount: 0,
    completedCount: 0
  });

  const [loading, setLoading] = useState(true);

  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');

  const getSeparationCounts = async () => {
    setLoading(true);

    try {
      const response = await apiCalls(
        'get',
        `employeseparation/getInitiateSeparationCountByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );

      if (response?.status) {
        const data =
          response.paramObjectsMap?.initiateSeparationVO?.[0] || {};

        setCounts({
          totalCount: data.totalCount || 0,
          pendingCount: data.pendingCount || 0,
          completedCount: data.completedCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSeparationCounts();
  }, [refreshTrigger]);

  const stats = [
    {
      label: 'TOTAL CASES',
      value: counts.totalCount,
      icon: <TrendingUpIcon sx={{ fontSize: 16 }} />,
      color: '#3a6b6d'
    },
    {
      label: 'IN PROGRESS',
      value: counts.pendingCount,
      icon: <HourglassBottomIcon sx={{ fontSize: 16 }} />,
     color: '#3a6b6d'
    },
    {
      label: 'COMPLETED',
      value: counts.completedCount,
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
     color: '#3a6b6d'
    }
  ];

  return (
    <Grid container spacing={1.5}>
      {loading ? (
        <Grid item xs={12}>
          <Box
            sx={{
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress
              size={22}
              sx={{
                color: '#3a6b6d'
              }}
            />

            <Typography
              sx={{
                mt: 1,
                fontSize: '11px',
                color: '#64748b',
                fontWeight: 500
              }}
            >
              Loading statistics...
            </Typography>
          </Box>
        </Grid>
      ) : (
        stats.map((stat, index) => (
          <Grid item xs={12} sm={4} md={4} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid #dbe4e6',
                background: '#fff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s ease',

                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 18px rgba(42,75,77,0.10)'
                },

                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: `linear-gradient(135deg, ${stat.color} 0%, #2a4b4d 100%)`
                }
              }}
            >
              <CardContent
                sx={{
                  px: 1.8,
                  py: 1.5,

                  '&:last-child': {
                    pb: 1.5
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5
                  }}
                >
                  {/* LEFT */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        mb: 0.5
                      }}
                    >
                      {stat.label}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: stat.color,
                        lineHeight: 1
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>

                  {/* RIGHT ICON */}
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '12px',
                      background: `${stat.color}15`,
                      border: `1px solid ${stat.color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                      flexShrink: 0
                    }}
                  >
                    {stat.icon}
                  </Box>
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