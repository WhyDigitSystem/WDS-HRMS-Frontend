import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { TextField, FormControl } from '@mui/material';
import { InputLabel, Select, MenuItem, FormHelperText, Autocomplete } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';

export const LeaveAssigned = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    designation: '',
    designationCode: '',
    leaveType: '',
    totalLeave: '',
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    active: true,
    designation: '',
    designationCode: '',
    leaveType: '',
    totalLeave: '',
  });
  const [listView, setListView] = useState(false);

  const listViewColumns = [
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    {
      accessorKey: 'leaveType',
      header: 'Leave Type',
      size: 140
    },
    {
      accessorKey: 'totalLeave',
      header: 'Total Leave',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [allLeaveType, setAllLeaveType] = useState([]);

  useEffect(() => {
    getAllDesignationLeave();
    getAllDesignation();
    getAllLeaveType();
  }, []);

  const getAllDesignation = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDesignationByOrgId?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDesignationList(response.paramObjectsMap.designationVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllLeaveType = async () => {
    try {
      const response = await apiCalls('get', `leaveprocess/getLeaveTypeByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setAllLeaveType(response.paramObjectsMap.leaveTypeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllDesignationLeave = async () => {
    try {
      const result = await apiCalls('get', `/master/getDesignationLeaveByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.designationLeaveVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllDesignationById = async (row) => {
    console.log('THE SELECTED SCREEN ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/master/getDesignationLeaveById?id=${row.original.id}`);

      if (response.status === true) {
        const particularScreen = response.paramObjectsMap.designationLeaveVO;
        setFormData({
          designation: particularScreen.designation,
          designationCode: particularScreen.designationCode,   // ✅ ADD THIS
          leaveType: particularScreen.leaveType,
          leaveCode: particularScreen.leaveCode,               // ✅ ADD THIS
          totalLeave: particularScreen.totalLeave,
          active: particularScreen.active === 'Active' ? true : false
        });
        setListView(false);
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    let updatedValue = type === 'checkbox' ? checked : value;

    let additionalData = {};

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
      ...additionalData,
    }));

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleClear = () => {
    setFormData({
      active: true,
      designation: '',
      leaveType: '',
      totalLeave: '',
    });
    setFieldErrors({
      active: true,
      designation: '',
      leaveType: '',
      totalLeave: '',
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.designation) {
      errors.designation = 'Designation is required';
    }
    if (!formData.leaveType) {
      errors.leaveType = 'Leave Type is required';
    }
    // if (!formData.totalLeave) {
    //   errors.totalLeave = 'Total Leave is required';
    // }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        designation: formData.designation,
        designationCode: formData.designationCode,  // Include designationCode
        leaveType: formData.leaveType,
        leaveCode: formData.leaveCode,  // Include leaveCode
        totalLeave: parseInt(formData.totalLeave),
        createdBy: loginUserName,
        orgId: parseInt(orgId)
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('put', `/master/createUpdateDesignationLeave`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Leave Assign Updated Successfully' : 'Leave Assign Created successfully');
          handleClear();
          getAllDesignationLeave();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Leave Assign Created failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Leave Assign Creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleClose = () => {
    setFormData({
      country: '',
      screenCode: ''
    });
  };

  // const handleCheckboxChange = (event) => {
  //   setFormData({
  //     ...formData,
  //     active: event.target.checked
  //   });
  // };
  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              isLoading={isLoading}
              onClick={() => handleSave()}
              margin="0 10px 0 10px"
            /> &nbsp;{' '}
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getAllDesignationById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              {/* Designation */}
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.designation}>
                  <InputLabel id="designation-label">Designation</InputLabel>
                  <Select
                    labelId="designation-label"
                    id="designation"
                    label="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    name="designation"
                  >
                    {designationList?.map((row) => (
                      <MenuItem key={row.id} value={row.designationName}>
                        {row.designationName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.designation && <FormHelperText>{fieldErrors.designation}</FormHelperText>}
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={designationList}
                  getOptionLabel={(option) => option.designationName || ""}
                  sx={{ width: "100%" }}
                  size="small"
                  value={designationList.find((c) => c.designationName === formData.designation) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      designation: newValue ? newValue.designationName : "",
                      designationCode: newValue ? newValue.designationCode : ""
                    }));

                    setFieldErrors((prev) => ({
                      ...prev,
                      designation: ""
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Designation"
                      name="designation"
                      error={Boolean(fieldErrors.designation)}
                      helperText={fieldErrors.designation || ""}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 },
                      }}
                    />
                  )}
                />
              </div>


              {/* Leave Type */}
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.leaveType}>
                  <InputLabel id="leaveType-label">Leave Type</InputLabel>
                  <Select
                    labelId="leaveType-label"
                    id="leaveType"
                    label="Leave Type"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    name="leaveType"
                  >
                    {allLeaveType?.map((row) => (
                      <MenuItem key={row.id} value={row.leaveType}>
                        {row.leaveType}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.leaveType && <FormHelperText>{fieldErrors.leaveType}</FormHelperText>}
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={allLeaveType}
                  getOptionLabel={(option) => option.leaveType || ""}
                  sx={{ width: "100%" }}
                  size="small"
                  value={allLeaveType.find((c) => c.leaveType === formData.leaveType) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      leaveType: newValue ? newValue.leaveType : "",
                      leaveCode: newValue ? newValue.leaveCode : ""
                    }));

                    setFieldErrors((prev) => ({
                      ...prev,
                      leaveType: ""
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Leave Type"
                      name="leaveType"
                      error={Boolean(fieldErrors.leaveType)}
                      helperText={fieldErrors.leaveType || ""}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 },
                      }}
                    />
                  )}
                />
              </div>


              {/* Total Leave */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Leave"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="totalLeave"
                  value={formData.totalLeave}
                  onChange={handleInputChange}
                  error={!!fieldErrors.totalLeave}
                  helperText={fieldErrors.totalLeave}
                />
              </div>

              {/* Active */}
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} />}
                  label="Active"
                  name='active'
                  labelPlacement="end"
                />
              </div>

            </div>
          </>
        )}
      </div>
      <div>
        <ToastComponent />
      </div>
    </>
  );
};
export default LeaveAssigned;
