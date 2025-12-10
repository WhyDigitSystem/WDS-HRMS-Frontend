import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, ButtonBase, Stack, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import LogoSection from '../LogoSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SearchSection from './SearchSection';

// assets
import { IconMenu2, IconSun, IconMoon } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import Modal from '@mui/material/Modal';

// import GlobalSection from './GlobalSection';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
  const [logo, setLogo] = useState(null);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [logoPreviewOpen, setLogoPreviewOpen] = useState(false);

  useEffect(() => {
    getCompanyDetails();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      if (response.status === true) {
        const particularCompany = response.paramObjectsMap.companyVO[0];
        setLogo(response.paramObjectsMap.companyVO);
        console.log('Company Details:', particularCompany);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          minWidth: { xs: 'auto', md: 140 },
          display: 'flex',
          alignItems: 'center',
          gap:'50px'
        }}
      >
        {/* <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box> */}
        <Box component="span" sx={{ display: { xs: 'none', sm: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>

        <ButtonBase
          sx={{
            borderRadius: '8px',
            overflow: 'hidden',
            // display: { xs: 'inline-flex', md: 'none' }, // Visible only on xs (mobile), hidden on sm and up
            // mr: 1
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>

      {/* header search */}
      <SearchSection />

      <Box sx={{ flexGrow: 1 }} />

      {/* Company logo */}
      {/* <Box
        sx={{
          display: {
            xs: logo && logo[0]?.companyLogo ? 'none' : 'flex',
            sm: 'flex'
          },
          flexDirection: 'column',
          alignItems: { xs: 'center', sm: 'flex-start' },
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-end' },
          width: { xs: '100%', md: 400 },
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'start' },
          mt: 1,
          mb: { xs: 1, md: 0 },
          gap: 1,
          ps: 2,
        }}
      >
        <Avatar
          sx={{
            fontSize: "16px",
            width: { xs: 80, sm: 100 },
            height: { xs: 60, sm: 75 },
            fontWeight: "bold",
            backgroundColor: "transparent",
            marginRight: { sm: "5px" },
            marginTop: { xs: 0, sm: "-10px" }
          }}
        >
          {logo && logo[0]?.companyLogo ? (
            <img
              src={`data:image/png;base64,${logo[0].companyLogo}`}
              alt="Company Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            "Upload Logo"
          )}
          <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
        </Avatar>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Box
            component="h6"
            sx={{
              mt: { xs: 0, sm: '-12px' },
              mb: 0.5,
              fontSize: '14px',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            {localStorage.getItem('companyName')}
          </Box>
          <Chip
            label={localStorage.getItem('branch')}
            size="small"
            color="primary"
            sx={{ fontSize: '11px', height: '20px' }}
          />
        </Box>
      </Box> */}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          mx: { xs: 0.5, sm: 1, md: 2 },
          minWidth: 'fit-content',
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: 40, sm: 70, md: 90 },
            height: { xs: 40, sm: 50, md: 65 },
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.03)'
            },
            flexShrink: 0
          }}
          onClick={() => setLogoPreviewOpen(true)}
        >
          {logo?.[0]?.companyLogo ? (
            <img
              src={`data:image/png;base64,${logo[0].companyLogo}`}
              alt="Company Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Typography variant="caption" sx={{ color: '#888', fontSize: '11px' }}>
              Logo
            </Typography>
          )}
          <input type="file" id="logo-upload" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            maxWidth: { sm: 120, md: 160 },
            cursor: 'pointer'
          }}
          onClick={() => setLogoPreviewOpen(true)}
        >
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'common.white',
              mb: 0.25,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {localStorage.getItem('companyName') || 'Company Name'}
          </Typography>
          <Chip
            label={localStorage.getItem('branch') || 'Branch'}
            size="small"
            color="primary"
            sx={{
              fontSize: '0.7rem',
              height: 22,
              px: 0.5,
              fontWeight: 500,
              maxWidth: '100%',
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                px: 0.5
              },
              display: { xs: 'none', sm: 'flex' } // Hide on xs, show on sm and above
            }}
          />
        </Box>
      </Box>

      {/* Right Side Actions */}
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>


        {/* Notification */}
        <NotificationSection />

        {/* Profile */}
        <ProfileSection />
      </Stack>
      <Modal
        open={logoPreviewOpen}
        onClose={() => setLogoPreviewOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1
          }}
        >
          {logo?.[0]?.companyLogo && (
            <img
              src={`data:image/png;base64,${logo[0]?.companyLogo}`}
              alt="Company Logo"
              style={{ width: '100%', height: '60%', objectFit: 'cover' }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
