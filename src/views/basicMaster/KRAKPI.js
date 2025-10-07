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
    Checkbox
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
const KRAKPI = () => {
    const [listViewData, setListViewData] = useState([]);
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
    const [detailsTableData, setDetailsTableData] = useState([
        { id: null, kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
    ]);

    const [detailsTableErrors, setDetailsTableErrors] = useState([
        { kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
    ]);

    const listViewColumns = [
        { accessorKey: 'appraisalId', header: 'Appraisal ID', size: 140 },
    ];

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const updatedValue = value;

        setFormData(prev => ({
            ...prev,
            [name]: updatedValue
        }));

        setFieldErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    useEffect(() => {
        getAllKRAKPIs();
    }, []);

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
                        kpiKraDescription: detail.kpiDescription
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
            ...(row.id && { id: row.id }), // Include ID if exists
            kpiDescription: row.kpiDescription,
            kpiId: row.kpiId
        }));

        const kpiKraDetailsVo = detailsTableData.map(row => ({
            ...(row.id && { id: row.id }), // Include ID if exists
            kpiDescription: row.kpiKraDescription,
            kpiId: row.kpiId,
            kraDescription: row.kraDescription,
            kraId: row.kraId,
            ro: row.ro
        }));

        const payload = {
            ...(editId && { id: editId }),
            appraisalId: formData.appraisalId,
            createdBy: loginUserName,
            kpiDTO: kpiVo,
            kpiKraDetailsDTO: kpiKraDetailsVo,
            orgId: orgId,   
            finYear: '2025',
            branchCode:branchCode,
            branch:branch,
        };

        try {
            const response = await apiCalls('put', '/goalsController/createUpdateKpiKra', payload);
            if (response.status) {
                showToast('success', editId ? 'KRAKPI updated successfully' : 'KRAKPI created successfully');
                handleClear();
                getAllKRAKPIs();
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
        if (kpiDetailsData.length > 0) {
            const lastRow = kpiDetailsData[kpiDetailsData.length - 1];

            // Validate last row before adding new one
            if (!lastRow.kpiId || !lastRow.kpiDescription) {
                const newErrors = [...goalsDetailsErrors];
                const lastIndex = newErrors.length - 1;
                newErrors[lastIndex] = {
                    kpiId: !lastRow.kpiId ? 'KPI Id is required' : '',
                    kpiDescription: !lastRow.kpiDescription ? 'KPI Description is required' : '',
                };
                setGoalsDetailsErrors(newErrors);
                showToast('warning', 'Please fill current row before adding new');
                return;
            }
        }

        // Generate unique temporary ID
        const newId = kpiDetailsData.length > 0
            ? Math.min(...kpiDetailsData.map(d => d.id)) - 1
            : -1;

        // Add new row with correct keys
        setkpiDetailsData(prev => [
            ...prev,
            { id: newId, kpiId: '', kpiDescription: '' }
        ]);

        setGoalsDetailsErrors(prev => [
            ...prev,
            { kpiId: '', kpiDescription: '' }
        ]);
    };

    const handleAddRow1 = () => {
        if (detailsTableData.length === 0) {
            // Generate temporary ID for first row
            const newId = -1;

            setDetailsTableData([
                { id: newId, kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
            ]);

            setDetailsTableErrors([
                { kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
            ]);
            return;
        }

        const lastRow = detailsTableData[detailsTableData.length - 1];

        // Validate last row before adding new one
        if (!lastRow.kraId || !lastRow.kraDescription || !lastRow.kpiId || !lastRow.kpiKraDescription) {
            const newErrors = [...detailsTableErrors];
            const lastIndex = newErrors.length - 1;
            newErrors[lastIndex] = {
                kraId: !lastRow.kraId ? 'KRA Id is required' : '',
                kraDescription: !lastRow.kraDescription ? 'KRA Description is required' : '',
                kpiId: !lastRow.kpiId ? 'KPI Id is required' : '',
                kpiKraDescription: !lastRow.kpiKraDescription ? 'KPI Description is required' : ''
            };
            setDetailsTableErrors(newErrors);
            showToast('warning', 'Please fill current row before adding new');
            return;
        }

        // Generate temporary negative ID for new rows
        const newId = detailsTableData.length > 0
            ? Math.min(...detailsTableData.map(d => d.id)) - 1
            : -1;

        setDetailsTableData(prev => [
            ...prev,
            { id: newId, kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
        ]);

        setDetailsTableErrors(prev => [
            ...prev,
            { kraId: '', kraDescription: '', ro: '', kpiId: '', kpiKraDescription: '' }
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

        if (value) {
            const newErrors = [...goalsDetailsErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setGoalsDetailsErrors(newErrors);
        }
    };

    const handleDetailChange = (id, field, value) => {
        const index = detailsTableData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = [...detailsTableData];
        newData[index] = { ...newData[index], [field]: value };
        setDetailsTableData(newData);

        if (value) {
            const newErrors = [...detailsTableErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setDetailsTableErrors(newErrors);
        }
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);

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
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Appraisal ID"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="appraisalId"
                                        value={formData.appraisalId}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.appraisalId}
                                        helperText={fieldErrors.appraisalId}
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
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '100px' }}>
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
                                            <div className="mb-1">
                                                <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
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
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '100px' }}>
                                                                        KRA ID
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KRA DESCRIPTION
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '100px' }}>
                                                                        R/O
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '100px' }}>
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
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.ro}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'ro', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.ro}
                                                                                helperText={detailsTableErrors[index]?.ro}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kpiId}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'kpiId', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.kpiId}
                                                                                helperText={detailsTableErrors[index]?.kpiId}
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