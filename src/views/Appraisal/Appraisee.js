import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
    Button,
    TextField,
    Box,
    Tab,
    Tabs,
    FormControlLabel,
    Checkbox,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';
import GridOnIcon from '@mui/icons-material/GridOn';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import apiCalls from 'apicall';
import { useState, useEffect, useRef } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

const Appraisee = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [createdBy] = useState(localStorage.getItem('userName'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [department] = useState(localStorage.getItem('department'));
    const [designation] = useState(localStorage.getItem('designation'));
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingEmployee, setIsFetchingEmployee] = useState(false);
    const [listView, setListView] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [fillGridData, setFillGridData] = useState([]);

    // New state variables for employee autocomplete
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [formData, setFormData] = useState({
        code: localStorage.getItem('employeeCode') || '',
        name: '',
        branch: '',
        department: '',
        designation: '',
        reportingHead: '',
        reportingHeadCode: '',
        reportingHeadDesignation: '',
        finYear: new Date().getFullYear(),
        active: true
    });

    const [fieldErrors, setFieldErrors] = useState({
        code: '',
        name: '',
        department: '',
        designation: '',
        reportingHeadCode: '',
        reportingHead: '',
        reportingHeadDesignation: '',
    });

    const [appraiseeDetailsData, setAppraiseeDetailsData] = useState([
        { id: -1, area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
    ]);

    const [appraiseeDetailsErrors, setAppraiseeDetailsErrors] = useState([
        { area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
    ]);

    const listViewColumns = [
        { accessorKey: 'code', header: 'Code', size: 140 },
        { accessorKey: 'name', header: 'Name', size: 140 },
        { accessorKey: 'department', header: 'Department', size: 140 },
        { accessorKey: 'designation', header: 'Designation', size: 140 },
        { accessorKey: 'reportingHead', header: 'Reporting Head', size: 140 },
        { accessorKey: 'reportingHeadDesignation', header: 'Reporting Head Designation', size: 140 },
    ];

    // Fetch all employees
    const getAllEmployees = async () => {
        const orgIdVal = parseInt(localStorage.getItem('orgId'));
        const branchCode = localStorage.getItem('branch');

        if (!orgIdVal || !branchCode) return;

        setIsLoadingEmployees(true);
        try {
            const response = await apiCalls('get', `master/getAllEmployeeByOrgId?orgId=${orgIdVal}&branchCode=${branchCode}`);

            if (response.status === true) {
                const employees = response.paramObjectsMap.employeeVO || [];
                // Format employees for Autocomplete (code - name)
                const formattedEmployees = employees.map(emp => ({
                    code: emp.employeeCode,
                    name: emp.employee,
                    department: emp.department,
                    designation: emp.designation,
                    reportingPersonCode: emp.reportingPersonCode,
                    reportingPerson: emp.reportingPerson,
                    reportingPersonRole: emp.reportingRole,
                    branch: emp.branch,
                    email: emp.email,
                    mobileNo: emp.mobileNo
                }));
                setEmployeeOptions(formattedEmployees);
            } else {
                showToast('error', response.message || 'Failed to fetch employees');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            showToast('error', 'Failed to fetch employees');
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    // Handle employee selection
    const handleEmployeeSelect = (event, newValue) => {
        setSelectedEmployee(newValue);

        if (newValue) {
            // Auto-fill all form fields
            setFormData(prev => ({
                ...prev,
                code: newValue.code,
                name: newValue.name,
                department: newValue.department || '',
                designation: newValue.designation || '',
                reportingHeadCode: newValue.reportingPersonCode || '',
                reportingHead: newValue.reportingPerson || '',
                reportingHeadDesignation: newValue.reportingPersonRole || '',
                branch: newValue.branch || ''
            }));

            // Clear any field errors
            setFieldErrors(prev => ({
                ...prev,
                code: '',
                name: '',
                department: '',
                designation: '',
                reportingHeadCode: '',
                reportingHead: '',
                reportingHeadDesignation: ''
            }));

            showToast('success', `Employee ${newValue.name} selected successfully`);
        } else {
            // Clear form when selection is cleared
            setFormData(prev => ({
                ...prev,
                code: '',
                name: '',
                department: '',
                designation: '',
                reportingHeadCode: '',
                reportingHead: '',
                reportingHeadDesignation: '',
                branch: ''
            }));
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            await getAllAppraisees();
            await getAllEmployees(); // Fetch employees for dropdown
        };
        fetchInitialData();
    }, []);

    const getAllAppraisees = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getAppraiseeByOrgId?orgId=${orgId}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.appraiseeVO || []);
            } else {
                showToast('error', response.message || 'Failed to fetch appraisees');
            }
        } catch (error) {
            console.error('Error fetching appraisees:', error);
            showToast('error', 'Failed to fetch appraisees');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const updatedValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: updatedValue
        }));

        setFieldErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const isRowEmpty = (row) => {
        return (!row.area || row.area.trim() === '') &&
            (!row.keyPerformanceIndicator || row.keyPerformanceIndicator.trim() === '') &&
            (!row.goals || row.goals.trim() === '') &&
            (!row.reMarks || row.reMarks.trim() === '');
    };

    const getAppraiseeById = async (row) => {
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `/goalsController/getAppraiseeById?id=${row.original.id}`);
            if (response.status) {
                setListView(false);
                const appraisee = response.paramObjectsMap.appraiseeVO;

                setFormData({
                    id: appraisee.id,
                    code: appraisee.code,
                    name: appraisee.name,
                    branch: appraisee.branch,
                    department: appraisee.department,
                    designation: appraisee.designation,
                    reportingHeadCode: appraisee.reportingHeadCode,
                    reportingHead: appraisee.reportingHead,
                    reportingHeadDesignation: appraisee.reportingHeadDesignation,
                    finYear: appraisee.finYear,
                    active: appraisee.active === 'Active',
                });

                // Set the selected employee in Autocomplete
                if (appraisee.code) {
                    const matchedEmployee = employeeOptions.find(emp => emp.code === appraisee.code);
                    setSelectedEmployee(matchedEmployee || null);
                }

                const details = appraisee.appraiseeDetailsVO || [];
                setAppraiseeDetailsData(
                    details.map(detail => ({
                        id: detail.id,
                        area: detail.area,
                        keyPerformanceIndicator: detail.keyPerformanceIndicator,
                        goals: detail.goals,
                        reMarks: detail.reMarks
                    }))
                );

                setAppraiseeDetailsErrors(
                    details.map(() => ({
                        area: '',
                        keyPerformanceIndicator: '',
                        goals: '',
                        reMarks: ''
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching appraisee details:', error);
            showToast('error', 'Failed to fetch appraisee details');
        }
    };

    const handleSave = async () => {
        // First remove any empty rows
        const nonEmptyDetailsData = appraiseeDetailsData.filter(row => !isRowEmpty(row));
        setAppraiseeDetailsData(nonEmptyDetailsData);

        // Validate main form fields
        const errors = {};
        if (!formData.code) errors.code = 'Code is required';
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.department) errors.department = 'Department is required';
        if (!formData.designation) errors.designation = 'Designation is required';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(prev => ({ ...prev, ...errors }));
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        const appraiseeDetailsVo = nonEmptyDetailsData.map(row => ({
            ...(row.id !== -1 && { id: row.id }),
            area: row.area,
            keyPerformanceIndicator: row.keyPerformanceIndicator,
            goals: row.goals,
            reMarks: row.reMarks || ''
        }));

        const payload = {
            ...(editId && { id: editId }),
            active: formData.active,
            appraiseeDetailsDTO: appraiseeDetailsVo,
            branch: formData.branch || branch,
            code: formData.code,
            createdBy,
            department: formData.department || department,
            designation: formData.designation || designation,
            finYear: formData.finYear,
            name: formData.name,
            orgId,
            reportingHead: formData.reportingHead,
            reportingHeadCode: formData.reportingHeadCode,
            reportingHeadDesignation: formData.reportingHeadDesignation,
        };

        try {
            const response = await apiCalls('put', '/goalsController/createUpdateAppraisee', payload);
            if (response.status) {
                showToast('success', editId ? 'Appraisee updated successfully' : 'Appraisee created successfully');
                handleClear();
                getAllAppraisees();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving appraisee:', error);
            showToast('error', 'Failed to save appraisee');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            id: '',
            code: localStorage.getItem('employeeCode') || '',
            name: '',
            branch: '',
            department: '',
            designation: '',
            reportingHead: '',
            reportingHeadCode: '',
            reportingHeadDesignation: '',
            finYear: new Date().getFullYear(),
            active: true
        });

        setFieldErrors({
            code: '',
            name: '',
            department: '',
            designation: '',
            reportingHeadCode: '',
            reportingHead: '',
            reportingHeadDesignation: '',
        });

        setAppraiseeDetailsData([
            { id: -1, area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
        ]);

        setAppraiseeDetailsErrors([
            { area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
        ]);

        setEditId('');
        setSelectedEmployee(null);
    };

    const handleDeleteRow = (id) => {
        if (appraiseeDetailsData.length <= 1) {
            showToast('warning', 'At least one detail is required');
            return;
        }

        const index = appraiseeDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = appraiseeDetailsData.filter(d => d.id !== id);
        const newErrors = appraiseeDetailsErrors.filter((_, i) => i !== index);

        setAppraiseeDetailsData(newData);
        setAppraiseeDetailsErrors(newErrors);
    };

    const handleDetailChange = (id, field, value) => {
        const index = appraiseeDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        // Update data
        const newData = [...appraiseeDetailsData];
        newData[index] = { ...newData[index], [field]: value };
        setAppraiseeDetailsData(newData);

        // Clear error for this field
        if (value) {
            const newErrors = [...appraiseeDetailsErrors];
            if (newErrors[index]) {
                newErrors[index] = { ...newErrors[index], [field]: '' };
                setAppraiseeDetailsErrors(newErrors);
            }
        }
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);

    const handleFullGrid = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getAppraiseeFillGrid?orgId=${orgId}&employeeCode=${formData.code}`);
            if (response.status) {
                setFillGridData(response.paramObjectsMap.appraiseeFillGrid || []);
                setModalOpen(true);
            } else {
                showToast('warning', response.message || 'No data available');
            }
        } catch (error) {
            console.error('Error fetching fill grid data:', error);
            showToast('error', 'Failed to fetch fill grid data');
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRows([]);
        setSelectAll(false);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            setSelectedRows(fillGridData.map((_, index) => index));
        }
        setSelectAll(!selectAll);
    };

    const handleFillGridRemarkChange = (index, value) => {
        setFillGridData(prevData => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], reMarks: value };
            return newData;
        });
    };

    const handleSubmitSelectedRows = () => {
        const selectedData = selectedRows.map((index) => fillGridData[index]);

        // Filter out items that already exist in appraiseeDetailsData
        const newData = selectedData
            .filter((data) => {
                return !appraiseeDetailsData.some(
                    (item) => item.area === data.area && item.goals === data.goals
                );
            })
            .map((data) => ({
                id: Date.now() + Math.random(), // Generate a unique ID
                area: data.area || '',
                keyPerformanceIndicator: data.keyPerformanceIndicator || '',
                goals: data.goals || '',
                reMarks: data.reMarks || ''
            }));

        if (newData.length < selectedData.length) {
            showToast('warning', 'Some of the selected items are already added!');
        }

        if (newData.length === 0) {
            handleCloseModal();
            return;
        }

        // Check if the first row is empty
        const firstRowIsEmpty = appraiseeDetailsData.length === 1 &&
            isRowEmpty(appraiseeDetailsData[0]);

        // If first row is empty, replace it with new data
        if (firstRowIsEmpty) {
            setAppraiseeDetailsData(newData);
        } else {
            // Otherwise, append the new data
            setAppraiseeDetailsData((prev) => [...prev, ...newData]);
        }

        setSelectedRows([]);
        setSelectAll(false);
        handleCloseModal();
    };

    return (
        <>
            <div>
                <ToastComponent />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                        <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
                    </div>

                    {!listView ? (
                        <>
                            <div className="row d-flex ml">
                                {/* Employee Code - Autocomplete */}
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={employeeOptions}
                                        loading={isLoadingEmployees}
                                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                        value={selectedEmployee}
                                        onChange={handleEmployeeSelect}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Employee Code"
                                                variant="outlined"
                                                size="small"
                                                error={!!fieldErrors.code}
                                                helperText={fieldErrors.code}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {isLoadingEmployees ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <div>
                                                    {option.code} - {option.name}
                                                </div>
                                            </li>
                                        )}
                                        isOptionEqualToValue={(option, value) => option.code === value?.code}
                                        noOptionsText="No employees found"
                                        clearOnEscape
                                        freeSolo={false}
                                    />
                                </div>

                                {/* Employee Name */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Employee Name"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.name}
                                        helperText={fieldErrors.name}
                                    />
                                </div>

                                {/* Department */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Department"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.department}
                                        helperText={fieldErrors.department}
                                    />
                                </div>

                                {/* Designation */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Designation"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.designation}
                                        helperText={fieldErrors.designation}
                                    />
                                </div>

                                {/* Reporting Head Code */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Reporting Head Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="reportingHeadCode"
                                        value={formData.reportingHeadCode}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.reportingHeadCode}
                                        helperText={fieldErrors.reportingHeadCode}
                                    />
                                </div>

                                {/* Reporting Head */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Reporting Head"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="reportingHead"
                                        value={formData.reportingHead}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.reportingHead}
                                        helperText={fieldErrors.reportingHead}
                                    />
                                </div>

                                {/* Reporting Head Designation */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Reporting Head Designation"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="reportingHeadDesignation"
                                        value={formData.reportingHeadDesignation}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.reportingHeadDesignation}
                                        helperText={fieldErrors.reportingHeadDesignation}
                                    />
                                </div>
                            </div>

                            <div className="row mt-2">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs
                                        value={value}
                                        onChange={handleTabChange}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                    >
                                        <Tab value={0} label="Appraisee Details" />
                                    </Tabs>
                                </Box>

                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Fill Grid" icon={GridOnIcon} onClick={handleFullGrid} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{
                                                                    background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                    color: 'white'
                                                                }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        Area
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        Key Performance Indicators
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        Goals
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        Remarks
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {appraiseeDetailsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() => handleDeleteRow(row.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center pt-3">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.area}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'area', e.target.value)
                                                                                }
                                                                                error={!!appraiseeDetailsErrors[index]?.area}
                                                                                helperText={appraiseeDetailsErrors[index]?.area}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.keyPerformanceIndicator}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'keyPerformanceIndicator', e.target.value)
                                                                                }
                                                                                error={!!appraiseeDetailsErrors[index]?.keyPerformanceIndicator}
                                                                                helperText={appraiseeDetailsErrors[index]?.keyPerformanceIndicator}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.goals}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'goals', e.target.value)
                                                                                }
                                                                                error={!!appraiseeDetailsErrors[index]?.goals}
                                                                                helperText={appraiseeDetailsErrors[index]?.goals}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.reMarks}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'reMarks', e.target.value)
                                                                                }
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Box>
                                <Dialog
                                    open={modalOpen}
                                    maxWidth={'md'}
                                    fullWidth={true}
                                    onClose={handleCloseModal}
                                    PaperComponent={PaperComponent}
                                    aria-labelledby="draggable-dialog-title"
                                >
                                    <DialogTitle textAlign="center" style={{ cursor: 'move' }} id="draggable-dialog-title">
                                        <h6>Appraisee Details</h6>
                                    </DialogTitle>
                                    <DialogContent className="pb-0">
                                        <div className="row">
                                            <div className="col-lg-12">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr style={{
                                                                background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                color: 'white'
                                                            }}>
                                                                <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                                                    <Checkbox sx={{
                                                                        color: 'white',
                                                                        '&.Mui-checked': {
                                                                            color: 'white',
                                                                        },
                                                                    }}
                                                                        checked={selectAll} onChange={handleSelectAll} />
                                                                </th>
                                                                <th className="table-header">Area</th>
                                                                <th className="table-header">Key Performance Indicator</th>
                                                                <th className="table-header">Goals</th>
                                                                <th className="px-2 py-2 text-white text-center">
                                                                    Remarks
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fillGridData?.map((row, index) => (
                                                                <tr key={index}>
                                                                    <td className="border p-0 text-center">
                                                                        <Checkbox
                                                                            sx={{ backgroundColor: 'white' }}
                                                                            checked={selectedRows.includes(index)}
                                                                            onChange={(e) => {
                                                                                const isChecked = e.target.checked;
                                                                                setSelectedRows((prev) =>
                                                                                    isChecked ? [...prev, index] : prev.filter((i) => i !== index));
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="border px-2 py-2 disable">{row.area || ''}</td>
                                                                    <td className="border px-2 py-2">{row.keyPerformanceIndicator || ''}</td>
                                                                    <td className="border px-2 py-2">{row.goals || ''}</td>
                                                                    <td>
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            value={row.reMarks}
                                                                            onChange={(e) =>
                                                                                handleFillGridRemarkChange(index, e.target.value)
                                                                            }
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                    <DialogActions sx={{ p: '1.25rem' }} className="pt-0">
                                        <Button onClick={handleCloseModal} sx={{ color: 'red' }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            color="secondary"
                                            onClick={handleSubmitSelectedRows}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: 'green',
                                                '&:hover': {
                                                    backgroundColor: 'green'
                                                }
                                            }}
                                        >
                                            Proceed
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getAppraiseeById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Appraisee;