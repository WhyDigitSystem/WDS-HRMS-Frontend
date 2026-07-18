import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Chip, FormHelperText, Grid, InputLabel, MenuItem, Select, Typography, Autocomplete } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
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

const RolesNew = () => {
  const theme = useTheme();
  const [listView, setListView] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [data, setData] = useState([]);
  const [value, setValue] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [selectedRes, setSelectedRes] = useState([]);
  const [responsibilityList, setResponsibilityList] = useState([]);
  const [ScreenList, setScreenList] = useState([]);
  const [selectedResponsibilitiesDetails, setSelectedResponsibilitiesDetails] = useState({});

  const [formData, setFormData] = useState({
    role: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    role: false,
    selectedRes: ''
  });

  const chipSX = {
    height: 24,
    padding: '0 6px'
  };

  const chipSuccessSX = {
    ...chipSX,
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.secondary.light,
    height: 28
  };

  const columns = [
    { accessorKey: 'role', header: 'Role', size: 250 },
    {
      accessorKey: 'rolesReposibilitiesVO',
      header: 'Responsibilities',
      Cell: ({ cell }) => {
        const res = cell
          .getValue()
          .map((screen) => screen.responsibility)
          .join(', ');
        return res;
      }
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getAllRoles();
    getAllActiveResponsibilities();
  }, [listView]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClear = () => {
    setFormData({
      role: '',
      active: true
    });
    setEditId('');
    setSelectedResponsibilitiesDetails({});
    setSelectedRes([]);
    setScreenList([]);

    setFieldErrors({
      role: false
    });
  };
  function getStyles(name, selectedRes, theme) {
    return {
      fontWeight: selectedRes.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
    };
  }
  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'role' && !nameRegex.test(value)) {
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

  const handleMultiSelectChange = (event) => {
    const { value } = event.target; // value is an array of responsibility strings

    setSelectedRes(value);

    const selectedResScreen = responsibilityList
      .filter((res) => value.includes(res.responsibility))
      .map((res) => res.screensVO.map((screen) => screen.screenName))
      .flat(); // Flatten the array of arrays

    setScreenList(selectedResScreen);

    const selectedResDetails = responsibilityList
      .filter((res) => value.includes(res.responsibility))
      .map((res) => ({ responsibility: res.responsibility, responsibilityId: res.id }));

    setSelectedResponsibilitiesDetails(selectedResDetails);
  };

  const handleView = () => {
    setListView(!listView);
  };

  const getAllActiveResponsibilities = async () => {
    try {
      const response = await apiCalls('get', `auth/allActiveResponsibilityByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response) {
        console.log('THE RESPONSIBILITY LIST IS:', response.paramObjectsMap.resposResponsibilityVO);

        setResponsibilityList(response.paramObjectsMap.resposResponsibilityVO);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllRoles = async () => {
    try {
      const response = await apiCalls('get', `auth/allRolesByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response) {
        console.log('THE GETALL ROLES:', response);

        setData(response.paramObjectsMap.rolesVO.reverse());
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getRoleById = async (row) => {
    console.log('THE SELECTED ROW ID IS:', row.original.id);
    try {
      const result = await apiCalls('get', `/auth/rolesById?id=${row.original.id}`);

      console.log('API Response:', result);

      if (result) {
        setEditId(row.original.id);
        const particularRole = result.paramObjectsMap.rolesVO;
        console.log('THE PARTICULAR ROLE IS:', particularRole);

        setFormData({
          role: particularRole.role,
          active: particularRole.active === 'Active' ? true : false
        });
        setSelectedRes(particularRole.rolesReposibilitiesVO.map((k) => k.responsibility));
        setSelectedResponsibilitiesDetails(
          particularRole.rolesReposibilitiesVO.map((res) => ({
            responsibility: res.responsibility,
            responsibilityId: res.responsibilityId
          }))
        );

        setListView(false);
      } else {
        console.error('API Error:', result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    if (selectedRes.length <= 0) {
      errors.selectedRes = 'Responsibilities is required';
    }
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        role: formData.role,
        rolesResponsibilityDTO: selectedResponsibilitiesDetails,
        orgId: orgId,
        createdby: loginUserName
      };
      console.log('THE SAVE FORM DATA IS:', saveFormData);

      try {
        const result = await apiCalls('put', `auth/createUpdateRoles`, saveFormData);
        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Role Updated Successfully' : 'Role created successfully');
          handleClear();
          getAllRoles();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Role creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Role creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  return (
    <>
      <ToastComponent />

      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
        </div>
        {listView ? (
          <CommonListViewTable
            data={data}
            columns={columns}
            toEdit={getRoleById}
            blockEdit={true} // DISAPLE THE MODAL IF TRUE
            enableEditing={true}
          />
        ) : (
          <div className="row d-flex">
            <div className="col-md-3 mb-3">
              {/* <FormControl fullWidth variant="filled">
                        <TextField
                          id="account"
                          label="Role"
                          size="small"
                          required
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          inputProps={{ maxLength: 30 }}
                          error={!!fieldErrors.role}
                          helperText={<span style={{ color: 'red' }}>{fieldErrors.role ? 'This field is required' : ''}</span>}
                        />
                      </FormControl> */}
              <TextField
                label="Role"
                variant="outlined"
                size="small"
                fullWidth
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                error={!!fieldErrors.role}
                helperText={fieldErrors.role}
              />
            </div>
            {/* <div className="col-md-3 mb-3">
                      <FormControl sx={{ width: 215 }} size="small">
                        <InputLabel id="demo-multiple-chip-label">Responsibilites</InputLabel>
                        <Select
                          labelId="demo-multiple-chip-label"
                          id="demo-multiple-chip"
                          multiple
                          value={selectedRes}
                          onChange={handleMultiSelectChange}
                          input={<OutlinedInput id="select-multiple-chip" label="Responsibilites" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} />
                              ))}
                            </Box>
                          )}
                          MenuProps={MenuProps}
                          error={!!fieldErrors.selectedRes}
                          helperText={fieldErrors.selectedRes}
                        >
                          {responsibilityList.map((name, index) => (
                            <MenuItem key={index} value={name.responsibility} style={getStyles(name, selectedRes, theme)}>
                              {name.responsibility}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div> */}
            {/* <div className="col-md-3 mb-3">
              <FormControl sx={{ width: 215 }} size="small" error={!!fieldErrors.selectedRes}>
                <InputLabel id="demo-multiple-chip-label">Responsibilities</InputLabel>
                <Select
                  labelId="demo-multiple-chip-label"
                  id="demo-multiple-chip"
                  multiple
                  value={selectedRes}
                  onChange={handleMultiSelectChange}
                  input={<OutlinedInput id="select-multiple-chip" label="Responsibilities" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {responsibilityList.map((name, index) => (
                    <MenuItem key={index} value={name.responsibility} style={getStyles(name, selectedRes, theme)}>
                      {name.responsibility}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.selectedRes && <FormHelperText>{fieldErrors.selectedRes}</FormHelperText>}
              </FormControl>
            </div> */}
            <div className="col-md-3 mb-3">
              <Autocomplete
                multiple
                options={responsibilityList}
                getOptionLabel={(option) => option.responsibility || ""}
                value={responsibilityList.filter((res) => selectedRes.includes(res.responsibility))}
                onChange={(event, newValue) => {
                  const selectedResponsibilities = newValue.map((item) => item.responsibility);
                  handleMultiSelectChange({ target: { value: selectedResponsibilities } });
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip key={option.responsibility} label={option.responsibility} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Responsibilities"
                    name="selectedRes"
                    error={Boolean(fieldErrors.selectedRes)}
                    helperText={fieldErrors.selectedRes || ""}
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

            <div>
              <Typography variant="subtitle1">Available Screens</Typography>

              <Grid item xs={12} sx={{ marginTop: '10px', gap: '5px' }}>
                <Grid container>
                  {ScreenList.map((name, index) => (
                    <Grid item key={index} sx={{ marginLeft: index > 0 ? '5px' : '0' }}>
                      <Chip label={name} sx={chipSuccessSX} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RolesNew;
