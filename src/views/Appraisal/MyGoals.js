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

const MyGoals = () => {
  const [listViewData, setListViewData] = useState([]);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [isFetchingEmployee, setIsFetchingEmployee] = useState(false);
  // const finYear = '2025';

  const [formData, setFormData] = useState({
    appraisalId: '',
    code: localStorage.getItem('employeeCode') || '',
    name: '',
    supervisorCode: '',
    supervisorName: ''
    // active: true
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
    // { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      await getAllGoals();
      if (formData.code) {
        await fetchEmployeeDetails(formData.code);
      }
    };
    fetchInitialData();
  }, []);

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

  const fetchEmployeeDetails = async (employeeCode) => {
    if (!employeeCode || !orgId) return;

    setIsFetchingEmployee(true);
    try {
      const response = await apiCalls('get', `goalsController/getEmployeeDetails?employeeCode=${employeeCode}&orgId=${orgId}`);
      console.log('Employee details response:', response); // Debug log

      if (response?.status) {
        // Try different response structures
        const employeeData = response.paramObjectsMap?.employeeVO?.[0] || response.paramObjectsMap?.employeeDetails || response.data;

        if (employeeData) {
          setFormData((prev) => ({
            ...prev,
            name: employeeData.empName || employeeData.name || '',
            supervisorCode: employeeData.reportingPersonCode || employeeData.supervisorCode || '',
            supervisorName: employeeData.reportingPerson || employeeData.supervisorName || ''
          }));

          setFieldErrors((prev) => ({
            ...prev,
            name: '',
            supervisorCode: '',
            supervisorName: ''
          }));

          // showToast('success', `Employee details loaded`);
        } else {
          // showToast('warning', 'Employee details not found in response');
        }
      } else {
        showToast('error', response.message || 'Failed to fetch employee details');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      showToast('error', 'Failed to fetch employee details');
    } finally {
      setIsFetchingEmployee(false);
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

    // Fetch employee details when code changes
    if (name === 'code' && value.length > 3) {
      fetchEmployeeDetails(value);
    }
  };

  useEffect(() => {
    getAllGoals();
    // Set default employee code on component mount
    const defaultEmployeeCode = localStorage.getItem('employeeCode') || '';
    if (defaultEmployeeCode) {
      setFormData((prev) => ({
        ...prev,
        code: defaultEmployeeCode
      }));
      fetchEmployeeDetails(defaultEmployeeCode);
    }
  }, []);

  const getGoalsById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getSelfGoalsById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const goal = response.paramObjectsMap.selfGoalsVO;
        setFormData({
          appraisalId: goal.appraisalId,
          code: goal.code,
          name: goal.name,
          supervisorCode: goal.supervisorCode,
          supervisorName: goal.supervisorName,
          orgId: parseInt(orgId),
          finYear: '2025',
          // active: goal.active === true
        });

        // Preserve actual database IDs
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

  // const getGoalsById = async (row) => {
  //   setEditId(row.original.id);
  //   try {
  //     const response = await apiCalls('get', `/goalsController/getSelfGoalsById?id=${row.original.id}`);
  //     console.log("API Response:", response); // For debugging

  //     if (response.status) {
  //       setListView(false);

  //       // Handle different possible response structures
  //       const goal = response.paramObjectsMap?.selfGoalsVO ||
  //         response.paramObjectsMap?.preGoalsVO?.[0] ||
  //         response.data?.[0];

  //       if (!goal) {
  //         showToast('error', 'Goal data not found in response');
  //         return;
  //       }

  //       setFormData({
  //         appraisalId: goal.appraisalId,
  //         code: goal.code,
  //         name: goal.name,
  //         supervisorCode: goal.supervisorCode,
  //         supervisorName: goal.supervisorName,
  //         active: goal.active
  //       });

  //       // Handle goals details - check different possible keys
  //       const details = response.paramObjectsMap?.selfGoalsDetailsVO ||
  //         response.paramObjectsMap?.preGoalsDetailsVO ||
  //         response.data?.details ||
  //         [];

  //       setGoalsDetailsData(
  //         details.map(detail => ({
  //           id: detail.id,
  //           area: detail.area,
  //           keyPerformanceIndicator: detail.keyPerformanceIndicator,
  //           goals: detail.goals,
  //         }))
  //       );

  //       setGoalsDetailsErrors(
  //         details.map(() => ({
  //           area: '',
  //           keyPerformanceIndicator: '',
  //           goals: ''
  //         }))
  //       );
  //     } else {
  //       showToast('error', response.message || 'Failed to fetch goal details');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching goal details:', error);
  //     showToast('error', 'Failed to fetch goal details');
  //   }
  // };

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

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGoalsDetailsErrors(detailsErrors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);

    // Prepare details payload with IDs
    const selfGoalsDetailsVo = goalsDetailsData.map((row) => ({
      // ...(editId && { id: editId }),
      ...(row.id && { id: row.id }),
      // id: row.id,
      area: row.area,
      keyPerformanceIndicator: row.keyPerformanceIndicator,
      goals: row.goals
    }));

    const payload = {
      ...(editId && { id: editId }),
      // active: formData.active,
      appraisalId: formData.appraisalId,
      code: formData.code,
      name: formData.name,
      supervisorCode: formData.supervisorCode,
      supervisorName: formData.supervisorName,
      orgId: parseInt(orgId),
      finYear: '2025',
      createdBy,
      selfGoalsDetailsDTO: selfGoalsDetailsVo
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateSelfGoals', payload);
      if (response.status) {
        showToast('success', editId ? 'Self Goal updated successfully' : 'Self Goal created successfully');
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
      code: localStorage.getItem('employeeCode') || '',
      name: '',
      supervisorCode: '',
      supervisorName: ''
      // active: true
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

    // Fetch employee details again if code exists
    if (formData.code) {
      fetchEmployeeDetails(formData.code);
    }
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
                <div className="col-md-2 mb-3">
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
                <div className="col-md-2 mb-3">
                  <TextField
                    label="Employee Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    error={!!fieldErrors.code}
                    helperText={fieldErrors.code}
                    disabled
                  />
                </div>
                <div className="col-md-2 mb-3">
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
                    disabled
                  />
                </div>
                <div className="col-md-2 mb-3">
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
                <div className="col-md-2 mb-3">
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
                {/* <div className="col-md-3 mb-3 flex items-center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </div> */}
              </div>

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
                                  <th className="px-2 py-2 text-white text-center">Area</th>
                                  <th className="px-2 py-2 text-white text-center">Key Performance Indicators</th>
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

export default MyGoals;
