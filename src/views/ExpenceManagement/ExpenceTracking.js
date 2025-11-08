import React, { useState, useEffect } from 'react';
import dayjs from "dayjs";
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import {
    Box,
    Autocomplete,
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
    Edit,
    Inventory2,
    Save,
    Cancel,
} from '@mui/icons-material';
import apiCalls from 'apicall';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getAllActiveCurrency } from 'utils/CommonFunctions';

const ExpenceTracking = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [expenseData, setExpenseData] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState([]);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [branchCode] = useState(localStorage.getItem("branchCode"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [employeeCode] = useState(localStorage.getItem("employeeCode"));
    const [employeeName] = useState(localStorage.getItem("employeeName"));
    const [department] = useState(localStorage.getItem("department"));
    const [formData, setFormData] = useState({
        expenseTitle: '',
        category: '',
        amount: '',
        currency: 'INR - INDIA',
        expenseDate: dayjs(),
        description: '',
        approveStatus: '',
        receiptAttached: true
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Fetch all expence on component mount
    useEffect(() => {
        getAllExpence();
        getAllCategory();
        getAllCurrency();
    }, []);
    const getAllCategory = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=Category&orgId=${orgId}`);
            if (response.status === true) {
                setCategoryList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getAllCurrency = async () => {
        try {
            const currencyData = await getAllActiveCurrency(orgId);

            // ✅ Remove duplicates (by currency + country)
            const uniqueCurrencyList = Array.from(
                new Map(
                    (currencyData || []).map((item) => [
                        `${item.currency}-${item.country}`, // unique key
                        item
                    ])
                ).values()
            );

            // ✅ Set the cleaned list to state
            setCurrencyList(uniqueCurrencyList);
        } catch (error) {
            console.error('Error fetching currency data:', error);
        }
    };
    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExpense = expenseData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(expenseData.length / itemsPerPage);

    const getAllExpence = async () => {
        setIsFetching(true);
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getExpenseClaimsByOrgId?branchCode=${branchCode}&orgId=${orgId}&employeeCode=${employeeCode}`
            );

            if (response.status === true && response.paramObjectsMap?.expenseClaimsVO) {
                const formatedExpense = response.paramObjectsMap.expenseClaimsVO.map(expense => ({
                    id: expense.id,
                    receiptAttached: expense.receiptAttached,
                    approveStatus: expense.approveStatus,
                    expenseTitle: expense.expenseTitle,
                    category: expense.category,
                    amount: expense.amount,
                    currency: expense.currency,
                    expenseDate: expense.expenseDate,
                    description: expense.description,
                    created_at: expense.commonDate?.createdon || new Date().toISOString(),
                    branch: expense.branch,
                    branchCode: expense.branchCode,
                    orgId: expense.orgId,
                    createdBy: expense.createdBy
                }));
                setExpenseData(formatedExpense);
                setCurrentPage(1); // Reset to first page when data changes
            } else {
                showSnackbar('Failed to fetch expence', 'error');
                setExpenseData([]);
            }
        } catch (error) {
            console.error('Error fetching expence:', error);
            showSnackbar('Error fetching expence', 'error');
            setExpenseData([]);
        } finally {
            setIsFetching(false);
        }
    };
    const getExpenseById = async (expenseId) => {
        setIsLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getExpenseClaimsById?id=${expenseId}`
            );

            if (response.status === true && response.paramObjectsMap?.expenseClaimsVO) {
                const expense = response.paramObjectsMap.expenseClaimsVO;
                setLogo(expense.expenseAttachment)
                const expenseDetails = {
                    id: expense.id,
                    receiptAttached: expense.receiptAttached,
                    expenseTitle: expense.expenseTitle,
                    category: expense.category,
                    amount: expense.amount,
                    currency: expense.currency,
                    expenseDate: expense.expenseDate,
                    description: expense.description,
                    branch: expense.branch,
                    branchCode: expense.branchCode,
                    orgId: expense.orgId
                };

                setFormData({
                    expenseTitle: expense.expenseTitle || '',
                    category: expense.category || '',
                    amount: expense.amount || '',
                    currency: expense.currency || '',
                    expenseDate: expense.expenseDate || '',
                    description: expense.description || '',
                    receiptAttached: expense.receiptAttached || false
                });

                setSelectedExpense(expenseDetails);
                setIsEditing(true);
                setIsAdding(true); // Switch to form view
                return expenseDetails;
            } else {
                showSnackbar('Expense not found', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching expence:', error);
            showSnackbar('Error fetching expense details', 'error');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditExpense = (expenseId) => {
        getExpenseById(expenseId);
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
            expenseTitle: formData.expenseTitle,
            category: formData.category,
            amount: formData.amount,
            currency: formData.currency,
            expenseDate: formData.expenseDate,
            description: formData.description,
            receiptAttached: formData.receiptAttached,
            branch,
            branchCode,
            orgId,
            employeeCode: employeeCode,
            employeeName: employeeName,
            department: department,
            createdBy: loginUserName
        };

        // Add ID for update operation
        if (isEditing && selectedExpense) {
            saveData.id = selectedExpense.id;
        }

        console.log('DATA TO SAVE IS:', saveData);

        try {
            const response = await apiCalls('put', '/assetmanagement/CreateUpdateExpenseClaims', saveData);

            if (response.status === true) {
                console.log('Response:', response);
                const generatedId = response.paramObjectsMap.expenseClaimsVO.id;
                if (generatedId && typeof logo === 'object') {
                    console.log('Generated ID:', generatedId);
                    console.log('Uploaded Item', logo);
                    handleFileUpload(generatedId);
                } else {
                    console.log('handle Img Upload failed');
                }
                // Refresh the expence list
                await getAllExpence();

                showSnackbar(`Expense ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
                handleCancel();
            } else {
                showSnackbar(response.paramObjectsMap?.errorMessage || `Expense ${isEditing ? 'update' : 'creation'} failed`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showSnackbar(`Expense ${isEditing ? 'update' : 'creation'} failed`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setIsEditing(false);
        setFormData({
            expenseTitle: '',
            category: '',
            amount: '',
            currency: 'INR - INDIA',
            expenseDate: dayjs(),
            description: '',
            receiptAttached: false
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setIsEditing(false);
        setSelectedExpense([]);
        setFormData({
            expenseTitle: '',
            category: '',
            amount: '',
            currency: 'INR - INDIA',
            expenseDate: dayjs(),
            description: '',
            receiptAttached: false
        });
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'error';
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
    const [open, setOpen] = useState(false);
    const [logo, setLogo] = useState(null);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setLogo(file);
        } else {
            showSnackbar('error', 'Please upload a valid image (PNG or JPEG).');
        }
    };
    const handleFileUpload = async (generatedId) => {
        if (!generatedId) {
            console.warn('Generated ID is missing');
            showSnackbar('error', 'Generated ID is required');
            return;
        }
        console.log("Logo", logo);

        const formData = new FormData();
        formData.append('files', logo);
        try {
            const response = await apiCalls(
                'post',
                `/assetmanagement/uploadExpenseClaimsImageInBloob?id=${generatedId}`,
                formData,
                {},
                { 'Content-Type': 'multipart/form-data' }
            );
            console.log('Img Upload Response:', response);

            if (response.status === true) {
                showSnackbar('success', response.message || 'Image Uploaded successfully!');
            } else {
                console.warn('Img upload failed:', response);
                showSnackbar('error', 'Img upload failed');
            }
        } catch (error) {
            console.error('Img Upload Error:', error);
            showSnackbar('error', 'Failed to upload Img');
        }
    };
    useEffect(() => {
        return () => {
            if (logo && typeof logo === 'object') {
                URL.revokeObjectURL(logo);
            }
        };
    }, [logo]);
    const handleRemoveLogo = () => setLogo(null);
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
                        {isLoading ? 'Adding...' : 'Add New Expense'}
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
                                {isEditing && selectedExpense && (
                                    <Chip
                                        label={`Editing: ${selectedExpense.expenseTitle}`}
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
                                            label="Title"
                                            name="expenseTitle"
                                            value={formData.expenseTitle}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Travel, Food"
                                            size="small"
                                            disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                        // helperText={isEditing ? "Title Required" : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            options={categoryList}
                                            getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                            value={categoryList.find((item) => item.listOfValues === formData.category) || null}
                                            onChange={(event, newValue) =>
                                                handleInputChange({
                                                    target: { name: 'category', value: newValue?.listOfValues || '' }
                                                })
                                            }
                                            disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                            isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={<span>Category</span>}
                                                    size="small"
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
                                            label="Amount"
                                            type='number'
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 10,000"
                                            size="small"
                                            disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            options={currencyList || []}
                                            size="small"
                                            fullWidth
                                            autoHighlight
                                            getOptionLabel={(option) =>
                                                option?.currency && option?.country
                                                    ? `${option.currency} - ${option.country}`
                                                    : option?.currency || ''
                                            }
                                            disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                            value={
                                                currencyList.find((item) => item.currency === formData.currency) || null
                                            }
                                            onChange={(event, newValue) =>
                                                handleInputChange({
                                                    target: {
                                                        name: 'currency',
                                                        value: newValue, // pass the full object
                                                    },
                                                })
                                            }
                                            isOptionEqualToValue={(option, value) =>
                                                option?.currency === value?.currency
                                            }
                                            filterOptions={(options, { inputValue }) =>
                                                options.filter((option) => {
                                                    const currency = option?.currency?.toLowerCase() || '';
                                                    const country = option?.country?.toLowerCase() || '';
                                                    const search = inputValue.toLowerCase();
                                                    return currency.includes(search) || country.includes(search);
                                                })
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params} label="Currency" variant="outlined" fullWidth />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Expense Date"
                                            type="date"
                                            name="expenseDate"
                                            value={formatDateForInput(formData.expenseDate)}
                                            onChange={handleInputChange}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                        />
                                    </Grid>
                                    {/* <Grid item xs={12} sm={3}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                                    checked={formData.receiptAttached}
                                                    onChange={(e) => setFormData((prev) => ({
                                                        ...prev,
                                                        receiptAttached: e.target.checked
                                                    }))}
                                                />
                                            }
                                            label="Receipt Attached"
                                        />
                                    </Grid> */}
                                    {/* {formData.receiptAttached && }*/}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            multiline
                                            // rows={3}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            name="description"
                                            placeholder="Additional Description about the Expense..."
                                            size="small"
                                            disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
                                                borderRadius: '50px',
                                                padding: '2px',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                width: 'fit-content',
                                                mx: 'auto',
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                component="label"
                                                startIcon={<CloudUploadIcon sx={{ color: '#2563eb' }} />}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    color: '#2563eb',
                                                    borderRadius: '20px',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '0.7rem',
                                                    px: 2.5,
                                                    py: 0.8,
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        backgroundColor: '#f3f4f6',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                    },
                                                }}
                                            >
                                                {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Attachment') : 'Attachment'}
                                                <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
                                            </Button>
                                            {logo && (
                                                <IconButton
                                                    variant="contained"
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        color: '#374151'
                                                    }}
                                                    onClick={handleOpen}
                                                >
                                                    <ControlCameraIcon />
                                                </IconButton>
                                            )}
                                        </Box>

                                        {/* Dialog for preview */}
                                        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                                            <DialogContent
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    flexDirection: 'column',
                                                    gap: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 700,
                                                        background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                    }}
                                                >
                                                    Attachment
                                                </Typography>

                                                {logo ? (
                                                    <Box textAlign="center">
                                                        <Avatar
                                                            src={
                                                                typeof logo === 'object'
                                                                    ? URL.createObjectURL(logo)
                                                                    : `data:image/jpeg;base64,${logo}`
                                                            }
                                                            alt="Attachment"
                                                            sx={{
                                                                width: 150,
                                                                height: 150,
                                                                borderRadius: 2,
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                            }}
                                                        />
                                                        <Box display="flex" justifyContent="center" gap={2} mt={2}>
                                                            <Button
                                                                variant="contained"
                                                                onClick={handleRemoveLogo}
                                                                sx={{
                                                                    backgroundColor: '#ef4444',
                                                                    color: 'white',
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                    borderRadius: '8px',
                                                                    '&:hover': { backgroundColor: '#dc2626' },
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={handleClose}
                                                                sx={{
                                                                    color: '#2563eb',
                                                                    borderColor: '#2563eb',
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                    borderRadius: '8px',
                                                                    '&:hover': { backgroundColor: 'rgba(37,99,235,0.1)' },
                                                                }}
                                                            >
                                                                Close
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Box textAlign="center">
                                                        <Avatar
                                                            sx={{
                                                                width: 150,
                                                                height: 150,
                                                                bgcolor: '#F0F0F0',
                                                                borderRadius: 2,
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary">
                                                                Attachment
                                                            </Typography>
                                                        </Avatar>
                                                        <Box display="flex" justifyContent="center" gap={2} mt={2}>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={handleClose}
                                                                sx={{
                                                                    color: '#2563eb',
                                                                    borderColor: '#2563eb',
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                    borderRadius: '8px',
                                                                }}
                                                            >
                                                                Close
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </DialogContent>
                                        </Dialog>
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
                                                {isLoading ? 'Saving...' : (isEditing ? 'Update Expense' : 'Add Expense')}
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
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Claim Details</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Date</TableCell>
                                        {/* <TableCell sx={{ fontWeight: '600', py: 1 }}>Employee</TableCell> */}
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: '600', py: 1 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentExpense.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Inventory2 sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                                        No Expense Data Found
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Get started by adding your first Expense to the system
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentExpense.map((expense) => (
                                            <TableRow
                                                key={expense.id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'grey.50',
                                                        transition: 'background-color 0.2s ease'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ textAlign: 'center', py: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                        <Tooltip title="Edit Expense">
                                                            <IconButton
                                                                size="small"
                                                                color="info"
                                                                onClick={() => handleEditExpense(expense.id)}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="500">
                                                            {expense.expenseTitle}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {expense.expenseDate ? dayjs(expense.expenseDate).format("DD-MM-YYYY") : ""}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {expense.amount}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {expense.category}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Chip
                                                        label={expense.approveStatus}
                                                        color={getStatusColor(expense.approveStatus)}
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
                        {expenseData.length > itemsPerPage && (
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
                        {expenseData.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, expenseData.length)} of {expenseData.length} Expense
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            {/* View Expense Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Inventory2 color="primary" />
                        Expense Details
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedExpense && (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Title</Typography>
                                <Typography variant="body1" gutterBottom>{selectedExpense.expenseTitle}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                                <Typography variant="body1" gutterBottom>{selectedExpense.category}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                                <Typography variant="body1" gutterBottom>{selectedExpense.amount}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Currency</Typography>
                                <Typography variant="body1" gutterBottom>{selectedExpense.currency}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Expense Date</Typography>
                                <Typography variant="body1" gutterBottom>{formatDate(selectedExpense.expenseDate)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">Receipt Attached</Typography>
                                <Typography variant="body1" gutterBottom>{selectedExpense.receiptAttached}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                                <Typography variant="body1">{selectedExpense.desciption}</Typography>
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

export default ExpenceTracking;