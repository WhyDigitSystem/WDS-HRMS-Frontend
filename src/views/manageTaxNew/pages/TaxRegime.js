import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

const TaxRegime = () => {
  const regimes = [
    {
      title: 'Old Regime',
      subtitle: 'With deductions',
      amount: '₹87,500',
      active: true
    },
    {
      title: 'New Regime',
      subtitle: 'Standard deduction',
      amount: '₹1,17,000',
      active: false
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #d6e6e6',
        borderRadius: '14px',
        p: 2,
        background: '#fff'
      }}
    >
      {/* Title */}
      <Typography
        sx={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#2a4b4d',
          mb: 2
        }}
      >
        Tax Regime Comparison
      </Typography>

      <Stack spacing={1.5}>
        {regimes.map((item, index) => (
          <Box
            key={index}
            sx={{
              border: item.active ? '1px solid #3a6b6d' : '1px solid #e5e7eb',
              backgroundColor: item.active ? '#e0f2f1' : '#f8fafc',
              borderRadius: '10px',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: '0.25s',
              cursor: 'pointer',
              boxShadow: item.active ? '0 4px 12px rgba(58,107,109,0.12)' : '0 2px 6px rgba(0,0,0,0.04)',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: '#3a6b6d'
              }
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#2a4b4d'
                }}
              >
                {item.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: '#64748b',
                  mt: 0.2
                }}
              >
                {item.subtitle}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: item.active ? '#2a4b4d' : '#475569'
              }}
            >
              {item.amount}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Footer */}
      <Chip
        label="Old regime saves ₹29,500"
        size="small"
        sx={{
          mt: 2,
          background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
          color: '#fff',
          fontWeight: 600,
          borderRadius: '16px'
        }}
      />
    </Paper>
  );
};

export default TaxRegime;
