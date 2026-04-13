import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import UploadIcon from '@mui/icons-material/Upload';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const AppraiserReview = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [employeeName] = useState(localStorage.getItem('employeeName'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [department] = useState(localStorage.getItem('department'));
    const [designation] = useState(localStorage.getItem('designation'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [selectedMonth, setSelectedMonth] = useState('');
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(true);
    const [reportingPersonDetails, setReportingPersonDetails] = useState([]);
    const [employeeDetailsData, setEmployeeDetailsData] = useState({
        empCode: "",
        empName: "",
        department: "",
        designation: "",
        reportingHeadCode: "",
        reportingHead: "",
        reportingHeadDesignation: "",
        branch: ""
    });

    const [formData, setFormData] = useState({
        month: '',
        year: '',
        orgId: orgId
    });

    const [fieldErrors, setFieldErrors] = useState({
        month: '',
        year: '',
        orgId: orgId
    });

    const listViewColumns = [
        { accessorKey: 'empName', header: 'Employee', size: 140 },
        { accessorKey: 'empCode', header: 'Code', size: 140 },
        {
            accessorKey: 'pmonth',
            header: 'Month',
            size: 140,
            Cell: ({ cell }) => {
                const monthNumber = cell.getValue();
                const monthObj = months.find(m => m.value === monthNumber);
                return monthObj ? monthObj.name : monthNumber;
            }
        },
        { accessorKey: 'appraisalYear', header: 'Year', size: 140 },
    ];

    const [goalsDetailsData, setGoalsDetailsData] = useState([{
        id: null,
        perspective: '',
        objectiveDescription: '',
        assigned: '',
        measurement: '',
        qtrTarget: '',
        performance: '',
        comments: '',
        performanceSelf: '',
        selfRating: '',
        firstLevelSupervisor: '',  // ✅ From API - DISABLED
        appraiserRating: '',        // ✅ Admin can select - EDITABLE
        appraiserJustification: ''  // ✅ Admin can enter - EDITABLE
    }]);

    const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([{
        perspective: '',
        objectiveDescription: '',
        assigned: '',
        measurement: '',
        qtrTarget: '',
        performance: '',
        comments: '',
        performanceSelf: '',
        selfRating: '',
        firstLevelSupervisor: '',
        appraiserRating: '',
        appraiserJustification: ''
    }]);

    const months = [
        { name: 'January', value: '01' },
        { name: 'February', value: '02' },
        { name: 'March', value: '03' },
        { name: 'April', value: '04' },
        { name: 'May', value: '05' },
        { name: 'June', value: '06' },
        { name: 'July', value: '07' },
        { name: 'August', value: '08' },
        { name: 'September', value: '09' },
        { name: 'October', value: '10' },
        { name: 'November', value: '11' },
        { name: 'December', value: '12' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, index) => currentYear - index);

    useEffect(() => {
        getAllPerformanceGoals();
        const today = new Date();
        const currentMonth = months[today.getMonth()];
        const currentYear = today.getFullYear();
        setSelectedMonth(currentMonth.name);
        setFormData({ month: currentMonth.value, year: currentYear });
    }, []);

    useEffect(() => {
        if (loginUserName) {
            getReportingPerson();
        }
    }, [loginUserName]);

    const getReportingPerson = async () => {
        try {
            const response = await apiCalls('get', `/performancegoals/getReportingUserName?username=${loginUserName}`);
            const data = response?.paramObjectsMap?.getReportingUserName?.[0] || null;
            setReportingPersonDetails(data);
        } catch (error) {
            console.error('Error fetching reporting person details:', error);
            showToast('Error fetching reporting person details', 'error');
            setReportingPersonDetails(null);
        }
    };

    // ✅ Fetches supervisor ratings from the API
    const getSupervisorRatings = async (year, empCode) => {
        try {
            const response = await apiCalls(
                'get',
                `/performancegoals/getSupervisorRatings?appraisalYear=${year}&empCode=${empCode}&orgId=${orgId}`
            );

            if (response.status) {
                return response.paramObjectsMap.data || [];
            }
        } catch (error) {
            console.error('Error fetching supervisor ratings:', error);
        }
        return [];
    };

    const getAllPerformanceGoals = async () => {
        try {
            setIsLoading(true);
            const response = await apiCalls(
                'get',
                `/performancegoals/getPerformanceGoalsByOrgIdAndReportingPerson?orgId=${orgId}&reportingPerson=${employeeName}`
            );
            if (response.status) {
                setListViewData(response.paramObjectsMap.performanceGoalsVO || []);
            } else {
                showToast('error', response.message || 'Failed to fetch appraisees');
                setListViewData([]);
            }
        } catch (error) {
            console.error('Error fetching appraisees:', error);
            showToast('error', 'Failed to fetch appraisees');
            setListViewData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Updated: Maps supervisor ratings to First-Level Supervisor (disabled) and keeps Appraiser Rating editable
    const getPerformanceGoalsById = async (row) => {
        setEditId(row.original.id);
        setListView(false);
        setIsEditing(true);

        try {
            const response = await apiCalls('get', `/performancegoals/getPerformanceGoalsById?id=${row.original.id}`);

            if (response.status) {
                const appraisee = response?.paramObjectsMap?.performanceGoalsVO || {};

                setEmployeeDetailsData({
                    empCode: appraisee.empCode || '',
                    empName: appraisee.empName || '',
                    reportingHeadCode: appraisee.reportingHeadCode || '',
                    reportingHead: appraisee.reportingHead || '',
                    branch: appraisee.branch || '',
                    department: appraisee.department || '',
                    designation: appraisee.designation || ''
                });

                setFormData({
                    finYear: appraisee.finYear || '',
                    month: appraisee.pmonth || '',
                    year: appraisee.appraisalYear || '',
                    active: appraisee.active === 'Active',
                });

                const monthObj = months.find(m => m.name === appraisee.pmonth);
                setSelectedMonth(monthObj?.name || appraisee.pmonth || '');

                // ✅ Fetch supervisor ratings
                const supervisorData = await getSupervisorRatings(
                    appraisee.appraisalYear,
                    appraisee.empCode
                );

                // ✅ Create a map for quick lookup by goals (perspective)
                const supervisorRatingMap = new Map();
                supervisorData.forEach(item => {
                    supervisorRatingMap.set(item.goals, {
                        score: item.score,
                        supervisorRating: item.score,
                        detailsId: item.detailsId
                    });
                });

                const details = appraisee.performanceGoalsDtlVO || [];
                const mappedData = details.map((detail) => {
                    const supervisorMatch = supervisorRatingMap.get(detail.perspective);

                    return {
                        id: detail.id,
                        perspective: detail.perspective || '',
                        objectiveDescription: detail.objectivedesc || '',
                        assigned: detail.perassigned || '',
                        measurement: detail.measurement || '',
                        qtrTarget: detail.qtrtarget || '',
                        performance: detail.performance || '',
                        comments: detail.comments || '',
                        performanceSelf: detail.performanceself || '',

                        // ✅ Self Rating
                        selfRating: detail.selfrating?.toString() || '',

                        // ✅ First-Level Supervisor - From API (DISABLED)
                        firstLevelSupervisor: supervisorMatch?.supervisorRating || '',

                        // ✅ Appraiser Rating - From saved data (EDITABLE)
                        appraiserRating: detail.appraiserrating || '',

                        // ✅ Appraiser Justification - From saved data (EDITABLE)
                        appraiserJustification: detail.apprjustification || ''
                    };
                });

                setGoalsDetailsData(mappedData);

                setGoalsDetailsErrors(
                    details.map(() => ({
                        perspective: '',
                        objectiveDescription: '',
                        assigned: '',
                        measurement: '',
                        qtrTarget: '',
                        performance: '',
                        comments: '',
                        performanceSelf: '',
                        selfRating: '',
                        firstLevelSupervisor: '',
                        appraiserRating: '',
                        appraiserJustification: ''
                    }))
                );

            } else {
                showToast('error', response.message || 'Failed to fetch appraisee details');
            }
        } catch (error) {
            console.error('Error fetching appraisee details:', error);
            showToast('error', 'Failed to fetch appraisee details');
        }
    };

    const handleSave = async () => {
        const nonEmptyDetailsData = goalsDetailsData.filter(row =>
            row.perspective ||
            row.objectiveDescription ||
            row.assigned ||
            row.measurement ||
            row.qtrTarget
        );

        const errors = {};
        if (!employeeDetailsData.empCode) errors.employeeCode = 'Employee Code is required';
        if (!employeeDetailsData.empName) errors.employeeName = 'Employee Name is required';
        if (!selectedMonth) errors.month = 'Month is required';
        if (!formData.year) errors.year = 'Year is required';

        const detailsErrors = [];
        let hasDetailErrors = false;

        nonEmptyDetailsData.forEach((row, index) => {
            const rowErrors = {};

            if (!row.perspective) {
                rowErrors.perspective = 'Perspective is required';
                hasDetailErrors = true;
            }
            if (!row.objectiveDescription) {
                rowErrors.objectiveDescription = 'Objective Description is required';
                hasDetailErrors = true;
            }
            if (!row.assigned) {
                rowErrors.assigned = 'Assigned is required';
                hasDetailErrors = true;
            }
            if (!row.measurement) {
                rowErrors.measurement = 'Measurement is required';
                hasDetailErrors = true;
            }
            if (!row.qtrTarget) {
                rowErrors.qtrTarget = 'Quarter Target is required';
                hasDetailErrors = true;
            }

            detailsErrors[index] = rowErrors;
        });

        if (Object.keys(errors).length > 0 || hasDetailErrors) {
            setFieldErrors(errors);
            setGoalsDetailsErrors(detailsErrors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        const performanceGoalsDetailsDTO = nonEmptyDetailsData.map(row => ({
            ...(row.id && !isNaN(parseInt(row.id)) && row.id.toString().length > 10 ? { id: parseInt(row.id) } : {}),
            perspective: row.perspective,
            objectivedesc: row.objectiveDescription,
            perassigned: row.assigned,
            measurement: row.measurement,
            qtrtarget: row.qtrTarget,
            performance: row.performance || '',
            comments: row.comments || '',
            performanceself: row.performanceSelf || '',
            selfrating: row.selfRating ? parseInt(row.selfRating) : 0,
            appraiserrating: row.appraiserRating || '',  // ✅ Save Appraiser Rating
            apprjustification: row.appraiserJustification || ''  // ✅ Save Appraiser Justification
        }));

        const payload = {
            ...(editId && { id: parseInt(editId) }),
            empCode: employeeDetailsData.empCode,
            empName: employeeDetailsData.empName,
            reportingto: employeeName || '',
            reportingname: employeeName || '',
            pmonth: selectedMonth,
            apprisalYear: formData.year.toString(),
            orgId: orgId,
            createdBy: loginUserName,
            performanceGoalsDetailsDTO: performanceGoalsDetailsDTO,
            approve1: '',
            approve1name: '',
            approve1on: '',
            department,
            designation,
            branch,
            branchCode,
        };

        try {
            const response = await apiCalls('put', '/performancegoals/createUpdatePerformanceGoals', payload);
            if (response.status) {
                showToast('success', editId ? 'Performance goal updated successfully' : 'Performance goal created successfully');
                handleClear();
                getAllPerformanceGoals();
                setListView(true);
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving performance goal:', error);
            showToast('error', 'Failed to save performance goal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        const currentYear = formData.year;

        setFormData({
            month: '',
            year: currentYear,
            orgId: orgId
        });

        setFieldErrors({
            month: '',
            year: '',
        });

        setGoalsDetailsData([
            {
                id: Date.now(),
                perspective: '',
                objectiveDescription: '',
                assigned: '',
                measurement: '',
                qtrTarget: '',
                performance: '',
                comments: '',
                performanceSelf: '',
                selfRating: '',
                firstLevelSupervisor: '',
                appraiserRating: '',
                appraiserJustification: ''
            }
        ]);

        setGoalsDetailsErrors([{
            perspective: '',
            objectiveDescription: '',
            assigned: '',
            measurement: '',
            qtrTarget: '',
            performance: '',
            comments: '',
            performanceSelf: '',
            selfRating: '',
            firstLevelSupervisor: '',
            appraiserRating: '',
            appraiserJustification: ''
        }]);

        setEditId('');
        setIsEditing(false);

        const today = new Date();
        const currentMonth = months[today.getMonth()];
        setSelectedMonth(currentMonth.name);
        setFormData(prev => ({ ...prev, month: currentMonth.value }));
    };

    const handleAddRow = () => {
        const newRow = {
            id: Date.now(),
            perspective: '',
            objectiveDescription: '',
            assigned: '',
            measurement: '',
            qtrTarget: '',
            performance: '',
            comments: '',
            performanceSelf: '',
            selfRating: '',
            firstLevelSupervisor: '',
            appraiserRating: '',
            appraiserJustification: ''
        };
        setGoalsDetailsData([...goalsDetailsData, newRow]);
        setGoalsDetailsErrors([...goalsDetailsErrors, {
            perspective: '',
            objectiveDescription: '',
            assigned: '',
            measurement: '',
            qtrTarget: '',
            performance: '',
            comments: '',
            performanceSelf: '',
            selfRating: '',
            firstLevelSupervisor: '',
            appraiserRating: '',
            appraiserJustification: ''
        }]);
    };

    const handleDeleteRow = (id) => {
        const rowIndex = goalsDetailsData.findIndex((row) => row.id === id);
        if (rowIndex !== -1) {
            const updatedData = goalsDetailsData.filter((row) => row.id !== id);
            const updatedErrors = goalsDetailsErrors.filter((_, index) => index !== rowIndex);
            setGoalsDetailsData(updatedData);
            setGoalsDetailsErrors(updatedErrors);
        }
    };

    const handleView = () => {
        if (!listView) {
            getAllPerformanceGoals();
        }
        setListView(!listView);
    };

    const handleTabChange = (_, newValue) => setValue(newValue);

    const handleDetailChange = (id, field, value) => {
        const index = goalsDetailsData.findIndex((d) => d.id === id);
        if (index === -1) return;

        const newData = [...goalsDetailsData];
        newData[index] = { ...newData[index], [field]: value };
        setGoalsDetailsData(newData);

        if (value) {
            const newErrors = [...goalsDetailsErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setGoalsDetailsErrors(newErrors);
        }
    };

    const handleSelectChange = (index, field, value) => {
        const updatedData = [...goalsDetailsData];
        updatedData[index][field] = value;
        setGoalsDetailsData(updatedData);

        if (value) {
            const newErrors = [...goalsDetailsErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setGoalsDetailsErrors(newErrors);
        }
    };

    const handleMonthChange = (event) => {
        const selectedMonthName = event.target.value;
        setSelectedMonth(selectedMonthName);
        const selectedMonthObj = months.find((m) => m.name === selectedMonthName);
        setFormData((prev) => ({ ...prev, month: selectedMonthObj?.value || '' }));
        setFieldErrors((prev) => ({ ...prev, month: '' }));
    };

    const handleYearChange = (event) => {
        const selectedYear = event.target.value;
        setFormData((prev) => ({ ...prev, year: selectedYear }));
        setFieldErrors((prev) => ({ ...prev, year: '' }));
    };

    return (
        <>
            <div>
                <ToastComponent />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
                        {listView ? (
                            <></>
                        ) : (
                            <>
                                <ActionButton
                                    title="Back to List"
                                    icon={FormatListBulletedTwoToneIcon}
                                    onClick={() => {
                                        getAllPerformanceGoals();
                                        setListView(true);
                                    }}
                                />
                                <ActionButton
                                    title="Save"
                                    icon={SaveIcon}
                                    onClick={handleSave}
                                />
                            </>
                        )}
                    </div>

                    {listView ? (
                        isLoading ? (
                            <div>Loading data...</div>
                        ) : (
                            <CommonListViewTable
                                data={listViewData}
                                columns={listViewColumns}
                                blockEdit={true}
                                toEdit={getPerformanceGoalsById}
                                enableEditing={true}
                            />
                        )
                    ) : (
                        <>
                            <div className="row d-flex ml">
                                <div className="col-md-3 mb-1">
                                    <TextField
                                        label="Employee Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={employeeDetailsData.empCode}
                                        disabled
                                    />
                                </div>

                                <div className="col-md-3 mb-1">
                                    <TextField
                                        label="Employee Name"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={employeeDetailsData.empName}
                                        disabled
                                    />
                                </div>

                                <div className="col-md-3 mb-1">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.month}>
                                        <InputLabel>Select Month</InputLabel>
                                        <Select label="Select Month" value={selectedMonth} onChange={handleMonthChange}>
                                            {months.map((m) => (
                                                <MenuItem key={m.value} value={m.name}>
                                                    {m.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.month && <FormHelperText>{fieldErrors.month}</FormHelperText>}
                                    </FormControl>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.year}>
                                        <InputLabel>Select Year</InputLabel>
                                        <Select label="Select Year" value={formData.year} onChange={handleYearChange}>
                                            {years.map((y) => (
                                                <MenuItem key={y} value={y}>
                                                    {y}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.year && <FormHelperText>{fieldErrors.year}</FormHelperText>}
                                    </FormControl>
                                </div>
                            </div>

                            <div className="row">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                                        <Tab value={0} label="Goals" />
                                    </Tabs>
                                </Box>

                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add Row" icon={AddIcon} onClick={handleAddRow} />
                                            </div>
                                            <div className="row mt-0">
                                                <div className="col-lg-12">
                                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                                        <table className="table table-bordered" style={{ minWidth: '1800px', borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr style={{ background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)', color: 'white' }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>Action</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>S.No</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Perspective</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Objective Description</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '60px' }}>Assigned</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Measurement</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Qtr Target</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Performance</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Comments</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Performance Self</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Self Rating</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>First-Level Supervisor</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Appraiser Rating</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Appraiser Justification</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {goalsDetailsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() => handleDeleteRow(row.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center pt-3">{index + 1}</td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.perspective}
                                                                                disabled
                                                                                onChange={(e) => handleDetailChange(row.id, 'perspective', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.perspective}
                                                                                helperText={goalsDetailsErrors[index]?.perspective}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.objectiveDescription}
                                                                                disabled
                                                                                onChange={(e) => handleDetailChange(row.id, 'objectiveDescription', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.objectiveDescription}
                                                                                helperText={goalsDetailsErrors[index]?.objectiveDescription}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.assigned}
                                                                                disabled
                                                                                placeholder="%"
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    if (/^\d{0,3}%?$/.test(value)) {
                                                                                        const numericPart = value.replace('%', '');
                                                                                        if (numericPart === '' || Number(numericPart) <= 100) {
                                                                                            handleDetailChange(row.id, 'assigned', value);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                error={!!goalsDetailsErrors[index]?.assigned}
                                                                                helperText={goalsDetailsErrors[index]?.assigned}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.measurement}
                                                                                disabled
                                                                                onChange={(e) => handleDetailChange(row.id, 'measurement', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.measurement}
                                                                                helperText={goalsDetailsErrors[index]?.measurement}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.qtrTarget}
                                                                                disabled
                                                                                onChange={(e) => handleDetailChange(row.id, 'qtrTarget', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.qtrTarget}
                                                                                helperText={goalsDetailsErrors[index]?.qtrTarget}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.performance}
                                                                                disabled
                                                                                onChange={(e) => handleDetailChange(row.id, 'performance', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.performance}
                                                                                helperText={goalsDetailsErrors[index]?.performance}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.comments}
                                                                                disabled
                                                                                onChange={(e) => handleDetailChange(row.id, 'comments', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.comments}
                                                                                helperText={goalsDetailsErrors[index]?.comments}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.performanceSelf}
                                                                                disabled
                                                                                onChange={(e) => handleDetailChange(row.id, 'performanceSelf', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.performanceSelf}
                                                                                helperText={goalsDetailsErrors[index]?.performanceSelf}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <select
                                                                                value={row.selfRating}
                                                                                disabled
                                                                                onChange={(e) => handleSelectChange(index, 'selfRating', e.target.value)}
                                                                                className={goalsDetailsErrors[index]?.selfRating ? 'error form-control' : 'form-control'}
                                                                            >
                                                                                <option value="">Select Option</option>
                                                                                {[1, 2, 3, 4, 5].map((val) => (
                                                                                    <option key={val} value={val}>{val}</option>
                                                                                ))}
                                                                            </select>
                                                                            {goalsDetailsErrors[index]?.selfRating && (
                                                                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                    {goalsDetailsErrors[index].selfRating}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        {/* ✅ First-Level Supervisor - DISABLED */}
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.firstLevelSupervisor}
                                                                                disabled
                                                                                placeholder="Auto-filled from API"
                                                                            />
                                                                        </td>
                                                                        {/* ✅ Appraiser Rating - EDITABLE */}
                                                                        <td className="border px-2 py-2">
                                                                            <select
                                                                                value={row.appraiserRating}
                                                                                onChange={(e) => handleSelectChange(index, 'appraiserRating', e.target.value)}
                                                                                className={goalsDetailsErrors[index]?.appraiserRating ? 'error form-control' : 'form-control'}
                                                                            >
                                                                                <option value="">Select Rating</option>
                                                                                {[1, 2, 3, 4, 5].map((val) => (
                                                                                    <option key={val} value={val}>{val}</option>
                                                                                ))}
                                                                            </select>
                                                                            {goalsDetailsErrors[index]?.appraiserRating && (
                                                                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                    {goalsDetailsErrors[index].appraiserRating}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        {/* ✅ Appraiser Justification - EDITABLE */}
                                                                        <td className="border px-2 py-2">
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.appraiserJustification}
                                                                                onChange={(e) => handleDetailChange(row.id, 'appraiserJustification', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.appraiserJustification}
                                                                                helperText={goalsDetailsErrors[index]?.appraiserJustification}
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
                    )}
                </div>
            </div>
        </>
    );
};

export default AppraiserReview;