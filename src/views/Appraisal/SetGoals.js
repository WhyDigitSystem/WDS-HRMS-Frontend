import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Box, Tab, Tabs, FormControlLabel, Checkbox, Autocomplete, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';

const SetGoals = () => {
  const [listViewData, setListViewData] = useState([]);
  const [appraisalOptions, setAppraisalOptions] = useState([]);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  // New state variables for employee autocomplete
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);

  const [formData, setFormData] = useState({
    appraisalId: '',
    code: '',
    name: '',
    designation: '',
    supervisorCode: '',
    supervisorName: '',
    finYear: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    appraisalId: '',
    code: '',
    name: '',
    supervisorCode: '',
    supervisorName: ''
  });

  const [goalsDetailsData, setGoalsDetailsData] = useState([{ id: null, area: '', keyPerformanceIndicator: '', goals: '' }]);

  const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([{ area: '', keyPerformanceIndicator: '', goals: '' }]);

  const listViewColumns = [
    { accessorKey: 'appraisalId', header: 'Appraisal ID', size: 140 },
    { accessorKey: 'code', header: 'Code', size: 140 },
    { accessorKey: 'name', header: 'Name', size: 140 },
    { accessorKey: 'supervisorCode', header: 'Supv Code', size: 140 },
    { accessorKey: 'supervisorName', header: 'Supv Name', size: 140 }
  ];

  // Fetch KRA and KPI data based on Appraisal ID and Designation
  const fetchGoalsByAppraisalAndDesignation = async (appraisalId, designation) => {
    if (!appraisalId || !designation) return;

    setIsLoadingGoals(true);
    try {
      const response = await apiCalls(
        'get',
        `/goalsController/getGoalsByOrgIdByDesignation?appraisalid=${appraisalId}&designation=${encodeURIComponent(designation)}&orgId=${orgId}`
      );

      if (response.status && response.paramObjectsMap.goalsVO?.length > 0) {
        const goalsData = response.paramObjectsMap.goalsVO[0];

        // ✅ ADD THIS (VERY IMPORTANT)
        setFormData((prev) => ({
          ...prev,
          finYear: goalsData.finYear   // 🔥 dynamic finYear from API
        }));

        if (goalsData.goalsDetailsVO?.length > 0) {
          const populatedDetails = goalsData.goalsDetailsVO.map((detail) => ({
            id: null,
            area: detail.area,
            keyPerformanceIndicator: detail.indicators,
            goals: detail.goals || ''
          }));

          setGoalsDetailsData(populatedDetails);
          setGoalsDetailsErrors(populatedDetails.map(() => ({ area: '', keyPerformanceIndicator: '', goals: '' })));
        } else {
          resetGoalsDetails();
        }

        setEditId('');
      } else {
        resetGoalsDetails();
        setEditId('');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      resetGoalsDetails();
      setEditId('');
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const resetGoalsDetails = () => {
    setGoalsDetailsData([{ id: null, area: '', keyPerformanceIndicator: '', goals: '' }]);
    setGoalsDetailsErrors([{ area: '', keyPerformanceIndicator: '', goals: '' }]);
  };

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
        supervisorCode: newValue.reportingPersonCode || '',
        supervisorName: newValue.reportingPerson || '',
        designation: newValue.designation || '',
      }));

      // Clear any field errors
      setFieldErrors(prev => ({
        ...prev,
        code: '',
        name: '',
        supervisorCode: '',
        supervisorName: ''
      }));

      showToast('success', `Employee ${newValue.name} selected successfully`);

      // If appraisal ID is already selected, fetch goals data
      if (formData.appraisalId && newValue.designation) {
        fetchGoalsByAppraisalAndDesignation(formData.appraisalId, newValue.designation);
      }
    } else {
      // Clear form when selection is cleared
      setFormData(prev => ({
        ...prev,
        code: '',
        name: '',
        supervisorCode: '',
        supervisorName: '',
        designation: ''
      }));
      resetGoalsDetails();
    }
  };

  // Handle Appraisal ID change
  const handleAppraisalChange = (event, newValue) => {
    setSelectedAppraisal(newValue);

    setFormData((prev) => ({
      ...prev,
      appraisalId: newValue?.value || '',
      department: newValue?.department || '',
      designation: newValue?.designation || ''   // ✅ IMPORTANT
    }));

    setFieldErrors((prev) => ({
      ...prev,
      appraisalId: ''
    }));

    // Clear employee when appraisal changes
    setSelectedEmployee(null);

    resetGoalsDetails();
  };

  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     await getAllGoals();
  //     await getAllEmployees(); // Fetch employees for dropdown
  //     await getAppraisalDocId();

  //     // Set default employee code on component mount
  //     const defaultEmployeeCode = '';
  //     if (defaultEmployeeCode) {
  //       // Find and select the default employee
  //       const defaultEmployee = employeeOptions.find(emp => emp.code === defaultEmployeeCode);
  //       if (defaultEmployee) {
  //         setSelectedEmployee(defaultEmployee);
  //         setFormData(prev => ({
  //           ...prev,
  //           code: defaultEmployee.code,
  //           name: defaultEmployee.name,
  //           supervisorCode: defaultEmployee.reportingPersonCode || '',
  //           supervisorName: defaultEmployee.reportingPerson || '',
  //           designation: defaultEmployee.designation || ''
  //         }));
  //       }
  //     }
  //   };
  //   fetchInitialData();
  // }, [employeeOptions]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await getAllGoals();
      await getAllEmployees();
      await getAppraisalDocId();
    };
    fetchInitialData();
  }, []);  // ✅ RUN ONLY ONCE

  const getAllGoals = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getSelfGoalsByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.selfGoalsVO);
      } else {
        showToast('error', response.message || 'Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      showToast('error', 'Failed to fetch goals');
    }
  };

  const getAppraisalDocId = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAppraisalDocId?orgId=${orgId}`);

      const list = response.paramObjectsMap.goalsVO || [];

      const options = list.map((item) => ({
        label: `${item.appraisalId} - ${item.designation}`,
        value: item.appraisalId,
        designation: item.designation   // ✅ ADD THIS (from API)
      }));

      setAppraisalOptions(options);

    } catch (error) {
      console.error('Error fetching goals docid:', error);
      showToast('error', 'Failed to fetch goals docid');
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

  const filteredEmployees = employeeOptions.filter(emp => {
    if (!formData.designation) return true; // before selection show all
    return emp.designation === formData.designation;
  });

  const getGoalsById = async (row) => {
    setEditId(row.original.id);

    try {
      const response = await apiCalls(
        'get',
        `/goalsController/getSelfGoalsById?id=${row.original.id}`
      );

      if (response.status) {
        setListView(false);
        const goal = response.paramObjectsMap.selfGoalsVO;

        setFormData({
          appraisalId: goal.appraisalId,
          code: goal.code,
          name: goal.name,
          supervisorCode: goal.supervisorCode,
          supervisorName: goal.supervisorName,
          designation: goal.designation,
          orgId: parseInt(orgId),
          finYear: goal.finYear,
        });

        // ✅ FIX 1: Set Appraisal dropdown
        if (goal.appraisalId) {
          const matchedAppraisal = appraisalOptions.find(
            (opt) => opt.value === goal.appraisalId
          );
          setSelectedAppraisal(matchedAppraisal || null);
        }

        // ✅ FIX 2: Set Employee dropdown (already correct)
        if (goal.code) {
          const matchedEmployee = employeeOptions.find(
            (emp) => emp.code === goal.code
          );
          setSelectedEmployee(matchedEmployee || null);
        }

        // ✅ Details
        setGoalsDetailsData(
          goal.selfGoalsDetailsVO.map((detail) => ({
            id: detail.id,
            area: detail.area,
            keyPerformanceIndicator: detail.keyPerformanceIndicator,
            goals: detail.goals
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
    if (!formData.code) errors.code = 'Code is required';
    if (!formData.name) errors.name = 'Name is required';

    // Validate details
    const detailsErrors = goalsDetailsData.map((detail) => {
      const error = {};
      if (!detail.area) error.area = 'Area is required';
      if (!detail.keyPerformanceIndicator) error.keyPerformanceIndicator = 'KPI is required';
      if (!detail.goals) error.goals = 'Goals is required';
      return error;
    });

    const hasDetailErrors = detailsErrors.some((err) => err.area || err.keyPerformanceIndicator || err.goals);

    if (Object.keys(errors).length > 0 || hasDetailErrors) {
      setFieldErrors(errors);
      setGoalsDetailsErrors(detailsErrors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);

    // Prepare details payload with IDs
    const selfGoalsDetailsVo = goalsDetailsData.map((row) => ({
      ...(row.id && row.id > 0 && { id: row.id }),
      area: row.area,
      keyPerformanceIndicator: row.keyPerformanceIndicator,
      goals: row.goals
    }));

    const payload = {
      ...(editId ? { id: editId } : {}),
      appraisalId: formData.appraisalId,
      code: formData.code,
      name: formData.name,
      supervisorCode: formData.supervisorCode,
      supervisorName: formData.supervisorName,
      designation: formData.designation,
      orgId: parseInt(orgId),
      finYear: formData.finYear,
      createdBy,
      selfGoalsDetailsDTO: selfGoalsDetailsVo
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateSelfGoals', payload);
      if (response.status) {
        showToast('success', editId ? 'My Goal updated successfully' : 'My Goal created successfully');
        handleClear();
        getAllGoals();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      showToast('error', 'Failed to save goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      appraisalId: '',
      code: '',
      name: '',
      supervisorCode: '',
      supervisorName: '',
      designation: ''
    });

    setFieldErrors({
      appraisalId: '',
      code: '',
      name: '',
      supervisorCode: '',
      supervisorName: ''
    });

    setGoalsDetailsData([{ id: null, area: '', keyPerformanceIndicator: '', goals: '' }]);
    setGoalsDetailsErrors([{ area: '', keyPerformanceIndicator: '', goals: '' }]);

    setEditId('');
    setSelectedAppraisal(null);
    setSelectedEmployee(null);
  };

  const handleAddRow = () => {
    const lastRow = goalsDetailsData[goalsDetailsData.length - 1];

    if (!lastRow.area || !lastRow.keyPerformanceIndicator || !lastRow.goals) {
      const newErrors = [...goalsDetailsErrors];
      const lastIndex = newErrors.length - 1;
      newErrors[lastIndex] = {
        area: !lastRow.area ? 'Area is required' : '',
        keyPerformanceIndicator: !lastRow.keyPerformanceIndicator ? 'KPI is required' : '',
        goals: !lastRow.goals ? 'Goals is required' : ''
      };
      setGoalsDetailsErrors(newErrors);
      showToast('warning', 'Please fill current row before adding new');
      return;
    }

    const newId = goalsDetailsData.length > 0 ? Math.min(...goalsDetailsData.map((d) => d.id)) - 1 : -1;

    setGoalsDetailsData((prev) => [...prev, { id: newId, area: '', keyPerformanceIndicator: '', goals: '' }]);
    setGoalsDetailsErrors((prev) => [...prev, { area: '', keyPerformanceIndicator: '', goals: '' }]);
  };

  const handleDeleteRow = (id) => {
    if (goalsDetailsData.length <= 1) {
      showToast('warning', 'At least one goal detail is required');
      return;
    }

    const index = goalsDetailsData.findIndex((d) => d.id === id);
    if (index === -1) return;

    const newData = goalsDetailsData.filter((d) => d.id !== id);
    const newErrors = goalsDetailsErrors.filter((_, i) => i !== index);

    setGoalsDetailsData(newData);
    setGoalsDetailsErrors(newErrors);
  };

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
                {/* Appraisal ID Autocomplete */}
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={appraisalOptions}
                    getOptionLabel={(option) => option.label || ''}
                    value={selectedAppraisal}   // ✅ controlled UI
                    onChange={handleAppraisalChange}
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

                {/* Employee Code - Autocomplete */}
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={filteredEmployees}   // ✅ FILTERED
                    // loading={isLoadingEmployees}
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
                    noOptionsText={
                      formData.designation
                        ? 'No employees found for selected designation'
                        : 'No employees found'
                    }
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
                    disabled
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                  />
                </div>

                {/* Supervisor Code */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="supervisorCode"
                    value={formData.supervisorCode}
                    onChange={handleInputChange}
                    error={!!fieldErrors.supervisorCode}
                    helperText={fieldErrors.supervisorCode}
                  />
                </div>

                {/* Supervisor Name */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="supervisorName"
                    value={formData.supervisorName}
                    onChange={handleInputChange}
                    error={!!fieldErrors.supervisorName}
                    helperText={fieldErrors.supervisorName}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    label="Designation"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    error={!!fieldErrors.designation}
                    helperText={fieldErrors.designation}
                  />
                </div>
              </div>

              {/* Loading indicator for goals */}
              {isLoadingGoals && (
                <div className="text-center my-3">
                  <CircularProgress size={30} />
                  <span className="ml-2">Loading goals data...</span>
                </div>
              )}

              <div className="row mt-2">
                <Box sx={{ width: '100%' }}>
                  <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                    <Tab value={0} label="Goals Details" />
                  </Tabs>
                </Box>

                <Box sx={{ padding: 2 }}>
                  {value === 0 && (
                    <>
                      <div className="mb-1">
                        <ActionButton title="Add Row" icon={AddIcon} onClick={handleAddRow} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr
                                  style={{
                                    background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                    color: 'white'
                                  }}
                                >
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    S.No
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">Area (KRA)</th>
                                  <th className="px-2 py-2 text-white text-center">Key Performance Indicators (KPI)</th>
                                  <th className="px-2 py-2 text-white text-center">Goals</th>
                                </tr>
                              </thead>
                              <tbody>
                                {goalsDetailsData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteRow(row.id)} />
                                    </td>
                                    <td className="text-center pt-3">{index + 1}</td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.area}
                                        onChange={(e) => handleDetailChange(row.id, 'area', e.target.value)}
                                        error={!!goalsDetailsErrors[index]?.area}
                                        helperText={goalsDetailsErrors[index]?.area}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.keyPerformanceIndicator}
                                        onChange={(e) => handleDetailChange(row.id, 'keyPerformanceIndicator', e.target.value)}
                                        error={!!goalsDetailsErrors[index]?.keyPerformanceIndicator}
                                        helperText={goalsDetailsErrors[index]?.keyPerformanceIndicator}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.goals}
                                        onChange={(e) => handleDetailChange(row.id, 'goals', e.target.value)}
                                        error={!!goalsDetailsErrors[index]?.goals}
                                        helperText={goalsDetailsErrors[index]?.goals}
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={true} toEdit={getGoalsById} />
          )}
        </div>
      </div>
    </>
  );
};

export default SetGoals;