// src/components/DeclarationInput.js
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Box, Tab, Tabs, FormControlLabel, Checkbox } from '@mui/material';
import { useState, useEffect } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';


const DeclarationInput = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [createdBy] = useState(localStorage.getItem('userName'));
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const finYear = localStorage.getItem('finYear') || '2024-2025'; // Example default


    const [formData, setFormData] = useState({
        branch: localStorage.getItem('branch') || '',
        employeeCode: localStorage.getItem('employeeCode') || '',
        employeeName: localStorage.getItem('employeeName') || '',
        branchCode: localStorage.getItem('branchCode') || '',
        department: localStorage.getItem('department') || '',
    });

    const [fieldErrors, setFieldErrors] = useState({
        branch: '',
        branchCode: '',
        employeeCode: '',
        department: '',
        employeeName: '',
        finYear: ''
    });

    const listViewColumns = [
        { accessorKey: 'branch', header: 'Branch', size: 140 },
        { accessorKey: 'branchCode', header: 'Branch Code', size: 140 },
        { accessorKey: 'employeeCode', header: 'Employee Code', size: 140 },
        { accessorKey: 'employeeName', header: 'Employee Name', size: 140 },
        { accessorKey: 'department', header: 'Department', size: 140 }
    ];

    const getAllGoals = async () => {
        try {
            const response = await apiCalls('get', `/managetax/getAllDeclarationByOrgId?orgId=${orgId}&finYear=${finYear}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.declarationVO);
            } else {
                showToast('error', response.message || 'Failed to fetch declarations');
            }
        } catch (error) {
            console.error('Error fetching declarations:', error);
            showToast('error', 'Failed to fetch declarations');
        }
    };


    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const updatedValue = type === 'checkbox' ? checked : value;

        setFormData((prev) => ({
            ...prev,
            [name]: updatedValue
        }));

        setFieldErrors((prev) => ({
            ...prev,
            [name]: ''
        }));
    };

    useEffect(() => {
        getAllGoals();
    }, []);

    // const getGoalsById = async (row) => {
    //     setEditId(row.original.id);
    //     try {
    //         const response = await apiCalls('get', `/managetax/getDeclarationById?id=${row.original.id}`);
    //         if (response.status) {
    //             setListView(false);
    //             const goal = response.paramObjectsMap.selfGoalsVO;
    //             setFormData({
    //                 branch: goal.branch,
    //                 branchCode: goal.branchCode,
    //                 employeeCode: goal.employeeCode,
    //                 employeeName: goal.employeeName,
    //                 department: goal.department,
    //                 orgId: parseInt(orgId),
    //                 finYear: finYear
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error fetching goal details:', error);
    //         showToast('error', 'Failed to fetch goal details');
    //     }
    // };

    const handleSave = async () => {
        const errors = {};
        if (!formData.branch) errors.branch = 'Branch is required';
        if (!formData.branchCode) errors.branchCode = 'Branch Code is required';
        if (!formData.employeeCode) errors.employeeCode = 'Employee Code is required';
        if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
        if (!formData.department) errors.department = 'Department is required';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fill all required fields');
            return;
        }
        setIsLoading(true);

        const payload = {
            ...(editId && { id: editId }),
            branch: formData.branch,
            branchCode: formData.branchCode,
            department: formData.department,
            employeeCode: formData.employeeCode,
            employeeName: formData.employeeName,
            orgId,
            finYear,
            createdBy,
        };

        try {
            const response = await apiCalls('put', '/managetax/createUpdateDeclaration', payload);
            if (response.status) {
                showToast('success', editId ? 'Declaration updated successfully' : 'Declaration created successfully');
                handleClear();
                getAllGoals();
            } else {
                showToast('error', response.message || 'Failed to save declaration');
            }
        } catch (error) {
            console.error('Error saving declaration:', error);
            showToast('error', 'Something went wrong while saving');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            branch: localStorage.getItem('branch') || '',
            employeeCode: localStorage.getItem('employeeCode') || '',
            employeeName: localStorage.getItem('employeeName') || '',
            branchCode: localStorage.getItem('branchCode') || '',
            department: localStorage.getItem('department') || '',
        });

        setFieldErrors({
            branch: '',
            branchCode: '',
            employeeCode: '',
            employeeName: '',
            department: ''
        });
        setEditId('');
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);

    return (
        <>
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
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Employee Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="employeeCode"
                                        value={formData.employeeCode}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.employeeCode}
                                        helperText={fieldErrors.employeeCode}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Employee Name"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="employeeName"
                                        value={formData.employeeName}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.employeeName}
                                        helperText={fieldErrors.employeeName}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Branch"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.branch}
                                        helperText={fieldErrors.branch}
                                        disabled
                                    />
                                </div>

                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Branch Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="branchCode"
                                        value={formData.branchCode}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.branchCode}
                                        helperText={fieldErrors.branchCode}
                                        disabled
                                    />
                                </div>

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
                                        disabled
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={false} />
                    )}
                </div>
            </div>
        </>
    );
};

export default DeclarationInput;