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
import {
  LockOutlined,
  LockResetOutlined,
  VerifiedUserOutlined
} from '@mui/icons-material';
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
        <ListItemText
          sx={{ color: 'text.primary' }}
          primary={<Typography variant="body2">Change Password</Typography>}
        />
      </ListItemButton>

      <ToastContainer />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#fff',
            py: 2,
            background: 'linear-gradient(193deg, #7bb9b4 30%, #009d90 90%)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }}
        >
          Change Password
        </DialogTitle>


        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={3} mt={5}>
            <TextField
              label="Current Password"
              type={values.showPassword ? 'text' : 'password'}
              value={values.currentPassword}
              onChange={handleChange('currentPassword')}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="primary" />
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetOutlined color="primary" />
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VerifiedUserOutlined color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword}>
                      {values.showPassword ? '🙊' : '🙈'}
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
            color="secondary"
            onClick={handleClear}
            sx={{
              textTransform: 'none',
              borderRadius: 3,
              px: 4,
              color: '#10413d',
              borderColor:'#10413d'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              borderRadius: 3,
              px: 4,
              background: 'linear-gradient(193deg, #7bb9b4 30%, #009d90 90%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradientrgb(7, 93, 86) 90%)'
              }
            }}
          >
            Change
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChangePasswordPopup;
