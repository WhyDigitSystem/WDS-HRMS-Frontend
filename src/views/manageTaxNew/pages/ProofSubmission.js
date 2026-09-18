import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';

const ProofSubmission = () => {
  const proofs = [
    {
      title: '80C (PPF)',
      status: 'Approved',
      color: '#16a34a',
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
    },
    {
      title: '80D (Health Insurance)',
      status: 'Pending',
      color: '#d97706',
      icon: <HourglassTopOutlinedIcon sx={{ fontSize: 18, color: '#d97706' }} />
    },
    {
      title: 'HRA Rent Receipts',
      status: '10/12 Uploaded',
      color: '#3a6b6d',
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#3a6b6d' }} />
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #d7e4e5',
        borderRadius: '14px',
        p: 2,
        height: '100%'
      }}
    >
      {/* Header */}

      <Typography
        sx={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#2a4b4d',
          mb: 2
        }}
      >
        Proof Submission Status
      </Typography>

      {/* List */}

      <Stack spacing={1.2}>
        {proofs.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.2,
              borderRadius: '10px',
              backgroundColor: '#f8fbfb',
              border: '1px solid #edf2f2'
            }}
          >
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#334155'
              }}
            >
              {item.title}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center">
              {item.icon}

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: item.color
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
        variant="contained"
        sx={{
          mt: 2,
          py: 0.8,
          textTransform: 'none',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.82rem',
          background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #345f61 0%, #233f41 100%)'
          }
        }}
      >
        Upload Missing Proofs
      </Button>
    </Paper>
  );
};

export default ProofSubmission;
