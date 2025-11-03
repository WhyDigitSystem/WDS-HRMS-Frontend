import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Grid,
    IconButton,
    Alert,
    Snackbar,
    Tooltip,
    Fade,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Pagination,
    Stack
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Visibility,
    Inventory2,
    Category,
    Business,
    CalendarMonth,
    AttachMoney,
    LocationOn,
    Notes,
    QrCode2,
    Save,
    Cancel,
    Computer,
    DirectionsCar,
    Build,
    Memory
} from '@mui/icons-material';
import apiCalls from 'apicall';

const AssetMaster = ({ assets, onAddAsset, onDeleteAsset, config }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [assetsData, setAssetsData] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
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
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Pagination state
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

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAssets = assetsData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(assetsData.length / itemsPerPage);

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
                setCurrentPage(1); // Reset to first page when data changes
            } else {
                showSnackbar('Failed to fetch assets', 'error');
                setAssetsData([]);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
            showSnackbar('Error fetching assets', 'error');
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

                // Populate form data with the fetched asset details
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
                setIsAdding(true); // Switch to form view

                return assetDetails;
            } else {
                showSnackbar('Asset not found', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching asset:', error);
            showSnackbar('Error fetching asset details', 'error');
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate required fields
        const errors = {};
        if (!formData.asset_code) errors.asset_code = 'Asset Code is required';
        if (!formData.asset_name) errors.asset_name = 'Asset Name is required';
        if (!formData.category) errors.category = 'Category is required';

        if (Object.keys(errors).length > 0) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }

        setIsLoading(true);

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
            createdBy: loginUserName
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

                showSnackbar(`Asset ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
                handleCancel();
            } else {
                showSnackbar(response.paramObjectsMap?.errorMessage || `Asset ${isEditing ? 'update' : 'creation'} failed`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showSnackbar(`Asset ${isEditing ? 'update' : 'creation'} failed`, 'error');
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
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-GB');
        } catch {
            return dateString;
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            // ✅ For <input type="date" />
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
                {isFetching ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : isAdding ? (
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

                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Notes"
                                            multiline
                                            rows={3}
                                            value={formData.notes}
                                            onChange={handleInputChange('notes')}
                                            placeholder="Additional notes about the asset..."
                                            size="small"
                                            disabled={isLoading}
                                        />
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
                    <>
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                overflow: 'auto',
                                mb: 2
                            }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: '600', py: 1, textAlign: 'center' }}>Actions</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Asset Details</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Brand/Model</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Location</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentAssets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Inventory2 sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                                        No Assets Found
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Get started by adding your first asset to the system
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentAssets.map((asset) => (
                                            <TableRow
                                                key={asset.id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'grey.50',
                                                        transition: 'background-color 0.2s ease'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ textAlign: 'center', py: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                        <Tooltip title="Edit Asset">
                                                            <IconButton
                                                                size="small"
                                                                color="info"
                                                                onClick={() => handleEditAsset(asset.id)}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="500">
                                                            {asset.asset_code}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {asset.asset_name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {asset.category}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {asset.brand}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {asset.model}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography variant="body2">
                                                        {asset.location || 'Not specified'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Chip
                                                        label={asset.status}
                                                        color={getStatusColor(asset.status)}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: '600',
                                                            minWidth: 100,
                                                            height: '24px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {assetsData.length > itemsPerPage && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Stack spacing={2}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        showFirstButton
                                        showLastButton
                                        size="medium"
                                    />
                                </Stack>
                            </Box>
                        )}

                        {/* Items per page info */}
                        {assetsData.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, assetsData.length)} of {assetsData.length} assets
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            {/* View Asset Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Inventory2 color="primary" />
                        Asset Details
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedAsset && (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Asset Code</Typography>
                                <Typography variant="body1" gutterBottom>{selectedAsset.asset_code}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Asset Name</Typography>
                                <Typography variant="body1" gutterBottom>{selectedAsset.asset_name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                                <Typography variant="body1" gutterBottom>{selectedAsset.category}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Brand</Typography>
                                <Typography variant="body1" gutterBottom>{selectedAsset.brand}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Model</Typography>
                                <Typography variant="body1" gutterBottom>{selectedAsset.model}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Serial Number</Typography>
                                <Typography variant="body1" gutterBottom>{selectedAsset.serial_number}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Purchase Date</Typography>
                                <Typography variant="body1" gutterBottom>{formatDate(selectedAsset.purchase_date)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Purchase Cost</Typography>
                                <Typography variant="body1" gutterBottom>${selectedAsset.purchase_cost}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Warranty Expiry</Typography>
                                <Typography variant="body1" gutterBottom>{formatDate(selectedAsset.warranty_expiry)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                                <Typography variant="body1" gutterBottom>{selectedAsset.location}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                                <Typography variant="body1">{selectedAsset.notes}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={Fade}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AssetMaster;