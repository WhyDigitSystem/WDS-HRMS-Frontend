import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Button, TextField, Box, Tab, Tabs, FormControlLabel, Checkbox } from '@mui/material';
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
  const [formData, setFormData] = useState({
    appraisalId: '',
    department: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    appraisalId: '',
    department: ''
  });

  const [goalsDetailsData, setGoalsDetailsData] = useState([{ id: null, area: '', indicator: '', goals: '' }]);

  const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([{ area: '', indicator: '', goals: '' }]);

  const listViewColumns = [
    { accessorKey: 'appraisalId', header: 'Appraisal ID', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 }
    // { accessorKey: 'code', header: 'Code', size: 140 },
    // { accessorKey: 'name', header: 'Name', size: 140 },
    // { accessorKey: 'supervisorCode', header: 'Supv Code', size: 140 },
    // { accessorKey: 'supervisorName', header: 'Supv Name', size: 140 },
    // { accessorKey: 'active', header: 'Active', size: 140 }
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
  }, []);

  const getGoalsDocId = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getGoalsDocId?orgId=${orgId}`);

      const docId = response.paramObjectsMap.goalsDocId;

      setGoalsDocId(docId);

      // ✅ IMPORTANT: also set into formData
      setFormData((prev) => ({
        ...prev,
        appraisalId: docId
      }));

    } catch (error) {
      console.error('Error fetching goals docid:', error);
      showToast('error', 'Failed to fetch goals docid');
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
          department: goal.department
        });

        // Preserve actual database IDs
        setGoalsDetailsData(
          goal.goalsDetailsVO.map((detail) => ({
            id: detail.id, // Actual ID from database
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
    if (!formData.department) errors.department = 'Department is required';

    // Validate details
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

    // Prepare details payload with IDs
    const goalsDetailsVo = goalsDetailsData.map((row) => ({
      area: row.area,
      indicators: row.indicator,
      goals: row.goals
    }));

    const payload = {
      ...(editId && { id: editId }),
      active: formData.active,
      appraisalId: formData.appraisalId,
      department: formData.department,
      finYear: formData.finYear,
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
      department: ''
    });

    setFieldErrors({
      appraisalId: '',
      department: ''
    });

    setGoalsDetailsData([{ id: null, area: '', indicator: '', goals: '' }]);

    setGoalsDetailsErrors([{ area: '', indicator: '', goals: '' }]);

    setEditId('');
  };

  const handleAddRow = () => {
    const lastRow = goalsDetailsData[goalsDetailsData.length - 1];

    // Validate last row before adding new one
    if (!lastRow.area || !lastRow.indicator || !lastRow.goals) {
      const newErrors = [...goalsDetailsErrors];
      const lastIndex = newErrors.length - 1;
      newErrors[lastIndex] = {
        area: !lastRow.area ? 'Area is required' : '',
        indicator: !lastRow.indicator ? 'Indicator is required' : '',
        goals: !lastRow.goals ? 'Goals is required' : ''
      };
      setGoalsDetailsErrors(newErrors);
      showToast('warning', 'Please fill current row before adding new');
      return;
    }

    // Generate temporary negative ID for new rows
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
                  <TextField
                    label="Appraisal ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="appraisalId"
                    value={formData.appraisalId}
                    disabled
                    onChange={handleInputChange}
                    error={!!fieldErrors.appraisalId}
                    helperText={fieldErrors.appraisalId}
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
                                  <th className="px-2 py-2 text-white text-center">Area</th>
                                  <th className="px-2 py-2 text-white text-center">Indicators</th>
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
                                        value={row.indicator}
                                        onChange={(e) => handleDetailChange(row.id, 'indicator', e.target.value)}
                                        error={!!goalsDetailsErrors[index]?.indicator}
                                        helperText={goalsDetailsErrors[index]?.indicator}
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

export default Goals;
