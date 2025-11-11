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
    const [itemsPerPage] = useState(5);
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
    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'error';
            default: return 'info';
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
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Employee</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Exp Limit</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Submitted</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Attachment</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 1 }}>Approve/Reject</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {currentAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Inventory2 sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                                        <Typography variant="h6" color="textSecondary" gutterBottom>
                                            No Approval Requests Found
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Get started by adding your first approval request
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentAssets.map((asset) => {
                                const isExceeding = Number(asset.amount) > Number(asset.expenseLimit);

                                return (
                                    <TableRow
                                        key={asset.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'grey.50',
                                                transition: 'background-color 0.2s ease'
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ py: 1 }}>
                                            <Typography variant="body2" fontWeight={500}>{asset.type}</Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1 }}>
                                            <Typography variant="body2" color="text.secondary">{asset.title}</Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1 }}>
                                            <Typography variant="body2" fontWeight={500}>{asset.employeeName}</Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1 }}>
                                            <Typography variant="body2" fontWeight="500">
                                                {asset.expenseLimit
                                                    ? Number(asset.expenseLimit).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2
                                                    })
                                                    : "0"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1 }}>
                                            <Typography variant="body2" fontWeight="600"
                                                sx={{
                                                    color: isExceeding ? 'error.main' : 'text.primary',
                                                    backgroundColor: isExceeding ? 'rgba(255,0,0,0.08)' : 'transparent',
                                                    px: 1,
                                                    borderRadius: 1
                                                }}>
                                                {asset.amount
                                                    ? Number(asset.amount).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2
                                                    })
                                                    : "0"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1 }}>
                                            <Typography variant="body2" fontWeight={500}>{formatDate(asset.submitted)}</Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1 }}>
                                            <Chip
                                                label={asset.status}
                                                color={getStatusColor(asset.status)}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    minWidth: 100,
                                                    height: '24px',
                                                    fontSize: '0.75rem',
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1 }}>
                                            {asset.attachment ? (
                                                <Tooltip title="View Attachment">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenAttachment(asset.attachment)}
                                                        sx={{
                                                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                                            "&:hover": {
                                                                transform: "scale(1.1)",
                                                                boxShadow: 1,
                                                            },
                                                        }}
                                                    >
                                                        <ImageIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    disabled={isLoading || asset.status !== 'PENDING'}
                                                    onClick={() => handleOpenDialog(asset)}
                                                    sx={{
                                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: 3
                                                        }
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    disabled={isLoading || asset.status !== 'PENDING'}
                                                    onClick={() => handleApproveReject(asset, 'REJECTED', asset.amount)}
                                                    sx={{
                                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: 3
                                                        }
                                                    }}
                                                >
                                                    <CancelIcon sx={{ mr: 0.5, fontSize: 18 }} />
                                                    Reject
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                <Dialog
                    open={openAttachment}
                    onClose={handleCloseAttachment}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
                        Attachment Preview
                    </DialogTitle>
                    <DialogContent
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        {selectedImage ? (
                            <img
                                src={
                                    selectedImage.startsWith("data:")
                                        ? selectedImage // Already has prefix
                                        : `data:image/${selectedImage.startsWith("/") ? "png" : "jpeg"};base64,${selectedImage}`
                                }
                                alt="Attachment Preview"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "70vh",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                }}
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No Image Available
                            </Typography>
                        )}
                    </DialogContent>
                </Dialog>
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
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, assetsData.length)} of {assetsData.length} Approvals
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