import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Button, TextField, Box, Tab, Tabs, FormControlLabel, Checkbox, MenuItem, Autocomplete } from '@mui/material';
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

const Goals = () => {
  const [listViewData, setListViewData] = useState([]);
  const [goalsDocId, setGoalsDocId] = useState([]);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [kpiKraList, setKpiKraList] = useState([]); // Store KPI/KRA data
  const [selectedAppraisalData, setSelectedAppraisalData] = useState(null); // Store selected appraisal data

  const [formData, setFormData] = useState({
    appraisalId: '',
    designation: '',
    finYear: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    appraisalId: '',
    department: '',
    finYear: ''
  });

  const [goalsDetailsData, setGoalsDetailsData] = useState([{ id: null, area: '', indicator: '', goals: '' }]);

  const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([{ area: '', indicator: '', goals: '' }]);

  const listViewColumns = [
    { accessorKey: 'appraisalId', header: 'Appraisal ID', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    { accessorKey: 'finYear', header: 'Year', size: 140 }
  ];

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
    getGoalsDocId();
    getAllKRAKPIs(); // Fetch KPI/KRA data on load
  }, []);

  const getGoalsDocId = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getGoalsDocId?orgId=${orgId}`);

      const docId = response.paramObjectsMap.goalsDocId;

      setGoalsDocId(docId);

      setFormData((prev) => ({
        ...prev,
        appraisalId: docId
      }));

    } catch (error) {
      console.error('Error fetching goals docid:', error);
      showToast('error', 'Failed to fetch goals docid');
    }
  };

  const getAllKRAKPIs = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getKpiKraByOrgId?orgId=${orgId}`);
      if (response.status) {
        setKpiKraList(response.paramObjectsMap.kpiKraVO || []);
      } else {
        showToast('error', response.message || 'Failed to fetch KPIKRA');
      }
    } catch (error) {
      console.error('Error fetching KPIKRA:', error);
      showToast('error', 'Failed to fetch KPIKRA');
    }
  };

  const getAllGoals = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getGoalsByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.goalsVO);
      } else {
        showToast('error', response.message || 'Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      showToast('error', 'Failed to fetch goals');
    }
  };

  const getGoalsById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getGoalsById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const goal = response.paramObjectsMap.goalsVO;
        setFormData({
          appraisalId: goal.appraisalId,
          designation: goal.designation,
          finYear: goal.finYear,
        });

        // Preserve actual database IDs
        setGoalsDetailsData(
          goal.goalsDetailsVO.map((detail) => ({
            id: detail.id,
            area: detail.area,
            indicator: detail.indicators,
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
    if (!formData.designation) errors.designation = 'Designation is required';
    if (!formData.finYear) errors.finYear = 'Year is required';

    // Validate details - check if goals are filled
    const detailsErrors = goalsDetailsData.map((detail) => {
      const error = {};
      if (!detail.area) error.area = 'Area is required';
      if (!detail.indicator) error.indicator = 'KPI is required';
      if (!detail.goals) error.goals = 'Goals is required';
      return error;
    });

    const hasDetailErrors = detailsErrors.some((err) => err.area || err.indicator || err.goals);

    if (Object.keys(errors).length > 0 || hasDetailErrors) {
      setFieldErrors(errors);
      setGoalsDetailsErrors(detailsErrors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);

    // Prepare details payload
    const goalsDetailsVo = goalsDetailsData.map((row) => ({
      area: row.area,
      indicators: row.indicator,
      goals: row.goals,
      ...(row.kpiId && { kpiId: row.kpiId }), // Include KPI ID if available
      ...(row.kraId && { kraId: row.kraId })  // Include KRA ID if available
    }));

    const payload = {
      ...(editId && { id: editId }),
      active: true,
      appraisalId: formData.appraisalId,
      designation: formData.designation,
      finYear: formData.finYear,
      finYear: formData.finYear || new Date().getFullYear().toString(),
      orgId,
      createdBy,
      goalsDetailsDTO: goalsDetailsVo
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateGoals', payload);
      if (response.status) {
        showToast('success', editId ? 'Goal updated successfully' : 'Goal created successfully');
        handleClear();
        getAllGoals();
        getGoalsDocId();
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
      designation: '',
      finYear: ''
    });

    setFieldErrors({
      appraisalId: '',
      department: '',
      finYear: ''
    });

    setSelectedAppraisalData(null);

    setGoalsDetailsData([{ id: null, area: '', indicator: '', goals: '' }]);
    setGoalsDetailsErrors([{ area: '', indicator: '', goals: '' }]);

    setEditId('');
  };

  const handleAddRow = () => {
    const lastRow = goalsDetailsData[goalsDetailsData.length - 1];

    // Validate last row before adding new one
    if (!lastRow.goals) {
      const newErrors = [...goalsDetailsErrors];
      const lastIndex = newErrors.length - 1;
      newErrors[lastIndex] = {
        ...newErrors[lastIndex],
        goals: 'Goals is required before adding new row'
      };
      setGoalsDetailsErrors(newErrors);
      showToast('warning', 'Please fill goals for current row before adding new');
      return;
    }

    // Add new empty row
    const newId = goalsDetailsData.length > 0 ? Math.min(...goalsDetailsData.map((d) => d.id)) - 1 : -1;

    setGoalsDetailsData((prev) => [...prev, { id: newId, area: '', indicator: '', goals: '' }]);
    setGoalsDetailsErrors((prev) => [...prev, { area: '', indicator: '', goals: '' }]);
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

    // Update data
    const newData = [...goalsDetailsData];
    newData[index] = { ...newData[index], [field]: value };
    setGoalsDetailsData(newData);

    // Clear error for this field
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
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={kpiKraList}
                    getOptionLabel={(option) => option.appraisalId || ''}
                    value={kpiKraList.find(item => item.appraisalId === formData.appraisalId) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setSelectedAppraisalData(newValue);
                        setFormData((prev) => ({
                          ...prev,
                          appraisalId: newValue.appraisalId,
                          designation: newValue.designation || '',
                          finYear: newValue.finYear || '',
                        }));

                        // Populate goals details from KPI/KRA data
                        if (newValue && newValue.kpiKraDetailsVO) {
                          const populatedDetails = newValue.kpiKraDetailsVO.map((detail, index) => ({
                            id: index,
                            area: detail.kraDescription,
                            indicator: detail.kpiDescription,
                            goals: '',
                            kpiId: detail.kpiId,
                            kraId: detail.kraId
                          }));

                          setGoalsDetailsData(populatedDetails);
                          setGoalsDetailsErrors(populatedDetails.map(() => ({ area: '', indicator: '', goals: '' })));
                        } else {
                          setGoalsDetailsData([{ id: null, area: '', indicator: '', goals: '' }]);
                          setGoalsDetailsErrors([{ area: '', indicator: '', goals: '' }]);
                        }
                      } else {
                        // Handle clear
                        setFormData((prev) => ({
                          ...prev,
                          appraisalId: '',
                          designation: '',
                          finYear: ''
                        }));
                        setSelectedAppraisalData(null);
                        setGoalsDetailsData([{ id: null, area: '', indicator: '', goals: '' }]);
                        setGoalsDetailsErrors([{ area: '', indicator: '', goals: '' }]);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Appraisal ID"
                        variant="outlined"
                        size="small"
                        error={!!fieldErrors.appraisalId}
                        helperText={fieldErrors.appraisalId}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.appraisalId === value?.appraisalId}
                    noOptionsText="No Appraisal IDs found"
                    clearOnEscape
                    freeSolo={false}
                    disableClearable={false}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    label="Designation"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="designation"
                    value={formData.designation}
                    disabled
                    onChange={handleInputChange}
                    error={!!fieldErrors.designation}
                    helperText={fieldErrors.designation}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Year"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="finYear"
                    value={formData.finYear}
                    disabled
                    onChange={handleInputChange}
                    error={!!fieldErrors.finYear}
                    helperText={fieldErrors.finYear}
                  />
                </div>
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
                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
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
                                  <th className="px-2 py-2 text-white text-center">Indicators (KPI)</th>
                                  <th className="px-2 py-2 text-white text-center">Goals</th>
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
                                        disabled={goalsDetailsData.length <= 1}
                                      />
                                    </td>
                                    <td className="text-center pt-3">{index + 1}</td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.area}
                                        disabled // Area is auto-populated from KRA
                                        onChange={(e) => handleDetailChange(row.id, 'area', e.target.value)}
                                        error={!!goalsDetailsErrors[index]?.area}
                                        helperText={goalsDetailsErrors[index]?.area}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.indicator}
                                        disabled // Indicator is auto-populated from KPI
                                        onChange={(e) => handleDetailChange(row.id, 'indicator', e.target.value)}
                                        error={!!goalsDetailsErrors[index]?.indicator}
                                        helperText={goalsDetailsErrors[index]?.indicator}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Enter goals here..."
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

export default Goals;