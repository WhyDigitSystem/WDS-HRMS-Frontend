import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Checkbox,
    Avatar,
    Autocomplete,
    TextField,
    Divider,
    CircularProgress,
    Button,
    Paper,
    Stack,
    Grid,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    FormControlLabel,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha
} from '@mui/material';
import {
    Person as PersonIcon,
    Groups as TeamIcon,
    TaskAlt as CompletedIcon,
    Info as InfoIcon,
    Save as SaveIcon,
    BusinessCenter as BusinessIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Category as CategoryIcon,
    Computer as ComputerIcon,
    AssignmentReturn as ReturnIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

const ClearanceManagement = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [clearanceItems, setClearanceItems] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [existingClearanceItems, setExistingClearanceItems] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [activeTab, setActiveTab] = useState(0);
    const [assetAllocationDetails, setAssetAllocationDetails] = useState([]);
    const [assetReturnDetails, setAssetReturnDetails] = useState([]);
    const [assetLoading, setAssetLoading] = useState(false);
    const [assetReturnLoading, setAssetReturnLoading] = useState(false);

    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [loginEmployeeCode] = useState(localStorage.getItem('employeeCode'));
    const [department] = useState(localStorage.getItem('department'));
    const [separationDetails, setSeparationDetails] = useState([]);
    const loginUserDesignation = localStorage.getItem("designation");

    const isSeparationRole = separationDetails
        .map(d => d.toUpperCase())
        .includes(loginUserDesignation?.trim().toUpperCase());

    useEffect(() => {
        if (separationDetails.length > 0) {
            fetchEmployees();
        }
    }, [separationDetails]);

    useEffect(() => {
        getCompanyDetails();
    }, [orgId]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const empCodePayload = isSeparationRole ? "ALL" : loginEmployeeCode;

            const response = await apiCalls(
                'get',
                `/employeseparation/getInitiateSeparationByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap && response.paramObjectsMap.initiateSeparationVO) {
                const employeeList = response.paramObjectsMap.initiateSeparationVO.map((emp) => ({
                    id: emp.id,
                    employeeCode: emp.employeeCode,
                    employeeName: emp.employeeName,
                    department: emp.department,
                    position: emp.position,
                    reportingManager: emp.reportingPerson,
                    joiningDate: emp.joiningDate,
                    separationType: emp.separationType,
                    name: `${emp.employeeName} (${emp.employeeCode})`,
                    clearanceItems: emp.clearanceManagementVO || [],
                    originalData: emp
                }));

                setEmployees(employeeList);
            } else {
                console.error('No data found in response');
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
            showSnackbar('Error fetching employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getCompanyDetails = async () => {
        try {
            const response = await apiCalls('get', `commonmaster/company/${orgId}`);

            if (response.status === true) {
                const company = response.paramObjectsMap.companyVO[0];
                const separationList = company.separation
                    ? company.separation.split(',').map(d => d.trim())
                    : [];
                setSeparationDetails(separationList);
            }
        } catch (error) {
            console.error('Error fetching company:', error);
        }
    };

    const fetchAssetAllocationDetails = async (employeeCode, departmentName) => {
        setAssetLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/employeseparation/getAssetAllocationDetailsForClearance?branchCode=${branchCode}&department=${encodeURIComponent(departmentName)}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap && response.paramObjectsMap.assetAllocation) {
                setAssetAllocationDetails(response.paramObjectsMap.assetAllocation);
            } else {
                setAssetAllocationDetails([]);
            }
        } catch (error) {
            console.error('Error fetching asset allocation details:', error);
            setAssetAllocationDetails([]);
            showSnackbar('Error fetching asset allocation details', 'error');
        } finally {
            setAssetLoading(false);
        }
    };

    const fetchAssetReturnDetails = async (employeeCode, departmentName) => {
        setAssetReturnLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/employeseparation/getAssetReturnDetailsForClearance?branchCode=${branchCode}&department=${encodeURIComponent(departmentName)}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap && response.paramObjectsMap.assetReset) {
                setAssetReturnDetails(response.paramObjectsMap.assetReset);
            } else {
                setAssetReturnDetails([]);
            }
        } catch (error) {
            console.error('Error fetching asset return details:', error);
            setAssetReturnDetails([]);
            showSnackbar('Error fetching asset return details', 'error');
        } finally {
            setAssetReturnLoading(false);
        }
    };

    const fetchClearanceItemsByEmployee = async (employeeCode, departmentName, employeeClearanceItems = []) => {
        setQuestionsLoading(true);

        try {
            const res = await apiCalls(
                'get',
                `/employeseparation/getAccessoriesByEmployeeCode?branchCode=${branchCode}&department=${encodeURIComponent(departmentName)}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (res.status) {
                const assets = res.paramObjectsMap.assetAllocationVO || [];

                const formattedItems = assets.map((item, index) => ({
                    id: index + 1,
                    name: item.assetName,
                    department: departmentName,
                    assignedTo: item.employeeName,
                    completed: false
                }));

                if (employeeClearanceItems?.length > 0) {
                    const updatedItems = formattedItems.map(item => ({
                        ...item,
                        completed: employeeClearanceItems.some(eci =>
                            eci.clearanceItem?.toLowerCase() === item.name?.toLowerCase()
                        )
                    }));

                    setClearanceItems(updatedItems);
                    setExistingClearanceItems(updatedItems);
                } else {
                    setClearanceItems(formattedItems);
                    setExistingClearanceItems(formattedItems);
                }

            } else {
                setClearanceItems([]);
                setExistingClearanceItems([]);
            }

        } catch (err) {
            console.error("Error fetching assets:", err);
            setClearanceItems([]);
            showSnackbar('Error fetching asset clearance', 'error');
        } finally {
            setQuestionsLoading(false);
        }
    };

    const handleEmployeeSelect = useCallback(async (event, newValue) => {
        setSelectedEmployee(newValue);

        if (newValue) {
            const employeeDepartment = newValue.department;
            setSelectedDepartment(employeeDepartment);

            await fetchClearanceItemsByEmployee(
                newValue.employeeCode,
                newValue.department,
                newValue.clearanceItems || []
            );

            await Promise.all([
                fetchAssetAllocationDetails(newValue.employeeCode, newValue.department),
                fetchAssetReturnDetails(newValue.employeeCode, newValue.department)
            ]);
        } else {
            setSelectedDepartment('');
            setClearanceItems([]);
            setExistingClearanceItems([]);
            setAssetAllocationDetails([]);
            setAssetReturnDetails([]);
        }
    }, []);

    const handleCheckboxChange = useCallback((itemId) => {
        setClearanceItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId
                    ? { ...item, completed: !item.completed }
                    : item
            )
        );
    }, []);

    const handleSave = async () => {
        if (!selectedEmployee) return;

        setSaving(true);

        try {
            const oldItems = (selectedEmployee.clearanceItems || []).map(item => ({
                id: item.id,
                clearanceItem: item.clearanceItem,
                screenCode: item.screenCode || "CM",
                screenName: item.screenName || "CLEARANCE MANAGEMENT"
            }));

            const newItems = clearanceItems
                .filter(item => item.completed)
                .map(item => ({
                    id: item.id || 0,
                    clearanceItem: item.name,
                    screenCode: "CM",
                    screenName: "CLEARANCE MANAGEMENT"
                }));

            const mergedItemsMap = {};

            oldItems.forEach(item => {
                mergedItemsMap[item.clearanceItem.toLowerCase()] = item;
            });

            newItems.forEach(item => {
                mergedItemsMap[item.clearanceItem.toLowerCase()] = item;
            });

            const finalClearanceManagementDTO = Object.values(mergedItemsMap);

            const payload = {
                id: selectedEmployee.id,
                branch: branch || "",
                branchCode: branchCode,
                clearanceManagementDTO: finalClearanceManagementDTO,
                createdBy: loginUserName,
                department: selectedEmployee.department,
                detailedReason: selectedEmployee.originalData?.detailedReason || "",
                employeeCode: selectedEmployee.employeeCode,
                employeeName: selectedEmployee.employeeName,
                exitInterviewFeedback: selectedEmployee.originalData?.exitInterviewFeedback || "",
                experienceRating: selectedEmployee.originalData?.experienceRating || 0,
                interviewDate: selectedEmployee.originalData?.interviewDate || new Date().toISOString().split('T')[0],
                joiningDate: selectedEmployee.joiningDate,
                lastWorkingDate: selectedEmployee.originalData?.lastWorkingDate || "",
                noticeDate: selectedEmployee.originalData?.noticeDate || 0,
                orgId: parseInt(orgId),
                position: selectedEmployee.position,
                status: selectedEmployee.originalData?.status || 'PENDING',
                reasonCategory: selectedEmployee.originalData?.reasonCategory || "",
                rehireEligible: selectedEmployee.originalData?.rehireEligible || "Yes",
                reportingManager: selectedEmployee.reportingManager,
                reportingPerson: [],
                reportingPersonCode: [],
                reportingPersonEmail: [],
                resignation: selectedEmployee.originalData?.resignation || "",
                separationType: selectedEmployee.separationType,
                updatedBy: loginUserName
            };

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                showSnackbar('Clearance status updated successfully!', 'success');
                setExistingClearanceItems([...clearanceItems]);
                fetchEmployees();
            } else {
                showSnackbar(response.message || 'Failed to update clearance status', 'error');
            }

        } catch (err) {
            console.error(err);
            showSnackbar('Error updating clearance status', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRefresh = useCallback(() => {
        if (selectedEmployee) {
            fetchClearanceItemsByEmployee(selectedEmployee.employeeCode, selectedEmployee.department, selectedEmployee.clearanceItems || []);
            fetchAssetAllocationDetails(selectedEmployee.employeeCode, selectedEmployee.department);
            fetchAssetReturnDetails(selectedEmployee.employeeCode, selectedEmployee.department);
        }
    }, [selectedEmployee]);

    const completeAllClearance = () => {
        setClearanceItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                completed: true
            }))
        );
        showSnackbar('All items marked as completed', 'info');
    };

    const resetAllClearance = () => {
        setClearanceItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                completed: false
            }))
        );
        showSnackbar('All items reset', 'info');
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const completedCount = clearanceItems.filter(item => item.completed).length;
    const totalItems = clearanceItems.length;
    const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
    const allCompleted = totalItems > 0 && completedCount === totalItems;

    const hasUnsavedChanges = useMemo(() => {
        if (!selectedEmployee) return false;
        return clearanceItems.length !== existingClearanceItems.length ||
            clearanceItems.some(item => {
                const existingItem = existingClearanceItems.find(ei => ei.id === item.id);
                return existingItem && existingItem.completed !== item.completed;
            });
    }, [clearanceItems, existingClearanceItems, selectedEmployee]);

    const getDepartmentColor = (department) => {
        const colors = {
            'Security': '#fef3c7',
            'Manager': '#dbeafe',
            'Admin': '#dcfce7',
            'Finance': '#f3e8ff',
            'IT': '#ffe4e6',
            'HR': '#ffedd5'
        };
        return colors[department] || '#f3f4f6';
    };

    const getDepartmentTextColor = (department) => {
        const colors = {
            'Security': '#92400e',
            'Manager': '#1e40af',
            'Admin': '#166534',
            'Finance': '#7e22ce',
            'IT': '#be123c',
            'HR': '#c2410c'
        };
        return colors[department] || '#374151';
    };

    // Custom styled Tab component
    const CustomTab = ({ label, icon, ...props }) => (
        <Tab
            label={label}
            icon={icon}
            iconPosition="start"
            sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#6b7280',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                    color: '#7C3AED',
                    backgroundColor: alpha('#7C3AED', 0.08),
                    borderRadius: '12px',
                    transform: 'translateY(-2px)',
                },
                '&:hover': {
                    backgroundColor: alpha('#7C3AED', 0.05),
                    borderRadius: '12px',
                    transform: 'translateY(-1px)',
                },
                '& .MuiTab-iconWrapper': {
                    transition: 'transform 0.3s ease',
                },
                '&:hover .MuiTab-iconWrapper': {
                    transform: 'scale(1.1)',
                }
            }}
            {...props}
        />
    );

    // Stats Card Component
    const StatsCard = ({ title, value, icon, color, bgColor }) => (
        <Paper
            sx={{
                p: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "18px",

                // 🔥 Glass + Gradient
                background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, #ffffff 100%)`,
                backdropFilter: "blur(10px)",

                // 🎯 Border + Shadow
                border: `1px solid ${alpha(color, 0.15)}`,
                boxShadow: `0 6px 20px ${alpha(color, 0.15)}`,

                // ✨ Animation
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",

                "&:hover": {
                    transform: "translateY(-6px) scale(1.02)",
                    boxShadow: `0 12px 30px ${alpha(color, 0.25)}`
                },

                // 🔥 Top Accent Line
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "4px",
                    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)})`
                }
            }}
        >
            {/* LEFT CONTENT */}
            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        letterSpacing: "0.5px"
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="h4"
                    sx={{
                        color: "#111827",
                        fontWeight: 800,
                        mt: 0.5
                    }}
                >
                    {value}
                </Typography>
            </Box>

            {/* ICON */}
            <Box
                sx={{
                    height: 56,
                    width: 56,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    // 🔥 Gradient Icon Background
                    background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                    color: "#fff",

                    // Glow effect
                    boxShadow: `0 8px 20px ${alpha(color, 0.4)}`,

                    transition: "all 0.3s ease",

                    "&:hover": {
                        transform: "rotate(8deg) scale(1.1)"
                    }
                }}
            >
                {icon}
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ p: 0, maxWidth: 1200, margin: '0 auto' }}>
            <Card sx={{
                backgroundColor: '#ffffff',
                boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
                overflow: 'hidden'
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 3,
                            fontWeight: 700,
                            color: '#1f2937',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block'
                        }}
                    >
                        Clearance Management
                    </Typography>

                    {/* Employee and Department Selection */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={5}>
                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => option.name}
                                value={selectedEmployee}
                                onChange={handleEmployeeSelect}
                                loading={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Employee *"
                                        placeholder="Search employee..."
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#7C3AED',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#7C3AED',
                                                }
                                            }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            )
                                        }}
                                    />
                                )}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Department"
                                value={selectedDepartment}
                                disabled
                                size="small"
                                sx={{
                                    backgroundColor: '#f9fafb',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>

                        {selectedEmployee && (
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                                    <Chip
                                        label={selectedEmployee.clearanceItems?.length > 0 ? `${selectedEmployee.clearanceItems.length} Items Completed` : 'No Items Completed'}
                                        color={selectedEmployee.clearanceItems?.length > 0 ? "success" : "default"}
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderRadius: 2 }}
                                    />
                                    <Tooltip title="Refresh Data">
                                        <IconButton
                                            onClick={handleRefresh}
                                            size="small"
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: alpha('#7C3AED', 0.1),
                                                    transform: 'rotate(180deg)',
                                                    transition: 'transform 0.3s ease'
                                                }
                                            }}
                                        >
                                            <RefreshIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        )}
                    </Grid>

                    {/* Tabs Section */}
                    {selectedEmployee && (
                        <>
                            <Divider sx={{ my: 2 }} />

                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    mb: 4,
                                    minHeight: 48,
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#7C3AED',
                                        height: 3,
                                        borderRadius: 2
                                    }
                                }}
                            >
                                <CustomTab
                                    label="Clearance Checklist"
                                    icon={<BusinessIcon />}
                                />
                                <CustomTab
                                    label="Asset Allocation"
                                    icon={<ComputerIcon />}
                                />
                                <CustomTab
                                    label="Asset Return"
                                    icon={<ReturnIcon />}
                                />
                            </Tabs>

                            {/* Tab 0: Clearance Checklist */}
                            {activeTab === 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <BusinessIcon sx={{ color: '#7C3AED', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                                                Clearance Checklist
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                            {totalItems > 0 && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                        Progress: {completedCount}/{totalItems}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress}
                                                        sx={{
                                                            width: 120,
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: '#e5e7eb',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: '#7C3AED',
                                                                borderRadius: 3,
                                                                backgroundImage: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)'
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                            {hasUnsavedChanges && (
                                                <Chip
                                                    label="Unsaved Changes"
                                                    size="small"
                                                    color="warning"
                                                    icon={<EditIcon />}
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            )}
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={resetAllClearance}
                                                    disabled={clearanceItems.length === 0}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        borderColor: '#d1d5db',
                                                        color: '#6b7280',
                                                        '&:hover': {
                                                            borderColor: '#7C3AED',
                                                            color: '#7C3AED',
                                                            backgroundColor: alpha('#7C3AED', 0.05)
                                                        }
                                                    }}
                                                >
                                                    Reset All
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={completeAllClearance}
                                                    disabled={allCompleted || clearanceItems.length === 0}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        borderColor: '#d1d5db',
                                                        color: '#6b7280',
                                                        '&:hover': {
                                                            borderColor: '#10b981',
                                                            color: '#10b981',
                                                            backgroundColor: alpha('#10b981', 0.05)
                                                        }
                                                    }}
                                                >
                                                    Complete All
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {questionsLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                            <CircularProgress sx={{ color: '#7C3AED' }} />
                                        </Box>
                                    ) : clearanceItems.length > 0 ? (
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                maxHeight: 550,
                                                overflowY: 'auto',
                                                borderRadius: 3,
                                                borderColor: '#e5e7eb',
                                                backgroundColor: '#fafafa'
                                            }}
                                        >
                                            <Stack spacing={2.5}>
                                                {Object.entries(
                                                    clearanceItems.reduce((acc, item) => {
                                                        if (!acc[item.department]) {
                                                            acc[item.department] = [];
                                                        }
                                                        acc[item.department].push(item);
                                                        return acc;
                                                    }, {})
                                                ).map(([dept, items]) => (
                                                    <Box key={dept}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                                            <CategoryIcon sx={{ color: getDepartmentTextColor(dept), fontSize: 20 }} />
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: getDepartmentTextColor(dept) }}>
                                                                {dept} Clearance
                                                            </Typography>
                                                            <Chip
                                                                label={`${items.length} items`}
                                                                size="small"
                                                                sx={{
                                                                    ml: 1,
                                                                    backgroundColor: getDepartmentColor(dept),
                                                                    color: getDepartmentTextColor(dept),
                                                                    fontWeight: 500,
                                                                    borderRadius: 2
                                                                }}
                                                            />
                                                        </Box>
                                                        <Stack spacing={1.5}>
                                                            {items.map((item) => (
                                                                <Paper
                                                                    key={item.id}
                                                                    variant="outlined"
                                                                    sx={{
                                                                        p: 1.5,
                                                                        backgroundColor: item.completed
                                                                            ? alpha('#10b981', 0.08)
                                                                            : '#ffffff',
                                                                        borderColor: item.completed
                                                                            ? alpha('#10b981', 0.3)
                                                                            : '#e5e7eb',
                                                                        borderRadius: 2,
                                                                        transition: 'all 0.2s',
                                                                        '&:hover': {
                                                                            backgroundColor: item.completed
                                                                                ? alpha('#10b981', 0.12)
                                                                                : '#f5f5f5',
                                                                            transform: 'translateX(4px)'
                                                                        }
                                                                    }}
                                                                >
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Checkbox
                                                                                checked={item.completed}
                                                                                onChange={() => handleCheckboxChange(item.id)}
                                                                                sx={{
                                                                                    color: '#9ca3af',
                                                                                    '&.Mui-checked': {
                                                                                        color: '#10b981',
                                                                                    },
                                                                                }}
                                                                            />
                                                                        }
                                                                        label={
                                                                            <Box>
                                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                                                                                    {item.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Assigned to: {item.assignedTo}
                                                                                </Typography>
                                                                            </Box>
                                                                        }
                                                                    />
                                                                </Paper>
                                                            ))}
                                                        </Stack>
                                                        {dept !== Object.entries(
                                                            clearanceItems.reduce((acc, item) => {
                                                                if (!acc[item.department]) {
                                                                    acc[item.department] = [];
                                                                }
                                                                acc[item.department].push(item);
                                                                return acc;
                                                            }, {})
                                                        ).slice(-1)[0][0] && <Divider sx={{ my: 1 }} />}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Paper>
                                    ) : (
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 6,
                                                textAlign: 'center',
                                                backgroundColor: '#fafafa',
                                                borderRadius: 3,
                                                borderColor: '#e5e7eb'
                                            }}
                                        >
                                            <InfoIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                No clearance items found for this department
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Please contact HR to add clearance items for {selectedDepartment}
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}

                            {/* Tab 1: Asset Allocation Details */}
                            {activeTab === 1 && (
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ComputerIcon sx={{ color: '#7C3AED', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                                                Asset Allocation Details
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Refresh">
                                            <IconButton
                                                onClick={() => fetchAssetAllocationDetails(selectedEmployee.employeeCode, selectedEmployee.department)}
                                                size="small"
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: alpha('#7C3AED', 0.1),
                                                        transform: 'rotate(180deg)',
                                                        transition: 'transform 0.3s ease'
                                                    }
                                                }}
                                            >
                                                <RefreshIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    {/* Stats Cards */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={6}>
                                            <StatsCard
                                                title="Total Allocated Assets"
                                                value={assetAllocationDetails.length}
                                                icon={<ComputerIcon sx={{ fontSize: 28, color: '#fff' }} />}
                                                color="#6366F1" // Indigo
                                                bgColor="linear-gradient(135deg, #6366F1, #8B5CF6)"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <StatsCard
                                                title="Pending Return"
                                                value={assetAllocationDetails.length - assetReturnDetails.length}
                                                icon={<TrendingUpIcon sx={{ fontSize: 28, color: '#fff' }} />}
                                                color="#F59E0B" // Amber
                                                bgColor="linear-gradient(135deg, #F59E0B, #F97316)"
                                            />
                                        </Grid>
                                    </Grid>

                                    {assetLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                            <CircularProgress sx={{ color: '#7C3AED' }} />
                                        </Box>
                                    ) : assetAllocationDetails.length > 0 ? (
                                        <TableContainer
                                            component={Paper}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 3,
                                                borderColor: '#e5e7eb',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Table>
                                                <TableHead sx={{ backgroundColor: alpha('#7C3AED', 0.05) }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Employee Name</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Employee Code</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Asset Name</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {assetAllocationDetails.map((asset, index) => (
                                                        <TableRow
                                                            key={index}
                                                            hover
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: alpha('#7C3AED', 0.02)
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#7C3AED', 0.1), color: '#7C3AED' }}>
                                                                        {asset.employeeName?.charAt(0)}
                                                                    </Avatar>
                                                                    <Typography sx={{ fontWeight: 500 }}>{asset.employeeName}</Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{asset.employeeCode}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={asset.assetName}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: alpha('#7C3AED', 0.1),
                                                                        color: '#7C3AED',
                                                                        fontWeight: 500,
                                                                        borderRadius: 2
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label="Allocated"
                                                                    size="small"
                                                                    icon={<CheckCircleIcon />}
                                                                    sx={{
                                                                        backgroundColor: alpha('#7C3AED', 0.15),
                                                                        color: '#7C3AED',
                                                                        fontWeight: 600,
                                                                        borderRadius: 2
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 6,
                                                textAlign: 'center',
                                                backgroundColor: '#fafafa',
                                                borderRadius: 3,
                                                borderColor: '#e5e7eb'
                                            }}
                                        >
                                            <InfoIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                No asset allocation records found
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                This employee has no allocated assets
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}

                            {/* Tab 2: Asset Return Details */}
                            {activeTab === 2 && (
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ReturnIcon sx={{ color: '#10b981', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                                                Asset Return Details
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Refresh">
                                            <IconButton
                                                onClick={() => fetchAssetReturnDetails(selectedEmployee.employeeCode, selectedEmployee.department)}
                                                size="small"
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: alpha('#10b981', 0.1),
                                                        transform: 'rotate(180deg)',
                                                        transition: 'transform 0.3s ease'
                                                    }
                                                }}
                                            >
                                                <RefreshIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    {/* Stats Cards */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={6}>
                                            <StatsCard
                                                title="Total Returned Assets"
                                                value={assetReturnDetails.length}
                                                icon={<ReturnIcon sx={{ fontSize: 28, color: '#fff' }} />}
                                                color="#059669"
                                                bgColor="linear-gradient(135deg, #059669, #10B981)"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <StatsCard
                                                title="Return Rate"
                                                value={`${assetAllocationDetails.length > 0
                                                        ? Math.round((assetReturnDetails.length / assetAllocationDetails.length) * 100)
                                                        : 0
                                                    }%`}
                                                icon={<TrendingUpIcon sx={{ fontSize: 28, color: '#fff' }} />}
                                                color="#16A34A"
                                                bgColor="linear-gradient(135deg, #16A34A, #4ADE80)"
                                            />
                                        </Grid>
                                    </Grid>

                                    {assetReturnLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                            <CircularProgress sx={{ color: '#10b981' }} />
                                        </Box>
                                    ) : assetReturnDetails.length > 0 ? (
                                        <TableContainer
                                            component={Paper}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 3,
                                                borderColor: '#e5e7eb',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Table>
                                                <TableHead sx={{ backgroundColor: alpha('#10b981', 0.05) }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Employee Name</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Employee Code</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Asset Name</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {assetReturnDetails.map((asset, index) => (
                                                        <TableRow
                                                            key={index}
                                                            hover
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: alpha('#10b981', 0.02)
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                                                                        {asset.employeeName?.charAt(0)}
                                                                    </Avatar>
                                                                    <Typography sx={{ fontWeight: 500 }}>{asset.employeeName}</Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{asset.employeeCode}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={asset.assetName}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: alpha('#10b981', 0.1),
                                                                        color: '#10b981',
                                                                        fontWeight: 500,
                                                                        borderRadius: 2
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label="Returned"
                                                                    size="small"
                                                                    icon={<CheckCircleIcon />}
                                                                    sx={{
                                                                        backgroundColor: alpha('#10b981', 0.15),
                                                                        color: '#10b981',
                                                                        fontWeight: 600,
                                                                        borderRadius: 2
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 6,
                                                textAlign: 'center',
                                                backgroundColor: '#fafafa',
                                                borderRadius: 3,
                                                borderColor: '#e5e7eb'
                                            }}
                                        >
                                            <InfoIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                No asset return records found
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                This employee has no returned assets recorded
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}
                        </>
                    )}

                    {/* Save Button */}
                    {selectedEmployee && clearanceItems.length > 0 && activeTab === 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #e5e7eb' }}>
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={handleSave}
                                disabled={saving || !hasUnsavedChanges}
                                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                                sx={{
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1,
                                    borderRadius: 3,
                                    letterSpacing: '0.5px',
                                    fontSize: '14px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)',
                                        background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)'
                                    },
                                    '&:disabled': {
                                        background: '#d1d5db',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                            </Button>
                        </Box>
                    )}

                    {/* No Employee Selected Message */}
                    {!selectedEmployee && !loading && (
                        <Paper sx={{
                            p: 6,
                            textAlign: 'center',
                            backgroundColor: '#fafafa',
                            mt: 2,
                            borderRadius: 3,
                            borderColor: '#e5e7eb'
                        }}>
                            <PersonIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                                No Employee Selected
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please select an employee from the dropdown above to view and manage their clearance checklist.
                            </Typography>
                        </Paper>
                    )}

                    {/* Loading State */}
                    {loading && !selectedEmployee && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#7C3AED' }} />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ClearanceManagement;