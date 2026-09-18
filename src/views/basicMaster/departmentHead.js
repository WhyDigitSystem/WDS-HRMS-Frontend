import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, MenuItem, Select, FormControl, InputLabel, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';

const DepartmentHead = () => {
    const [data, setData] = useState([]);
    const [value, setValue] = useState(0);
    const [showForm, setShowForm] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [branchName] = useState(localStorage.getItem('branch'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [editId, setEditId] = useState('');
    const [departmentDetails, setDepartmentDetails] = useState([]);
    const [employeesList, setEmployeesList] = useState([]);
    const [assetList, setAssetList] = useState([]); // State for assets
    const [assetLoading, setAssetLoading] = useState(false); // Loading state for assets

    const [formData, setFormData] = useState({
        active: true,
        departmentId: '',
        departmentCode: '',
        departmentName: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
        departmentId: false
    });

    // State for reporting heads (multiple selection)
    const [reportingHeadsData, setReportingHeadsData] = useState([
        {
            id: '',
            employee: '',
            employeeCode: '',
            employeeEmail: '',
            isSelected: false
        }
    ]);

    const [reportingHeadsErrors, setReportingHeadsErrors] = useState([
        {
            employee: ''
        }
    ]);

    // State for clearance details
    const [clearanceData, setClearanceData] = useState([
        {
            id: '',
            clearanceName: '',
            assetId: '',
            assetCode: ''
        }
    ]);

    const [clearanceErrors, setClearanceErrors] = useState([
        {
            clearanceName: ''
        }
    ]);

    useEffect(() => {
        getAllDepartment();
        getAllExitQuestions();
        fetchAssetList(); // Fetch assets on component mount
    }, []);

    // Fetch assets from API
    const fetchAssetList = async () => {
        setAssetLoading(true);
        try {
            const response = await apiCalls('get',
                `/assetmanagement/getAssetMasterByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response && response.status === true && response.paramObjectsMap.assetMasterVO) {
                setAssetList(response.paramObjectsMap.assetMasterVO);
            } else {
                setAssetList([]);
            }
        } catch (err) {
            console.log('Error fetching assets:', err);
            setAssetList([]);
            showToast('error', 'Error fetching assets');
        } finally {
            setAssetLoading(false);
        }
    };

    // Fetch employees when department is selected
    const fetchEmployeesByDepartment = async (departmentName, departmentCode) => {
        if (!departmentName) return;

        try {
            const result = await apiCalls('get',
                `employeseparation/getEmployeeforDepartmentHeadByOrgId?orgId=${orgId}&branchCode=${branchCode}&department=${encodeURIComponent(departmentName)}`
            );

            if (result && result.status === true && result.paramObjectsMap.employeeVO) {
                setEmployeesList(result.paramObjectsMap.employeeVO);
            } else {
                setEmployeesList([]);
            }
        } catch (err) {
            console.log('Error fetching employees:', err);
            setEmployeesList([]);
        }
    };

    const getAllDepartment = async () => {
        try {
            const result = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
            if (result && result.paramObjectsMap.departmentVO) {
                setDepartmentDetails(result.paramObjectsMap.departmentVO.reverse());
            }
        } catch (err) {
            console.log('error', err);
        }
    };

    const getAllExitQuestions = async () => {
        try {
            const result = await apiCalls('get', `/employeseparation/getDepartmentHeadByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
            if (result) {
                setData(result.paramObjectsMap.departmentHeadVO.reverse());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSave = async () => {
        const errors = {};

        if (!formData.departmentId) {
            errors.departmentId = 'Department is required';
        }

        // Validate at least one reporting head is selected
        const selectedHeads = reportingHeadsData.filter(head => head.isSelected && head.employee);
        if (selectedHeads.length === 0) {
            showToast('error', 'Please select at least one reporting head');
            return;
        }

        // Validate at least one clearance item is added
        const validClearance = clearanceData.filter(item => item.clearanceName && item.clearanceName.trim() !== '');
        if (validClearance.length === 0) {
            showToast('error', 'Please add at least one clearance item');
            return;
        }

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);

            const payload = {
                ...(editId && { id: editId }),
                branch: branchName,
                branchCode: branchCode,
                department: formData.departmentName,
                departmentCode: formData.departmentCode,
                orgId: Number(orgId),
                createdBy: loginUserName,
                reportingHeadDTO: reportingHeadsData
                    .filter(head => head.isSelected && head.employee)
                    .map((item) => ({
                        employee: item.employee,
                        employeeCode: item.employeeCode,
                        employeeEmail: item.employeeEmail
                    })),
                clearanceDetailsDTO: clearanceData
                    .filter(item => item.clearanceName && item.clearanceName.trim() !== '')
                    .map((item) => ({
                        clearanceName: item.clearanceName,
                        assetId: item.assetId,
                        assetCode: item.assetCode
                    }))
            };

            console.log('DATA TO SAVE', payload);

            try {
                const response = await apiCalls('put', `/employeseparation/createUpdateDepartmentHead`, payload);
                if (response.status === true) {
                    showToast('success', editId ? 'Department head updated successfully' : 'Department head created successfully');
                    getAllExitQuestions();
                    handleClear();
                } else {
                    showToast('error', editId ? 'Department head updation failed' : 'Department head creation failed');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('error', 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log('Validation Errors:', errors);
            setFieldErrors(errors);
        }
    };

    const handleClear = () => {
        setFormData({
            departmentId: '',
            departmentCode: '',
            departmentName: ''
        });

        setFieldErrors({
            departmentId: false
        });

        setEditId('');
        setEditMode(false);
        setEmployeesList([]);

        setReportingHeadsData([{
            id: Date.now(),
            employee: '',
            employeeCode: '',
            employeeEmail: '',
            isSelected: false
        }]);
        setReportingHeadsErrors([{ employee: '' }]);

        setClearanceData([{ id: Date.now(), clearanceName: '', assetId: '', assetCode: '' }]);
        setClearanceErrors([{ clearanceName: '' }]);
    };

    const handleListView = () => {
        setShowForm(!showForm);
        handleClear();
        setFieldErrors({
            departmentId: false
        });
    };

    const listViewColumns = [
        { accessorKey: 'department', header: 'Department Name', size: 200 },
        { accessorKey: 'departmentCode', header: 'Department Code', size: 150 }
    ];

    const getExitQuestionsById = async (row) => {
        console.log('Editing:', row.original.id);
        setEditId(row.original.id);
        setShowForm(true);

        try {
            const result = await apiCalls('get', `/employeseparation/getDepartmentHeadById?id=${row.original.id}`);

            const exitQuestions = result?.paramObjectsMap?.departmentHeadVO;

            if (exitQuestions) {
                setEditMode(true);

                const selectedDepartment = allDepartments.find(
                    (d) =>
                        d.departmentName?.toLowerCase().trim() ===
                        exitQuestions.department?.toLowerCase().trim()
                );

                setFormData({
                    departmentId: selectedDepartment?.id || '',
                    departmentCode: exitQuestions.departmentCode || '',
                    departmentName: exitQuestions.department || ''
                });

                // Fetch employees for this department
                if (exitQuestions.department) {
                    await fetchEmployeesByDepartment(exitQuestions.department, exitQuestions.departmentCode);
                }

                // Populate reporting heads data
                if (exitQuestions.reportingHeadVO && exitQuestions.reportingHeadVO.length > 0) {
                    const headsWithSelection = exitQuestions.reportingHeadVO.map((head) => ({
                        id: head.id || Date.now(),
                        employee: head.employee || '',
                        employeeCode: head.employeeCode || '',
                        isSelected: true
                    }));
                    setReportingHeadsData(headsWithSelection);
                } else {
                    setReportingHeadsData([{
                        id: Date.now(),
                        employee: '',
                        employeeCode: '',
                        employeeEmail: '',
                        isSelected: false
                    }]);
                }

                // Populate clearance data with asset selection
                if (exitQuestions.clearanceDetailsVO && exitQuestions.clearanceDetailsVO.length > 0) {
                    const clearanceWithAssets = exitQuestions.clearanceDetailsVO.map((detail) => {
                        const matchedAsset = assetList.find(
                            (asset) =>
                                asset.assetName?.toLowerCase().trim() ===
                                detail.clearanceName?.toLowerCase().trim()
                        );

                        return {
                            id: detail.id || Date.now(),
                            clearanceName: detail.clearanceName || '',
                            assetId: matchedAsset?.id || '',
                            assetCode: matchedAsset?.assetCode || ''
                        };
                    });
                    setClearanceData(clearanceWithAssets);
                } else {
                    setClearanceData([{ id: Date.now(), clearanceName: '', assetId: '', assetCode: '' }]);
                }
            } else {
                console.warn('No data found for this ID');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Reporting Head handlers
    const handleReportingHeadSelect = (index, employee) => {
        setReportingHeadsData((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        employee: employee.employeeName,
                        employeeCode: employee.employeeCode,
                        employeeEmail: employee.email,
                        isSelected: true
                    }
                    : item
            )
        );

        setReportingHeadsErrors((prevErrors) =>
            prevErrors.map((err, i) =>
                i === index
                    ? { ...err, employee: employee ? '' : 'Reporting head is required' }
                    : err
            )
        );
    };

    const handleAddReportingHeadRow = () => {
        if (isLastRowEmpty(reportingHeadsData)) {
            displayRowError(reportingHeadsData, setReportingHeadsErrors);
            return;
        }
        const newRow = {
            id: Date.now(),
            employee: '',
            employeeCode: '',
            employeeEmail: '',
            isSelected: false
        };
        setReportingHeadsData([...reportingHeadsData, newRow]);
        setReportingHeadsErrors([
            ...reportingHeadsErrors,
            { employee: '' }
        ]);
    };

    // Clearance handlers with asset selection
    const handleClearanceChange = (e, index, field) => {
        const { value } = e.target;

        setClearanceData((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );

        setClearanceErrors((prevErrors) =>
            prevErrors.map((err, i) =>
                i === index
                    ? { ...err, [field]: value ? '' : `${field} is required` }
                    : err
            )
        );
    };

    // Handle asset selection
    const handleAssetSelect = (index, asset) => {
        setClearanceData((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        clearanceName: asset.assetName,
                        assetId: asset.id,
                        assetCode: asset.assetCode
                    }
                    : item
            )
        );

        setClearanceErrors((prevErrors) =>
            prevErrors.map((err, i) =>
                i === index
                    ? { ...err, clearanceName: asset ? '' : 'Clearance name is required' }
                    : err
            )
        );
    };

    const handleAddClearanceRow = () => {
        if (isLastRowEmpty(clearanceData)) {
            displayRowError(clearanceData, setClearanceErrors);
            return;
        }
        const newRow = {
            id: Date.now(),
            clearanceName: '',
            assetId: '',
            assetCode: ''
        };
        setClearanceData([...clearanceData, newRow]);
        setClearanceErrors([
            ...clearanceErrors,
            { clearanceName: '' }
        ]);
    };

    const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
        if (!Array.isArray(table) || !Array.isArray(errorTable)) {
            console.error('Invalid table or errorTable:', { table, errorTable });
            return;
        }

        const rowIndex = table.findIndex((row) => row.id === id);
        if (rowIndex !== -1) {
            const updatedData = table.filter((row) => row.id !== id);
            const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);

            if (updatedData.length === 0) {
                if (table === clearanceData) {
                    setTable([{ id: Date.now(), clearanceName: '', assetId: '', assetCode: '' }]);
                    setErrorTable([{ clearanceName: '' }]);
                } else if (table === reportingHeadsData) {
                    setTable([{
                        id: Date.now(),
                        employee: '',
                        employeeCode: '',
                        employeeEmail: '',
                        isSelected: false
                    }]);
                    setErrorTable([{ employee: '' }]);
                }
            } else {
                setTable(updatedData);
                setErrorTable(updatedErrors);
            }
        }
    };

    const isLastRowEmpty = (table) => {
        const lastRow = table[table.length - 1];
        if (!lastRow) return false;

        if (table === clearanceData) {
            return !lastRow.clearanceName;
        } else if (table === reportingHeadsData) {
            return !lastRow.employee;
        }
        return false;
    };

    const displayRowError = (table, setErrorTable) => {
        const lastIndex = table.length - 1;

        if (table === clearanceData) {
            setErrorTable((prevErrors) => {
                const newErrors = [...prevErrors];
                const lastRow = table[lastIndex];
                newErrors[lastIndex] = {
                    ...newErrors[lastIndex],
                    clearanceName: !lastRow.clearanceName ? 'Clearance name is required' : ''
                };
                return newErrors;
            });
        } else if (table === reportingHeadsData) {
            setErrorTable((prevErrors) => {
                const newErrors = [...prevErrors];
                newErrors[lastIndex] = {
                    ...newErrors[lastIndex],
                    employee: !table[lastIndex].employee ? 'Reporting head is required' : ''
                };
                return newErrors;
            });
        }
    };

    const allDepartments = [
        { id: "GENERAL", departmentName: "GENERAL", departmentCode: "GL" },
        ...departmentDetails
    ];

    return (
        <>
            <div>
                <ToastContainer />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                    {!showForm && <ActionButton title="New Entry" icon={AddIcon} onClick={handleListView} />}
                    {showForm && (
                        <>
                            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleListView} />
                            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                        </>
                    )}
                </div>

                {showForm ? (
                    <>
                        <div className="row d-flex">
                            {/* Department Selection */}
                            <div className="col-md-4 mb-3">
                                <Autocomplete
                                    options={allDepartments}
                                    getOptionLabel={(option) => option.departmentName || ""}
                                    value={allDepartments.find((d) => d.id === formData.departmentId) || null}
                                    onChange={(event, newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            departmentId: newValue ? newValue.id : "",
                                            departmentCode: newValue ? newValue.departmentCode : "",
                                            departmentName: newValue ? newValue.departmentName : ""
                                        }));

                                        setFieldErrors((prev) => ({
                                            ...prev,
                                            departmentId: ""
                                        }));

                                        // Fetch employees when department is selected
                                        if (newValue && newValue.departmentName) {
                                            fetchEmployeesByDepartment(newValue.departmentName, newValue.departmentCode);
                                        } else {
                                            setEmployeesList([]);
                                        }
                                    }}
                                    size="small"
                                    sx={{
                                        width: "100%",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: "#fff"
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Department"
                                            error={Boolean(fieldErrors.departmentId)}
                                            helperText={fieldErrors.departmentId || ""}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontWeight: 500 }}>
                                                    {option.departmentName}
                                                </span>
                                            </div>
                                        </li>
                                    )}
                                />
                            </div>

                            {/* Department Code - Auto-filled */}
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth variant="filled">
                                    <TextField
                                        id="departmentCode"
                                        label="Department Code"
                                        size="small"
                                        name="departmentCode"
                                        value={formData.departmentCode}
                                        disabled
                                        sx={{ backgroundColor: '#f5f5f5' }}
                                    />
                                </FormControl>
                            </div>
                        </div>

                        <div className="row mt-2">
                            <Box sx={{ width: '100%' }}>
                                <Tabs
                                    value={value}
                                    onChange={(event, newValue) => setValue(newValue)}
                                    textColor="secondary"
                                    indicatorColor="secondary"
                                    aria-label="secondary tabs example"
                                >
                                    <Tab value={0} label="Reporting Head" />
                                    <Tab value={1} label="Clearance" />
                                </Tabs>
                            </Box>
                            <Box sx={{ padding: 2 }}>
                                {/* Reporting Head Tab */}
                                {value === 0 && (
                                    <>
                                        <div className="row d-flex ml">
                                            <div className="mb-1">
                                                <ActionButton title="Add Reporting Head" icon={AddIcon} onClick={handleAddReportingHeadRow} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered table-responsive">
                                                            <thead>
                                                                <tr style={{
                                                                    background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                    color: 'white'
                                                                }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '5px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '10px' }}>
                                                                        Sl. No.
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '45%' }}>
                                                                        Employee Name
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '40%' }}>
                                                                        Employee Code
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {reportingHeadsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() =>
                                                                                    handleDeleteRow(row.id, reportingHeadsData, setReportingHeadsData, reportingHeadsErrors, setReportingHeadsErrors)
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <div className="pt-2">{index + 1}</div>
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <Autocomplete
                                                                                options={employeesList}
                                                                                getOptionLabel={(option) => option.employeeName || ""}
                                                                                value={employeesList.find((emp) => emp.employeeName === row.employee) || null}
                                                                                onChange={(event, newValue) => {
                                                                                    if (newValue) {
                                                                                        handleReportingHeadSelect(index, newValue);
                                                                                    }
                                                                                }}
                                                                                size="small"
                                                                                sx={{
                                                                                    width: "100%",
                                                                                    "& .MuiOutlinedInput-root": {
                                                                                        borderRadius: "10px",
                                                                                        backgroundColor: "#fff"
                                                                                    }
                                                                                }}
                                                                                renderInput={(params) => (
                                                                                    <TextField
                                                                                        {...params}
                                                                                        error={Boolean(reportingHeadsErrors[index]?.employee)}
                                                                                        helperText={reportingHeadsErrors[index]?.employee || ""}
                                                                                        placeholder="Select employee"
                                                                                    />
                                                                                )}
                                                                                renderOption={(props, option) => (
                                                                                    <li {...props}>
                                                                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                                                                            <span style={{ fontWeight: 500 }}>
                                                                                                {option.employeeName}
                                                                                            </span>
                                                                                        </div>
                                                                                    </li>
                                                                                )}
                                                                                disabled={!formData.departmentId}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                value={row.employeeCode}
                                                                                disabled
                                                                                size="small"
                                                                                fullWidth
                                                                                sx={{ backgroundColor: '#f5f5f5' }}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Clearance Tab with Select Field */}
                                {value === 1 && (
                                    <>
                                        <div className="row d-flex ml">
                                            <div className="mb-1">
                                                <ActionButton title="Add Clearance" icon={AddIcon} onClick={handleAddClearanceRow} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered table-responsive">
                                                            <thead>
                                                                <tr style={{
                                                                    background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                    color: 'white'
                                                                }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '5px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '10px' }}>
                                                                        Sl. No.
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '45%' }}>
                                                                        Clearance Item
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '40%' }}>
                                                                        Asset Code
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {clearanceData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() =>
                                                                                    handleDeleteRow(row.id, clearanceData, setClearanceData, clearanceErrors, setClearanceErrors)
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <div className="pt-2">{index + 1}</div>
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <Autocomplete
                                                                                options={
                                                                                    assetList.filter(
                                                                                        (asset) =>
                                                                                            !clearanceData.some(
                                                                                                (item, i) =>
                                                                                                    i !== index && item.assetId === asset.id
                                                                                            )
                                                                                    )
                                                                                }
                                                                                getOptionLabel={(option) => option.assetName || ""}
                                                                                value={
                                                                                    assetList.find((asset) => asset.id === row.assetId) || null
                                                                                }
                                                                                onChange={(event, newValue) => {
                                                                                    if (newValue) {
                                                                                        handleAssetSelect(index, newValue);
                                                                                    } else {
                                                                                        handleClearanceChange(
                                                                                            { target: { value: "" } },
                                                                                            index,
                                                                                            "clearanceName"
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                loading={assetLoading}
                                                                                size="small"
                                                                                renderInput={(params) => (
                                                                                    <TextField
                                                                                        {...params}
                                                                                        label="Select Clearance Item"
                                                                                        error={Boolean(clearanceErrors[index]?.clearanceName)}
                                                                                        helperText={clearanceErrors[index]?.clearanceName || ""}
                                                                                    />
                                                                                )}
                                                                                renderOption={(props, option) => (
                                                                                    <li {...props}>
                                                                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                                                            <Typography fontWeight={500}>
                                                                                                {option.assetName}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </li>
                                                                                )}
                                                                                disabled={assetLoading}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                value={row.assetCode || ''}
                                                                                disabled
                                                                                size="small"
                                                                                fullWidth
                                                                                placeholder="Asset code will auto-populate"
                                                                                sx={{ backgroundColor: '#f5f5f5' }}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Box>
                        </div>
                    </>
                ) : (
                    <CommonListViewTable
                        columns={listViewColumns}
                        data={data}
                        blockEdit={true}
                        toEdit={getExitQuestionsById}
                        enableEditing={true}
                    />
                )}
            </div>
        </>
    );
};

export default DepartmentHead;