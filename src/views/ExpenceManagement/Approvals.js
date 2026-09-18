import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from "@mui/icons-material/Image";
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
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const Approvals = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [assetsData, setAssetsData] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [employeeCode] = useState(localStorage.getItem("employeeCode"));
    const [branchCode] = useState(localStorage.getItem("branchCode"));
    const [branch] = useState(localStorage.getItem("branch"));

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [openAttachment, setOpenAttachment] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleOpenAttachment = (base64Image) => {
        if (!base64Image) return;
        setSelectedImage(base64Image);
        setOpenAttachment(true);
    };

    const handleCloseAttachment = () => {
        setOpenAttachment(false);
        setSelectedImage(null);
    };

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
                    employeeName: asset.employeeName,
                    expenseLimit: asset.expenseLimit,
                    employeeCode: asset.employeeCode,
                    amount: asset.amount,
                    submitted: asset.submitted,
                    type: asset.type,
                    title: asset.title,
                    status: asset.status,
                    attachment: asset.attachment,
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
    const formatDate = (dateString) => {
        if (!dateString) return ''; // handle null or undefined
        const parsedDate = dayjs(dateString, [
            "DD-MM-YYYY hh:mm:ss A", // your current API format
            "YYYY-MM-DDTHH:mm:ss",   // ISO format (just in case)
            "YYYY-MM-DD"             // fallback for plain date
        ]);
        return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY") : '';
    };
    const handleApproveReject = async (request, action, approvedAmount) => {
        setIsLoading(true);
        try {
            let result
            console.log("approve", request);

            if (request.type === 'EXPENSE CLAIMS') {
                result = await apiCalls(
                    'put',
                    `/assetmanagement/createApprovalExpenseClaims?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&notify=${employeeCode}&notifyCode=${employeeCode}&orgId=${orgId}&screenName=${request.type}&approvedAmount=${approvedAmount}`
                );
            } else {
                result = await apiCalls(
                    'put',
                    `/assetmanagement/createApprovalTravelRequests?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&notify=${employeeCode}&notifyCode=${employeeCode}&orgId=${orgId}&screenName=${request.type}&approvedAmount=${approvedAmount}`
                );
            }
            if (result.status === true) {
                setIsLoading(false);
                // setFormData({ ...formData, approveStatus: result.paramObjectsMap.taxInvoiceVO.approveStatus });
                getAllExpence();
            } else {
                setIsLoading(false);
                console.error('API Error:', result.data);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data:', error);
        }
    };

    // const [selectedAsset, setSelectedAsset] = useState(null);

    const handleOpenDialog = (asset) => {
        setSelectedAsset(asset);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAsset(null);
    };

    return (
        <>
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 14px rgba(58,107,109,0.12)',
                    maxHeight: 400,
                    overflowY: 'auto',
                    border: '1px solid rgba(58,107,109,0.12)',
                    '&::-webkit-scrollbar': {
                        width: 6
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#3a6b6d',
                        borderRadius: 10
                    }
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow
                            sx={{
                                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                '& .MuiTableCell-root': {
                                    color: '#fff !important',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    py: 1.2,
                                    borderBottom: 'none',
                                    whiteSpace: 'nowrap'
                                }
                            }}
                        >
                            <TableCell align="center">Type</TableCell>
                            <TableCell align="center">Title</TableCell>
                            <TableCell align="center">Emp</TableCell>
                            <TableCell align="center">Limit</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Submitted</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Attachment</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {currentAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Inventory2 sx={{ fontSize: 46, color: '#b0bec5', mb: 1 }} />
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ color: '#3a6b6d', fontWeight: 600 }}
                                        >
                                            Approval data not found
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentAssets.map((asset, index) => {
                                const isExceeding =
                                    Number(asset.amount) > Number(asset.expenseLimit);

                                return (
                                    <TableRow
                                        key={asset.id}
                                        sx={{
                                            backgroundColor:
                                                index % 2 === 0
                                                    ? 'rgba(58,107,109,0.02)'
                                                    : '#fff',
                                            transition: '0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(58,107,109,0.08)'
                                            },
                                            '& .MuiTableCell-root': {
                                                borderBottom:
                                                    '1px solid rgba(58,107,109,0.08)'
                                            }
                                        }}
                                    >
                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#2a4b4d'
                                                }}
                                            >
                                                {asset.type?.split(' ')[0]}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '12px',
                                                    color: '#546e7a'
                                                }}
                                            >
                                                {asset.title}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#37474f'
                                                }}
                                            >
                                                {asset.employeeName}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#455a64'
                                                }}
                                            >
                                                {asset.expenseLimit
                                                    ? Number(asset.expenseLimit).toLocaleString(
                                                        'en-IN',
                                                        {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )
                                                    : '0'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: isExceeding
                                                        ? '#d32f2f'
                                                        : '#2a4b4d',
                                                    backgroundColor: isExceeding
                                                        ? 'rgba(211,47,47,0.08)'
                                                        : 'rgba(58,107,109,0.08)',
                                                    px: 1,
                                                    py: 0.3,
                                                    borderRadius: 2,
                                                    display: 'inline-flex'
                                                }}
                                            >
                                                {asset.amount
                                                    ? Number(asset.amount).toLocaleString(
                                                        'en-IN',
                                                        {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )
                                                    : '0'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    color: '#546e7a'
                                                }}
                                            >
                                                {formatDate(asset.submitted)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                textAlign: 'center',
                                                py: 0.7
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    px: 1,
                                                    py: 0.3,
                                                    borderRadius: 5,
                                                    backgroundColor: (theme) =>
                                                        `${getStatusColor(asset.status, theme)}20`,
                                                    color: (theme) =>
                                                        getStatusColor(asset.status, theme),
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 0.5,
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    mx: 'auto'
                                                }}
                                            >
                                                {React.cloneElement(getStatusIcon(asset.status), {
                                                    sx: { fontSize: 12 }
                                                })}
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            {asset.attachment ? (
                                                <Tooltip title="View Attachment">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() =>
                                                            handleOpenAttachment(
                                                                asset.attachment
                                                            )
                                                        }
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            background:
                                                                'rgba(58,107,109,0.08)',
                                                            color: '#3a6b6d',
                                                            transition: '0.2s ease',
                                                            '&:hover': {
                                                                transform: 'scale(1.08)',
                                                                background:
                                                                    'rgba(58,107,109,0.18)'
                                                            }
                                                        }}
                                                    >
                                                        <ImageIcon sx={{ fontSize: 17 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="body2">

                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 0.7 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 0.8,
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    disabled={
                                                        isLoading ||
                                                        asset.status !== 'PENDING'
                                                    }
                                                    onClick={() =>
                                                        handleOpenDialog(asset)
                                                    }
                                                    sx={{
                                                        minWidth: 28,
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        p: 0,
                                                        background:
                                                            'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                                                        boxShadow:
                                                            '0 2px 8px rgba(67,160,71,0.3)',
                                                        '&:hover': {
                                                            transform: 'scale(1.08)',
                                                            background:
                                                                'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)'
                                                        }
                                                    }}
                                                >
                                                    <CheckCircleIcon
                                                        sx={{
                                                            fontSize: 16,
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    disabled={
                                                        isLoading ||
                                                        asset.status !== 'PENDING'
                                                    }
                                                    onClick={() =>
                                                        handleApproveReject(
                                                            asset,
                                                            'REJECTED',
                                                            asset.amount
                                                        )
                                                    }
                                                    sx={{
                                                        minWidth: 28,
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        p: 0,
                                                        background:
                                                            'linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)',
                                                        boxShadow:
                                                            '0 2px 8px rgba(211,47,47,0.3)',
                                                        '&:hover': {
                                                            transform: 'scale(1.08)',
                                                            background:
                                                                'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                                                        }
                                                    }}
                                                >
                                                    <CancelIcon
                                                        sx={{
                                                            fontSize: 16,
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
                        Showingg {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, assetsData.length)} of {assetsData.length} Approvals
                    </Typography>
                </Box>
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            {/* 💬 Approval Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirm Approval Decision</DialogTitle>
                <DialogContent>
                    {selectedAsset && (
                        <>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Claim amount: <b>₹{selectedAsset.amount}</b><br />
                                Allocated limit: <b>₹{selectedAsset.expenseLimit}</b>
                            </Typography>

                            {Number(selectedAsset.amount) > Number(selectedAsset.expenseLimit) ? (
                                <Typography color="error" variant="body2">
                                    ⚠️ The claim exceeds the allocated limit. Please choose how to proceed.
                                </Typography>
                            ) : (
                                <Typography variant="body2">
                                    Are you sure want to approve this claim
                                </Typography>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    {selectedAsset?.amount > selectedAsset?.expenseLimit && (
                        <Button
                            onClick={() => {
                                handleApproveReject(selectedAsset, 'APPROVED', selectedAsset.expenseLimit);
                                handleCloseDialog();
                            }}
                            color="warning"
                            variant="contained"
                        >
                            Approve with Allocated Limit
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            handleApproveReject(selectedAsset, 'APPROVED', selectedAsset.amount);
                            handleCloseDialog();
                        }}
                        color="success"
                        variant="contained"
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Approvals;