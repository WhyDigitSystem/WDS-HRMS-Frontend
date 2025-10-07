import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Stack,
  IconButton,
  Divider,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const Previous = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRefresh = () => {
    // Placeholder for refresh logic
    console.log("Refresh clicked");
  };

  return (
    <>
      <Box px={{ xs: 2, sm: 3 }} py={3} bgcolor="#f9fbfc" minHeight="100vh">
        {/* Header */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={3}
          gap={2}
        >
          <Typography variant="h5" fontWeight="bold">
            Previous Employment Details
          </Typography>

          <IconButton
            onClick={handleRefresh}
            color="primary"
            size="medium"
            sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Section Intro */}
        <Typography variant="body1" color="text.secondary" mb={2}>
          This section shows your previous organization’s employment & salary details for tax calculation purposes.
        </Typography>

        {/* Card / Alert / Placeholder */}
        <Stack spacing={3}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Previous Employer Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Replace this Alert with data rendering if API is connected */}
            <Alert severity="info">
              No previous employment details found for this financial year.
            </Alert>
          </Paper>

          {/* Additional Guidance */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You can contact your HR to update previous employment records or upload supporting documents if required.
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </>
  );
};

export default Previous;
