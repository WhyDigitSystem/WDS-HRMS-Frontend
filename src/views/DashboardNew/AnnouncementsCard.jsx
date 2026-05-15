// src/components/Dashboard/AnnouncementsCard.jsx

import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    IconButton,
    Avatar,
    TextField,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';

import {
    Announcement,
    Update,
    Close as CloseIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Campaign as CampaignIcon
} from '@mui/icons-material';

import { styled, useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import apiCalls from 'apicall';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: 24,
    background: 'linear-gradient(135deg, #1e3a5f 0%, #294d73 100%)',
    color: 'white',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    transition: '0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(30,58,95,0.25)',
    minHeight: '220px', // Set fixed minimum height
    maxHeight: '220px', // Set maximum height to match other cards

    '&:hover': {
        transform: 'translateY(-4px)',
    },

    '&::before': {
        content: '""',
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        top: -80,
        right: -80
    }
}));

const AnnouncementsCard = () => {
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Local storage values
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [branchName] = useState(localStorage.getItem('branch'));
    const [department] = useState(localStorage.getItem('department'));
    const loginUserName = localStorage.getItem('userName');

    // Form data for create/edit
    const [formData, setFormData] = useState({
        active: true,
        topic: '',
        announcement: '',
        expiresDate: ''
    });

    // Fetch announcements from API
    const GetAnnouncementByOrgId = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/GetAnnouncementByOrgId?branchCode=${branchCode}&orgId=${orgId}&department=${department}`);
            if (result?.paramObjectsMap?.announcementVO) {
                const formattedData = result.paramObjectsMap.announcementVO.reverse();
                setAnnouncements(formattedData);
            } else {
                setAnnouncements([]);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setAnnouncements([]);
        }
    };

    useEffect(() => {
        if (orgId) {
            GetAnnouncementByOrgId();
        }
    }, [orgId, branchCode, department]);

    // Get single announcement by ID for editing
    const getAnnouncementById = async (row) => {
        const postId = row.id;
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
                setOpenCreateDialog(true);
            } else {
                toast.error('Failed to fetch announcement data');
            }
        } catch (err) {
            toast.error('Failed to fetch announcement data');
        }
    };

    // Save/Create announcement
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
                setOpenCreateDialog(false);
                GetAnnouncementByOrgId();
                resetForm();
            } else {
                toast.error(result.paramObjectsMap?.errorMessage || 'Announcement creation failed');
            }
        } catch (err) {
            toast.error('Announcement creation failed. Please check the data and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ topic: '', announcement: '', expiresDate: '', active: true });
        setEditId('');
        setFieldErrors({});
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        resetForm();
    };

    // Get icon and color based on announcement type/age
    const getAnnouncementStyle = (announcement, index) => {
        const isRecent = index === 0;
        if (isRecent) {
            return {
                icon: <Announcement />,
                color: '#f59e0b',
                type: 'NEW'
            };
        }
        return {
            icon: <Update />,
            color: '#10b981',
            type: 'UPDATE'
        };
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get first 2 announcements for main card display (reduced from 3 to save space)
    const displayAnnouncements = announcements.slice(0, 2);

    return (
        <>
            {/* Main Card */}
            <StyledPaper
                elevation={0}
                onClick={() => setOpenDialog(true)}
            >
                {/* Header - Compact */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1.5}
                    position="relative"
                    zIndex={2}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.9rem',
                                fontWeight: 700
                            }}
                        >
                            Announcements
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: '0.65rem',
                                opacity: 0.75,
                                mt: 0.2
                            }}
                        >
                            Latest company updates
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        sx={{
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '0.65rem',
                            bgcolor: 'rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            px: 1,
                            py: 0.3,
                            minWidth: 'auto',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.15)'
                            }
                        }}
                    >
                        View All ({announcements.length}) →
                    </Button>
                </Box>

                {/* Announcement List - Compact */}
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    position="relative"
                    zIndex={2}
                >
                    {displayAnnouncements.length > 0 ? (
                        displayAnnouncements.map((ann, idx) => {
                            const styles = getAnnouncementStyle(ann, idx);

                            return (
                                <Box
                                    key={ann.id || idx}
                                    sx={{
                                        p: 1,
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                >
                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                        <Avatar
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                bgcolor: `${styles.color}20`,
                                                border: `1px solid ${styles.color}40`
                                            }}
                                        >
                                            {React.cloneElement(styles.icon, {
                                                sx: {
                                                    color: styles.color,
                                                    fontSize: 14
                                                }
                                            })}
                                        </Avatar>

                                        <Box flex={1} minWidth={0}>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                mb={0.3}
                                                gap={1}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {ann.topic}
                                                </Typography>

                                                <Chip
                                                    label={styles.type}
                                                    size="small"
                                                    sx={{
                                                        height: 16,
                                                        bgcolor: styles.color,
                                                        color: '#fff',
                                                        fontSize: '0.55rem',
                                                        fontWeight: 700,
                                                        '& .MuiChip-label': { px: 0.8 }
                                                    }}
                                                />
                                            </Box>

                                            <Typography
                                                sx={{
                                                    fontSize: '0.68rem',
                                                    lineHeight: 1.4,
                                                    opacity: 0.85,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {ann.announcement}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <CampaignIcon sx={{ fontSize: 28, opacity: 0.5, mb: 0.5 }} />
                            <Typography variant="caption" sx={{ opacity: 0.7, color: 'white', display: 'block' }}>
                                No announcements
                            </Typography>
                        </Box>
                    )}
                </Box>
            </StyledPaper>

            {/* Main Popup Dialog - View All Announcements */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        overflow: 'hidden',
                        bgcolor: '#f4f7fb',
                        boxShadow: '0 20px 50px rgba(15,23,42,0.15)'
                    }
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        background: 'linear-gradient(90deg, #1e3a5f 0%, #294d73 100%)'
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                                All Announcements
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.76rem', mt: 0.3 }}>
                                Internal updates & notices ({announcements.length} total)
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            {/* Add Button */}
                            <IconButton
                                onClick={() => {
                                    setOpenCreateDialog(true);
                                    setOpenDialog(false);
                                }}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
                                }}
                            >
                                <AddIcon />
                            </IconButton>

                            {/* Close Button */}
                            <IconButton
                                onClick={() => setOpenDialog(false)}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' }
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                {/* Content */}
                <DialogContent sx={{ p: 3, bgcolor: '#f4f7fb' }}>
                    {announcements.length > 0 ? (
                        <Box display="flex" flexDirection="column" gap={2}>
                            {announcements.map((ann, idx) => {
                                const styles = getAnnouncementStyle(ann, idx);
                                return (
                                    <Box
                                        key={ann.id || idx}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '20px',
                                            bgcolor: '#ffffff',
                                            border: '1px solid #dbe3ec',
                                            transition: '0.25s ease',
                                            '&:hover': {
                                                boxShadow: '0 10px 25px rgba(15,23,42,0.06)'
                                            }
                                        }}
                                    >
                                        <Box display="flex" gap={2}>
                                            <Avatar
                                                sx={{
                                                    width: 54,
                                                    height: 54,
                                                    bgcolor: `${styles.color}15`,
                                                    border: `1px solid ${styles.color}30`
                                                }}
                                            >
                                                {React.cloneElement(styles.icon, {
                                                    sx: { color: styles.color }
                                                })}
                                            </Avatar>

                                            <Box flex={1}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                                                        {ann.topic}
                                                    </Typography>
                                                    <Chip
                                                        label={styles.type}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: styles.color,
                                                            color: '#fff',
                                                            fontWeight: 700
                                                        }}
                                                    />
                                                </Box>

                                                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 1 }}>
                                                    Published on {formatDate(ann.createdDate)} |
                                                    Expires on {formatDate(ann.expiresDate)}
                                                </Typography>

                                                <Typography sx={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                                    {ann.announcement}
                                                </Typography>

                                                {/* Edit Button for Admin */}
                                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            getAnnouncementById(ann);
                                                            setOpenDialog(false);
                                                        }}
                                                        sx={{
                                                            color: '#2196f3',
                                                            '&:hover': { bgcolor: 'rgba(33,150,243,0.1)' }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                        <Typography variant="caption" sx={{ ml: 0.5 }}>Edit</Typography>
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        <Box textAlign="center" py={4}>
                            <CampaignIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No announcements available</Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setOpenCreateDialog(true);
                                    setOpenDialog(false);
                                }}
                                sx={{ mt: 2, borderRadius: '12px', textTransform: 'none' }}
                            >
                                Create First Announcement
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create/Edit Announcement Dialog */}
            <Dialog
                open={openCreateDialog}
                onClose={handleCloseCreateDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '26px',
                        p: 1,
                        bgcolor: '#f8fafc'
                    }
                }}
            >
                <DialogContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', mb: 3 }}>
                        {editId ? 'Edit Announcement' : 'Create New Announcement'}
                    </Typography>

                    {/* Topic Field */}
                    <TextField
                        fullWidth
                        label="Topic"
                        placeholder="Enter announcement topic"
                        variant="outlined"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        error={!!fieldErrors.topic}
                        helperText={fieldErrors.topic}
                        sx={{
                            mb: 2.5,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '18px',
                                bgcolor: '#fff'
                            }
                        }}
                    />

                    {/* Announcement Content */}
                    <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Announcement"
                        placeholder="Enter announcement details"
                        variant="outlined"
                        value={formData.announcement}
                        onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                        error={!!fieldErrors.announcement}
                        helperText={fieldErrors.announcement}
                        sx={{
                            mb: 2.5,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '18px',
                                bgcolor: '#fff'
                            }
                        }}
                    />

                    {/* Expiration Date */}
                    <TextField
                        fullWidth
                        type="date"
                        label="Expiration Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.expiresDate}
                        onChange={(e) => setFormData({ ...formData, expiresDate: e.target.value })}
                        error={!!fieldErrors.expiresDate}
                        helperText={fieldErrors.expiresDate}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '18px',
                                bgcolor: '#fff'
                            }
                        }}
                    />

                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="flex-end" gap={1.5} mt={4}>
                        <Button
                            onClick={handleCloseCreateDialog}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                color: '#7c3aed'
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isLoading}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                borderRadius: '12px',
                                bgcolor: '#2196f3',
                                boxShadow: '0 6px 16px rgba(33,150,243,0.3)',
                                '&:hover': { bgcolor: '#1976d2' }
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : (editId ? 'Update' : 'Save')}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AnnouncementsCard;