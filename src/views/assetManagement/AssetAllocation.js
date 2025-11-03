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
    Alert,
    Snackbar,
    Tooltip,
    Fade,
    Card,
    CardContent,
    Autocomplete,
    CircularProgress,
    IconButton,
    Pagination,
    Stack
} from '@mui/material';
import {
    Add,
    AssignmentReturn,
    CalendarMonth,
    Notes,
    Save,
    Cancel,
    Inventory2,
    Search,
    Edit
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

const AssetAllocation = ({ assets, onAllocateAsset, onReturnAsset, config }) => {
    const [isAllocating, setIsAllocating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        asset_id: '',
        asset_name: '',
        employee_id: '',
        employee_name: '',
        allocation_date: new Date().toISOString().split('T')[0],
        expected_return: '',
        condition: 'Excellent',
        notes: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [assetOptions, setAssetOptions] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [branchCode] = useState(localStorage.getItem("branchCode"));
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];

    // Fetch all data on component mount
    useEffect(() => {
        getAllEmployees();
        getAssetOptions();
        getAllAllocations();
    }, []);

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAllocations = allocations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allocations.length / itemsPerPage);

    const getAssetOptions = async () => {
        setLoading(true);
        try {
            const response = await apiCalls(
                "get",
                `/assetmanagement/getAssetNameCodeByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            const data = response?.paramObjectsMap?.assetMasterVO || [];

            if (Array.isArray(data) && data.length > 0) {
                setAssetOptions(data);
            } else {
                throw new Error("No asset data found");
            }
        } catch (error) {
            console.error("Error fetching asset options:", error);
            setAssetOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const getAllAllocations = async () => {
        try {
            setLoading(true);
            const response = await apiCalls(
                "get",
                `/assetmanagement/getAssetAllocationByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            const data = response?.paramObjectsMap?.assetAllocationVO || [];

            if (Array.isArray(data)) {
                setAllocations(data);
                setCurrentPage(1); // Reset to first page when data changes
            } else {
                throw new Error("No allocation data found");
            }
        } catch (error) {
            console.error("Error fetching allocations:", error);
            setAllocations([]);
        } finally {
            setLoading(false);
        }
    };

    const getAllocationById = async (id) => {
        try {
            setLoading(true);
            const response = await apiCalls(
                "get",
                `/assetmanagement/getAssetAllocationById?id=${id}`
            );

            const allocation = response?.paramObjectsMap?.assetAllocationVO;

            if (allocation) {
                // Populate form with allocation data
                setFormData({
                    asset_id: allocation.assetCode || '',
                    asset_name: allocation.assetName || '',
                    employee_id: allocation.employeeCode || '',
                    employee_name: allocation.employeeName || '',
                    allocation_date: allocation.allocationDate || new Date().toISOString().split('T')[0],
                    expected_return: allocation.expectedreturndate || '',
                    condition: allocation.assetcondition || 'Excellent',
                    notes: allocation.allocationnotes || ''
                });

                // Set selected employee for Autocomplete
                const employee = employees.find(emp => emp.employeeCode === allocation.employeeCode);
                if (employee) {
                    setSelectedEmployee(employee);
                }

                // Set selected asset for Autocomplete
                const asset = assetOptions.find(ast => ast.assetCode === allocation.assetCode);
                if (asset) {
                    // This will be handled by the Autocomplete component
                }

                setIsEditing(true);
                setEditingId(id);
                setIsAllocating(true);

            } else {
                throw new Error("Allocation data not found");
            }
        } catch (error) {
            console.error("Error fetching allocation by ID:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAllEmployees = async () => {
        try {
            setLoading(true);
            const response = await apiCalls("get", `/master/getAllEmployeeByOrgId?orgId=${orgId}`);
            const list = response?.paramObjectsMap?.employeeVO || [];

            const formatted = list.map((emp) => ({
                label: `${emp.employee || emp.employeeName} - ${emp.employeeCode}`,
                ...emp,
                profileImage: emp.profileImage
                    ? `data:image/jpeg;base64,${emp.profileImage}`
                    : null,
            }));

            setEmployees(formatted);
        } catch (err) {
            console.error("Error fetching employees:", err);
            showToast('error', 'Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = (event, val) => {
        setSelectedEmployee(val);

        if (val && val.employeeCode) {
            setFormData(prev => ({
                ...prev,
                employee_id: val.employeeCode,
                employee_name: val.employee || val.employeeName,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                employee_id: '',
                employee_name: '',
            }));
        }
    };

    const handleAssetChange = (event, newValue) => {
        setFormData((prev) => ({
            ...prev,
            asset_id: newValue ? newValue.assetCode : "",
            asset_name: newValue ? newValue.assetName : "",
        }));
    };

    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        // Validate required fields
        const errors = {};
        if (!formData.asset_id) errors.asset_id = 'Asset is required';
        if (!formData.employee_id) errors.employee_id = 'Employee is required';
        if (!formData.allocation_date) errors.allocation_date = 'Allocation date is required';
        if (!formData.condition) errors.condition = 'Condition is required';

        if (Object.keys(errors).length > 0) {
            showToast('error', 'Please fill all required fields');
            setIsSubmitting(false);
            return;
        }

        try {
            const saveData = {
                allocationDate: formData.allocation_date,
                allocationnotes: formData.notes || '',
                assetCode: formData.asset_id,
                assetName: formData.asset_name,
                assetcondition: formData.condition,
                branch: "BENGALORE", // You might want to get this from localStorage
                branchCode: branchCode,
                createdBy: loginUserName,
                employeeCode: formData.employee_id,
                employeeName: formData.employee_name,
                expectedreturndate: formData.expected_return || formData.allocation_date,
                finyear: config.finyear || '2025',
                orgId: parseInt(orgId) || 0,
            };

            console.log(`${isEditing ? 'Updating' : 'Creating'} allocation data:`, saveData);

            const response = await apiCalls('put', '/assetmanagement/CreateUpdateAssetAllocation', saveData);

            if (response.status === true) {
                console.log('Allocation response:', response);

                // Refresh allocations list
                await getAllAllocations();

                // Also update local assets state if needed
                const localAsset = assets.find(a => a.asset_code === formData.asset_id);
                if (localAsset && onAllocateAsset) {
                    const updatedAsset = {
                        ...localAsset,
                        status: 'Allocated',
                        assigned_to: formData.employee_name,
                        employee_id: formData.employee_id,
                        allocation_date: formData.allocation_date,
                        return_date: formData.expected_return,
                        condition: formData.condition,
                        notes: formData.notes
                    };
                    onAllocateAsset(updatedAsset);
                }

                showToast('success', `Asset ${isEditing ? 'updated' : 'allocated'} successfully!`);
                handleCancel();
            } else {
                showToast('error', response.paramObjectsMap?.errorMessage || `Asset ${isEditing ? 'update' : 'allocation'} failed`);
            }
        } catch (error) {
            console.error('Error saving allocation:', error);
            showToast('error', `Asset ${isEditing ? 'update' : 'allocation'} failed. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (allocationId) => {
        getAllocationById(allocationId);
    };

    const handleAllocate = () => {
        setIsAllocating(true);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleCancel = () => {
        setIsAllocating(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            asset_id: '',
            asset_name: '',
            employee_id: '',
            employee_name: '',
            allocation_date: new Date().toISOString().split('T')[0],
            expected_return: '',
            condition: 'Excellent',
            notes: ''
        });
        setSelectedEmployee(null);
    };

    return (
        <>
            {/* Header with Allocate Button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                {!isAllocating && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAllocate}
                        disabled={loading}
                        sx={{
                            backgroundColor: config.primaryColor || '#2563eb',
                            background: `linear-gradient(135deg, ${config.primaryColor || '#2563eb'} 0%, ${config.successColor || '#059669'} 100%)`,
                            borderRadius: 2,
                            px: 1,
                            py: 0.8,
                            mb: 1,
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textTransform: 'none',
                            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.4)',
                                transform: 'translateY(-1px)',
                            },
                            '&:disabled': {
                                background: 'grey.300',
                                boxShadow: 'none',
                                transform: 'none',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {loading ? 'Loading...' : 'Allocate Asset'}
                    </Button>
                )}
            </Box>

            {/* Content Area */}
            <Box sx={{ p: 3 }}>
                {isAllocating ? (
                    // Allocation Form (shown when allocating or editing)
                    <Card
                        variant="outlined"
                        sx={{
                            maxWidth: 1200,
                            mx: 'auto',
                            borderRadius: 2,
                            mb: 3
                        }}
                    >
                        {/* Action Buttons at the Top */}
                        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'white' }}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={handleCancel}
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    disabled={isSubmitting}
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
                                    form="allocation-form"
                                    variant="contained"
                                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                                    disabled={isSubmitting}
                                    sx={{
                                        background: `linear-gradient(135deg, ${config.primaryColor || '#2563eb'} 0%, ${config.successColor || '#059669'} 100%)`,
                                        borderRadius: 2,
                                        px: 4,
                                        textTransform: 'none',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.4)',
                                        },
                                        '&:disabled': {
                                            background: 'grey.300',
                                        }
                                    }}
                                >
                                    {isSubmitting
                                        ? (isEditing ? 'Updating...' : 'Allocating...')
                                        : (isEditing ? 'Update Allocation' : 'Allocate Asset')
                                    }
                                </Button>
                            </Box>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                            <form id="allocation-form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            fullWidth
                                            size="small"
                                            disabled={loading || isSubmitting}
                                            loading={loading}
                                            options={assetOptions}
                                            getOptionLabel={(option) => `${option.assetCode} - ${option.assetName}` || ""}
                                            isOptionEqualToValue={(option, value) => option.assetCode === value.assetCode}
                                            value={
                                                assetOptions.find(
                                                    (opt) => String(opt.assetCode) === String(formData.asset_id)
                                                ) || null
                                            }
                                            onChange={handleAssetChange}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Select Asset"
                                                    required
                                                    helperText={loading ? "Loading assets..." : ""}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loading ? <CircularProgress size={18} color="inherit" /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Row 2 - Three fields */}
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            options={employees}
                                            getOptionLabel={(option) => option.label || ""}
                                            value={selectedEmployee}
                                            onChange={handleEmployeeSelect}
                                            size="small"
                                            loading={loading}
                                            disabled={isSubmitting}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Employee Name"
                                                    variant="outlined"
                                                    required
                                                    placeholder="Type to search employees..."
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: 2,
                                                            height: 40,
                                                            "&:hover fieldset": {
                                                                borderColor: '#667eea',
                                                            },
                                                            "&.Mui-focused fieldset": {
                                                                borderColor: '#667eea',
                                                                borderWidth: 2,
                                                            },
                                                        },
                                                        "& .MuiInputLabel-root.Mui-focused": {
                                                            color: '#667eea',
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Asset Condition"
                                            value={formData.condition}
                                            onChange={handleInputChange('condition')}
                                            required
                                            disabled={isSubmitting}
                                            size="small"
                                        >
                                            {conditions.map((condition) => (
                                                <MenuItem key={condition} value={condition}>
                                                    {condition}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    {/* Row 3 - Three fields */}
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Allocation Date"
                                            type="date"
                                            value={formData.allocation_date}
                                            onChange={handleInputChange('allocation_date')}
                                            InputLabelProps={{ shrink: true }}
                                            required
                                            disabled={isSubmitting}
                                            size="small"
                                            InputProps={{
                                                startAdornment: <CalendarMonth sx={{ color: 'text.secondary', mr: 1 }} />
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Expected Return Date"
                                            type="date"
                                            value={formData.expected_return}
                                            onChange={handleInputChange('expected_return')}
                                            InputLabelProps={{ shrink: true }}
                                            disabled={isSubmitting}
                                            size="small"
                                            InputProps={{
                                                startAdornment: <CalendarMonth sx={{ color: 'text.secondary', mr: 1 }} />
                                            }}
                                        />
                                    </Grid>

                                    {/* Row 4 - Notes (full width) */}
                                    <Grid item xs={12} sm={9}>
                                        <TextField
                                            fullWidth
                                            label="Allocation Notes"
                                            multiline
                                            rows={2}
                                            value={formData.notes}
                                            onChange={handleInputChange('notes')}
                                            disabled={isSubmitting}
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    // Allocations Table with Pagination (shown when not allocating)
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
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: '600', py: 2, textAlign: 'center' }}>Actions</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 2 }}>Asset Details</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 2 }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 2 }}>Allocation Date</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 2 }}>Expected Return</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 2 }}>Condition</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 2 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentAllocations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Inventory2 sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                                        No Allocations Found
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Allocate assets to employees to track assignments
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentAllocations.map((allocation) => (
                                            <TableRow
                                                key={allocation.id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'grey.50',
                                                        transition: 'background-color 0.2s ease'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <Tooltip title="Edit Allocation">
                                                            <IconButton
                                                                onClick={() => handleEdit(allocation.id)}
                                                                color="primary"
                                                                size="small"
                                                                sx={{
                                                                    borderRadius: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: 'primary.light',
                                                                        color: 'white'
                                                                    }
                                                                }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                                            {allocation.assetCode}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {allocation.assetName}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="500">
                                                            {allocation.employeeName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ID: {allocation.employeeCode}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {allocation.allocationDate}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {allocation.expectedreturndate || 'Not specified'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={allocation.assetcondition}
                                                        color={
                                                            allocation.assetcondition === 'Excellent' ? 'success' :
                                                                allocation.assetcondition === 'Good' ? 'primary' :
                                                                    allocation.assetcondition === 'Fair' ? 'warning' : 'error'
                                                        }
                                                        size="small"
                                                        sx={{
                                                            fontWeight: '600',
                                                            minWidth: 80
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={allocation.active ? "Active" : "Inactive"}
                                                        color={allocation.active ? "success" : "error"}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: '600',
                                                            minWidth: 80
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
                        {allocations.length > itemsPerPage && (
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
                        {allocations.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allocations.length)} of {allocations.length} allocations
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>

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

export default AssetAllocation;