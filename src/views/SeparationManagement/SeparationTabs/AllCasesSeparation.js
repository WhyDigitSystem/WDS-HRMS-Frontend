// src/components/AdvancedOfferLetterSystem/tabs/AllOffers.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Button,
    Typography,
    Chip,
    InputAdornment,
    Autocomplete,
    CircularProgress,
    Alert,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import SendIcon from '@mui/icons-material/Send';
import CommonListView from '../../../utils/AssetCommonListViewTable';
import apiCalls from 'apicall';

const AllCasesSeparation = () => {
    const [status, setStatus] = useState('ALL');
    const [departmentList, setDepartmentList] = useState([]);
    const [search, setSearch] = useState('');
    const [separations, setSeparations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [formData, setFormData] = useState({
        department: 'ALL',
        departmentName: 'All',
        separationType: 'ALL'
    });

    // Pagination state - EXACTLY like Candidates component
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const statusOptions = [
        { value: 'ALL', label: 'All Status' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    const separationTypes = [
        { value: 'ALL', label: 'All Types' },
        { value: 'Resignation', label: 'Resignation' },
        { value: 'Termination', label: 'Termination' },
        { value: 'Retirement', label: 'Retirement' },
        { value: 'Contract End', label: 'Contract End' },
        { value: 'Voluntary', label: 'Voluntary' },
        { value: 'Other', label: 'Other' }
    ];

    // Calculate filtered data - REMOVE manual pagination slicing
    const filteredSeparations = separations.filter(separation => {
        if (!search) return true;

        const searchTerm = search.toLowerCase();
        return (
            separation.employeeName?.toLowerCase().includes(searchTerm) ||
            separation.employeeCode?.toLowerCase().includes(searchTerm) ||
            separation.position?.toLowerCase().includes(searchTerm) ||
            separation.department?.toLowerCase().includes(searchTerm)
        );
    });

    // Pagination configuration - EXACTLY like Candidates component
    const paginationConfig = {
        currentPage,
        totalPages: Math.ceil(filteredSeparations.length / itemsPerPage), // Use filteredSeparations length
        itemsPerPage,
        onPageChange: (event, value) => setCurrentPage(value)
    };

    // REMOVE manual pagination calculation - CommonListView handles this internally
    // const indexOfLastItem = currentPage * itemsPerPage;
    // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // const currentItems = filteredSeparations.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        getAllDepartment();
    }, [orgId, branchCode]);

    useEffect(() => {
        getAllSeparations();
    }, [status, formData.department, formData.separationType, orgId, branchCode]);

    const getAllDepartment = async () => {
        try {
            const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
            if (response.status === true) {
                const departmentData = response.paramObjectsMap.departmentVO || [];

                const formattedDepartments = [
                    { label: 'All', value: 'ALL' },
                    ...departmentData.map(dep => ({
                        label: dep.departmentName,
                        value: dep.departmentCode
                    }))
                ];

                setDepartmentList(formattedDepartments);
                setFormData(prev => ({
                    ...prev,
                    department: 'ALL'
                }));
            } else {
                console.error('API Error:', response);
                setError('Failed to load departments');
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Error loading departments');
        }
    };

    const getAllSeparations = async () => {
        if (!orgId || !branchCode) return;

        setLoading(true);
        setError('');
        try {
            // Build API URL with all filters - use departmentName for API call
            const apiUrl = `employeseparation/getInitiateSeparationByDepartment?branchCode=${branchCode}&department=${formData.department === 'ALL' ? 'ALL' : formData.departmentName}&orgId=${orgId}&type=${formData.separationType === 'ALL' ? status : formData.separationType}`;

            const response = await apiCalls('get', apiUrl);

            if (response.status === true) {
                const separationsData = response.paramObjectsMap.initiateSeparationVO || [];
                setSeparations(separationsData);
                setCurrentPage(1); // Reset to first page when data loads - EXACTLY like Candidates
            } else {
                setError('Failed to load separation cases');
                setSeparations([]);
            }
        } catch (error) {
            console.error('Error fetching separations:', error);
            setError('Error loading separation data');
            setSeparations([]);
        } finally {
            setLoading(false);
        }
    };

    // Format date from "2025-11-17" to "17/11/2025"
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            // Check if the date is already in DD/MM/YYYY format
            if (typeof dateString === 'string' && dateString.includes('/')) {
                const [day, month, year] = dateString.split('/');

                // Validate the parts
                if (day && month && year) {
                    // Create a proper Date object (months are 0-indexed in JavaScript)
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

                    // Check if the date is valid
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
                    }
                }
            }

            // Fallback for other date formats or invalid dates
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-GB');
            }

            return 'N/A';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    // Calculate clearance progress
    const calculateClearanceProgress = (clearanceItems) => {
        if (!clearanceItems || !Array.isArray(clearanceItems)) return '0/0';

        const totalItems = clearanceItems.length;
        const completedItems = clearanceItems.filter(item =>
            item.status === 'COMPLETED' || item.completed
        ).length;

        return `${completedItems}/${totalItems}`;
    };

    const getStatusColor = (status, cancelFlag) => {
        if (cancelFlag === 'T') return 'error';

        switch (status?.toUpperCase()) {
            case 'ACTIVE':
            case 'PENDING':
                return 'warning';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    // Define columns for the list view
    const columns = [
        {
            key: 'employeeName',
            label: 'Employee Name',
            width: '200px',
            render: (value, row) => (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {value || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {row.employeeCode || 'No code'}
                    </Typography>
                </Box>
            )
        },
        {
            key: 'department',
            label: 'Department',
            width: '120px',
            render: (value) => (
                <Chip
                    label={value || 'N/A'}
                    size="small"
                    variant="outlined"
                    sx={{
                        fontWeight: 500,
                        backgroundColor: '#f8fafc',
                        borderColor: '#e2e8f0'
                    }}
                />
            )
        },
        {
            key: 'position',
            label: 'Position',
            width: '150px',
            render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {value || 'N/A'}
                </Typography>
            )
        },
        {
            key: 'separationType',
            label: 'Separation Type',
            width: '130px',
            render: (value, row) => (
                <Chip
                    label={value || 'N/A'}
                    color={getStatusColor(value, row.cancel)}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        borderRadius: 1,
                    }}
                />
            )
        },
        {
            key: 'resignation',
            label: 'Resignation Date',
            width: '130px',
            render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {formatDate(value)}
                </Typography>
            )
        },
        {
            key: 'lastWorkingDate',
            label: 'Last Working Date',
            width: '130px',
            render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#dc2626' }}>
                    {formatDate(value)}
                </Typography>
            )
        },
        {
            key: 'rehireEligible',
            label: 'Rehire Eligible',
            width: '100px',
            render: (value) => (
                <Chip
                    label={value || 'No'}
                    size="small"
                    color={value === 'Yes' ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                />
            )
        },

        // ✅ NEW STATUS COLUMN
        {
            key: 'status',
            label: 'Status',
            width: '120px',
            render: (value) => {
                let color = 'default';
                let bg = '#f1f5f9';
                let textColor = '#334155';

                switch (value?.toLowerCase()) {
                    case 'approved':
                        color = 'success';
                        bg = '#dcfce7';
                        textColor = '#166534';
                        break;
                    case 'pending':
                        color = 'warning';
                        bg = '#fef9c3';
                        textColor = '#854d0e';
                        break;
                    case 'rejected':
                        color = 'error';
                        bg = '#fee2e2';
                        textColor = '#991b1b';
                        break;
                    case 'cancelled':
                        color = 'default';
                        bg = '#e2e8f0';
                        textColor = '#475569';
                        break;
                    default:
                        color = 'default';
                        bg = '#f1f5f9';
                        textColor = '#334155';
                }

                return (
                    <Chip
                        label={value || 'N/A'}
                        size="small"
                        sx={{
                            backgroundColor: bg,
                            color: textColor,
                            fontWeight: 600,
                            borderRadius: 1,
                            textTransform: 'capitalize'
                        }}
                    />
                );
            }
        }
    ];

    // Define actions for the list view
    const actions = [
        {
            icon: <RemoveRedEyeIcon fontSize="small" />,
            tooltip: 'View Separation Details',
            color: 'primary',
            onClick: (row) => console.log('View separation:', row.id)
        },
    ];

    const handleClearAllFilters = () => {
        setStatus('ALL');
        setSearch('');
        setFormData({
            department: 'ALL',
            departmentName: 'All',
            separationType: 'ALL'
        });
        setCurrentPage(1); // Reset to first page when clearing filters
    };

    // Check if any filter is active
    const isAnyFilterActive =
        status !== 'ALL' ||
        formData.department !== 'ALL' ||
        formData.separationType !== 'ALL' ||
        search !== '';

    return (
        <Box sx={{ p: 3 }}>
            {/* ---------- Filters Section ---------- */}
            <Grid
                container
                spacing={2}
                alignItems="center"
                sx={{ mb: 3, p: 2 }}
            >
                <Grid item xs={12} sm={3}>
                    <Autocomplete
                        options={departmentList}
                        size="small"
                        clearOnEscape
                        disableClearable={false}
                        getOptionLabel={(option) => option.label || ''}
                        value={
                            departmentList.find((option) => option.value === formData.department) || null
                        }
                        onChange={(event, newValue) => {
                            setFormData((prev) => ({
                                ...prev,
                                department: newValue ? newValue.value : 'ALL',
                                departmentName: newValue ? newValue.label : 'All'
                            }));
                            setCurrentPage(1); // Reset to first page when filter changes
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Department"
                                placeholder="Select Department"
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 1, height: 40 },
                                    '& .MuiInputLabel-root': { fontSize: '0.875rem' }
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={3}>
                    <Autocomplete
                        options={separationTypes}
                        getOptionLabel={(option) => option.label}
                        value={separationTypes.find(opt => opt.value === formData.separationType) || separationTypes[0]}
                        onChange={(event, newValue) => {
                            setFormData(prev => ({
                                ...prev,
                                separationType: newValue ? newValue.value : 'ALL'
                            }));
                            setCurrentPage(1); // Reset to first page when filter changes
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Separation Type"
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 1, height: 40 },
                                    '& .MuiInputLabel-root': { fontSize: '0.875rem' }
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search"
                        placeholder="Search by name, code, position or department"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset to first page when search changes
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {isAnyFilterActive && (
                                        <IconButton
                                            size="small"
                                            onClick={handleClearAllFilters}
                                            edge="end"
                                            sx={{ mr: -0.5 }}
                                        >
                                            <ClearIcon fontSize="small" color="action" />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                            },
                        }}
                    />
                </Grid>
            </Grid>

            {/* ---------- Error Alert ---------- */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* ---------- Loading State ---------- */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* ---------- List View Section ---------- */}
            {!loading && (
                <CommonListView
                    data={filteredSeparations} // Pass FULL filtered data - CommonListView handles pagination internally
                    columns={columns}
                    actions={actions}
                    pagination={paginationConfig} // Pass pagination config
                    onRowClick={(row) => console.log('Row clicked:', row)}
                    emptyMessage="No separation cases found"
                    sx={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        '& .MuiTableCell-root': {
                            borderColor: '#f1f5f9'
                        },
                        '& .MuiTableHead-root .MuiTableCell-root': {
                            backgroundColor: '#f8fafc',
                            fontWeight: 600,
                            color: '#475569',
                            fontSize: '0.875rem'
                        }
                    }}
                />
            )}

            {/* Additional Info */}
            {!loading && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Total {filteredSeparations.length} separation cases • Use actions to manage separations
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AllCasesSeparation;