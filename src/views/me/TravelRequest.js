import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FormHelperText, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const TravelRequest = () => {
    const [listView, setListView] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [listViewData, setListViewData] = useState([]);
    const orgId = parseInt(localStorage.getItem('orgId')) || 0;
    const loginUserName = localStorage.getItem('userName') || '';
    const branch = localStorage.getItem('branch') || '';
    const branchCode = localStorage.getItem('branchCode') || '';
    const employeeCode = loginUserName;
    const employeeName = loginUserName;

    const [formData, setFormData] = useState({
        fromDate: '',
        toDate: '',
        travelReason: '',
        modeOfTravel: '',
        approvingAuthorities: '',
        employeeCode,
        employeeName,
        finYear: new Date().getFullYear().toString(),
        branch,
        branchCode,
        createdBy: loginUserName,
        orgId
    });

    const [fieldErrors, setFieldErrors] = useState({
        fromDate: '',
        toDate: '',
        travelReason: '',
        modeOfTravel: '',
        approvingAuthorities: ''
    });

    const listViewColumns = [
        { accessorKey: 'fromDate', header: 'From Date', size: 140 },
        { accessorKey: 'toDate', header: 'To Date', size: 140 },
        { accessorKey: 'travelReason', header: 'Reason', size: 180 },
        { accessorKey: 'modeOfTravel', header: 'Travel Mode', size: 140 },
        { accessorKey: 'approvingAuthorities', header: 'Approver', size: 180 },
        { accessorKey: 'status', header: 'Status', size: 140 },
    ];

    useEffect(() => {
        getTravelRequestsByOrgId();
    }, []);

    const getTravelRequestsByOrgId = async () => {
        try {
            const response = await apiCalls('get', `/leaveprocess/getTravelRequestByOrgId?orgId=${orgId}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.travelRequestVO || []);
            } else {
                showToast('error', response.message || 'Failed to fetch travel requests');
            }
        } catch (error) {
            console.error('Error fetching travel requests:', error);
            showToast('error', 'Failed to fetch travel requests');
        }
    };

    const getTravelRequestById = async (row) => {
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `/leaveprocess/getTravelRequestById?id=${row.original.id}`);
            if (response.status === true) {
                setListView(false);
                const travelDetails = response.paramObjectsMap.travelRequestVO;

                setFormData({
                    ...formData,
                    fromDate: travelDetails.fromDate || '',
                    toDate: travelDetails.toDate || '',
                    travelReason: travelDetails.travelReason || '',
                    modeOfTravel: travelDetails.modeOfTravel || '',
                    approvingAuthorities: travelDetails.approvingAuthorities || ''
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFieldErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleDateChange = (field, date) => {
        const dateString = date ? date.format('YYYY-MM-DD') : '';
        setFormData(prev => ({
            ...prev,
            [field]: dateString
        }));
        setFieldErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    const handleSave = async () => {
        const errors = {};

        // Validation
        if (!formData.fromDate) errors.fromDate = 'From Date is required';
        if (!formData.toDate) errors.toDate = 'To Date is required';
        if (!formData.travelReason) errors.travelReason = 'Reason is required';
        if (!formData.modeOfTravel) errors.modeOfTravel = 'Mode of Travel is required';
        if (!formData.approvingAuthorities) errors.approvingAuthorities = 'Approver is required';

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            const saveData = {
                ...(editId && { id: editId }),
                ...formData
            };

            try {
                const response = await apiCalls(
                    'put',
                    '/leaveprocess/createUpdateTravelRequest',
                    saveData
                );

                if (response.status === true) {
                    showToast('success', editId
                        ? 'Travel Request Updated Successfully'
                        : 'Travel Request created successfully'
                    );
                    handleClear();
                    getTravelRequestsByOrgId();
                } else {
                    showToast('error', response.paramObjectsMap?.errorMessage || 'Request failed');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('error', 'Request failed');
            } finally {
                setIsLoading(false);
            }
        } else {
            setFieldErrors(errors);
        }
    };

    const handleClear = () => {
        setFormData({
            fromDate: '',
            toDate: '',
            travelReason: '',
            modeOfTravel: '',
            approvingAuthorities: '',
            employeeCode,
            employeeName,
            finYear: new Date().getFullYear().toString(),
            branch,
            branchCode,
            createdBy: loginUserName,
            orgId
        });

        setFieldErrors({
            fromDate: '',
            toDate: '',
            travelReason: '',
            modeOfTravel: '',
            approvingAuthorities: ''
        });

        setEditId('');
    };

    const handleView = () => setListView(!listView);

    return (
        <>
            <ToastComponent />
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4">
                        <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
                        <ActionButton title="Reset" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton title="Apply" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
                    </div>

                    {!listView ? (
                        <div className="row">
                            {/* From Date */}
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth error={!!fieldErrors.fromDate}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="From Date"
                                            format="DD-MM-YYYY"
                                            value={formData.fromDate ? dayjs(formData.fromDate) : null}
                                            onChange={(date) => handleDateChange('fromDate', date)}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    error: !!fieldErrors.fromDate
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                    {fieldErrors.fromDate && (
                                        <FormHelperText error>{fieldErrors.fromDate}</FormHelperText>
                                    )}
                                </FormControl>
                            </div>

                            {/* To Date */}
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth error={!!fieldErrors.toDate}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="To Date"
                                            format="DD-MM-YYYY"
                                            value={formData.toDate ? dayjs(formData.toDate) : null}
                                            onChange={(date) => handleDateChange('toDate', date)}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    error: !!fieldErrors.toDate
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                    {fieldErrors.toDate && (
                                        <FormHelperText error>{fieldErrors.toDate}</FormHelperText>
                                    )}
                                </FormControl>
                            </div>

                            {/* Mode of Travel */}
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Mode of Travel"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="modeOfTravel"
                                    value={formData.modeOfTravel}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.modeOfTravel}
                                    helperText={fieldErrors.modeOfTravel}
                                />
                            </div>

                            {/* Approving Authorities */}
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Approving Authorities"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="approvingAuthorities"
                                    value={formData.approvingAuthorities}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.approvingAuthorities}
                                    helperText={fieldErrors.approvingAuthorities}
                                />
                            </div>

                            {/* Travel Reason */}
                            <div className="col-md-6 mb-3">
                                <TextField
                                    label="Travel Reason"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="travelReason"
                                    value={formData.travelReason}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.travelReason}
                                    helperText={fieldErrors.travelReason}
                                    multiline
                                    rows={2}
                                />
                            </div>
                        </div>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getTravelRequestById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default TravelRequest;