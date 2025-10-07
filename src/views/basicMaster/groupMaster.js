import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import {
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  Tooltip,
  Typography,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText
} from '@mui/material';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper,
  Table,
  TableRow,
  TableBody,
  TextField
} from '@mui/material';
import { message } from 'antd';

const GroupMaster = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [value, setValue] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openMissingDialog, setOpenMissingDialog] = useState(false);
  const [selectedMissingDates, setSelectedMissingDates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCodeQuery, setSearchCodeQuery] = useState('');
  const [groupMaster, setGroupMaster] = useState([]);
  const [groupMasterTable, setGroupMasterTable] = useState([]);
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [contractList, setContractList] = useState([]);

  const [formData, setFormData] = useState({
    group: '',
    department: '',
    branch: '',
    employeeType: '',
    contractor: '',
    active: true,
    cancelRemark: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    group: '',
    department: '',
    branch: '',
    employeeType: '',
    contractor: '',
    active: true
  });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: ''
  });

  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'groupName', header: 'Group', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getGroupMasterDetails();
    getAllDepartment();
    getAllBranches();
    getAllContractList();
  }, []);

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllContractList = async () => {
    try {
      const response = await apiCalls('get', `shiftmaster/getAllContractMasterByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        setContractList(response.paramObjectsMap.contractMasterVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getReportingPerson = async () => {
    // Validate required fields
    const errors = {};

    if (!formData.group) {
      errors.group = 'Group is required';
    }

    if (!formData.department) {
      errors.department = 'Department is required';
    }

    if (!formData.branch) {
      errors.branch = 'Branch is required';
    }

    if (!formData.employeeType) {
      errors.employeeType = 'Employee Type is required';
    }

    // If employeeType is Contractor, validate contractor field
    if (formData.employeeType === 'Contractor' && !formData.contractor) {
      errors.contractor = 'Contractor is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Build query parameters for the API call
      const params = new URLSearchParams({
        branch: formData.branch || 'All',
        department: formData.department || 'All',
        orgId: orgId,
        type: formData.employeeType || 'Employee'
      });

      // Add contractor parameter if employeeType is Contractor
      if (formData.employeeType === 'Contractor' && formData.contractor) {
        params.append('contractor', formData.contractor);
      }

      const result = await apiCalls('get', `shiftmaster/getEmployeeNameForGroupMaster?${params.toString()}`);

      if (result.status === true) {
        setGroupMaster(result.paramObjectsMap.employeeVO);
        setDialogOpen(true);
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error fetching employee data');
    } finally {
      setLoading(false);
    }
  };

  const getGroupMasterDetails = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `shiftmaster/getGroupMasterByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.groupVO);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };

  const isSelected = (employeeCode) => selectedRows.includes(employeeCode);

  const handleClick = (employeeCode) => {
    const selectedIndex = selectedRows.indexOf(employeeCode);
    let newSelected = [...selectedRows];

    if (selectedIndex === -1) {
      newSelected.push(employeeCode);
    } else {
      newSelected.splice(selectedIndex, 1);
    }

    setSelectedRows(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const allCodes = groupMaster.map((row) => row.employeeCode);
      setSelectedRows(allCodes);
    } else {
      setSelectedRows([]);
    }
  };

  const handleAddSelected = () => {
    const selectedData = groupMaster.filter((row) => selectedRows.includes(row.employeeCode));

    // Transform the data to match what the main table expects
    const transformedData = selectedData.map((row) => ({
      employeeCode: row.employeeCode,
      employee: row.employeeName, // Map employeeName to employee
      department: row.department
    }));

    setGroupMasterTable((prev) => [...prev, ...transformedData]);
    setSelectedRows([]);
    setDialogOpen(false);
  };

  const handleClear = () => {
    setFormData({
      group: '',
      department: '',
      branch: '',
      employeeType: '',
      contractor: '',
      active: true,
      cancelRemark: ''
    });
    setFieldErrors({
      group: '',
      department: '',
      branch: '',
      employeeType: '',
      contractor: '',
      active: true
    });
    setGroupMasterTable([]);
    setSelectedRows([]);
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.group) {
      errors.group = 'Group is required';
    }

    if (!formData.department) {
      errors.department = 'Department is required';
    }

    if (!formData.branch) {
      errors.branch = 'Branch is required';
    }

    if (!formData.employeeType) {
      errors.employeeType = 'Employee Type is required';
    }

    // If employeeType is Contractor, validate contractor field
    if (formData.employeeType === 'Contractor' && !formData.contractor) {
      errors.contractor = 'Contractor is required when Employee Type is Contractor';
    }

    if (groupMasterTable.length === 0) {
      errors.table = 'No data available in the table. Please add employees before saving.';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      // Prepare groupDetailsDTO
      const groupDetailsVo = groupMasterTable.map((row) => ({
        code: row.employeeCode,
        department: row.department,
        name: row.employee
      }));

      // Find the branch code for the selected branch
      const selectedBranchObj = branchList.find((b) => b.branch === formData.branch);
      const branchCodeToUse = selectedBranchObj ? selectedBranchObj.branchCode : branchCode;

      // Prepare the final payload
      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branchCode: branchCodeToUse, // Use the branch code from the selected branch
        branchName: formData.branch,
        cancelRemark: formData.cancelRemark || '',
        createdBy: loginUserName,
        finYear: '2025',
        groupName: formData.group,
        groupDetailsDTO: groupDetailsVo,
        orgId: parseInt(orgId),
        type: formData.employeeType,
        department: formData.department,
        contractor: formData.contractor || ''
      };

      console.log('DATA TO SAVE IS:', JSON.stringify(saveData, null, 2));

      try {
        const response = await apiCalls('put', '/shiftmaster/createUpdateGroupMaster', saveData);

        if (response.status === true) {
          showToast('success', editId ? 'Group Master Updated Successfully' : 'Group Master created successfully');
          handleClear(); // reset form
          getGroupMasterDetails();
        } else {
          showToast('error', response.paramObjectsMap?.errorMessage || 'Group Master saving failed');
        }
      } catch (error) {
        console.error('Save error:', error);
        showToast('error', 'Group Master saving failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const getGroupMasterById = async (row) => {
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/shiftmaster/getGroupMasterById?id=${row.original.id}`);

      if (response.status) {
        setListView(false);

        const groupData = response.paramObjectsMap.groupVO;

        if (groupData) {
          setFormData({
            group: groupData.groupName || '',
            department: groupData.department || '',
            branch: groupData.branchName || '',
            employeeType: groupData.type || '',
            contractor: groupData.contractor || '',
            cancelRemark: groupData.cancelRemark || '',
            active: groupData.active === 'Active'
          });

          setGroupMasterTable(
            (groupData.groupDetailsVO || []).map((emp) => ({
              id: emp.id,
              employeeCode: emp.code,
              employee: emp.name,
              department: emp.department
            }))
          );
        } else {
          showToast('error', 'No group data found.');
        }
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Failed to fetch group master');
      }
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      showToast('error', 'Error fetching group');
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const filteredData = groupMasterTable.filter(
    (row) =>
      row.employee?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      row.employeeCode?.toLowerCase().includes(searchCodeQuery.toLowerCase())
  );

  const filteredGroupMaster = Array.isArray(groupMaster)
    ? groupMaster.filter(
        (row) =>
          row.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
          </div>
        </div>
        {listView && (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              enableEditing={true}
              toEdit={getGroupMasterById}
            />
          </div>
        )}
        {!listView && (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Group"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  error={!!fieldErrors.group}
                  helperText={fieldErrors.group}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.department}>
                  <InputLabel id="department-label">Department *</InputLabel>
                  <Select
                    labelId="department-label"
                    label="Department *"
                    name="department"
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {departmentList?.map((row) => (
                      <MenuItem key={row.id} value={row.departmentName}>
                        {row.departmentName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.department && <FormHelperText>{fieldErrors.department}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                  <InputLabel id="branch-label">Branch *</InputLabel>
                  <Select
                    labelId="branch-label"
                    label="Branch *"
                    name="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {branchList?.map((row) => (
                      <MenuItem key={row.id} value={row.branch}>
                        {row.branch}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={['All', 'Employee', 'Contractor']}
                  getOptionLabel={(option) => option}
                  sx={{ width: '100%' }}
                  size="small"
                  value={formData.employeeType}
                  onChange={(event, newValue) => {
                    handleInputChange({ target: { name: 'employeeType', value: newValue || 'All' } });
                    if (newValue !== 'Contractor') {
                      handleInputChange({ target: { name: 'contractor', value: '' } });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Employee *"
                      name="employeeType"
                      error={!!fieldErrors.employeeType}
                      helperText={fieldErrors.employeeType}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {formData.employeeType === 'Contractor' && (
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={contractList}
                    getOptionLabel={(option) => option.contractor || ''}
                    sx={{ width: '100%' }}
                    size="small"
                    value={contractList.find((c) => c.contractor === formData.contractor) || null}
                    onChange={(event, newValue) => {
                      handleInputChange({
                        target: {
                          name: 'contractor',
                          value: newValue ? newValue.contractor : ''
                        }
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Contractor *"
                        name="contractor"
                        error={!!fieldErrors.contractor}
                        helperText={fieldErrors.contractor}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: 40 }
                        }}
                      />
                    )}
                  />
                </div>
              )}
              <div className="col-md-1 mb-1">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>

              <div className="col-md-1 mb-1">
                <Tooltip title="Add">
                  <Button
                    variant="contained"
                    onClick={getReportingPerson}
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

            <div className="row">
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      <div className="row mt-2">
                        <div className="col-md-8">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <Typography variant="subtitle1">Total Records: {filteredData.length}</Typography>
                          </div>
                          <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
                            <TableContainer component={Paper}>
                              <Table size="small" stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      sx={{
                                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                                        color: 'white',
                                        position: 'sticky',
                                        top: 0
                                      }}
                                    >
                                      <strong>Code</strong>
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                                        color: 'white',
                                        position: 'sticky',
                                        top: 0
                                      }}
                                    >
                                      <strong>Name</strong>
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                                        color: 'white',
                                        position: 'sticky',
                                        top: 0
                                      }}
                                    >
                                      <strong>Department</strong>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {filteredData.length > 0 ? (
                                    filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                      <TableRow key={row.employeeCode || index} hover>
                                        <TableCell sx={{ py: 1, px: 1 }}>{row.employeeCode}</TableCell>
                                        <TableCell sx={{ py: 1, px: 1 }}>{row.employee}</TableCell>
                                        <TableCell sx={{ py: 1, px: 1 }}>{row.department}</TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                        No data available
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </div>
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
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          Select Employees
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total: {filteredGroupMaster.length} | Selected: {selectedRows.length}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            sx={{
              width: '250px',
              mb: 2
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                      color: 'white',
                      position: 'sticky',
                      top: 0
                    }}
                  >
                    <Checkbox
                      indeterminate={selectedRows.length > 0 && selectedRows.length < filteredGroupMaster.length}
                      checked={filteredGroupMaster.length > 0 && selectedRows.length === filteredGroupMaster.length}
                      onChange={handleSelectAllClick}
                      sx={{ color: 'white' }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                      color: 'white',
                      position: 'sticky',
                      top: 0
                    }}
                  >
                    <strong>Code</strong>
                  </TableCell>
                  <TableCell
                    sx={{
                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                      color: 'white',
                      position: 'sticky',
                      top: 0
                    }}
                  >
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell
                    sx={{
                      background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                      color: 'white',
                      position: 'sticky',
                      top: 0
                    }}
                  >
                    <strong>Department</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGroupMaster.length > 0 ? (
                  filteredGroupMaster.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const isItemSelected = isSelected(row.employeeCode);
                    return (
                      <TableRow
                        key={row.employeeCode}
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={() => handleClick(row.employeeCode)} />
                        </TableCell>
                        <TableCell>{row.employeeCode}</TableCell>
                        <TableCell>{row.employeeName}</TableCell>
                        <TableCell>{row.department}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredGroupMaster.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredGroupMaster.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddSelected} disabled={selectedRows.length === 0 || filteredGroupMaster.length === 0}>
            Add Selected ({selectedRows.length})
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </>
  );
};

export default GroupMaster;