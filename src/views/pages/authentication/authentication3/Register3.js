import { Link } from 'react-router-dom';

// material-ui
import { Chip,Divider, Grid, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import AuthCardWrapper from '../AuthCardWrapper';
import AuthWrapper1 from '../AuthWrapper1';
import AuthRegister from '../auth-forms/AuthRegister';

import LogoImage from '../../../../assets/images/Why-Digit-Systems-Pvt-Ltd.png';

// assets

// ===============================|| AUTH3 - REGISTER ||=============================== //

const bevanRegularStyle = {
  fontFamily: "'Bevan', serif",
  fontWeight: 300,
  fontStyle: 'normal',
  fontSize: 25,
  color: '#673ab7',
};

const Register = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid item>
                    <Link to="#">
                      {/* <Logo /> */}
                      <img
                        src={LogoImage}
                        alt="logo"
                        style={{
                          width: '150px',
                          height: 'auto'
                        }}
                      ></img>
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center">
                      <Grid item>
                        <Stack alignItems="center" justifyContent="center" spacing={1}>
                          <Typography style={bevanRegularStyle} color={theme.palette.secondary.main} gutterBottom variant={matchDownSM ? 'h3' : 'h2'}>
                            Create Account
                          </Typography>
                          {/* <Typography variant="caption" fontSize="16px" textAlign={matchDownSM ? 'center' : 'inherit'}>
                            Enter your credentials to continue
                          </Typography> */}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Divider sx={{ display: 'none' }} />
                  </Grid>
                  <Grid item xs={12}>
                    <AuthRegister />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ display: 'none' }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item container direction="column" alignItems="center" xs={12}>
                      <Typography component={Link} to="/pages/login/login3" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                        Already have an account?
                      </Typography>
                    </Grid>
                  </Grid>
                  <Stack direction="row" justifyContent="center" sx={{ mb: 1, mt: 1 }}>
                    <Chip
                      label="©  2025 Why Digit System Private Limited." // Updated version content
                      disabled
                      chipcolor="secondary"
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  </Stack>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        {/* <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid> */}
      </Grid>
    </AuthWrapper1>
  );
};

export default Register;
