import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import { Autocomplete, TextField } from '@mui/material';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveBranches, getAllActiveRoles } from 'utils/CommonFunctions';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { encryptPassword } from 'views/utilities/passwordEnc';
import { Paper, TableContainer, TableHead, TableCell, Table, TableRow, TableBody } from '@mui/material';

const UserCreation = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [listViewData, setListViewData] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [branchData, setBranchData] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [dataToEdit, setDataToEdit] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [designation, setDesignation] = useState(localStorage.getItem('designation'));
  const [roleDataSelect, setRoleDataSelect] = useState([]);
  const [value, setValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [empList, setEmpList] = useState([]);
  const [companyNameForOrg, setCompanyNameForOrg] = useState([]);

  const [formData, setFormData] = useState({
    docId: '',
    employeeCode: '',
    employeeName: '',
    userId: '',
    userName: '',
    password: '',
    email: '',
    active: true,
    allIndiaAccess: false,
    deactivatedOn: '',
    // userType: '',
    reportingTO: '',
    branch: '',
    branchCode: '',
    department: '',
    designation: '',
    orgId: orgId
  });

  const [fieldErrors, setFieldErrors] = useState({
    employeeCode: '',
    employeeName: '',
    userId: '',
    userName: '',
    password: '',
    email: '',
    active: false,
    allIndiaAccess: false,
    deactivatedOn: '',
    // userType: '',
    reportingTO: '',
    orgId: orgId
  });

  const listViewColumns = [
    { accessorKey: 'employeeCode', header: 'Code', size: 140 },
    { accessorKey: 'employeeName', header: 'Employee', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    { accessorKey: 'email', header: 'Email', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [branchTableData, setBranchTableData] = useState([
    {
      id: 1,
      branchCode: '',
      branch: ''
    }
  ]);
  const [branchTableErrors, setBranchTableErrors] = useState([
    {
      branchCode: '',
      branch: ''
    }
  ]);
  const [roleTableData, setRoleTableData] = useState([{ id: 1, role: '', roleId: '', startDate: null, endDate: null }]);
  const [roleTableDataErrors, setRoleTableDataErrors] = useState([
    {
      role: '',
      roleId: '',
      startDate: '',
      endDate: ''
    }
  ]);

  useEffect(() => {
    getAllUsers();
    getAllBranches();
    getAllRoles();
    getAllUserCreation();
    getCompanyName();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Regex validation rules
    const nameRegex = /^[A-Za-z ]*$/;
    const numericRegex = /^[0-9]*$/;

    let errorMessage = '';

    // Validation based on input name
    switch (name) {
      case 'employeeName':
        if (!nameRegex.test(value)) {
          errorMessage = 'Only alphabetic characters are allowed';
        }
        break;
      case 'mobile':
        if (!numericRegex.test(value)) {
          errorMessage = 'Only numeric characters are allowed';
        } else if (value.length > 10) {
          errorMessage = 'Invalid Format';
        }
        break;

      default:
        break;
    }

    // Set error message if any
    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      // Special cases for checkboxes and other inputs
      if (name === 'active' || name === 'allIndiaAccess') {
        setFormData({ ...formData, [name]: checked });
      } else if (name === 'email') {
        setFormData({ ...formData, [name]: value.toLowerCase() });
      } else if (name === 'employeeCode') {
        // Find the selected employee from empList based on employeeCode
        const selectedEmp = empList.find((emp) => emp.employeeCode === value);
        if (selectedEmp) {
          setFormData((prevData) => ({
            ...prevData,
            employeeCode: selectedEmp.employeeCode,
            employeeName: selectedEmp.employee,
            email: selectedEmp.email
          }));
        }
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      // Clear error message for valid input
      setFieldErrors({ ...fieldErrors, [name]: '' });

      // Preserve the cursor position for text-based inputs
      if (type === 'text' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement && inputElement.setSelectionRange) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  // Handling Select's onChange
  const handleSelectChange = (e) => {
    const value = e.target.value; // Get the selected value (employeeCode)
    console.log('Selected employeeCode value:', value);
    console.log('Full empList:', empList); // Log the entire list to verify the structure

    // Log each item in the empList to confirm the field names
    empList.forEach((emp, index) => {
      console.log(`Employee ${index}:`, emp);
    });

    // Find the selected employee from empList based on employeeCode
    const selectedEmp = empList.find((emp) => emp.employee === value); // Check if 'empCode' is correct

    if (selectedEmp) {
      console.log('Selected Employee:', selectedEmp);
      setFormData((prevData) => ({
        ...prevData,
        userName: selectedEmp.employeeCode,
        employeeCode: selectedEmp.employeeCode,
        employeeName: selectedEmp.employee,
        email: selectedEmp.email,
        branch: selectedEmp.branch,
        branchCode: selectedEmp.branchCode,
        department: selectedEmp.department,
        designation: selectedEmp.designation
      }));
    } else {
      console.log('No employee found with the given code:', value); // Log if no employee is found
    }
  };

  const getAllRoles = async () => {
    try {
      const branchData = await getAllActiveRoles(orgId);
      setRoleList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setEmpList(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCompanyName = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setCompanyNameForOrg(response.paramObjectsMap.companyVO[0].companyName);
        console.log('company name', response.paramObjectsMap.companyVO[0].companyName);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllUserCreation = async () => {
    try {
      const response = await apiCalls('get', `/auth/allUsersByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.userVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getUserById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `auth/getUserById?userId=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularUser = response.paramObjectsMap.userVO;
        const foundBranch1 = branchList.find((branch) => branch.branchCode === particularUser.branchAccessibleVO.branchcode);
        console.log('THE FOUND BRANCH 1 IS:', foundBranch1);

        setFormData({
          docId: particularUser.id,
          userName: particularUser.userName,
          // userType: particularUser.userType,
          employeeCode: particularUser.employeeCode || '',
          employeeName: particularUser.employeeName,
          branch: particularUser.branch,
          branchCode: particularUser.branchcode,
          department: particularUser.department,
          designation: particularUser.designation,
          email: particularUser.email,
          allIndiaAccess: particularUser.allIndiaAcces,
          active: particularUser.active === 'Active' ? true : false
        });
        setRoleTableData(
          particularUser.roleAccessVO.map((role) => ({
            id: role.id,
            role: role.role,
            roleId: role.roleId,
            startDate: role.startDate,
            endDate: role.endDate
          }))
        );

        const alreadySelectedBranch = particularUser.branchAccessibleVO.map((role) => {
          const foundBranch = branchList.find((branch) => branch.branchCode === role.branchcode);
          console.log(`Searching for branch with code ${role.branchcode}:`, foundBranch);
          return {
            id: role.id,
            branchCode: foundBranch ? foundBranch.branchCode : 'Not Found',
            branch: foundBranch.branch ? foundBranch.branch : 'Not Found'
          };
        });
        setBranchTableData(alreadySelectedBranch);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.userName) {
      errors.userName = 'User Name is required';
    }
    // if (!formData.userType) {
    //   errors.userType = 'User Type is required';
    // }
    if (!formData.employeeCode) {
      errors.employeeCode = 'Employee Code is required';
    }
    if (!formData.employeeName) {
      errors.employeeName = 'Employee Name is required';
    }
    // if (!formData.email) {
    //   errors.email = 'Email ID is required';
    // } else if (!emailRegex.test(formData.email)) {
    //   errors.email = 'Invalid MailID Format';
    // }

    let roleTableDataValid = true;
    const newTableErrors = roleTableData.map((row) => {
      const rowErrors = {};
      if (!row.role) {
        rowErrors.role = 'Role is required';
        roleTableDataValid = false;
      }
      if (!row.startDate) {
        rowErrors.startDate = 'Start Date is required';
        roleTableDataValid = false;
      }

      return rowErrors;
    });
    setFieldErrors(errors);

    setRoleTableDataErrors(newTableErrors);

    let branchTableDataValid = true;
    const newTableErrors1 = branchTableData.map((row) => {
      const rowErrors = {};
      if (!row.branchCode) {
        rowErrors.branchCode = 'Branch Code is required';
        branchTableDataValid = false;
      }
      return rowErrors;
    });
    setFieldErrors(errors);

    setBranchTableErrors(newTableErrors1);

    if (Object.keys(errors).length === 0 && roleTableDataValid && branchTableDataValid) {
      setIsLoading(true);

      const encryptedPassword = encryptPassword('Wds@2022');
      const roleVo = roleTableData.map((row) => ({
        // ...(editId && { id: row.id }),
        role: row.role,
        roleId: row.roleId,
        startDate: dayjs(row.startDate).format('YYYY-MM-DD'),
        endDate: row.endDate ? dayjs(row.endDate).format('YYYY-MM-DD') : null
      }));
      const branchVo = branchTableData.map((row) => ({
        // ...(editId && { id: row.id }),
        branchCode: row.branchCode,
        branch: row.branch
      }));

      const saveFormData = {
        ...(editId && { id: formData.docId }),
        userName: formData.userName,
        ...(!editId && { password: encryptedPassword }),
        branch: formData.branch,
        // branchcode: formData.branchCode,
        branchcode: branchCode,
        companyName: companyNameForOrg,
        department: formData.department,
        designation: formData.designation,
        employeeCode: formData.employeeCode,
        employeeName: formData.employeeName,
        email: formData.email,
        allIndiaAcces: formData.allIndiaAccess,
        active: formData.active,
        orgId: orgId,
        roleAccessDTO: roleVo,
        branchAccessDTOList: branchVo
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `auth/signup`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'User Updated Successfully' : 'User created successfully');
          handleClear();
          getAllUserCreation();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'User creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'User creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleClear = () => {
    setFormData({
      docId: '',
      employeeCode: '',
      employeeName: '',
      userId: '',
      userName: '',
      password: '',
      email: '',
      active: true,
      allIndiaAccess: false,
      deactivatedOn: '',
      // userType: '',
      reportingTO: '',
      orgId: orgId,
      designation: ''
    });
    setFieldErrors({
      employeeCode: false,
      employeeName: false,
      gender: false,
      branch: false,
      department: false,
      designation: false,
      dateOfBirth: false,
      joiningDate: false,
      password: false,
      role: false
    });
    setRoleTableData([{ id: 1, role: '', roleId: '', startDate: null, endDate: null }]);
    setRoleTableDataErrors('');
    setBranchTableData([{ id: 1, branchCode: '', branch: '' }]);
    setBranchTableErrors('');
    setEditId('');
  };

  const handleKeyDown = (e, row, table) => {
    if (e.key === 'Tab' && row.id === table[table.length - 1].id) {
      e.preventDefault();
      if (isLastRowEmpty(table)) {
        displayRowError(table);
      } else {
        if (table === roleTableData) handleAddRow();
        else handleAddRow1();
      }
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(roleTableData)) {
      displayRowError(roleTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      role: '',
      roleId: '',
      startDate: '',
      endDate: ''
    };
    setRoleTableData([...roleTableData, newRow]);
    setRoleTableDataErrors([...roleTableDataErrors, { role: '', roleId: '', startDate: '', endDate: '' }]);
  };

  const handleAddRow1 = () => {
    if (isLastRowEmpty(branchTableData)) {
      displayRowError(branchTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      branchCode: '',
      branch: ''
    };
    setBranchTableData([...branchTableData, newRow]);
    setBranchTableErrors([
      ...branchTableErrors,
      {
        branchCode: ''
      }
    ]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === roleTableData) {
      return !lastRow.role || !lastRow.startDate;
    } else if (table === branchTableData) {
      return !lastRow.branchCode;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === roleTableData) {
      setRoleTableDataErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          role: !table[table.length - 1].role ? 'Role is required' : '',
          startDate: !table[table.length - 1].startDate ? 'Start Date is required' : ''
        };
        return newErrors;
      });
    }
    if (table === branchTableData) {
      setBranchTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          branchCode: !table[table.length - 1].branchCode ? 'Branch Code is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    // If the row exists, proceed to delete
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const getAvailableRoles = (currentRowId) => {
    const selectedRoles = roleTableData.filter((row) => row.id !== currentRowId).map((row) => row.role);
    return roleList.filter((role) => !selectedRoles.includes(role.role));
  };
  const handleRoleChange = (row, index, event) => {
    const value = event.target.value;
    const selectedRole = roleList.find((role) => role.role === value);
    setRoleTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, role: value, roleId: selectedRole.id } : r)));
    setRoleTableDataErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        role: !value ? 'Role is required' : ''
      };
      return newErrors;
    });
  };

  const getAvailableBranchCodes = (currentRowId) => {
    const selectedBranchCodes = branchTableData.filter((row) => row.id !== currentRowId).map((row) => row.branchCode);
    return branchList.filter((branch) => !selectedBranchCodes.includes(branch.branchCode));
  };
  const handleBranchCodeChange = (row, index, event) => {
    const value = event.target.value;
    const selectedBranch = branchList.find((branch) => branch.branchCode === value);
    setBranchTableData((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, branchCode: value, branch: selectedBranch ? selectedBranch.branch : '' } : r))
    );
    setBranchTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        branchCode: !value ? 'Branch Code is required' : ''
      };
      return newErrors;
    });
  };
  const handleView = () => {
    setListView(!listView);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <div>
        <ToastComponent />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
          </div>

          {!listView ? (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    size="small"
                    options={empList}
                    // getOptionLabel={(option) => option.employee || ""}
                    getOptionLabel={(option) => (option ? `${option.employeeCode} - ${option.employee}` : '')}
                    value={empList.find((emp) => emp.employee === formData.employeeName) || null}
                    onChange={(event, newValue) => {
                      handleSelectChange({
                        target: {
                          name: 'employeeName',
                          value: newValue ? newValue.employee : ''
                        }
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Name"
                        variant="outlined"
                        fullWidth
                        error={!!fieldErrors.employeeName}
                        helperText={fieldErrors.employeeName}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.employeeName === value.employeeName}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleInputChange}
                    disabled
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.employeeCode ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 10 }}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Email"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.email ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Designation"
                    variant="outlined"
                    size="small"
                    name="designation"
                    fullWidth
                    disabled
                    required
                    value={formData.designation}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.designation ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 15 }}
                  />
                </div>

                {/* <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="UserName"
                    variant="outlined"
                    size="small"
                    name="userName"
                    fullWidth
                    disabled
                    required
                    value={formData.userName}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.userName ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 15 }}
                  />
                </div> */}

                {/* <div className="col-md-3 mb-3">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.userType}>
                    <InputLabel id="userType-label">User Type</InputLabel>
                    <Select
                      labelId="userType-label"
                      label="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      name="userType"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                      <MenuItem value="USER">USER</MenuItem>
                    </Select>
                    {fieldErrors.userType && <FormHelperText>{fieldErrors.userType}</FormHelperText>}
                  </FormControl>
                </div> */}
                {/* <div className="col-md-3 mb-3">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.reportingTO}>
                    <InputLabel id="reportingTO-label">Reporting To</InputLabel>
                    <Select
                      labelId="reportingTO-label"
                      label="reportingTO"
                      value={formData.reportingTO}
                      onChange={handleSelectChange}
                      name="reportingTO"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {empList.length > 0 &&
                        empList.map((emp, index) => (
                          <MenuItem key={index} value={emp.empCode}>
                            {emp.empCode}
                          </MenuItem>
                        ))}
                    </Select>
                    {fieldErrors.reportingTO && <FormHelperText>{fieldErrors.reportingTO}</FormHelperText>}
                  </FormControl>
                </div> */}

                <div className="col-md-3 mb-3">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.allIndiaAccess}
                          onChange={handleInputChange}
                          name="allIndiaAccess"
                          sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                        />
                      }
                      label="All India Access"
                    />
                  </FormGroup>
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
              <div className="row mt-2">
                <Box sx={{ width: '100%' }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                  >
                    <Tab value={0} label="Roles" />
                    <Tab value={1} label="Branch Accessible" />
                  </Tabs>
                </Box>
                <Box sx={{ padding: 2 }}>
                  {value === 0 && (
                    <>
                      <div className="row d-flex ml">
                        <div className="mb-1"></div>
                        <div className="row mt-2">
                          <div className="col-lg-9">
                            <div className="table-responsive">
                              <TableContainer component={Paper}>
                                <Table>
                                  <TableHead
                                    sx={{
                                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                                      color: 'white'
                                    }}
                                  >
                                    <TableRow>
                                      <TableCell>Action</TableCell>
                                      <TableCell>S.No</TableCell>
                                      <TableCell>Role</TableCell>
                                      <TableCell>Start Date</TableCell>
                                      <TableCell>
                                        <div className="d-flex justify-content-end align-items-center">
                                          <div className="pe-5 pt-3"> End Date</div>
                                          <div className="d-flex justify-content-end">
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {roleTableData.map((row, index) => (
                                      <TableRow key={row.id}>
                                        <TableCell>
                                          <ActionButton
                                            title="Delete"
                                            icon={DeleteIcon}
                                            onClick={() =>
                                              handleDeleteRow(
                                                row.id,
                                                roleTableData,
                                                setRoleTableData,
                                                roleTableDataErrors,
                                                setRoleTableDataErrors
                                              )
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <div className="pt-2">{index + 1}</div>
                                        </TableCell>
                                        <TableCell>
                                          <select
                                            value={row.role}
                                            onChange={(e) => handleRoleChange(row, index, e)}
                                            className={roleTableDataErrors[index]?.role ? 'error form-control' : 'form-control'}
                                          >
                                            <option value="">Select Option</option>
                                            {getAvailableRoles(row.id).map((role) => (
                                              <option key={role.id} value={role.role}>
                                                {role.role}
                                              </option>
                                            ))}
                                          </select>
                                          {roleTableDataErrors[index]?.role && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {roleTableDataErrors[index].role}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <input
                                            type="date"
                                            value={row.startDate}
                                            onChange={(e) => {
                                              const date = e.target.value;

                                              setRoleTableData((prev) =>
                                                prev.map((r) =>
                                                  r.id === row.id
                                                    ? { ...r, startDate: date, endDate: date > r.endDate ? '' : r.endDate }
                                                    : r
                                                )
                                              );

                                              setRoleTableDataErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  startDate: !date ? 'Start Date is required' : '',
                                                  endDate: date && row.endDate && date > row.endDate ? '' : newErrors[index]?.endDate
                                                };
                                                return newErrors;
                                              });
                                            }}
                                            className={roleTableDataErrors[index]?.startDate ? 'error form-control' : 'form-control'}
                                            onKeyDown={(e) => handleKeyDown(e, row, roleTableData)}
                                          />
                                          {roleTableDataErrors[index]?.startDate && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {roleTableDataErrors[index].startDate}
                                            </div>
                                          )}
                                        </TableCell>

                                        <TableCell>
                                          <input
                                            type="date"
                                            value={row.endDate}
                                            className={roleTableDataErrors[index]?.endDate ? 'error form-control' : 'form-control'}
                                            onChange={(e) => {
                                              const date = e.target.value; // Capture the date string from input

                                              // Update the endDate in the row
                                              setRoleTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, endDate: date } : r)));

                                              // Handle error validation for endDate
                                              setRoleTableDataErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  endDate: !date ? 'End Date is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            }}
                                            min={row.startDate || new Date().toISOString().split('T')[0]} // Ensure the minDate is properly set
                                            disabled={!row.startDate}
                                          />
                                          {roleTableDataErrors[index]?.endDate && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {roleTableDataErrors[index].endDate}
                                            </div>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {value === 1 && (
                    <>
                      <div className="row d-flex ml">
                        {/* <div className="mb-1">
                          <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
                        </div> */}
                        <div className="row mt-2">
                          <div className="col-lg-6">
                            <div className="table-responsive">
                              <TableContainer component={Paper}>
                                <Table>
                                  <TableHead
                                    sx={{
                                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                                      color: 'white'
                                    }}
                                  >
                                    <TableRow>
                                      <TableCell>Action</TableCell>
                                      <TableCell>S.No</TableCell>
                                      <TableCell>Branch Code</TableCell>
                                      <TableCell>
                                        <div className="d-flex justify-content-end align-items-center">
                                          <div className="pe-5 pt-3"> Branch</div>
                                          <div className="d-flex justify-content-end">
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {branchTableData.map((row, index) => (
                                      <TableRow key={row.id}>
                                        <TableCell>
                                          <ActionButton
                                            title="Delete"
                                            icon={DeleteIcon}
                                            onClick={() =>
                                              handleDeleteRow(
                                                row.id,
                                                branchTableData,
                                                setBranchTableData,
                                                branchTableErrors,
                                                setBranchTableErrors
                                              )
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <div className="pt-2">{index + 1}</div>
                                        </TableCell>
                                        <TableCell>
                                          <select
                                            value={row.branchCode}
                                            onChange={(e) => handleBranchCodeChange(row, index, e)}
                                            onKeyDown={(e) => handleKeyDown(e, row, branchTableData)}
                                            className={branchTableErrors[index]?.branchCode ? 'error form-control' : 'form-control'}
                                          >
                                            <option value="">Select</option>
                                            {getAvailableBranchCodes(row.id).map((branch) => (
                                              <option key={branch.id} value={branch.branchCode}>
                                                {branch.branchCode}
                                              </option>
                                            ))}
                                          </select>
                                          {branchTableErrors[index]?.branchCode && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {branchTableErrors[index].branchCode}
                                            </div>
                                          )}
                                        </TableCell>

                                        <TableCell>{row.branch} </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Box>
              </div>
            </>
          ) : (
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getUserById} enableEditing={true} />
          )}
        </div>
      </div>
    </>
  );
};
export default UserCreation;
