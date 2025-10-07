import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField as MuiTextField,
  CircularProgress,
  Typography,
  Tooltip,
  InputAdornment,
  Checkbox
} from '@mui/material';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import UploadIcon from '@mui/icons-material/Upload';
import handleSampleFileSalaryStructure from '../../../src/assets/sample-files/AdvanceUploadSample.xlsx';
import AdvanceCommonBulkUpload from './AdvanceCommonUpload';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const AdvanceUpload = () => {
  const [listViewData, setListViewData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [createdBy, setCreatedBy] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [empList, setEmpList] = useState([]);
  const [isFormCleared, setIsFormCleared] = useState(false);
  const [uploadFile, setUploadFile] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [monthYear, setMonthYear] = useState('');
  const [listViewOpen, setListViewOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  // New states for the second popup (table view)
  const [dataTableOpen, setDataTableOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeCode: '',
    cash: '',
    bank: '',
    orgId: orgId
  });

  const [fieldErrors, setFieldErrors] = useState({
    employeeName: '',
    employeeCode: '',
    cash: '',
    bank: '',
    orgId: orgId
  });

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    let errorMessage = '';

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      let updatedValue = value;

      if (type === 'checkbox') {
        updatedValue = checked;
      } else if (name === 'bank' || name === 'cash') {
        updatedValue = value.replace(/[^0-9]/g, '');
        updatedValue = updatedValue.slice(0, 8);
      }

      setFormData({ ...formData, [name]: updatedValue });
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleSelectChange = async (employeeCode) => {
    if (!employeeCode) {
      handleClear();
      return;
    }

    try {
      setIsFormCleared(false);
      const response = await apiCalls('get', `master/getAllEmployeeByOrgIdAndEmployeeCode?employeeCode=${employeeCode}&orgId=${orgId}`);

      if (response.status === true && response.paramObjectsMap.employeeVO && response.paramObjectsMap.employeeVO.length > 0) {
        const selectedEmp = response.paramObjectsMap.employeeVO[0];

        setFormData((prevData) => ({
          ...prevData,
          employeeCode: selectedEmp.employeeCode || '',
          employeeName: selectedEmp.employeeName || ''
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

  useEffect(() => {
    getAllEmployeeList();
    getAllAdvance();
  }, []);

  const getAllAdvance = async () => {
    try {
      const month = monthYear ? monthYear.getMonth() + 1 : null;
      const year = monthYear ? monthYear.getFullYear() : '';

      const response = await apiCalls('get', `/checkinout/getAllAdvanceUploadByOrgId?orgId=${orgId}&month=${month}&year=${year}`);
      console.log('API Response:', response);
      setListViewData(response.paramObjectsMap.advanceUploadVO || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setListViewData([]);
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

  const handleSave = async () => {
    const errors = {};
    if (!formData.employeeName) {
      errors.employeeName = 'Employee Name is required';
    }
    if (!monthYear) {
      errors.monthYear = 'Month & Year is required';
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const month = monthYear ? monthYear.getMonth() + 1 : null;
      const year = monthYear ? monthYear.getFullYear() : '';

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        bank: parseInt(formData.bank) || 0,
        branch: branch,
        branchCode: branchCode,
        cash: parseInt(formData.cash) || 0,
        createdBy: createdBy,
        employeeCode: formData.employeeCode,
        employeeName: formData.employeeName,
        month,
        year,
        orgId: orgId
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const response = await apiCalls('put', `/checkinout/createUpdateAdvanceExcel`, saveFormData);
        if (response.status === true) {
          showToast('success', editId ? 'Advance Updated Successfully' : 'Advance created successfully');
          handleClear();
          getAllAdvance(); // Refresh the list
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Advance creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Advance creation failed');
      } finally {
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
      bank: '',
      cash: ''
    });
    setFieldErrors({
      employeeCode: false,
      employeeName: false,
      bank: false,
      cash: false
    });
    setMonthYear('');
    setEditId('');
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleSubmit = async () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleView = () => {
    setListViewOpen(true);
  };

  const handleCloseView = () => {
    setListViewOpen(false);
  };

  const handleListViewSubmit = async () => {
    if (!monthYear) {
      showToast('error', 'Please select Month & Year');
      return;
    }

    try {
      setIsDataLoading(true);
      await getAllAdvance(); // ✅ call API with selected monthYear
      setListViewOpen(false); // Close the first popup
      setDataTableOpen(true); // Open the second popup with table
    } catch (error) {
      console.error('Error fetching advance data:', error);
      showToast('error', 'Error fetching advance data');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleCloseDataTable = () => {
    setDataTableOpen(false);
  };

  // Helper functions for the table
  const formatNumberWithCommas = (number) => {
    if (!number) return '0';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows(listViewData.map((item) => item.employeeCode));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (employeeCode) => {
    const selectedIndex = selectedRows.indexOf(employeeCode);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, employeeCode];
    } else {
      newSelected = selectedRows.filter((code) => code !== employeeCode);
    }

    setSelectedRows(newSelected);
  };

  const handlePopupCancel = () => {
    setDataTableOpen(false);
    setSelectedRows([]);
  };

  const handleConfirmSelection = () => {
    // Handle the confirmation logic here
    console.log('Selected rows:', selectedRows);
    setDataTableOpen(false);
    setSelectedRows([]);
    showToast('success', 'Selection confirmed successfully');
  };

  // Filter data based on search term
  const filteredData = listViewData.filter(
    (item) =>
      item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div>
        <ToastComponent />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
            <ActionButton
              title="Upload"
              icon={UploadIcon}
              isLoading={isLoading}
              onClick={() => {
                setUploadFile({
                  title: 'Upload Advance',
                  apiUrl: '/checkinout/uploadAdvanceExcel',
                  sampleFileDownload: handleSampleFileSalaryStructure,
                  sampleFileName: 'Advance Sample File',
                  loginUser: loginUserName
                });
                setUploadOpen(true);
              }}
            />
          </div>

          {uploadOpen && (
            <AdvanceCommonBulkUpload
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
              screen="Advance"
              loginUser={uploadFile.loginUser}
              branch={branch}
              branchCode={branchCode}
              includeCreatedBy={uploadFile.includeCreatedBy}
              orgId={orgId}
              enableMonthYear={true}
            />
          )}

          <>
            <div className="row d-flex ml">
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={empList}
                  getOptionLabel={(option) => (option ? `${option.employeeCode} - ${option.employeeName}` : '')}
                  value={empList.find((emp) => emp.employeeCode === formData.employeeCode) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      handleSelectChange(newValue.employeeCode);
                    } else {
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
                <TextField
                  id="outlined-textarea-zip"
                  label="Bank"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 8 }}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="outlined-textarea"
                  label="Cash"
                  variant="outlined"
                  size="small"
                  name="cash"
                  fullWidth
                  value={formData.cash}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 8 }}
                />
              </div>
              <div className="col-md-3 mb-3">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Month & Year"
                    views={['year', 'month']}
                    format="MMMM yyyy"
                    value={monthYear}
                    size="small"
                    onChange={(newValue) => setMonthYear(newValue)}
                    minDate={new Date(new Date().getFullYear() - 1, 0, 1)} // January of previous year
                    maxDate={new Date(new Date().getFullYear(), 11, 31)} // December of current year
                    shouldDisableYear={(date) => {
                      const year = date.getFullYear();
                      const currentYear = new Date().getFullYear();
                      return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        error: !!fieldErrors.monthYear,
                        helperText: fieldErrors.monthYear
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>
          </>
        </div>

        {/* First Popup - Filter Dialog */}
        <Dialog open={listViewOpen} onClose={handleCloseView} fullWidth maxWidth="sm">
          <DialogTitle>Select Filters</DialogTitle>
          <DialogContent>
            <div className="row d-flex ml">
              <div className="col-md-12 mb-3 mt-2">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Month & Year"
                    views={['year', 'month']}
                    format="MMMM yyyy"
                    value={monthYear}
                    onChange={(newValue) => setMonthYear(newValue)}
                    minDate={new Date(new Date().getFullYear() - 1, 0, 1)} // January of previous year
                    maxDate={new Date(new Date().getFullYear(), 11, 31)} // December of current year
                    shouldDisableYear={(date) => {
                      const year = date.getFullYear();
                      const currentYear = new Date().getFullYear();
                      return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: false
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleListViewSubmit} color="primary" variant="contained" disabled={isDataLoading}>
              {isDataLoading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Second Popup - Data Table Dialog */}
        <Dialog
          open={dataTableOpen}
          onClose={handleCloseDataTable}
          fullWidth
          maxWidth="lg"
          sx={{
            '& .MuiDialog-paper': {
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '80vh'
            }
          }}
        >
          <DialogTitle
            sx={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1000,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              padding: '16px 24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Advance Data</span>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by name or code"
                sx={{ width: '300px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </div>
          </DialogTitle>

          <DialogContent
            sx={{
              padding: 0,
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {isDataLoading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px',
                  flexDirection: 'column'
                }}
              >
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Loading advance data...
                </Typography>
              </div>
            ) : filteredData.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px',
                  flexDirection: 'column'
                }}
              >
                <SearchOffIcon fontSize="large" color="disabled" />
                <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                  No advance data found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm ? 'Try adjusting your search' : 'No data available for selected period'}
                </Typography>
              </div>
            ) : (
              <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        padding="checkbox"
                        sx={{
                          background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)',
                          color: 'white'
                        }}
                      >
                        <Checkbox
                          indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                          checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                          onChange={handleSelectAll}
                          sx={{
                            color: 'white',
                            '&.Mui-checked': {
                              color: 'white'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)', color: 'white' }}>
                        <strong>Code</strong>
                      </TableCell>
                      <TableCell sx={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)', color: 'white' }}>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell sx={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)', color: 'white' }}>
                        <strong>Bank</strong>
                      </TableCell>
                      <TableCell sx={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)', color: 'white' }}>
                        <strong>Cash</strong>
                      </TableCell>
                      <TableCell sx={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)', color: 'white' }}>
                        <strong>Month</strong>
                      </TableCell>
                      <TableCell sx={{ background: 'linear-gradient(193deg, #2a4b4d 30%, #3a6b6d 90%)', color: 'white' }}>
                        <strong>Year</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((advance) => {
                      const isItemSelected = selectedRows.includes(advance.employeeCode);
                      return (
                        <TableRow
                          key={advance.id || advance.employeeCode}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} onChange={() => handleRowSelect(advance.employeeCode)} />
                          </TableCell>
                          <TableCell>{advance.employeeCode}</TableCell>
                          <TableCell>{advance.employeeName}</TableCell>
                          <TableCell>{formatNumberWithCommas(advance.bank)}</TableCell>
                          <TableCell>{formatNumberWithCommas(advance.cash)}</TableCell>
                          <TableCell>{advance.month}</TableCell>
                          <TableCell>{advance.year}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white',
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="body2" color="textSecondary">
              {selectedRows.length} of {filteredData.length} selected
            </Typography>
            <div>
              <Button onClick={handlePopupCancel} color="secondary" sx={{ mr: 1, textAlign: 'center' }}>
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
};

export default AdvanceUpload;
