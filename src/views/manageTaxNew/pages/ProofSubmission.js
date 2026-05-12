import React from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';

const ProofSubmission = () => {
  const proofs = [
    {
      title: '80C (PPF)',
      status: 'Approved',
      color: '#2563eb',
      icon: (
        <CheckBoxIcon
          sx={{
            fontSize: 18,
            color: '#22c55e',
          }}
        />
      ),
    },
    {
      title: '80D (Health Insurance)',
      status: 'Pending',
      color: '#d97706',
      icon: (
        <HourglassTopOutlinedIcon
          sx={{
            fontSize: 18,
            color: '#f59e0b',
          }}
        />
      ),
    },
    {
      title: 'HRA Rent receipts',
      status: '10/12 uploaded',
      color: '#059669',
      icon: (
        <CheckBoxIcon
          sx={{
            fontSize: 18,
            color: '#22c55e',
          }}
        />
      ),
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
          mb: 3,
        }}
      >
        Proof Submission Status
      </Typography>

      {/* Status List */}

      <Stack spacing={2.5}>
        {proofs.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left Text */}

            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#0f172a',
              }}
            >
              {item.title}
            </Typography>

            {/* Right Status */}

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              {item.icon}

              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: item.color,
                }}
              >
                {item.status}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Button */}

      <Button
        fullWidth
        variant="outlined"
        sx={{
          mt: 4,
          textTransform: 'none',
          borderRadius: '10px',
          py: 1.2,
          fontWeight: 600,
          borderColor: '#cbd5e1',
          color: '#0f172a',

          '&:hover': {
            borderColor: '#94a3b8',
            backgroundColor: '#f8fafc',
          },
        }}
      >
        Upload missing proofs
      </Button>
    </Paper>
  );
};

export default ProofSubmission;