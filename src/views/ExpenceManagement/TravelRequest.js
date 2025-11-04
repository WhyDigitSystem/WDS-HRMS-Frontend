import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Checkbox,
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
    const [itemsPerPage] = useState(5);
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
            employeename: employeeName,
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
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
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
                            backgroundColor: '#2563eb',
                            background: `linear-gradient(135deg, ${'#2563eb'} 0%, ${'#059669'} 100%)`,
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
                        {isLoading ? 'Adding...' : 'Add New Request'}
                    </Button>
                )}
            </Box>

            {/* Content Area */}
            <Box sx={{ p: 3 }}>
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
                                    </Grid>
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
                                                    background: `linear-gradient(135deg, ${'#2563eb'} 0%, ${'#059669'} 100%)`,
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
                                                {isLoading ? 'Saving...' : (isEditing ? 'Update Request' : 'Add Request')}
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
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Travel Details</TableCell>
                                        {/* <TableCell sx={{ fontWeight: '600', py: 1 }}>Employee</TableCell> */}
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Dates</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Route</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentRequest.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Inventory2 sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                                        No Travel Requests Found
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Get started by adding your first Travel Request to the system
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentRequest.map((request) => (
                                            <TableRow
                                                key={request.id}
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
                                                                onClick={() => handleEditRequest(request.id)}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="500">
                                                            {request.travelTitle}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {request.departureDate ? dayjs(request.departureDate).format("DD-MM-YYYY") : ""} to {request.returnDate ? dayjs(request.returnDate).format("DD-MM-YYYY") : ""}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {request.from} - {request.to}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Chip
                                                        label={request.approveStatus}
                                                        color={getStatusColor(request.approveStatus)}
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