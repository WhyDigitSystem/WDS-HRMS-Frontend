import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Paper,
  TableContainer
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

const GroupSalaryStructure = () => {
  const [listViewData, setListViewData] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [createdBy, setCreatedBy] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [salaryHeadsType, setSalaryHeadsType] = useState([]);
  const [employeeSalary, setEmployeeSalary] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCodeQuery, setSearchCodeQuery] = useState('');

  const [formData, setFormData] = useState({
    group: '',
    orgId: orgId
  });

  const [fieldErrors, setFieldErrors] = useState({
    group: '',
    orgId: orgId
  });

  const listViewColumns = [{ accessorKey: 'groupName', header: 'Group', size: 140 }];

  const [earningDetailsData, setEarningDetailsData] = useState([{ id: 1, heading: '', amount: '' }]);
  const [earningDetailsDataErrors, setEarningDetailsDataErrors] = useState([
    {
      heading: '',
      amount: ''
    }
  ]);
  const [detectionDetailsData, setDetectionDetailsData] = useState([{ id: 1, detectionHeading: '', detectionAmount: '' }]);
  const [detectionDetailsDataErrors, setDetectionDetailsDataErrors] = useState([
    {
      detectionHeading: '',
      detectionAmount: ''
    }
  ]);

  useEffect(() => {
    // Calculate total earnings
    const totalEarnings = earningDetailsData.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);

    // Calculate total deductions
    const totalDeductions = detectionDetailsData.reduce((sum, row) => {
      return sum + (parseFloat(row.detectionAmount) || 0);
    }, 0);

    // Calculate net salary
    const netSalary = totalEarnings - totalDeductions;

    // Update employee salary
    setEmployeeSalary(netSalary);
  }, [earningDetailsData, detectionDetailsData]); // Runs when earningDetailsData or detectionDetailsData changes

  const handleSelectChange = (e) => {
    const value = e.target.value;

    console.log('Selected group value:', value);
    console.log('Full groupList:', groupList);

    const selectedGroup = groupList.find((group) => group.groupName === value);

    if (selectedGroup) {
      setFormData((prev) => ({
        ...prev,
        group: selectedGroup.groupName
      }));

      // Clear any previous error
      setFieldErrors((prev) => ({
        ...prev,
        group: ''
      }));
    }
  };

  useEffect(() => {
    getAllGroup();
    getSalaryHeadsDetails();
    getAllGroupSalaryStructure();
  }, []);

  const getAllGroupSalaryStructure = async () => {
    try {
      const response = await apiCalls('get', `/shiftmaster/getGroupSalaryStructureByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.groupSalaryStructureVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllGroup = async () => {
    try {
      const response = await apiCalls('get', `shiftmaster/getGroupMasterByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setGroupList(response.paramObjectsMap.groupVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getGroupPopup = async () => {
    if (!formData.group) {
      setFieldErrors({
        group: 'Group is required'
      });
      return;
    }

    try {
      const response = await apiCalls('get', `shiftmaster/getGroupMasterByOrgIdAndGroup?orgId=${orgId}&groupName=${formData.group}`);

      console.log('API Response:', response);

      if (response.status === true) {
        const groupVOArray = response.paramObjectsMap.groupVO;

        if (Array.isArray(groupVOArray) && groupVOArray.length > 0) {
          const employeeList = groupVOArray[0].groupDetailsVO;

          // ✅ Transform to match table structure
          const transformedData = employeeList.map((emp) => ({
            employeeCode: emp.code,
            employee: emp.name,
            department: emp.department
          }));

          setGroupData(transformedData); // ✅ This populates your table
          setDialogOpen(true);
        } else {
          showToast('error', 'No group data found');
        }
      } else {
        console.error('API Error:', response);
        showToast('error', response.paramObjectsMap?.errorMessage || 'Failed to get group');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('error', 'Something went wrong while fetching group data');
    }
  };

  const getSalaryHeadsDetails = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllSalaryHeadsByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setSalaryHeadsType(response.paramObjectsMap.salaryHeadsVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getGroupSalaryStructureById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `shiftmaster/getGroupSalaryStructureById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const data = response.paramObjectsMap.groupSalaryStructureVO;
        setFormData({ group: data.groupName });

        // Map earnings with headId
        const earnings = data.groupSalaryEarningsVO.map((item) => {
          const matched = salaryHeadsType.find((h) => h.heading === item.heading && h.type === 'EARNING');
          return {
            id: item.id,
            heading: matched?.heading || item.heading,
            amount: item.amount,
            headId: matched?.id?.toString() || ''
          };
        });

        const deductions = data.groupSalaryDeductionsVO.map((item) => {
          const matched = salaryHeadsType.find((h) => h.heading === item.heading && h.type === 'DEDUCTION');
          return {
            id: item.id,
            detectionHeading: matched?.heading || item.heading,
            detectionAmount: item.amount,
            headId: matched?.id?.toString() || ''
          };
        });

        setEarningDetailsData(earnings);
        setDetectionDetailsData(deductions);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.group) {
      errors.group = 'Group is required';
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const groupSalaryEarningsVo = earningDetailsData.map((row) => ({
        ...(editId && { id: row.id }),
        heading: row.heading,
        amount: row.amount
      }));
      const groupSalaryDeductionsVo = detectionDetailsData.map((row) => ({
        ...(editId && { id: row.id }),
        heading: row.detectionHeading,
        amount: row.detectionAmount
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branchName: branch,
        branchCode: branchCode,
        createdBy: createdBy,
        finYear: finYear,
        groupName: formData.group,
        groupSalaryDeductionsDTO: groupSalaryDeductionsVo,
        groupSalaryEarningsDTO: groupSalaryEarningsVo,
        orgId: orgId
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/shiftmaster/createUpdateGroupSalaryStructure`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Group Salary Structure Updated Successfully' : 'Group Salary Structure created successfully');
          handleClear();
          getAllGroupSalaryStructure();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Group Salary Structure creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Group Salary Structure creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleClear = () => {
    setFormData({
      group: '',
      orgId: orgId
    });
    setFieldErrors({
      group: false
    });
    setEarningDetailsData([{ id: 1, heading: '', amount: '' }]);
    setEarningDetailsDataErrors('');
    setDetectionDetailsData([{ id: 1, detectionHeading: '', detectionAmount: '' }]);
    setDetectionDetailsDataErrors('');
    setEditId('');
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
    if (isLastRowEmpty(detectionDetailsData)) {
      displayRowError(detectionDetailsData);
      return;
    }
    const newRow = {
      id: Date.now(),
      detectionHeading: '',
      detectionAmount: ''
    };
    setDetectionDetailsData([...detectionDetailsData, newRow]);
    setDetectionDetailsDataErrors([...detectionDetailsDataErrors, { detectionHeading: '', detectionAmount: '' }]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === earningDetailsData) {
      return !lastRow.heading || !lastRow.amount;
    } else if (table === detectionDetailsData) {
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
    if (table === detectionDetailsData) {
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

  const handleSalaryHeadChange = (row, index, event, type) => {
    const selectedId = event.target.value;
    const selectedHead = salaryHeadsType.find((head) => head.id.toString() === selectedId);

    if (type === 'EARNING') {
      setEarningDetailsData((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, heading: selectedHead?.heading || '', headId: selectedId } : r))
      );

      setEarningDetailsDataErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          heading: !selectedId ? 'Heading is required' : ''
        };
        return newErrors;
      });
    } else {
      setDetectionDetailsData((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                detectionHeading: selectedHead?.heading || '',
                headId: selectedId
              }
            : r
        )
      );

      setDetectionDetailsDataErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          detectionHeading: !selectedId ? 'Heading is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const filteredData = groupData.filter(
    (row) =>
      row.employee?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      row.employeeCode?.toLowerCase().includes(searchCodeQuery.toLowerCase())
  );

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
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.group}>
                    <InputLabel id="group-label">Group</InputLabel>
                    <Select labelId="group-label" label="Group" value={formData.group} onChange={handleSelectChange} name="group">
                      {groupList.length > 0 &&
                        groupList.map((group, index) => (
                          <MenuItem key={index} value={group.groupName}>
                            {group.groupName} {/* Display employee code */}
                          </MenuItem>
                        ))}
                    </Select>
                    {fieldErrors.group && <FormHelperText>{fieldErrors.group}</FormHelperText>}
                  </FormControl>
                </div>

                <div className="col-md-1 mb-1">
                  <Tooltip title="Add">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={getGroupPopup}
                      sx={{
                        borderRadius: '8px',
                        boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                        textTransform: 'none',
                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)'
                      }}
                    >
                      Go
                    </Button>
                  </Tooltip>
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
                    <Tab value={0} label="Earning Details" />
                    <Tab value={1} label="Deduction Details" />
                  </Tabs>
                </Box>
                <Box sx={{ padding: 2 }}>
                  {value === 0 && (
                    <>
                      <div className="row d-flex ml">
                        {/* <div className="mb-1">
                          <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                        </div> */}
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
                                          <ActionButton
                                            title="Delete"
                                            icon={DeleteIcon}
                                            onClick={() =>
                                              handleDeleteRow(
                                                row.id,
                                                earningDetailsData,
                                                setEarningDetailsData,
                                                earningDetailsDataErrors,
                                                setEarningDetailsDataErrors
                                              )
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <div className="pt-2">{index + 1}</div>
                                        </TableCell>
                                        <TableCell>
                                          <select
                                            value={row.headId || ''}
                                            onChange={(e) => handleSalaryHeadChange(row, index, e, 'EARNING')}
                                            className={earningDetailsDataErrors[index]?.heading ? 'error form-control' : 'form-control'}
                                          >
                                            <option value="">Select Option</option>
                                            {salaryHeadsType
                                              .filter((head) => head.type === 'EARNING')
                                              .map((head) => (
                                                <option key={head.id} value={head.id.toString()}>
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

                                              setEarningDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, amount } : r)));

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
                        {/* <div className="mb-1">
                          <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
                        </div> */}
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
                                    {detectionDetailsData.map((row, index) => (
                                      <TableRow key={row.id}>
                                        <TableCell>
                                          <ActionButton
                                            title="Delete"
                                            icon={DeleteIcon}
                                            onClick={() =>
                                              handleDeleteRow(
                                                row.id,
                                                detectionDetailsData,
                                                setDetectionDetailsData,
                                                detectionDetailsDataErrors,
                                                setDetectionDetailsDataErrors
                                              )
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <div className="pt-2">{index + 1}</div>
                                        </TableCell>
                                        <TableCell>
                                          <select
                                            value={row.headId || ''}
                                            onChange={(e) => handleSalaryHeadChange(row, index, e, 'DEDUCTION')}
                                            className={
                                              detectionDetailsDataErrors[index]?.detectionHeading ? 'error form-control' : 'form-control'
                                            }
                                          >
                                            <option value="">Select Option</option>
                                            {salaryHeadsType
                                              .filter((head) => head.type === 'DEDUCTION')
                                              .map((head) => (
                                                <option key={head.id} value={head.id.toString()}>
                                                  {head.heading}
                                                </option>
                                              ))}
                                          </select>

                                          {detectionDetailsDataErrors[index]?.detectionHeading && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detectionDetailsDataErrors[index].detectionHeading}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <input
                                            type="text"
                                            value={row.detectionAmount}
                                            onChange={(e) => {
                                              const detectionAmount = e.target.value;

                                              setDetectionDetailsData((prev) =>
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
                                            }}
                                            className={
                                              detectionDetailsDataErrors[index]?.detectionAmount ? 'error form-control' : 'form-control'
                                            }
                                            onKeyDown={(e) => handleKeyDown(e, row, detectionDetailsData)}
                                          />
                                          {detectionDetailsDataErrors[index]?.detectionAmount && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detectionDetailsDataErrors[index].detectionAmount}
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
                </Box>
              </div>
            </>
          ) : (
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getGroupSalaryStructureById}
              enableEditing={true}
            />
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>View Employees</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            sx={{ width: '250px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                    color: 'white'
                  }}
                >
                  <strong>Code</strong>
                </TableCell>
                <TableCell
                  sx={{
                    background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                    color: 'white'
                  }}
                >
                  <strong>Name</strong>
                </TableCell>
                <TableCell
                  sx={{
                    background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                    color: 'white'
                  }}
                >
                  <strong>Department</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.employeeCode} hover>
                  <TableCell>{row.employeeCode}</TableCell>
                  <TableCell>{row.employee}</TableCell>
                  <TableCell>{row.department}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default GroupSalaryStructure;
