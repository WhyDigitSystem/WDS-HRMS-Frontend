import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Avatar,
    Autocomplete,
    TextField,
    CircularProgress,
    Button,
    LinearProgress
} from '@mui/material';
import {
    Person as PersonIcon,
    Groups as TeamIcon,
    TaskAlt as CompletedIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

const HrClearance = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [clearanceItems, setClearanceItems] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [separationDetails, setSeparationDetails] = useState([]);
    const [clearanceStatus, setClearanceStatus] = useState(null); // New state for clearance status
    const [statusLoading, setStatusLoading] = useState(false); // New state for status loading
    
    const loginUserDesignation = localStorage.getItem("designation");
    const loginEmployeeCode = localStorage.getItem("employeeCode");

    const isSeparationRole = separationDetails
        .map(d => d.toUpperCase())
        .includes(loginUserDesignation?.trim().toUpperCase());

    // Helper function to get department color based on department name
    const getDepartmentColor = (department) => {
        const colors = {
            'SOFTWARE DEVELOPMENT': '#dbeafe',
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
            'SOFTWARE DEVELOPMENT': '#1e40af',
            'Security': '#92400e',
            'Manager': '#1e40af',
            'Admin': '#166534',
            'Finance': '#7e22ce',
            'IT': '#be123c',
            'HR': '#c2410c'
        };
        return colors[department] || '#374151';
    };

    useEffect(() => {
        if (separationDetails.length > 0) {
            getEmployeesDetails();
        }
    }, [separationDetails]);

    useEffect(() => {
        getCompanyDetails();
    }, [orgId]);

    const getAvatarColor = (employee) => {
        if (!employee) return '#3b82f6';
        return '#3b82f6';
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

    const getEmployeesDetails = async () => {
        setLoading(true);

        try {
            const empCodePayload = isSeparationRole ? "ALL" : loginEmployeeCode;

            const response = await apiCalls(
                'get',
                `/employeseparation/getInitiateSeparationByOrgIdforclearance?branchCode=${branchCode}&orgId=${orgId}&empCode=${empCodePayload}`
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

                if (!isSeparationRole && employeeList.length > 0) {
                    setSelectedEmployee(employeeList[0]);
                }

            } else {
                console.error('No data found in response');
                setEmployees([]);
            }

        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
            showToast('error', 'Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    // Fetch clearance status for pending/completed check
    const fetchClearanceStatus = async (employeeCode) => {
        setStatusLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/employeseparation/getStatusForClearance?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap && response.paramObjectsMap.assetStatus) {
                const statusData = response.paramObjectsMap.assetStatus[0];
                setClearanceStatus(statusData);
                return statusData;
            } else {
                setClearanceStatus(null);
                return null;
            }
        } catch (error) {
            console.error('Error fetching clearance status:', error);
            setClearanceStatus(null);
            return null;
        } finally {
            setStatusLoading(false);
        }
    };

    // Fetch clearance details when employee is selected
    const fetchClearanceDetails = async (employeeCode) => {
        setLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/employeseparation/getCleranceDetailsByEmployeeCode?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap && response.paramObjectsMap.initiateSeparationVO) {
                const clearanceData = response.paramObjectsMap.initiateSeparationVO;
                
                // Transform the data - these are already completed clearance items
                const transformedItems = clearanceData.map((item, index) => ({
                    id: index,
                    name: item.clearanceItem,
                    department: item.department,
                    departmentCode: item.departmentCode,
                    completed: true, // All items from this API are completed
                    originalData: item
                }));

                setClearanceItems(transformedItems);
            } else {
                // If no clearance data found, set empty array
                setClearanceItems([]);
                if (response.status === false) {
                    showToast('info', 'No clearance items found for this employee');
                }
            }
        } catch (error) {
            console.error('Error fetching clearance details:', error);
            setClearanceItems([]);
            showToast('error', 'Error fetching clearance details');
        } finally {
            setLoading(false);
        }
    };

    // Update clearance items and status when employee is selected
    useEffect(() => {
        if (selectedEmployee && selectedEmployee.employeeCode) {
            fetchClearanceDetails(selectedEmployee.employeeCode);
            fetchClearanceStatus(selectedEmployee.employeeCode); // Fetch status for pending/completed
        } else {
            setClearanceItems([]);
            setClearanceStatus(null);
        }
    }, [selectedEmployee]);

    const completedCount = clearanceItems.length;
    const totalItems = clearanceItems.length;
    const progress = totalItems > 0 ? 100 : 0; // All items are completed
    const allCompleted = totalItems > 0;
    
    // Get pending count from clearance status
    const pendingCount = clearanceStatus ? clearanceStatus.qty : 0;
    const isFullyCleared = pendingCount === 0 && totalItems > 0;

    const uniqueDepartments = [...new Set(clearanceItems.map(item => item.department))];

    return (
        <Box sx={{ p: 0, margin: '0 auto' }}>
            {/* Employee Selector */}
            <Card sx={{ mb: 2, backgroundColor: '#f8fafc' }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                        Select Employee to View Clearance Status
                    </Typography>
                    {isSeparationRole && (
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => option.name}
                            value={selectedEmployee}
                            onChange={(event, newValue) => setSelectedEmployee(newValue)}
                            loading={loading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Employee"
                                    size="small"
                                    placeholder="Choose an employee to view clearance status"
                                />
                            )}
                            sx={{
                                width: 300,
                                mb: selectedEmployee ? 2 : 0
                            }}
                        />
                    )}

                    {selectedEmployee && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: getAvatarColor(selectedEmployee),
                                        mr: 2,
                                        width: 48,
                                        height: 48,
                                        fontWeight: 600,
                                        color: '#fff',
                                        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                                    }}
                                >
                                    <PersonIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            wordBreak: 'break-word',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {selectedEmployee.employeeName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.25 }}>
                                        <TeamIcon sx={{ fontSize: 16, color: '#6b7280', mr: 0.5 }} />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                wordBreak: 'break-word',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {selectedEmployee.position} • {selectedEmployee.department}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Progress Section with Pending Count */}
                            {clearanceItems.length > 0 && (
                                <Box sx={{ width: 200, mr: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Completed: {completedCount}/{totalItems}
                                        </Typography>
                                        {/* Show pending count if there are pending items */}
                                        {pendingCount > 0 && (
                                            <Chip
                                                icon={<PendingIcon sx={{ fontSize: 14 }} />}
                                                label={`Pending: ${pendingCount}`}
                                                size="small"
                                                color="warning"
                                                variant="outlined"
                                                sx={{ height: 24 }}
                                            />
                                        )}
                                        {pendingCount === 0 && totalItems > 0 && (
                                            <Chip
                                                icon={<CompletedIcon sx={{ fontSize: 14 }} />}
                                                label={`${completedCount}/${totalItems}`}
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ height: 24 }}
                                            />
                                        )}
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: '#e5e7eb',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: pendingCount === 0 ? '#10b981' : '#f59e0b',
                                                borderRadius: 3
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Clearance Items Section - Read Only */}
            {selectedEmployee ? (
                <Card>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1.1rem' }}>
                                Completed Clearance Items ({clearanceItems.length} items)
                            </Typography>
                            {/* Only show "All Clearance Completed" if there are no pending items */}
                            {clearanceItems.length > 0 && pendingCount === 0 && (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label="All Clearance Completed"
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                            {/* Show pending status if there are pending items */}
                            {pendingCount > 0 && (
                                <Chip
                                    icon={<PendingIcon />}
                                    label={`${pendingCount} Pending Clearance${pendingCount > 1 ? 's' : ''}`}
                                    color="warning"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                        </Box>

                        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                            {loading || statusLoading ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CircularProgress />
                                    <Typography variant="body2" sx={{ mt: 2, color: '#6b7280' }}>
                                        Loading clearance items...
                                    </Typography>
                                </Box>
                            ) : clearanceItems.length > 0 ? (
                                clearanceItems.map((item) => (
                                    <Box key={item.id}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 2,
                                                backgroundColor: '#f0fdf4',
                                                border: '1px solid #bbf7d0',
                                                mb: 1,
                                                mr: 1,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: '#ecfdf5',
                                                    borderColor: '#86efac',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <CheckCircleIcon 
                                                sx={{ 
                                                    color: '#10b981', 
                                                    fontSize: 20,
                                                    mr: 2,
                                                    ml: 1
                                                }} 
                                            />

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1,
                                                    color: '#1f2937',
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {item.name}
                                            </Typography>

                                            <Chip
                                                label={item.department}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getDepartmentColor(item.department),
                                                    color: getDepartmentTextColor(item.department),
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    minWidth: 70,
                                                    mr: 1.5,
                                                    height: 24
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <InfoIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        No clearance items completed for this employee yet.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <InfoIcon
                            sx={{
                                fontSize: 48,
                                color: '#9ca3af',
                                mb: 2
                            }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 1,
                                fontWeight: 600,
                                color: '#6b7280'
                            }}
                        >
                            {loading ? 'Loading Employees...' : 'No Employee Selected'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#9ca3af',
                                maxWidth: 400,
                                margin: '0 auto'
                            }}
                        >
                            {loading
                                ? 'Fetching employee data...'
                                : 'Please select an employee from the dropdown above to view their completed clearance checklist.'
                            }
                        </Typography>
                        {loading && (
                            <CircularProgress sx={{ mt: 2 }} />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Legend */}
            {selectedEmployee && clearanceItems.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                        Departments:
                    </Typography>
                    {uniqueDepartments.map(dept => (
                        <Chip
                            key={dept}
                            label={dept}
                            size="small"
                            variant="outlined"
                            sx={{
                                backgroundColor: getDepartmentColor(dept),
                                color: getDepartmentTextColor(dept),
                                borderColor: getDepartmentTextColor(dept),
                                fontSize: '0.65rem',
                                height: 20
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default HrClearance;