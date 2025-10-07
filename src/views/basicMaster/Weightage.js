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
const Weightage = () => {
  const [listViewData, setListViewData] = useState([]);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [finYear] = useState(localStorage.getItem('finYear'));

  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [formData, setFormData] = useState({
    level: '',
    businessOperations: 0,
    valueCreation: 0,
    peopleEngagement: 0,
    invlId: 0,
    remarks: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    level: '',
    businessOperations: '',
    valueCreation: '',
    peopleEngagement: '',
    invlId: '',
    remarks: ''
  });
  const listViewColumns = [
    { accessorKey: 'level', header: 'Level', size: 140 },
    { accessorKey: 'businessOperations', header: 'Business Operations', size: 140 },
    { accessorKey: 'valueCreation', header: 'Value Creation', size: 140 },
    { accessorKey: 'peopleEngagement', header: 'People Engagement', size: 140 }
  ];

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    const updatedValue = value;
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
    getAllWeightage();
  }, []);

  const getAllWeightage = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getWeightageByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.weightageVO);
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };
  const getWeightageById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getWeightageById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const goal = response.paramObjectsMap.weightageVO;
        setFormData({
          level: goal.level,
          businessOperations: goal.businessOperations,
          valueCreation: goal.valueCreation,
          peopleEngagement: goal.peopleEngagement,
          remarks: goal.remarks,
          invlId: goal.invlId
        });
      }
    } catch (error) {
      console.error('Error fetching goal details:', error);
      showToast('error', 'Failed to fetch goal details');
    }
  };

  const handleSave = async () => {
    // Validate main form fields
    const errors = {};
    if (!formData.level) errors.level = 'Level is required';
    // if (!formData.businessOperations) errors.businessOperations = 'Business Operation is required';
    // if (!formData.valueCreation) errors.valueCreation = 'Value Creation is required';
    // if (!formData.peopleEngagement) errors.peopleEngagement = 'People Engagement is required';
    // if (!formData.invlId) errors.invlId = 'IvIId is required';
    if (!formData.remarks) errors.remarks = 'Remarks is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      active: formData.active,
      businessOperations: parseInt(formData.businessOperations),
      createdBy: loginUserName,
      finYear: finYear,
      invlId: parseInt(formData.invlId),
      level: formData.level,
      orgId: parseInt(orgId),
      peopleEngagement: parseInt(formData.peopleEngagement),
      remarks: formData.remarks,
      valueCreation: parseInt(formData.valueCreation)
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateWeightage', payload);
      if (response.status) {
        showToast('success', editId ? 'Weightage updated successfully' : 'Weightage created successfully');
        handleClear();
        getAllWeightage();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving Weightage:', error);
      showToast('error', 'Failed to save Weightage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      level: '',
      businessOperations: 0,
      valueCreation: 0,
      peopleEngagement: 0,
      invlId: 0,
      remarks: ''
    });

    setFieldErrors({
      level: '',
      businessOperations: '',
      valueCreation: '',
      peopleEngagement: '',
      invlId: '',
      remarks: ''
    });
    setEditId('');
  };
  const handleView = () => setListView(!listView);
  return (
    <>
      <div>
        <ToastComponent />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
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
                    label="Level"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    error={!!fieldErrors.level}
                    helperText={fieldErrors.level}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Business Operations"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="businessOperations"
                    value={parseInt(formData.businessOperations) || 0}
                    onChange={handleInputChange}
                    error={!!fieldErrors.businessOperations}
                    helperText={fieldErrors.businessOperations}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Value Creation"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="valueCreation"
                    value={parseInt(formData.valueCreation) || 0}
                    onChange={handleInputChange}
                    error={!!fieldErrors.valueCreation}
                    helperText={fieldErrors.valueCreation}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="People Engagement"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="peopleEngagement"
                    value={parseInt(formData.peopleEngagement) || 0}
                    onChange={handleInputChange}
                    error={!!fieldErrors.peopleEngagement}
                    helperText={fieldErrors.peopleEngagement}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="IvlId"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="invlId"
                    value={parseInt(formData.invlId || 0)}
                    onChange={handleInputChange}
                    error={!!fieldErrors.invlId}
                    helperText={fieldErrors.invlId}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    label="Remarks"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    error={!!fieldErrors.remarks}
                    helperText={fieldErrors.remarks}
                  />
                </div>
              </div>
            </>
          ) : (
            <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={true} toEdit={getWeightageById} />
          )}
        </div>
      </div>
    </>
  );
};

export default Weightage;
