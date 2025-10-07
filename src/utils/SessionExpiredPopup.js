// components/SessionExpiredPopup.js
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import { useState } from 'react';

const SessionExpiredPopup = ({ open, onClose }) => {
  const [opened, setOpened] = useState(localStorage.getItem('sessionExpired'));
  const handleLoginRedirect = () => {
    setOpened(false);
    window.location.href = '/pages/login/login3';
    // Adjust the path to your login page
  };

  return (
    // <Dialog open={open}>
    //   <DialogTitle>
    //     {' '}
    //     <img src="https://cdn-icons-gif.flaticon.com/12146/12146036.gif" width={40} height={40}></img>
    //     <Typography className="mt-4" variant="h4" component="span" style={{ marginLeft: 10 }}>
    //       Session Expired
    //     </Typography>
    //   </DialogTitle>
    //   <Divider />
    //   <DialogContent>
    //     <p>Your session has expired. Please log in again.</p>
    //   </DialogContent>
    //   <DialogActions>
    //     <Box display="flex" justifyContent="center" width="100%">
    //       <Button variant="contained" component="label" onClick={handleLoginRedirect} color="secondary">
    //         Login
    //       </Button>
    //     </Box>
    //   </DialogActions>
    // </Dialog>
    <></>
  );
};

export default SessionExpiredPopup;
