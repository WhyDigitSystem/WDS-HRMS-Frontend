import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Checkbox,
    FormControlLabel,
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
    Stack,
    Avatar
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';

const Approvals = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [assetsData, setAssetsData] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [employeeCode] = useState(localStorage.getItem("employeeCode"));
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

    // Fetch all expence on component mount
    useEffect(() => {
        getAllExpence();
    }, []);

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAssets = assetsData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(assetsData.length / itemsPerPage);

    const getAllExpence = async () => {
        setIsFetching(true);
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getApprovalExpenseAndTravelByOrgId?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap?.approval) {
                const formattedAssets = response.paramObjectsMap.approval.map(asset => ({
                    id: asset.id,
        //             "employeeName": asset.
        // "amount": asset.
        // "submitted": asset.
        // "type": asset.
        // "title": asset.
        // "status": asset.
                }));
                setAssetsData(formattedAssets);
                setCurrentPage(1); // Reset to first page when data changes
            } else {
                showSnackbar('Failed to fetch requests', 'error');
                setAssetsData([]);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            showSnackbar('Error fetching requests', 'error');
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
                showSnackbar('Request not found', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
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

                // Refresh the expence list
                await getAllExpence();

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
                            <TableCell sx={{ fontWeight: '600', py: 1 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: '600', py: 1 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: '600', py: 1 }}>Employee</TableCell>
                            <TableCell sx={{ fontWeight: '600', py: 1 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: '600', py: 1 }}>Submitted</TableCell>
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
                                            No Approval Requests Found
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Get started by adding your first Approval Request to the system
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
                                            <Tooltip title="Edit Request">
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
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, assetsData.length)} of {assetsData.length} Approvals
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default Approvals;