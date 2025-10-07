import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import ActionButton from 'utils/ActionButton';
import CommonTable from 'views/basicMaster/CommonTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { showToast } from 'utils/toast-component';
import { mobileModel } from 'react-device-detect';
import { useTheme } from '@mui/material/styles';
import { InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const LeaveProgress = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState();
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [listViewData, setListViewData] = useState([]);
  const maxDate = dayjs().subtract(18, 'years');
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeCode: '',
    branch: '',
    gender: '',
    email: '',
    dob: null,
    bloodGroup: '',
    mobileNo: '',
    alternativeMobile: '',
    aadhaarNo: '',
    panNo: '',
    accountNo: '',
    accountholderName: '',
    ifscCode: '',
    doj: null,
    resignationDate: '',
    grade: '',
    team: '',
    reportingPerson: '',
    reportingName: '',
    reportingRole: '',
    department: '',
    designation: '',
    role: '',
    active: true,
    branchCode: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    employeeName: '',
    employeeCode: '',
    branch: '',
    gender: '',
    email: '',
    dob: '',
    bloodGroup: '',
    mobileNo: '',
    alternativeMobile: '',
    aadhaarNo: '',
    panNo: '',
    accountNo: '',
    accountholderName: '',
    ifscCode: '',
    doj: '',
    resignationDate: '',
    grade: '',
    team: '',
    reportingPerson: '',
    reportingName: '',
    reportingRole: '',
    department: '',
    designation: '',
    role: '',
    active: true,
    branchCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [leaveTypeTable, setLeaveTypeTable] = useState([
    {
      id: 1,
      leaveCode: '',
      noOfDays: '',
      effective: '',
      carryforward: '',
    }
  ]);
  const [leaveTypeErrors, setLeaveTypeErrors] = useState([
    {
      leaveCode: '',
      noOfDays: '',
      effective: '',
      carryforward: '',
    }
  ]);
  const columns = [
    { accessorKey: 'listCode', header: 'SNo', size: 140 },
    { accessorKey: 'listDescription', header: 'Emp Code', size: 140 },
    { accessorKey: 'listDescription', header: 'Name', size: 140 },
    { accessorKey: 'listDescription', header: 'Leave Type', size: 140 },
    { accessorKey: 'listDescription', header: 'Avail Leave', size: 140 },
    { accessorKey: 'listDescription', header: 'Credit Leave', size: 140 },
    { accessorKey: 'listDescription', header: 'Leave Type', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getAllListOfValuesByOrgId();
  }, []);
  useEffect(() => {
    getAllBranches();
    getAllEmployees();
    getAllDesignation();
    getAllDepartment();
  }, []);
  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllDesignation = async () => {
    try {
      const response = await apiCalls('get', `master/getDesignationNameForEmployee?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDesignationList(response.paramObjectsMap.designationName);
        console.log('fin', response.paramObjectsMap.designationName);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `master/getDepartmentNameForEmployee?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentName);
        console.log('fin', response.paramObjectsMap.departmentName);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllEmployees = async () => {
    try {
      const response = await apiCalls('get', `master/getAllEmployeeByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.employeeVO.reverse());
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, checked, type, selectionStart, selectionEnd } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;

    let errorMessage = '';

    if (name === 'employeeName' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    } else if (name === 'employeeCode' && !nameRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

      if (name === 'branch') {
        const selectedBranch = branchList.find((br) => br.branch === value);
        setFormData((prevData) => ({
          ...prevData,
          branch: value,
          branchCode: selectedBranch ? selectedBranch.branchCode : ''
        }));
      } else if (type === 'checkbox') {
        setFormData((prevData) => ({ ...prevData, [name]: checked }));
      } else {
        let inputValue = value;

        if (name === 'email') {
          inputValue = value.toLowerCase();
        } else if (type === 'text' || type === 'textarea') {
          inputValue = value.toUpperCase();
        }

        setFormData((prevData) => ({ ...prevData, [name]: inputValue }));

        // Check if input type is text or textarea before calling setSelectionRange
        if (type === 'text' || type === 'textarea') {
          setTimeout(() => {
            const inputElement = document.getElementsByName(name)[0];
            if (inputElement && inputElement.setSelectionRange) {
              inputElement.setSelectionRange(selectionStart, selectionEnd);
            }
          }, 0);
        }
      }
    }
  };


  const handleAddRow = () => {
    if (isLastRowEmpty(leaveTypeTable)) {
      displayRowError(leaveTypeTable);
      return;
    }
    const newRow = {
      id: Date.now(),
      leaveCode: '',
      noOfDays: '',
      effective: '',
      carryforward: '',
    };
    setLeaveTypeTable([...leaveTypeTable, newRow]);
    setLeaveTypeErrors([...leaveTypeErrors, { leaveCode: '', noOfDays: '', effective: '', carryforward: '', }]);
  };
  const isLastRowEmpty = (table) => {
    if (!table || table.length === 0) return false;

    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === leaveTypeTable) {
      return !lastRow.leaveCode || !lastRow.noOfDays || !lastRow.effective || !lastRow.carryforward;
    }
    return false;
  };


  const displayRowError = (table) => {
    if (table === leaveTypeTable) {
      setLeaveTypeErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          leaveCode: !table[table.length - 1].leaveCode ? 'Leave Code is required' : '',
          noOfDays: !table[table.length - 1].noOfDays ? 'No Of Days is required' : '',
          effective: !table[table.length - 1].effective ? 'Effective is required' : '',
          carryforward: !table[table.length - 1].carryforward ? 'Carry Forward is required' : '',
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const handleClear = () => {
    setFormData({
      employeeName: '',
      employeeCode: '',
      branch: '',
      gender: '',
      email: '',
      dob: null,
      bloodGroup: '',
      mobileNo: '',
      alternativeMobile: '',
      aadhaarNo: '',
      panNo: '',
      accountNo: '',
      accountholderName: '',
      ifscCode: '',
      doj: null,
      resignationDate: '',
      grade: '',
      team: '',
      reportingPerson: '',
      reportingName: '',
      reportingRole: '',
      department: '',
      designation: '',
      role: '',
      active: true,
      branchCode: '',
    });
    setFieldErrors({});
    setLeaveTypeTable([
      {
        id: 1,
        leaveCode: '',
        noOfDays: '',
        effective: '',
        carryforward: '',
      }
    ]);
    setLeaveTypeErrors('');
    setEditId('');
  };
  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };


  const handleSave = async () => {
    console.log('THE HANDLE SAVE IS WORKING');

    const errors = {};
    let detailsTableDataValid = true;

    if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
    if (!formData.branch) errors.branch = 'Branch is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.dob) errors.dob = 'Date of Birth is required';
    if (!formData.mobileNo) errors.mobileNo = 'Mobile No is required';
    if (!formData.aadhaarNo) errors.aadhaarNo = 'Aadhaar Number is required';
    if (!formData.panNo) errors.panNo = 'Pan Number is required';
    if (!formData.accountNo) errors.accountNo = 'Account Number is required';
    if (!formData.accountholderName) errors.accountholderName = 'Accountholder Name is required';
    if (!formData.ifscCode) errors.ifscCode = 'IFSC Code is required';
    if (!formData.doj) errors.doj = 'Date of Join is required';
    if (!formData.resignationDate) errors.resignationDate = 'Resignation Date is required';
    if (!formData.grade) errors.grade = 'Grade is required';
    if (!formData.team) errors.team = 'Team is required';
    if (!formData.reportingPerson) errors.reportingPerson = 'Reporting Person is required';
    if (!formData.reportingName) errors.reportingName = 'Reporting Name is required';
    if (!formData.reportingRole) errors.reportingRole = 'Reporting Role is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.designation) errors.designation = 'Designation is required';

    if (!leaveTypeTable || !Array.isArray(leaveTypeTable) || leaveTypeTable.length === 0) {
      detailsTableDataValid = false;
      setLeaveTypeErrors([{ general: 'Lr Table Data is required' }]);
    } else {
      const newTableErrors = leaveTypeTable.map((row, index) => {
        const rowErrors = {};
        if (!row.leaveCode) {
          rowErrors.leaveCode = 'Leave Code is required';
          detailsTableDataValid = false;
        }
        if (!row.noOfDays) {
          rowErrors.noOfDays = 'No. of Days is required';
          detailsTableDataValid = false;
        }
        if (!row.effective) {
          rowErrors.effective = 'Effective is required';
          detailsTableDataValid = false;
        }
        if (!row.carryforward) {
          rowErrors.carryforward = 'Carry Forward is required';
          detailsTableDataValid = false;
        }
        if (row.active === undefined || row.active === null) {
          rowErrors.active = 'Active is required';
          detailsTableDataValid = false;
        }
        return rowErrors;
      });
      setLeaveTypeErrors(newTableErrors);
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0 && detailsTableDataValid) {
      setIsLoading(true);

      const detailsVo = leaveTypeTable.map((row) => ({
        ...(editId && { id: row.id }),
        leaveCode: row.leaveCode,
        noOfDays: row.noOfDays,
        effective: row.effective,
        carryforward: row.carryforward,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        listCode: formData.listCode,
        listDescription: formData.listDescription,
        listOfValues1DTO: detailsVo,
        createdBy: loginUserName,
        orgId: orgId
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const response = await apiCalls('put', '/master/updateCreateListOfValues', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'List of values updated successfully' : 'List of values created successfully');
          getAllListOfValuesByOrgId();
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'List of value creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'List of value creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };


  const getAllListOfValuesByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/master/getListOfValuesByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.listOfValuesVO.reverse() || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getListOfValueById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/master/getListOfValuesById?id=${row.original.id}`);

      if (result) {
        const listValueVO = result.paramObjectsMap.listOfValuesVO[0];
        setEditId(row.original.id);

        setFormData({
          listCode: listValueVO.listCode || '',
          listDescription: listValueVO.listDescription || '',
          active: listValueVO.active || false,
          id: listValueVO.id || 0
        });
        setLeaveTypeTable(
          listValueVO.listOfValues1VO.map((cl) => ({
            id: cl.id,
            leaveCode: cl.leaveCode,
            noOfDays: cl.valueDescription,
            effective: cl.effective,
            carryforward: cl.carryforward,
          }))
        );

        console.log('DataToEdit', listValueVO);
      } else {
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
          {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} /> */}
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} isLoading={isLoading} margin="0 10px 0 10px" />
        </div>
        <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getListOfValueById} />
      </div>
    </div>
  );
};

export default LeaveProgress;
