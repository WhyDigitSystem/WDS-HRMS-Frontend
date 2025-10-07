import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const TaxFiling = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      {/* Title */}
      <Typography variant="h6" fontWeight={600} mb={1}>
        Tax Filing
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Utilize our trusted partners to effortlessly e-file your ITR.
      </Typography>

      {/* Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Due date to file your ITR for FY 2023 - 2024 (AY 2024 - 2025) is{' '}
        <strong>July 31, 2024</strong>
      </Alert>

      <Grid container spacing={3}>
        {/* Cleartax */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isMobile ? 'flex-start' : 'center'}
                mb={1}
                gap={1}
              >
                <Typography variant="h6" fontWeight={600} display="flex" alignItems="center">
                  <img
                    src="https://assets.cleartax.in/cleartax-brand-logo.png"
                    alt="cleartax"
                    height="20"
                    style={{ marginRight: 8 }}
                  />
                  Cleartax
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                  size="small"
                  fullWidth={isMobile}
                >
                  File now
                </Button>
              </Box>
              <List dense>
                {[
                  'Login with PAN and validate through OTP',
                  'Prefill data in one click',
                  'Upload Form 16',
                  'File your Tax return in just 3 mins',
                ].map((text, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quicko */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isMobile ? 'flex-start' : 'center'}
                mb={1}
                gap={1}
              >
                <Typography variant="h6" fontWeight={600} display="flex" alignItems="center">
                  <img
                    src="https://assets.quicko.com/images/brand-logo.svg"
                    alt="quicko"
                    height="20"
                    style={{ marginRight: 8 }}
                  />
                  Quicko
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                  size="small"
                  fullWidth={isMobile}
                >
                  File now
                </Button>
              </Box>
              <List dense>
                {[
                  'Download Form 16 from efit hrms & upload it on Quicko',
                  'Auto-fetch income, deductions, and investments',
                  'Gain insights and e-file in a few clicks',
                ].map((text, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxspanner */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isMobile ? 'flex-start' : 'center'}
                mb={1}
                gap={1}
              >
                <Box>
                  <img
                    src="https://taxspanner.com/images/logo/logo.png"
                    alt="taxspanner"
                    height="30"
                    style={{ marginBottom: 4 }}
                  />
                  <Typography variant="caption" color="error">
                    A Zaggle Company
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                  size="small"
                  fullWidth={isMobile}
                >
                  File now
                </Button>
              </Box>
              <List dense>
                {[
                  'Step-by-step guided e-filing process',
                  'Dedicated support for tax planning',
                  'Secure document storage & retrieval',
                  'Get expert review before submission',
                ].map((text, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaxFiling;
