import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const TaxSavingInvestment = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box p={{ xs: 2, sm: 3 }} sx={{ backgroundColor: theme.palette.background.paper }}>
      {/* Section Title */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        Tax Saving Investment
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Explore investment avenues with our partners to save taxes and grow wealth.
      </Typography>

      <Grid container spacing={3}>
        {/* Cleartax Card */}
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3, transition: '0.3s ease', '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <img
                    src="https://assets.cleartax.in/cleartax-brand-logo.png"
                    alt="cleartax"
                    height="24"
                    style={{ marginRight: 8 }}
                  />
                  <Typography variant="h6" fontWeight={600}>Cleartax</Typography>
                </Box>
                <Button variant="contained" color="secondary" endIcon={<OpenInNewIcon />} size={isMobile ? 'small' : 'medium'}>
                  Invest & Save Tax
                </Button>
              </Box>

              <Typography mt={2} mb={1} fontWeight={600}>
                Wondering how to save taxes & grow your wealth at the same time?
              </Typography>

              <List dense>
                {[
                  'Save up to ₹ 45,000 in taxes via top-performing mutual funds.',
                  'Portfolio monitoring with re-balancing recommendations.',
                  '100% paperless investment journey with expert advisory.',
                  'Invest in ELSS mutual funds in under 5 minutes.',
                  'Higher returns & lower lock-in than PPF or tax-saving FDs.',
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

        {/* Taxspanner Card */}
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3, transition: '0.3s ease', '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <img
                    src="https://taxspanner.com/images/logo/logo.png"
                    alt="taxspanner"
                    height="30"
                  />
                  <Typography variant="caption" color="error">
                    A Zaggle Company
                  </Typography>
                </Box>
                <Button variant="contained" color="secondary" endIcon={<OpenInNewIcon />} size={isMobile ? 'small' : 'medium'}>
                  Invest & Save Tax
                </Button>
              </Box>

              <Typography mt={2} mb={1} fontWeight={600}>
                Maximize Your Tax Savings & Grow Your Wealth
              </Typography>

              <List dense>
                {[
                  'Pay ZERO tax on CTC up to ₹20 lakhs with TaxOptimizer®.',
                  'Boost take-home pay by up to 10%.',
                  'One-stop platform for Section 80C, NPS, and more.',
                  'Investment planning aligned with life goals.',
                  'Unified dashboard with transparent tracking.',
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

        {/* Dummy Partner Card */}
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3, transition: '0.3s ease', '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <img
                    src="https://via.placeholder.com/100x30?text=Partner"
                    alt="dummy"
                    height="24"
                    style={{ marginRight: 8 }}
                  />
                  <Typography variant="h6" fontWeight={600}>FinPartner</Typography>
                </Box>
                <Button variant="contained" color="secondary" endIcon={<OpenInNewIcon />} size={isMobile ? 'small' : 'medium'}>
                  Invest & Save Tax
                </Button>
              </Box>

              <Typography mt={2} mb={1} fontWeight={600}>
                Comprehensive Investment Solutions
              </Typography>

              <List dense>
                {[
                  'Smart tax-saving investments tailored to your profile.',
                  'Expert insights and financial health tracking.',
                  'Wide range of tax-saving instruments in one place.',
                  'Secure and user-friendly platform.',
                  'Instant documentation and paperless process.',
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

export default TaxSavingInvestment;
