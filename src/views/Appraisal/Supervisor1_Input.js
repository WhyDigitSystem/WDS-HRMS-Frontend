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

const Supervisor1_Input = () => {
  const [listViewData, setListViewData] = useState([]);
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

  const [formData, setFormData] = useState({
    code: localStorage.getItem('employeeCode') || '',
    name: '',
    branch: '',
    department: '',
    designation: '',
    reportingHead: '',
    reportingHeadCode: '',
    reportingHeadDesignation: '',
    finYear: new Date().getFullYear(),
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    code: '',
    name: '',
    department: '',
    designation: '',
    reportingHeadCode: '',
    reportingHead: '',
    reportingHeadDesignation: '',
  });

  const [appraiseeDetailsData, setAppraiseeDetailsData] = useState([
    { id: Date.now(), area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
  ]);

  const [appraiseeDetailsErrors, setAppraiseeDetailsErrors] = useState([
    { area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
  ]);

  const listViewColumns = [
    { accessorKey: 'code', header: 'Code', size: 140 },
    { accessorKey: 'name', header: 'Name', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    { accessorKey: 'reportingHead', header: 'Reporting Head', size: 140 },
    { accessorKey: 'reportingHeadDesignation', header: 'Reporting Head Designation', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      await getAllAppraisees();
      if (formData.code) {
        await fetchEmployeeDetails(formData.code);
      }
    };
    fetchInitialData();
  }, []);

  const getAllAppraisees = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAppraiseeByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.appraiseeVO || []);
      } else {
        showToast('error', response.message || 'Failed to fetch appraisees');
      }
    } catch (error) {
      console.error('Error fetching appraisees:', error);
      showToast('error', 'Failed to fetch appraisees');
    }
  };

  const fetchEmployeeDetails = async (employeeCode) => {
    if (!employeeCode || !orgId) return;

    setIsFetchingEmployee(true);
    try {
      const response = await apiCalls('get', `goalsController/getEmployeeDetails?employeeCode=${employeeCode}&orgId=${orgId}`);

      if (response?.status) {
        const employeeData = response.paramObjectsMap?.employeeVO?.[0] ||
          response.paramObjectsMap?.employeeDetails ||
          response.data;

        if (employeeData) {
          setFormData(prev => ({
            ...prev,
            name: employeeData.empName || employeeData.name || '',
            department: employeeData.department || '',
            designation: employeeData.empDesignation || employeeData.designation || '',
            reportingHeadCode: employeeData.reportingPersonCode || '',
            reportingHead: employeeData.reportingPerson || '',
            reportingHeadDesignation: employeeData.reportingPersonRole || '',
            branch: employeeData.branch || ''
          }));

          setFieldErrors(prev => ({
            ...prev,
            name: '',
            department: '',
            designation: '',
            reportingHeadCode: '',
            reportingHead: '',
            reportingHeadDesignation: ''
          }));

          // showToast('success', `Employee details loaded`);
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

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));

    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const getAppraiseeById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getAppraiseeById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const appraisee = response.paramObjectsMap.appraiseeVO;

        setFormData({
          id: appraisee.id,
          code: appraisee.code,
          name: appraisee.name,
          branch: appraisee.branch,
          department: appraisee.department,
          designation: appraisee.designation,
          reportingHeadCode: appraisee.reportingHeadCode,
          reportingHead: appraisee.reportingHead,
          reportingHeadDesignation: appraisee.reportingHeadDesignation,
          finYear: appraisee.finYear,
          active: appraisee.active === 'Active',
        });

        // FIXED: Handle appraiseeDetails data properly
        const details = appraisee.appraiseeDetailsVO || [];
        setAppraiseeDetailsData(
          details.map(detail => ({
            id: detail.id || Date.now() + Math.random(),
            area: detail.area,
            keyPerformanceIndicator: detail.keyPerformanceIndicator,
            goals: detail.goals,
            reMarks: detail.reMarks
          }))
        );

        setAppraiseeDetailsErrors(
          details.map(() => ({
            area: '',
            keyPerformanceIndicator: '',
            goals: '',
            reMarks: ''
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching appraisee details:', error);
      showToast('error', 'Failed to fetch appraisee details');
    }
  };

  const validateAppraiseeDetails = () => {
    let isValid = true;
    const newErrors = [];

    appraiseeDetailsData.forEach((row) => {
      const errors = {};
      
      if (!row.area) {
        errors.area = 'Area is required';
        isValid = false;
      }
      if (!row.goals) {
        errors.goals = 'Goals are required';
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
    if (!formData.code) errors.code = 'Code is required';
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.designation) errors.designation = 'Designation is required';

    // Set field errors
    setFieldErrors(errors);
    
    // Validate appraisee details
    const isDetailsValid = validateAppraiseeDetails();
    
    if (Object.keys(errors).length > 0 || !isDetailsValid) {
      showToast('error', 'Please fill all required fields');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const appraiseeDetailsVo = appraiseeDetailsData.map(row => ({
      ...(editId && { id: row.id }),
      area: row.area,
      keyPerformanceIndicator: row.keyPerformanceIndicator,
      goals: row.goals,
      reMarks: row.reMarks || ''
    }));

    const payload = {
      ...(editId && { id: editId }),
      active: formData.active,
      appraiseeDetailsDTO: appraiseeDetailsVo,
      branch,
      code: formData.code,
      createdBy,
      department,
      designation,
      finYear: formData.finYear,
      name: formData.name,
      orgId,
      reportingHead: formData.reportingHead,
      reportingHeadCode: formData.reportingHeadCode,
      reportingHeadDesignation: formData.reportingHeadDesignation,
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateAppraisee', payload);
      if (response.status) {
        showToast('success', editId ? 'Appraisee updated successfully' : 'Appraisee created successfully');
        handleClear();
        getAllAppraisees();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving appraisee:', error);
      showToast('error', 'Failed to save appraisee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      id: '',
      code: localStorage.getItem('employeeCode') || '',
      name: '',
      branch: '',
      department: '',
      designation: '',
      reportingHead: '',
      reportingHeadCode: '',
      reportingHeadDesignation: '',
      finYear: new Date().getFullYear(),
      active: true
    });

    setFieldErrors({
      code: '',
      name: '',
      department: '',
      designation: '',
      reportingHeadCode: '',
      reportingHead: '',
      reportingHeadDesignation: '',
    });

    setAppraiseeDetailsData([
      { id: Date.now(), area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
    ]);

    setAppraiseeDetailsErrors([
      { area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
    ]);

    setEditId('');
  };

  const handleAddRow = () => {
    const newId = Date.now();
    setAppraiseeDetailsData(prev => [
      ...prev, 
      { id: newId, area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
    ]);
    setAppraiseeDetailsErrors(prev => [
      ...prev, 
      { area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
    ]);
  };

  const handleDeleteRow = (id) => {
    if (appraiseeDetailsData.length <= 1) {
      // Replace the last row with a new empty row
      const newId = Date.now();
      setAppraiseeDetailsData([
        { id: newId, area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
      ]);
      setAppraiseeDetailsErrors([
        { area: '', keyPerformanceIndicator: '', goals: '', reMarks: '' }
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

    // Update data
    const newData = [...appraiseeDetailsData];
    newData[index] = { ...newData[index], [field]: value };
    setAppraiseeDetailsData(newData);

    // Clear error for this field
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
      const response = await apiCalls('get', `/goalsController/getAppraiseeFillGrid?orgId=${orgId}&employeeCode=${formData.code}`);
      if (response.status) {
        setFillGridData(response.paramObjectsMap.appraiseeFillGrid || []);
        // Reset selection when opening modal
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

  const handleFillGridRemarkChange = (index, value) => {
    setFillGridData(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], reMarks: value };
      return newData;
    });
  };

  const handleSubmitSelectedRows = () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);

    // Create a Set of existing area+goals combinations for faster lookup
    const existingCombinations = new Set(
      appraiseeDetailsData.map(item => `${item.area}|${item.goals}`)
    );

    const newData = [];
    
    selectedData.forEach((data) => {
      const combinationKey = `${data.area}|${data.goals}`;
      
      // Only add if not already in the list
      if (!existingCombinations.has(combinationKey)) {
        newData.push({
          id: Date.now() + Math.random(),
          area: data.area || '',
          keyPerformanceIndicator: data.keyPerformanceIndicator || '',
          goals: data.goals || '',
          reMarks: data.reMarks || ''
        });
        existingCombinations.add(combinationKey); // Prevent duplicates in this batch
      }
    });

    if (newData.length === 0) {
      showToast('warning', 'Selected items are already added or contain no data!');
      return;
    }

    // Remove initial empty row if it exists and has no data
    const filteredExistingData = appraiseeDetailsData.filter(row => 
      !(row.area === '' && row.keyPerformanceIndicator === '' && row.goals === '' && row.reMarks === '')
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
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
          </div>

          {!listView ? (
            <>
              <div className="row d-flex ml">

                {/* Appraisal ID */}
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

                {/* Employee Code */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Code"
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

                {/* Employee Name */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Name"
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

                {/* department */}
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
                    disabled
                  />
                </div>

                {/* designation */}
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

                {/* reportingHeadCode */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="reportingHeadCode"
                    value={formData.reportingHeadCode}
                    onChange={handleInputChange}
                    error={!!fieldErrors.reportingHeadCode}
                    helperText={fieldErrors.reportingHeadCode}
                    disabled
                  />
                </div>

                {/* reportingHead */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supervisor Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="reportingHead"
                    value={formData.reportingHead}
                    onChange={handleInputChange}
                    error={!!fieldErrors.reportingHead}
                    helperText={fieldErrors.reportingHead}
                    disabled
                  />
                </div>

                {/* reportingHeadDesignation */}
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
                      <div className="mb-1">
                        {/* <ActionButton title="Add Row" icon={AddIcon} onClick={handleAddRow} /> */}
                        <ActionButton title="Fill Grid" icon={GridOnIcon} onClick={handleFullGrid} />
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
                                  <th className="px-2 py-2 text-white text-center">
                                    Goals
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">
                                    Self Input
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">
                                    Supervisor 1 Rating
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">
                                    Score (1-5)
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
                                        value={row.area}
                                        onChange={(e) =>
                                          handleDetailChange(row.id, 'area', e.target.value)
                                        }
                                        error={!!appraiseeDetailsErrors[index]?.area}
                                        helperText={appraiseeDetailsErrors[index]?.area}
                                        required
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.keyPerformanceIndicator}
                                        onChange={(e) =>
                                          handleDetailChange(row.id, 'keyPerformanceIndicator', e.target.value)
                                        }
                                        error={!!appraiseeDetailsErrors[index]?.keyPerformanceIndicator}
                                        helperText={appraiseeDetailsErrors[index]?.keyPerformanceIndicator}
                                      />
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
                                        value={row.reMarks}
                                        onChange={(e) =>
                                          handleDetailChange(row.id, 'reMarks', e.target.value)
                                        }
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
                                <th className="table-header">Supervisor 1 Rating</th>
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
                                  <td className="border px-2 py-2 disable">{row.area || ''}</td>
                                  <td className="border px-2 py-2">{row.keyPerformanceIndicator || ''}</td>
                                  <td className="border px-2 py-2">{row.goals || ''}</td>
                                  <td className="border px-2 py-2">{row.reMarks || ''}</td>
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
export default Supervisor1_Input;