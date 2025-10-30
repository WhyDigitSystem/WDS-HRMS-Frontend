import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Divider,
    CircularProgress,
    InputAdornment,
    FormControl,
    InputLabel,
    Chip,
    Stack,
    Autocomplete,
    FormHelperText,
} from '@mui/material';
import {
    Search,
    Person,
    TrendingUp,
    CalendarToday,
    Work,
    Business,
    LocationOn,
    Event
} from '@mui/icons-material';
import apiCalls from "apicall";
import { format } from "date-fns";
import dayjs from 'dayjs';
import ToastComponent, { showToast } from 'utils/toast-component';

const IncrementManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [salaryLoading, setSalaryLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("employeeName"));
    const [branchCode] = useState(localStorage.getItem("branchCode"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [allReportingPersonList, setAllReportingPersonList] = useState([]);
    const [incrementHistory, setIncrementHistory] = useState([]);
    const [designationData, setDesignationData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [employeeData, setEmployeeData] = useState({
        employeeId: '',
        employeeName: '',
        incrementCycle: 'Annual',
        effectiveDate: dayjs().format('YYYY-MM-DD'),
        adjustmentType: 'Percentage Increase',
        adjustmentValue: '15',
        newDesignation: '',
        newGrade: '',
        justification: '',
        nextApproval: '',
        status: 'Pending Approval'
    });

    const [currentCompensation, setCurrentCompensation] = useState([]);
    const [proposedCompensation, setProposedCompensation] = useState([]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0.00';
        const num = typeof amount === 'number' ? amount : parseFloat(amount);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(num);
    };

    const employeeDetails = selectedEmployee
        ? [
            { label: 'Name:', value: selectedEmployee.employee || '-', icon: <Person fontSize="small" /> },
            { label: 'Code:', value: selectedEmployee.employeeCode || '-', icon: <Work fontSize="small" /> },
            { label: 'Department:', value: selectedEmployee.department || '-', icon: <Business fontSize="small" /> },
            { label: 'Designation:', value: selectedEmployee.designation || '-', icon: <Work fontSize="small" /> },
            { label: 'Location:', value: selectedEmployee.branch || '-', icon: <LocationOn fontSize="small" /> },
            {
                label: 'DOJ:',
                value: formatDate(selectedEmployee.joiningDate),
                icon: <Event fontSize="small" />
            },
            { label: 'Reporting To:', value: selectedEmployee.reportingPerson || '-', icon: <Person fontSize="small" /> },
        ]
        : [];

    useEffect(() => {
        fetchEmployees();
        getAllReportingPersonList();
        getAllDesignation();
    }, []);

    // Fetch increment history when employee is selected
    useEffect(() => {
        if (selectedEmployee && selectedEmployee.employeeCode) {
            getIncrementHistory(selectedEmployee.employeeCode);
        } else {
            setIncrementHistory([]);
        }
    }, [selectedEmployee]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await apiCalls("get", `/master/getAllEmployeeByOrgId?orgId=${orgId}`);
            const list = response?.paramObjectsMap?.employeeVO || [];

            const formatted = list.map((emp) => ({
                label: `${emp.employee || emp.employeeName} - ${emp.employeeCode}`,
                ...emp,
                profileImage: emp.profileImage
                    ? `data:image/jpeg;base64,${emp.profileImage}`
                    : null,
            }));

            setEmployees(formatted);
        } catch (err) {
            console.error("Error fetching employees:", err);
            showToast('error', 'Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    const getIncrementHistory = async (employeeCode) => {
        try {
            setHistoryLoading(true);
            const response = await apiCalls(
                'get',
                `/incrementmanagement/getSalaryHistoryforIncrement?employeeCode=${employeeCode}&orgId=${orgId}`
            );

            console.log('Increment History API Response:', response);

            if (response.status === true) {
                const salaryHistory = response.paramObjectsMap.salaryHistoryList || [];

                // Transform API data to match table structure
                const transformedHistory = salaryHistory.map((item, index) => ({
                    id: item.id || index,
                    year: item.year?.toString() || '-',
                    effectiveDate: formatDate(item.newSalaryEffectivedate),
                    previousCTC: formatCurrency(item.previousSalary),
                    newCTC: formatCurrency(item.newSalary),
                    increase: item.totalctcPercentage ? `${item.totalctcPercentage}%` : '0%',
                    approvedBy: item.approvedBy || 'System',
                    status: item.status || 'Completed'
                }));

                setIncrementHistory(transformedHistory);
            } else {
                console.error('Increment History API Error:', response);
                setIncrementHistory([]);
            }
        } catch (error) {
            console.error('Error fetching increment history:', error);
            showToast('error', 'Failed to load increment history');
            setIncrementHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const getAllSalaryStructure = async (employeeCode) => {
        try {
            setSalaryLoading(true);
            const response = await apiCalls('get', `/incrementmanagement/getLatestSalaryStructureByOrgId?orgId=${orgId}&employeeCode=${employeeCode}`);
            console.log('Salary Structure API Response:', response);

            if (response.status === true) {
                const salaryStructures = response.paramObjectsMap.SalaryStructureVO;

                const employeeSalaryStructure = salaryStructures.find(
                    structure => structure.employeeCode === employeeCode
                );

                if (employeeSalaryStructure) {
                    const compensationData = employeeSalaryStructure.salaryEarningDetailsVO.map(item => ({
                        component: item.heading,
                        amount: formatAmount(item.amount)
                    }));

                    setCurrentCompensation(compensationData);

                    // Initialize proposed compensation based on current data
                    const initialProposedCompensation = compensationData.map(item => ({
                        component: item.component,
                        current: item.amount,
                        proposed: formatAmount(parseAmount(item.amount) * 1.15), // 15% increase by default
                        increase: '15.00%'
                    }));

                    setProposedCompensation(initialProposedCompensation);
                } else {
                    console.warn('No salary structure found for employee:', employeeCode);
                    setCurrentCompensation([]);
                    setProposedCompensation([]);
                }
            } else {
                console.error('Salary Structure API Error:', response);
                setCurrentCompensation([]);
                setProposedCompensation([]);
            }
        } catch (error) {
            console.error('Error fetching salary structure data:', error);
            setCurrentCompensation([]);
            setProposedCompensation([]);
        } finally {
            setSalaryLoading(false);
        }
    };

    const getAllReportingPersonList = async () => {
        try {
            const result = await apiCalls(
                'get',
                `master/getReportingNameForEmployee?branchCode=${branchCode}&employeeCode="Undefined"&orgId=${orgId}`
            );
            const employeeList = result?.paramObjectsMap?.employeeVO || [];
            const mappedList = employeeList.map((emp) => ({
                label: emp.employeeName,
                code: emp.employeeCode,
                email: emp.email,
                role: emp.role
            }));
            setAllReportingPersonList(mappedList);
            console.log('Notify Options:', mappedList);
        } catch (err) {
            console.log('Error fetching notify list', err);
            showToast('error', 'Error fetching approvers list');
        }
    };

    const getAllDesignation = async () => {
        try {
            const result = await apiCalls('get', `commonmaster/getDesignationByOrgId?orgid=${orgId}`);
            setDesignationData(result.paramObjectsMap.designationVO.reverse());
        } catch (err) {
            console.log('error', err);
            showToast('error', 'Error fetching designation list');
        }
    };

    const handleEmployeeSelect = (event, val) => {
        setSelectedEmployee(val);

        if (val && val.employeeCode) {
            getAllSalaryStructure(val.employeeCode);

            // Update employee data with selected employee info and pre-fill grade & designation
            setEmployeeData(prev => ({
                ...prev,
                employeeId: val.employeeCode,
                employeeName: val.employee || val.employeeName,
                newDesignation: val.designation || '', // Pre-fill with current designation
                currentGrade: val.grade || '',          // Store current grade for reference
                newGrade: val.grade || '',              // Auto-set to current grade
            }));
        } else {
            setCurrentCompensation([]);
            setProposedCompensation([]);
            setIncrementHistory([]);

            // Reset employee data when no employee is selected
            setEmployeeData(prev => ({
                ...prev,
                employeeId: '',
                employeeName: '',
                newDesignation: '',
                currentGrade: '',
                newGrade: '',
            }));
        }
    };

    const parseAmount = (amount) => {
        if (!amount) return 0;
        const cleanedAmount = String(amount).replace(/,/g, '').replace(/\$/g, '').replace(/₹/g, '');
        return parseFloat(cleanedAmount) || 0;
    };

    const formatAmount = (amount) => {
        const num = typeof amount === 'number' ? amount : parseAmount(amount);
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleInputChange = (field) => (event) => {
        let value = event.target.value;

        if (field === 'adjustmentValue') {
            value = Number(value) || 0;
        }

        setEmployeeData((prevData) => ({
            ...prevData,
            [field]: value
        }));

        if (field === 'adjustmentValue') {
            updateProposedCompensation(value);
        }
    };

    const updateProposedCompensation = (percentage) => {
        const newCompensation = proposedCompensation.map(item => {
            const currentValue = parseAmount(item.current);
            const increaseFactor = 1 + (parseFloat(percentage) / 100);
            const newProposed = currentValue * increaseFactor;

            return {
                ...item,
                proposed: formatAmount(newProposed),
                increase: `${parseFloat(percentage).toFixed(2)}%`
            };
        });

        setProposedCompensation(newCompensation);
    };

    const handleProposedAmountChange = (index, value) => {
        const newCompensation = [...proposedCompensation];
        newCompensation[index].proposed = value;

        const currentValue = parseAmount(newCompensation[index].current);
        const proposedValue = parseAmount(value);
        const increasePercentage = currentValue > 0 ? ((proposedValue - currentValue) / currentValue * 100).toFixed(2) : 0;

        newCompensation[index].increase = `${increasePercentage}%`;

        setProposedCompensation(newCompensation);

        if (index === 0) {
            setEmployeeData(prev => ({
                ...prev,
                adjustmentValue: increasePercentage
            }));
        }
    };

    const calculateTotalCTC = (compensation) => {
        return compensation.reduce((total, item) => {
            return total + parseAmount(item.current || item.amount);
        }, 0);
    };

    const calculateProposedTotalCTC = () => {
        return proposedCompensation.reduce((total, item) => {
            return total + parseAmount(item.proposed);
        }, 0);
    };

    const calculateTotalIncrease = () => {
        const currentTotal = calculateTotalCTC(currentCompensation);
        const proposedTotal = calculateProposedTotalCTC();
        return currentTotal > 0 ? ((proposedTotal - currentTotal) / currentTotal * 100).toFixed(2) + '%' : '0%';
    };

    const prepareIncrementData = () => {
        const incrementManagementDetailsDTO = proposedCompensation.map(item => ({
            heading: item.component,
            amount: parseAmount(item.proposed)
        }));

        const selectedReportingPerson = allReportingPersonList.find(
            person => person.code === employeeData.nextApproval
        );

        return {
            adjustmentType: employeeData.adjustmentType,
            adjustmentValue: employeeData.adjustmentValue,
            createdBy: loginUserName,
            branch: branch || '',
            branchCode: branchCode || '',
            department: selectedEmployee?.department || '',
            designation: selectedEmployee?.designation || '',
            effectiveFrom: employeeData.effectiveDate,
            employeeCode: employeeData.employeeId,
            incrementCycle: employeeData.incrementCycle,
            incrementManagementDetailsDTO: incrementManagementDetailsDTO,
            joiningDate: selectedEmployee?.joiningDate || new Date().toISOString().split('T')[0],
            location: selectedEmployee?.branch || '',
            employeeName: employeeData.employeeName,
            orgId: orgId,
            newDesignation: employeeData.newDesignation,
            newGrade: employeeData.newGrade,
            nextApproval: employeeData.nextApproval,
            remarks: employeeData.justification,
            reportingTo: selectedReportingPerson?.label || '',
            reportingPersonCode: selectedReportingPerson?.code || '',
            reportingPersonEmail: selectedReportingPerson?.email || '',
            totalCtcPercentage: calculateTotalIncrease().replace('%', '')
        };
    };

    const handleSubmit = async () => {
        if (!selectedEmployee) {
            showToast('error', 'Please select an employee first');
            return;
        }

        if (!employeeData.nextApproval) {
            showToast('error', 'Please select next approver');
            return;
        }

        try {
            setSubmitting(true);
            const incrementData = prepareIncrementData();

            console.log('Submitting increment data:', incrementData);

            const response = await apiCalls('put', '/incrementmanagement/createUpdateIncrementManagement', incrementData);

            if (response.status === true) {
                showToast('success', 'Increment proposal submitted successfully!');
                // Refresh history after successful submission
                getIncrementHistory(selectedEmployee.employeeCode);
                setEmployeeData(prev => ({
                    ...prev,
                    status: 'Pending Approval'
                }));
                handleCancel();
            } else {
                throw new Error(response.message || 'Failed to submit increment proposal');
            }
        } catch (error) {
            console.error('Error submitting increment proposal:', error);
            showToast('error', error.message || 'Failed to submit increment proposal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedEmployee(null);
        setEmployeeData({
            employeeId: '',
            employeeName: '',
            incrementCycle: 'Annual',
            effectiveDate: dayjs().format('YYYY-MM-DD'),
            adjustmentType: 'Percentage Increase',
            adjustmentValue: '15',
            newDesignation: '',
            newGrade: '',
            justification: '',
            nextApproval: '',
            status: 'Draft'
        });
        setCurrentCompensation([]);
        setProposedCompensation([]);
        setIncrementHistory([]);
        // showToast('info', 'Form reset successfully');
    };

    const totalCurrentCTC = formatAmount(calculateTotalCTC(currentCompensation));
    const totalProposedCTC = formatAmount(calculateProposedTotalCTC());
    const totalIncrease = calculateTotalIncrease();

    const getStatusChip = (status) => {
        const statusConfig = {
            'APPROVED': { color: 'success', label: 'Approved' },
            'PENDING': { color: 'warning', label: 'Pending' },
            'REJECTED': { color: 'error', label: 'Rejected' },
            'COMPLETED': { color: 'success', label: 'Completed' }
        };

        const config = statusConfig[status?.toUpperCase()] || { color: 'default', label: status || 'Unknown' };

        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                sx={{
                    fontWeight: 600,
                    backgroundColor:
                        status?.toUpperCase() === 'APPROVED' ? '#e8f5e8' :
                            status?.toUpperCase() === 'PENDING' ? '#fff3e0' :
                                status?.toUpperCase() === 'REJECTED' ? '#ffebee' : '#f5f5f5',
                    color:
                        status?.toUpperCase() === 'APPROVED' ? '#2e7d32' :
                            status?.toUpperCase() === 'PENDING' ? '#e65100' :
                                status?.toUpperCase() === 'REJECTED' ? '#c62828' : '#757575'
                }}
            />
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <div>
                <ToastComponent />
            </div>
            <Grid container spacing={3}>
                {/* Employee Selection & Current Details - Always Visible */}
                <Grid item xs={12} md={6}>
                    <Card elevation={4} sx={{
                        borderRadius: 3,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                        },
                        border: '1px solid #e0e0e0',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardHeader
                            title="Employee Selection & Current Details"
                            sx={{
                                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '12px 12px 0 0',
                                py: 1
                            }}
                        />
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                            <Stack spacing={2} sx={{ height: '100%' }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#34495e',
                                        borderLeft: '4px solid #667eea',
                                        pl: 1.5,
                                    }}
                                >
                                    Select Employee
                                </Typography>
                                <Box>
                                    <Autocomplete
                                        options={employees}
                                        getOptionLabel={(option) => option.label || ""}
                                        value={selectedEmployee}
                                        onChange={handleEmployeeSelect}
                                        size="small"
                                        loading={loading}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Name"
                                                variant="outlined"
                                                placeholder="Type to search employees..."
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Search sx={{ color: '#667eea' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <>
                                                            {loading ? <CircularProgress color="inherit" size={18} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 2,
                                                        height: 45,
                                                        "&:hover fieldset": {
                                                            borderColor: '#667eea',
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: '#667eea',
                                                            borderWidth: 2,
                                                        },
                                                    },
                                                    "& .MuiInputLabel-root.Mui-focused": {
                                                        color: '#667eea',
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Box>

                                <Divider sx={{ borderColor: '#e0e0e0', my: 1 }} />

                                <Typography variant="h6" sx={{
                                    color: '#2c3e50',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <TrendingUp sx={{ color: '#27ae60', fontSize: 20 }} />
                                    Current Compensation
                                    {salaryLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                                </Typography>

                                <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, flexGrow: 1 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{
                                                    fontWeight: 700,
                                                    backgroundColor: '#34495e',
                                                    color: 'white',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    Component
                                                </TableCell>
                                                <TableCell sx={{
                                                    fontWeight: 700,
                                                    backgroundColor: '#34495e',
                                                    color: 'white',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    Amount (₹)
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {currentCompensation.length > 0 ? (
                                                currentCompensation.map((row, index) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{
                                                            '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                                                            '&:hover': { backgroundColor: '#e3f2fd' }
                                                        }}
                                                    >
                                                        <TableCell sx={{ fontWeight: 500 }}>{row.component}</TableCell>
                                                        <TableCell sx={{ color: '#2e7d32', fontWeight: 600 }}>{row.amount}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                                        <Typography color="text.secondary">
                                                            {selectedEmployee ? 'No salary data found' : 'Select an employee to view salary details'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {currentCompensation.length > 0 && (
                                                <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                                                    <TableCell sx={{ fontWeight: 700, color: '#1b5e20' }}>Current CTC</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#1b5e20' }}>{totalCurrentCTC}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Employee Quick View - Only show when employee is selected */}
                {selectedEmployee && (
                    <Grid item xs={12} md={6}>
                        <Card elevation={4} sx={{
                            borderRadius: 3,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                            },
                            border: '1px solid #e0e0e0',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <CardHeader
                                title="Employee Quick View"
                                sx={{
                                    textAlign: 'center',
                                    background: 'linear-gradient(45deg, #11998e 0%, #38ef7d 100%)',
                                    color: 'white',
                                    borderRadius: '12px 12px 0 0',
                                    py: 1
                                }}
                            />
                            <CardContent sx={{ p: 3, flexGrow: 1 }}>
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        mx: 'auto',
                                        mb: 3,
                                        bgcolor: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                        border: '4px solid',
                                        borderColor: '#11998e',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                    src={selectedEmployee.profileImage || ""}
                                >
                                    {!selectedEmployee.profileImage &&
                                        <Person sx={{ fontSize: 48, color: 'white' }} />
                                    }
                                </Avatar>

                                <Stack spacing={2} sx={{ height: '100%' }}>
                                    {employeeDetails.map((detail, index) => (
                                        <Box
                                            key={index}
                                            display="flex"
                                            alignItems="center"
                                            py={0}
                                            sx={{
                                                borderBottom: '1px dashed #e0e0e0',
                                                transition: 'background-color 0.2s',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5',
                                                    borderRadius: 1
                                                }
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" width={140}>
                                                <Box sx={{ color: '#11998e' }}>
                                                    {detail.icon}
                                                </Box>
                                                <Typography variant="body2" fontWeight={600} ml={1} color="#555">
                                                    {detail.label}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" fontWeight={500} color="#2c3e50">
                                                {detail.value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Increment Proposal Details - Only show when employee is selected */}
                {selectedEmployee && (
                    <Grid item xs={12}>
                        <Card elevation={4} sx={{
                            borderRadius: 3,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            border: '1px solid #e0e0e0'
                        }}>
                            <CardHeader
                                title="Increment Proposal Details"
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 0%, #21CBF3 100%)',
                                    color: 'white',
                                    borderRadius: '12px 12px 0 0',
                                    py: 1
                                }}
                            />
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: '#2c3e50' }}>Increment Cycle</InputLabel>
                                            <Select
                                                value={employeeData.incrementCycle}
                                                onChange={handleInputChange('incrementCycle')}
                                                label="Increment Cycle"
                                                sx={{
                                                    borderRadius: 2,
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: '#ff6b6b',
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: '#ff6b6b',
                                                        borderWidth: 2,
                                                    }
                                                }}
                                            >
                                                <MenuItem value="Annual">Annual</MenuItem>
                                                <MenuItem value="Mid-Year">Mid-Year</MenuItem>
                                                <MenuItem value="Q1">Q1</MenuItem>
                                                <MenuItem value="Q2">Q2</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Effective From"
                                            type="date"
                                            value={employeeData.effectiveDate}
                                            onChange={handleInputChange('effectiveDate')}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            sx={{
                                                borderRadius: 2,
                                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: '#ff6b6b' },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: '#ff6b6b', borderWidth: 2 }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Typography variant="h6" mt={4} mb={2} sx={{
                                    color: '#2c3e50',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <TrendingUp sx={{ color: '#ff6b6b', fontSize: 20 }} />
                                    Proposed New Compensation
                                    {salaryLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                                </Typography>

                                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Component</TableCell>
                                                <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Current Amount (₹)</TableCell>
                                                <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Proposed Amount (₹)</TableCell>
                                                <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Increase %</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {proposedCompensation.length > 0 ? (
                                                proposedCompensation.map((row, index) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{
                                                            '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                                                            '&:hover': { backgroundColor: '#e3f2fd' }
                                                        }}
                                                    >
                                                        <TableCell sx={{ fontWeight: 500 }}>{row.component}</TableCell>
                                                        <TableCell sx={{ color: '#d32f2f', fontWeight: 600 }}>{row.current}</TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                size="small"
                                                                value={row.proposed}
                                                                onChange={(e) => handleProposedAmountChange(index, e.target.value)}
                                                                sx={{
                                                                    width: 120,
                                                                    "& .MuiOutlinedInput-root": {
                                                                        borderRadius: 1,
                                                                        "&:hover fieldset": {
                                                                            borderColor: '#667eea',
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={row.increase}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#e8f5e8',
                                                                    color: '#2e7d32',
                                                                    fontWeight: 600,
                                                                    minWidth: 80
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                        <Typography color="text.secondary">
                                                            No salary data available
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {proposedCompensation.length > 0 && (
                                                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                                    <TableCell sx={{ fontWeight: 700, color: '#1565c0' }}>Total CTC</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#d32f2f' }}>{totalCurrentCTC}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#2e7d32' }}>{totalProposedCTC}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#2e7d32' }}>{totalIncrease}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Grid container spacing={3} mt={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: '#2c3e50' }}>Adjustment Type</InputLabel>
                                            <Select
                                                value={employeeData.adjustmentType}
                                                onChange={handleInputChange('adjustmentType')}
                                                label="Adjustment Type"
                                                sx={{
                                                    borderRadius: 2,
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: '#667eea',
                                                    }
                                                }}
                                            >
                                                <MenuItem value="Percentage Increase">Percentage Increase</MenuItem>
                                                <MenuItem value="Fixed Amount">Fixed Amount</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Adjustment Value"
                                            value={employeeData.adjustmentValue}
                                            onChange={handleInputChange('adjustmentValue')}
                                            size="small"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            }}
                                            sx={{
                                                borderRadius: 2,
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: '#667eea',
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={3} mt={1}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: '#2c3e50' }}>New Designation (if any)</InputLabel>
                                            <Select
                                                value={employeeData.newDesignation || ''}
                                                onChange={handleInputChange('newDesignation')}
                                                label="New Designation (if any)"
                                                sx={{
                                                    borderRadius: 2,
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: '#667eea',
                                                    },
                                                }}
                                            >
                                                {/* Optional placeholder */}
                                                <MenuItem value="">
                                                    <em>Same as current designation</em>
                                                </MenuItem>

                                                {designationData.length > 0 ? (
                                                    designationData
                                                        .filter((d) => d.active === "Active") // ✅ only active designations
                                                        .map((designation) => (
                                                            <MenuItem
                                                                key={designation.id}
                                                                value={designation.designationName}
                                                            >
                                                                {designation.designationName}
                                                            </MenuItem>
                                                        ))
                                                ) : (
                                                    <MenuItem disabled>No designations available</MenuItem>
                                                )}
                                            </Select>
                                            <FormHelperText>
                                                Current: {selectedEmployee?.designation || 'Not specified'}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: '#2c3e50' }}>New Grade (if any)</InputLabel>
                                            <Select
                                                value={employeeData.newGrade || ""}
                                                onChange={handleInputChange('newGrade')}
                                                label="New Grade (if any)"
                                                sx={{
                                                    borderRadius: 2,
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: '#667eea',
                                                    },
                                                }}
                                            >
                                                {/* Pre-select current grade as default option */}
                                                <MenuItem value={selectedEmployee?.grade || ""}>
                                                    {selectedEmployee?.grade ? `${selectedEmployee.grade}` : 'Same as current'}
                                                </MenuItem>

                                                {/* Other grade options */}
                                                <MenuItem value="A GRADE">A GRADE</MenuItem>
                                                <MenuItem value="B GRADE">B GRADE</MenuItem>
                                                <MenuItem value="C GRADE">C GRADE</MenuItem>
                                                <MenuItem value="D GRADE">D GRADE</MenuItem>
                                            </Select>

                                            <FormHelperText>
                                                Current Grade: {selectedEmployee?.grade || 'Not specified'}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <TextField
                                    fullWidth
                                    label="Justification / Remarks"
                                    multiline
                                    rows={4}
                                    value={employeeData.justification}
                                    onChange={handleInputChange('justification')}
                                    placeholder="Enter detailed justification for the increment..."
                                    sx={{
                                        mt: 3,
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "&:hover fieldset": {
                                                borderColor: '#667eea',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: '#667eea',
                                                borderWidth: 2,
                                            }
                                        }
                                    }}
                                    size="small"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Increment Approval Workflow - Only show when employee is selected */}
                {selectedEmployee && (
                    <Grid item xs={12}>
                        <Card elevation={4} sx={{
                            borderRadius: 3,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            border: '1px solid #e0e0e0'
                        }}>
                            <CardHeader
                                title="Increment Approval Workflow"
                                sx={{
                                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    borderRadius: '12px 12px 0 0',
                                    py: 1
                                }}
                            />
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} md={3}>
                                        <Typography variant="body2" color="#666" gutterBottom sx={{ fontWeight: 600 }}>
                                            Proposed By
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                                                <Person sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            <Typography fontWeight={600} color="#2c3e50">{loginUserName}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Typography variant="body2" color="#666" gutterBottom sx={{ fontWeight: 600 }}>
                                            On
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CalendarToday sx={{ color: '#667eea', fontSize: 18 }} />
                                            <Typography fontWeight={600} color="#2c3e50">
                                                {format(new Date(), "dd-MMM-yyyy")}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: '#2c3e50' }}>Next Approval</InputLabel>
                                            <Select
                                                value={employeeData.nextApproval || ''}
                                                onChange={handleInputChange('nextApproval')}
                                                label="Next Approval"
                                                sx={{
                                                    borderRadius: 2,
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: '#667eea',
                                                    },
                                                }}
                                            >
                                                {allReportingPersonList.length > 0 ? (
                                                    allReportingPersonList.map((person) => (
                                                        <MenuItem key={person.code} value={person.code}>
                                                            {person.label}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>No approvers available</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* status chip */}
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: '#2c3e50' }}>Status</InputLabel>
                                            <Select
                                                value={employeeData.status}
                                                onChange={handleInputChange('status')}
                                                disabled
                                                label="Status"
                                                sx={{
                                                    borderRadius: 2,
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: '#667eea',
                                                    }
                                                }}
                                            >
                                                <MenuItem value="Draft">
                                                    <Chip label="Draft" size="small" sx={{ backgroundColor: '#fff3e0', color: '#e65100' }} />
                                                </MenuItem>
                                                <MenuItem value="Pending Approval">
                                                    <Chip label="Pending" size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1565c0' }} />
                                                </MenuItem>
                                                <MenuItem value="Approved">
                                                    <Chip label="Approved" size="small" sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} />
                                                </MenuItem>
                                                <MenuItem value="Rejected">
                                                    <Chip label="Rejected" size="small" sx={{ backgroundColor: '#ffebee', color: '#c62828' }} />
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Increment History - Only show when employee is selected */}
                {selectedEmployee && (
                    <Grid item xs={12}>
                        <Card elevation={4} sx={{
                            borderRadius: 3,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            border: '1px solid #e0e0e0'
                        }}>
                            <CardHeader
                                title="Increment History"
                                sx={{
                                    background: 'linear-gradient(45deg, #11998e 0%, #38ef7d 100%)',
                                    color: 'white',
                                    borderRadius: '12px 12px 0 0',
                                    py: 1
                                }}
                            />
                            <CardContent sx={{ p: 3 }}>
                                {historyLoading ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                                        <CircularProgress />
                                        <Typography variant="body1" sx={{ ml: 2 }}>
                                            Loading increment history...
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Year</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Effective Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Previous CTC</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>New CTC</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Increase %</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Approved By</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#34495e', color: 'white' }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {incrementHistory.length > 0 ? (
                                                    incrementHistory.map((row, index) => (
                                                        <TableRow
                                                            key={row.id}
                                                            hover
                                                            sx={{
                                                                '&:hover': { backgroundColor: '#f5f5f5' },
                                                                '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                                                            }}
                                                        >
                                                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>{row.year}</TableCell>
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <CalendarToday sx={{ color: '#667eea', fontSize: 16 }} />
                                                                    {row.effectiveDate}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#d32f2f', fontWeight: 600 }}>{row.previousCTC}</TableCell>
                                                            <TableCell sx={{ color: '#2e7d32', fontWeight: 600 }}>{row.newCTC}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={row.increase}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: '#e8f5e8',
                                                                        color: '#2e7d32',
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#667eea', fontSize: 12 }}>
                                                                        {row.approvedBy.split(' ').map(n => n[0]).join('')}
                                                                    </Avatar>
                                                                    {row.approvedBy}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getStatusChip(row.status)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                            <Typography variant="body1" color="text.secondary">
                                                                No increment history found for this employee
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Action Buttons - Only show when employee is selected */}
            {selectedEmployee && (
                <Box display="flex" justifyContent="flex-end" gap={2} mt={4} p={3} sx={{ backgroundColor: '#f8f9fa', borderRadius: 3 }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleCancel}
                        disabled={submitting}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 600,
                            borderColor: '#95a5a6',
                            color: '#7f8c8d',
                            '&:hover': {
                                borderColor: '#7f8c8d',
                                backgroundColor: '#ecf0f1'
                            }
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedEmployee}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #27ae60 0%, #2ecc71 100%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #229954 0%, #27ae60 100%)',
                                boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)'
                            }
                        }}
                    >
                        {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit for Approval'}
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default IncrementManagement;