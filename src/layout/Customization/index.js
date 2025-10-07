import { Button, Drawer, Fab, Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconHelp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { SET_BORDER_RADIUS, SET_FONT_FAMILY } from 'store/actions';
import { gridSpacing } from 'store/constant';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';

function valueText(value) {
  return `${value}px`;
}

const Customization = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const customization = useSelector((state) => state.customization);

  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };

  const [borderRadius, setBorderRadius] = useState(customization.borderRadius);
  const handleBorderRadius = (event, newValue) => {
    setBorderRadius(newValue);
  };

  const [fileName, setFileName] = useState('');

  useEffect(() => {
    dispatch({ type: SET_BORDER_RADIUS, borderRadius });
  }, [dispatch, borderRadius]);

  let initialFont;
  switch (customization.fontFamily) {
    case `'Inter', sans-serif`:
      initialFont = 'Inter';
      break;
    case `'Roboto', sans-serif`:
      initialFont = 'Roboto';
      break;
    case `' Poppins', sans-serif`:
    default:
      initialFont = 'Poppins';
      break;
  }

  const [fontFamily, setFontFamily] = useState(initialFont);
  useEffect(() => {
    let newFont;
    switch (fontFamily) {
      case 'Inter':
        newFont = `'Inter', sans-serif`;
        break;
      case 'Poppins':
        newFont = `'Poppins', sans-serif`;
        break;
      case 'Roboto':
      default:
        newFont = `'Roboto', sans-serif`;
        break;
    }
    dispatch({ type: SET_FONT_FAMILY, fontFamily: newFont });
  }, [dispatch, fontFamily]);

  // Help form state variables
  const [helpFormData, setHelpFormData] = useState({
    name: '',
    email: '',
    message: '',
    attachments: null
  });

  const handleHelpInputChange = (event) => {
    const { name, value, files } = event.target;
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setHelpFormData({
        ...helpFormData,
        [name]: value
      });
    }
  };

  const handleHelpSubmit = async (event) => {
    // event.preventDefault();
    // try {
    //   const formData = new FormData();
    //   Object.keys(helpFormData).forEach((key) => {
    //     formData.append(key, helpFormData[key]);
    //   });
    //   await apiCalls('post', 'path/to/help/api', formData);
    //   toast.success('Help request sent successfully!', {
    //     autoClose: 2000,
    //     theme: 'colored'
    //   });
    // } catch (error) {
    //   toast.error(`Error: ${error.message}`, {
    //     autoClose: 2000,
    //     theme: 'colored'
    //   });
    // }
  };

  return (
    <>
      <Tooltip title="Live Customize">
        <Fab
          component="div"
          onClick={handleToggle}
          size="medium"
          variant="circular"
          color="secondary"
          sx={{
            borderRadius: 0,
            borderTopLeftRadius: '50%',
            borderBottomLeftRadius: '50%',
            borderTopRightRadius: '50%',
            borderBottomRightRadius: '4px',
            bottom: '2%',
            position: 'fixed',
            right: 10,
            zIndex: theme.zIndex.speedDial
          }}
        >
          {/* <AnimateButton type="rotate"> */}
          <IconButton color="inherit" size="large" disableRipple>
            <IconHelp stroke={2} />
          </IconButton>
          {/* </AnimateButton> */}
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        onClose={handleToggle}
        open={open}
        PaperProps={{
          sx: {
            width: 300
          }
        }}
      >
        <PerfectScrollbar component="div">
          <Grid container spacing={gridSpacing} sx={{ p: 1 }}>
            <Grid item xs={12}>
              <SubCard title="Leave us a message">
                <form onSubmit={handleHelpSubmit}>
                  <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        size="small"
                        value={helpFormData.name}
                        onChange={handleHelpInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email ID"
                        name="email"
                        size="small"
                        value={helpFormData.email}
                        onChange={handleHelpInputChange}
                        type="email"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="How can I help you?"
                        name="message"
                        size="small"
                        value={helpFormData.message}
                        onChange={handleHelpInputChange}
                        multiline
                        rows={4}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" component="label" fullWidth sx={{ textTransform: 'none' }}>
                        Attach File
                        <input type="file" hidden name="attachments" onChange={handleHelpInputChange} />
                      </Button>
                    </Grid>
                    {fileName && (
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          File: {fileName}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ textTransform: 'none' }}>
                        Send
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </SubCard>
            </Grid>
          </Grid>
        </PerfectScrollbar>
      </Drawer>
    </>
  );
};

export default Customization;
