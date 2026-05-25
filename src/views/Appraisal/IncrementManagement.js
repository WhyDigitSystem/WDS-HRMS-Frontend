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
    const [salaryHeadsType, setSalaryHeadsType] = useState([]);
    const [pfHead, setPfHead] = useState(null);
    const [esiHead, setEsiHead] = useState(null);

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
        getSalaryHeadsDetails();
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

    const getSalaryHeadsDetails = async () => {
        try {
            const response = await apiCalls('get', `employeemaster/getAllSalaryHeadsByOrgId?orgId=${orgId}`);
            if (response.status === true) {
                const heads = response.paramObjectsMap.salaryHeadsVO;
                setSalaryHeadsType(heads);

                const pf = heads.find((head) => head.code.toLowerCase() === 'pf' && head.type === 'DEDUCTION');
                const esi = heads.find((head) => head.code.toLowerCase() === 'esi' && head.type === 'DEDUCTION');

                setPfHead(pf);
                setEsiHead(esi);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const handleAddRow = () => {
        setProposedCompensation(prev => [
            ...prev,
            { component: '', componentCode: '', current: 0, proposed: 0, increase: '0%', isNew: true },
        ]);
    };

    const handleComponentChange = (index, newValue) => {
        setProposedCompensation(prev => {
            const updated = [...prev];
            updated[index].component = newValue ? newValue.heading : '';
            updated[index].componentCode = newValue ? newValue.code : '';
            return updated;
        });
    };

    const handleCurrentAmountChange = (index, value) => {
        // Allow only whole numbers (no decimals)
        const numericValue = value.replace(/\D/g, ''); // remove non-numeric characters

        setProposedCompensation(prev => {
            const updated = [...prev];
            const currentValue = Number(numericValue) || 0;

            updated[index].current = currentValue;

            // Auto-calculate proposed based on employeeData.adjustmentValue
            const adjustmentPercentage = parseFloat(employeeData.adjustmentValue) || 0;
            const increaseFactor = 1 + (adjustmentPercentage / 100);
            const proposedValue = Math.round(currentValue * increaseFactor);

            updated[index].proposed = proposedValue;
            updated[index].increase = `${adjustmentPercentage.toFixed(2)}%`;

            return updated;
        });
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
            reportingTo: selectedReportingPerson?.label || '', // This might be the reporting chain
            reportingPerson: selectedReportingPerson?.label || '', // Add this field for reporting person name
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
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 14px 30px rgba(15, 23, 42, 0.12)'
                            }
                        }}
                    >
                        {/* HEADER */}
                        <CardHeader
                            title="Employee Selection & Current Details"
                            sx={{
                                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                color: '#fff',
                                py: 1.2,
                                '& .MuiCardHeader-title': {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    letterSpacing: '0.3px',
                                    color: '#ffffff'
                                }
                            }}
                        />

                        <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                            <Stack spacing={2.2} sx={{ height: '100%' }}>

                                {/* SECTION TITLE */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#2a4b4d',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        borderLeft: '4px solid #3a6b6d',
                                        pl: 1.5
                                    }}
                                >
                                    Select Employee
                                </Typography>

                                {/* AUTOCOMPLETE */}
                                <Autocomplete
                                    options={employees}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={selectedEmployee}
                                    onChange={handleEmployeeSelect}
                                    size="small"
                                    loading={loading}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Employee Name"
                                            placeholder="Search employee..."
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search sx={{ color: '#3a6b6d' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <>
                                                        {loading && <CircularProgress size={18} />}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    height: 44,
                                                    '& fieldset': {
                                                        borderColor: 'rgba(148,163,184,0.4)'
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#3a6b6d'
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#3a6b6d',
                                                        borderWidth: 1.5
                                                    }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#3a6b6d'
                                                }
                                            }}
                                        />
                                    )}
                                />

                                <Divider sx={{ borderColor: 'rgba(148,163,184,0.25)' }} />

                                {/* SUB TITLE */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#2a4b4d',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    Current Compensation
                                    {salaryLoading && <CircularProgress size={14} />}
                                </Typography>

                                {/* TABLE */}
                                <TableContainer
                                    component={Paper}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: '1px solid rgba(148,163,184,0.25)',
                                        flexGrow: 1,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                                        color: '#fff',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Component
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                                        color: '#fff',
                                                        fontWeight: 600
                                                    }}
                                                >
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
                                                            '&:nth-of-type(even)': {
                                                                backgroundColor: '#f8fafc'
                                                            },
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(58,107,109,0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <TableCell sx={{ fontWeight: 500, color: '#334155' }}>
                                                            {row.component}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 600, color: '#1b5e20' }}>
                                                            {row.amount}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                                        <Typography color="text.secondary">
                                                            {selectedEmployee
                                                                ? 'No salary data found'
                                                                : 'Select an employee to view details'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {currentCompensation.length > 0 && (
                                                <TableRow
                                                    sx={{
                                                        background: 'rgba(58,107,109,0.08)'
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: 700, color: '#2a4b4d' }}>
                                                        Current CTC
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#2a4b4d' }}>
                                                        {totalCurrentCTC}
                                                    </TableCell>
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
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid rgba(148, 163, 184, 0.3)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.12)'
                                }
                            }}
                        >
                            {/* HEADER */}
                            <CardHeader
                                title="Employee Quick View"
                                sx={{
                                    background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                    color: '#fff',
                                    textAlign: 'center',
                                    py: 1.2,
                                    '& .MuiCardHeader-title': {
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        letterSpacing: '0.3px',
                                        color: '#ffffff'
                                    }
                                }}
                            />

                            <CardContent sx={{ p: 3, flexGrow: 1 }}>

                                {/* AVATAR */}
                                <Avatar
                                    sx={{
                                        width: 92,
                                        height: 92,
                                        mx: 'auto',
                                        mb: 3,
                                        bgcolor: '#3a6b6d',
                                        border: '3px solid #2a4b4d',
                                        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)',
                                        fontSize: 28,
                                        fontWeight: 600
                                    }}
                                    src={selectedEmployee.profileImage || ''}
                                >
                                    {!selectedEmployee.profileImage && <Person sx={{ fontSize: 44 }} />}
                                </Avatar>

                                {/* DETAILS */}
                                <Stack spacing={1.5}>
                                    {employeeDetails.map((detail, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                py: 1,
                                                px: 1,
                                                borderRadius: 1.5,
                                                borderBottom: '1px solid rgba(148,163,184,0.25)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(58,107,109,0.06)'
                                                }
                                            }}
                                        >
                                            {/* LABEL */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ color: '#3a6b6d' }}>{detail.icon}</Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#334155'
                                                    }}
                                                >
                                                    {detail.label}
                                                </Typography>
                                            </Box>

                                            {/* VALUE */}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 500,
                                                    color: '#1e293b'
                                                }}
                                            >
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
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                transition: 'all 0.25s ease-in-out',
                                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
                                overflow: 'hidden',

                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 25px rgba(42, 75, 77, 0.15)',
                                    borderColor: '#3a6b6d'
                                }
                            }}
                        >
                            <CardHeader
                                title="Increment Proposal Details"
                                sx={{
                                    background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                    color: '#ffffff',
                                    borderRadius: '12px 12px 0 0',
                                    py: 1.2,
                                    '& .MuiCardHeader-title': {
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        letterSpacing: '0.3px',
                                        color: '#ffffff'
                                    }
                                }}
                            />
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={3}>

                                    {/* Increment Cycle */}
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Increment Cycle</InputLabel>
                                            <Select
                                                value={employeeData.incrementCycle}
                                                onChange={handleInputChange('incrementCycle')}
                                                label="Increment Cycle"
                                                sx={{
                                                    borderRadius: 2,
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#e2e8f0'
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#3a6b6d'
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#3a6b6d',
                                                        borderWidth: 2
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

                                    {/* Effective Date */}
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
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '& fieldset': { borderColor: '#e2e8f0' },
                                                    '&:hover fieldset': { borderColor: '#3a6b6d' },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#3a6b6d',
                                                        borderWidth: 2
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>

                                    {/* Header */}
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                mt: 2,
                                                mb: 1,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    color: '#2a4b4d'
                                                }}
                                            >
                                                Proposed New Compensation
                                                {salaryLoading && <CircularProgress size={16} />}
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                onClick={handleAddRow}
                                                sx={{
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #2a4b4d 0%, #1f3638 100%)'
                                                    }
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Box>
                                    </Grid>

                                    {/* Table */}
                                    <Grid item xs={12}>
                                        <TableContainer
                                            component={Paper}
                                            sx={{
                                                borderRadius: 3,
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 14px rgba(15,23,42,0.06)'
                                            }}
                                        >
                                            <Table size="small">

                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                                                        {['Component', 'Current (₹)', 'Proposed (₹)', 'Increase %'].map((h) => (
                                                            <TableCell
                                                                key={h}
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    color: '#2a4b4d'
                                                                }}
                                                            >
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {proposedCompensation.length > 0 ? (
                                                        proposedCompensation.map((row, index) => (
                                                            <TableRow
                                                                key={index}
                                                                sx={{
                                                                    '&:hover': { backgroundColor: '#f8fafc' }
                                                                }}
                                                            >

                                                                {/* Component */}
                                                                <TableCell sx={{ fontWeight: 500 }}>
                                                                    {row.isNew ? (
                                                                        <Autocomplete
                                                                            size="small"
                                                                            value={salaryHeadsType.find(opt => opt.heading === row.component) || null}
                                                                            onChange={(e, v) => handleComponentChange(index, v)}
                                                                            options={salaryHeadsType.filter(opt =>
                                                                                opt.type === 'EARNING' &&
                                                                                !proposedCompensation.some(r => r.component === opt.heading)
                                                                            )}
                                                                            getOptionLabel={(o) => o.heading || ''}
                                                                            renderInput={(params) => (
                                                                                <TextField {...params} label="Component" />
                                                                            )}
                                                                        />
                                                                    ) : row.component}
                                                                </TableCell>

                                                                {/* Current */}
                                                                <TableCell sx={{ color: '#dc2626', fontWeight: 600 }}>
                                                                    {row.isNew ? (
                                                                        <TextField
                                                                            size="small"
                                                                            value={row.current}
                                                                            onChange={(e) => handleCurrentAmountChange(index, e.target.value)}
                                                                            sx={{
                                                                                width: 120,
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    borderRadius: 2
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : row.current}
                                                                </TableCell>

                                                                {/* Proposed */}
                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        value={row.proposed}
                                                                        onChange={(e) => handleProposedAmountChange(index, e.target.value)}
                                                                        sx={{ width: 120 }}
                                                                    />
                                                                </TableCell>

                                                                {/* Increase */}
                                                                <TableCell>
                                                                    <Chip
                                                                        label={row.increase}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: '#e6f4ea',
                                                                            color: '#1e7e34',
                                                                            fontWeight: 600
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} align="center">
                                                                No salary data available
                                                            </TableCell>
                                                        </TableRow>
                                                    )}

                                                    {/* Total */}
                                                    {proposedCompensation.length > 0 && (
                                                        <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                                                            <TableCell sx={{ fontWeight: 700 }}>Total CTC</TableCell>
                                                            <TableCell sx={{ fontWeight: 700, color: '#dc2626' }}>
                                                                {totalCurrentCTC}
                                                            </TableCell>
                                                            <TableCell sx={{ fontWeight: 700, color: '#1e7e34' }}>
                                                                {totalProposedCTC}
                                                            </TableCell>
                                                            <TableCell sx={{ fontWeight: 700 }}>
                                                                {totalIncrease}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}

                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    {/* Bottom Fields */}
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Adjustment Type</InputLabel>
                                            <Select
                                                value={employeeData.adjustmentType}
                                                onChange={handleInputChange('adjustmentType')}
                                                label="Adjustment Type"
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3a6b6d' },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#3a6b6d'
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
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}
                                        />
                                    </Grid>

                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Increment Approval Workflow - Only show when employee is selected */}
                {selectedEmployee && (
                    <Grid item xs={12}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid rgba(58, 107, 109, 0.15)',
                                background: '#ffffff',
                                boxShadow: '0 2px 10px rgba(42, 75, 77, 0.06)',
                                transition: 'all 0.25s ease-in-out',
                                overflow: 'hidden',

                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 28px rgba(42, 75, 77, 0.18)',
                                    borderColor: '#3a6b6d'
                                }
                            }}
                        >

                            {/* HEADER */}
                            <CardHeader
                                title="Increment Approval Workflow"
                                sx={{
                                    background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                    color: '#ffffff',
                                    py: 1,
                                    '& .MuiCardHeader-title': {
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        letterSpacing: '0.3px',
                                        color: '#ffffff'
                                    }
                                }}
                            />

                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={3} alignItems="center">

                                    {/* Proposed By */}
                                    <Grid item xs={12} md={3}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                                            Proposed By
                                        </Typography>

                                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#3a6b6d' }}>
                                                <Person sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            <Typography fontWeight={600} color="#2a4b4d">
                                                {loginUserName}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Date */}
                                    <Grid item xs={12} md={3}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                                            On
                                        </Typography>

                                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                                            <CalendarToday sx={{ color: '#3a6b6d', fontSize: 18 }} />
                                            <Typography fontWeight={600} color="#2a4b4d">
                                                {format(new Date(), 'dd-MMM-yyyy')}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Next Approval */}
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Next Approval</InputLabel>
                                            <Select
                                                value={employeeData.nextApproval || ''}
                                                onChange={handleInputChange('nextApproval')}
                                                label="Next Approval"
                                                sx={{
                                                    borderRadius: 2,
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'rgba(58, 107, 109, 0.2)'
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#3a6b6d'
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#3a6b6d',
                                                        borderWidth: 2
                                                    }
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

                                    {/* Status */}
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={employeeData.status}
                                                disabled
                                                label="Status"
                                                sx={{
                                                    borderRadius: 2,
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'rgba(58, 107, 109, 0.2)'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="Draft">
                                                    <Chip
                                                        label="Draft"
                                                        size="small"
                                                        sx={{ backgroundColor: '#f1f5f9', color: '#2a4b4d' }}
                                                    />
                                                </MenuItem>

                                                <MenuItem value="Pending Approval">
                                                    <Chip
                                                        label="Pending"
                                                        size="small"
                                                        sx={{ backgroundColor: '#fff7ed', color: '#9a3412' }}
                                                    />
                                                </MenuItem>

                                                <MenuItem value="Approved">
                                                    <Chip
                                                        label="Approved"
                                                        size="small"
                                                        sx={{ backgroundColor: '#e6f4ea', color: '#1e7e34' }}
                                                    />
                                                </MenuItem>

                                                <MenuItem value="Rejected">
                                                    <Chip
                                                        label="Rejected"
                                                        size="small"
                                                        sx={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}
                                                    />
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
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid rgba(58, 107, 109, 0.15)',
                                background: '#ffffff',
                                boxShadow: '0 2px 10px rgba(42, 75, 77, 0.06)',
                                transition: 'all 0.25s ease-in-out',
                                overflow: 'hidden',

                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 28px rgba(42, 75, 77, 0.18)',
                                    borderColor: '#3a6b6d'
                                }
                            }}
                        >

                            {/* HEADER */}
                            <CardHeader
                                title="Increment History"
                                sx={{
                                    background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                    color: '#ffffff',
                                    py: 1,
                                    '& .MuiCardHeader-title': {
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        letterSpacing: '0.3px',
                                        color: '#ffffff'
                                    }
                                }}
                            />

                            <CardContent sx={{ p: 3 }}>

                                {/* Loading */}
                                {historyLoading ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" py={4} gap={1}>
                                        <CircularProgress size={20} sx={{ color: '#3a6b6d' }} />
                                        <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
                                            Loading increment history...
                                        </Typography>
                                    </Box>
                                ) : (

                                    <TableContainer
                                        component={Paper}
                                        sx={{
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                    >

                                        <Table size="small">

                                            {/* HEADER */}
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                                                    {[
                                                        'Year',
                                                        'Effective Date',
                                                        'Previous CTC',
                                                        'New CTC',
                                                        'Increase %',
                                                        'Approved By',
                                                        'Status'
                                                    ].map((h) => (
                                                        <TableCell
                                                            key={h}
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: '#2a4b4d'
                                                            }}
                                                        >
                                                            {h}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {incrementHistory.length > 0 ? (
                                                    incrementHistory.map((row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            sx={{
                                                                '&:hover': { backgroundColor: '#f8fafc' }
                                                            }}
                                                        >

                                                            {/* Year */}
                                                            <TableCell sx={{ fontWeight: 600, color: '#2a4b4d' }}>
                                                                {row.year}
                                                            </TableCell>

                                                            {/* Date */}
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <CalendarToday sx={{ color: '#3a6b6d', fontSize: 16 }} />
                                                                    <Typography>{row.effectiveDate}</Typography>
                                                                </Box>
                                                            </TableCell>

                                                            {/* Previous */}
                                                            <TableCell sx={{ color: '#dc2626', fontWeight: 600 }}>
                                                                {row.previousCTC}
                                                            </TableCell>

                                                            {/* New */}
                                                            <TableCell sx={{ color: '#1e7e34', fontWeight: 600 }}>
                                                                {row.newCTC}
                                                            </TableCell>

                                                            {/* Increase */}
                                                            <TableCell>
                                                                <Chip
                                                                    label={row.increase}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: '#e6f4ea',
                                                                        color: '#1e7e34',
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            </TableCell>

                                                            {/* Approved By */}
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        sx={{
                                                                            width: 24,
                                                                            height: 24,
                                                                            bgcolor: '#3a6b6d',
                                                                            fontSize: 12
                                                                        }}
                                                                    >
                                                                        {row.approvedBy
                                                                            ?.split(' ')
                                                                            .map((n) => n[0])
                                                                            .join('')}
                                                                    </Avatar>

                                                                    <Typography>{row.approvedBy}</Typography>
                                                                </Box>
                                                            </TableCell>

                                                            {/* Status */}
                                                            <TableCell>
                                                                {getStatusChip(row.status)}
                                                            </TableCell>

                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                            <Typography sx={{ color: '#64748b' }}>
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
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    gap={2}
                    mt={4}
                    p={3}
                    sx={{
                        backgroundColor: '#f8fafc',
                        borderRadius: 3,
                        border: '1px solid rgba(58, 107, 109, 0.1)'
                    }}
                >

                    {/* CLEAR BUTTON */}
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleCancel}
                        disabled={submitting}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 600,
                            borderColor: 'rgba(58, 107, 109, 0.4)',
                            color: '#2a4b4d',
                            '&:hover': {
                                borderColor: '#3a6b6d',
                                backgroundColor: 'rgba(58, 107, 109, 0.08)'
                            }
                        }}
                    >
                        Clear
                    </Button>

                    {/* SUBMIT BUTTON */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedEmployee}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2a4b4d 0%, #1f3638 100%)',
                                boxShadow: '0 6px 16px rgba(42, 75, 77, 0.25)'
                            }
                        }}
                    >
                        {submitting ? (
                            <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                        ) : (
                            'Submit for Approval'
                        )}
                    </Button>

                </Box>
            )}
        </Container>
    );
};

export default IncrementManagement;