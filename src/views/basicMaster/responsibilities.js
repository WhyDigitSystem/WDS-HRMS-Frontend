import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Checkbox, FormControl, FormControlLabel, Autocomplete, FormGroup, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
import { getAllActiveScreens } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

function getStyles(name, selectedScreens, theme) {
  return {
    fontWeight: selectedScreens.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}

const Responsibilities = () => {
  const theme = useTheme();
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [screenList, setScreenList] = useState([]);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [selectedScreens, setSelectedScreens] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    orgId: orgId,
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: false
  });

  const columns = [
    { accessorKey: 'responsibility', header: 'Responsibility', size: 140 },
    {
      accessorKey: 'screensVO',
      header: 'Screens',
      Cell: ({ cell }) => {
        const screens = cell
          .getValue()
          .map((screen) => screen.screenName)
          .join(', ');
        return screens;
      }
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getAllResponsibilities();
    getAllScreens();
  }, [listView]);

  const handleClear = () => {
    setFormData({
      name: '',
      active: true
    });
    setSelectedScreens([]);
    setFieldErrors({
      name: false
    });
    setEditId('');
  };

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;

    // Convert the selected values into the required format
    const selectedScreens = typeof value === 'string' ? value.split(',') : value;
    const screenDTO = selectedScreens.map((screenName, index) => ({
      screenName
    }));

    setSelectedScreens(selectedScreens);

    // Update the formData with the new screenDTO
    setFormData((prevFormData) => ({
      ...prevFormData,
      screenDTO
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'name' && !nameRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'active' ? checked : value.toUpperCase()
      });
      setFieldErrors({ ...fieldErrors, [name]: '' });

      // Update the cursor position after the input change
      if (type === 'text' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleView = () => {
    setListView(!listView);
  };

  const getAllScreens = async () => {
    try {
      const screensData = await getAllActiveScreens(orgId);
      setScreenList(screensData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllResponsibilities = async () => {
    try {
      const response = await apiCalls('get', `auth/allResponsibilityByOrgId?orgId=${orgId}`);

      setListViewData(response.paramObjectsMap.responsibilityVO.reverse());
      console.log('Test', response);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getResponsibilityById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `auth/responsibilityById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response) {
        console.log('after success then data is:', response);

        const particularResponsibility = response.paramObjectsMap.responsibilityVO;
        const particularResScreens = particularResponsibility.screensVO.map((k) => k.screenName);
        setFormData({
          name: particularResponsibility.responsibility,
          active: particularResponsibility.active === 'Active' ? true : false
        });
        console.log('THE SCREEN VO DATA IS:', particularResScreens);
        setSelectedScreens(particularResScreens);

        setListView(false);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    if (selectedScreens.length <= 0) {
      errors.selectedScreens = 'Screens is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(false);

      const screenVo = selectedScreens.map((row) => ({
        screenName: row.toLowerCase()
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        responsibility: formData.name,
        orgId: orgId,
        createdby: loginUserName,
        screensDTO: screenVo
      };
      console.log('PERSON NAMES:', selectedScreens);

      console.log('THE SAVE FORM DATA IS:', saveFormData);

      try {
        const response = await apiCalls('put', `auth/createUpdateResponsibility`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Responsibility Updated Successfully' : 'Responsibility created successfully');
          handleClear();
          getAllResponsibilities();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Responsibility creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Responsibility creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  return (
    <div>
      <div>
        <ToastContainer />
      </div>
      <div>
        <div>
          <Box sx={{ width: '100%', typography: 'body1' }}>
            <div className="d-flex flex-wrap justify-content-start mb-4">
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
            </div>
            {!listView ? (
              <div className="row d-flex">
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
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <Autocomplete
                    multiple
                    options={screenList}
                    getOptionLabel={(option) => option.screenName || ""}
                    value={screenList.filter((screen) => selectedScreens.includes(screen.screenName))}
                    onChange={(event, newValue) => {
                      const selectedScreenNames = newValue.map((item) => item.screenName);
                      setSelectedScreens(selectedScreenNames);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        screenDTO: selectedScreenNames.map((screenName) => ({ screenName }))
                      }));
                    }}
                    renderTags={(selected, getTagProps) =>
                      selected.map((option, index) => (
                        <Chip key={option.screenName} label={option.screenName} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Screens"
                        name="screens"
                        error={Boolean(fieldErrors.selectedScreens)}
                        helperText={fieldErrors.selectedScreens || ""}
                      // InputProps={{
                      //   ...params.InputProps,
                      //   style: { height: 40 },
                      // }}
                      />
                    )}
                    sx={{
                      width: "100%",
                      "& .MuiAutocomplete-tag": {
                        maxWidth: "100%",
                      },
                      "& .MuiInputBase-root": {
                        flexWrap: "wrap",
                      },
                    }}
                    size="small"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.active}
                          onChange={handleInputChange}
                          name="active"
                          sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                        />
                      }
                      label="Active"
                    />
                  </FormGroup>
                </div>
              </div>
            ) : (
              <CommonListViewTable
                data={listViewData}
                columns={columns}
                toEdit={getResponsibilityById}
                blockEdit={true} // DISABLE THE MODAL IF TRUE
                enableEditing={true}
              />
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Responsibilities;