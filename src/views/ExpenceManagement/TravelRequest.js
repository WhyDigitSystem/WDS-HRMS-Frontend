import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    FormControl,
    FormControlLabel,
    Typography,
    Button,
    TextField,
    Autocomplete,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';


const TravelRequest = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [requestData, setRequestData] = useState([]);
    const [accommodationList, setAccommodationList] = useState([]);
    const [transportModeList, setTransportModeList] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [branchCode] = useState(localStorage.getItem("branchCode"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [employeeCode] = useState(localStorage.getItem("employeeCode"));
    const [employeeName] = useState(localStorage.getItem("employeeName"));
    const [department] = useState(localStorage.getItem("department"));
    const [formData, setFormData] = useState({
        travelTitle: '',
        from: '',
        to: '',
        departureDate: dayjs(),
        returnDate: dayjs(),
        transportMode: '',
        accommodation: '',
        estimatedCost: '',
        businessPurpose: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    // Fetch all expence on component mount
    useEffect(() => {
        getAllRequest();
        getAllAccommodation();
        getAllTransportMode();
    }, []);

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequest = requestData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(requestData.length / itemsPerPage);
    const getAllTransportMode = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=TransportMode&orgId=${orgId}`);
            if (response.status === true) {
                setTransportModeList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getAllAccommodation = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=Accommodation&orgId=${orgId}`);
            if (response.status === true) {
                setAccommodationList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getAllRequest = async () => {
        setIsFetching(true);
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getTravelRequestsByOrgId?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap?.travelRequestsVO) {
                const formattedRequest = response.paramObjectsMap.travelRequestsVO.map(request => ({
                    id: request.id,
                    travelTitle: request.travelTitle || '',
                    from: request.from || '',
                    to: request.to || '',
                    departureDate: request.departureDate || dayjs(),
                    returnDate: request.returnDate || dayjs(),
                    transportMode: request.transportMode || '',
                    accommodation: request.accommodation || '',
                    estimatedCost: request.estimatedCost || '',
                    businessPurpose: request.businessPurpose || '',
                    approveStatus: request.approveStatus || '',
                    created_at: request.commonDate?.createdon || new Date().toISOString(),
                    branch: request.branch,
                    branchCode: request.branchCode,
                    orgId: request.orgId,
                    createdBy: request.createdBy
                }));
                setRequestData(formattedRequest);
                setCurrentPage(1); // Reset to first page when data changes
            } else {
                showSnackbar('Failed to fetch requests', 'error');
                setRequestData([]);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            showSnackbar('Error fetching requests', 'error');
            setRequestData([]);
        } finally {
            setIsFetching(false);
        }
    };

    const getRequestById = async (requestId) => {
        setIsLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getTravelRequestsById?id=${requestId}`
            );

            if (response.status === true && response.paramObjectsMap?.travelRequestsVO) {
                const request = response.paramObjectsMap.travelRequestsVO;
                const requestDetails = {
                    id: request.id,
                    travelTitle: request.travelTitle || '',
                    from: request.from || '',
                    to: request.to || '',
                    departureDate: request.departureDate || dayjs(),
                    returnDate: request.returnDate || dayjs(),
                    transportMode: request.transportMode || '',
                    accommodation: request.accommodation || '',
                    estimatedCost: request.estimatedCost || '',
                    businessPurpose: request.businessPurpose || '',
                    branch: request.branch,
                    branchCode: request.branchCode,
                    orgId: request.orgId
                };

                // Populate form data with the fetched request details
                setFormData({
                    travelTitle: request.travelTitle || '',
                    from: request.from || '',
                    to: request.to || '',
                    departureDate: request.departureDate || dayjs(),
                    returnDate: request.returnDate || dayjs(),
                    transportMode: request.transportMode || '',
                    accommodation: request.accommodation || '',
                    estimatedCost: request.estimatedCost || '',
                    businessPurpose: request.businessPurpose || '',
                });

                setSelectedRequest(requestDetails);
                setIsEditing(true);
                setIsAdding(true); // Switch to form view
                return requestDetails;
            } else {
                showSnackbar('Request not found', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            showSnackbar('Error fetching request details', 'error');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditRequest = (requestId) => {
        getRequestById(requestId);
    };
    const handleInputChange = (e) => {
        // Works for both manual calls and real DOM events
        const name = e?.target?.name;
        const value = e?.target?.value;

        if (!name) return; // safely skip if invalid

        setFormData((prevData) => ({
            ...prevData,
            [name]:
                typeof value === "object" && value !== null
                    ? value.currency // if object (Autocomplete), store currency code
                    : value, // else normal value
        }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate required fields
        const errors = {};
        // if (!formData.asset_code) errors.asset_code = 'Asset Code is required';
        // if (!formData.asset_name) errors.asset_name = 'Asset Name is required';
        // if (!formData.category) errors.category = 'Category is required';

        if (Object.keys(errors).length > 0) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }

        setIsLoading(true);

        const saveData = {
            accommodation: formData.accommodation,
            branch: branch,
            branchCode: branchCode,
            businessPurpose: formData.businessPurpose,
            createdBy: loginUserName,
            departureDate: formData.departureDate,
            employeeCode: employeeCode,
            employeeName: employeeName,
            department: department,
            estimatedCost: formData.estimatedCost,
            from: formData.from,
            orgId: orgId,
            returnDate: formData.returnDate,
            to: formData.to,
            transportMode: formData.transportMode,
            travelTitle: formData.travelTitle
        }

        // Add ID for update operation
        if (isEditing && selectedRequest) {
            saveData.id = selectedRequest.id;
        }

        console.log('DATA TO SAVE IS:', saveData);

        try {
            const response = await apiCalls('put', '/assetmanagement/CreateUpdateTravelRequests', saveData);

            if (response.status === true) {
                console.log('Response:', response);

                // Refresh the expence list
                await getAllRequest();

                showSnackbar(`Request ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
                handleCancel();
            } else {
                showSnackbar(response.paramObjectsMap?.errorMessage || `Request ${isEditing ? 'update' : 'creation'} failed`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showSnackbar(`Request ${isEditing ? 'update' : 'creation'} failed`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setIsEditing(false);
        setFormData({
            travelTitle: '',
            from: '',
            to: '',
            departureDate: dayjs(),
            returnDate: dayjs(),
            transportMode: '',
            accommodation: '',
            estimatedCost: '',
            businessPurpose: '',
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setIsEditing(false);
        setSelectedRequest(null);
        setFormData({
            travelTitle: '',
            from: '',
            to: '',
            departureDate: dayjs(),
            returnDate: dayjs(),
            transportMode: '',
            accommodation: '',
            estimatedCost: '',
            businessPurpose: '',
        });
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };
    // const getStatusColor = (status) => {
    //     switch (status?.toUpperCase()) {
    //         case 'APPROVED': return 'success';
    //         case 'PENDING': return 'warning';
    //         case 'REJECTED': return 'error';
    //         default: return 'info';
    //     }
    // };
    const getStatusColor = (status, theme) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return theme.palette.success.main;
            case 'PENDING': return theme.palette.warning.main;
            case 'REJECTED': return theme.palette.error.main;
            default: return theme.palette.info.main;
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
            case 'PENDING': return <HourglassEmptyIcon sx={{ fontSize: 16 }} />;
            case 'REJECTED': return <CancelIcon sx={{ fontSize: 16 }} />;
            default: return null;
        }
    };
    const handleDateChange = (field, date) => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD') || null;
        setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
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
                    mb: 0
                }}
            >
                {!isAdding && (
                    <Button
                        variant="contained"
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        onClick={handleAdd}
                        disabled={isLoading || isFetching}
                        sx={{
                            background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            px: 1.5,
                            py: 0.45,
                            minWidth: 120,
                            borderRadius: '10px',
                            letterSpacing: '0.3px',
                            fontSize: '12px',
                            textTransform: 'none',
                            boxShadow: '0 4px 10px rgba(58,107,109,0.25)',
                            transition: 'all 0.2s ease',

                            '& .MuiButton-startIcon': {
                                marginRight: '4px'
                            },

                            '&:hover': {
                                background:
                                    'linear-gradient(135deg, #446f71 0%, #33585a 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 14px rgba(58,107,109,0.35)'
                            },

                            '&:active': {
                                transform: 'scale(0.98)'
                            },

                            '&:disabled': {
                                background: '#b0bec5',
                                color: '#fff'
                            }
                        }}
                    >
                        {isLoading ? 'Adding...' : 'Add New'}
                    </Button>
                )}
            </Box>

            {/* Content Area */}
            <Box sx={{ p: 1 }}>
                {isFetching ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
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
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                {isEditing && selectedRequest && (
                                    <Chip
                                        label={`Editing: ${selectedRequest.travelTitle}`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            </Box>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Travel Title"
                                            name='travelTitle'
                                            value={formData.travelTitle}
                                            onChange={handleInputChange}
                                            required
                                            size="small"
                                            disabled={isLoading}
                                        // helperText={isEditing ? "Title Required" : ""}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="From"
                                            name="from"
                                            value={formData.from}
                                            onChange={handleInputChange}
                                            required
                                            size="small"
                                            disabled={isLoading}
                                        // helperText={isEditing ? "From Place Required" : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="To"
                                            name="to"
                                            value={formData.to}
                                            onChange={handleInputChange}
                                            required
                                            size="small"
                                            disabled={isLoading}
                                        // helperText={isEditing ? "To Place Required" : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth variant="filled" size="small">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Departure Date"
                                                    value={formData.departureDate ? dayjs(formData.departureDate, 'YYYY-MM-DD') : null}
                                                    onChange={(date) => handleDateChange('departureDate', date)}
                                                    slotProps={{
                                                        textField: { size: 'small', clearable: true }
                                                    }}
                                                    format="DD-MM-YYYY"
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth variant="filled" size="small">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Return Date"
                                                    value={formData.returnDate ? dayjs(formData.returnDate, 'YYYY-MM-DD') : null}
                                                    onChange={(date) => handleDateChange('returnDate', date)}
                                                    slotProps={{
                                                        textField: { size: 'small', clearable: true }
                                                    }}
                                                    format="DD-MM-YYYY"
                                                />
                                            </LocalizationProvider>
                                        </FormControl></Grid>
                                    {/* <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Departure Date"
                                            type="date"
                                            name="date"
                                            value={formatDateForInput(formData.departureDate)}
                                            onChange={handleInputChange}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            disabled={isLoading}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Return Date"
                                            name="returnDate"
                                            type="date"
                                            value={formatDateForInput(formData.returnDate)}
                                            onChange={handleInputChange}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            disabled={isLoading}
                                        />
                                    </Grid> */}
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            options={transportModeList}
                                            getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                            value={transportModeList.find((item) => item.listOfValues === formData.transportMode) || null}
                                            onChange={(event, newValue) =>
                                                handleInputChange({
                                                    target: { name: 'transportMode', value: newValue?.listOfValues || '' }
                                                })
                                            }
                                            // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                            isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={<span>Transport Mode</span>}
                                                    size="small"
                                                    name='transportMode'
                                                    // error={!!fieldErrors.categories}
                                                    // helperText={fieldErrors.categories}
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            options={accommodationList}
                                            getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                            value={accommodationList.find((item) => item.listOfValues === formData.accommodation) || null}
                                            onChange={(event, newValue) =>
                                                handleInputChange({
                                                    target: { name: 'accommodation', value: newValue?.listOfValues || '' }
                                                })
                                            }
                                            // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                            isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={<span>Accommodation</span>}
                                                    size="small"
                                                    name='accommodation'
                                                    // error={!!fieldErrors.categories}
                                                    // helperText={fieldErrors.categories}
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Est. Amt"
                                            name='estimatedCost'
                                            type='number'
                                            value={formData.estimatedCost}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 10,000"
                                            size="small"
                                            disabled={isLoading}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Business Purpose"
                                            name='businessPurpose'
                                            multiline
                                            // rows={3}
                                            value={formData.businessPurpose}
                                            onChange={handleInputChange}
                                            placeholder="Purpose about the Travel..."
                                            size="small"
                                            disabled={isLoading}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 1,
                                                justifyContent: 'flex-end',
                                                mt: 1.5
                                            }}
                                        >
                                            <Button
                                                onClick={handleCancel}
                                                variant="outlined"

                                                disabled={isLoading}
                                                sx={{
                                                    borderRadius: '10px',
                                                    px: 1.5,
                                                    py: 0.45,
                                                    minWidth: 95,
                                                    textTransform: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    borderColor: '#90a4ae',
                                                    color: '#455a64',
                                                    transition: 'all 0.2s ease',

                                                    '&:hover': {
                                                        borderColor: '#3a6b6d',
                                                        backgroundColor: 'rgba(58,107,109,0.06)',
                                                        color: '#2a4b4d'
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </Button>

                                            <Button
                                                type="submit"
                                                variant="contained"

                                                disabled={isLoading}
                                                sx={{
                                                    background:
                                                        'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    px: 1.8,
                                                    py: 0.45,
                                                    minWidth: 100,
                                                    borderRadius: '10px',
                                                    letterSpacing: '0.3px',
                                                    fontSize: '12px',
                                                    textTransform: 'none',
                                                    boxShadow: '0 4px 10px rgba(58,107,109,0.25)',
                                                    transition: 'all 0.2s ease',

                                                    '& .MuiButton-startIcon': {
                                                        marginRight: '4px'
                                                    },

                                                    '&:hover': {
                                                        background:
                                                            'linear-gradient(135deg, #446f71 0%, #33585a 100%)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 6px 14px rgba(58,107,109,0.35)'
                                                    },

                                                    '&:active': {
                                                        transform: 'scale(0.98)'
                                                    },

                                                    '&:disabled': {
                                                        background: '#b0bec5',
                                                        color: '#fff'
                                                    }
                                                }}
                                            >
                                                {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
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
                            sx={{
                                borderRadius: '14px',
                                boxShadow: '0 6px 18px rgba(58,107,109,0.12)',
                                maxHeight: 400,
                                overflowY: 'auto',
                                border: '1px solid rgba(58,107,109,0.08)',

                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                    height: '6px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#3a6b6d',
                                    borderRadius: '10px'
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f5f5f5'
                                }
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow
                                        sx={{
                                            background:
                                                'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                            '& .MuiTableCell-root': {
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: '12px',
                                                py: 1.2,
                                                borderBottom: 'none',
                                                whiteSpace: 'nowrap'
                                            }
                                        }}
                                    >
                                        <TableCell align="center">Actions</TableCell>
                                        <TableCell align="center">Travel Details</TableCell>
                                        <TableCell align="center">Dates</TableCell>
                                        <TableCell align="center">Route</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {currentRequest.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Inventory2
                                                        sx={{
                                                            fontSize: 44,
                                                            color: '#90a4ae',
                                                            mb: 1
                                                        }}
                                                    />

                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#546e7a'
                                                        }}
                                                    >
                                                        Travel requests data not found
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentRequest.map((request, index) => (
                                            <TableRow
                                                key={request.id}
                                                sx={{
                                                    backgroundColor:
                                                        index % 2 === 0 ? '#ffffff' : '#f8fbfb',

                                                    transition: 'all 0.2s ease',

                                                    '&:hover': {
                                                        backgroundColor: '#eef5f5',
                                                        transform: 'scale(1.001)'
                                                    },

                                                    '& .MuiTableCell-root': {
                                                        borderBottom:
                                                            '1px solid rgba(58,107,109,0.08)',
                                                        py: 0.8,
                                                        fontSize: '12px'
                                                    }
                                                }}
                                            >
                                                <TableCell align="center">
                                                    <Tooltip title="Edit Request">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() =>
                                                                    handleEditRequest(request.id)
                                                                }
                                                                disabled={
                                                                    request.approveStatus ===
                                                                    'APPROVED' ||
                                                                    request.approveStatus ===
                                                                    'REJECTED'
                                                                }
                                                                sx={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    backgroundColor:
                                                                        'rgba(58,107,109,0.10)',

                                                                    '&:hover': {
                                                                        backgroundColor:
                                                                            'rgba(58,107,109,0.18)'
                                                                    }
                                                                }}
                                                            >
                                                                <Edit
                                                                    sx={{
                                                                        fontSize: 15,
                                                                        color: '#3a6b6d'
                                                                    }}
                                                                />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#263238',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {request.travelTitle}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#455a64',
                                                            fontSize: '11.5px',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {request.departureDate
                                                            ? dayjs(request.departureDate).format(
                                                                'DD-MM-YYYY'
                                                            )
                                                            : ''}{' '}
                                                        to{' '}
                                                        {request.returnDate
                                                            ? dayjs(request.returnDate).format(
                                                                'DD-MM-YYYY'
                                                            )
                                                            : ''}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#455a64',
                                                            fontWeight: 500,
                                                            fontSize: '11.5px'
                                                        }}
                                                    >
                                                        {request.from} - {request.to}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            backgroundColor: (theme) =>
                                                                getStatusColor(
                                                                    request.approveStatus,
                                                                    theme
                                                                ),
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            mx: 'auto',
                                                            boxShadow:
                                                                '0 2px 8px rgba(0,0,0,0.15)',

                                                            '& svg': {
                                                                color: '#fff',
                                                                fontSize: 14
                                                            }
                                                        }}
                                                    >
                                                        {getStatusIcon(request.approveStatus)}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {requestData.length > itemsPerPage && (
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
                        {requestData.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, requestData.length)} of {requestData.length} Travel Requests
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            {/* View Request Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Inventory2 color="primary" />
                        Request Details
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedRequest && (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Travel Title</Typography>
                                <Typography variant="body1" gutterBottom>{selectedRequest.travelTitle}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">From</Typography>
                                <Typography variant="body1" gutterBottom>{selectedRequest.from}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">To</Typography>
                                <Typography variant="body1" gutterBottom>{selectedRequest.to}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Departure Date</Typography>
                                <Typography variant="body1" gutterBottom>{formatDate(selectedRequest.departureDate)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Return Date</Typography>
                                <Typography variant="body1" gutterBottom>{formatDate(selectedRequest.returnDate)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Transport Mode</Typography>
                                <Typography variant="body1" gutterBottom>{selectedRequest.transportMode}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Accommodation</Typography>
                                <Typography variant="body1" gutterBottom>{selectedRequest.accommodation}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Est. Amt</Typography>
                                <Typography variant="body1" gutterBottom>{selectedRequest.estimatedCost}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Business Purpose</Typography>
                                <Typography variant="body1">{selectedRequest.businessPurpose}</Typography>
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

export default TravelRequest;