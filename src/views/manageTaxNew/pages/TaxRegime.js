import React from 'react';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

const TaxRegime= () => {
  const regimes = [
    {
      title: 'Old Regime',
      subtitle: 'With deductions',
      amount: '₹87,500',
      active: true,
    },
    {
      title: 'New Regime',
      subtitle: 'Standard deduction',
      amount: '₹1,17,000',
      active: false,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        p: 3,
        mt: 0,
      }}
    >
      {/* Title */}

      <Typography
        sx={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#0f172a',
          mb: 2,
        }}
      >
        Tax Regime Comparison
      </Typography>


      <Stack spacing={2}>
        {regimes.map((item, index) => (
          <Box
            key={index}
            sx={{
              border: item.active
                ? '1px solid #bfdbfe'
                : '1px solid #e2e8f0',

              backgroundColor: item.active
                ? '#eff6ff'
                : '#f8fafc',

              borderRadius: '12px',
              px: 2,
              py: 1.8,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              transition: '0.3s',

              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
           

            <Box>
              <Typography
                sx={{
                //   fontSize: '1.25rem',
                  fontWeight: 500,
                  color: '#0f172a',
                }}
              >
                {item.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  mt: 0.3,
                }}
              >
                {item.subtitle}
              </Typography>
            </Box>

            {/* Amount */}

            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: item.active
                  ? '#2563eb'
                  : '#334155',
              }}
            >
              {item.amount}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Footer Chip */}

      <Chip
        label="Old regime saves ₹29,500"
        sx={{
          mt: 2,
          backgroundColor: '#dcfce7',
          color: '#059669',
          fontWeight: 600,
          borderRadius: '20px',
        }}
      />
    </Paper>
  );
};

export default TaxRegime;