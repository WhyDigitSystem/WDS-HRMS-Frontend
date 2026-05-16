import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiCalls from 'apicall';
import { styled, useTheme, alpha } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography,
  Badge,
  IconButton,
  Modal,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  useMediaQuery,
  TextField,
  InputLabel,
  Tooltip
} from '@mui/material';

// Icons
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconMail,
  IconDashboard,
  IconCreditCard,
  IconChevronDown,
  IconBellRinging,
  IconBuildingBank,
  IconId,
  IconPhone,
  IconMapPin
} from '@tabler/icons-react';

// Project imports
import User1 from 'assets/images/users/user-round.svg';
import Transitions from 'ui-component/extended/Transitions';
import ChangePasswordPopup from 'utils/ChangePassswordPopup';
import { showToast } from 'utils/toast-component';
import { Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSnackbar } from 'notistack';


// Styled component for the profile popover
const ProfilePopper = styled(Paper)(({ theme }) => ({
  overflow: 'hidden',
  border: 'none',
  boxShadow: theme.shadows[24],
  borderRadius: 16,
  width: 300,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  backdropFilter: 'blur(12px)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
  }
}));

const ProfileSection = () => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);
  const navigate = useNavigate();
  const [empcode, setEmpCode] = useState(localStorage.getItem('employeeCode'));
  const [empName, setEmpName] = useState(localStorage.getItem('employeeName'));
  const [designation, setDesignation] = useState(localStorage.getItem('designation'));
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [employeeData, setEmployeeData] = useState('');
  const anchorRef = useRef(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  // const [uploadedFiles, setUploadedFiles] = useState([]);

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/pages/login/login3');
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListItemClick = (event, index, route = '') => {
    setSelectedIndex(index);
    handleClose(event);

    if (index === 0) {
      // My Profile clicked
      setProfileModalOpen(true);
    } else if (route) {
      navigate(route);
    }
  };

  const handleMenuClick = (event, index) => {
    setSelectedIndex(index);
    handleClose(event);

    if (index === 1) {
      setDocumentModalOpen(true); // Open document upload modal
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setDocumentName(e.target.files[0]?.name || '');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      enqueueSnackbar('Please select a file before uploading', { variant: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('orgId', orgId);
    formData.append('employeeCode', empcode);
    formData.append('employeeName', empName);
    formData.append('documentName', documentName);

    try {
      const response = await apiCalls(
        'post',
        '/employeedocuments/uploademployeeDoc',
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );

      if (response.status === true) {
        const message = response.paramObjectsMap?.message || 'Upload Successful!';
        enqueueSnackbar(message, { variant: 'success' });

        // Clear fields & refresh
        setSelectedFile(null);
        setDocumentName('');
        setDocumentModalOpen(false);
        fetchUploadedDocuments(); // refresh the list after upload
      } else {
        const errorMessage = response.paramObjectsMap?.errorMessage || 'Upload Failed';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (error) {
      console.error('Upload Failed:', error);
      enqueueSnackbar('Upload Failed: Something went wrong', { variant: 'error' });
    }
  };

  const fetchUploadedDocuments = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/employeedocuments/getEmployeeDocumentsByEmpCodeAndOrgId?employeeCode=${empcode}&orgId=${orgId}`
      );
      const docs = response?.paramObjectsMap?.employeeDocumentsVO || [];
      setUploadedDocs(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      enqueueSnackbar('Failed to load documents', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (documentModalOpen) {
      fetchUploadedDocuments();
    }
  }, [documentModalOpen]);

  const handleDownload = (doc) => {
    const byteCharacters = atob(doc.fileData);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: doc.contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = doc.documentName;
    link.click();
  };


  const handleDelete = async (doc) => {
    try {
      const response = await apiCalls(
        'delete',
        `/employeedocuments/employeeDocDeleteById/${doc.id}`
      );

      if (response.status === true) {
        const message = response.paramObjectsMap?.message || 'Document deleted successfully';
        enqueueSnackbar(message, { variant: 'success' });
        fetchUploadedDocuments(); // Refresh list
      } else {
        enqueueSnackbar(response.paramObjectsMap?.errorMessage || 'Failed to delete', {
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar('Error while deleting document', { variant: 'error' });
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setDocumentName('');
    enqueueSnackbar('File selection cleared', { variant: 'info' });
  };

  const handleView = (doc) => {
    const { fileData, contentType } = doc;

    const byteCharacters = atob(fileData);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    getAllEmployeeData();
  }, []);

  const getAllEmployeeData = useCallback(async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      const employeeCode = localStorage.getItem('employeeCode');

      if (!orgId || !employeeCode) {
        console.error('Organization ID or Employee Code missing');
        return;
      }

      const result = await apiCalls('get', `/master/getAllEmployeeByOrgIdAndEmployeeCode?employeeCode=${employeeCode}&orgId=${orgId}`);

      if (result?.paramObjectsMap?.employeeVO?.length > 0) {
        const empData = result.paramObjectsMap.employeeVO[0];
        setEmployeeData(empData);

        // Update state or localStorage with the fetched data
        if (empData.employeeName) {
          setEmpName(empData.employeeName);
          localStorage.setItem('employeeName', empData.employeeName);
        }
        if (empData.designation) {
          setDesignation(empData.designation);
          localStorage.setItem('designation', empData.designation);
        }
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
    }
  }, []);

  return (
    <>
      <div>
        <IconButton
          ref={anchorRef}
          onClick={handleToggle}
          sx={{
            p: 0,
            position: 'relative',
            '&:hover': {
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              />
            }
          >
            <Avatar
              src={`data:image/png;base64,${employeeData?.profileImage}`}
              sx={{
                width: 40,
                height: 40,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: `2px solid ${theme.palette.primary.main}`,
                  transform: 'scale(1.1)'
                }
              }}
            />
          </Badge>
          <IconChevronDown
            size={20}
            style={{
              marginLeft: 4,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              color: theme.palette.text.secondary
            }}
          />
        </IconButton>

        <Popper
          placement="bottom-end"
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 12]
              }
            }
          ]}
          sx={{
            zIndex: 1300
          }}
        >
          {({ TransitionProps }) => (
            <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
              <ProfilePopper>
                <ClickAwayListener onClickAway={handleClose}>
                  <Box>
                    {/* Header with user info */}
                    <Box
                      sx={{
                        p: 2,
                        pb: 1.5,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 100%)`
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={`data:image/png;base64,${employeeData?.profileImage}`}
                          sx={{
                            width: 40,
                            height: 40,
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              border: `2px solid ${theme.palette.primary.main}`,
                              transform: 'scale(1.1)'
                            }
                          }}
                        />
                        <Stack>
                          <Typography variant="h6" fontWeight={700}>
                            {empName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {empcode} - {designation}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        <Chip
                          icon={<IconMail size={16} />}
                          label={employeeData?.email || 'N/A'}
                          size="small"
                          sx={{
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.primary.light, 0.1),
                            color: theme.palette.text.primary,
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        />
                        <Chip
                          label={employeeData?.active === 'Active' ? 'active' : 'inactive'}
                          size="small"
                          sx={{
                            borderRadius: 4,
                            bgcolor:
                              employeeData?.active === 'Active'
                                ? alpha(theme.palette.success.light, 0.2)
                                : alpha(theme.palette.error.light, 0.2),
                            color: employeeData?.active === 'Active' ? theme.palette.success.main : theme.palette.error.main
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Menu Items */}
                    <Box sx={{ p: 1.5 }}>
                      <List
                        disablePadding
                        sx={{
                          '& .MuiListItem-root': {
                            borderRadius: `${customization.borderRadius}px`,
                            mb: 0.75,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              bgcolor: alpha(theme.palette.primary.light, 0.08)
                            }
                          }
                        }}
                      >
                        {/* My Profile Item */}
                        <ListItem disablePadding>
                          <ListItemButton
                            sx={{
                              py: 1.25,
                              '&.Mui-selected': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderLeft: `2px solid ${theme.palette.primary.main}`
                              }
                            }}
                            selected={selectedIndex === 0}
                            onClick={(event) => handleListItemClick(event, 0)}
                          >
                            <ListItemIcon sx={{ minWidth: 38 }}>
                              <IconUser size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={500}>
                                  My Profile
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                          <ListItemButton
                            sx={{
                              py: 1.25,
                              '&.Mui-selected': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderLeft: `2px solid ${theme.palette.primary.main}`
                              }
                            }}
                            onClick={(event) => handleMenuClick(event, 1)}
                          >
                            <ListItemIcon sx={{ minWidth: 38 }}>
                              <IconUser size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={500}>
                                  Document
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>


                        {/* Change Password */}
                        <ListItem disablePadding>
                          <ChangePasswordPopup>
                            <ListItemButton
                              sx={{
                                py: 1.25,
                                '&.Mui-selected': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  borderLeft: `2px solid ${theme.palette.primary.main}`
                                }
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 38 }}>
                                <IconCreditCard size="1.3rem" />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="body1" fontWeight={500}>
                                    Change Password
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ChangePasswordPopup>
                        </ListItem>

                        {/* Divider */}
                        <Divider
                          sx={{
                            my: 1,
                            borderColor: alpha(theme.palette.divider, 0.1),
                            opacity: 0.5
                          }}
                        />

                        {/* Logout Item */}
                        <ListItem disablePadding>
                          <ListItemButton
                            sx={{
                              py: 1.25,
                              '&.Mui-selected': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderLeft: `2px solid ${theme.palette.primary.main}`
                              }
                            }}
                            onClick={handleLogout}
                          >
                            <ListItemIcon sx={{ minWidth: 38 }}>
                              <IconLogout size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={500}>
                                  Logout
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      </List>
                    </Box>
                  </Box>
                </ClickAwayListener>
              </ProfilePopper>
            </Transitions>
          )}
        </Popper>
      </div>
      <div>
        {/* Profile Modal */}
        <Dialog
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: isMobile ? 0 : 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
              backdropFilter: 'blur(12px)'
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={`data:image/png;base64,${employeeData?.profileImage}`}
                sx={{
                  width: 40,
                  height: 40,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `2px solid ${theme.palette.primary.main}`,
                    transform: 'scale(1.1)'
                  }
                }}
              />
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {employeeData?.employeeName || empName} - {employeeData?.employeeCode || empcode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employeeData?.designation || designation}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'} // Scrollable tabs on mobile
              scrollButtons={isMobile ? 'auto' : false} // Allow scrolling on mobile
              sx={{
                mb: 3,
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: '4px 4px 0 0'
                }
              }}
            >
              <Tab label={isMobile ? 'Personal' : 'Personal Information'} icon={<IconUser size={20} />} iconPosition="start" />
              <Tab label={isMobile ? 'Bank' : 'Bank Details'} icon={<IconBuildingBank size={20} />} iconPosition="start" />
            </Tabs>

            {activeTab === 0 && employeeData && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={3}>


                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <IconMail color={theme.palette.secondary.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="h6">{employeeData.email || 'N/A'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <IconPhone color={theme.palette.success.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Mobile
                        </Typography>
                        <Typography variant="h6">{employeeData.mobileNo || 'N/A'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <IconMapPin color={theme.palette.warning.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="h6">{employeeData.employeeAddress || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <IconUser color={theme.palette.info.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Gender
                        </Typography>
                        <Typography variant="h6">{employeeData.gender || 'N/A'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                        <IconId color={theme.palette.error.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Aadhar No
                        </Typography>
                        <Typography variant="h6">{employeeData.aadharNo || 'N/A'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <IconId color={theme.palette.primary.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          PAN No
                        </Typography>
                        <Typography variant="h6">{employeeData.panNo || 'N/A'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <IconDashboard color={theme.palette.secondary.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="h6">{employeeData.department || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && employeeData && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <IconBuildingBank color={theme.palette.info.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bank Name
                        </Typography>
                        <Typography variant="h6">{employeeData.bankName || 'N/A'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <IconCreditCard color={theme.palette.primary.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Account Number
                        </Typography>
                        <Typography variant="h6">{employeeData.accountNo || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <IconSettings color={theme.palette.secondary.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          IFSC Code
                        </Typography>
                        <Typography variant="h6">{employeeData.ifscCode || 'N/A'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <IconBuildingBank color={theme.palette.warning.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bank Branch
                        </Typography>
                        <Typography variant="h6">{employeeData.branch || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ pt: 2 }}>
            <Button onClick={() => setProfileModalOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: 4 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={documentModalOpen} onClose={() => setDocumentModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogContent dividers>
            {uploadedDocs.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Uploaded Documents:
                </Typography>

                <List dense>
                  {uploadedDocs.map((doc, index) => (
                    <ListItem
                      key={index}
                      divider
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton edge="end" onClick={() => handleView(doc)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton edge="end" onClick={() => handleDownload(doc)}>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton edge="end" onClick={() => handleDelete(doc)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={<Typography fontWeight="500">{doc.documentName}</Typography>}
                        secondary={doc.uploadedDate ? `Uploaded on: ${doc.uploadedDate}` : null}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            <Box mt={2}>
              <InputLabel sx={{ mb: 1, fontWeight: 'bold' }}>Choose File</InputLabel>
              <Button variant="outlined" component="label" sx={{ textTransform: 'none' }}>
                Select File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>

              {selectedFile && (
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    Selected: <strong>{selectedFile.name}</strong>
                  </Typography>
                  <Tooltip title="Clear Selection">
                    <IconButton size="small" onClick={handleClearFile}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDocumentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained" disabled={!selectedFile}>
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};
export default ProfileSection;