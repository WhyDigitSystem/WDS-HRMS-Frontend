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
    const [listView, setListView] = useState(true); // Changed to true to show list view first
    const [reportingPersonDetails, setReportingPersonDetails] = useState([]);
    const [employeeDetailsData, setEmployeeDetailsData] = useState({
        empCode: "",
        empName: "",
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
        // { accessorKey: 'active', header: 'Active', size: 140 }
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
        appraiserrating: '',
        apprjustification: ''
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
        appraiserrating: '',
        apprjustification: ''
    }]);

    useEffect(() => {
        getAllPerformanceGoals();

        const today = new Date();
        const currentMonth = months[today.getMonth()];
        const currentYear = today.getFullYear();

        setSelectedMonth(currentMonth.name);
        setFormData({ month: currentMonth.value, year: currentYear });
    }, []); // Make sure this empty dependency array is present

    useEffect(() => {
        if (loginUserName) {
            getReportingPerson();
        }
    }, [loginUserName]);

    useEffect(() => {
        const fetchData = async () => {
            const reportingResponse = await getReportingPerson();
            // Wait until reportingPersonDetails is updated before calling next API
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (reportingPersonDetails?.reportingto) {
            getAllPerformanceGoals(reportingPersonDetails.reportingto);
        }
    }, [reportingPersonDetails]);


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

    const handleSelectChange = (index, field, value) => {
        const updatedData = [...goalsDetailsData];
        updatedData[index][field] = value; // dynamically update the field
        setGoalsDetailsData(updatedData);
    };

    // const handleMonthChange = (event) => {
    //     const selected = months.find((m) => m.name === event.target.value);
    //     setSelectedMonth(selected?.name || ''); // For display
    //     setFormData((prev) => ({ ...prev, month: selected?.value || '' })); // For API
    //     setFieldErrors((prev) => ({ ...prev, month: '' })); // Clear month error
    // };

    const handleMonthChange = (event) => {
        const selectedMonthName = event.target.value;
        setSelectedMonth(selectedMonthName); // For display and API payload

        // Also store the value in formData if needed elsewhere
        const selectedMonthObj = months.find((m) => m.name === selectedMonthName);
        setFormData((prev) => ({ ...prev, month: selectedMonthObj?.value || '' }));

        setFieldErrors((prev) => ({ ...prev, month: '' })); // Clear month error
    };

    const handleYearChange = (event) => {
        const selectedYear = event.target.value;
        setFormData((prev) => ({ ...prev, year: selectedYear }));
        setFieldErrors((prev) => ({ ...prev, year: '' })); // Clear year error
    };

    useEffect(() => {
        const storedEmployeeCode = localStorage.getItem('employeeCode'); // or from your auth state
        if (storedEmployeeCode) {
            fetchEmployeeDetails(storedEmployeeCode);
        }
    }, []);

    const getReportingPerson = async () => {
        try {
            const response = await apiCalls('get', `/performancegoals/getReportingUserName?username=${loginUserName}`);
            const data = response?.paramObjectsMap?.getReportingUserName?.[0] || null;
            setReportingPersonDetails(data); // { reportingto, reportingcode }
        } catch (error) {
            console.error('Error fetching reporting person details:', error);
            showToast('Error fetching reporting person details', 'error');
            setReportingPersonDetails(null);
        }
    };

    const fetchEmployeeDetails = async (employeeCode) => {
        if (!employeeCode || !orgId) return;

        try {
            const response = await apiCalls(
                'get',
                `/goalsController/getEmployeeDetails?employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status) {
                const employeeData =
                    response.paramObjectsMap?.employeeVO?.[0] ||
                    response.paramObjectsMap?.employeeDetails ||
                    response.data;

                if (employeeData) {
                    setEmployeeDetailsData({
                        empCode: employeeData.empCode || "",
                        empName: employeeData.empName || employeeData.name || "",
                        department: employeeData.department || "",
                        designation: employeeData.empDesignation || employeeData.designation || "",
                        reportingHeadCode: employeeData.reportingPersonCode || "",
                        reportingHead: employeeData.reportingPerson || "",
                        reportingHeadDesignation: employeeData.reportingPersonRole || "",
                        branch: employeeData.branch || "",
                    });
                } else {
                    showToast('error', 'No employee data found');
                }
            } else {
                showToast('error', response.message || 'Failed to fetch employee details');
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            showToast('error', 'Failed to fetch employee details');
        }
    };

    const getAllPerformanceGoals = async (reportingTo) => {
        try {
            setIsLoading(true);
            const response = await apiCalls(
                'get',
                // `/performancegoals/getPerformanceGoalsByOrgIdAndReportingPerson?orgId=${orgId}&reportingPerson=${encodeURIComponent(reportingTo)}`
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

    const getPerformanceGoalsById = async (row) => {
        setEditId(row.original.id);
        setListView(false); // Switch to form view when row is clicked
        setIsEditing(true);

        try {
            const response = await apiCalls('get', `/performancegoals/getPerformanceGoalsById?id=${row.original.id}`);

            if (response.status) {
                const appraisee = response?.paramObjectsMap?.performanceGoalsVO || {};

                // Set main employee details
                setEmployeeDetailsData({
                    empCode: appraisee.empCode || '',
                    empName: appraisee.empName || '',
                    reportingHeadCode: appraisee.reportingHeadCode || '',
                    reportingHead: appraisee.reportingHead || '',
                    branch: appraisee.branch || '',
                    department: appraisee.department || '',
                    designation: appraisee.designation || ''
                });

                // Set form data
                setFormData({
                    finYear: appraisee.finYear || '',
                    month: appraisee.pmonth || '',
                    year: appraisee.appraisalYear || '',
                    active: appraisee.active === 'Active',
                });

                // Fix: Set selected month for display - find by name instead of value
                const monthObj = months.find(m => m.name === appraisee.pmonth);
                setSelectedMonth(monthObj?.name || appraisee.pmonth || '');

                // Set goals details for the table
                const details = appraisee.performanceGoalsDtlVO || [];
                setGoalsDetailsData(
                    details.map(detail => ({
                        id: detail.id,
                        perspective: detail.perspective || '',
                        objectiveDescription: detail.objectivedesc || '',
                        assigned: detail.perassigned || '',
                        measurement: detail.measurement || '',
                        qtrTarget: detail.qtrtarget || '',
                        performance: detail.performance || '',
                        comments: detail.comments || '',
                        performanceSelf: detail.performanceself || '',
                        selfRating: detail.selfrating || '',
                        appraiserrating: detail.appraiserrating || '',
                        apprjustification: detail.apprjustification || ''
                    }))
                );

                // Reset errors for details table
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
                        appraiserrating: '',
                        apprjustification: ''
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
        // First remove any empty rows
        const nonEmptyDetailsData = goalsDetailsData.filter(row =>
            row.perspective ||
            row.objectiveDescription ||
            row.assigned ||
            row.measurement ||
            row.qtrTarget ||
            row.performance ||
            row.comments ||
            row.performanceSelf ||
            row.selfRating ||
            row.appraiserrating ||
            row.apprjustification
        );

        // Validate main form fields
        const errors = {};
        if (!employeeDetailsData.empCode) errors.employeeCode = 'Employee Code is required';
        if (!employeeDetailsData.empName) errors.employeeName = 'Employee Name is required';
        if (!formData.month) errors.month = 'Month is required';
        if (!selectedMonth) errors.month = 'Month is required';
        if (!formData.year) errors.year = 'Year is required';

        // Validate goals details
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

        // Set errors if any
        if (Object.keys(errors).length > 0 || hasDetailErrors) {
            setFieldErrors(errors);
            setGoalsDetailsErrors(detailsErrors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        // Prepare performance goals details DTO
        const performanceGoalsDetailsDTO = nonEmptyDetailsData.map(row => ({
            perspective: row.perspective,
            objectivedesc: row.objectiveDescription,
            perassigned: row.assigned,
            measurement: row.measurement,
            qtrtarget: row.qtrTarget,
            performance: row.performance || '',
            comments: row.comments || '',
            performanceself: row.performanceSelf || '',
            selfrating: row.selfRating ? parseInt(row.selfRating) : 0,
            appraiserrating: row.appraiserrating, // Default value
            apprjustification: row.apprjustification // Default value
        }));

        const payload = {
            ...(editId && { id: parseInt(editId) }),
            empCode: employeeDetailsData.empCode,
            empName: employeeDetailsData.empName,
            // reportingto: reportingPersonDetails?.reportingto || '',
            // reportingname: reportingPersonDetails?.reportingto || '',
            reportingto: employeeName || '',
            reportingname: employeeName || '',
            // pmonth: formData.month,
            pmonth: selectedMonth,
            apprisalYear: formData.year.toString(),
            orgId: orgId,
            createdBy: loginUserName, // Adjust based on your auth system
            performanceGoalsDetailsDTO: performanceGoalsDetailsDTO,
            approve1: '', // Default empty values as per API
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
                getAllPerformanceGoals(); // Refresh the list data
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
                appraiserrating: '',
                apprjustification: ''
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
            appraiserrating: '',
            apprjustification: ''
        }]);

        setEditId('');
        setIsEditing(false);

        const storedEmployeeCode = localStorage.getItem('employeeCode');
        if (storedEmployeeCode) {
            fetchEmployeeDetails(storedEmployeeCode);
        } else {
            setEmployeeDetailsData({
                empCode: "",
                empName: "",
            });
        }

        const today = new Date();
        const currentMonth = months[today.getMonth()];
        setSelectedMonth(currentMonth.name);
        setFormData(prev => ({ ...prev, month: currentMonth.value }));
    };

    const handleAddRow = () => {
        if (isLastRowEmpty(goalsDetailsData)) {
            displayRowError(goalsDetailsData);
            return;
        }
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
            appraiserrating: '',
            apprjustification: ''
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
            appraiserrating: '',
            apprjustification: ''
        }]);
    };

    const isLastRowEmpty = (table) => {
        const lastRow = table[table.length - 1];
        if (!lastRow) return false;

        return !lastRow.perspective || !lastRow.objectiveDescription || !lastRow.assigned || !lastRow.measurement || !lastRow.qtrTarget || !lastRow.performance || !lastRow.comments || !lastRow.performanceSelf || !lastRow.selfRating || !lastRow.appraiserrating || !lastRow.apprjustification;
    };

    const displayRowError = (table) => {
        setGoalsDetailsErrors((prevErrors) => {
            const newErrors = [...prevErrors];
            const lastIndex = table.length - 1;

            newErrors[lastIndex] = {
                ...newErrors[lastIndex],
                perspective: !table[lastIndex].perspective ? 'Perspective is required' : '',
                objectiveDescription: !table[lastIndex].objectiveDescription ? 'Objective Description is required' : '',
                assigned: !table[lastIndex].assigned ? 'Assigned is required' : '',
                measurement: !table[lastIndex].measurement ? 'Measurement is required' : '',
                qtrTarget: !table[lastIndex].qtrTarget ? 'Quarter Target is required' : '',
                performance: !table[lastIndex].performance ? 'Performance is required' : '',
                comments: !table[lastIndex].comments ? 'Comments is required' : '',
                performanceSelf: !table[lastIndex].performanceSelf ? 'Performance Self is required' : '',
                selfRating: !table[lastIndex].selfRating ? 'Self Rating is required' : '',
                appraiserrating: !table[lastIndex].appraiserrating ? 'Appraiser Rating is required' : '',
                apprjustification: !table[lastIndex].apprjustification ? 'Appraiser Justification is required' : ''
            };
            return newErrors;
        });
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
        // Refresh data when switching to list view
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

    return (
        <>
            <div>
                <ToastComponent />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
                        {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
                        {/* <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} /> */}

                        {/* Conditional buttons for List View vs Form View */}
                        {listView ? (
                            // <ActionButton
                            //     title="Add New"
                            //     icon={AddIcon}
                            //     onClick={() => {
                            //         setListView(false);
                            //         handleClear(); // Clear form for new entry
                            //     }}
                            // />
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
                                {/* <ActionButton
                                    title="Upload"
                                    icon={UploadIcon}
                                    isLoading={isLoading}
                                /> */}
                            </>
                        )}
                    </div>

                    {listView ? (
                        isLoading ? (
                            <div>Loading data...</div>
                        ) : (
                            // List View
                            <CommonListViewTable
                                data={listViewData}
                                columns={listViewColumns}
                                blockEdit={true}
                                toEdit={getPerformanceGoalsById}
                                enableEditing={true}
                            />
                        )
                    ) : (
                        // Form View
                        <>
                            <div className="row d-flex ml">

                                <div className="col-md-3 mb-1">
                                    <TextField
                                        id="outlined-textarea-zip"
                                        label="Employee Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="employeeCode"
                                        value={employeeDetailsData.empCode}
                                        disabled
                                        inputProps={{ maxLength: 10 }}
                                    />
                                </div>

                                <div className="col-md-3 mb-1">
                                    <TextField
                                        id="outlined-textarea-name"
                                        label="Employee Name"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="employeeName"
                                        value={employeeDetailsData.empName}
                                        disabled
                                        inputProps={{ maxLength: 50 }}
                                    />
                                </div>

                                <div className="col-md-3 mb-1">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.month}>
                                        <InputLabel>Select Month</InputLabel>
                                        <Select label="Select Month" disabled value={selectedMonth} onChange={handleMonthChange}>
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
                                        <Select label="Select Year" disabled value={formData.year} onChange={handleYearChange}>
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
                                                        <table
                                                            className="table table-bordered"
                                                            style={{ minWidth: '1600px', borderCollapse: 'collapse' }}
                                                        >
                                                            <thead>
                                                                <tr
                                                                    style={{
                                                                        background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                        color: 'white',
                                                                    }}
                                                                >
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                                                        Perspective
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                                                        Objective Description
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '60px' }}>
                                                                        Assigned
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                                                        Measurement
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Qtr Target</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Performance</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Comments</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Performance Self</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Self Rating</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>Appraiser</th>
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
                                                                            <select
                                                                                value={row.perspective}
                                                                                onChange={(e) => handleSelectChange(index, 'perspective', e.target.value)}
                                                                                disabled={isEditing}
                                                                                className={goalsDetailsErrors[index]?.perspective ? 'error form-control' : 'form-control'}
                                                                            >
                                                                                <option value="">Select Option</option>
                                                                                <option value="Financial">Financial</option>
                                                                                <option value="Customer">Customer</option>
                                                                                <option value="Internal Processes">Internal Processes</option>
                                                                                <option value="Learning & Growth">Learning & Growth</option>
                                                                            </select>

                                                                            {goalsDetailsErrors[index]?.perspective && (
                                                                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                    {goalsDetailsErrors[index].perspective}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.objectiveDescription}
                                                                                disabled={isEditing}
                                                                                onChange={(e) => handleDetailChange(row.id, 'objectiveDescription', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.objectiveDescription}
                                                                                helperText={goalsDetailsErrors[index]?.objectiveDescription}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.assigned}
                                                                                placeholder="%"
                                                                                disabled={isEditing}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;

                                                                                    // Allow only digits and an optional '%' symbol
                                                                                    if (/^\d{0,3}%?$/.test(value)) {
                                                                                        // Remove % to check numeric range
                                                                                        const numericPart = value.replace('%', '');

                                                                                        // Allow empty or 0–100 range
                                                                                        if (numericPart === '' || Number(numericPart) <= 100) {
                                                                                            handleDetailChange(row.id, 'assigned', value);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                error={!!goalsDetailsErrors[index]?.assigned}
                                                                                helperText={goalsDetailsErrors[index]?.assigned}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.measurement}
                                                                                disabled={isEditing}
                                                                                onChange={(e) => handleDetailChange(row.id, 'measurement', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.measurement}
                                                                                helperText={goalsDetailsErrors[index]?.measurement}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.qtrTarget}
                                                                                disabled={isEditing}
                                                                                onChange={(e) => handleDetailChange(row.id, 'qtrTarget', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.qtrTarget}
                                                                                helperText={goalsDetailsErrors[index]?.qtrTarget}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.performance}
                                                                                disabled={isEditing}
                                                                                onChange={(e) => handleDetailChange(row.id, 'performance', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.performance}
                                                                                helperText={goalsDetailsErrors[index]?.performance}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.comments}
                                                                                disabled={isEditing}
                                                                                onChange={(e) => handleDetailChange(row.id, 'comments', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.comments}
                                                                                helperText={goalsDetailsErrors[index]?.comments}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.performanceSelf}
                                                                                disabled={isEditing}
                                                                                onChange={(e) => handleDetailChange(row.id, 'performanceSelf', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.performanceSelf}
                                                                                helperText={goalsDetailsErrors[index]?.performanceSelf}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <select
                                                                                value={row.selfRating}
                                                                                disabled={isEditing}
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
                                                                        <td className="border px-2 py-2">
                                                                            <select
                                                                                value={row.appraiserrating}
                                                                                onChange={(e) => handleSelectChange(index, 'appraiserrating', e.target.value)}
                                                                                className={goalsDetailsErrors[index]?.appraiserrating ? 'error form-control' : 'form-control'}
                                                                            >
                                                                                <option value="">Select Option</option>
                                                                                {[1, 2, 3, 4, 5].map((val) => (
                                                                                    <option key={val} value={val}>{val}</option>
                                                                                ))}
                                                                            </select>

                                                                            {goalsDetailsErrors[index]?.appraiserrating && (
                                                                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                    {goalsDetailsErrors[index].appraiserrating}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.apprjustification}
                                                                                onChange={(e) => handleDetailChange(row.id, 'apprjustification', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.apprjustification}
                                                                                helperText={goalsDetailsErrors[index]?.apprjustification}
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