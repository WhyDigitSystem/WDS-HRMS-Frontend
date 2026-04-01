// src/components/AdvancedOfferLetterSystem/tabs/AllOffers.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    Slide
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import SendIcon from '@mui/icons-material/Send';
import CommonListView from '../../../utils/AssetCommonListViewTable';
import apiCalls from 'apicall';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

const AllCasesSeparation = () => {
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [status, setStatus] = useState('ALL');
    const [departmentList, setDepartmentList] = useState([]);
    const [search, setSearch] = useState('');
    const [separations, setSeparations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [seperationDetails, setSeperationDetails] = useState([]);
    const [formData, setFormData] = useState({
        department: 'ALL',
        departmentName: 'All',
        separationType: 'ALL'
    });

    const loginUserDesignation = localStorage.getItem("designation");
    const loginEmployeeCode = localStorage.getItem("employeeCode");

    const isSeparationRole = seperationDetails
        .map(d => d.toUpperCase())
        .includes(loginUserDesignation?.trim().toUpperCase());

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
    const filteredSeparations = useMemo(() => {
        return separations.filter(separation => {
            if (!search) return true;

            const searchTerm = search.toLowerCase();
            return (
                separation.employeeName?.toLowerCase().includes(searchTerm) ||
                separation.employeeCode?.toLowerCase().includes(searchTerm) ||
                separation.position?.toLowerCase().includes(searchTerm) ||
                separation.department?.toLowerCase().includes(searchTerm)
            );
        });
    }, [separations, search]);

    // Pagination configuration - EXACTLY like Candidates component
    const paginationConfig = useMemo(() => ({
        currentPage,
        totalPages: Math.ceil(filteredSeparations.length / itemsPerPage), // Use filteredSeparations length
        itemsPerPage,
        onPageChange: (event, value) => setCurrentPage(value)
    }), [currentPage, filteredSeparations.length, itemsPerPage]);

    // REMOVE manual pagination calculation - CommonListView handles this internally
    // const indexOfLastItem = currentPage * itemsPerPage;
    // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // const currentItems = filteredSeparations.slice(indexOfFirstItem, indexOfLastItem);

    const dateRef = useRef();

    useEffect(() => {
        if (dateRef.current === formatDate) {
            console.log("✅ date function");
        } else {
            console.log("❌ date function");
        }
        dateRef.current = formatDate;
    });

    useEffect(() => {
        getAllDepartment();
    }, [orgId, branchCode]);

    useEffect(() => {
        getCompanyDetails();
    }, [orgId]);

    useEffect(() => {
        // console.log("🔄 Refresh triggered from parent");
        getAllSeparations();
    }, []);

    useEffect(() => {
        if (seperationDetails.length > 0) {
            if (!isSeparationRole) {
                setFormData({
                    department: 'ALL',
                    departmentName: 'All',
                    separationType: 'ALL'
                });
                setStatus('ALL');
            }

            getAllSeparations();
        }
    }, [status, formData.department, formData.separationType, orgId, branchCode, seperationDetails]);

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

    const getCompanyDetails = async () => {
        try {
            const response = await apiCalls('get', `commonmaster/company/${orgId}`);

            if (response.status === true) {
                const company = response.paramObjectsMap.companyVO[0];

                const separationList = company.separation
                    ? company.separation.split(',').map(d => d.trim())
                    : [];

                setSeperationDetails(separationList);
            }
        } catch (error) {
            console.error('Error fetching company:', error);
        }
    };

    const getAllSeparations = async () => {
        if (!orgId || !branchCode) return;

        setLoading(true);
        setError('');

        try {

            const empCodePayload = seperationDetails
                .map(d => d.toUpperCase())
                .includes(loginUserDesignation?.trim().toUpperCase())
                ? 'ALL'
                : loginEmployeeCode;

            const apiUrl = `employeseparation/getInitiateSeparationByDepartment?branchCode=${branchCode}&empCode=${empCodePayload}&department=${formData.department === 'ALL' ? 'ALL' : formData.departmentName}&orgId=${orgId}&type=${formData.separationType === 'ALL' ? status : formData.separationType}`;

            const response = await apiCalls('get', apiUrl);

            if (response.status === true) {
                const separationsData = response.paramObjectsMap.initiateSeparationVO.reverse() || [];
                setSeparations(separationsData);
                setCurrentPage(1);
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
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';

        try {
            // Handle string dates like DD/MM/YYYY or DD-MM-YYYY
            if (typeof dateString === 'string' && (dateString.includes('/') || dateString.includes('-'))) {
                const separator = dateString.includes('/') ? '/' : '-';
                const parts = dateString.split(separator);

                // Case 1: Input like DD-MM-YYYY
                if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                    return `${parts[0]}-${parts[1]}-${parts[2]}`;
                }

                // Case 2: Input like YYYY-MM-DD (ISO or database format)
                if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            // Handle full ISO datetime strings (e.g., 2025-11-11T00:00:00Z)
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            }

            return 'N/A';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    }, []);

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

    const columns = useMemo(() => [
        {
            key: 'employeeName',
            label: 'Name',
            width: '100px',
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
        // {
        //     key: 'department',
        //     label: 'Department',
        //     width: '100px',
        //     render: (value) => (
        //         <Chip
        //             label={value || 'N/A'}
        //             size="small"
        //             variant="outlined"
        //             sx={{
        //                 fontWeight: 500,
        //                 backgroundColor: '#f8fafc',
        //                 borderColor: '#e2e8f0'
        //             }}
        //         />
        //     )
        // },
        {
            key: 'position',
            label: 'Position',
            width: '100px',
            render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {value || 'N/A'}
                </Typography>
            )
        },
        {
            key: 'separationType',
            label: 'Sep Type',
            width: '100px',
            render: (value, row) => (
                <Chip
                    label={value || 'N/A'}
                    color={getStatusColor(value, row.cancel)}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        borderRadius: 1
                    }}
                />
            )
        },
        // {
        //     key: 'resignation',
        //     label: 'Resign Dt',
        //     width: '100px',
        //     render: (value) => (
        //         <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
        //             {formatDate(value)} {/* ✅ DD-MM-YYYY format */}
        //         </Typography>
        //     )
        // },
        {
            key: 'lastWorkingDate',
            label: 'Last Wk Dt',
            width: '100px',
            render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#dc2626' }}>
                    {formatDate(value)} {/* ✅ DD-MM-YYYY format */}
                </Typography>
            )
        },
        {
            key: 'rehireEligible',
            label: 'Rehire',
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
        {
            key: 'status',
            label: 'Status',
            width: '100px',
            render: (value) => {
                let bg = '#f1f5f9';
                let textColor = '#334155';

                switch (value?.toLowerCase()) {
                    case 'approved':
                        bg = '#dcfce7';
                        textColor = '#166534';
                        break;
                    case 'pending':
                        bg = '#fef9c3';
                        textColor = '#854d0e';
                        break;
                    case 'rejected':
                        bg = '#fee2e2';
                        textColor = '#991b1b';
                        break;
                    case 'cancelled':
                        bg = '#e2e8f0';
                        textColor = '#475569';
                        break;
                    default:
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
    ], []);


    // Define actions for the list view
    const actions = [
        {
            icon: <RemoveRedEyeIcon fontSize="small" />,
            tooltip: 'View Separation Details',
            color: 'primary',
            // onClick: (row) => console.log('View separation:', row.id)
            onClick: (row) => handleOpen(row)
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

    const handleOpen = (row) => {
        setSelectedEmployee(row);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Box sx={{ p: 0 }}>
                {/* ---------- Filters Section ---------- */}
                {isSeparationRole && (
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 0, p: 1 }}
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
                )}

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
            {/*  */}
            <Box>


                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            transition: 'transform 0.3s ease-in-out',
                            "&:hover": {
                                transform: 'scale(1.02)',
                                boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
                            }
                        }
                    }}
                >
                    <DialogTitle
                        sx={{
                            background: "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 1.2,
                            px: 2,
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px 8px 0 0',
                            textShadow: '0 0 8px rgba(255,255,255,0.6)' // glow effect
                        }}
                    >
                        👤 Employee Detail
                    </DialogTitle>

                    <DialogContent sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {selectedEmployee && (
                            <Box display="flex" flexDirection="column" gap={0}>
                                {[
                                    { icon: '🧑', label: 'Name', value: selectedEmployee.employeeName },
                                    { icon: '🆔', label: 'Code', value: selectedEmployee.employeeCode },
                                    { icon: '🏢', label: 'Department', value: selectedEmployee.department },
                                    { icon: '💼', label: 'Position', value: selectedEmployee.position },
                                    { icon: '📄', label: 'Type', value: selectedEmployee.separationType },
                                    { icon: '🗓️', label: 'Resignation Date', value: formatDate(selectedEmployee.resignation) },
                                    { icon: '📅', label: 'Last Working Date', value: formatDate(selectedEmployee.lastWorkingDate), color: '#dc2626' },
                                    { icon: '✅', label: 'Rehire', value: selectedEmployee.rehireEligible || 'No' },
                                    { icon: '📌', label: 'Status', value: selectedEmployee.status }
                                ].map((item, idx) => (
                                    <Box
                                        key={idx}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        sx={{
                                            p: 1,
                                            borderRadius: 1.5,
                                            transition: 'all 0.2s ease-in-out',
                                            //   "&:hover": {
                                            //     background: 'rgba(127,0,255,0.05)',
                                            //     transform: 'scale(1.02)',
                                            //     boxShadow: '0 4px 12px rgba(127,0,255,0.2)'
                                            //   }
                                        }}
                                    >
                                        {/* <Typography sx={{ fontSize: 20 }}>{item.icon}</Typography> */}
                                        <Box
                                            sx={{
                                                width: 25,
                                                height: 25,
                                                borderRadius: '50%',
                                                backgroundColor: '#f0f0f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 15,
                                                color: '#7f00ff',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {item.icon}
                                        </Box>

                                        <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#64748b', minWidth: 130 }}>
                                            {item.label}:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: item.color || '#1e293b',
                                                textShadow: '0 0 2px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            {item.value || 'N/A'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>


            </Box>
        </>
    );
};

export default AllCasesSeparation;