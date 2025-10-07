import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, ButtonBase, FormHelperText, Tooltip, TextField, Checkbox, FormControlLabel } from '@mui/material';
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
import { getAllActiveCountries, getAllActiveStatesByCountry } from 'utils/CommonFunctions';

export const RegionMaster = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    regionCode: '',
    regionName: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    regionCode: '',
    regionName: ''
  });
  const inputRef = useRef(null);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllRegions();
  }, []);
  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd } = e.target;
    const codeRegex = /^[a-zA-Z0-9 ]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'regionCode' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Only AlphaNumerics are Allowed' });
    } else if (name === 'regionCode' && value.length > 5) {
      setFieldErrors({ ...fieldErrors, [name]: 'Max Length is 5' });
    } else if (name === 'regionName' && !nameRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Only Alphabets Allowed' });
    } else if (name === 'regionName' && value.length > 50) {
      setFieldErrors({ ...fieldErrors, [name]: 'Exceeded Max Length' });
    } else {
      setFieldErrors({ ...fieldErrors, [name]: '' });
      const upperCaseValue = value.toUpperCase();
      setFormData({ ...formData, [name]: name === 'active' ? checked : upperCaseValue });
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleClear = () => {
    setFormData({
      regionCode: '',
      regionName: '',
      active: true
    });
    setFieldErrors({
      regionCode: '',
      regionName: ''
    });
    setEditId('');
    // console.log('THE EDIT ID AFTER HANDLE CLEAR:');
  };

  const getAllRegions = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getAllRegionsByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.regionVO.reverse());
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getRegionById = async (row) => {
    console.log('THE SELECTED region ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/region/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularregion = response.paramObjectsMap.regionVO;

        setFormData({
          regionCode: particularregion.regionCode,
          regionName: particularregion.regionName,
          active: particularregion.active === 'Active' ? true : false
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.regionCode) {
      errors.regionCode = 'Region Code is required';
    } else if (formData.regionCode.length <= 1) {
      errors.regionCode = 'Min Length is 2';
    }
    if (!formData.regionName) {
      errors.regionName = 'Region Name is required';
    } else if (formData.regionName.length <= 2) {
      errors.regionName = 'Min Length is 3';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        regionCode: formData.regionCode,
        regionName: formData.regionName,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE', saveData);

      try {
        const response = await apiCalls('put', `commonmaster/createUpdateRegion`, saveData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Region Updated Successfully' : 'Region created successfully');
          handleClear();
          getAllRegions();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Region creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Region creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const listViewColumns = [
    { accessorKey: 'regionCode', header: 'Code', size: 140 },
    { accessorKey: 'regionName', header: 'Region', size: 140 },
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getRegionById} enableEditing={true} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="regionCode"
                  value={formData.regionCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.regionCode}
                  helperText={fieldErrors.regionCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="regionName"
                  value={formData.regionName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.regionName}
                  helperText={fieldErrors.regionName}
                  inputRef={inputRef}
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
      <ToastContainer />
    </>
  );
};

export default RegionMaster;
