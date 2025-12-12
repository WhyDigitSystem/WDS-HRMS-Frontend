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
                // variant="outlined"
               sx={{
    borderRadius: 3,
    boxShadow: 3,
    maxHeight: 400,       
    overflowY: "auto",
  }}
            >
                {/* <Table stickyHeader> */}
                    <Table size='small'>
                    <TableHead>
                        <TableRow  sx={{
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
          "& .MuiTableCell-root": {
            color: "white !important",
            fontWeight: "700",
            fontSize: "13px",
          },
        }}>
                            <TableCell align='center'>Type</TableCell>
                            <TableCell align='center'>Title</TableCell>
                            <TableCell align='center'>Emp</TableCell>
                            <TableCell align='center'>Limit</TableCell>
                            <TableCell align='center'>Amount</TableCell>
                            <TableCell align='center'>Submitted</TableCell>
                            <TableCell align='center'>Status</TableCell>
                            <TableCell align='center'>Attachment</TableCell>
                            <TableCell align='center'>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {currentAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Inventory2 sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                                        <Typography variant="h6" color="textSecondary" gutterBottom>
                                             Approval data not found
                                        </Typography>
                                        {/* <Typography variant="body2" color="textSecondary">
                                            Get started by adding your first approval request
                                        </Typography> */}
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
                                                transition: '0.2s ease'
                                            }
                                        }}
                                    >
                                        <TableCell align='center' sx={{ py: 0.5 }}>
                                            {/* <Typography variant="body2" fontWeight={500}>{asset.type}</Typography> */}
                                            <Typography variant="body2" fontWeight={500}>{asset.type?.split(" ")[0]}</Typography>

                                        </TableCell>

                                        <TableCell align='center' sx={{ py: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">{asset.title}</Typography>
                                        </TableCell>

                                        <TableCell align='center' sx={{ py: 0.5 }}>
                                            <Typography variant="body2" fontWeight={500}>{asset.employeeName}</Typography>
                                        </TableCell>

                                        <TableCell align='center' sx={{ py: 0.5 }}>
                                            <Typography variant="body2" fontWeight="500">
                                                {asset.expenseLimit
                                                    ? Number(asset.expenseLimit).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2
                                                    })
                                                    : "0"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align='center' sx={{ py: 0.5 }}>
                                            <Typography variant="body2" fontWeight="600"
                                                sx={{
                                                    color: isExceeding ? 'error.main' : 'text.primary',
                                                    // backgroundColor: isExceeding ? 'rgba(255,0,0,0.08)' : 'transparent',
                                                    px: 1,
                                                    borderRadius: 1,
                                                   
                                                }}>
                                                {asset.amount
                                                    ? Number(asset.amount).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2
                                                    })
                                                    : "0"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align='center' sx={{ py: 0.5 }}>
                                            <Typography variant="body2" fontWeight={500}>{formatDate(asset.submitted)}</Typography>
                                        </TableCell>

                                        {/* <TableCell sx={{ py: 0.5 }}>
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
                                        </TableCell> */}
                                        <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                                          <Box
                                            sx={{
                                              width: 28,
                                              height: 28,
                                              borderRadius: '50%',
                                              backgroundColor: (theme) => getStatusColor(asset.status, theme),
                                              display: 'flex',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              mx: 'auto',
                                            }}
                                          >
                                            {getStatusIcon(asset.status)}
                                          </Box>
                                        </TableCell>
                                        <TableCell align='center' sx={{ py: 0.5 }}>
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
                                      <TableCell align='center' sx={{ py: 0.5 }}>
                                            <Box sx={{ display: 'flex', gap: 1,mx:'auto' }}>
                                               <Button
  variant="contained"
  color="success"
  disabled={isLoading || asset.status !== 'PENDING'}
  onClick={() => handleOpenDialog(asset)}
  sx={{
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    borderRadius: '50%',
    minWidth: 28,
    minHeight: 28,
    width: 28,
    height: 28,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: 3
    }
  }}
>
  <CheckCircleIcon sx={{ fontSize: 16,color:'black' }} />
</Button>

                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    disabled={isLoading || asset.status !== 'PENDING'}
                                                    onClick={() => handleApproveReject(asset, 'REJECTED', asset.amount)}
                                                     sx={{
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    borderRadius: '50%',
    minWidth: 28,
    minHeight: 28,
    width: 28,
    height: 28,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: 3
    }
  }}
                                                >
                                                    <CancelIcon sx={{ fontSize: 16 ,color:'black'}} />
                                                    {/* Reject */}
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