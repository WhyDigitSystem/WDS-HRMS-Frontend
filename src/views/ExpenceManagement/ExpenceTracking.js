import React, { useState, useEffect } from 'react';
import dayjs from "dayjs";
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
    Box,
    Autocomplete,
    Paper,
    FormControl,
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

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
    const [itemsPerPage] = useState(10);

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

            // Remove duplicates (based on currency-country pair)
            const uniqueCurrencyList = Array.from(
                new Map(
                    (currencyData || []).map((item) => [
                        `${item.currency}-${item.country}`,
                        item
                    ])
                ).values()
            );

            setCurrencyList(uniqueCurrencyList);

            // ✅ Find INR as default
            const defaultCurrencyObj = uniqueCurrencyList.find(
                (item) => item.currency === "INR"
            );

            // ✅ Set it properly into formData
            setFormData((prev) => ({
                ...prev,
                currency: defaultCurrencyObj
                    ? `${defaultCurrencyObj.currency} - ${defaultCurrencyObj.country}`
                    : "INR - INDIA",
            }));
        } catch (error) {
            console.error("Error fetching currency data:", error);
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
                    mb: 0
                }}
            >
                {!isAdding && (
                    <Button
                        variant="contained"
                        startIcon={<Add sx={{ fontSize: 15 }} />}
                        onClick={handleAdd}
                        disabled={isLoading || isFetching}
                        sx={{
                            background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            px: 1.4,
                            py: 0.42,
                            minHeight: 32,
                            borderRadius: '10px',
                            letterSpacing: '0.3px',
                            fontSize: '12px',
                            textTransform: 'none',
                            boxShadow: '0 4px 10px rgba(58,107,109,0.22)',
                            transition: 'all 0.2s ease',

                            '& .MuiButton-startIcon': {
                                marginRight: '4px'
                            },

                            '&:hover': {
                                background:
                                    'linear-gradient(135deg, #446f71 0%, #33585a 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 14px rgba(58,107,109,0.32)'
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
                                                    : option?.currency || ""
                                            }
                                            value={
                                                currencyList.find(
                                                    (item) =>
                                                        `${item.currency} - ${item.country}` === formData.currency
                                                ) || null
                                            }
                                            onChange={(event, newValue) =>
                                                handleInputChange({
                                                    target: {
                                                        name: "currency",
                                                        value: newValue
                                                            ? `${newValue.currency} - ${newValue.country}`
                                                            : "",
                                                    },
                                                })
                                            }
                                            disabled={
                                                isLoading ||
                                                (selectedExpense.approveStatus === "Approved" ||
                                                    selectedExpense.approveStatus === "Rejected")
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params} label="Currency" variant="outlined" fullWidth />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth variant="filled" size="small">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Expense Date"
                                                    value={formData.expenseDate ? dayjs(formData.expenseDate, 'YYYY-MM-DD') : null}
                                                    onChange={(date) => handleDateChange('expenseDate', date)}
                                                    slotProps={{
                                                        textField: { size: 'small', clearable: true, }
                                                    }}
                                                    format="DD-MM-YYYY"
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
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
                                                // background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
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
    startIcon={<CloudUploadIcon sx={{ color: 'white', fontSize: 18 }} />}
    sx={{
        background: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)",
        color: 'white',
        borderRadius: '10px',
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '12px',
        px: 1.8,
        py: 0.5,
        minHeight: 34,
        boxShadow: '0 3px 10px rgba(58,107,109,0.25)',

        '&:hover': {
            background: "linear-gradient(135deg, #2a4b4d 0%, #3a6b6d 100%)",
            boxShadow: '0 5px 14px rgba(58,107,109,0.35)',
            transform: 'translateY(-1px)',
        },

        '&:active': {
            transform: 'scale(0.98)',
        },
    }}
>
    {logo
        ? (typeof logo === 'object' && logo.name ? logo.name : 'Attachment')
        : 'Attachment'}

    <input
        type="file"
        hidden
        accept="image/png, image/jpeg"
        onChange={handleLogoChange}
    />
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
                                                                maxWidth: '100%',
                                                                maxHeight: '100%',
                                                                width: 'auto',
                                                                height: 'auto',
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
                borderRadius: 2,
                px: 1.5,
                py: 0.45,
                minWidth: 90,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#3a6b6d',
                color: '#3a6b6d',

                "&:hover": {
                    borderColor: '#2a4b4d',
                    backgroundColor: 'rgba(58,107,109,0.08)',
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
                background: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)",
                color: "white",
                fontWeight: 600,
                px: 1.8,
                py: 0.45,
                minWidth: 100,
                borderRadius: 2,
                letterSpacing: "0.3px",
                fontSize: "12px",
                textTransform: 'none',
                boxShadow: '0 3px 10px rgba(58,107,109,0.25)',

                "&:hover": {
                    transform: "translateY(-1px)",
                    background: "linear-gradient(135deg, #2a4b4d 0%, #3a6b6d 100%)",
                    boxShadow: '0 5px 14px rgba(58,107,109,0.35)',
                },

                "&:active": {
                    transform: "scale(0.98)",
                }
            }}
        >
            {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
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
                                borderRadius: 2.5,
                                boxShadow: '0 6px 18px rgba(58,107,109,0.12)',
                                border: '1px solid rgba(58,107,109,0.08)',
                                maxHeight: 400,
                                overflowY: "auto",

                                "&::-webkit-scrollbar": {
                                    width: "6px",
                                    height: "6px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    background: "#3a6b6d",
                                    borderRadius: "10px",
                                },
                                "&::-webkit-scrollbar-track": {
                                    background: "#f4f7f7",
                                },
                            }}
                        >
                            <Table size="small">

                                <TableHead>
                                    <TableRow
                                        sx={{
                                            background: "linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)",

                                            "& .MuiTableCell-root": {
                                                color: "#fff !important",
                                                fontWeight: 700,
                                                fontSize: "12px",
                                                py: 1.1,
                                                borderBottom: "none",
                                                letterSpacing: "0.4px",
                                            },
                                        }}
                                    >
                                        <TableCell align="center">Actions</TableCell>
                                        <TableCell align="center">Claim Details</TableCell>
                                        <TableCell align="center">Date</TableCell>
                                        <TableCell align="center">Amount</TableCell>
                                        <TableCell align="center">Category</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {currentExpense.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                                <Box sx={{ textAlign: "center" }}>
                                                    <Inventory2
                                                        sx={{
                                                            fontSize: 44,
                                                            color: "#b0bec5",
                                                            mb: 1,
                                                        }}
                                                    />

                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            color: "#607d8b",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Expense data not found
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentExpense.map((expense, index) => (
                                            <TableRow
                                                key={expense.id}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fbfb",

                                                    "&:hover": {
                                                        backgroundColor: "#eef5f5",
                                                        transition: "all 0.2s ease",
                                                    },

                                                    "& .MuiTableCell-root": {
                                                        borderBottom: "1px solid rgba(58,107,109,0.08)",
                                                        fontSize: "12px",
                                                        py: 0.8,
                                                    },
                                                }}
                                            >

                                                {/* ACTION */}
                                                <TableCell align="center">
                                                    <Tooltip title="Edit Expense">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditExpense(expense.id)}
                                                            disabled={
                                                                expense.approveStatus === "APPROVED" ||
                                                                expense.approveStatus === "REJECTED"
                                                            }
                                                            sx={{
                                                                background: "rgba(58,107,109,0.10)",
                                                                color: "#3a6b6d",

                                                                "&:hover": {
                                                                    background: "#3a6b6d",
                                                                    color: "#fff",
                                                                    transform: "scale(1.05)",
                                                                },

                                                                "&.Mui-disabled": {
                                                                    background: "#eceff1",
                                                                },
                                                            }}
                                                        >
                                                            <Edit sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>

                                                {/* TITLE */}
                                                <TableCell align="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: "#263238",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        {expense.expenseTitle}
                                                    </Typography>
                                                </TableCell>

                                                {/* DATE */}
                                                <TableCell align="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#607d8b",
                                                            fontSize: "12px",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {expense.expenseDate
                                                            ? dayjs(expense.expenseDate).format("DD/MM/YYYY")
                                                            : ""}
                                                    </Typography>
                                                </TableCell>

                                                {/* AMOUNT */}
                                                <TableCell align="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: "#2e7d32",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        ₹
                                                        {expense.amount
                                                            ? Number(expense.amount).toLocaleString("en-IN", {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 2,
                                                            })
                                                            : "0"}
                                                    </Typography>
                                                </TableCell>

                                                {/* CATEGORY */}
                                                <TableCell align="center">
                                                    <Chip
                                                        label={expense.category}
                                                        size="small"
                                                        sx={{
                                                            height: 22,
                                                            fontSize: "11px",
                                                            fontWeight: 600,
                                                            borderRadius: "6px",
                                                            backgroundColor: "rgba(58,107,109,0.10)",
                                                            color: "#3a6b6d",
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* STATUS */}
                                                <TableCell align="center">
                                                    <Box
                                                        sx={{
                                                            width: 26,
                                                            height: 26,
                                                            borderRadius: "50%",
                                                            backgroundColor: (theme) =>
                                                                getStatusColor(expense.approveStatus, theme),
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            mx: "auto",
                                                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                        }}
                                                    >
                                                        {getStatusIcon(expense.approveStatus)}
                                                    </Box>
                                                </TableCell>

                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/*  */}

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
                                <Typography variant="body1" gutterBottom>
                                    {dayjs(selectedExpense.expenseDate).format("DD-MM-YYYY")}
                                </Typography>
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