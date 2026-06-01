import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { LockOutlined, LockResetOutlined, VerifiedUserOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconSettings } from '@tabler/icons-react';
import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { encryptPassword } from 'views/utilities/encryptPassword';

const ChangePasswordPopup = () => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });

  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClear = () => {
    setValues({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showPassword: false
    });
    setOpen(false);
  };

  const handleSave = async () => {
    if (!values.currentPassword || !values.newPassword || !values.confirmPassword) {
      toast.error('All fields are required', { autoClose: 2000, theme: 'colored' });
      return;
    }

    if (values.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long', { autoClose: 2000, theme: 'colored' });
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      toast.error('New password and confirm password do not match', { autoClose: 2000, theme: 'colored' });
      return;
    }

    if (values.currentPassword === values.newPassword) {
      toast.error('New password must be different from the current password', { autoClose: 2000, theme: 'colored' });
      return;
    }

    const userData = {
      newPassword: encryptPassword(values.newPassword),
      oldPassword: encryptPassword(values.currentPassword),
      userName: userName
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/changePassword`, userData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status) {
        toast.success(response.data.paramObjectsMap.message || 'Password changed successfully', {
          autoClose: 2000,
          theme: 'colored'
        });
        handleClear();
      } else {
        toast.error(response.data.paramObjectsMap.errorMessage || 'Error changing password', {
          autoClose: 2000,
          theme: 'colored'
        });
      }
    } catch (error) {
      toast.error('Network Error', { autoClose: 2000, theme: 'colored' });
    }
  };

  return (
    <>
      <ListItemButton
        sx={{
          borderRadius: '10px',
          transition: 'all 0.3s ease',
          color: 'black'
        }}
        onClick={handleOpen}
      >
        <ListItemIcon>
          <IconSettings stroke={1.5} size="1.3rem" />
        </ListItemIcon>
        <ListItemText sx={{ color: 'text.primary' }} primary={<Typography variant="body2">Change Password</Typography>} />
      </ListItemButton>

      <ToastContainer />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 18px 45px rgba(15,23,42,0.18)'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#fff',
            py: 1.8,
            background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
            letterSpacing: '0.3px'
          }}
        >
          Change Password
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            background: '#f8fafc'
          }}
        >
          <Stack spacing={3} mt={5}>
            <TextField
              label="Current Password"
              type={values.showPassword ? 'text' : 'password'}
              value={values.currentPassword}
              onChange={handleChange('currentPassword')}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#fff',

                  '&:hover fieldset': {
                    borderColor: '#3a6b6d'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#3a6b6d'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#3a6b6d' }} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="New Password"
              type={values.showPassword ? 'text' : 'password'}
              value={values.newPassword}
              onChange={handleChange('newPassword')}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#fff',

                  '&:hover fieldset': {
                    borderColor: '#3a6b6d'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#3a6b6d'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetOutlined sx={{ color: '#3a6b6d' }} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Confirm Password"
              type={values.showPassword ? 'text' : 'password'}
              value={values.confirmPassword}
              onChange={handleChange('confirmPassword')}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#fff',

                  '&:hover fieldset': {
                    borderColor: '#3a6b6d'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#3a6b6d'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VerifiedUserOutlined sx={{ color: '#3a6b6d' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{
                        color: '#3a6b6d',
                        '&:hover': {
                          backgroundColor: 'rgba(58, 107, 109, 0.08)'
                        }
                      }}
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClear}
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 600,
              borderColor: '#dc2626',
              color: '#dc2626',

              '&:hover': {
                borderColor: '#b91c1c',
                background: '#fee2e2'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',

              '&:hover': {
                background: 'linear-gradient(135deg, #467b7d 0%, #33595b 100%)'
              }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChangePasswordPopup;
