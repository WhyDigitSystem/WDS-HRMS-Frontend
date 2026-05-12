import React from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

const Form = () => {
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
          mb: 1,
        }}
      >
        Form 16 (Part A & B)
      </Typography>

      {/* Description */}

      <Typography
        sx={{
          fontSize: '0.95rem',
          color: '#475569',
          mb: 1,
        }}
      >
        Form 16 for FY 2024–25 will be available after{' '}
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            color: '#334155',
          }}
        >
          15th June 2025.
        </Box>
      </Typography>

      {/* Alert Box */}

      <Alert
        icon={<AccessTimeOutlinedIcon fontSize="inherit" />}
        severity="warning"
        sx={{
          mb: 2,
          borderRadius: '12px',
          backgroundColor: '#fefce8',
          color: '#b45309',
          border: '1px solid #fde68a',

          '& .MuiAlert-icon': {
            color: '#b45309',
          },
        }}
      >
        Previous year Form 16 (2023–24) available for
        download.
      </Alert>

      {/* Download Button */}

      <Button
        variant="outlined"
        startIcon={<DownloadOutlinedIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: '10px',
          px: 2.5,
          py: 1,
          borderColor: '#cbd5e1',
          color: '#0f172a',
          fontWeight: 600,

          '&:hover': {
            borderColor: '#94a3b8',
            backgroundColor: '#f8fafc',
          },
        }}
      >
        Download FY 2023–24
      </Button>
    </Paper>
  );
};

export default Form;