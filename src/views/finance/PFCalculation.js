import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { encryptPassword } from 'views/utilities/encryptPassword';
import { Checkbox, FormHelperText, FormControlLabel, MenuItem, Autocomplete } from '@mui/material';

const PFCalculation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    IPNumber: '',
    leaveCode: '',
    leaveApplicable: '',
    salaryDeduction: '',
    // totalLeave: '',
    // effective: '',
    carryForward: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    IPNumber: '',
    leaveCode: '',
    leaveApplicable: '',
    salaryDeduction: '',
    // totalLeave: '',
    // effective: '',
    carryForward: '',
    active: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'IPNumber', header: 'Type', size: 140 },
    { accessorKey: 'leaveApplicable', header: 'Leave Applicable', size: 140 },
    { accessorKey: 'salaryDeduction', header: 'Salary Deduction', size: 140 },
    // { accessorKey: 'totalLeave', header: 'Total Leaves', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getLeaveType();
  }, []);

  const getLeaveTypeById = async (row) => {
    console.log('THE SELECTED COMPANY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `leaveprocess/getLeaveTypeById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCompany = response.paramObjectsMap.leaveTypeVO;
        console.log('THE PARTICULAR COMPANY DETAILS ARE:', particularCompany);

        setFormData({
          IPNumber: particularCompany.IPNumber,
          leaveCode: particularCompany.leaveCode,
          leaveApplicable: particularCompany.leaveApplicable,
          salaryDeduction: particularCompany.salaryDeduction,
          carryForward: particularCompany.carryForward === true ? "Yes" : "No",
          active: particularCompany.active === 'Active' ? true : false
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const salaryDeductionList = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ];

  const leaveApplicableList = [
    { label: "All", value: "All" },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    let updatedValue = type === 'checkbox' ? checked : value;

    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue
    }));

    if (name === 'leaveType') {
      if (updatedValue.length < 3) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Minimum 3 characters required'
        }));
      } else {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [name]: ''
        }));
      }
    } else {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }

    // Maintain cursor position
    if (type === 'text' || type === 'email' || type === 'textarea') {
      setTimeout(() => {
        const inputElement = document.getElementsByName(name)[0];
        if (inputElement) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleClear = () => {
    setFormData({
      IPNumber: '',
      leaveCode: '',
      leaveApplicable: '',
      salaryDeduction: '',
      carryForward: '',
      active: true
    });
    setFieldErrors({
      IPNumber: '',
      leaveCode: '',
      leaveApplicable: '',
      salaryDeduction: '',
      carryForward: ''
    });
    setEditId('');
  };

  const getLeaveType = async () => {
    try {
      const response = await apiCalls('get', `leaveprocess/getLeaveTypeByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.leaveTypeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.IPNumber) {
      errors.IPNumber = 'Employe Code is required';
    }
    if (!formData.leaveCode) {
      errors.leaveCode = 'Employe Code is required';
    }
    if (!formData.leaveApplicable) {
      errors.leaveApplicable = 'Leave Applicable is required';
    }
    if (!formData.carryForward) {
      errors.carryForward = 'Carry Forward is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branch: branch,
        branchCode: branchCode,
        carryForward: formData.carryForward === "Yes" ? true : false,
        createdBy: loginUserName,
        finYear: '2025',
        leaveApplicable: formData.leaveApplicable,
        leaveCode: formData.leaveCode,
        IPNumber: formData.IPNumber,
        orgId: parseInt(orgId),
        salaryDeduction: formData.salaryDeduction,
        updatedBy: loginUserName
      };
      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const response = await apiCalls('put', '/leaveprocess/createUpdateLeaveType', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Leave Type Updated Successfully' : 'Leave Type created successfully');

          handleClear();
          getLeaveType();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Leave Type creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Leave Type creation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getLeaveTypeById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              {/* UAN */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="UAN"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="IPNumber"
                  value={formData.IPNumber || ''}
                  onChange={handleInputChange}
                  error={!!fieldErrors.IPNumber}
                  helperText={fieldErrors.IPNumber}
                />
              </div>

              {/* Member Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Member Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="leaveCode"
                  value={formData.leaveCode || ''}
                  onChange={handleInputChange}
                  error={!!fieldErrors.leaveCode}
                  helperText={fieldErrors.leaveCode}
                />
              </div>

              {/* EMP ID */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={leaveApplicableList}
                  getOptionLabel={(option) => option.label}
                  sx={{ width: "100%" }}
                  size="small"
                  value={leaveApplicableList.find((c) => c.value === formData.leaveApplicable) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({ target: { name: "leaveApplicable", value: newValue ? newValue.value : "" } })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="EMP ID"
                      name="leaveApplicable"
                      error={Boolean(fieldErrors.leaveApplicable)}
                      helperText={fieldErrors.leaveApplicable || ""}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 },
                      }}
                    />
                  )}
                />
              </div>

              {/* Gross Wages */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={salaryDeductionList}
                  getOptionLabel={(option) => option.label}
                  sx={{ width: "100%" }}
                  size="small"
                  value={salaryDeductionList.find((c) => c.value === formData.salaryDeduction) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({ target: { name: "salaryDeduction", value: newValue ? newValue.value : "" } })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Gross Wages"
                      name="salaryDeduction"
                      error={Boolean(fieldErrors.salaryDeduction)}
                      helperText={fieldErrors.salaryDeduction || ""}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 },
                      }}
                    />
                  )}
                />
              </div>

              {/* EPF Wages */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">EPF Wages</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
                </FormControl>
              </div>

              {/* EPS Wages */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">EPS Wages</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
                </FormControl>
              </div>

              {/* EDLI Wages */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">EDLI Wages</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
                </FormControl>
              </div>

              {/* EPF CONTRI REMITTEE */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">EPF Contri Remittee</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
                </FormControl>
              </div>

              {/* EPS CONTRI REMITTEE */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">EPS Contri Remittee</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
                </FormControl>
              </div>

              {/* EPS DIFF REMITTEE */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">EPS Diff Remittee</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
                </FormControl>
              </div>

              {/* NCP Days */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">NCP Days</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
                </FormControl>
              </div>

              {/* ID OF Advantages */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">NCP Days</InputLabel>
                  <Select
                    labelId="carryForward"
                    id="carryForward"
                    name="carryForward"
                    value={formData.carryForward || ''}
                    onChange={handleInputChange}
                    label="Carry Forward" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.carryForward && <FormHelperText>{fieldErrors.carryForward}</FormHelperText>}
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

export default PFCalculation;
