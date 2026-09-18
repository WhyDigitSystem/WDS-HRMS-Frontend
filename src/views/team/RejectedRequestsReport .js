import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CancelIcon from '@mui/icons-material/Cancel';
import ActionButton from 'utils/ActionButton';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { showToast } from 'utils/toast-component';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Autocomplete,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Button
} from '@mui/material';

import { ToastContainer } from 'react-toastify';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const RejectedRequestsReport = () => {
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));

    const [empList, setEmpList] = useState([]);
    const [rejectedData, setRejectedData] = useState([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [searchQuery, setSearchQuery] = useState('');

    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        fromDate: dayjs().startOf('month'),
        toDate: dayjs(),
        employee: 'ALL',
        employeeCode: 'ALL',
        type: 'ALL'
    });

    const requestTypes = [
        { label: 'All', value: 'ALL' },
        { label: 'Leave Request', value: 'LEAVEREQUEST' },
        { label: 'Permission Request', value: 'PERMISSIONREQUEST' },
        { label: 'Compensatory Off', value: 'COMPENSATORYOFF' },
        { label: 'Work From Home', value: 'WORKFROMHOME' },
        { label: 'Travel Request', value: 'TRAVELREQUEST' },
        { label: 'Check In Out Adjustment', value: 'CHECKINOUTADJUSTMENT' },
    ];

    useEffect(() => {
        getAllUsers();
    }, []);

    const getAllUsers = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/master/getAllEmployeeByOrgId?orgId=${orgId}&branchCode=${branchCode}`
            );

            if (response.status === true) {
                setEmpList(response.paramObjectsMap.employeeVO || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return rejectedData;

        return rejectedData.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [rejectedData, searchQuery]);

    const handleSearch = async () => {
        const errors = {};

        if (!formData.fromDate) {
            errors.fromDate = 'From Date is required';
        }

        if (!formData.toDate) {
            errors.toDate = 'To Date is required';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setLoading(true);

        try {
            const selectedType = formData.type || 'ALL';

            const response = await apiCalls(
                'get',
                `/newdashboard/getRejectedRequests?employeecode=${formData.employeeCode || 'ALL'
                }&fromDate=${dayjs(formData.fromDate).format(
                    'YYYY-MM-DD'
                )}&orgid=${orgId}&toDate=${dayjs(
                    formData.toDate
                ).format('YYYY-MM-DD')}&type=${encodeURIComponent(
                    selectedType
                )}`
            );

            if (response.status) {
                const data =
                    response.paramObjectsMap.rejectedRequestList || [];

                setRejectedData(data);

                if (data.length === 0) {
                    showToast('info', 'No rejected requests found');
                }

                setDialogOpen(true);
            }
        } catch (error) {
            console.error(error);
            showToast('error', 'Failed to fetch rejected requests');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            fromDate: dayjs().startOf('month'),
            toDate: dayjs(),
            employee: 'ALL',
            employeeCode: 'ALL',
            type: 'ALL'
        });

        setRejectedData([]);
        setSearchQuery('');
        setFieldErrors({});
    };

    const handleDownloadPDF = () => {
        if (rejectedData.length === 0) {
            showToast('error', 'No data available');
            return;
        }

        const doc = new jsPDF({
            orientation: 'landscape'
        });

        doc.setFontSize(15);
        doc.text('Rejected Requests Report', 14, 15);

        autoTable(doc, {
            startY: 25,
            head: [[
                'Employee Code',
                'Employee Name',
                'Request Type',
                'Request Date',
                ...(showTimeColumns ? ['In Time', 'Out Time'] : []),
                'Reason',
                'Status'
            ]],
            body: rejectedData.map((row) => [
                row.employeecode || '-',
                row.employeename || '-',
                row.type || '-',
                row.requestdate || '-',
                ...(showTimeColumns ? [row.intime || '-', row.outtime || '-'] : []),
                row.reason || '-',
                row.approvestatus || '-'
            ]),
            headStyles: {
                fillColor: [42, 75, 77]
            },
            styles: {
                fontSize: 8
            }
        });

        doc.save('Rejected_Requests_Report.pdf');
    };

    const handleDownloadExcel = async () => {
        if (rejectedData.length === 0) {
            showToast('error', 'No data available');
            return;
        }

        const workbook = new ExcelJS.Workbook();

        const sheet = workbook.addWorksheet('Rejected Requests');

        sheet.columns = [
            { header: 'Employee Code', key: 'employeecode', width: 20 },
            { header: 'Employee Name', key: 'employeename', width: 30 },
            { header: 'Request Type', key: 'type', width: 25 },
            { header: 'Request Date', key: 'requestdate', width: 20 },

            ...(showTimeColumns
                ? [
                    { header: 'In Time', key: 'intime', width: 15 },
                    { header: 'Out Time', key: 'outtime', width: 15 }
                ]
                : []),

            { header: 'Reason', key: 'reason', width: 40 },
            { header: 'Status', key: 'approvestatus', width: 20 }
        ];

        rejectedData.forEach((row) => {
            sheet.addRow({
                employeecode: row.employeecode || '-',
                employeename: row.employeename || '-',
                type: row.type || '-',
                requestdate: row.requestdate || '-',
                intime: row.intime || '-',
                outtime: row.outtime || '-',
                reason: row.reason || '-',
                approvestatus: row.approvestatus || '-'
            });
        });

        sheet.getRow(1).font = {
            bold: true,
            color: { argb: 'FFFFFFFF' }
        };

        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '2A4B4D' }
        };

        const buffer = await workbook.xlsx.writeBuffer();

        saveAs(
            new Blob([buffer]),
            `Rejected_Requests_${dayjs().format('DD-MM-YYYY')}.xlsx`
        );
    };


    const showTimeColumns =
        formData.type === 'CHECKINOUTADJUSTMENT';

    return (
        <>
            <ToastContainer />

            <div
                className="card w-full shadow-xl"
                style={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb'
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        background:
                            'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                        px: 3,
                        py: 2.5,
                        color: '#fff'
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            fontSize: '16px',
                            color: '#fff'
                        }}
                    >
                        Rejected Requests Report
                    </Typography>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2}>
                        {/* From Date */}
                        <Grid item xs={12} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="From Date *"
                                    format="DD-MM-YYYY"
                                    value={formData.fromDate}
                                    onChange={(newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            fromDate: newValue
                                        }));

                                        setFieldErrors((prev) => ({
                                            ...prev,
                                            fromDate: ''
                                        }));
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: 'small',
                                            error: !!fieldErrors.fromDate,
                                            helperText: fieldErrors.fromDate
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* To Date */}
                        <Grid item xs={12} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="To Date *"
                                    format="DD-MM-YYYY"
                                    value={formData.toDate}
                                    onChange={(newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            toDate: newValue
                                        }));

                                        setFieldErrors((prev) => ({
                                            ...prev,
                                            toDate: ''
                                        }));
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: 'small',
                                            error: !!fieldErrors.toDate,
                                            helperText: fieldErrors.toDate
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* Employee */}
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                size="small"
                                options={[
                                    { employee: 'ALL', employeeCode: 'ALL' },
                                    ...empList
                                ]}
                                getOptionLabel={(option) =>
                                    `${option.employeeCode} - ${option.employee}`
                                }
                                value={
                                    formData.employeeCode === 'ALL'
                                        ? { employee: 'ALL', employeeCode: 'ALL' }
                                        : empList.find(
                                            (emp) =>
                                                emp.employeeCode === formData.employeeCode
                                        ) || null
                                }
                                onChange={(e, newValue) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        employee: newValue?.employee || 'ALL',
                                        employeeCode:
                                            newValue?.employeeCode || 'ALL'
                                    }));
                                }}
                                isOptionEqualToValue={(option, value) =>
                                    option.employeeCode === value.employeeCode
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Employee"
                                    />
                                )}
                            />
                        </Grid>

                        {/* Type */}
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                size="small"
                                options={requestTypes}
                                getOptionLabel={(option) => option.label}
                                value={
                                    requestTypes.find(
                                        (item) => item.value === formData.type
                                    ) || null
                                }
                                onChange={(e, value) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        type: value?.value || 'ALL'
                                    }));
                                }}
                                isOptionEqualToValue={(option, value) =>
                                    option.value === value.value
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Request Type"
                                    />
                                )}
                            />
                        </Grid>

                        {/* Buttons */}
                        <Grid
                            item
                            xs={12}
                            md={3}
                            sx={{
                                display: 'flex',
                                gap: 1
                            }}
                        >
                            <ActionButton
                                title="Search"
                                icon={SearchIcon}
                                onClick={handleSearch}
                                disabled={loading}
                                fullWidth
                            />

                            <ActionButton
                                title="Clear"
                                icon={ClearIcon}
                                onClick={handleClear}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    {loading && (
                        <Box
                            mt={2}
                            display="flex"
                            justifyContent="center"
                        >
                            <CircularProgress size={30} />
                        </Box>
                    )}
                </Paper>

                {/* Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    maxWidth="xl"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            maxHeight: '95vh'
                        }
                    }}
                >
                    {/* Dialog Header */}
                    <DialogTitle
                        sx={{
                            background:
                                'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#fff',
                                    fontWeight: 600
                                }}
                            >
                                Rejected Requests Report
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{ color: '#fff' }}
                            >
                                {dayjs(formData.fromDate).format(
                                    'DD-MM-YYYY'
                                )}{' '}
                                to{' '}
                                {dayjs(formData.toDate).format(
                                    'DD-MM-YYYY'
                                )}
                            </Typography>
                        </Box>

                        <Box display="flex" gap={1}>
                            <Tooltip title="Export PDF">
                                <IconButton
                                    sx={{ color: '#fff' }}
                                    onClick={handleDownloadPDF}
                                >
                                    <PictureAsPdfIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Export Excel">
                                <IconButton
                                    sx={{ color: '#fff' }}
                                    onClick={handleDownloadExcel}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </DialogTitle>

                    {/* Content */}
                    <DialogContent sx={{ pt: 3 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Total Rejected Requests :{' '}
                            {filteredData.length}
                        </Alert>

                        {/* Search */}
                        <Box
                            mb={2}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >



                        </Box>

                        {/* Table */}
                        <Box
                            sx={{
                                overflow: 'auto',
                                maxHeight: '60vh',
                                borderRadius: '16px',
                                border: '1px solid #d1d5db',
                                boxShadow:
                                    '0 2px 10px rgba(0,0,0,0.06)',
                                background: '#fff'
                            }}
                        >
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        {[
                                            'Employee Code',
                                            'Employee Name',
                                            'Request Type',
                                            'Request Date',
                                            ...(showTimeColumns ? ['In Time', 'Out Time'] : []),
                                            'Reason',
                                            'Status'
                                        ].map((header) => (
                                            <TableCell
                                                key={header}
                                                sx={{
                                                    background:
                                                        'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                                                    color: '#fff',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={showTimeColumns ? 8 : 6}
                                                align="center"
                                                sx={{ py: 3 }}
                                            >
                                                <Typography color="text.secondary">
                                                    No Records Found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData
                                            .slice(
                                                page * rowsPerPage,
                                                page * rowsPerPage +
                                                rowsPerPage
                                            )
                                            .map((row, index) => (
                                                <TableRow hover key={index}>
                                                    <TableCell>
                                                        {row.employeecode || '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        {row.employeename || '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        {row.type || '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        {row.requestdate
                                                            ? dayjs(row.requestdate).format('DD-MM-YYYY')
                                                            : '-'}
                                                    </TableCell>


                                                    {showTimeColumns && (
                                                        <>
                                                            <TableCell>{row.intime || '-'}</TableCell>
                                                            <TableCell>{row.outtime || '-'}</TableCell>
                                                        </>
                                                    )}


                                                    <TableCell>
                                                        {row.reason || '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Chip
                                                            label={row.approvestatus || 'REJECTED'}
                                                            size="small"
                                                            sx={{
                                                                color: '#dc2626',
                                                                fontWeight: 600,
                                                                background: 'transparent',
                                                                '& .MuiChip-label': {
                                                                    px: 0
                                                                },
                                                                '& .MuiChip-deleteIcon': {
                                                                    display: 'none'
                                                                },
                                                                border: 'none'
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </Box>

                        {/* Pagination */}
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) =>
                                setPage(newPage)
                            }
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(
                                    parseInt(e.target.value, 10)
                                );
                                setPage(0);
                            }}
                        />
                    </DialogContent>

                    {/* Footer */}
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            borderTop: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Button
                            onClick={() => setDialogOpen(false)}
                            variant="contained"
                            sx={{
                                background:
                                    'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                                color: '#fff',
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                    background:
                                        'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                                    opacity: 0.95
                                }
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Dialog>
            </div>
        </>
    );
};

export default RejectedRequestsReport;