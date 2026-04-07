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
    Autocomplete
} from '@mui/material';
import dayjs from 'dayjs';
import GridOnIcon from '@mui/icons-material/GridOn';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
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

const ActionButtonTab = ({ title, icon: Icon, onClick, ...props }) => {
    return (
        <Button
            variant="contained"
            size="small"
            startIcon={Icon ? <Icon /> : null}
            onClick={onClick}
            {...props}
        >
            {title} {/* ✅ THIS IS IMPORTANT */}
        </Button>
    );
};

const KRAKPI = () => {
    const [listViewData, setListViewData] = useState([]);
    const [appraisalOptions, setAppraisalOptions] = useState([]);
    const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
    const [branch, setBranch] = useState(localStorage.getItem('branch'));
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [fillGridData, setFillGridData] = useState([]);
    const [currentKpiId, setCurrentKpiId] = useState('');
    const [currentKraId, setCurrentKraId] = useState('');
    const [reportingPersonList, setReportingPersonList] = useState([]);
    const [formData, setFormData] = useState({
        appraisalId: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
        appraisalId: ''
    });

    const [kpiDetailsData, setkpiDetailsData] = useState([
        { id: null, kpiId: '', kpiDescription: '' }
    ]);

    const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([
        { kpiId: '', kpiDescription: '' }
    ]);
    // Update the initial state to include kpiObj
    const [detailsTableData, setDetailsTableData] = useState([
        {
            id: null,
            kraId: '',
            kraDescription: '',
            ro: '',
            kpiId: '',
            kpiKraDescription: '',
            kpiObj: null  // Add this
        }
    ]);

    const [detailsTableErrors, setDetailsTableErrors] = useState([
        { kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
    ]);

    const listViewColumns = [
        { accessorKey: 'appraisalId', header: 'Appraisal ID', size: 140 },
    ];

    useEffect(() => {
        getAllKRAKPIs();
        getAppraisalDocId();
        getKpiDocId();
        getKraDocId();
        getAllReportingPersonList();
    }, []);

    useEffect(() => {
        const init = async () => {
            const kpiDocId = await getKpiDocId();
            const kraDocId = await getKraDocId();

            setCurrentKpiId(kpiDocId);
            setCurrentKraId(kraDocId);

            setkpiDetailsData([
                { id: null, kpiId: kpiDocId, kpiDescription: '' }
            ]);

            setDetailsTableData([
                {
                    id: null,
                    kraId: kraDocId,
                    kraDescription: '',
                    ro: '',
                    kpiId: '',
                    kpiObj: null,
                    kpiKraDescription: ''
                }
            ]);
        };

        init();
    }, []);

    const getAppraisalDocId = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getAppraisalDocId?orgId=${orgId}`);

            const list = response.paramObjectsMap.goalsVO || [];

            const options = list.map((item) => ({
                label: `${item.appraisalId} - ${item.department}`,
                value: item.appraisalId,
                department: item.department
            }));

            setAppraisalOptions(options);

        } catch (error) {
            console.error('Error fetching goals docid:', error);
            showToast('error', 'Failed to fetch goals docid');
        }
    };

    const getKpiDocId = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getKpiDocId?orgId=${orgId}`);
            return response?.paramObjectsMap?.kpiDocId || '';
        } catch (error) {
            console.error('Error fetching KPI Doc ID:', error);
            return '';
        }
    };

    const getKraDocId = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getKraDocId?orgId=${orgId}`);
            return response?.paramObjectsMap?.kpiDocId || '';
        } catch (error) {
            console.error('Error fetching KRA Doc ID:', error);
            return '';
        }
    };

    const getAllKRAKPIs = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getKpiKraByOrgId?orgId=${orgId}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.kpiKraVO);
            } else {
                showToast('error', response.message || 'Failed to fetch KPIKRA');
            }
        } catch (error) {
            console.error('Error fetching KPIKRA:', error);
            showToast('error', 'Failed to fetch KPIKRA');
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
                value: emp.employeeCode,
                email: emp.email,
                role: emp.role
            }));

            setReportingPersonList(mappedList); // ✅ FIXED
        } catch (err) {
            console.log('Error fetching notify list', err);
        }
    };

    const getKraKpiById = async (row) => {
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `/goalsController/getKpiKraById?id=${row.original.id}`);
            if (response.status) {
                setListView(false);
                const goal = response.paramObjectsMap.kpiKraVO;
                setFormData({
                    appraisalId: goal.appraisalId
                });

                // Preserve actual database IDs
                setkpiDetailsData(
                    goal.kpiVO.map(detail => ({
                        id: detail.id,
                        kpiId: detail.kpiId,
                        kpiDescription: detail.kpiDescription
                    }))
                );

                setDetailsTableData(
                    goal.kpiKraDetailsVO.map(detail => ({
                        id: detail.id,
                        kraId: detail.kraId,
                        kraDescription: detail.kraDescription,
                        ro: detail.ro,
                        kpiId: detail.kpiId,
                        kpiKraDescription: detail.kpiDescription,

                        // ✅ ADD THIS
                        kpiObj: {
                            value: detail.kpiId,
                            label: `${detail.kpiId} - ${detail.kpiDescription}`,
                            description: detail.kpiDescription
                        }
                    }))
                );

                // Initialize errors arrays
                setGoalsDetailsErrors(
                    goal.kpiVO.map(() => ({ kpiId: '', kpiDescription: '' }))
                );

                setDetailsTableErrors(
                    goal.kpiKraDetailsVO.map(() => ({
                        kraId: '',
                        kraDescription: '',
                        ro: '',
                        kpiId: '',
                        kpiKraDescription: ''
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching goal details:', error);
            showToast('error', 'Failed to fetch goal details');
        }
    };

    const handleSave = async () => {
        // Validate main form fields
        const errors = {};
        if (!formData.appraisalId) errors.appraisalId = 'Appraisal ID is required';

        // Validate KPI details
        const detailsErrors = kpiDetailsData.map((detail, index) => {
            const error = {};
            if (!detail.kpiId) error.kpiId = 'KPI Id is required';
            if (!detail.kpiDescription) error.kpiDescription = 'KPI Description is required';
            return error;
        });

        // Validate Details tab
        const detailsTableErrs = detailsTableData.map((detail, index) => {
            const error = {};
            if (!detail.kraId) error.kraId = 'KRA Id is required';
            if (!detail.kraDescription) error.kraDescription = 'KRA Description is required';
            if (!detail.kpiId) error.kpiId = 'KPI Id is required';
            if (!detail.kpiKraDescription) error.kpiKraDescription = 'KPI Description is required';
            return error;
        });

        const hasKpiErrors = detailsErrors.some(err => err.kpiId || err.kpiDescription);
        const hasDetailErrors = detailsTableErrs.some(err =>
            err.kraId || err.kraDescription || err.kpiId || err.kpiKraDescription
        );

        if (Object.keys(errors).length > 0 || hasKpiErrors || hasDetailErrors) {
            setFieldErrors(errors);
            setGoalsDetailsErrors(detailsErrors);
            setDetailsTableErrors(detailsTableErrs);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        // Prepare details payload with IDs
        const kpiVo = kpiDetailsData.map(row => ({
            // ...(row.id && { id: row.id }), // Include ID if exists
            kpiDescription: row.kpiDescription,
            kpiId: row.kpiId
        }));

        const kpiKraDetailsVo = detailsTableData.map(row => ({
            // ...(row.id && { id: row.id }), // Include ID if exists
            kpiDescription: row.kpiKraDescription,
            kpiId: row.kpiId,
            kraDescription: row.kraDescription,
            kraId: row.kraId,
            ro: row.ro
        }));

        const payload = {
            ...(editId && { id: editId }),
            active: true,
            appraisalId: formData.appraisalId,
            createdBy: loginUserName,
            kpiDTO: kpiVo,
            kpiKraDetailsDTO: kpiKraDetailsVo,
            orgId: orgId,
            finYear: '2025',
            branchCode: branchCode,
            branch: branch,
        };

        try {
            const response = await apiCalls('put', '/goalsController/createUpdateKpiKra', payload);
            if (response.status) {
                showToast('success', editId ? 'KRAKPI updated successfully' : 'KRAKPI created successfully');
                handleClear();
                getAllKRAKPIs();
                getKpiDocId();
                getKraDocId();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving KRAKPI:', error);
            showToast('error', 'Failed to save KRAKPI');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            appraisalId: ''
        });

        setFieldErrors({
            appraisalId: ''
        });

        setkpiDetailsData([
            { id: null, kpiId: '', kpiDescription: '' }
        ]);

        setGoalsDetailsErrors([
            { kpiId: '', kpiDescription: '' }
        ]);

        setDetailsTableData([
            { id: null, kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
        ]);

        setDetailsTableErrors([
            { kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
        ]);

        setEditId('');
    };

    const incrementDocId = (docId) => {
        if (!docId) return '';

        const prefix = docId.replace(/\d+$/, ''); // KPI
        const number = parseInt(docId.replace(/\D/g, ''), 10); // 18

        const nextNumber = number + 1;

        return `${prefix}${String(nextNumber).padStart(5, '0')}`;
    };

    const handleDeleteKpiRow = (id) => {
        if (kpiDetailsData.length <= 1) {
            showToast('warning', 'At least one KPI is required');
            return;
        }

        const index = kpiDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = kpiDetailsData.filter(d => d.id !== id);
        const newErrors = goalsDetailsErrors.filter((_, i) => i !== index);

        setkpiDetailsData(newData);
        setGoalsDetailsErrors(newErrors);
    };

    const handleAddRow = () => {
        const newId =
            kpiDetailsData.length > 0
                ? Math.min(...kpiDetailsData.map((d) => d.id)) - 1
                : -1;

        const nextKpiId = incrementDocId(currentKpiId);

        setCurrentKpiId(nextKpiId);

        setkpiDetailsData((prev) => [
            ...prev,
            {
                id: newId,
                kpiId: nextKpiId,
                kpiDescription: ''
            }
        ]);
    };

    const handleAddRow1 = () => {
        const newId =
            detailsTableData.length > 0
                ? Math.min(...detailsTableData.map((d) => d.id)) - 1
                : -1;

        setDetailsTableData((prev) => [
            ...prev,
            {
                id: newId,
                kraId: currentKraId, // ✅ SAME KRA ID
                kraDescription: '',
                ro: '',
                kpiId: '',
                kpiKraDescription: '',
                kpiObj: null
            }
        ]);
    };

    const handleNewKra = () => {
        const nextKraId = incrementDocId(currentKraId);
        setCurrentKraId(nextKraId);

        const newId =
            detailsTableData.length > 0
                ? Math.min(...detailsTableData.map((d) => d.id)) - 1
                : -1;

        setDetailsTableData((prev) => [
            ...prev,
            {
                id: newId,
                kraId: nextKraId,
                kraDescription: '',
                ro: '',
                kpiId: '',
                kpiKraDescription: '',
                kpiObj: null
            }
        ]);
    };

    const handleDeleteDetailRow = (id) => {
        if (detailsTableData.length <= 1) {
            showToast('warning', 'At least one detail is required');
            return;
        }

        const index = detailsTableData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = detailsTableData.filter(d => d.id !== id);
        const newErrors = detailsTableErrors.filter((_, i) => i !== index);

        setDetailsTableData(newData);
        setDetailsTableErrors(newErrors);
    };

    const handleKpiChange = (id, field, value) => {
        const index = kpiDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = [...kpiDetailsData];
        newData[index] = { ...newData[index], [field]: value };
        setkpiDetailsData(newData);

        // Update the matching rows in details table
        const updatedDetails = detailsTableData.map((row) => {
            if (row.kpiId === kpiDetailsData[index].kpiId) {
                return {
                    ...row,
                    [field]: value,
                    // If kpiId changes, update the kpiObj reference
                    ...(field === 'kpiId' && {
                        kpiObj: {
                            kpiId: value,
                            label: `${value} - ${row.kpiKraDescription}`,
                            description: row.kpiKraDescription
                        }
                    })
                };
            }
            return row;
        });

        setDetailsTableData(updatedDetails);
    };

    const handleDetailChange = (id, field, value) => {
        const index = detailsTableData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = [...detailsTableData];

        if (field === 'kpiId') {
            // When KPI ID changes, also update kpiObj
            const selectedKpi = kpiOptions.find(opt => String(opt.kpiId) === String(value));
            newData[index] = {
                ...newData[index],
                kpiId: value,
                kpiKraDescription: selectedKpi?.description || '',
                kpiObj: selectedKpi || null
            };
        } else if (field === 'kpiKraDescription') {
            newData[index] = {
                ...newData[index],
                [field]: value,
                kpiObj: newData[index].kpiObj ? {
                    ...newData[index].kpiObj,
                    description: value,
                    label: `${newData[index].kpiId} - ${value}`
                } : null
            };
        } else {
            newData[index] = { ...newData[index], [field]: value };
        }

        setDetailsTableData(newData);

        // Clear error if field has value
        if (value) {
            const newErrors = [...detailsTableErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setDetailsTableErrors(newErrors);
        }
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);

    const kpiOptions = kpiDetailsData
        .filter(item => item.kpiId && item.kpiId.toString().trim() !== '') // filter out empty rows
        .map((item) => ({
            kpiId: item.kpiId,
            label: `${item.kpiId} - ${item.kpiDescription}`,
            description: item.kpiDescription
        }));

    const selectedKpiIds = detailsTableData
        .map(row => row.kpiId)
        .filter(id => id); // remove empty

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
                                {/* Form Fields */}
                                <div className="col-md-4 mb-3">
                                    <Autocomplete
                                        options={appraisalOptions}
                                        getOptionLabel={(option) => option.label || ''}
                                        value={
                                            appraisalOptions.find((opt) => opt.value === formData.appraisalId) || null
                                        }
                                        onChange={(event, newValue) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                appraisalId: newValue?.value || '',
                                                department: newValue?.department || '' // optional if needed
                                            }));

                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                appraisalId: ''
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Appraisal ID"
                                                size="small"
                                                error={!!fieldErrors.appraisalId}
                                                helperText={fieldErrors.appraisalId}
                                            />
                                        )}
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
                                        <Tab value={0} label="KPI's" />
                                        <Tab value={1} label="Details" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-8">
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
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                                                        KPI ID
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KPI DESCRIPTION
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {kpiDetailsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() => handleDeleteKpiRow(row.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center pt-3">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kpiId}
                                                                                InputProps={{ readOnly: true }}
                                                                                onChange={(e) =>
                                                                                    handleKpiChange(row.id, 'kpiId', e.target.value)
                                                                                }
                                                                                error={!!goalsDetailsErrors[index]?.kpiId}
                                                                                helperText={goalsDetailsErrors[index]?.kpiId}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kpiDescription}
                                                                                onChange={(e) =>
                                                                                    handleKpiChange(row.id, 'kpiDescription', e.target.value)
                                                                                }
                                                                                error={!!goalsDetailsErrors[index]?.kpiDescription}
                                                                                helperText={goalsDetailsErrors[index]?.kpiDescription}
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
                                <Box sx={{ padding: 2 }}>
                                    {value === 1 && (
                                        <>
                                            <div className="mb-1 d-flex gap-2">
                                                <ActionButtonTab
                                                    title="Add"
                                                    icon={AddIcon}
                                                    onClick={handleAddRow1}
                                                />

                                                <ActionButtonTab
                                                    title="Add New KRA"
                                                    icon={AddIcon}
                                                    onClick={handleNewKra}
                                                />
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
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                                                        KRA ID
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KRA DESCRIPTION
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                                                        R/O
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                                                        KPI ID
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KPI DESCRIPTION
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {detailsTableData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() => handleDeleteDetailRow(row.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center pt-3">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kraId}
                                                                                InputProps={{ readOnly: true }}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'kraId', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.kraId}
                                                                                helperText={detailsTableErrors[index]?.kraId}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kraDescription}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'kraDescription', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.kraDescription}
                                                                                helperText={detailsTableErrors[index]?.kraDescription}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Autocomplete
                                                                                options={reportingPersonList}
                                                                                getOptionLabel={(option) => option.label || ''}

                                                                                value={
                                                                                    reportingPersonList.find(opt => opt.value === row.ro) || null
                                                                                }

                                                                                onChange={(event, newValue) => {
                                                                                    handleDetailChange(row.id, 'ro', newValue?.value || '');
                                                                                }}

                                                                                renderInput={(params) => (
                                                                                    <TextField
                                                                                        {...params}
                                                                                        size="small"
                                                                                        placeholder="Select Reporting Person"
                                                                                        error={!!detailsTableErrors[index]?.ro}
                                                                                        helperText={detailsTableErrors[index]?.ro}
                                                                                    />
                                                                                )}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Autocomplete
                                                                                options={kpiOptions.filter(opt => {
                                                                                    if (opt.kpiId === row.kpiId) return true;
                                                                                    return !selectedKpiIds.includes(opt.kpiId);
                                                                                })}
                                                                                getOptionLabel={(option) => {
                                                                                    if (typeof option === 'string') {
                                                                                        const found = kpiOptions.find(opt => opt.kpiId === option);
                                                                                        return found ? found.label : option;
                                                                                    }
                                                                                    return option.label || '';
                                                                                }}

                                                                                value={(() => {
                                                                                    if (row.kpiObj && row.kpiObj.kpiId) {
                                                                                        return row.kpiObj;
                                                                                    }
                                                                                    if (row.kpiId) {
                                                                                        const found = kpiOptions.find(opt => opt.kpiId === row.kpiId);
                                                                                        if (found) {
                                                                                            return found;
                                                                                        }
                                                                                    }
                                                                                    return null;
                                                                                })()}

                                                                                isOptionEqualToValue={(option, value) => {
                                                                                    if (!value) return false;
                                                                                    return option.kpiId === value.kpiId;
                                                                                }}

                                                                                onChange={(event, newValue) => {
                                                                                    const index = detailsTableData.findIndex(d => d.id === row.id);
                                                                                    if (index === -1) return;

                                                                                    const newData = [...detailsTableData];

                                                                                    newData[index] = {
                                                                                        ...newData[index],
                                                                                        kpiId: newValue?.kpiId || '',
                                                                                        kpiKraDescription: newValue?.description || '',
                                                                                        kpiObj: newValue || null
                                                                                    };

                                                                                    setDetailsTableData(newData);

                                                                                    // clear error
                                                                                    const newErrors = [...detailsTableErrors];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        kpiId: '',
                                                                                        kpiKraDescription: ''
                                                                                    };
                                                                                    setDetailsTableErrors(newErrors);
                                                                                }}

                                                                                renderInput={(params) => (
                                                                                    <TextField
                                                                                        {...params}
                                                                                        size="small"
                                                                                        placeholder="Select KPI"
                                                                                        error={!!detailsTableErrors[index]?.kpiId}
                                                                                        helperText={detailsTableErrors[index]?.kpiId}
                                                                                    />
                                                                                )}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kpiKraDescription}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'kpiKraDescription', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.kpiKraDescription}
                                                                                helperText={detailsTableErrors[index]?.kpiKraDescription}
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
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getKraKpiById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default KRAKPI;