import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, ButtonBase, FormHelperText, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import axios from 'axios';
import { useRef, useState, useMemo, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveCitiesByState, getAllActiveCountries, getAllActiveStatesByCountry } from 'utils/CommonFunctions';
import apiCalls from 'apicall';

const Branch = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loginUserId, setLoginUserId] = useState(localStorage.getItem('userId'));
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [editId, setEditId] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    branchCode: '',
    branchName: '',
    contactPerson: '',
    email: '',
    mobile: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    gst: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    companyName: '',
    branchCode: '',
    branchName: '',
    contactPerson: '',
    email: '',
    mobile: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    gst: '',
    active: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    {
      accessorKey: 'branch',
      header: 'Branch',
      size: 140
    },
    {
      accessorKey: 'branchCode',
      header: 'Branch Code',
      size: 140
    },
    {
      accessorKey: 'city',
      header: 'City',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllCountries();
    getCompanyDetails();
    getAllBranches();
    if (formData.country) {
      getAllStates();
    }
    if (formData.state) {
      getAllCities();
    }
  }, [formData.country, formData.state]);

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        const particularCompany = response.paramObjectsMap.companyVO[0];

        setFormData({ ...formData, companyName: particularCompany.companyName });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllCountries = async () => {
    try {
      const countryData = await getAllActiveCountries(orgId);
      setCountryList(countryData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllStates = async () => {
    try {
      const stateData = await getAllActiveStatesByCountry(formData.country, orgId);
      setStateList(stateData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCities = async () => {
    try {
      const cityData = await getAllActiveCitiesByState(formData.state, orgId);
      setCityList(cityData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
  //   const nameRegex = /^[A-Za-z ]*$/;
  //   const branchNameRegex = /^[A-Za-z0-9@_\-* ]*$/;
  //   const branchCodeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
  //   const alphanumericRegex = /^[A-Za-z0-9]*$/;
  //   const numericRegex = /^[0-9]*$/;

  //   if (name === 'branchCode' && !branchCodeRegex.test(value)) {
  //     setFieldErrors({ ...fieldErrors, [name]: 'Only alphanumeric characters and @, _, -, /, are allowed' });
  //   } else if (name === 'branchName' && !branchNameRegex.test(value)) {
  //     setFieldErrors({ ...fieldErrors, [name]: 'Only alphanumeric characters and @, _, -, * are allowed' });
  //   } else if (name === 'gst') {
  //     if (!alphanumericRegex.test(value)) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Special Characters are not allowed' });
  //     } else if (value.length > 15) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only 15 Digits are allowed' });
  //     } else {
  //       setFieldErrors({ ...fieldErrors, [name]: '' });
  //     }
  //   } else if (name === 'pincode') {
  //     if (!numericRegex.test(value)) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only numeric characters are allowed' });
  //     } else if (value.length > 6) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only 6 Digits are allowed' });
  //     } else {
  //       setFieldErrors({ ...fieldErrors, [name]: '' });
  //     }
  //   } else if (name === 'mobile') {
  //     if (!numericRegex.test(value)) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only numeric characters are allowed' });
  //     } else if (value.length > 10) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only 10 Digits are allowed' });
  //     } else {
  //       setFieldErrors({ ...fieldErrors, [name]: '' });
  //     }
  //   } else {
  //     setFieldErrors({ ...fieldErrors, [name]: '' });
  //   }

  //   // Update the form data
  //   if (name === 'active') {
  //     setFormData({ ...formData, [name]: checked });
  //   } else if (name === 'email') {
  //     setFormData({ ...formData, [name]: value });
  //   } else {
  //     setFormData({ ...formData, [name]: value.toUpperCase() });
  //   }

  //   // Update the cursor position after the input change
  //   if (type === 'text' || type === 'textarea' || type === 'email') {
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

    const nameRegex = /^[A-Za-z ]*$/;
    const branchNameRegex = /^[A-Za-z0-9@_\-* ]*$/;
    const branchCodeRegex = /^[A-Za-z0-9#_\-\/\\]*$/;
    const alphanumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;

    let error = "";

    // Branch Code
    if (name === "branchCode") {
      if (!branchCodeRegex.test(value)) {
        error = "Only alphanumeric characters and @, _, -, / are allowed";
      }
    }

    // Branch Name
    if (name === "branchName") {
      if (!branchNameRegex.test(value)) {
        error = "Only alphanumeric characters and @, _, -, * are allowed";
      }
    }

    // Contact Person
    if (name === "contactPerson") {
      if (!nameRegex.test(value)) {
        error = "Only Alphabets Allowed";
      }
    }

    // GST
    if (name === "gst") {
      if (!alphanumericRegex.test(value)) {
        error = "Special Characters are not allowed";
      } else if (value.length > 15) {
        error = "Only 15 Characters are allowed";
      }
    }

    // Mobile
    if (name === "mobile") {
      if (!numericRegex.test(value)) {
        error = "Only numeric characters are allowed";
      } else if (value.length > 10) {
        error = "Only 10 Digits are allowed";
      }
    }

    // Pincode
    if (name === "pincode") {
      if (!numericRegex.test(value)) {
        error = "Only numeric characters are allowed";
      } else if (value.length > 6) {
        error = "Only 6 Digits are allowed";
      }
    }

    if (error) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
      return;
    }

    let newValue = value;

    // Only these fields should be uppercase
    if (name === "branchCode" || name === "gst") {
      newValue = value.toUpperCase();
    }

    // Limit numeric fields
    if (name === "mobile") {
      newValue = value.slice(0, 10);
    }

    if (name === "pincode") {
      newValue = value.slice(0, 6);
    }

    if (name === "active") {
      newValue = checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Maintain cursor position
    if (type === "text" || type === "textarea" || type === "email") {
      setTimeout(() => {
        const inputElement = document.getElementsByName(name)[0];
        if (inputElement && inputElement.setSelectionRange) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleClear = () => {
    setFormData({
      companyName: formData.companyName,
      branchCode: '',
      branchName: '',
      contactPerson: '',
      email: '',
      mobile: '',
      address: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      gst: '',
      active: true
    });
    setFieldErrors({
      // companyName: '',
      branchCode: '',
      branchName: '',
      contactPerson: '',
      email: '',
      mobile: '',
      address: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      gst: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.branchCode) {
      errors.branchCode = 'Code is required';
    }
    if (!formData.branchName) {
      errors.branchName = 'Name is required';
    }
    // if (!formData.contactPerson) {
    //   errors.contactPerson = 'Contact Person is required';
    // }
    // if (!formData.email) {
    //   errors.email = 'Email is required';
    // }
    if (formData.mobile.length > 0 && formData.mobile.length < 10) {
      errors.mobile = 'Invalid Mobile No';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    if (formData.pincode.length > 0 && formData.pincode.length < 6) {
      errors.pincode = 'Invalid Pincode';
    }
    if (!formData.gst) {
      errors.gst = 'GST is required';
    } else if (formData.gst.length < 15) {
      errors.gst = 'Invalid GST No';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        addressLine1: formData.address,
        branch: formData.branchName,
        branchCode: formData.branchCode,
        cancel: true,
        cancelRemarks: null,
        city: formData.city,
        company: formData.companyName,
        contactPerson: formData.contactPerson,
        country: formData.country,
        createdBy: loginUserName,
        email: formData.email,
        gstIn: formData.gst,
        orgId: orgId,
        phone: formData.mobile,
        pinCode: formData.pincode,
        state: formData.state,
        userid: loginUserId
      };
      try {
        const response = await apiCalls('put', `master/createUpdateBranch`, saveFormData);
        if (response.status === true) {
          showToast('success', editId ? ' Branch Updated Successfully' : 'Branch created successfully');
          handleClear();
          getAllBranches();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Branch creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Branch creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };
  const getAllBranches = async () => {
    try {
      const result = await apiCalls('get', `master/branch?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.branchVO);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };
  const getBranchById = async (row) => {
    console.log('THE SELECTED BRANCH ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `master/branch/${row.original.id}`);

      if (response.status === true) {
        const particularBranch = response.paramObjectsMap.Branch;
        setFormData({
          companyName: particularBranch.company,
          branchCode: particularBranch.branchCode,
          branchName: particularBranch.branch,
          contactPerson: particularBranch.contactPerson,
          email: particularBranch.email,
          mobile: particularBranch.phone,
          address: particularBranch.addressLine1,
          gst: particularBranch.gstIn,
          country: particularBranch.country,
          state: particularBranch.state,
          city: particularBranch.city,
          pincode: particularBranch.pinCode,
          active: particularBranch.active === 'Active' ? true : false
        });
        setListView(false);
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleView = () => {
    setListView(!listView);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getBranchById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  // label="Company Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="companyName"
                  value={formData.companyName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.branchCode}
                  helperText={fieldErrors.branchCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.branchName}
                  helperText={fieldErrors.branchName}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Contact Person"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                // error={!!fieldErrors.contactPerson}
                // helperText={fieldErrors.contactPerson}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Email ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                // error={!!fieldErrors.email}
                // helperText={fieldErrors.email}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Mobile"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  error={!!fieldErrors.mobile}
                  helperText={fieldErrors.mobile}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.country}>
                  <InputLabel id="country-label">Country</InputLabel>
                  <Select labelId="country-label" label="Country" value={formData.country} onChange={handleInputChange} name="country">
                    {Array.isArray(countryList) &&
                      countryList?.map((row) => (
                        <MenuItem key={row.id} value={row.countryName}>
                          {row.countryName}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select labelId="state-label" label="State" value={formData.state} onChange={handleInputChange} name="state">
                    {stateList?.map((row) => (
                      <MenuItem key={row.id} value={row.stateName}>
                        {row.stateName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.state && <FormHelperText>{fieldErrors.state}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="city-label">City</InputLabel>
                  <Select labelId="city-label" label="City" value={formData.city} onChange={handleInputChange} name="city">
                    {cityList?.map((row) => (
                      <MenuItem key={row.id} value={row.cityName}>
                        {row.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city && <FormHelperText>{fieldErrors.city}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Pincode"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="pincode"
                  value={formData.pincode}
                  maxLength={6}
                  onChange={handleInputChange}
                  error={!!fieldErrors.pincode}
                  helperText={fieldErrors.pincode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="GST"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="gst"
                  value={formData.gst}
                  onChange={handleInputChange}
                  error={!!fieldErrors.gst}
                  helperText={fieldErrors.gst}
                />
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
      <ToastComponent />
    </>
  );
};

export default Branch;
