// Import statements remain unchanged
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, TextField, Modal, Paper, Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

export const AdditionalGoals = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [designation] = useState(localStorage.getItem('designation'));
  const [finYear] = useState(new Date().getFullYear());
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    areaOfImportance: '',
    keyPerformanceIndicators: '',
    performanceIndicators: '',
    goal: '',
  });
  const [editId, setEditId] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [dropdownData, setDropdownData] = useState([]);

  const listViewColumns = [
    { accessorKey: 'areaOfImportance', header: 'Area of Importance', size: 160 },
    { accessorKey: 'keyPerformanceIndicator', header: 'KPI', size: 160 },
    { accessorKey: 'performanceIndicator', header: 'Performance Indicator', size: 160 },
    { accessorKey: 'goal', header: 'Goal', size: 160 },
  ];

  useEffect(() => {
    fetchGoalsList();
    fetchDropdownData();
  }, []);

  const fetchGoalsList = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAdditionalGoalsByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        setListViewData(response.paramObjectsMap.additionalGoalsVO || []);
      } else {
        showToast('error', response.paramObjectsMap?.message || 'Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Failed to fetch goals');
    }
  };

  const fetchDropdownData = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAdditionalGoalsDropDownApis?branchCode=${branchCode}&designation=${designation}&finYear=${finYear}&orgId=${orgId}`);
      if (response.status === true) {
        setDropdownData(response.paramObjectsMap.employeeVO || []);
      } else {
        showToast('error', 'Failed to fetch dropdown data');
      }
    } catch (error) {
      console.error('Dropdown fetch error:', error);
      showToast('error', 'Failed to fetch dropdowns');
    }
  };

  const getGoalById = async (id) => {
    try {
      const response = await apiCalls('get', `/goalsController/getAdditionalGoalsById?id=${id}`);
      if (response.status === true) {
        const data = response.paramObjectsMap.additionalGoalsVO;
        if (data) {
          setFormData({
            areaOfImportance: data.areaOfImportance || '',
            keyPerformanceIndicators: data.keyPerformanceIndicator || '',
            performanceIndicators: data.performanceIndicator || '',
            goal: data.goal || '',
            active: true
          });
          setEditId(data.id);
          setListView(false);
        }
      }
    } catch (error) {
      showToast('error', 'Error fetching goal');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleClear = () => {
    setFormData({
      areaOfImportance: '',
      keyPerformanceIndicators: '',
      performanceIndicators: '',
      goal: '',
      active: true
    });
    setFieldErrors({});
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.areaOfImportance) errors.areaOfImportance = 'Required';
    if (!formData.keyPerformanceIndicators) errors.keyPerformanceIndicators = 'Required';
    if (!formData.performanceIndicators) errors.performanceIndicators = 'Required';
    if (!formData.goal) errors.goal = 'Required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      areaOfImportance: formData.areaOfImportance,
      keyPerformanceIndicator: formData.keyPerformanceIndicators,
      performanceIndicator: formData.performanceIndicators,
      goal: formData.goal,
      orgId: parseInt(orgId),
      createdBy: loginUserName,
      finYear: finYear,
    };


    try {
      const response = await apiCalls('put', '/goalsController/createUpdateAdditionalGoals', payload);
      if (response.status === true) {
        showToast('success', editId ? 'Updated successfully' : 'Created successfully');
        handleClear();
        fetchGoalsList();
      } else {
        showToast('error', response.paramObjectsMap?.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', 'Save failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={() => setListView(!listView)} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
        </div>

        {listView ? (
          <CommonListViewTable
            data={listViewData}
            columns={listViewColumns}
            blockEdit={false}
            enableEditing={true}
            toEdit={(row) => getGoalById(row.original.id)}
          />
        ) : (
          <div className="row">

            <div className="col-md-3 mb-3">
              <FormControl size="small" fullWidth error={!!fieldErrors.areaOfImportance}>
                <InputLabel>Area of Importance</InputLabel>
                <Select
                  name="areaOfImportance"
                  label="Area of Importance"
                  value={formData.areaOfImportance}
                  onChange={handleInputChange}
                >
                  {dropdownData.map((item, index) => (
                    <MenuItem key={index} value={item.areaOfImportance}>{item.areaOfImportance}</MenuItem>
                  ))}
                </Select>
                {fieldErrors.areaOfImportance && <FormHelperText>{fieldErrors.areaOfImportance}</FormHelperText>}
              </FormControl>
            </div>

            <div className="col-md-3 mb-3">
              <FormControl size="small" fullWidth error={!!fieldErrors.keyPerformanceIndicators}>
                <InputLabel>KPI</InputLabel>
                <Select
                  name="keyPerformanceIndicators"
                  label="KPI"
                  value={formData.keyPerformanceIndicators}
                  onChange={handleInputChange}
                >
                  {dropdownData.map((item, index) => (
                    <MenuItem key={index} value={item.keyPerformanceIndicators}>{item.keyPerformanceIndicators}</MenuItem>
                  ))}
                </Select>
                {fieldErrors.keyPerformanceIndicators && <FormHelperText>{fieldErrors.keyPerformanceIndicators}</FormHelperText>}
              </FormControl>
            </div>

            <div className="col-md-3 mb-3">
              <TextField label="Performance Indicators" size="small" fullWidth name="performanceIndicators" value={formData.performanceIndicators} onChange={handleInputChange} error={!!fieldErrors.performanceIndicators} helperText={fieldErrors.performanceIndicators} />
            </div>

            <div className="col-md-3 mb-3">
              <TextField label="Goal" size="small" fullWidth name="goal" value={formData.goal} onChange={handleInputChange} error={!!fieldErrors.goal} helperText={fieldErrors.goal} />
            </div>

          </div>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default AdditionalGoals;
