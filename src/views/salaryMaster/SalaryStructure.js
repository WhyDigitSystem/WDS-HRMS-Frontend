import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  TableContainer,
  TableHead,
  TableCell,
  Table,
  TableRow,
  TableBody
} from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import UploadIcon from '@mui/icons-material/Upload';
import handleSampleFileSalaryStructure from '../../../src/assets/sample-files/Salary_Structure_Sample.xlsx';

const SalaryMaster = () => {
  const [listViewData, setListViewData] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [createdBy, setCreatedBy] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [empList, setEmpList] = useState([]);
  const [salaryHeadsType, setSalaryHeadsType] = useState([]);
  const [employeeSalary, setEmployeeSalary] = useState(0);
  const [pfHead, setPfHead] = useState(null);
  const [esiHead, setEsiHead] = useState(null);
  const [autoDetectionRows, setAutoDetectionRows] = useState([]);
  const [userDetectionRows, setUserDetectionRows] = useState([]);
  const [isFormCleared, setIsFormCleared] = useState(false);
  const [uploadFile, setUploadFile] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeCode: '',
    dob: '',
    grade: '',
    department: '',
    panNo: '',
    bankAccountNo: '',
    position: '',
    dateOfJoining: '',
    orgId: orgId,
    pfPercentage: '',
    esiPercentage: '',
    effectiveFrom: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    employeeName: '',
    employeeCode: '',
    dob: '',
    grade: '',
    department: '',
    panNo: '',
    bankAccountNo: '',
    position: '',
    dateOfJoining: '',
    orgId: orgId,
    pfPercentage: '',
    esiPercentage: '',
    effectiveFrom: ''
  });

  const listViewColumns = [
    { accessorKey: 'employeeName', header: 'Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Code', size: 140 },
    { accessorKey: 'dateOfBirth', header: 'Date Of Birth', size: 140 },
    { accessorKey: 'grade', header: 'Grade', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'panNo', header: 'Pan No', size: 140 },
    { accessorKey: 'bankAccountNo', header: ' Account No', size: 140 },
    { accessorKey: 'designation', header: 'Position', size: 140 },
    { accessorKey: 'dateOfJoining', header: 'Date Of Joining', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [earningDetailsData, setEarningDetailsData] = useState([{ id: 1, heading: '', amount: '' }]);
  const [earningDetailsDataErrors, setEarningDetailsDataErrors] = useState([
    {
      heading: '',
      amount: ''
    }
  ]);
  const [detectionDetailsData, setDetectionDetailsData] = useState([]);
  const [detectionDetailsDataErrors, setDetectionDetailsDataErrors] = useState([]);

  useEffect(() => {
    const totalEarnings = earningDetailsData.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);

    const totalDeductions = detectionDetailsData.reduce((sum, row) => {
      return sum + (parseFloat(row.detectionAmount) || 0);
    }, 0);

    const netSalary = totalEarnings - totalDeductions;

    setEmployeeSalary(netSalary);
  }, [earningDetailsData, detectionDetailsData]);

  useEffect(() => {
    setDetectionDetailsData([...autoDetectionRows, ...userDetectionRows]);
  }, [autoDetectionRows, userDetectionRows]);

  useEffect(() => {
    if (!isFormCleared) {
      recalculatePFAndESI();
    }
  }, [earningDetailsData, formData.pfPercentage, formData.esiPercentage, isFormCleared]);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;

    let errorMessage = '';

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      // Special cases for checkboxes and other inputs
      if (name === 'active' || name === 'allIndiaAccess') {
        setFormData({ ...formData, [name]: checked });
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleSelectChange = async (employeeCode, employeeName) => {
    if (!employeeCode) {
      handleClear();
      return;
    }

    try {
      setIsFormCleared(false);
      // Call the API to get employee details by employeeCode
      const response = await apiCalls('get', `master/getAllEmployeeByOrgIdAndEmployeeCode?employeeCode=${employeeCode}&orgId=${orgId}`);

      if (response.status === true && response.paramObjectsMap.employeeVO && response.paramObjectsMap.employeeVO.length > 0) {
        const selectedEmp = response.paramObjectsMap.employeeVO[0];

        setFormData((prevData) => ({
          ...prevData,
          employeeCode: selectedEmp.employeeCode || '',
          employeeName: selectedEmp.employeeName || '',
          dob: selectedEmp.dateOfBirth || '', // Mapping Date of Birth
          grade: selectedEmp.grade || '', // Mapping Grade
          department: selectedEmp.department || '', // Mapping Department
          panNo: selectedEmp.panNo || '', // Mapping PAN Number
          bankAccountNo: selectedEmp.accountNo || '', // Mapping Bank Account Number
          position: selectedEmp.designation || '', // Mapping Designation
          dateOfJoining: selectedEmp.joiningDate || '', // Mapping Date of Joining
          pfPercentage: selectedEmp.pfPercentage || '', // Mapping PF Percentage
          esiPercentage: selectedEmp.esiPercentage || '', // Mapping ESI Percentage
          effectiveFrom: selectedEmp.effectiveFrom || '' // Mapping ESI Percentage
        }));
      } else {
        console.log('No employee found with the given code:', employeeCode);
        handleClear();
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      showToast('error', 'Error fetching employee details');
    }
  };

  const handleDateChange = (name, date) => {
    if (date && dayjs(date).isValid()) {
      const dateString = dayjs(date).toISOString();
      setFormData({ ...formData, [name]: dateString });
      setFieldErrors({ ...fieldErrors, [name]: false });
    } else {
      setFormData({ ...formData, [name]: null });
    }

    if (formData.fromDate && formData.toDate) {
      const start = dayjs(formData.fromDate);
      const end = dayjs(formData.toDate);
      if (start.isAfter(end)) {
        setFieldErrors({ ...fieldErrors, toDate: true });
      } else {
        setFieldErrors({ ...fieldErrors, toDate: false });
      }
    }
  };

  const handleEffectiveDateChange = (name, date) => {
    if (date && dayjs(date).isValid()) {
      // store only the date part (local date)
      const dateString = dayjs(date).format("YYYY-MM-DD");
      setFormData({ ...formData, [name]: dateString });
      setFieldErrors({ ...fieldErrors, [name]: false });
    } else {
      setFormData({ ...formData, [name]: null });
    }

    if (formData.fromDate && formData.toDate) {
      const start = dayjs(formData.fromDate);
      const end = dayjs(formData.toDate);
      setFieldErrors({ ...fieldErrors, toDate: start.isAfter(end) });
    }
  };

  useEffect(() => {
    getAllEmployeeList();
    getSalaryHeadsDetails();
    getAllSalaryStructure();
  }, []);

  const getAllSalaryStructure = async () => {
    try {
      const response = await apiCalls('get', `/employeemaster/getAllSalaryStructureByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.SalaryStructureVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllEmployeeList = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllEmployeeByActive?orgId=${orgId}`);
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

  const getSalaryHeadsDetails = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllSalaryHeadsByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        const heads = response.paramObjectsMap.salaryHeadsVO;
        setSalaryHeadsType(heads);

        const pf = heads.find((head) => head.code.toLowerCase() === 'pf' && head.type === 'DEDUCTION');
        const esi = heads.find((head) => head.code.toLowerCase() === 'esi' && head.type === 'DEDUCTION');

        setPfHead(pf);
        setEsiHead(esi);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getSalaryStructureById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `employeemaster/getSalaryStructureById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularSalaryStructure = response.paramObjectsMap.SalaryStructureVO;

        setFormData({
          employeeCode: particularSalaryStructure.employeeCode || '',
          employeeName: particularSalaryStructure.employeeName,
          dob: particularSalaryStructure.dateOfBirth,
          grade: particularSalaryStructure.grade,
          department: particularSalaryStructure.department,
          panNo: particularSalaryStructure.panNo,
          bankAccountNo: particularSalaryStructure.bankAccountNo,
          position: particularSalaryStructure.designation,
          dateOfJoining: particularSalaryStructure.dateOfJoining,
          pfPercentage: particularSalaryStructure.pfPercentage,
          esiPercentage: particularSalaryStructure.esiPercentage,
          effectiveFrom: particularSalaryStructure.effectiveFrom
        });
        setEarningDetailsData(
          particularSalaryStructure.salaryEarningDetailsVO.map((role) => ({
            id: role.id,
            heading: role.heading,
            amount: role.amount
          }))
        );
        setAutoDetectionRows([]);
        setUserDetectionRows(
          particularSalaryStructure.salaryDetectionDetailsVO
            .filter((role) => role.heading !== pfHead?.heading && role.heading !== esiHead?.heading)
            .map((role) => ({
              id: role.id,
              detectionHeading: role.heading,
              detectionAmount: role.amount,
              isAuto: false
            }))
        );
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.employeeName) {
      errors.employeeName = 'Employee Name is required';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const earningDetailsVO = earningDetailsData.map((row) => ({
        ...(editId && { id: row.id }),
        heading: row.heading,
        amount: row.amount
      }));
      const detectionDetailsVO = detectionDetailsData.map((row) => ({
        ...(editId && { id: row.id }),
        heading: row.detectionHeading,
        amount: row.detectionAmount
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        bankAccountNo: formData.bankAccountNo,
        branch: branch,
        branchCode: branchCode,
        createdBy: createdBy,
        dateOfBirth: formData.dob,
        dateOfJoining: formData.dateOfJoining,
        department: formData.department,
        designation: formData.position,
        employeeCode: formData.employeeCode,
        employeeName: formData.employeeName,
        finYear: finYear,
        grade: formData.grade,
        orgId: orgId,
        panNo: formData.panNo,
        pfPercentage: formData.pfPercentage,
        esiPercentage: formData.esiPercentage,
        effectiveFrom: formData.effectiveFrom,
        salaryDetectionDetailsDTO: detectionDetailsVO,
        salaryEarningDetailsDTO: earningDetailsVO
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `employeemaster/createUpdateSalaryStructure`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Salary Structure Updated Successfully' : 'Salary Structure created successfully');
          handleClear();
          getAllSalaryStructure();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Salary Structure creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Salary Structure creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleClear = () => {
    setFormData({
      employeeCode: '',
      employeeName: '',
      dob: '',
      grade: '',
      department: '',
      panNo: '',
      bankAccountNo: '',
      position: '',
      dateOfJoining: '',
      orgId: orgId,
      pfPercentage: '',
      esiPercentage: '',
      effectiveFrom: ''
    });
    setFieldErrors({
      employeeCode: false,
      employeeName: false,
      grade: false,
      dob: false,
      department: false,
      bankAccountNo: false,
      position: false,
      panNo: false,
      dateOfJoining: false
    });
    setEarningDetailsData([{ id: 1, heading: '', amount: '' }]);
    setEarningDetailsDataErrors([{ heading: '', amount: '' }]);
    setDetectionDetailsData([]);
    setDetectionDetailsDataErrors([]);
    setEditId('');
    setAutoDetectionRows([]);
    setUserDetectionRows([]);
    setEmployeeSalary(0);
    setIsFormCleared(true);
  };

  const handleKeyDown = (e, row, table) => {
    if (e.key === 'Tab' && row.id === table[table.length - 1].id) {
      e.preventDefault();
      if (isLastRowEmpty(table)) {
        displayRowError(table);
      }
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(earningDetailsData)) {
      displayRowError(earningDetailsData);
      return;
    }
    const newRow = {
      id: Date.now(),
      heading: '',
      amount: ''
    };
    setEarningDetailsData([...earningDetailsData, newRow]);
    setEarningDetailsDataErrors([...earningDetailsDataErrors, { heading: '', amount: '' }]);
  };

  const handleAddRow1 = () => {
    if (isLastRowEmpty(userDetectionRows)) {
      displayRowError(userDetectionRows);
      return;
    }

    const newRow = {
      id: Date.now(),
      detectionHeading: '',
      detectionAmount: '',
      isAuto: false
    };

    setUserDetectionRows([...userDetectionRows, newRow]);
    setDetectionDetailsDataErrors((prev) => [...prev, { detectionHeading: '', detectionAmount: '' }]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === earningDetailsData) {
      return !lastRow.heading || !lastRow.amount;
    } else if (table === userDetectionRows) {
      return !lastRow.detectionHeading || !lastRow.detectionAmount;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === earningDetailsData) {
      setEarningDetailsDataErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          heading: !table[table.length - 1].heading ? 'Heading is required' : '',
          amount: !table[table.length - 1].amount ? 'Amount is required' : ''
        };
        return newErrors;
      });
    }
    if (table === userDetectionRows) {
      setDetectionDetailsDataErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          detectionHeading: !table[table.length - 1].detectionHeading ? 'Heading is required' : '',
          detectionAmount: !table[table.length - 1].detectionAmount ? 'Amount is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteEarningRow = (id) => {
    const index = earningDetailsData.findIndex((row) => row.id === id);
    if (index !== -1) {
      const updatedRows = earningDetailsData.filter((row) => row.id !== id);
      const updatedErrors = earningDetailsDataErrors.filter((_, i) => i !== index);
      setEarningDetailsData(updatedRows);
      setEarningDetailsDataErrors(updatedErrors);
    }
  };

  const handleDeleteDeductionRow = (id) => {
    // Check if it's an auto row
    if (id === 'PF-AUTO' || id === 'ESI-AUTO') {
      // Don't allow deleting auto rows
      return;
    }

    const index = userDetectionRows.findIndex((row) => row.id === id);
    if (index !== -1) {
      const updatedRows = userDetectionRows.filter((row) => row.id !== id);
      const updatedErrors = detectionDetailsDataErrors.filter((_, i) => i !== index);
      setUserDetectionRows(updatedRows);
      setDetectionDetailsDataErrors(updatedErrors);
    }
  };

  const handleSalaryHeadChange = (row, index, event, type) => {
    const value = event.target.value;
    const selectedHead = salaryHeadsType.find((head) => head.heading === value);

    if (type === 'EARNING') {
      setEarningDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, heading: value, headId: selectedHead?.id || '' } : r)));

      setEarningDetailsDataErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], heading: !value ? 'Heading is required' : '' };
        return newErrors;
      });

      setTimeout(recalculatePFAndESI, 0);
    } else {
      setUserDetectionRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, detectionHeading: value, headId: selectedHead?.id || '' } : r))
      );

      setDetectionDetailsDataErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], detectionHeading: !value ? 'Heading is required' : '' };
        return newErrors;
      });

      setTimeout(recalculatePFAndESI, 0);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const recalculatePFAndESI = () => {
  //   const totalEarnings = earningDetailsData.reduce((sum, row) => {
  //     const val = parseFloat(row.amount);
  //     return sum + (isNaN(val) ? 0 : val);
  //   }, 0);

  //   const pfPercent = parseFloat(formData.pfPercentage || 0); // e.g. 12
  //   const esiPercent = parseFloat(formData.esiPercentage || 0); // e.g. 1.75

  //   const pfAmount = (totalEarnings * pfPercent) / 100;
  //   const esiAmount = (totalEarnings * esiPercent) / 100;

  //   const pfHead = salaryHeadsType.find((head) => head.code.toLowerCase() === 'pf' && head.type === 'DEDUCTION');
  //   const esiHead = salaryHeadsType.find((head) => head.code.toLowerCase() === 'esi' && head.type === 'DEDUCTION');

  //   if (!pfHead || !esiHead) return;

  //   const pfRow = {
  //     id: 'PF-AUTO',
  //     detectionHeading: pfHead.heading,
  //     detectionAmount: pfAmount,
  //     isAuto: true
  //   };

  //   const esiRow = {
  //     id: 'ESI-AUTO',
  //     detectionHeading: esiHead.heading,
  //     detectionAmount: esiAmount,
  //     isAuto: true
  //   };

  //   setAutoDetectionRows([pfRow, esiRow]);
  // };




  // const recalculatePFAndESI = () => {
  //   // Don't calculate if form is cleared
  //   if (isFormCleared) {
  //     return;
  //   }

  //   const totalEarnings = earningDetailsData.reduce((sum, row) => {
  //     const val = parseFloat(row.amount);
  //     return sum + (isNaN(val) ? 0 : val);
  //   }, 0);

  //   const pfPercent = parseFloat(formData.pfPercentage || 0);
  //   const esiPercent = parseFloat(formData.esiPercentage || 0);

  //   const pfAmount = (totalEarnings * pfPercent) / 100;
  //   const esiAmount = (totalEarnings * esiPercent) / 100;

  //   const pfHead = salaryHeadsType.find((head) => head.code.toLowerCase() === 'pf' && head.type === 'DEDUCTION');
  //   const esiHead = salaryHeadsType.find((head) => head.code.toLowerCase() === 'esi' && head.type === 'DEDUCTION');

  //   if (!pfHead || !esiHead) return;

  //   const pfRow = {
  //     id: 'PF-AUTO',
  //     detectionHeading: pfHead.heading,
  //     detectionAmount: pfAmount,
  //     isAuto: true
  //   };

  //   const esiRow = {
  //     id: 'ESI-AUTO',
  //     detectionHeading: esiHead.heading,
  //     detectionAmount: esiAmount,
  //     isAuto: true
  //   };

  //   setAutoDetectionRows([pfRow, esiRow]);
  // };



  const recalculatePFAndESI = () => {
    if (isFormCleared) return;

    const basicRow = earningDetailsData.find(
      (row) => row.heading?.toLowerCase().trim() === "basic salary"
    );
    const basicAmount = parseFloat(basicRow?.amount || 0);

    const pfPercent = parseFloat(formData.pfPercentage || 0);
    const esiPercent = parseFloat(formData.esiPercentage || 0);

    const pfAmount = (basicAmount * pfPercent) / 100;

    const totalEarnings = earningDetailsData.reduce((sum, row) => {
      const val = parseFloat(row.amount);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const esiAmount = (totalEarnings * esiPercent) / 100;

    const pfHead = salaryHeadsType.find(
      (head) => head.code.toLowerCase() === "pf" && head.type === "DEDUCTION"
    );
    const esiHead = salaryHeadsType.find(
      (head) => head.code.toLowerCase() === "esi" && head.type === "DEDUCTION"
    );

    if (!pfHead || !esiHead) return;

    const pfRow = {
      id: "PF-AUTO",
      detectionHeading: pfHead.heading,
      detectionAmount: pfAmount,
      isAuto: true,
    };

    const esiRow = {
      id: "ESI-AUTO",
      detectionHeading: esiHead.heading,
      detectionAmount: esiAmount,
      isAuto: true,
    };

    setAutoDetectionRows([pfRow, esiRow]);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleSubmit = async () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
    // getLeaveProcessByOrgId();
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
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
            <ActionButton
              title="Upload"
              icon={UploadIcon}
              isLoading={isLoading}
              onClick={() => {
                setUploadFile({
                  title: 'Upload Salary Structure',
                  apiUrl: '/employeemaster/uploadExcelSalaryStructure',
                  sampleFileDownload: handleSampleFileSalaryStructure,
                  sampleFileName: 'Salary Structure Sample File',
                  loginUser: loginUserName
                });
                setUploadOpen(true);
              }}
            />
          </div>
          {uploadOpen && (
            <CommonBulkUpload
              open={uploadOpen}
              handleClose={handleBulkUploadClose}
              dialogTitle="Upload Files"
              uploadText="Upload File"
              onSubmit={handleSubmit}
              sampleFileDownload={uploadFile.sampleFileDownload}
              fileName={uploadFile.sampleFileName}
              downloadText="Download File"
              handleFileUpload={handleFileUpload}
              apiUrl={uploadFile.apiUrl}
              screen="Salary Structure"
              loginUser={uploadFile.loginUser}
              includeCreatedBy={uploadFile.includeCreatedBy}
              orgId={orgId}
            />
          )}
          {!listView ? (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={empList}
                    getOptionLabel={(option) => (option ? `${option.employeeCode} - ${option.employeeName}` : '')}
                    value={empList.find((emp) => emp.employeeCode === formData.employeeCode) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleSelectChange(newValue.employeeCode, newValue.employeeName);
                      } else {
                        // Clear the form when no employee is selected
                        handleClear();
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Name"
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={!!fieldErrors.employeeName}
                        helperText={fieldErrors.employeeName}
                      />
                    )}
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
                    inputProps={{ maxLength: 10 }}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date of Birth"
                        value={formData.dob ? dayjs(formData.dob) : null}
                        onChange={(date) => handleDateChange('dob', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                        error={fieldErrors.dob}
                        disabled
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Grade"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 40 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Department"
                    variant="outlined"
                    size="small"
                    name="department"
                    fullWidth
                    value={formData.department}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Pan No"
                    variant="outlined"
                    size="small"
                    name="panNo"
                    fullWidth
                    value={formData.panNo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Bank Account No"
                    variant="outlined"
                    size="small"
                    name="bankAccountNo"
                    fullWidth
                    value={formData.bankAccountNo}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.userName ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Position"
                    variant="outlined"
                    size="small"
                    name="position"
                    fullWidth
                    value={formData.position}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date of Joining"
                        value={formData.dateOfJoining ? dayjs(formData.dateOfJoining) : null}
                        onChange={(date) => handleDateChange('dateOfJoining', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                        error={fieldErrors.dateOfJoining}
                        disabled
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Salary"
                    variant="outlined"
                    size="small"
                    name="position"
                    fullWidth
                    value={employeeSalary}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="PF Percentage"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="pfPercentage"
                    value={formData.pfPercentage}
                    onChange={handleInputChange}
                    disabled
                    inputProps={{ maxLength: 10 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="ESI Percentage"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="esiPercentage"
                    value={formData.esiPercentage}
                    onChange={handleInputChange}
                    disabled
                    inputProps={{ maxLength: 10 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Effective From"
                        value={formData.effectiveFrom ? dayjs(formData.effectiveFrom) : null}
                        onChange={(date) => handleEffectiveDateChange('effectiveFrom', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                        error={fieldErrors.effectiveFrom}
                      />
                    </LocalizationProvider>
                  </FormControl>
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
                    <Tab value={0} label="Earning" />
                    <Tab value={1} label="Deduction" />
                  </Tabs>
                </Box>
                <Box sx={{ padding: 2 }}>
                  {value === 0 && (
                    <>
                      <div className="row d-flex ml">
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
                                      <TableCell>Heading</TableCell>
                                      <TableCell>
                                        <div className="d-flex justify-content-end align-items-center">
                                          <div className="pe-5 pt-3"> Amount </div>
                                          <div className="d-flex justify-content-end">
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {earningDetailsData.map((row, index) => (
                                      <TableRow key={row.id}>
                                        <TableCell>
                                          <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteEarningRow(row.id)} />
                                        </TableCell>
                                        <TableCell>
                                          <div className="pt-2">{index + 1}</div>
                                        </TableCell>
                                        <TableCell>
                                          <select
                                            value={row.heading}
                                            onChange={(e) => handleSalaryHeadChange(row, index, e, 'EARNING')}
                                            className={earningDetailsDataErrors[index]?.heading ? 'error form-control' : 'form-control'}
                                          >
                                            <option value="">Select Option</option>
                                            {salaryHeadsType
                                              .filter((head) => {
                                                if (head.type !== 'EARNING') return false;

                                                const isSelectedInAnotherRow = earningDetailsData.some(
                                                  (r, i) =>
                                                    i !== index && r.heading?.toLowerCase().trim() === head.heading.toLowerCase().trim()
                                                );

                                                return !isSelectedInAnotherRow;
                                              })
                                              .map((head) => (
                                                <option key={head.id} value={head.heading}>
                                                  {' '}
                                                  {head.heading}
                                                </option>
                                              ))}
                                          </select>

                                          {earningDetailsDataErrors[index]?.heading && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {earningDetailsDataErrors[index].heading}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <input
                                            type="text"
                                            value={row.amount}
                                            onChange={(e) => {
                                              const amount = e.target.value;

                                              setEarningDetailsData((prev) => {
                                                const updated = prev.map((r) => (r.id === row.id ? { ...r, amount } : r));
                                                return updated;
                                              });

                                              setEarningDetailsDataErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  amount: !amount ? 'Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            }}
                                            className={earningDetailsDataErrors[index]?.amount ? 'error form-control' : 'form-control'}
                                            onKeyDown={(e) => handleKeyDown(e, row, earningDetailsData)}
                                          />
                                          {earningDetailsDataErrors[index]?.amount && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {earningDetailsDataErrors[index].amount}
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
                                      <TableCell>Heading</TableCell>
                                      <TableCell>
                                        <div className="d-flex justify-content-end align-items-center">
                                          <div className="pe-5 pt-3"> Amount </div>
                                          <div className="d-flex justify-content-end">
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {[...autoDetectionRows, ...userDetectionRows].map((row, index) => (
                                      <TableRow key={row.id}>
                                        <TableCell>
                                          {!row.isAuto && (
                                            <ActionButton
                                              title="Delete"
                                              icon={DeleteIcon}
                                              onClick={() => handleDeleteDeductionRow(row.id)}
                                            />
                                          )}
                                        </TableCell>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                          <select
                                            value={row.detectionHeading}
                                            onChange={(e) => handleSalaryHeadChange(row, index, e, 'DEDUCTION')}
                                            className={
                                              detectionDetailsDataErrors[index]?.detectionHeading ? 'error form-control' : 'form-control'
                                            }
                                            disabled={row.isAuto}
                                          >
                                            <option value="">Select Option</option>
                                            {salaryHeadsType
                                              .filter(
                                                (head) =>
                                                  head.type === 'DEDUCTION' &&
                                                  // Exclude already selected headings (except for this row's own selection)
                                                  ![...autoDetectionRows, ...userDetectionRows]
                                                    .filter((r) => r.id !== row.id)
                                                    .some(
                                                      (r) => r.detectionHeading?.toLowerCase().trim() === head.heading.toLowerCase().trim()
                                                    )
                                              )
                                              .map((head) => (
                                                <option key={head.id} value={head.heading}>
                                                  {head.heading}
                                                </option>
                                              ))}
                                          </select>
                                        </TableCell>
                                        <TableCell>
                                          <input
                                            type="text"
                                            value={row.detectionAmount}
                                            onChange={(e) => {
                                              const detectionAmount = e.target.value;
                                              if (row.isAuto) {
                                                setAutoDetectionRows((prev) =>
                                                  prev.map((r) => (r.id === row.id ? { ...r, detectionAmount } : r))
                                                );
                                              } else {
                                                setUserDetectionRows((prev) =>
                                                  prev.map((r) => (r.id === row.id ? { ...r, detectionAmount } : r))
                                                );
                                                setDetectionDetailsDataErrors((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    detectionAmount: !detectionAmount ? 'Amount is required' : ''
                                                  };
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={
                                              detectionDetailsDataErrors[index]?.detectionAmount ? 'error form-control' : 'form-control'
                                            }
                                            disabled={row.isAuto}
                                          />
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
                </Box>
              </div>
            </>
          ) : (
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getSalaryStructureById}
              enableEditing={true}
            />
          )}
        </div>
      </div>
    </>
  );
};
export default SalaryMaster;
