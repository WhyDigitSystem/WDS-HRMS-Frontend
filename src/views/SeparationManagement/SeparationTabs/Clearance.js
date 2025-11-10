import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Checkbox,
    FormControlLabel,
    Avatar,
    Autocomplete,
    TextField,
    Divider,
    CircularProgress,
    Button,
} from '@mui/material';
import {
    Person as PersonIcon,
    Groups as TeamIcon,
    TaskAlt as CompletedIcon,
    Info as InfoIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

const ClearanceManagement = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [clearanceItems, setClearanceItems] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [loginUserName] = useState(localStorage.getItem('userName'));

    // Master list of ALL clearance items that should always be visible
    const masterClearanceItems = [
        { id: 1, name: 'Company Laptop/Equipment', department: 'IT', assignedTo: 'IT Manager' },
        { id: 2, name: 'Employee ID Card', department: 'Security', assignedTo: 'Security' },
        { id: 3, name: 'Access Cards/Keys', department: 'Security', assignedTo: 'Security' },
        { id: 4, name: 'Confidential Documents', department: 'Manager', assignedTo: 'Manager' },
        { id: 5, name: 'Library Books', department: 'Admin', assignedTo: 'Admin' },
        { id: 6, name: 'Salary Advance Clearance', department: 'Finance', assignedTo: 'Finance' },
        { id: 7, name: 'Pending Expense Claims', department: 'Finance', assignedTo: 'Finance' },
        { id: 8, name: 'Work Handover', department: 'Manager', assignedTo: 'Manager' },
        { id: 9, name: 'Knowledge Transfer', department: 'HR', assignedTo: 'HR' },
        { id: 10, name: 'Medical Insurance', department: 'HR', assignedTo: 'HR' }
    ];

    useEffect(() => {
        getEmployeesDetails();
    }, []);

    // Function to handle checkbox changes
    const handleCheckboxChange = (itemId) => {
        setClearanceItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId
                    ? { ...item, completed: !item.completed }
                    : item
            )
        );
    };

    const getAvatarColor = (employee) => {
        if (!employee) return '#3b82f6';

        return [employee.name] || '#3b82f6';
    };

    const getEmployeesDetails = async () => {
        setLoading(true);
        try {
            const response = await apiCalls('get', `/employeseparation/getInitiateSeparationByOrgId?branchCode=${branchCode}&orgId=${orgId}`);

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
            showToast('error', 'Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    // Update clearance items when employee is selected
    useEffect(() => {
        if (selectedEmployee) {
            // Get completed items from API for this employee
            const completedItemsFromAPI = selectedEmployee.clearanceItems || [];

            // Create a map of completed items for quick lookup
            const completedItemsMap = {};
            const originalItemIds = {};

            completedItemsFromAPI.forEach(item => {
                // Find matching item in master list by name
                const matchingMasterItem = masterClearanceItems.find(masterItem =>
                    masterItem.name.toLowerCase() === item.clearanceItem.toLowerCase()
                );
                if (matchingMasterItem) {
                    completedItemsMap[matchingMasterItem.id] = true;
                    originalItemIds[matchingMasterItem.id] = item.id; // Store original API ID
                }
            });

            // Create the final clearance items list with ALL items
            const finalClearanceItems = masterClearanceItems.map(masterItem => ({
                ...masterItem,
                completed: !!completedItemsMap[masterItem.id], // Tick only if exists in API
                assignedTo: getAssignedToFromDepartment(masterItem.department),
                originalId: originalItemIds[masterItem.id] || 0 // Store original ID from API
            }));

            setClearanceItems(finalClearanceItems);
        } else {
            setClearanceItems([]);
        }
    }, [selectedEmployee]);

    // Helper function to get assigned to based on department
    const getAssignedToFromDepartment = (department) => {
        const assignments = {
            'Security': 'Security',
            'IT': 'IT Manager',
            'Finance': 'Finance',
            'HR': 'HR',
            'Manager': 'Manager',
            'Admin': 'Admin'
        };
        return assignments[department] || 'Admin';
    };

    const handleSave = async () => {
        if (!selectedEmployee) {
            showToast('error', 'Please select an employee first');
            return;
        }

        setSaving(true);
        try {
            const completedItems = clearanceItems.filter(item => item.completed);

            const clearanceManagementDTO = completedItems.map(item => ({
                clearanceItem: item.name,
                id: item.originalId || 0
            }));

            const payload = {
                id: selectedEmployee.id, // ✅ CRITICAL: Include the main ID for update
                branch: branch || "",
                branchCode: branchCode,
                clearanceManagementDTO: clearanceManagementDTO,
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
                status: 'PENDING',
                reasonCategory: selectedEmployee.originalData?.reasonCategory || "",
                rehireEligible: selectedEmployee.originalData?.rehireEligible || "Yes",
                reportingPerson: selectedEmployee.reportingManager,
                reportingPersonCode: selectedEmployee.originalData?.reportingPersonCode || "",
                reportingPersonEmail: selectedEmployee.originalData?.reportingPersonEmail || "",
                resignation: selectedEmployee.originalData?.resignation || "",
                separationType: selectedEmployee.separationType,
                updatedBy: loginUserName // ✅ Add updatedBy field for updates
            };

            console.log('Updating clearance data with ID:', selectedEmployee.id, payload);

            const response = await apiCalls('put', '/employeseparation/createUpdateInitiateSeparation', payload);

            if (response.status === true) {
                showToast('success', 'Clearance status updated successfully!');
                getEmployeesDetails();
            } else {
                showToast('error', response.message || 'Failed to update clearance status');
            }
        } catch (error) {
            console.error('Error updating clearance status:', error);
            showToast('error', 'Error updating clearance status');
        } finally {
            setSaving(false);
        }
    };

    const completeAllClearance = () => {
        setClearanceItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                completed: true
            }))
        );
        showToast('info', 'All items marked as completed');
    };

    // Reset all clearance items
    const resetAllClearance = () => {
        setClearanceItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                completed: false
            }))
        );
        showToast('info', 'All items reset');
    };

    const completedCount = clearanceItems.filter(item => item.completed).length;
    const totalItems = clearanceItems.length;
    const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
    const allCompleted = totalItems > 0 && completedCount === totalItems;

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

    return (
        <Box sx={{ p: 2, margin: '0 auto' }}>
            {/* Employee Selector */}
            <Card sx={{ mb: 2, backgroundColor: '#f8fafc' }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                        Select Employee for Clearance
                    </Typography>
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
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                        freeSolo={false}
                        disableClearable={false}
                        clearOnBlur={true}
                        selectOnFocus={false}
                        handleHomeEndKeys={false}
                        sx={{
                            width: 300,
                            mb: selectedEmployee ? 2 : 0,
                            '& .MuiAutocomplete-inputRoot': {
                                paddingRight: '30px !important',
                            }
                        }}
                    />

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

                            {/* Progress Section */}
                            <Box sx={{ width: 200, mr: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Progress: {completedCount}/{totalItems}
                                    </Typography>
                                    <Chip
                                        icon={<CompletedIcon sx={{ fontSize: 14 }} />}
                                        label={`${completedCount}/${totalItems}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ height: 24 }}
                                    />
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: '#e5e7eb',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: getAvatarColor(selectedEmployee),
                                            borderRadius: 3
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Clearance Items Section */}
            {selectedEmployee ? (
                <Card>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1.1rem' }}>
                                Clearance Checklist ({clearanceItems.length} items)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={resetAllClearance}
                                    disabled={clearanceItems.length === 0}
                                >
                                    Reset All
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={completeAllClearance}
                                    disabled={allCompleted || clearanceItems.length === 0}
                                >
                                    Complete All
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                                    onClick={handleSave}
                                    disabled={saving || clearanceItems.length === 0}
                                    sx={{
                                        backgroundColor: '#10b981',
                                        '&:hover': { backgroundColor: '#059669' }
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Clearance'}
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                            {clearanceItems.length > 0 ? (
                                clearanceItems.map((item, index) => (
                                    <Box key={item.id}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 0.5,
                                                borderRadius: 1,
                                                backgroundColor: item.completed ? '#f0fdf4' : 'transparent',
                                                border: `1px solid ${item.completed ? '#bbf7d0' : '#f0f0f0'}`,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: item.completed ? '#ecfdf5' : '#fafafa',
                                                    borderColor: item.completed ? '#86efac' : '#d1d5db'
                                                }
                                            }}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={item.completed}
                                                        onChange={() => handleCheckboxChange(item.id)}
                                                        size="small"
                                                        sx={{
                                                            color: item.completed ? '#16a34a' : '#d1d5db',
                                                            ml: 2,
                                                            '&.Mui-checked': {
                                                                color: '#16a34a',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label=""
                                                sx={{ mr: 1, minWidth: 32 }}
                                            />

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1,
                                                    color: item.completed ? '#6b7280' : '#1f2937',
                                                    fontWeight: item.completed ? 400 : 500,
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
                                        No clearance items found for this employee.
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
                                : 'Please select an employee from the dropdown above to view and manage their clearance checklist.'
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
                    {['Security', 'Manager', 'Admin', 'Finance', 'IT', 'HR'].map(dept => (
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

export default ClearanceManagement;