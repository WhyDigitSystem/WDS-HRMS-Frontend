// src/components/AdvancedOfferLetterSystem/tabs/AllOffers.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Typography,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import apiCalls from 'apicall';

const WorkFlow = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [approveDialog, setApproveDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

    useEffect(() => {
        getPendingOffers();
    }, []);

    // Fetch pending offers from API
    const getPendingOffers = async () => {
        try {
            const response = await apiCalls(
                'get',
                `recruitmentmanagement/getPendingCreateOfferByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response.status === true) {
                setOffers(response.paramObjectsMap.createOfferVO || []);
            } else {
                console.error('API Error:', response);
                setOffers([]);
            }
        } catch (error) {
            console.error('Error fetching pending offers:', error);
            setOffers([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle approve action with correct API
    const handleApprove = async (offer) => {
        setActionLoading(true);
        try {
            const response = await apiCalls(
                'put',
                `recruitmentmanagement/createApprovalCreateOffer?action=APPROVED&actionBy=${loginUserName}&candidateName=${encodeURIComponent(offer.candidateName)}&id=${offer.id}&orgId=${orgId}`
            );

            if (response.status === true) {
                setSuccessMessage(response.paramObjectsMap?.message || 'Offer approved successfully!');
                await getPendingOffers(); // Refresh the list
                setApproveDialog(false);
                setSelectedOffer(null);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                throw new Error(response.paramObjectsMap?.message || 'Approval failed');
            }
        } catch (err) {
            setError(err.message || 'Failed to approve offer. Please try again.');
            console.error('Error approving offer:', err);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle reject action with apiCalls
    const handleReject = async (offer) => {
        setActionLoading(true);
        try {
            const response = await apiCalls(
                'put',
                `recruitmentmanagement/createApprovalCreateOffer?action=REJECTED&actionBy=${loginUserName}&candidateName=${encodeURIComponent(offer.candidateName)}&id=${offer.id}&orgId=${orgId}`
            );

            if (response.status === true) {
                setSuccessMessage(response.paramObjectsMap?.message || 'Offer rejected successfully!');
                await getPendingOffers(); // Refresh the list
                setRejectDialog(false);
                setSelectedOffer(null);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                throw new Error(response.paramObjectsMap?.message || 'Rejection failed');
            }
        } catch (err) {
            setError(err.message || 'Failed to reject offer. Please try again.');
            console.error('Error rejecting offer:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Professional color variants for cards
    const cardColors = [
        { bg: '#f8f9ff', border: '#e0e7ff' }, // Soft blue
        { bg: '#f0fdf4', border: '#dcfce7' }, // Soft green
        { bg: '#fefce8', border: '#fef9c3' }, // Soft yellow
        { bg: '#fef7ff', border: '#fae8ff' }, // Soft purple
        { bg: '#f0f9ff', border: '#e0f2fe' }, // Soft sky blue
        { bg: '#fff7ed', border: '#ffedd5' }, // Soft orange
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, pt: 3 }}>
            {/* Success Alert */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Offer Cards Grid */}
            <Grid container spacing={1.5}>
                {offers.map((offer, index) => {
                    const colorVariant = cardColors[index % cardColors.length];
                    return (
                        <Grid item xs={12} sm={6} lg={4} key={offer.id}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${colorVariant.border}`,
                                    backgroundColor: colorVariant.bg,
                                    transition: 'all 0.2s ease',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 180, // Reduced minimum height
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transform: 'translateY(-1px)',
                                    },
                                }}
                            >
                                <CardContent sx={{
                                    p: 2,
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:last-child': { pb: 2 } // Remove extra padding
                                }}>
                                    {/* Header Section */}
                                    <Box sx={{ mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    fontSize: '0.9rem', // Smaller font
                                                    lineHeight: 1.2
                                                }}
                                            >
                                                {offer.candidateName}
                                            </Typography>
                                            <Chip
                                                label="PENDING"
                                                color="warning"
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    borderRadius: 1,
                                                    fontSize: '0.6rem', // Smaller font
                                                    height: 20, // Smaller chip
                                                    minWidth: 60
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#475569',
                                                fontWeight: 600,
                                                fontSize: '0.75rem', // Smaller font
                                                mb: 0.5
                                            }}
                                        >
                                            {offer.position}
                                        </Typography>
                                        <Chip
                                            label={offer.department}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '0.6rem', // Smaller font
                                                height: 18, // Smaller chip
                                                borderColor: '#cbd5e1',
                                                color: '#475569'
                                            }}
                                        />
                                    </Box>

                                    {/* Details Section - More Compact */}
                                    <Box sx={{ flex: 1, mb: 1.5 }}>
                                        <Stack spacing={1}>
                                            {/* Joining Date */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarTodayIcon
                                                    sx={{
                                                        mr: 1,
                                                        color: '#3b82f6',
                                                        fontSize: '0.8rem' // Smaller icon
                                                    }}
                                                />
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        fontSize: '0.65rem' // Smaller font
                                                    }}>
                                                        Joining
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        fontSize: '0.7rem', // Smaller font
                                                        lineHeight: 1.2
                                                    }}>
                                                        {formatDate(offer.joiningDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Location */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <LocationOnIcon
                                                    sx={{
                                                        mr: 1,
                                                        color: '#ef4444',
                                                        fontSize: '0.8rem' // Smaller icon
                                                    }}
                                                />
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        fontSize: '0.65rem' // Smaller font
                                                    }}>
                                                        Location
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        fontSize: '0.7rem', // Smaller font
                                                        lineHeight: 1.2
                                                    }}>
                                                        {offer.workLocation}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Reporting Manager */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PersonIcon
                                                    sx={{
                                                        mr: 1,
                                                        color: '#10b981',
                                                        fontSize: '0.8rem' // Smaller icon
                                                    }}
                                                />
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        fontSize: '0.65rem' // Smaller font
                                                    }}>
                                                        Reporting To
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        fontSize: '0.7rem', // Smaller font
                                                        lineHeight: 1.2
                                                    }}>
                                                        {offer.reportingPerson}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Action Buttons */}
                                    <Box sx={{ mt: 'auto' }}>
                                        <Stack direction="row" spacing={0.8} justifyContent="end">
                                            {/* 👍 Approve */}
                                            <Tooltip title="Approve">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        setSelectedOffer(offer);
                                                        setApproveDialog(true);
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        minWidth: 32,
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 1.5,
                                                        backgroundColor: '#10b981',
                                                        '&:hover': {
                                                            backgroundColor: '#059669',
                                                        },
                                                        p: 0,
                                                    }}
                                                >
                                                    <ThumbUpAltIcon sx={{ fontSize: '1rem', color: '#fff' }} />
                                                </Button>
                                            </Tooltip>

                                            {/* 👎 Reject */}
                                            <Tooltip title="Reject">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        setSelectedOffer(offer);
                                                        setRejectDialog(true);
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        minWidth: 32,
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 1.5,
                                                        backgroundColor: '#ef4444',
                                                        '&:hover': {
                                                            backgroundColor: '#dc2626',
                                                        },
                                                        p: 0,
                                                    }}
                                                >
                                                    <ThumbDownAltIcon sx={{ fontSize: '1rem', color: '#fff' }} />
                                                </Button>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Empty State */}
            {offers.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1, fontWeight: 600, fontSize: '1rem' }}>
                        No Pending Offers
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                        All offer letters have been processed.
                    </Typography>
                </Box>
            )}

            {/* Approve Confirmation Dialog */}
            <Dialog
                open={approveDialog}
                onClose={() => !actionLoading && setApproveDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#f0fdf4', color: '#059669', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Confirm Approval
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography sx={{ pt: 2 }}>
                        Are you sure you want to approve the offer letter for{' '}
                        <strong>{selectedOffer?.candidateName}</strong>?
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                        Position: <strong>{selectedOffer?.position}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Department: <strong>{selectedOffer?.department}</strong>
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setApproveDialog(false)}
                        disabled={actionLoading}
                        sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleApprove(selectedOffer)}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#059669',
                            fontSize: '0.8rem',
                            '&:hover': { backgroundColor: '#047857' }
                        }}
                    >
                        {actionLoading ? 'Approving...' : 'Approve Offer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog
                open={rejectDialog}
                onClose={() => !actionLoading && setRejectDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: '#fef2f2', color: '#dc2626', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Confirm Rejection
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography sx={{ pt: 2 }}>
                        Are you sure you want to reject the offer letter for{' '}
                        <strong>{selectedOffer?.candidateName}</strong>?
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                        Position: <strong>{selectedOffer?.position}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Department: <strong>{selectedOffer?.department}</strong>
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setRejectDialog(false)}
                        disabled={actionLoading}
                        sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleReject(selectedOffer)}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={16} /> : <CancelIcon />}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#dc2626',
                            fontSize: '0.8rem',
                            '&:hover': { backgroundColor: '#b91c1c' }
                        }}
                    >
                        {actionLoading ? 'Rejecting...' : 'Reject Offer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WorkFlow;