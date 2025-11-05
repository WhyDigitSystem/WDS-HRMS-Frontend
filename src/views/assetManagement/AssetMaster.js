import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    Chip,
    Grid,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Add,
    Edit,
    Save,
    Cancel,
    Delete,
    CloudUpload,
    Visibility,
    Close
} from '@mui/icons-material';
import apiCalls from 'apicall';
import CommonListView from '../../utils/AssetCommonListViewTable'; // Adjust path as needed
import { showToast } from 'utils/toast-component';

const AssetMaster = ({ config }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [assetsData, setAssetsData] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [branchCode] = useState(localStorage.getItem("branchCode"));
    const [branch] = useState(localStorage.getItem("branch"));
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
        notes: ''
    });
    const [uploadedImages, setUploadedImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);

    // Pagination state - same as AssetManagement
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const categories = [
        'IT Equipment',
        'Furniture',
        'Vehicle',
        'Machinery',
        'Office Equipment',
        'Electronics',
        'Tools',
        'Safety Equipment'
    ];

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
            render: (value) => (
                <Typography variant="body2">
                    {value || 'Not specified'}
                </Typography>
            )
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
    const tableActions = [
        {
            icon: <Edit fontSize="small" />,
            tooltip: 'Edit Asset',
            color: 'info',
            onClick: (asset) => handleEditAsset(asset.id)
        }
    ];

    // Pagination configuration - EXACTLY like AssetManagement
    // In AssetMaster component - simplified pagination config
    const paginationConfig = {
        currentPage,
        totalPages: Math.ceil(assetsData.length / itemsPerPage),
        itemsPerPage,
        onPageChange: (event, value) => setCurrentPage(value)
    };

    const getAllAssets = async () => {
        setIsFetching(true);
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getAssetMasterByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap?.assetMasterVO) {
                const formattedAssets = response.paramObjectsMap.assetMasterVO.map(asset => ({
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
                    status: 'Available',
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
                setCurrentPage(1); // Reset to first page when data loads
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
            const response = await apiCalls(
                'get',
                `/assetmanagement/getAssetMasterById?id=${assetId}`
            );

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
                    status: 'Available',
                    branch: asset.branch,
                    branchCode: asset.branchCode,
                    orgId: asset.orgId
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
                    notes: asset.notes || ''
                });

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
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    // Image Upload Functions
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter(file =>
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
        );

        if (validFiles.length !== files.length) {
            showToast('warning', 'Some files were skipped. Only images under 5MB are allowed.');
        }

        const newImages = validFiles.map(file => ({
            id: Date.now() + Math.random(),
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size
        }));

        setUploadedImages(prev => [...prev, ...newImages]);
        event.target.value = ''; // Reset file input
    };

    const handleRemoveImage = (imageId) => {
        setUploadedImages(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return prev.filter(img => img.id !== imageId);
        });
    };

    const handleViewImage = (image) => {
        setSelectedImage(image);
        setImageViewerOpen(true);
    };

    const handleCloseImageViewer = () => {
        setImageViewerOpen(false);
        setSelectedImage(null);
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

        // Validate required fields
        const errors = {};
        if (!formData.asset_code) errors.asset_code = 'Asset Code is required';
        if (!formData.asset_name) errors.asset_name = 'Asset Name is required';
        if (!formData.category) errors.category = 'Category is required';

        if (Object.keys(errors).length > 0) {
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        // Prepare image data for upload (you'll need to implement actual file upload)
        const imageData = uploadedImages.map(img => ({
            name: img.name,
            size: img.size,
            type: img.file.type
            // Add actual upload logic here
        }));

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
            images: imageData // Add images data
        };

        // Add ID for update operation
        if (isEditing && selectedAsset) {
            saveData.id = selectedAsset.id;
        }

        console.log('DATA TO SAVE IS:', saveData);

        try {
            const response = await apiCalls('put', '/assetmanagement/CreateUpdateAssetMaster', saveData);

            if (response.status === true) {
                console.log('Response:', response);

                // Refresh the assets list
                await getAllAssets();

                showToast('success', `Asset ${isEditing ? 'updated' : 'added'} successfully!`);
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
            notes: ''
        });
        setUploadedImages([]);
        setCurrentPage(1); // Reset to first page when adding new asset
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
            notes: ''
        });
        // Clean up image URLs
        uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
        setUploadedImages([]);
        setCurrentPage(1); // Reset to first page when canceling
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'success';
            case 'Allocated': return 'warning';
            case 'Maintenance': return 'error';
            case 'Retired': return 'default';
            default: return 'info';
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return dateString;
        }
    };

    return (
        <>
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
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.3s ease',
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
                                    <Chip
                                        label={`Editing: ${selectedAsset.asset_code}`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            </Box>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Asset Code"
                                            value={formData.asset_code}
                                            onChange={handleInputChange('asset_code')}
                                            required
                                            placeholder="e.g., ASSET-001"
                                            size="small"
                                            disabled={isLoading || isEditing}
                                            helperText={isEditing ? "Asset Code cannot be edited" : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Asset Name"
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
                                        <TextField
                                            fullWidth
                                            label="Purchase Date"
                                            type="date"
                                            value={formatDateForInput(formData.purchase_date)}
                                            onChange={handleInputChange('purchase_date')}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            disabled={isLoading}
                                        />
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
                                        <TextField
                                            fullWidth
                                            label="Warranty Expiry"
                                            type="date"
                                            value={formatDateForInput(formData.warranty_expiry)}
                                            onChange={handleInputChange('warranty_expiry')}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            disabled={isLoading}
                                        />
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

                                    {/* Notes and Image Upload Section */}
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Notes"
                                            multiline
                                            rows={1}
                                            value={formData.notes}
                                            onChange={handleInputChange('notes')}
                                            placeholder="Additional notes about the asset..."
                                            size="small"
                                            disabled={isLoading}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        {/* Image Upload Section */}
                                        <Box>
                                            {/* Header */}
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    mb: 1.5,
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    fontSize: '0.95rem',
                                                }}
                                            >
                                                Asset Images ({uploadedImages.length} uploaded)
                                            </Typography>

                                            {/* Upload Button */}
                                            <Button
                                                component="label"
                                                variant="contained"
                                                startIcon={<CloudUpload />}
                                                disabled={isLoading}
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
                                                        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.35)',
                                                    },
                                                }}
                                            >
                                                Upload Images
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                />
                                            </Button>

                                            {/* Uploaded Images Grid */}
                                            {uploadedImages.length > 0 && (
                                                <Grid container spacing={1.5}>
                                                    {uploadedImages.map((image) => (
                                                        <Grid item xs={4} key={image.id}>
                                                            <Box
                                                                sx={{
                                                                    position: 'relative',
                                                                    borderRadius: 2,
                                                                    overflow: 'hidden',
                                                                    height: 90,
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                                                                    },
                                                                    '&:hover .image-overlay': {
                                                                        opacity: 1,
                                                                    },
                                                                }}
                                                            >
                                                                <img
                                                                    src={image.preview}
                                                                    alt={image.name}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                    }}
                                                                    onClick={() => handleViewImage(image)}
                                                                />
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
                                                                        transition: 'opacity 0.25s ease',
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
                                                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
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
                                                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
                                                                        }}
                                                                    >
                                                                        <Delete fontSize="small" />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>

                                                            {/* Image Info */}
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    display: 'block',
                                                                    mt: 0.5,
                                                                    fontWeight: 500,
                                                                    color: '#334155',
                                                                }}
                                                            >
                                                                {image.name.length > 15
                                                                    ? image.name.substring(0, 15) + '...'
                                                                    : image.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatFileSize(image.size)}
                                                            </Typography>
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
                                                        boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.4)',
                                                    }
                                                }}
                                            >
                                                {isLoading ? 'Saving...' : (isEditing ? 'Update Asset' : 'Add Asset')}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    // Pass the full assetsData array to CommonListView - let it handle pagination internally
                    <CommonListView
                        data={assetsData} // Full array - CommonListView handles pagination
                        columns={tableColumns}
                        actions={tableActions}
                        loading={isFetching}
                        emptyMessage="No Assets Found"
                        emptyDescription="Add your first asset"
                        pagination={paginationConfig} // Same pagination config as AssetManagement
                    />
                )}
            </Box>

            {/* Image Viewer Dialog */}
            <Dialog
                open={imageViewerOpen}
                onClose={handleCloseImageViewer}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {selectedImage?.name}
                        </Typography>
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
                                Size: {formatFileSize(selectedImage.size)}
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