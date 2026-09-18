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

const First_LevelSupervisorInput = () => {
  const [listViewData, setListViewData] = useState([]);
  const [appraisalOptions, setAppraisalOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
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
  const [gradeList, setGradeList] = useState([]);

  const [formData, setFormData] = useState({
    id: '',
    appraisalId: '',
    employeeCode: '',
    employeeName: '',
    branch: '',
    branchCode: '',
    department: '',
    designation: '',
    supervisorCode: '',
    supervisorName: '',
    reportingHeadDesignation: '',
    finyear: new Date().getFullYear().toString(),
    createdBy: '',
    updatedBy: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    appraisalId: '',
    employeeCode: '',
    employeeName: '',
    designation: '',
    supervisorCode: '',
    supervisorName: '',
    reportingHeadDesignation: ''
  });

  const [appraiseeDetailsData, setAppraiseeDetailsData] = useState([
    { id: Date.now(), goals: '', selfInput: '', selfRating: '', score: '', supervisorRating: '' }
  ]);

  const [appraiseeDetailsErrors, setAppraiseeDetailsErrors] = useState([
    { goals: '', selfInput: '', selfRating: '' }
  ]);

  const listViewColumns = [
    { accessorKey: 'employeeCode', header: 'Employee Code', size: 140 },
    { accessorKey: 'employeeName', header: 'Employee Name', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    { accessorKey: 'supervisorName', header: 'Supervisor Name', size: 140 },
    { accessorKey: 'reportingHeadDesignation', header: 'Reporting Head Designation', size: 140 },
    // { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    console.log('Current appraisalId:', formData.appraisalId);
    const fetchInitialData = async () => {
      await getAllAppraisees();
      await getAllEmployees(orgId);
    };
    fetchInitialData();
    getAppraisalDocId();
    getAllGrade();
  }, []);

  const getAllGrade = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/goalsController/getGradeByOrgId?orgId=${orgId}`
      );

      if (response.status) {
        setGradeList(response.paramObjectsMap.gradeVO || []);
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const getPerformanceGoals = async (appraisalId, empCode) => {
    if (!appraisalId || !empCode) return;

    try {
      const response = await apiCalls(
        'get',
        `/goalsController/getPerformanceGoalsForFirstLevelSInput?appraisalId=${appraisalId}&empCode=${empCode}&orgId=${orgId}`
      );

      if (response.status) {
        const data = response.paramObjectsMap.performanceGoalsVO || [];

        if (data.length > 0) {
          const details = data[0].performanceGoalsDtlVO || [];

          const mappedData = details.map((item) => ({
            id: item.id || Date.now() + Math.random(),
            goals: item.objectivedesc || '',
            selfInput: item.performanceself || '',
            selfRating: item.selfrating || '',
            score: '',
            supervisorRating: ''
          }));

          setAppraiseeDetailsData(mappedData);
        } else {
          setAppraiseeDetailsData([]);
        }
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error fetching performance goals:', error);
      showToast('error', 'Failed to fetch performance goals');
    }
  };

  // ✅ UPDATED: Correctly handles the API response for getAll
  const getAllAppraisees = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getFirstLevelSupervisorInputByOrgId?orgId=${orgId}`);
      if (response.status) {
        const data = response.paramObjectsMap.firstLevelSupervisorInputVO || [];
        setListViewData(data);
      } else {
        showToast('error', response.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('error', 'Failed to fetch data');
    }
  };

  const getAppraisalDocId = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAppraisalDocId?orgId=${orgId}`);

      const list = response.paramObjectsMap.goalsVO || [];

      const options = list.map((item) => ({
        label: `${item.appraisalId} - ${item.designation}`,
        value: item.appraisalId,
        designation: item.designation
      }));

      setAppraisalOptions(options);

    } catch (error) {
      console.error('Error fetching goals docid:', error);
      showToast('error', 'Failed to fetch goals docid');
    }
  };

  const getAllEmployees = async (orgIdVal, selectedDesignation = null) => {
    const branchCode = localStorage.getItem('branch');

    if (!orgIdVal || !branchCode) return;

    setIsLoadingEmployees(true);
    try {
      let url = `master/getAllEmployeeByOrgId?orgId=${orgIdVal}&branchCode=${branchCode}`;

      const response = await apiCalls('get', url);

      if (response.status === true) {
        let employees = response.paramObjectsMap.employeeVO || [];

        if (selectedDesignation) {
          employees = employees.filter(
            (emp) => emp.designation === selectedDesignation
          );
        }

        const formattedEmployees = employees.map(emp => ({
          employeeCode: emp.employeeCode,
          employeeName: emp.employee,
          designation: emp.designation,
          supervisorCode: emp.reportingPersonCode,
          supervisorName: emp.reportingPerson,
          reportingHeadDesignation: emp.reportingRole,
          branch: emp.branch,
          branchCode: emp.branchCode,
          email: emp.email,
          mobileNo: emp.mobileNo,
          department: emp.department
        }));

        setEmployeeOptions(formattedEmployees);

      } else {
        showToast('error', response.message);
        setEmployeeOptions([]);
      }
    } catch (error) {
      console.error(error);
      setEmployeeOptions([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleScoreChange = (id, value) => {
    const selectedGrade = gradeList.find(g => g.score === value);

    const updatedData = appraiseeDetailsData.map(row => {
      if (row.id === id) {
        return {
          ...row,
          score: value,
          supervisorRating: selectedGrade?.grade || ''
        };
      }
      return row;
    });

    setAppraiseeDetailsData(updatedData);
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

  // ✅ UPDATED: Correctly handles the API response for getById
  const getAppraiseeById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getFirstLevelSupervisorInputById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const data = response.paramObjectsMap.firstLevelSupervisorInputVO;

        setFormData({
          id: data.id || '',
          appraisalId: data.appraisalId || '',
          employeeCode: data.employeeCode || '',
          employeeName: data.employeeName || '',
          branch: data.branch || '',
          branchCode: data.branchCode || '',
          department: data.department || '',
          designation: data.designation || '',
          supervisorCode: data.supervisorCode || '',
          supervisorName: data.supervisorName || '',
          reportingHeadDesignation: data.reportingHeadDesignation || '',
          finyear: data.finyear || new Date().getFullYear().toString(),
          createdBy: data.createdBy || '',
          updatedBy: data.updatedBy || '',
          active: data.active || true
        });

        // ✅ Use firstLevelSupervisorInputDetailsVO (not details)
        const details = data.firstLevelSupervisorInputDetailsVO || [];

        if (details.length > 0) {
          setAppraiseeDetailsData(
            details.map((detail, index) => ({
              id: detail.id || Date.now() + index,
              goals: detail.goals || '',
              selfInput: detail.selfInput || '',
              selfRating: detail.selfRating || '',
              score: detail.score?.toString() || '',
              supervisorRating: detail.supervisorRating || ''
            }))
          );
        } else {
          setAppraiseeDetailsData([
            { id: Date.now(), goals: '', selfInput: '', selfRating: '', score: '', supervisorRating: '' }
          ]);
        }

        setAppraiseeDetailsErrors(
          (details.length > 0 ? details : [{}]).map(() => ({
            goals: '',
            selfInput: '',
            selfRating: ''
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      showToast('error', 'Failed to fetch details');
    }
  };

  const validateAppraiseeDetails = () => {
    let isValid = true;
    const newErrors = [];

    appraiseeDetailsData.forEach((row) => {
      const errors = {};

      if (!row.goals) {
        errors.goals = 'Goals are required';
        isValid = false;
      }
      if (!row.selfInput) {
        errors.selfInput = 'Self Input is required';
        isValid = false;
      }

      newErrors.push(errors);
    });

    setAppraiseeDetailsErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    // Validate main form fields
    const errors = {};
    if (!formData.appraisalId) errors.appraisalId = 'Appraisal ID is required';
    if (!formData.employeeCode) errors.employeeCode = 'Employee Code is required';
    if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
    if (!formData.designation) errors.designation = 'Designation is required';
    if (!formData.supervisorCode) errors.supervisorCode = 'Supervisor Code is required';
    if (!formData.supervisorName) errors.supervisorName = 'Supervisor Name is required';

    // Validate designation match
    if (formData.appraisalId && formData.designation) {
      const selectedAppraisal = appraisalOptions.find(
        (opt) => opt.value === formData.appraisalId
      );

      if (selectedAppraisal?.designation !== formData.designation) {
        showToast('error', 'Employee designation does not match Appraisal designation');
        return;
      }
    }

    setFieldErrors(errors);

    // Validate appraisee details
    const isDetailsValid = validateAppraiseeDetails();

    if (Object.keys(errors).length > 0 || !isDetailsValid) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);

    const detailsVo = appraiseeDetailsData.map(row => ({
      ...(row.id && !isNaN(parseInt(row.id)) && row.id.toString().length > 10 ? { id: parseInt(row.id) } : {}),
      goals: row.goals,
      selfInput: row.selfInput,
      selfRating: row.selfRating,
      score: row.score ? parseInt(row.score) : 0,
      supervisorRating: row.supervisorRating || ''
    }));

    const payload = {
      ...(editId && { id: parseInt(editId) }),
      appraisalId: formData.appraisalId,
      branch: formData.branch || branch,
      branchCode: formData.branchCode || branch,
      createdBy: createdBy,
      department: formData.department || department,
      designation: formData.designation,
      details: detailsVo,
      employeeCode: formData.employeeCode,
      employeeName: formData.employeeName,
      finyear: formData.finyear,
      orgId: orgId,
      reportingHeadDesignation: formData.reportingHeadDesignation,
      supervisorCode: formData.supervisorCode,
      supervisorName: formData.supervisorName,
      updatedBy: createdBy
    };

    console.log('Payload being sent:', payload);

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateFirstLevelSupervisorInput', payload);
      if (response.status) {
        showToast('success', editId ? 'First Level Supervisor Input updated successfully' : 'First Level Supervisor Input created successfully');
        handleClear();
        getAllAppraisees();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('error', 'Failed to save data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      id: '',
      appraisalId: '',
      employeeCode: '',
      employeeName: '',
      branch: '',
      branchCode: '',
      department: '',
      designation: '',
      supervisorCode: '',
      supervisorName: '',
      reportingHeadDesignation: '',
      finyear: new Date().getFullYear().toString(),
      createdBy: '',
      updatedBy: '',
      active: true
    });

    setFieldErrors({
      appraisalId: '',
      employeeCode: '',
      employeeName: '',
      designation: '',
      supervisorCode: '',
      supervisorName: '',
      reportingHeadDesignation: ''
    });

    setAppraiseeDetailsData([
      { id: Date.now(), goals: '', selfInput: '', selfRating: '', score: '', supervisorRating: '' }
    ]);

    setAppraiseeDetailsErrors([
      { goals: '', selfInput: '', selfRating: '' }
    ]);

    setEditId('');
  };

  const handleAddRow = () => {
    const newId = Date.now();
    setAppraiseeDetailsData(prev => [
      ...prev,
      { id: newId, goals: '', selfInput: '', selfRating: '', score: '', supervisorRating: '' }
    ]);
    setAppraiseeDetailsErrors(prev => [
      ...prev,
      { goals: '', selfInput: '', selfRating: '' }
    ]);
  };

  const handleDeleteRow = (id) => {
    if (appraiseeDetailsData.length <= 1) {
      const newId = Date.now();
      setAppraiseeDetailsData([
        { id: newId, goals: '', selfInput: '', selfRating: '', score: '', supervisorRating: '' }
      ]);
      setAppraiseeDetailsErrors([
        { goals: '', selfInput: '', selfRating: '' }
      ]);
      return;
    }

    const index = appraiseeDetailsData.findIndex(d => d.id === id);
    if (index === -1) return;

    const newData = [...appraiseeDetailsData];
    newData.splice(index, 1);
    setAppraiseeDetailsData(newData);

    const newErrors = [...appraiseeDetailsErrors];
    newErrors.splice(index, 1);
    setAppraiseeDetailsErrors(newErrors);
  };

  const handleDetailChange = (id, field, value) => {
    const index = appraiseeDetailsData.findIndex(d => d.id === id);
    if (index === -1) return;

    const newData = [...appraiseeDetailsData];
    newData[index] = { ...newData[index], [field]: value };
    setAppraiseeDetailsData(newData);

    if (value && appraiseeDetailsErrors[index][field]) {
      const newErrors = [...appraiseeDetailsErrors];
      newErrors[index] = { ...newErrors[index], [field]: '' };
      setAppraiseeDetailsErrors(newErrors);
    }
  };

  const handleView = () => setListView(!listView);
  const handleTabChange = (_, newValue) => setValue(newValue);

  const handleFullGrid = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAppraiseeFillGrid?orgId=${orgId}&employeeCode=${formData.employeeCode}`);
      if (response.status) {
        setFillGridData(response.paramObjectsMap.appraiseeFillGrid || []);
        setSelectedRows([]);
        setSelectAll(false);
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
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(fillGridData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmitSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);

    const existingCombinations = new Set(
      appraiseeDetailsData.map(item => `${item.goals}|${item.selfInput}|${item.selfRating}`)
    );

    const newData = [];

    selectedData.forEach((data) => {
      const combinationKey = `${data.objectivedesc || ''}|${data.performanceself || ''}|${data.selfrating || ''}`;

      if (!existingCombinations.has(combinationKey)) {
        newData.push({
          id: Date.now() + Math.random(),
          goals: data.objectivedesc || '',
          selfInput: data.performanceself || '',
          selfRating: data.selfrating || '',
          score: '',
          supervisorRating: ''
        });
        existingCombinations.add(combinationKey);
      }
    });

    if (newData.length === 0) {
      showToast('warning', 'Selected items are already added or contain no data!');
      return;
    }

    const filteredExistingData = appraiseeDetailsData.filter(row =>
      !(row.goals === '' && row.selfInput === '' && row.selfRating === '')
    );

    setAppraiseeDetailsData([...filteredExistingData, ...newData]);
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
            <ActionButton title="Search" icon={SearchIcon} onClick={handleFullGrid} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="Add Row" icon={AddIcon} onClick={handleAddRow} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
          </div>

          {!listView ? (
            <>
              <div className="row d-flex ml">

                {/* Appraisal ID */}
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={appraisalOptions}
                    getOptionLabel={(option) => option.label || ''}
                    value={formData.appraisalId ? (appraisalOptions.find((opt) => opt.value === formData.appraisalId) || null) : null}
                    onChange={async (event, newValue) => {
                      const selectedDesignation = newValue?.designation || '';

                      setFormData((prev) => ({
                        ...prev,
                        appraisalId: newValue?.value || '',
                        designation: selectedDesignation,
                        employeeCode: '',
                        employeeName: '',
                        department: '',
                        supervisorCode: '',
                        supervisorName: '',
                        reportingHeadDesignation: '',
                        branch: '',
                        branchCode: ''
                      }));

                      if (selectedDesignation) {
                        await getAllEmployees(orgId, selectedDesignation);
                      } else {
                        setEmployeeOptions([]);
                      }
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={(params) => (
                      <TextField {...params} label="Appraisal ID" size="small" required error={!!fieldErrors.appraisalId} helperText={fieldErrors.appraisalId} />
                    )}
                  />
                </div>

                {/* Employee Code */}
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={employeeOptions}
                    getOptionLabel={(option) => `${option.employeeCode} - ${option.employeeName}`}
                    value={
                      employeeOptions.find((opt) => opt.employeeCode === formData.employeeCode) || null
                    }
                    loading={isLoadingEmployees}
                    onChange={async (event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          employeeCode: newValue.employeeCode,
                          employeeName: newValue.employeeName,
                          designation: newValue.designation,
                          department: newValue.department || '',
                          supervisorCode: newValue.supervisorCode || '',
                          supervisorName: newValue.supervisorName || '',
                          reportingHeadDesignation: newValue.reportingHeadDesignation || '',
                          branch: newValue.branch || '',
                          branchCode: newValue.branchCode || ''
                        }));

                        await getPerformanceGoals(
                          formData.appraisalId,
                          newValue.employeeCode
                        );

                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          employeeCode: '',
                          employeeName: '',
                          designation: '',
                          department: '',
                          supervisorCode: '',
                          supervisorName: '',
                          reportingHeadDesignation: '',
                          branch: '',
                          branchCode: ''
                        }));

                        setAppraiseeDetailsData([]);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Employee Code"
                        size="small"
                        error={!!fieldErrors.employeeCode}
                        helperText={fieldErrors.employeeCode}
                        required
                      />
                    )}
                    noOptionsText={!formData.appraisalId ? "Please select Appraisal ID first" : "No employees found"}
                    disabled={!formData.appraisalId || isLoadingEmployees}
                  />
                </div>

                {/* Employee Name */}
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
                    disabled
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
                    disabled
                  />
                </div>

                {/* Supervisor Code */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="supervisorCode"
                    value={formData.supervisorCode}
                    onChange={handleInputChange}
                    error={!!fieldErrors.supervisorCode}
                    helperText={fieldErrors.supervisorCode}
                    disabled
                  />
                </div>

                {/* Supervisor Name */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="supervisorName"
                    value={formData.supervisorName}
                    onChange={handleInputChange}
                    error={!!fieldErrors.supervisorName}
                    helperText={fieldErrors.supervisorName}
                    disabled
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
                    disabled
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
                    <Tab value={0} label="Input" />
                  </Tabs>
                </Box>

                <Box sx={{ padding: 2 }}>
                  {value === 0 && (
                    <>
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
                                    Goals
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">
                                    Self Input
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">
                                    Self Rating
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">
                                    Score (1-5)
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">
                                    Supervisor Rating
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
                                        value={row.goals}
                                        onChange={(e) =>
                                          handleDetailChange(row.id, 'goals', e.target.value)
                                        }
                                        error={!!appraiseeDetailsErrors[index]?.goals}
                                        helperText={appraiseeDetailsErrors[index]?.goals}
                                        required
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.selfInput}
                                        onChange={(e) =>
                                          handleDetailChange(row.id, 'selfInput', e.target.value)
                                        }
                                        error={!!appraiseeDetailsErrors[index]?.selfInput}
                                        helperText={appraiseeDetailsErrors[index]?.selfInput}
                                        required
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.selfRating}
                                        onChange={(e) =>
                                          handleDetailChange(row.id, 'selfRating', e.target.value)
                                        }
                                        error={!!appraiseeDetailsErrors[index]?.selfRating}
                                        helperText={appraiseeDetailsErrors[index]?.selfRating}
                                        required
                                      />
                                    </td>

                                    <td>
                                      <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={row.score || ''}
                                        onChange={(e) => handleScoreChange(row.id, e.target.value)}
                                        SelectProps={{ native: true }}
                                      >
                                        <option value="">Select</option>
                                        {gradeList.map((g) => (
                                          <option key={g.id} value={g.score}>
                                            {g.score}
                                          </option>
                                        ))}
                                      </TextField>
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.supervisorRating || ''}
                                        disabled
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

                {/* Add Row Button at bottom */}
                <div className="row mt-2">
                  <div className="col-md-12">
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddRow}
                      sx={{ backgroundColor: '#3a6b6d', '&:hover': { backgroundColor: '#2a4b4d' } }}
                    >
                      Add Row
                    </Button>
                  </div>
                </div>

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
                                <th className="table-header">Goals</th>
                                <th className="table-header">Self Input</th>
                                <th className="table-header">Supervisor Rating</th>
                                <th className="table-header">Score (1-5)</th>
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
                                  <td className="border px-2 py-2 disable">{row.objectivedesc || ''}</td>
                                  <td className="border px-2 py-2">{row.performanceself || ''}</td>
                                  <td className="border px-2 py-2">{row.appraiserrating || ''}</td>
                                  <td className="border px-2 py-2">{row.selfrating || ''}</td>
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
                          backgroundColor: 'green',
                        },
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

export default First_LevelSupervisorInput;