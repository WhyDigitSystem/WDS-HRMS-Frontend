import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    MenuItem,
    Chip,
    Grid,
    Alert,
    Snackbar,
    Fade,
    Card,
    CardContent,
    Autocomplete,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import {
    Add,
    CalendarMonth,
    Save,
    Cancel,
    Inventory2,
    Edit
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import CommonListView from '../../utils/AssetCommonListViewTable';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';

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
        notes: '',
        active: true
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [assetOptions, setAssetOptions] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [branchCode] = useState(localStorage.getItem("branchCode"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination state - same as AssetManagement
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];

    useEffect(() => {
        getAllEmployees();
        getAssetOptions();
        getAllAllocations();
    }, []);

    const tableColumns = [
        {
            key: 'asset_details',
            label: 'Asset Details',
            render: (value, row) => (
                <Box>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        {row.assetCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {row.assetName}
                    </Typography>
                </Box>
            )
        },
        {
            key: 'employee_details',
            label: 'Name',
            render: (value, row) => (
                <Box>
                    <Typography variant="body2" fontWeight="500">
                        {row.employeeName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ID: {row.employeeCode}
                    </Typography>
                </Box>
            )
        },
        {
            key: 'allocationDate',
            label: 'Allocation Date',
            render: (value) => (
                <Typography variant="body2">
                    {formatDate(value)} {/* ✅ now DD-MM-YYYY */}
                </Typography>
            )
        },
        {
            key: 'expected_return',
            label: 'Expected Return',
            render: (value, row) => (
                <Typography variant="body2">
                    {row.expectedreturndate ? formatDate(row.expectedreturndate) : 'Not specified'} {/* ✅ formatted */}
                </Typography>
            )
        },
        {
            key: 'assetcondition',
            label: 'Condition',
            render: (value) => (
                <Chip
                    label={value}
                    color={
                        value === 'Excellent'
                            ? 'success'
                            : value === 'Good'
                                ? 'primary'
                                : value === 'Fair'
                                    ? 'warning'
                                    : 'error'
                    }
                    size="small"
                    sx={{
                        fontWeight: '600',
                        minWidth: 80
                    }}
                />
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value, row) => (
                <Chip
                    label={row.active ? 'Active' : 'Inactive'}
                    color={row.active ? 'success' : 'error'}
                    size="small"
                    sx={{
                        fontWeight: '600',
                        minWidth: 80
                    }}
                />
            )
        }
    ];

    // Table actions configuration
    const tableActions = [
        {
            icon: <Edit fontSize="small" />,
            tooltip: 'Edit Allocation',
            color: 'primary',
            onClick: (allocation) => handleEdit(allocation.id)
        }
    ];

    // Pagination configuration - EXACTLY like AssetManagement
    const paginationConfig = {
        currentPage,
        totalPages: Math.ceil(allocations.length / itemsPerPage),
        itemsPerPage,
        indexOfFirstItem: (currentPage - 1) * itemsPerPage,
        indexOfLastItem: Math.min(currentPage * itemsPerPage, allocations.length),
        onPageChange: (event, value) => setCurrentPage(value)
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = dayjs(dateString);
        return date.isValid() ? date.format('DD-MM-YYYY') : 'N/A';
    };

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
                    notes: allocation.allocationnotes || '',
                    active: allocation.active !== undefined ? allocation.active : true
                });

                // Set selected employee for Autocomplete
                const employee = employees.find(emp => emp.employeeCode === allocation.employeeCode);
                if (employee) {
                    setSelectedEmployee(employee);
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
        const value = field === 'active' ? event.target.checked : event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
                branch: branch,
                branchCode: branchCode,
                createdBy: loginUserName,
                employeeCode: formData.employee_id,
                employeeName: formData.employee_name,
                expectedreturndate: formData.expected_return || formData.allocation_date,
                finyear: config.finyear || '2025',
                orgId: parseInt(orgId) || 0,
                active: formData.active
            };

            // Add ID for update operation
            if (isEditing && editingId) {
                saveData.id = editingId;
            }

            console.log(`${isEditing ? 'Updating' : 'Creating'} allocation data:`, saveData);

            const response = await apiCalls('put', '/assetmanagement/CreateUpdateAssetAllocation', saveData);

            if (response.status === true) {
                console.log('Allocation response:', response);

                // Refresh allocations list
                await getAllAllocations();
                getAssetOptions();

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
        setFormData({
            asset_id: '',
            asset_name: '',
            employee_id: '',
            employee_name: '',
            allocation_date: new Date().toISOString().split('T')[0],
            expected_return: '',
            condition: 'Excellent',
            notes: '',
            active: true
        });
        setSelectedEmployee(null);
        setCurrentPage(1); // Reset to first page when starting allocation
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
            notes: '',
            active: true
        });
        setSelectedEmployee(null);
        setCurrentPage(1); // Reset to first page when canceling
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
                                        <FormControl fullWidth variant="outlined" size="small">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label={
                                                        <span>
                                                            Allocation Date<span style={{ color: 'red' }}> *</span>
                                                        </span>
                                                    }
                                                    format="DD-MM-YYYY"
                                                    value={formData.allocation_date ? dayjs(formData.allocation_date) : null}
                                                    onChange={(newValue) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            allocation_date: newValue ? newValue.toISOString() : '',
                                                        }));
                                                    }}
                                                    disabled={isSubmitting}
                                                    slotProps={{
                                                        textField: {
                                                            size: 'small',
                                                            fullWidth: true,
                                                            required: true,
                                                            sx: {
                                                                '& .MuiInputBase-root': {
                                                                    backgroundColor: '#f9fafb',
                                                                    borderRadius: '8px',
                                                                },
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#94a3b8',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#94a3b8',
                                                                },
                                                                '& .Mui-disabled': {
                                                                    backgroundColor: '#f9fafb',
                                                                    color: '#334155',
                                                                },
                                                            },
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth variant="outlined" size="small">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Expected Return Date"
                                                    format="DD-MM-YYYY"
                                                    value={formData.expected_return ? dayjs(formData.expected_return) : null}
                                                    onChange={(newValue) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            expected_return: newValue ? newValue.toISOString() : '',
                                                        }));
                                                    }}
                                                    disabled={isSubmitting}
                                                    slotProps={{
                                                        textField: {
                                                            size: 'small',
                                                            fullWidth: true,
                                                            sx: {
                                                                '& .MuiInputBase-root': {
                                                                    backgroundColor: '#f9fafb',
                                                                    borderRadius: '8px',
                                                                },
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#94a3b8',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#94a3b8',
                                                                },
                                                                '& .Mui-disabled': {
                                                                    backgroundColor: '#f9fafb',
                                                                    color: '#334155',
                                                                },
                                                            },
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </Grid>

                                    {/* Row 4 - Notes and Active Checkbox */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Allocation Notes"
                                            multiline
                                            rows={1}
                                            value={formData.notes}
                                            onChange={handleInputChange('notes')}
                                            disabled={isSubmitting}
                                            size="small"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={3}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.active}
                                                    onChange={handleInputChange('active')}
                                                    color="primary"
                                                    disabled={isSubmitting}
                                                />
                                            }
                                            label="Active"
                                            sx={{ mt: 1 }}
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    // Pass full allocations array to CommonListView - let it handle pagination internally
                    <CommonListView
                        data={allocations} // Full array - CommonListView handles pagination
                        columns={tableColumns}
                        actions={tableActions}
                        loading={loading}
                        emptyMessage="No Allocations Found"
                        emptyDescription="Allocate assets to employees to track assignments"
                        pagination={paginationConfig} // Same pagination config as AssetManagement
                    />
                )}
            </Box>
            <ToastContainer />

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