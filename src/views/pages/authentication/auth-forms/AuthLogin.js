import Axios from 'axios';
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setUserRole } from 'store/actions';
import { encryptPassword } from 'views/utilities/passwordEnc';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';

// material-ui
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiCalls from 'apicall';
import { setUser } from '../../../../redux/userSlice';


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const FirebaseLogin = ({ ...others }) => {
  const theme = useTheme();
  const scriptedRef = useScriptRef();
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openForgotPopup, setOpenForgotPopup] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const formikRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const user = useSelector((state) => state.user);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  useEffect(() => {
    const storedCredentials = localStorage.getItem('rememberedCredentials');
    if (storedCredentials) {
      const { email, password } = JSON.parse(storedCredentials);
      formikRef.current.setValues({ email, password });
      setChecked(true);
    }
  }, []);

  const resetForm = () => {
    if (formikRef.current) {
      formikRef.current.resetForm({
        values: {
          email: '',
          password: ''
        }
      });
    }
  };

  const getScreenAccess = async (orgId, roles) => {
    try {
      setLoading(true);
      const response = await apiCalls('get', `roles/getRolesPermissionHeaderByRoleandOrgid?orgid=${orgId}&role=${roles}`);

      const userList = response?.paramObjectsMap?.userVO;
      console.log('User List:', userList);

      if (Array.isArray(userList) && userList.length > 0) {
        const rolePermissions = userList[0]?.rolesPermissionVO || [];

        // Format and store in localStorage
        const screenAccessMap = {};
        rolePermissions.forEach((screen) => {
          screenAccessMap[screen.screenId] = {
            screenName: screen.screenName,
            canRead: screen.canRead,
            canWrite: screen.canWrite,
            canDelete: screen.canDelete
          };
        });

        localStorage.setItem('screenAccess', JSON.stringify(screenAccessMap));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginAPICall = async (values) => {
    const userData = {
      password: encryptPassword(values.password),
      userName: values.email
    };

    try {
      const response = await Axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, userData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status) {
        dispatch(setUser({ orgId: response.data.paramObjectsMap.userVO.orgId }));
        localStorage.setItem('orgId', response.data.paramObjectsMap.userVO.orgId);
        localStorage.setItem('userId', response.data.paramObjectsMap.userVO.usersId);
        localStorage.setItem('token', response.data.paramObjectsMap.userVO.token);
        localStorage.setItem('tokenId', response.data.paramObjectsMap.userVO.tokenId);
        localStorage.setItem('userName', response.data.paramObjectsMap.userVO.userName);
        localStorage.setItem('employeeCode', response.data.paramObjectsMap.userVO.employeeCode);
        localStorage.setItem('employeeName', response.data.paramObjectsMap.userVO.employeeName);
        localStorage.setItem('email', response.data.paramObjectsMap.userVO.email);
        localStorage.setItem('branch', response.data.paramObjectsMap.userVO.branch);
        localStorage.setItem('branchCode', response.data.paramObjectsMap.userVO.branchCode);
        localStorage.setItem('department', response.data.paramObjectsMap.userVO.department);
        localStorage.setItem('designation', response.data.paramObjectsMap.userVO.designation);
        localStorage.setItem('companyName', response.data.paramObjectsMap.userVO.companyName);

        const userType = response.data?.paramObjectsMap?.userVO?.userType;
        const role = response.data?.paramObjectsMap?.userVO?.roleVO?.[0]?.role;

        if (userType || role) {
          localStorage.setItem('userType', userType === 'SADMIN' || userType === 'ADMIN' ? userType : role);
        }

        const userRole = response.data.paramObjectsMap.userVO.roleVO;
        localStorage.setItem('ROLE', JSON.stringify(userRole));

        const roles = userRole.map((row) => ({ role: row.role }));
        localStorage.setItem('ROLES', JSON.stringify(roles));

        getScreenAccess(response.data.paramObjectsMap.userVO.orgId, roles[0]?.role);

        const roleVO = response.data.paramObjectsMap.userVO.roleVO;
        let allScreensVO = [];
        roleVO.forEach((roleObj) => {
          roleObj.responsibilityVO.forEach((responsibility) => {
            if (responsibility.screensVO) {
              allScreensVO = allScreensVO.concat(responsibility.screensVO);
            }
          });
        });
        allScreensVO = [...new Set(allScreensVO)];
        localStorage.setItem('screens', JSON.stringify(allScreensVO));
        dispatch(setUserRole(userRole));

        resetForm();
        {
          userType === 'SADMIN' ?
            navigate('/companysetup/createcompany') :
            navigate('/dashboard/default');
        }
        // navigate('/dashboard/default');
        // navigate('/dashboardpg');

        setTimeout(() => {
          window.location.reload();
        }, 2000);

        if (checked) {
          localStorage.setItem('rememberedCredentials', JSON.stringify({ email: values.email, password: values.password }));
        } else {
          localStorage.removeItem('rememberedCredentials');
        }
      } else {
        toast.error(response.data.paramObjectsMap.errorMessage, {
          autoClose: 2000,
          theme: 'colored'
        });
      }
    } catch (error) {
      toast.error('Network Error', {
        autoClose: 2000,
        theme: 'colored'
      });
    }
  };

  const forgotPasswordAPICall = async () => {
    if (!forgotEmail) {
      toast.error('Please enter username/email');
      return;
    }

    try {
      setLoading(true);

      const response = await Axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        {
          userName: forgotEmail
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        toast.success('OTP sent successfully', {
          autoClose: 2000,
          theme: 'colored'
        });

        setForgotStep(2);
      } else {
        toast.error(response.data?.paramObjectsMap?.errorMessage || 'Failed');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };


  const resetPasswordAPICall = async () => {
    if (!otp || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        newPassword: encryptPassword(newPassword),
        otp: otp.trim(),
        userName: forgotEmail.trim()
      };

      const response = await Axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-passwordNew`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        toast.success('Password reset successful', {
          autoClose: 2000,
          theme: 'colored'
        });

        setOpenForgotPopup(false);
        setShowForgotPassword(false);

        setForgotStep(1);
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
      } else {
        toast.error(
          response.data?.paramObjectsMap?.errorMessage || 'Reset failed'
        );
      }
    } catch (error) {
      toast.error('Reset password failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 500,
        margin: 'auto',
        borderRadius: 3,
        boxShadow: 'none',
        backgroundColor: 'transparent'
      }}
    >
      <ToastContainer />
      <Formik
        innerRef={formikRef}
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Email / UserName is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              loginAPICall(values);
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            {!showForgotPassword ? (
              <>
                <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 2 }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-email-login" sx={{ color: 'white' }}>
                    Email Address / Username
                  </InputLabel>

                  <Input
                    id="standard-adornment-email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={{ color: 'white' ,width:400}}
                  />

                  {touched.email && errors.email && (
                    <FormHelperText error>{errors.email}</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 2 }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-password-login" sx={{ color: 'white' }}>
                    Password
                  </InputLabel>

                  <Input
                    id="standard-adornment-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{ color: 'white' }}
                  />

                  {touched.password && errors.password && (
                    <FormHelperText error>{errors.password}</FormHelperText>
                  )}
                </FormControl>

                <Stack
                  direction="row"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        sx={{
                          color: 'white',
                          '&.Mui-checked': {
                            color: 'white'
                          }
                        }}
                      />
                    }
                    label="Remember me"
                    sx={{ color: 'white' }}
                  />

                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotStep(1);
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Stack>

                {errors.submit && (
                  <Box sx={{ mb: 2 }}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
                  </Box>
                )}

                <AnimateButton>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <Button
                      className="w-75"
                      disableElevation
                      disabled={isSubmitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        background: 'linear-gradient(135deg, #2a4b4d 0%, #273030 100%)',
                        borderRadius: '20px',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #466061 0%, #2a4b4d 100%)',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      Log in
                    </Button>
                  </Box>
                </AnimateButton>
              </>
            ) : (
              <>


                <Typography
                  sx={{
                    color: 'white',
                    textAlign: 'center',
                    mb: 3
                  }}
                >
                  {forgotStep === 1
                    ? 'Enter your email to receive OTP'
                    : 'Enter OTP and new password'}
                </Typography>

                {forgotStep === 1 ? (
                  <>
                    <FormControl fullWidth sx={{ mb: 3 }} variant="standard">
                      <InputLabel
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': {
                            color: 'white'
                          }
                        }}
                      >
                        UserName / Email
                      </InputLabel>

                      <Input
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        sx={{
                             width: 400,
                          '& input': {
                            color: 'white',
                            WebkitTextFillColor: 'white'
                          },

                          '&:before': {
                            borderBottom: '1px solid rgba(255,255,255,0.4)'
                          },

                          '&:hover:not(.Mui-disabled):before': {
                            borderBottom: '1px solid white'
                          },

                          '&:after': {
                            borderBottom: '2px solid white'
                          }
                        }}
                      />
                    </FormControl>

                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotStep(1);
                          setForgotEmail('');
                        }}
                        sx={{
                          borderRadius: '14px',
                          height: '45px',
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.4)',

                          '&:hover': {
                            borderColor: 'white',
                            background: 'rgba(255,255,255,0.08)'
                          }
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={forgotPasswordAPICall}
                        disabled={loading}
                        sx={{
                          borderRadius: '14px',
                          height: '45px',
                          background: 'linear-gradient(135deg, #466061 0%, #2a4b4d 100%)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                          transition: 'all 0.3s ease',

                          '&:hover': {
                            background: 'linear-gradient(135deg, #5b7a7c 0%, #35595b 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
                          },

                          '&.Mui-disabled': {
                            background: 'linear-gradient(135deg, #466061 0%, #2a4b4d 100%)',
                            color: 'white',
                            opacity: 0.8
                          }
                        }}
                      >
                        {loading ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <CircularProgress
                              size={18}
                              thickness={5}
                              sx={{ color: 'white' }}
                            />
                            <span>Submitting...</span>
                          </Stack>
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <FormControl fullWidth sx={{ mb: 3 }} variant="standard">
                      <InputLabel
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': {
                            color: 'white'
                          }
                        }}
                      >
                        UserName / Email
                      </InputLabel>

                      <Input
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        sx={{
                          '& input': {
                            width:400,
                            color: 'white',
                            WebkitTextFillColor: 'white'
                          },

                          '&:before': {
                            borderBottom: '1px solid rgba(255,255,255,0.4)'
                          },

                          '&:hover:not(.Mui-disabled):before': {
                            borderBottom: '1px solid white'
                          },

                          '&:after': {
                            borderBottom: '2px solid white'
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 3 }} variant="standard">
                      <InputLabel
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': {
                            color: 'white'
                          }
                        }}
                      >
                        OTP
                      </InputLabel>

                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        sx={{
                          width:400,
                          '& input': {
                            color: 'white',
                            WebkitTextFillColor: 'white'
                          },

                          '&:before': {
                            borderBottom: '1px solid rgba(255,255,255,0.4)'
                          },

                          '&:hover:not(.Mui-disabled):before': {
                            borderBottom: '1px solid white'
                          },

                          '&:after': {
                            borderBottom: '2px solid white'
                          }
                        }}
                      />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 3 }} variant="standard">
                      <InputLabel
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': {
                            color: 'white'
                          }
                        }}
                      >
                        New Password
                      </InputLabel>

                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                              sx={{ color: 'white' }}
                            >
                              {showNewPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                        sx={{
                          width:400,
                          '& input': {
                            color: 'white',
                            WebkitTextFillColor: 'white'
                          },

                          '&:before': {
                            borderBottom: '1px solid rgba(255,255,255,0.4)'
                          },

                          '&:hover:not(.Mui-disabled):before': {
                            borderBottom: '1px solid white'
                          },

                          '&:after': {
                            borderBottom: '2px solid white'
                          }
                        }}
                      />
                    </FormControl>

                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          setForgotStep(1);
                        }}
                        sx={{
                          borderRadius: '14px',
                          height: '45px',
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.4)',

                          '&:hover': {
                            borderColor: 'white',
                            background: 'rgba(255,255,255,0.08)'
                          }
                        }}
                      >
                        Back
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={resetPasswordAPICall}
                        disabled={loading}
                        sx={{
                          borderRadius: '14px',
                          height: '45px',
                          background: 'linear-gradient(135deg, #466061 0%, #2a4b4d 100%)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                          transition: 'all 0.3s ease',

                          '&:hover': {
                            background: 'linear-gradient(135deg, #5b7a7c 0%, #35595b 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
                          },

                          '&.Mui-disabled': {
                            background: 'linear-gradient(135deg, #466061 0%, #2a4b4d 100%)',
                            color: 'white',
                            opacity: 0.8
                          }
                        }}
                      >
                        {loading ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <CircularProgress
                              size={18}
                              thickness={5}
                              sx={{ color: 'white' }}
                            />
                            <span>Resetting...</span>
                          </Stack>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>
                    </Stack>
                  </>
                )}
              </>
            )}
          </form>
        )}
      </Formik>


    </Paper>
  );
};

export default FirebaseLogin;
