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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import SendIcon from '@mui/icons-material/Send';
import CommonListView from '../../../../utils/AssetCommonListViewTable';
import apiCalls from 'apicall';
import { useNavigate } from "react-router-dom";

const AllOffers = () => {
    const [status, setStatus] = useState('ALL');
    const [departmentList, setDepartmentList] = useState([]);
    const [search, setSearch] = useState('');
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [formData, setFormData] = useState({
        department: 'ALL', // code (short form)
        departmentName: 'All' // full name
    });

    // Pagination state - same as AssetMaster
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const navigate = useNavigate();

    const statusOptions = [
        { value: 'ALL', label: 'All Status' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'REJECTED', label: 'Rejected' }
    ];

    const paginationConfig = {
        currentPage,
        totalPages: Math.ceil(offers.length / itemsPerPage),
        itemsPerPage,
        onPageChange: (event, value) => setCurrentPage(value)
    };

    useEffect(() => {
        getAllDepartment();
    }, [orgId, branchCode]);

    useEffect(() => {
        getAllOffers();
    }, [status, formData.department, orgId, branchCode]);

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

    const getAllOffers = async () => {
        if (!orgId || !branchCode) return;

        setLoading(true);
        setError('');
        try {
            const response = await apiCalls(
                'get',
                `recruitmentmanagement/getCreateOfferByOrgIdAndDepartment?branchCode=${branchCode}&department=${formData.departmentName}&orgId=${orgId}&status=${status}`
            );

            if (response.status === true) {
                const offersData = response.paramObjectsMap.createOfferVO || [];
                setOffers(offersData);
                setCurrentPage(1); // Reset to first page when data loads
            } else {
                setError('Failed to load offers');
                setOffers([]);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            setError('Error loading offers data');
            setOffers([]);
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

    // Calculate total CTC from compensation details
    const calculateTotalCTC = (compensationDetails) => {
        if (!compensationDetails || !Array.isArray(compensationDetails)) return '₹0';

        const total = compensationDetails.reduce((sum, comp) => {
            return sum + (parseFloat(comp.amount) || 0);
        }, 0);

        return `₹${total.toLocaleString('en-IN')}`;
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
    };

    // Filter offers based on search term
    const filteredOffers = offers.filter(offer => {
        if (!search) return true;

        const searchTerm = search.toLowerCase();
        return (
            offer.candidateName?.toLowerCase().includes(searchTerm) ||
            offer.position?.toLowerCase().includes(searchTerm) ||
            offer.department?.toLowerCase().includes(searchTerm)
        );
    });

    // Define columns for the list view
    const columns = [
        {
            key: 'candidateName',
            label: 'Candidate Name',
            width: '200px',
            render: (value, row) => (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {value || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {row.position || 'No position'}
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
            key: 'approveStatus',
            label: 'Status',
            width: '100px',
            render: (value) => (
                <Chip
                    label={value || 'N/A'}
                    color={getStatusColor(value)}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        borderRadius: 1,
                    }}
                />
            )
        },
        {
            key: 'joiningDate',
            label: 'Joining Date',
            width: '120px',
            render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {formatDate(value)}
                </Typography>
            )
        },
        {
            key: 'workLocation',
            label: 'Location',
            width: '120px',
            render: (value) => (
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    {value || 'N/A'}
                </Typography>
            )
        },
        {
            key: 'compensationDetailsVO',
            label: 'Total CTC',
            width: '130px',
            render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                    {calculateTotalCTC(value)}
                </Typography>
            )
        },
        {
            key: 'templateType',
            label: 'Template',
            width: '100px',
            render: (value) => (
                <Chip
                    label={value || 'Standard'}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            key: 'commonDate',
            label: 'Last Updated',
            width: '120px',
            render: (value) => (
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {value?.modifiedon || 'N/A'}
                </Typography>
            )
        }
    ];

    // Define actions for the list view
    const actions = [
        {
            icon: <RemoveRedEyeIcon fontSize="small" />,
            tooltip: 'View Offer',
            color: 'primary',
            onClick: (row) => {
                navigate("/RecruitmentManagement/RecruitmentManagement", {
                    state: {
                        tab: 3,     // Preview tab index
                        offer: row  // Pass selected row
                    }
                });
            }
        }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setStatus('ALL');
        setSearch('');
        setFormData(prev => ({
            ...prev,
            department: 'ALL'
        }));
        setCurrentPage(1); // Reset to first page when clearing filters
    };

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
                    <TextField
                        select
                        fullWidth
                        label="Status"
                        size="small"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {statusOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

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
                                department: newValue ? newValue.value : 'ALL', // code
                                departmentName: newValue ? newValue.label : 'All' // full name
                            }));
                            setCurrentPage(1); // Reset to first page when changing department
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

                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search"
                        placeholder="Search by name, position or department"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        fullWidth
                        sx={{
                            backgroundColor: '#f8fafc',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            py: 1,
                            borderColor: '#e2e8f0',
                            '&:hover': {
                                backgroundColor: '#f1f5f9',
                                borderColor: '#cbd5e1'
                            }
                        }}
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </Button>
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
                    data={filteredOffers} // Full array - CommonListView handles pagination
                    columns={columns}
                    actions={actions}
                    pagination={paginationConfig} // Same pagination config as AssetMaster
                    onRowClick={(row) => console.log('Row clicked:', row)}
                    emptyMessage="No offers found"
                    sx={{
                        border: '1px solid #e2e8f0',
                        ml: 2,
                        mr: -2,
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
                        Total {filteredOffers.length} offers • Use actions to manage offers
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AllOffers;