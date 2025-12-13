import { Add, Cancel, Close, CloudUpload, Delete, Edit, Save, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { showToast } from 'utils/toast-component';
import CommonListView from '../../utils/AssetCommonListViewTable';

const AssetMaster = ({ config }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [assetsData, setAssetsData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('employeeName'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [formData, setFormData] = useState({
    asset_code: '',
    asset_name: '',
    category: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_cost: '',
    warranty_expiry: '',
    location: '',
    notes: '',
    active: true
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const categories = ['IT Equipment', 'Furniture', 'Vehicle', 'Machinery', 'Office Equipment', 'Electronics', 'Tools', 'Safety Equipment'];

  // Fetch all assets on component mount
  useEffect(() => {
    getAllAssets();
  }, []);




  // Table columns configuration
  const tableColumns = [
    {
      key: 'asset_details',
      label: 'Asset Details',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {row.asset_code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.asset_name}
          </Typography>
        </Box>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      )
    },
    {
      key: 'brand_model',
      label: 'Brand/Model',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {row.brand}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.model}
          </Typography>
        </Box>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => <Typography variant="body2">{value || 'Not specified'}</Typography>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
          sx={{
            fontWeight: '600',
            minWidth: 100,
            height: '24px',
            fontSize: '0.75rem'
          }}
        />
      )
    }
  ];

  // Table actions configuration
  // const tableActions = [
  //   {
  //     icon: <Edit fontSize="small" />,
  //     tooltip: 'Edit Asset',
  //     color: 'info',
  //     onClick: (asset) => handleEditAsset(asset.id)
  //   }
  // ];

  // Pagination config
  const paginationConfig = {
    currentPage,
    totalPages: Math.ceil(assetsData.length / itemsPerPage),
    itemsPerPage,
    onPageChange: (event, value) => setCurrentPage(value)
  };

  const getAllAssets = async () => {
    setIsFetching(true);
    try {
      const response = await apiCalls('get', `/assetmanagement/getAssetMasterByOrgId?branchCode=${branchCode}&orgId=${orgId}`);

      if (response.status === true && response.paramObjectsMap?.assetMasterVO) {
        const formattedAssets = response.paramObjectsMap.assetMasterVO.map((asset) => ({
          id: asset.id,
          asset_code: asset.assetCode,
          asset_name: asset.assetName,
          category: asset.category,
          brand: asset.brand,
          model: asset.model,
          serial_number: asset.serialNumber,
          purchase_date: asset.purchaseDate,
          purchase_cost: asset.purchaseCost,
          warranty_expiry: asset.warrantyExpiry,
          location: asset.location,
          notes: asset.notes,
          status: asset.active ? 'Active' : 'InActive',
          assigned_to: '',
          employee_id: '',
          allocation_date: '',
          return_date: '',
          condition: 'Excellent',
          created_at: asset.commonDate?.createdon || new Date().toISOString(),
          branch: asset.branch,
          branchCode: asset.branchCode,
          orgId: asset.orgId,
          active: asset.active,
          createdBy: asset.createdBy
        }));
        setAssetsData(formattedAssets);
        setCurrentPage(1);
      } else {
        showToast('error', 'Failed to fetch assets');
        setAssetsData([]);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      showToast('error', 'Error fetching assets');
      setAssetsData([]);
    } finally {
      setIsFetching(false);
    }
  };

  const getAssetById = async (assetId) => {
    setIsLoading(true);
    try {
      const response = await apiCalls('get', `/assetmanagement/getAssetMasterById?id=${assetId}`);
      

      if (response.status === true && response.paramObjectsMap?.assetMasterVO) {
        const asset = response.paramObjectsMap.assetMasterVO;
        const assetDetails = {
          id: asset.id,
          asset_code: asset.assetCode,
          asset_name: asset.assetName,
          category: asset.category,
          brand: asset.brand,
          model: asset.model,
          serial_number: asset.serialNumber,
          purchase_date: asset.purchaseDate,
          purchase_cost: asset.purchaseCost,
          warranty_expiry: asset.warrantyExpiry,
          location: asset.location,
          notes: asset.notes,
          status: asset.active ? 'Active' : 'InActive',
          branch: asset.branch,
          branchCode: asset.branchCode,
          orgId: asset.orgId,
          active: asset.active
        };

        setFormData({
          asset_code: asset.assetCode || '',
          asset_name: asset.assetName || '',
          category: asset.category || '',
          brand: asset.brand || '',
          model: asset.model || '',
          serial_number: asset.serialNumber || '',
          purchase_date: asset.purchaseDate || '',
          purchase_cost: asset.purchaseCost || '',
          warranty_expiry: asset.warrantyExpiry || '',
          location: asset.location || '',
          notes: asset.notes || '',
          active: asset.active !== undefined ? asset.active : true
        });

        // Handle existing images
        if (asset.assetImages && asset.assetImages.length > 0) {
          const existingImagesData = asset.assetImages.map((image, index) => {
            const base64 = `data:image/png;base64,${image.imageAttachment}`;
            const filename = `asset-image-${index + 1}.png`;

            return {
              id: `existing-${image.id}`,
              preview: base64,
              file: base64ToFile(base64, filename),
              name: filename,
              size: image.imageAttachment.length,
              isExisting: true,
              imageId: image.id,
              serverId: image.id
            };
          });
          setExistingImages(existingImagesData);
        } else {
          setExistingImages([]);
        }

        // Clear any newly uploaded images when editing
        setUploadedImages([]);

        setSelectedAsset(assetDetails);
        setIsEditing(true);
        setIsAdding(true);

        return assetDetails;
      } else {
        showToast('error', 'Asset not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
      showToast('error', 'Error fetching asset details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAsset = (assetId) => {
    getAssetById(assetId);
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'active' ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // const handleRemoveImage = (imageId) => {
  //   setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

  //   setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));

  //   showToast('info', 'Image removed');
  // };
  const handleRemoveImage = (imageId) => {
  setUploadedImages((prev) => {
    const img = prev.find((i) => i.id === imageId);
    if (img?.preview) URL.revokeObjectURL(img.preview);
    return prev.filter((i) => i.id !== imageId);
  });

  setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
};

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    const validFiles = files.filter((file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);

    if (validFiles.length === 0) {
      showToast('warning', 'Invalid image selected');
      return;
    }

    if (isEditing && existingImages.length === 4) {
      const file = validFiles[0];
      const updated = [...existingImages];

      updated[0] = {
        ...updated[0],
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isEdited: true
      };

      setExistingImages(updated);
      event.target.value = '';
      showToast('info', 'Existing image replaced');
      return;
    }

    const totalImages = existingImages.length + uploadedImages.length;

    if (totalImages + validFiles.length > 4) {
      showToast('warning', 'Maximum 4 images allowed');
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      isExisting: false
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
    event.target.value = '';
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
  };

  const getAllImages = () => {
    return [...existingImages.map((img) => ({ ...img, type: 'existing' })), ...uploadedImages.map((img) => ({ ...img, type: 'new' }))];
  };

  const uploadAllImages = async (assetMasterId) => {
    const editedImages = existingImages.filter((img) => img.isEdited);
    const newImages = uploadedImages;
    console.log('Img', existingImages);
    console.log('New Img', uploadedImages);

    const imagesToUpload = [...existingImages, ...newImages];

    if (imagesToUpload.length === 0) {
      return { success: true };
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      imagesToUpload.forEach((img) => {
        formData.append('files', img.file);
      });

      formData.append('assetMasterId', assetMasterId);

      const response = await apiCalls(
        'post',
        `/assetmanagement/upload/${assetMasterId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );

      if (response?.status === true) {
        showToast('success', 'Images updated successfully');

        setUploadedImages([]);
        setExistingImages((prev) => prev.map((i) => ({ ...i, isEdited: false })));

        return { success: true };
      } else {
        return { success: false };
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error uploading images');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!formData.asset_code) errors.asset_code = 'Code is required';
    if (!formData.asset_name) errors.asset_name = 'Asset is required';
    if (!formData.category) errors.category = 'Category is required';

    if (Object.keys(errors).length > 0) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);

    // Prepare the JSON data
    const saveData = {
      assetCode: formData.asset_code,
      assetName: formData.asset_name,
      category: formData.category,
      brand: formData.brand || '',
      model: formData.model || '',
      serialNumber: formData.serial_number || '',
      purchaseDate: formData.purchase_date || '',
      purchaseCost: formData.purchase_cost ? formData.purchase_cost.toString() : '',
      warrantyExpiry: formData.warranty_expiry || '',
      location: formData.location || '',
      notes: formData.notes || '',
      branch: branch,
      branchCode: branchCode,
      orgId: orgId,
      finyear: config.finyear || '2025',
      createdBy: loginUserName,
      active: formData.active
    };

    if (isEditing && selectedAsset) {
      saveData.id = selectedAsset.id;
    }

    console.log('DATA TO SAVE IS:', saveData);

    try {
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();

      // 1. Add the JSON data as a string in the 'dto' field
      formDataToSend.append('dto', new Blob([JSON.stringify(saveData)], { type: 'application/json' }));

      // 2. Add all image files from your state/ref
      // Assuming you have images in state like imageFiles or file inputs

const allImages = [...existingImages, ...uploadedImages];

allImages.forEach((img) => {
  if (img.file instanceof File) {
    formDataToSend.append('files', img.file);
  }
});

      // If editing and you want to keep existing images, you might need to handle differently
      // This example assumes you have image files ready to upload

      // Make the API call with FormData
      const response = await apiCalls('post', '/assetmanagement/CreateAssetMaster', formDataToSend, {}, { Accept: 'application/json' });

      if (response.status === true) {
        console.log('Response:', response);
        showToast('success', `Asset ${isEditing ? 'updated' : 'added'} successfully!`);
        await getAllAssets();
        handleCancel();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || `Asset ${isEditing ? 'update' : 'creation'} failed`);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', `Asset ${isEditing ? 'update' : 'creation'} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setFormData({
      asset_code: '',
      asset_name: '',
      category: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_cost: '',
      warranty_expiry: '',
      location: '',
      notes: '',
      active: true
    });
    setUploadedImages([]);
    setExistingImages([]);
    setCurrentPage(1);
    autoGenerateCode();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setSelectedAsset(null);
    setFormData({
      asset_code: '',
      asset_name: '',
      category: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_cost: '',
      warranty_expiry: '',
      location: '',
      notes: '',
      active: true
    });
    // Clean up image URLs
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setExistingImages([]);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'InActive':
        return 'error';
      default:
        return 'default';
    }
  };

  const canUploadMoreImages = () => {
    const totalImages = existingImages.length + uploadedImages.length;
    return totalImages < 4;
  };

  const base64ToFile = (base64, filename) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

   const autoGenerateCode = async () => {
    try {
      const res = await apiCalls(
        'get',
        `/documenttypecontroller/getDocId?branchCode=${branchCode}&screenCode=AM`
      );
  
      const generatedCode = res?.paramObjectsMap?.generatedDocId;
  
      if (generatedCode) {
        setFormData((prev) => ({
          ...prev,
          asset_code: generatedCode
        }));
      } else {
        showToast('Code generation failed', 'error');
      }
  
    } catch (error) {
      console.error(error);
      showToast('Something went wrong while generating code', 'error');
    }
  };

  return (
    <>
      <ToastContainer />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%',
          mb: 2
        }}
      >
        {!isAdding && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            disabled={isLoading || isFetching}
            sx={{
              backgroundColor: config.primaryColor || '#2563eb',
              background: `linear-gradient(135deg, ${config.primaryColor || '#2563eb'} 0%, ${config.successColor || '#059669'} 100%)`,
              borderRadius: 2,
              px: 1,
              py: 0.8,
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Adding...' : 'Add New Asset'}
          </Button>
        )}
      </Box>

      {/* Content Area */}
      <Box sx={{ p: 3 }}>
        {isAdding ? (
          <Card
            variant="outlined"
            sx={{
              maxWidth: 1200,
              mx: 'auto',
              borderRadius: 2
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                {isEditing && selectedAsset && (
                  <Chip label={`Editing: ${selectedAsset.asset_code}`} color="primary" variant="outlined" size="small" />
                )}
              </Box>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Code"
                      value={formData.asset_code}
                      onChange={handleInputChange('asset_code')}
                      required
                      placeholder="e.g., ASSET-001"
                      size="small"
                      disabled={isLoading || isEditing}
                      helperText={isEditing ? 'Code cannot be edited' : ''}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Asset"
                      value={formData.asset_name}
                      onChange={handleInputChange('asset_name')}
                      required
                      placeholder="e.g., Laptop Dell XPS"
                      size="small"
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      value={formData.category}
                      onChange={handleInputChange('category')}
                      required
                      size="small"
                      disabled={isLoading}
                    >
                      <MenuItem value="">Select Category</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Brand"
                      value={formData.brand}
                      onChange={handleInputChange('brand')}
                      placeholder="e.g., Dell"
                      size="small"
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Model"
                      value={formData.model}
                      onChange={handleInputChange('model')}
                      placeholder="e.g., XPS 13"
                      size="small"
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Serial Number"
                      value={formData.serial_number}
                      onChange={handleInputChange('serial_number')}
                      placeholder="e.g., SN123456"
                      size="small"
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Purchase Date"
                          format="DD-MM-YYYY"
                          value={formData.purchase_date ? dayjs(formData.purchase_date) : null}
                          onChange={(newValue) => {
                            setFormData((prev) => ({
                              ...prev,
                              purchase_date: newValue ? newValue.toISOString() : ''
                            }));
                          }}
                          disabled={isLoading}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: false,
                              helperText: ''
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Purchase Cost"
                      type="number"
                      value={formData.purchase_cost}
                      onChange={handleInputChange('purchase_cost')}
                      placeholder="0.00"
                      size="small"
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Warranty Expiry"
                          format="DD-MM-YYYY"
                          value={formData.warranty_expiry ? dayjs(formData.warranty_expiry) : null}
                          onChange={(newValue) => {
                            setFormData((prev) => ({
                              ...prev,
                              warranty_expiry: newValue ? newValue.toISOString() : ''
                            }));
                          }}
                          disabled={isLoading}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: false,
                              helperText: ''
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={handleInputChange('location')}
                      placeholder="e.g., Floor 3, Room 301"
                      size="small"
                      disabled={isLoading}
                    />
                  </Grid>

                  {/* Notes and Active Checkbox Section */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={1}
                      value={formData.notes}
                      onChange={handleInputChange('notes')}
                      placeholder="Additional notes"
                      size="small"
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={<Checkbox checked={formData.active} onChange={handleInputChange('active')} color="primary" />}
                      label="Active"
                      sx={{ mt: 1 }}
                    />
                  </Grid>

                  {/* Image Upload Section */}
                  <Grid item xs={12}>
                    <Box>
                      {/* Header */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 1.5,
                          fontWeight: 700,
                          color: '#1e293b',
                          fontSize: '0.95rem'
                        }}
                      >
                        Asset Images ({getAllImages().length}/4 total)
                        {existingImages.length > 0 && (
                          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            ({existingImages.length} existing, {uploadedImages.length} new)
                          </Typography>
                        )}
                        {!canUploadMoreImages() && (
                          <Typography variant="caption" sx={{ ml: 1, color: 'error.main', fontWeight: 'bold' }}>
                            Maximum 4 images reached
                          </Typography>
                        )}
                      </Typography>

                      {/* Upload Button */}
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUpload />}
                        disabled={isLoading || !canUploadMoreImages()}
                        size="small"
                        sx={{
                          mb: 2,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          px: 1.8,
                          py: 0.8,
                          background: `linear-gradient(135deg, ${config.primary_action_color || '#3b82f6'} 0%, #2563eb 100%)`,
                          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                          '&:hover': {
                            background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
                            boxShadow: '0 3px 8px rgba(59, 130, 246, 0.35)'
                          },
                          '&:disabled': {
                            background: '#9ca3af',
                            color: '#6b7280'
                          }
                        }}
                      >
                        {canUploadMoreImages() ? `Upload Images` : 'Maximum 4 images reached'}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                          disabled={!canUploadMoreImages()}
                        />
                      </Button>

                      {/* All Images Grid */}
                      {getAllImages().length > 0 && (
                        <Grid container spacing={0.8} justifyContent="flex-start">
                          {getAllImages().map((image) => (
                            <Grid
                              item
                              xs={6}
                              sm={3}
                              md={2.5}
                              key={image.id}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'relative',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  height: 120,
                                  width: '100%',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
                                  },
                                  '&:hover .image-overlay': {
                                    opacity: 1
                                  },
                                  border: image.type === 'existing' ? '2px solid #10b981' : 'none'
                                }}
                              >
                                <img
                                  src={image.preview}
                                  alt={image.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                  onClick={() => handleViewImage(image)}
                                />

                                {/* Overlay */}
                                <Box
                                  className="image-overlay"
                                  sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.8,
                                    opacity: 0,
                                    transition: 'opacity 0.25s ease'
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewImage(image);
                                    }}
                                    sx={{
                                      color: 'white',
                                      backgroundColor: 'rgba(255,255,255,0.15)',
                                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
                                    }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(image.id);
                                    }}
                                    sx={{
                                      color: 'white',
                                      backgroundColor: 'rgba(255,255,255,0.15)',
                                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>

                                {/* Badge */}
                                {image.type === 'existing' && (
                                  <Chip
                                    label="Existing"
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      left: 4,
                                      height: 18,
                                      fontSize: '0.55rem',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                )}
                              </Box>

                              {/* File Name */}
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  mt: 0.4,
                                  fontWeight: 500,
                                  color: '#334155',
                                  textAlign: 'center'
                                }}
                              >
                                {image.name.length > 15 ? image.name.substring(0, 15) + '...' : image.name}
                              </Typography>
                              {image.size > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                                  {formatFileSize(image.size)}
                                </Typography>
                              )}
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        onClick={handleCancel}
                        variant="outlined"
                        startIcon={<Cancel />}
                        disabled={isLoading}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          textTransform: 'none'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={isLoading}
                        sx={{
                          background: `linear-gradient(135deg, ${config.primaryColor || '#2563eb'} 0%, ${config.successColor || '#059669'} 100%)`,
                          borderRadius: 2,
                          px: 4,
                          textTransform: 'none',
                          fontWeight: '600',
                          boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.4)'
                          }
                        }}
                      >
                        {isLoading ? 'Saving...' : isEditing ? 'Update Asset' : 'Add Asset'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        ) : (
          <CommonListView
            data={assetsData}
            columns={tableColumns}
            // actions={tableActions}
            loading={isFetching}
            emptyMessage="No Assets Found"
            emptyDescription="Add your first asset"
            pagination={paginationConfig}
          />
        )}
      </Box>

      {/* Image Viewer Dialog */}
      <Dialog open={imageViewerOpen} onClose={handleCloseImageViewer} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedImage?.name}</Typography>
            <IconButton onClick={handleCloseImageViewer}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img
                src={selectedImage.preview}
                alt={selectedImage.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {selectedImage.size > 0 && `Size: ${formatFileSize(selectedImage.size)}`}
                {selectedImage.type === 'existing' && ' • Existing Image'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageViewer}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetMaster;
