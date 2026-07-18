import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, ButtonBase, FormHelperText, Tooltip, TextField, Checkbox, FormControlLabel, Autocomplete } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from './CommonListViewTable';
import axios from 'axios';
import { useRef, useState, useMemo, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

export const City = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [finyearList, setFinyearList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [kpiKraList, setKpiKraList] = useState([]);

  const [formData, setFormData] = useState({
    finYear: null,
    type: '',
    appraisalId: '',
    effectiveFrom: null,
    effectiveTo: null,
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    finYear: '',
    type: '',
    appraisalId: '',
    effectiveFrom: '',
    effectiveTo: ''
  });
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllKRAKPIs();
  }, []);

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

  const handleDateChange = (name, date) => {
    if (date && dayjs(date).isValid()) {
      const dateString = dayjs(date).format('YYYY-MM-DD'); // Ensure correct format
      setFormData((prev) => ({ ...prev, [name]: dateString }));
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }));
      setFieldErrors((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleClear = () => {
    setFormData({
      finYear: '',
      type: '',
      appraisalId: '',
      effectiveFrom: '',
      effectiveTo: '',
      active: true
    });
    setFieldErrors({
      finYear: '',
      type: '',
      appraisalId: '',
      effectiveFrom: '',
      effectiveTo: ''
    });
    setEditId('');
  };

  useEffect(() => {
    getAllAppraisalPeriod();
  }, []);

  const getAllAppraisalPeriod = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAppraisalPeriodByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.appraisalVO);
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };
  const getAppraisalPeriodById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getAppraisalPeriodById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const appraisalPeriod = response.paramObjectsMap.appraisalVO;
        setFormData({
          finYear: appraisalPeriod.finYear,
          type: appraisalPeriod.type,
          appraisalId: appraisalPeriod.appraisalId,
          effectiveFrom: appraisalPeriod.effectiveForm,
          effectiveTo: appraisalPeriod.effectiveTo,
          active: appraisalPeriod.active === 'Active' ? true : false
        });
      }
    } catch (error) {
      console.error('Error fetching Appraisal Period details:', error);
      showToast('error', 'Failed to fetch Appraisal Period details');
    }
  };

  const handleSave = async () => {
    // Validate main form fields
    const errors = {};
    if (!formData.finYear) errors.finYear = 'Financial Year is required';
    if (!formData.type) errors.type = 'Type is required';
    // if (!formData.appraisalId) errors.appraisalId = 'Appraisal Id is required';
    if (!formData.effectiveFrom) errors.effectiveFrom = 'Effective From is required';
    if (!formData.effectiveTo) errors.effectiveTo = 'Effective To is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      active: formData.active,
      appraisalId: formData.appraisalId,
      createdBy: loginUserName,
      effectiveForm: formData.effectiveFrom,
      effectiveTo: formData.effectiveTo,
      finYear: parseInt(formData.finYear),
      orgId: parseInt(orgId),
      type: formData.type
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateAppraisalPeriod', payload);
      if (response.status) {
        showToast('success', editId ? 'Appraisal Period updated successfully' : 'Appraisal Period created successfully');
        handleClear();
        getAllAppraisalPeriod();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving Appraisal Period:', error);
      showToast('error', 'Failed to save Appraisal Period');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const listViewColumns = [
    { accessorKey: 'finYear', header: 'Fin Year', size: 140 },
    { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'appraisalId', header: 'Appraise Id', size: 140 },
    { accessorKey: 'effectiveForm', header: 'Effective From', size: 140 },
    { accessorKey: 'effectiveTo', header: 'Effective To', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getAppraisalPeriodById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              {/* <div className="col-md-3 mb-3">
                                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.finYear}>
                                    <InputLabel id="FinanicialYear-label">Finanicial Year</InputLabel>
                                    <Select labelId="finYear-label" label="finYear" value={formData.finYear} onChange={handleInputChange} name="finYear">
                                        {Array.isArray(finyearList) &&
                                            finyearList?.map((row) => (
                                                <MenuItem key={row.id} value={row.finyear}>
                                                    {row.finyear}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                    {fieldErrors.finYear && <FormHelperText>{fieldErrors.finYear}</FormHelperText>}
                                </FormControl>
                            </div>

                            <div className="col-md-3 mb-3">
                                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.country}>
                                    <InputLabel id="type-label">Type</InputLabel>
                                    <Select labelId="type-label" label="type" value={formData.type} onChange={handleInputChange} name="type">
                                        {Array.isArray(typeList) &&
                                            typeList?.map((row) => (
                                                <MenuItem key={row.id} value={row.type}>
                                                    {row.type}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                    {fieldErrors.type && <FormHelperText>{fieldErrors.type}</FormHelperText>}
                                </FormControl>
                            </div> */}

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={kpiKraList}
                  getOptionLabel={(option) => option.appraisalId || ''}

                  value={kpiKraList.find(
                    (item) => item.appraisalId === formData.appraisalId
                  ) || null}

                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      appraisalId: newValue ? newValue.appraisalId : ''
                    }));

                    setFieldErrors((prev) => ({
                      ...prev,
                      appraisalId: ''
                    }));
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

                  isOptionEqualToValue={(option, value) =>
                    option.appraisalId === value?.appraisalId
                  }

                  noOptionsText="No Appraisal IDs found"
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Financial Year"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="finYear"
                  value={formData.finYear}
                  onChange={handleInputChange}
                  error={!!fieldErrors.finYear}
                  helperText={fieldErrors.finYear}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Type"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  error={!!fieldErrors.type}
                  helperText={fieldErrors.type}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Effective From"
                      value={formData.effectiveFrom ? dayjs(formData.effectiveFrom) : null}
                      onChange={(date) => handleDateChange('effectiveFrom', date)}
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.effectiveFrom,
                          helperText: fieldErrors.effectiveFrom
                        }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Effective To"
                      value={formData.effectiveTo ? dayjs(formData.effectiveTo) : null}
                      onChange={(date) => handleDateChange('effectiveTo', date)}
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.effectiveTo,
                          helperText: fieldErrors.effectiveTo
                        }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default City;
