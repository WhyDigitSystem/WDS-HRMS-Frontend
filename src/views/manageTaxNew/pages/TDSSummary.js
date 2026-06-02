import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const TDSsummary = () => {
  const months = [
    { month: 'Apr', amount: '₹8,250', active: false },
    { month: 'May', amount: '₹8,250', active: false },
    { month: 'Jun', amount: '₹8,250', active: false },
    { month: 'Jul', amount: '₹8,500', active: true },
    { month: 'Aug', amount: '₹8,250', active: false },
    { month: 'Sep', amount: '₹8,250', active: false }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #d6e6e6',
        borderRadius: '14px',
        p: 2.5,
        mt: 0,
        background: '#fff'
      }}
    >
      {/* TITLE */}
      <Typography
        sx={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#2a4b4d',
          mb: 2
        }}
      >
        Monthly TDS Deduction (FY 2024–25)
      </Typography>

      {/* MONTH CARDS */}
      <Grid container spacing={1}>
        {months.map((item, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Box
              sx={{
                border: item.active ? '1px solid #3a6b6d' : '1px solid #e5e7eb',
                backgroundColor: item.active ? '#e0f2f1' : '#f8fafc',
                borderRadius: '10px',
                py: 2,
                textAlign: 'center',
                transition: '0.25s',
                cursor: 'pointer',
                boxShadow: item.active ? '0 4px 12px rgba(58,107,109,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',

                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: '#3a6b6d'
                }
              }}
            >
              {/* MONTH */}
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: item.active ? '#2a4b4d' : '#64748b',
                  mb: 0.5
                }}
              >
                {item.month}
              </Typography>

              {/* AMOUNT */}
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: item.active ? '#2a4b4d' : '#334155'
                }}
              >
                {item.amount}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* TOTAL */}
      <Typography
        sx={{
          mt: 2.5,
          fontSize: '0.8rem',
          color: '#64748b'
        }}
      >
        Total TDS deducted till date:{' '}
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            color: '#2a4b4d'
          }}
        >
          ₹49,750
        </Box>
      </Typography>
    </Paper>
  );
};

export default TDSsummary;
