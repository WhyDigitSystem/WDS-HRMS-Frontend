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

const LeaveTypes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    leaveType: '',
    leaveCode: '',
    leaveApplicable: '',
    salaryDeduction: '',
    // totalLeave: '',
    // effective: '',
    carryForward: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    leaveType: '',
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
    { accessorKey: 'leaveCode', header: 'Code', size: 140 },
    { accessorKey: 'leaveType', header: 'Type', size: 140 },
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
          leaveType: particularCompany.leaveType,
          leaveCode: particularCompany.leaveCode,
          leaveApplicable: particularCompany.leaveApplicable,
          salaryDeduction: particularCompany.salaryDeduction,
          // totalLeave: particularCompany.totalLeave,
          // effective: particularCompany.effective,
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


  // const handleInputChange = (e) => {
  //   const { name, value, checked, selectionStart, selectionEnd, type } = e.target;

  //   let updatedValue = type === 'checkbox' ? checked : value;

  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     [name]: updatedValue
  //   }));

  //   setFieldErrors((prevErrors) => ({
  //     ...prevErrors,
  //     [name]: ''
  //   }));

  //   if (type === 'text' || type === 'email' || type === 'textarea') {
  //     setTimeout(() => {
  //       const inputElement = document.getElementsByName(name)[0];
  //       if (inputElement) {
  //         inputElement.setSelectionRange(selectionStart, selectionEnd);
  //       }
  //     }, 0);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;

    let updatedValue = type === 'checkbox' ? checked : value;

    // Leave Type → only characters and spaces
    if (name === 'leaveType') {
      updatedValue = value.replace(/[^A-Za-z\s]/g, '');
    }

    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue
    }));

    // Validation logic for leaveType
    if (name === 'leaveType') {
      if (!updatedValue) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Leave Type is required'
        }));
      } else if (updatedValue.length < 3) {
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
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      salaryDeduction: '',
      // totalLeave: '',
      // effective: '',
      carryForward: '',
      active: true
    });
    setFieldErrors({
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      salaryDeduction: '',
      // totalLeave: '',
      // effective: '',
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

    if (!formData.leaveType) {
      errors.leaveType = 'Employe Code is required';
    }
    if (!formData.leaveCode) {
      errors.leaveCode = 'Employe Code is required';
    }
    if (!formData.leaveApplicable) {
      errors.leaveApplicable = 'Leave Applicable is required';
    }
    // if (!formData.totalLeave) {
    //   errors.totalLeave = 'No of Leaves is required';
    // }
    // if (!formData.effective) {
    //   errors.effective = 'effective is required';
    // }
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
        // effective: formData.effective || null,
        finYear: '2025',
        leaveApplicable: formData.leaveApplicable,
        leaveCode: formData.leaveCode,
        leaveType: formData.leaveType,
        orgId: parseInt(orgId),
        salaryDeduction: formData.salaryDeduction,
        // totalLeave: parseInt(formData.totalLeave || 0),
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
              // editCallback={editEmployee}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getLeaveTypeById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              {/* Leave Type */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Type"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="leaveType"
                  value={formData.leaveType || ''}
                  onChange={handleInputChange}
                  error={!!fieldErrors.leaveType}
                  helperText={fieldErrors.leaveType}
                />
              </div>

              {/* Leave Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
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

              {/* Leave Applicable */}
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
                      label="Leave Applicable"
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
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.leaveApplicable}>
                  <InputLabel id="leaveApplicable">Leave Applicable</InputLabel>
                  <Select
                    labelId="leaveApplicable"
                    id="leaveApplicable"
                    name="leaveApplicable"
                    value={formData.leaveApplicable || ''}
                    onChange={handleInputChange}
                    label="Leave Applicable" // Add this line
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                  {fieldErrors.leaveApplicable && <FormHelperText>{fieldErrors.leaveApplicable}</FormHelperText>}
                </FormControl>
              </div> */}

              {/* Salary Deduction */}
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
                      label="Salary Deduction"
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

              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.salaryDeduction}>
                  <InputLabel id="salaryDeduction">Salary Deduction</InputLabel>
                  <Select
                    labelId="salaryDeduction"
                    id="salaryDeduction"
                    name="salaryDeduction"
                    value={formData.salaryDeduction || ''}
                    onChange={handleInputChange}
                    label="Salary Deduction" // Add this line
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.salaryDeduction && <FormHelperText>{fieldErrors.salaryDeduction}</FormHelperText>}
                </FormControl>
              </div> */}

              {/* {formData.salaryDeduction == 'No' && (
                <>
                  <div className="col-md-3 mb-3">
                    <TextField
                      label="Total Leave"
                      variant="outlined"
                      size="small"
                      fullWidth
                      name="totalLeave"
                      value={formData.totalLeave || ''}
                      onChange={handleInputChange}
                      error={!!fieldErrors.totalLeave}
                      helperText={fieldErrors.totalLeave}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <FormControl fullWidth size="small" error={!!fieldErrors.effective}>
                      <InputLabel id="effective">Effective</InputLabel>
                      <Select
                        labelId="effective"
                        id="effective"
                        name="effective"
                        value={formData.effective || ''}
                        onChange={handleInputChange}
                        label="Effective" // Add this line
                      >
                        <MenuItem value="Monthly">Monthly</MenuItem>
                        <MenuItem value="Quarterly">Quarterly</MenuItem>
                        <MenuItem value="Half Yearly">Half Yearly</MenuItem>
                        <MenuItem value="Yearly">Yearly</MenuItem>
                      </Select>
                      {fieldErrors.effective && <FormHelperText>{fieldErrors.effective}</FormHelperText>}
                    </FormControl>
                  </div>
                </>

                  )} */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.carryForward}>
                  <InputLabel id="carryForward">Carry Forward</InputLabel>
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

export default LeaveTypes;
