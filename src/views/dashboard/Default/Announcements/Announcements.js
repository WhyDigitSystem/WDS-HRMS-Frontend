import React, { useState, useEffect } from 'react';
import CampaignIcon from "@mui/icons-material/Campaign";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Button,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useMediaQuery,
  keyframes
} from '@mui/material';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const Announcements = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [listViewData, setListViewData] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewMoreModal, setOpenViewMoreModal] = useState(false);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const loginUserName = localStorage.getItem('userName');
  const [formData, setFormData] = useState({ active: true, topic: '', announcement: '', expiresDate: '' });
  const [editId, setEditId] = useState('');
  const [viewAllAnnouncements, setViewAllAnnouncements] = useState([]);

  const glow = keyframes`
    0% { box-shadow: 0 0 5px ${theme.palette.primary.main}; }
    50% { box-shadow: 0 0 20px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.secondary.main}; }
    100% { box-shadow: 0 0 5px ${theme.palette.primary.main}; }
  `;

  useEffect(() => {
    GetAnnouncementByOrgId();
  }, [orgId]);

  const GetAnnouncementByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/GetAnnouncementByOrgId?branchCode=${branchCode}&orgId=${orgId}&department=${department}`);
      if (result?.paramObjectsMap?.announcementVO) {
        const formattedData = result.paramObjectsMap.announcementVO.reverse();
        setListViewData(formattedData);
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setListViewData([]);
    }
  };

  const getAnnouncementById = async (row) => {
    const postId = row.id || row.original?.id;
    if (!postId) {
      toast.error('Invalid row data (missing ID)');
      return;
    }
    setEditId(postId);
    try {
      const result = await apiCalls('get', `/basicmaster/GetAnnouncementById?id=${postId}`);
      if (result?.paramObjectsMap?.announcementVO) {
        const announcementData = result.paramObjectsMap.announcementVO;
        setFormData({
          active: announcementData.active === 'Active',
          topic: announcementData.topic,
          announcement: announcementData.announcement,
          expiresDate: announcementData.expiresDate || '',
        });
        setOpenCreateModal(true);
      } else {
        toast.error('Failed to fetch announcement data');
      }
    } catch (err) {
      toast.error('Failed to fetch announcement data');
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.topic) errors.topic = 'Topic is required';
    if (!formData.announcement) errors.announcement = 'Announcement is required';
    if (!formData.expiresDate) errors.expiresDate = 'Expiration date is required';
    if (!orgId) errors.orgId = 'Organization ID is required';
    if (!loginUserName) errors.createdBy = 'Created By is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const saveFormData = {
      ...(editId && { id: editId }),
      active: formData.active,
      topic: formData.topic,
      announcement: formData.announcement,
      expiresDate: formData.expiresDate,
      orgId,
      createdBy: loginUserName,
      branchCode,
      branchName,
      department,
    };

    try {
      const result = await apiCalls('put', `/basicmaster/createUpdateAnnouncement`, saveFormData);
      if (result.status === true) {
        toast.success(editId ? 'Announcement Updated Successfully' : 'Announcement created successfully');
        setOpenCreateModal(false);
        GetAnnouncementByOrgId();
        setFormData({ topic: '', announcement: '', expiresDate: '' });
        setEditId('');
      } else {
        toast.error(result.paramObjectsMap?.errorMessage || 'Announcement creation failed');
      }
    } catch (err) {
      toast.error('Announcement creation failed. Please check the data and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setFormData({ topic: '', announcement: '', expiresDate: '' });
    setEditId('');
  };

  const cardStyle = {
    position: 'relative',
    margin: 2,
    // minHeight: 200,
    background: 'linear-gradient(145deg, #582222 0%, #6d5c9f 100%)',
    borderRadius: 4,
    color: theme.palette.common.white,
    overflow: 'hidden',
  };

  const announcementStyle = {
    // background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    padding: isMobile ? 2 : 3,
    backdropFilter: 'blur(5px)',
    // border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    minHeight: 150,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <Box sx={cardStyle}>
      <Box sx={{ position: 'relative', padding: isMobile ? 3 : 4, zIndex: 1 }}>
        <Box sx={announcementStyle}>
          {listViewData.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, mb: 2,color:'white' }}>
                {listViewData[0].topic}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {listViewData[0].announcement}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <NotificationsActiveIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                No current announcements
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
          <IconButton color="primary" onClick={() => setOpenCreateModal(true)}><AddIcon /></IconButton>
          <IconButton color="inherit" onClick={() => { setViewAllAnnouncements(listViewData); setOpenViewMoreModal(true); }}><VisibilityIcon /></IconButton>
        </Box>
        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '8px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
            <IconButton color="primary" onClick={() => setOpenCreateModal(true)} sx={{ marginLeft: 'auto', marginRight: '10px' }}>
              <AddIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => { setViewAllAnnouncements(listViewData); setOpenViewMoreModal(true); }} size="small">
              <VisibilityIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box> */}
      </Box>

      {/* Create/Edit Modal */}
      <Modal open={openCreateModal} onClose={handleCloseCreateModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          p: isMobile ? 2 : 4,
          width: isMobile ? '90%' : 400,
          maxHeight: '90vh',
          overflowY: 'auto',
          outline: 'none'
        }}>
          <Typography variant="h6" gutterBottom>
            {editId ? 'Edit Announcement' : 'Create New Announcement'}
          </Typography>
          <TextField fullWidth label="Topic" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} error={!!fieldErrors.topic} helperText={fieldErrors.topic} sx={{ mb: 3 }} />
          <TextField fullWidth multiline rows={4} label="Announcement" value={formData.announcement} onChange={(e) => setFormData({ ...formData, announcement: e.target.value })} error={!!fieldErrors.announcement} helperText={fieldErrors.announcement} sx={{ mb: 3 }} />
          <TextField fullWidth type="date" label="Expiration Date" InputLabelProps={{ shrink: true }} value={formData.expiresDate} onChange={(e) => setFormData({ ...formData, expiresDate: e.target.value })} error={!!fieldErrors.expiresDate} helperText={fieldErrors.expiresDate} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseCreateModal} color="secondary">Cancel</Button>
            <Button onClick={handleSave} variant="contained" color="primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
          </Box>
        </Box>
      </Modal>

      {/* View All Announcements Modal */}
      <Modal open={openViewMoreModal} onClose={() => setOpenViewMoreModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          p: isMobile ? 2 : 4,
          width: isMobile ? '90%' : '80%',
          maxHeight: '90vh',
          overflowY: 'auto',
          outline: 'none'
        }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            All Announcements
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {viewAllAnnouncements.map((announcement, idx) => (
              <React.Fragment key={announcement.id || idx}>
                <ListItem alignItems="flex-start" secondaryAction={
                  <IconButton edge="end" onClick={() => getAnnouncementById(announcement)}>
                    <EditIcon />
                  </IconButton>
                }>
                  <ListItemAvatar>
                    <Avatar><CampaignIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>{announcement.topic}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{announcement.announcement}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.6 }}>
                          Published: {new Date(announcement.createdDate).toLocaleDateString()} | Expires: {new Date(announcement.expiresDate).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Modal>
    </Box>
  );
};

export default Announcements;
