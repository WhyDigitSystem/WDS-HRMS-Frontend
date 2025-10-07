import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Slide,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import apiCalls from 'apicall';
import React, { useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { showToast } from '../../utils/toast-component';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const VisuallyHiddenInput = ({ ...props }) => <input type="file" style={{ display: 'none' }} {...props} />;

const AdvanceCommonBulkUpload = ({
    open,
    handleClose,
    dialogTitle,
    uploadText,
    downloadText,
    onSubmit,
    sampleFileDownload,
    fileName,
    handleFileUpload,
    apiUrl,
    loginUser,
    screen,
    orgId,
    documentName,
    employeeCode,
    employeeName,
    branchCode,
    branch,
    month,
    year,
    // New prop to control whether to show attendance processing dialog
    showAttendanceProcessing = false,
    enableMonthYear = false
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [successfulUploads, setSuccessfulUploads] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    // State for attendance processing dialog
    const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
    const [monthYear, setMonthYear] = React.useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        handleFileUpload(event);
    };

    const handleCancelFile = () => {
        setSelectedFile(null);
    };

    const handleErrorDialogClose = () => {
        setErrorDialogOpen(false);
        setErrorMessage('');
    };

    const handleSuccessDialogClose = () => {
        setSuccessDialogOpen(false);
        setSuccessMessage('');
        setSuccessfulUploads(0);
    };

    const handleProcessingDialogClose = () => {
        setProcessingDialogOpen(false);
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        // Show processing dialog for attendance
        if (showAttendanceProcessing) {
            setProcessingDialogOpen(true);
        }

        if (selectedFile && monthYear) {
            const formattedMonthYear = getFormattedMonthYear(monthYear);
            const month = monthYear.getMonth() + 1; // Get month (1-12)
            const year = monthYear.getFullYear();
            const createdBy = loginUser;
            const formData = new FormData();
            formData.append('files', selectedFile);
            formData.append('createdBy', createdBy);
            formData.append('orgId', orgId);
            formData.append('documentName', documentName);
            formData.append('employeeCode', employeeCode);
            formData.append('employeeName', employeeName);
            formData.append('branch', branch);
            formData.append('branchCode', branchCode);
            formData.append('month', month);
            formData.append('year', year);
            formData.append('monthYear', formattedMonthYear);

            try {
                const headers = {
                    'Content-Type': 'multipart/form-data'
                };
                const response = await apiCalls('post', apiUrl, formData, {}, headers);

                if (response.status === true) {
                    const message = response.paramObjectsMap.message || 'Upload successful';
                    const uploadsCount = response.paramObjectsMap.successfulUploads;
                    setSuccessMessage(message);
                    setSuccessfulUploads(uploadsCount);
                    setSuccessDialogOpen(true);
                    setIsLoading(false);
                    showToast('success', message);
                }
                // Handle new response format
                else if (response.successCount !== undefined) {
                    const message = response.message || 'Upload successful';
                    setSuccessMessage(message);
                    setSuccessfulUploads(response.successCount);
                    if (response.failedCount > 0) {
                        // Show both success and failure counts in dialog
                        setSuccessMessage(`${message} (Success: ${response.successCount}, Failed: ${response.failedCount})`);
                        if (response.failures && response.failures.length > 0) {
                            // Show failures in error dialog
                            setErrorMessage(`Failed items: ${response.failures.join(', ')}`);
                            setErrorDialogOpen(true);
                        }
                    }
                    setSuccessDialogOpen(true);
                    setIsLoading(false);
                    showToast('success', message);
                } else if (response.totalSaved && response.message) {
                    const message = response.message;
                    setSuccessMessage(message);
                    setSuccessfulUploads(response.totalSaved);
                    setSuccessDialogOpen(true);
                    setIsLoading(false);
                    showToast('success', message);
                } else if (response.duplicates && response.message) {
                    const message = response.message;
                    const duplicates = response.duplicates;

                    // 🔔 Combine message + duplicates in toast
                    const toastMessage = `${message}: ${duplicates.join(', ')}`;
                    showToast('error', toastMessage);

                    // 📝 Show duplicates in dialog (stored as line items)
                    setErrorMessage(`${message}`);
                    setErrorDialogOpen(true);
                    setIsLoading(false);
                } else if (response.paramObjectsMap.status === false) {
                    showToast('error', response.paramObjectsMap.uploadResult.failureReasons[0] || 'Bulk Uploaded failed');
                    setIsLoading(false);
                } else {
                    showToast('error', response.paramObjectsMap.errorMessage || `${screen} Bulk Uploaded failed`);
                    const errorMessage = response.paramObjectsMap.errorMessage || 'Upload failed';
                    setErrorMessage(errorMessage);
                    setErrorDialogOpen(true);
                    setIsLoading(false);
                    console.log(errorMessage);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('error', ' failed');
                setErrorMessage('An unexpected error occurred during the upload.');
                setErrorDialogOpen(true);
                setIsLoading(false);
            }

            // Close processing dialog for attendance
            if (showAttendanceProcessing) {
                setProcessingDialogOpen(false);
            }

            handleClose();
            if (onSubmit) onSubmit();
        } else {
            setIsLoading(false);
            // Close processing dialog for attendance if no file selected
            if (showAttendanceProcessing) {
                setProcessingDialogOpen(false);
            }
        }
    };

    const getFormattedMonthYear = (date) => {
        if (!date) return null;
        const month = date.toLocaleString("default", { month: "long" }); // e.g., September
        const year = date.getFullYear();
        return `${month} ${year}`;
    };

    const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

    return (
        <>
            <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
                <div className="d-flex justify-content-between align-items-center p-1">
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <IconButton onClick={handleClose} color="secondary">
                        <IoMdClose style={{ fontSize: "1.5rem" }} />
                    </IconButton>
                </div>

                <DialogContent>
                    <DialogContentText className="text-center mb-2">
                        Choose a file to upload
                    </DialogContentText>

                    {/* Month-Year Picker */}
                    {enableMonthYear && (
                        <Box display="flex" justifyContent="center" mb={2} mt={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Month & Year"
                                    views={["year", "month"]}
                                    format="MMMM yyyy"
                                    value={monthYear}
                                    onChange={(newValue) => setMonthYear(newValue)}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            error: false,
                                        },
                                    }}
                                    sx={{ width: 220 }}
                                />
                            </LocalizationProvider>
                        </Box>
                    )}

                    {/* File Upload */}
                    <div className="d-flex justify-content-center mb-2">
                        <Button
                            component="label"
                            variant="contained"
                            color="secondary"
                            startIcon={<FaCloudUploadAlt />}
                            disabled={!monthYear}
                            style={{ textTransform: "none", padding: "6px 12px" }}
                        >
                            {uploadText}
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>
                    </div>

                    {selectedFile && (
                        <div className="text-center mb-2" style={{ fontSize: "0.875rem" }}>
                            Selected file: {selectedFile.name}
                            <Button
                                size="small"
                                onClick={handleCancelFile}
                                variant="text"
                                color="secondary"
                                style={{
                                    marginLeft: "10px",
                                    textTransform: "none",
                                    padding: "2px 4px",
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    <div className="d-flex justify-content-center mb-2">
                        <Button
                            size="small"
                            component="a"
                            href={sampleFileDownload}
                            download={fileName}
                            variant="outlined"
                            color="secondary"
                            startIcon={<FiDownload />}
                            style={{
                                textTransform: "none",
                                padding: "4px 8px",
                                color: "#9CA4AF",
                            }}
                        >
                            {downloadText}
                        </Button>
                    </div>
                </DialogContent>

                <DialogActions className="d-flex justify-content-between p-2">
                    <Button
                        onClick={handleClose}
                        color="secondary"
                        style={{ textTransform: "none", padding: "4px 8px" }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            handleSubmit({
                                monthYear: getFormattedMonthYear(monthYear),
                                selectedFile,
                            })
                        }
                        color="secondary"
                        variant="contained"
                        style={{
                            textTransform: "none",
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                        }}
                        disabled={isLoading || !selectedFile || !monthYear}
                    >
                        {isLoading ? (
                            <CircularProgress
                                size={20}
                                color="inherit"
                                style={{ marginRight: "8px" }}
                            />
                        ) : null}
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Attendance Processing Dialog - Only shown for attendance screen */}
            {showAttendanceProcessing && (
                <Dialog
                    open={processingDialogOpen}
                    onClose={handleProcessingDialogClose}
                    aria-labelledby="processing-dialog-title"
                    aria-describedby="processing-dialog-description"
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle id="processing-dialog-title">
                        Processing Attendance
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <CircularProgress size={60} thickness={4} style={{ marginBottom: 20 }} />
                            <Typography variant="body1" align="center">
                                Your attendance data is being processed. This may take a few moments.
                            </Typography>
                            <Typography variant="body2" align="center" color="textSecondary" style={{ marginTop: 10 }}>
                                Please do not close this window.
                            </Typography>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}

            {/* Error Dialog */}
            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={errorDialogOpen}
                onClose={handleErrorDialogClose}
                TransitionComponent={Transition}
                PaperProps={{
                    style: {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        padding: '10px',
                        borderRadius: '10px'
                    }
                }}
            >
                <DialogTitle style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/128/753/753345.png"
                        width={30}
                        height={30}
                        alt="Error Icon"
                        style={{ marginRight: '10px' }}
                    />
                    <Typography variant="h6" component="span" style={{ flexGrow: 1 }}>
                        Upload Failed
                    </Typography>
                    <IconButton onClick={handleErrorDialogClose} style={{ color: 'grey' }}>
                        <IoMdClose style={{ fontSize: '1.5rem' }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {errorMessage.split(', ').map((msg, index) => (
                            <Typography key={index} variant="body2" style={{ marginBottom: '5px' }}>
                                {msg}
                            </Typography>
                        ))}
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={successDialogOpen}
                onClose={handleSuccessDialogClose}
                TransitionComponent={Transition}
                PaperProps={{
                    style: {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        padding: '10px',
                        borderRadius: '10px'
                    }
                }}
            >
                <DialogTitle style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/128/14090/14090371.png"
                        height={40}
                        width={40}
                        alt="Success Icon"
                        style={{ marginRight: '10px' }}
                    />
                    <Typography variant="h6" component="span" style={{ flexGrow: 1 }}>
                        Upload Successful
                    </Typography>
                    <IconButton onClick={handleSuccessDialogClose} style={{ color: '#4caf50' }}>
                        <IoMdClose style={{ fontSize: '1.5rem' }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography variant="body2">Successful Uploads: {successfulUploads}</Typography>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdvanceCommonBulkUpload;