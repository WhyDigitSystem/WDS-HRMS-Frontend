import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import { TextField, Box, Button, IconButton, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { Chip, Stack } from '@mui/material';

const MyGoals = () => {
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [empCode] = useState(localStorage.getItem('employeeCode') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [goalsData, setGoalsData] = useState(null);
  const [goalsDetailsData, setGoalsDetailsData] = useState([]);
  const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([]);

  // Fetch self goals on component mount
  useEffect(() => {
    if (empCode && orgId) {
      fetchSelfGoals();
    }
  }, [empCode, orgId]);

  const fetchSelfGoals = async () => {
    setIsLoading(true);
    try {
      const response = await apiCalls('get', `/goalsController/getSelfGoalsByOrgIdAndEmpCode?empCode=${empCode}&orgId=${orgId}`);

      if (response.status && response.paramObjectsMap?.selfGoalsVO?.length > 0) {
        const selfGoal = response.paramObjectsMap.selfGoalsVO[0];
        setGoalsData(selfGoal);
        setGoalsDetailsData(selfGoal.selfGoalsDetailsVO || []);
        setGoalsDetailsErrors((selfGoal.selfGoalsDetailsVO || []).map(() => ({ area: '', keyPerformanceIndicator: '', goals: '' })));
      } else {
        showToast('info', 'No goals found for the current user');
        setGoalsData(null);
        setGoalsDetailsData([]);
        setGoalsDetailsErrors([]);
      }
    } catch (error) {
      console.error('Error fetching self goals:', error);
      showToast('error', 'Failed to fetch goals data');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new empty row
  const handleAddRow = () => {
    const lastRow = goalsDetailsData[goalsDetailsData.length - 1];

    // Validate last row before adding new
    if (goalsDetailsData.length > 0 && lastRow && (!lastRow.area || !lastRow.keyPerformanceIndicator || !lastRow.goals)) {
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

    const newId = goalsDetailsData.length > 0 ? Math.min(...goalsDetailsData.map((d) => d.id || 0)) - 1 : -1;

    setGoalsDetailsData([...goalsDetailsData, { id: newId, area: '', keyPerformanceIndicator: '', goals: '' }]);
    setGoalsDetailsErrors([...goalsDetailsErrors, { area: '', keyPerformanceIndicator: '', goals: '' }]);
  };

  // Handle input changes for any row
  const handleDetailChange = (id, field, value) => {
    const index = goalsDetailsData.findIndex((d) => d.id === id);
    if (index === -1) return;

    const newData = [...goalsDetailsData];
    newData[index] = { ...newData[index], [field]: value };
    setGoalsDetailsData(newData);

    // Clear error for this field if it exists
    if (value && goalsDetailsErrors[index] && goalsDetailsErrors[index][field]) {
      const newErrors = [...goalsDetailsErrors];
      newErrors[index] = { ...newErrors[index], [field]: '' };
      setGoalsDetailsErrors(newErrors);
    }
  };

  // Delete row
  const handleDeleteRow = (id) => {
    if (goalsDetailsData.length <= 1) {
      showToast('warning', 'At least one goal detail is required');
      return;
    }

    if (window.confirm('Are you sure you want to delete this goal?')) {
      const index = goalsDetailsData.findIndex((d) => d.id === id);
      if (index === -1) return;

      const newData = goalsDetailsData.filter((d) => d.id !== id);
      const newErrors = goalsDetailsErrors.filter((_, i) => i !== index);

      setGoalsDetailsData(newData);
      setGoalsDetailsErrors(newErrors);
      showToast('success', 'Row deleted successfully');
    }
  };

  // Handle save all goals
  const handleSaveAll = async () => {
    // Validate all rows
    let hasErrors = false;
    const detailsErrors = goalsDetailsData.map((detail, idx) => {
      const error = {};
      if (!detail.area || detail.area.trim() === '') {
        error.area = 'Area is required';
        hasErrors = true;
      }
      if (!detail.keyPerformanceIndicator || detail.keyPerformanceIndicator.trim() === '') {
        error.keyPerformanceIndicator = 'KPI is required';
        hasErrors = true;
      }
      if (!detail.goals || detail.goals.trim() === '') {
        error.goals = 'Goals is required';
        hasErrors = true;
      }
      return error;
    });

    if (hasErrors) {
      setGoalsDetailsErrors(detailsErrors);
      showToast('error', 'Please fill all required fields in the goals details');
      return;
    }

    setIsLoading(true);

    // Prepare details payload
    const selfGoalsDetailsVo = goalsDetailsData.map((row) => ({
      ...(row.id && row.id > 0 && { id: row.id }),
      area: row.area,
      keyPerformanceIndicator: row.keyPerformanceIndicator,
      goals: row.goals
    }));

    const createdBy = localStorage.getItem('employeeCode') || '';

    const payload = {
      ...(goalsData?.id ? { id: goalsData.id } : {}),
      appraisalId: goalsData?.appraisalId || '',
      code: goalsData?.code || empCode,
      name: goalsData?.name || '',
      supervisorCode: goalsData?.supervisorCode || '',
      supervisorName: goalsData?.supervisorName || '',
      designation: goalsData?.designation || '',
      orgId: orgId,
      finYear: goalsData?.finYear || '2025',
      createdBy: createdBy,
      selfGoalsDetailsDTO: selfGoalsDetailsVo
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateSelfGoals', payload);
      if (response.status) {
        showToast('success', 'Goals saved successfully');
        // Refresh data
        await fetchSelfGoals();
      } else {
        showToast('error', response.message || 'Failed to save goals');
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      showToast('error', 'Failed to save goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    fetchSelfGoals();
    showToast('info', 'Data refreshed');
  };

  if (isLoading && !goalsData) {
    return (
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="text-center">
          <CircularProgress size={40} />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <ToastComponent />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          {goalsData ? (
            <>
              <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                <ActionButton title="Save" icon={SaveIcon} onClick={handleSaveAll} disabled={isLoading} />
              </div>

              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Appraisal ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={goalsData.appraisalId || ''}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Employee Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={goalsData.code || ''}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Employee Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={goalsData.name || ''}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={goalsData.supervisorCode || ''}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={goalsData.supervisorName || ''}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Designation"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={goalsData.designation || ''}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Financial Year"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={goalsData.finYear || ''}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </div>
              </div>

              <div className="row mt-2">
                <Box sx={{ padding: 2, width: '100%' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Goals Details</h4>
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
                              <th className="px-2 py-2 text-white text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {goalsDetailsData.length > 0 ? (
                              goalsDetailsData.map((row, index) => (
                                <tr key={row.id || index}>
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
                                      value={row.area || ''}
                                      onChange={(e) => handleDetailChange(row.id, 'area', e.target.value)}
                                      error={!!goalsDetailsErrors[index]?.area}
                                      helperText={goalsDetailsErrors[index]?.area}
                                      placeholder="Enter area"
                                      variant="outlined"
                                    />
                                  </td>
                                  <td className="border px-2 py-2">
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={row.keyPerformanceIndicator || ''}
                                      onChange={(e) => handleDetailChange(row.id, 'keyPerformanceIndicator', e.target.value)}
                                      error={!!goalsDetailsErrors[index]?.keyPerformanceIndicator}
                                      helperText={goalsDetailsErrors[index]?.keyPerformanceIndicator}
                                      placeholder="Enter KPI"
                                      variant="outlined"
                                    />
                                  </td>
                                  <td className="border px-2 py-2">
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={row.goals || ''}
                                      onChange={(e) => handleDetailChange(row.id, 'goals', e.target.value)}
                                      error={!!goalsDetailsErrors[index]?.goals}
                                      helperText={goalsDetailsErrors[index]?.goals}
                                      placeholder="Enter goals description"
                                      variant="outlined"
                                    />
                                  </td>
                                  <td className="border px-2 py-2 text-center">
                                    <Chip
                                      label={row.status || 'N/A'}
                                      size="small"
                                      sx={{
                                        fontWeight: 600,
                                        minWidth: '110px',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        backgroundColor:
                                          row.status === 'APPROVED'
                                            ? '#4caf50'   // green
                                            : row.status === 'In Progress'
                                              ? '#ff9800'   // orange
                                              : row.status === 'REJECTED'
                                                ? 'Red'   // grey
                                                : '#607d8b',  // fallback
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-3">
                                  No goals details available. Click "Add Row" to create new goals.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Box>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <p>No goals data available for the current user.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyGoals;