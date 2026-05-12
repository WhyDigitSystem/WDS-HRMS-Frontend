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
    <>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          p: 3,
          mt: 0
        }}
      >
       

        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#0f172a',
            mb: 2
          }}
        >
          Monthly TDS Deduction (FY 2024–25)
        </Typography>

      

        <Grid container spacing={2}>
          {months.map((item, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Box
                sx={{
                  border: item.active ? '1px solid #bfdbfe' : '1px solid transparent',
                  backgroundColor: item.active ? '#eff6ff' : '#f8fafc',
                  borderRadius: '12px',
                  py: 2.5,
                  textAlign: 'center',
                  transition: '0.3s',

                  '&:hover': {
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: item.active ? '#2563eb' : '#64748b',
                    mb: 1
                  }}
                >
                  {item.month}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: item.active ? '#2563eb' : '#334155'
                  }}
                >
                  {item.amount}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

     
        <Typography
          sx={{
            mt: 3,
            fontSize: '0.75rem',
            color: '#64748b'
          }}
        >
          Total TDS deducted till date:{' '}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              color: '#475569'
            }}
          >
            ₹49,750
          </Box>
        </Typography>
      </Paper>
    </>
  );
};

export default TDSsummary;
