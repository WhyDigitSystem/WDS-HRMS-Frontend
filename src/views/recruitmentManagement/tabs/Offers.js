import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

const Offers = ({ config }) => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [offers, setOffers] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOfferModalOpen, setCreateOfferModalOpen] = useState(false);
  const [newOfferData, setNewOfferData] = useState({
    candidatesName: '',
    email: '',
    position: '',
    department: '',
    location: '',
    remarks: '',
    active: true
  });

  useEffect(() => {
    getOffers();
    getAllDepartment();
    getJobPostings();
  }, [orgId, branchCode]);

  const getOffers = async () => {
    try {
      setLoading(true);
      const response = await apiCalls(
        'get',
        `recruitmentmanagement/getOfferLetterByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );
      if (response.status === true) {
        setOffers(response.paramObjectsMap.offerLetterVO || []);
      } else {
        setOffers([]);
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const getJobPostings = async () => {
    try {
      const response = await apiCalls(
        'get',
        `recruitmentmanagement/getJobPostingsByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );
      if (response.status === true) {
        const jobs = response.paramObjectsMap.jobPostingsVO || [];
        setJobPostings(jobs);
      } else {
        setJobPostings([]);
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
      setJobPostings([]);
    }
  };

  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO || []);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCreateOfferClick = () => {
    setCreateOfferModalOpen(true);
  };

  const handleCloseCreateOfferModal = () => {
    setCreateOfferModalOpen(false);
    setNewOfferData({
      candidatesName: '',
      email: '',
      position: '',
      department: '',
      location: '',
      remarks: '',
      active: true
    });
  };

  const handleInputChange = (field, value) => {
    setNewOfferData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateOffer = async () => {
    try {
      // Validate required fields
      if (!newOfferData.candidatesName || !newOfferData.email || !newOfferData.position || !newOfferData.department || !newOfferData.location) {
        showToast('error', 'Please fill in all required fields');
        return;
      }

      const payload = {
        ...newOfferData,
        branch: branch || '',
        branchCode: branchCode || '',
        createdBy: loginUserName,
        orgId: parseInt(orgId),
        id: 0, // 0 for new offer
        active: newOfferData.active,
        remarks: newOfferData.remarks || 'Offer created successfully.'
      };

      const response = await apiCalls('put', 'recruitmentmanagement/createUpdateOfferLetter', payload);

      if (response.status === true) {
        await getOffers();
        handleCloseCreateOfferModal();
        showToast('success', 'Offer letter created successfully!');
      } else {
        showToast('error', 'Failed to create offer: ' + (response.message || 'Unknown error'));
      }

    } catch (error) {
      console.error('Error creating offer:', error);
      showToast('error', 'Error creating offer. Please try again.');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        const offer = offers.find(o => o.id === offerId);
        if (offer) {
          const payload = {
            ...offer,
            active: false,
            updatedBy: loginUserName
          };

          const response = await apiCalls('put', 'recruitmentmanagement/createUpdateOfferLetter', payload);

          if (response.status === true) {
            await getOffers();
            showToast('success', 'Offer deleted successfully!');
          } else {
            showToast('error', 'Failed to delete offer: ' + (response.message || 'Unknown error'));
          }
        }
      } catch (error) {
        console.error('Error deleting offer:', error);
        showToast('error', 'Error deleting offer. Please try again.');
      }
    }
  };

  const handleViewOffer = (offer) => {
    // You can implement PDF generation or detailed view here
    showToast('info', `Viewing offer for ${offer.candidatesName}`);
    console.log('View offer:', offer);
  };

  const departmentOptions = departmentList.map(dept => ({
    value: dept.departmentName,
    label: dept.departmentName
  }));

  const jobOptions = jobPostings.map(job => ({
    value: job.jobTitle,
    label: job.jobTitle
  }));

  // Transform API data for display
  const transformedOffers = offers.map(offer => ({
    id: offer.id,
    candidate_name: offer.candidatesName,
    candidate_email: offer.email,
    position: offer.position,
    department: offer.department,
    location: offer.location,
    status: offer.active === 'Active' || offer.active === true ? 'Active' : 'Inactive',
    remarks: offer.remarks,
    active: offer.active
  }));

  return (
    <Box>
      {/* Create Offer Modal */}
      <Dialog
        open={createOfferModalOpen}
        onClose={handleCloseCreateOfferModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create Offer Letter
          </Typography>
          <IconButton
            onClick={handleCloseCreateOfferModal}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            {/* Candidate Name */}
            <TextField
              label="Candidate Name"
              required
              fullWidth
              size="small"
              value={newOfferData.candidatesName}
              onChange={(e) => handleInputChange('candidatesName', e.target.value)}
              placeholder="Enter candidate full name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  height: 40
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem'
                }
              }}
            />

            {/* Email */}
            <TextField
              label="Email"
              required
              fullWidth
              size="small"
              type="email"
              value={newOfferData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter candidate email address"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  height: 40
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem'
                }
              }}
            />

            {/* Position */}
            <Autocomplete
              options={jobOptions}
              size="small"
              getOptionLabel={(option) => option.label}
              value={jobOptions.find(option => option.value === newOfferData.position) || null}
              onChange={(event, newValue) => {
                handleInputChange('position', newValue ? newValue.value : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Position"
                  required
                  placeholder="Select Position"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      height: 40
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              )}
            />

            {/* Department */}
            <Autocomplete
              options={departmentOptions}
              size="small"
              getOptionLabel={(option) => option.label}
              value={departmentOptions.find(option => option.value === newOfferData.department) || null}
              onChange={(event, newValue) => {
                handleInputChange('department', newValue ? newValue.value : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department"
                  required
                  placeholder="Select Department"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      height: 40
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              )}
            />

            {/* Location */}
            <TextField
              label="Location"
              required
              fullWidth
              size="small"
              value={newOfferData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter work location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  height: 40
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem'
                }
              }}
            />

            {/* Remarks */}
            <TextField
              label="Remarks"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={newOfferData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Additional notes or remarks..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseCreateOfferModal}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              borderRadius: 1,
              px: 3,
              py: 0.5,
              border: '1px solid #e2e8f0',
              '&:hover': {
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateOffer}
            sx={{
              backgroundColor: config.primary_action_color || '#2563eb',
              textTransform: 'none',
              borderRadius: 1,
              px: 3,
              py: 0.5,
              '&:hover': {
                backgroundColor: config.primary_action_color || '#2563eb'
              }
            }}
          >
            Create Offer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header with Create Offer Button */}
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOfferClick}
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${config.primary_action_color} 0%, #2563eb 100%)`,
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
            borderRadius: 1,
            px: 1,
            py: 1,
            fontSize: '0.8rem',
            minWidth: '110px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
              boxShadow: '0 3px 8px rgba(59, 130, 246, 0.4)',
            },
          }}
        >
          Create Offer
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading offers...</Typography>
        </Box>
      ) : transformedOffers.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: 2,
            border: '2px dashed #cbd5e1'
          }}
        >
          <DescriptionIcon sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No offers created yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create an offer letter to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {transformedOffers.map((offer) => (
            <Grid item xs={12} md={6} key={offer.id}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  height: '100%',
                  border: '1px solid #f1f5f9',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: config.primary_action_color,
                        width: 48,
                        height: 48,
                        fontWeight: 600
                      }}>
                        {offer.candidate_name?.charAt(0) || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {offer.candidate_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {offer.position}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={offer.status}
                      size="small"
                      sx={{
                        backgroundColor: offer.status === 'Active' ? '#dcfce7' : '#fef2f2',
                        color: offer.status === 'Active' ? '#166534' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        📧 {offer.candidate_email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        📍 {offer.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        🏢 {offer.department}
                      </Typography>
                    </Box>
                    {offer.remarks && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0f9ff', borderRadius: 1, border: '1px solid #e0f2fe' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: config.primary_action_color, display: 'block', mb: 0.5 }}>
                          Remarks
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {offer.remarks}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<DescriptionIcon />}
                    onClick={() => handleViewOffer(offers.find(o => o.id === offer.id))}
                    sx={{
                      color: config.primary_action_color,
                      borderColor: config.primary_action_color,
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: `${config.primary_action_color}10`
                      }
                    }}
                    variant="outlined"
                  >
                    View Letter
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteOffer(offer.id)}
                    sx={{
                      color: '#64748b',
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#ef4444',
                        backgroundColor: '#fef2f2'
                      }
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Offers;