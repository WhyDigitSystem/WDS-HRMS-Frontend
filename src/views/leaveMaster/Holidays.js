import ClearIcon from '@mui/icons-material/Clear';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import { Autocomplete, Avatar, Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import sampleFileDownload from '../../../src/assets/sample-files/Holiday_List.xlsx';

const Holidays = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [department, setDepartment] = useState(localStorage.getItem('department'));
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [formData, setFormData] = useState({
    holidayDate: '',
    day: '',
    festival: '',
    branchName: '',
    holidaysImage: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    holidayDate: '',
    day: '',
    festival: '',
    branchName: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'holidayDate', header: 'Date', size: 140 }, // Check correct field name
    { accessorKey: 'day', header: 'Day', size: 140 },
    { accessorKey: 'festival', header: 'Festival', size: 140 }
    // { accessorKey: 'holidaysImage', header: 'Holidays Image', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllHolidayByOrgId();
    getAllBranches();
  }, []);

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  // List API
  const getAllHolidayByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);

      if (response.status === true) {
        const formattedData = response.paramObjectsMap.holidayVO.map((holiday) => ({
          ...holiday,
          holidayDate: holiday.holidayDate ? dayjs(holiday.holidayDate).format('YYYY-MM-DD') : ''
        }));

        setListViewData(formattedData);
        setLogo(response.paramObjectsMap.companyVO[0].holidaysImage);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Edit API
  const getHolidayById = async (row) => {
    console.log('THE SELECTED HOLIDAY ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/basicmaster/getHolidayById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const holidayDetails = response.paramObjectsMap.holidayVO;
        console.log('HOLIDAY DETAILS:', holidayDetails);

        setFormData({
          holidayDate: holidayDetails.holidayDate ? dayjs(holidayDetails.holidayDate).format('YYYY-MM-DD') : '', // Ensure correct format
          day: holidayDetails.day,
          festival: holidayDetails.festival,
          branchName: holidayDetails.branchName,
          holidaysImage: holidayDetails.holidaysImage
        });
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
    setFormData((prevData) => ({ ...prevData, [name]: value.toUpperCase() }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));

    let errorMessage = '';

    if (name === 'employeeName' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    } else if (name === 'employeeCode' && !codeRegex.test(value)) {
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

  const handleClear = () => {
    setFormData({
      holidayDate: '',
      day: '',
      festival: '',
      branchName: '',
      holidaysImage: ''
    });
    setFieldErrors({
      holidayDate: '',
      day: '',
      festival: '',
      branchName: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.branchName) {
      errors.branchName = 'Branch Name is required';
    }
    if (!formData.holidayDate) {
      errors.holidayDate = 'Holiday Date is required';
    }
    if (!formData.day) {
      errors.day = 'Day is required';
    }
    if (!formData.festival) {
      errors.festival = 'Festival is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      let holidaysImage = formData.holidaysImage;

      const saveData = {
        ...(editId && { id: editId }),
        // active: formData.active,
        branchName: formData.branchName,
        department: department,
        branchCode: branchCode,
        holidayDate: formData.holidayDate, // Fix: Ensure correct field name
        createdBy: loginUserName,
        day: formData.day,
        festival: formData.festival,
        orgId: orgId
      };

      console.log('DATA TO SAVE IS:', saveData);

      // save API
      try {
        const response = await apiCalls('put', '/basicmaster/createUpdateHolidays', saveData);

        if (response.status === true) {
          const generatedId = response.paramObjectsMap.holidayVO.id;

          if (generatedId && formData.logo && typeof formData.logo === 'object') {
            await handleFileUpload(generatedId, formData.logo);
          }
          console.log('Response:', response);
          showToast('success', editId ? ' Holidays Updated Successfully' : 'Holidays created successfully');
          handleClear();
          getAllHolidayByOrgId();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Holidays creation failed');
          setIsLoading(false);
        }

        setFormData({ day: '', festival: '', branchName: '', holidaysImage: '' });
        setLogo(null);
        setEditId('');
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Company creation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  // const [logo, setLogo] = useState(null);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setFormData((prev) => ({ ...prev, logo: file })); // UPDATED: Set logo in formData
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };

  const handleRemoveImage = () => {
    setLogo(null);
    setFormData((prev) => ({ ...prev, holidaysImage: '' })); // Reset the form data's image URL to empty
  };

  const handleFileUpload = async (generatedId, logoFile) => {
    // ADDED: logoFile parameter
    if (!generatedId) {
      showToast('error', 'Generated ID is required');
      return;
    }

    const formData = new FormData();
    formData.append('file', logoFile); // UPDATED: Use passed logoFile

    try {
      const response = await apiCalls(
        'post',
        `/basicmaster/uploadHolidayImageInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );

      if (response.status === true) {
        showToast('success', 'Image Uploaded successfully!');
        getAllHolidayByOrgId(); // Refresh data instead of reloading page
      } else {
        showToast('error', 'Image upload failed');
      }
    } catch (error) {
      showToast('error', 'Failed to upload image');
    }
  };

  useEffect(() => {
    return () => {
      if (logo && typeof logo === 'object') {
        URL.revokeObjectURL(logo);
      }
    };
  }, [logo]);

  const handleRemoveLogo = () => setLogo(null);
  const handleView = () => {
    console.log('LIST VIEW DATAS ARE:', listViewData);

    setListView(!listView);
  };

  // const handleView = () => {
  //   setListView(!listView);
  // };

  const handleDateChange = (newValue) => {
    if (!newValue || !dayjs(newValue).isValid()) {
      setFieldErrors((prev) => ({ ...prev, holidayDate: 'Invalid Date' }));
      return;
    }

    const selectedDate = dayjs(newValue);
    const formattedDate = selectedDate.format('YYYY-MM-DD'); // Ensure correct storage format

    setFormData((prev) => ({
      ...prev,
      holidayDate: formattedDate,
      day: selectedDate.format('dddd') // Extract day name correctly
    }));

    setFieldErrors((prev) => ({ ...prev, holidayDate: '' })); // Clear error if valid
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };
  const handleSubmit = async () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
  };

  const handleFilesUpload = (event) => {
    console.log(event.target.files[0]);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-between align-items-baseline" style={{ marginBottom: '20px' }}>
            <div>
              <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
              <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
              <ActionButton title="Upload" icon={UploadIcon} onClick={handleBulkUploadOpen} margin="0 10px 0 10px" />
              {uploadOpen && (
                <CommonBulkUpload
                  open={uploadOpen}
                  handleClose={handleBulkUploadClose}
                  dialogTitle="Upload Files"
                  uploadText="Upload File"
                  onSubmit={handleSubmit}
                  sampleFileDownload={sampleFileDownload}
                  fileName="Sample_Holiday"
                  downloadText="Download File"
                  handleFilesUpload={handleFilesUpload}
                  apiUrl="/basicmaster/excelUploadForHolidays"
                  screen="HolidayReport"
                  loginUser={loginUserName}
                  orgId={orgId}
                />
              )}
            </div>
            {listView && (
              <Box sx={{ color: '#3f51b5', fontSize: '13px', fontWeight: 700 }}>
                {branchList.map((b) => (
                  <p key={b.id}>Branch Name : {b.branch}</p>
                ))}
              </Box>
            )}
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getHolidayById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              {/* Holiday Date  */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.holidayDate ? dayjs(formData.holidayDate, 'YYYY-MM-DD') : null}
                      onChange={handleDateChange}
                    // onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Day */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Day"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  error={!!fieldErrors.day}
                  helperText={fieldErrors.day}
                />
              </div>

              {/* Festival */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Festival"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="festival"
                  value={formData.festival}
                  onChange={handleInputChange}
                  error={!!fieldErrors.festival}
                  helperText={fieldErrors.festival}
                />
              </div>
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={branchList}
                  getOptionLabel={(option) => option.branch || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={branchList.find((c) => c.branch === formData.branchName) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      branchName: newValue ? newValue.branch : ''
                    }));
                    setFieldErrors((prevErrors) => ({
                      ...prevErrors,
                      branchName: ''
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Branch"
                      name="branchName"
                      error={Boolean(fieldErrors.branchName)}
                      helperText={fieldErrors.branchName || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-md-3 mb-3">
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    multiline
                    startIcon={<CloudUploadIcon />}
                    sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
                  >
                    {/* {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Logo👉') : 'Upload Logo'} */}
                    {formData.logo?.name || 'Upload img'}
                    <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
                  </Button>

                  {formData.logo && (
                    <IconButton onClick={handleOpen} sx={{ color: 'rgb(103 58 183)' }}>
                      <ControlCameraIcon />
                    </IconButton>
                  )}
                </Box>
                <Dialog open={open} onClose={handleClose}>
                  <DialogContent>
                    <Typography variant="h5" sx={{ color: 'rgb(103 58 183)' }}>
                      Holiday Image
                    </Typography>
                    {formData.logo ? (
                      <Box mt={2}>
                        <Avatar src={URL.createObjectURL(formData.logo)} alt="Holiday Image" sx={{ width: 200, height: 200 }} />
                      </Box>
                    ) : (
                      <Typography variant="body1" mt={2}>
                        No image uploaded
                      </Typography>
                    )}
                    <DialogActions>
                      <Button onClick={handleClose}>Close</Button>
                    </DialogActions>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Holidays;
