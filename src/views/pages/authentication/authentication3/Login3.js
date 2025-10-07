import { Link } from 'react-router-dom';

// material-ui
import { Chip, Divider, Grid, Stack, Typography, useMediaQuery, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
// import LogoImage from '../../../../assets/images/Why-Digit-Systems-Pvt-Ltd-logo-removebg-preview.png';
import LogoImage from '../../../../assets/images/BIN_BEE.png';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthWrapper1 from '../AuthWrapper1';
import AuthLogin from '../auth-forms/AuthLogin';

// ================================|| AUTH3 - LOGIN ||================================ //

const bevanRegularStyle = {
  fontFamily: "'Bevan', serif",
  fontWeight: 300,
  fontStyle: 'normal',
  fontSize: 25,
  color: '#673ab7'
};

const Login = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AuthWrapper1>
      <Grid
        className="login-background"
        container
        direction="column"
        justifyContent="flex-end"
        sx={{
          minHeight: '100vh',
          overflow: 'hidden',
          px: matchDownSM ? 1 : 2
        }}
      >
        <Grid item xs={12}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              minHeight: 'calc(100vh - 68px)',
              overflow: 'hidden'
            }}
          >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={8} sx={{ px: matchDownSM ? 1 : 0 }}>
              {/* Bubble Container */}
              <Box className="bubble-container" sx={{ position: 'absolute', width: '100%', height: '100%' }}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`bubble bubble-${i + 1}`} />
                ))}
              </Box>

              <AuthCardWrapper className="glass-card" sx={{ px: matchDownSM ? 2 : 3, py: matchDownSM ? 3 : 4 }}>
                <Grid container direction="column" spacing={2} alignItems="center" justifyContent="center">
                  {/* Logo */}
                  <Grid item sx={{ mb: matchDownSM ? 1 : 2 }}>
                    <Link to="#">
                      <img
                        src={LogoImage}
                        alt="logo"
                        style={{
                          width: matchDownSM ? '120px' : '150px',
                          height: 'auto'
                        }}
                      />
                    </Link>
                  </Grid>

                  <Typography
                    style={{
                      ...bevanRegularStyle,
                      fontSize: matchDownSM ? 20 : 25,
                      color: 'white'
                    }}
                    gutterBottom
                    variant={matchDownSM ? 'h6' : 'h4'}
                  >
                    HRMS
                  </Typography>

                  <Grid item xs={12}>
                    <AuthLogin />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ display: 'none' }} />
                  </Grid>

                  <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
                    <Chip
                      label="© 2025 Why Digit System Private Limited."
                      disabled
                      size="small"
                      sx={{
                        cursor: 'pointer',
                        color: 'white',
                        backgroundColor: 'transparent',
                        border: '1px solid white',
                        '& .MuiChip-label': {
                          color: 'white',
                          fontSize: matchDownSM ? '0.65rem' : '0.75rem'
                        },
                        opacity: 1
                      }}
                    />
                  </Stack>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
};

export default Login;
