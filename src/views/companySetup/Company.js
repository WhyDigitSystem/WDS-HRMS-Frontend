import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import {
  Avatar,
  Typography,
  FormHelperText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Autocomplete
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveCitiesByState, getAllActiveCountries, getAllActiveStatesByCountry, getAllActiveCurrency } from 'utils/CommonFunctions';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// import LocationPicker from 'views/basicMaster/LocationPicker';

const Company = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [editId, setEditId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [weekOffRows, setWeekOffRows] = useState([
    { weekOff: '', weekNumbers: [], designation: [] }
  ]);

  const handleWeekOffChange = (index, value) => {
    const updated = [...weekOffRows];
    updated[index].weekOff = value;
    setWeekOffRows(updated);
  };

  const handleWeekNumberChange = (index, value) => {
    const updated = [...weekOffRows];
    updated[index].weekNumbers = value;
    setWeekOffRows(updated);
  };

  const handleAddRow = () => {
    setWeekOffRows([
      ...weekOffRows,
      { weekOff: '', weekNumbers: [], designation: [] }
    ]);
  };

  const handleDesignationChange = (index, value) => {
    const updated = [...weekOffRows];

    const newValue = value.includes('ALL') ? ['ALL'] : value;

    updated[index].designation = newValue;

    setWeekOffRows(updated);
  };

  const handleClearRow = (index) => {
    const updated = [...weekOffRows];
    updated[index] = { weekOff: '', weekNumbers: [], designation: [] };
    setWeekOffRows(updated);
  };

  const handleDeleteRow = (index) => {
    const updated = [...weekOffRows];
    updated.splice(index, 1);
    setWeekOffRows(updated);
  };

  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
    ceo: '',
    address: '',
    designation: '',
    currency: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gstIn: '',
    panNo: '',
    leaveCreditControl: '',
    autoCreditDate: null,
    leavePolicy: '',
    attendanceMode: [],
    overTime: '',
    separation: [],
    otType: '',
    otPolicy: '',
    weekOff: [],
    shiftIn: null,
    shiftOut: null,
    gstRegistered: true,
    monthlyAttendanceMail: true,
    permissionRequest: true,
    active: true,
    latitude: null,
    longitude: null,
    locationAddress: '',
    hybrid: false,
    shiftHours: '',
    otEligibleHours: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    companyCode: '',
    ceo: '',
    address: '',
    currency: '',
    country: '',
    designation: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gstIn: '',
    panNo: '',
    leaveCreditControl: '',
    autoCreditDate: null,
    leavePolicy: '',
    attendanceMode: '',
    overTime: '',
    separation: '',
    otType: '',
    otPolicy: '',
    weekOff: '',
    shiftIn: null,
    shiftOut: null,
    gstRegistered: true,
    monthlyAttendanceMail: true,
    permissionRequest: true,
    active: true,
    latitude: null,
    longitude: null,
    locationAddress: '',
    shiftHours: '',
    otEligibleHours: ''
  });

  const [tempWeekOff, setTempWeekOff] = useState(formData.weekOff || []);

  const handleOpenDialog = () => {
    setTempWeekOff(formData.weekOff || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveDialog = () => {
    setFormData((prev) => ({ ...prev, weekOff: tempWeekOff }));
    setOpenDialog(false);
  };

  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'companyCode', header: 'Company Code', size: 140 },
    {
      accessorKey: 'companyName',
      header: 'Company',
      size: 140
    },
    {
      accessorKey: 'ceo',
      header: 'CEO',
      size: 140
    },
    {
      accessorKey: 'gstIn',
      header: 'GST',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllCountries();
    getCompanyDetails();
    getAllCurrency();
    getAllDesignation();
  }, []); // Run only once on mount

  useEffect(() => {
    if (formData.country) {
      getAllStates(); // Fetch states only when country changes
    }
  }, [formData.country]); // Only depend on country change

  useEffect(() => {
    if (formData.state) {
      getAllCities(); // Fetch cities only when state changes
    }
  }, [formData.state]); // Only depend on state change

  const getAllCurrency = async () => {
    try {
      const currencyData = await getAllActiveCurrency(orgId);
      setCurrencyList(currencyData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCountries = async () => {
    try {
      const countryData = await getAllActiveCountries(orgId);
      setCountryList(countryData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllStates = async () => {
    try {
      const stateData = await getAllActiveStatesByCountry(formData.country, orgId);
      setStateList(stateData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCities = async () => {
    try {
      const cityData = await getAllActiveCitiesByState(formData.state, orgId);
      setCityList(cityData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllDesignation = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/getDesignationByOrgId?orgid=${orgId}`);
      setDesignationData(result.paramObjectsMap.designationVO.reverse());
    } catch (err) {
      console.log('error', err);
      showToast('error', 'Error fetching designation list');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    const nameRegex = /^[A-Za-z ]*$/;
    const numericRegex = /^[0-9]*$/;

    let error = '';

    // Convert GSTIN to uppercase early (important)
    let updatedValue = value;

    // =========================
    // CEO validation
    // =========================
    if (name === 'ceo') {
      if (!nameRegex.test(value)) {
        error = 'Only alphabetic characters are allowed';
      }
    }

    // =========================
    // Pincode validation
    // =========================
    if (name === 'pincode') {
      if (!numericRegex.test(value)) {
        error = 'Only numeric characters are allowed';
      } else if (value.length > 6) {
        error = 'Only 6 digits are allowed';
      }
    }

    // =========================
    // Mobile validation
    // =========================
    if (name === 'mobileNo') {
      if (!numericRegex.test(value)) {
        error = 'Only numeric characters are allowed';
      } else if (value.length > 10) {
        error = 'Only 10 digits are allowed';
      }
    }

    // =========================
    // GSTIN validation (NEW)
    // =========================
    if (name === 'gstIn') {
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

      updatedValue = value.toUpperCase();

      if (updatedValue.length > 15) {
        error = 'GSTIN must be 15 characters';
      } else if (updatedValue && !gstinRegex.test(updatedValue)) {
        error = 'Invalid GSTIN format';
      }
    }

    // =========================
    // Update errors
    // =========================
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error
    }));



    if (name === 'country') {
      const selectedCountry = value;

      const matchedCurrency = currencyList.find(
        (item) => item.country === selectedCountry
      );

      setFormData((prev) => ({
        ...prev,
        country: selectedCountry,
        currency: matchedCurrency ? matchedCurrency.currency : ''
      }));

      return; // stop further execution
    }



    // =========================
    // Checkbox handling
    // =========================
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
      }));
      return;
    }




    // =========================
    // Country → Auto Currency Mapping (case-safe)
    // =========================
    if (name === 'country') {
      const selectedCountry = value.toUpperCase();

      const matchedCurrency = currencyList.find(
        (item) => item.country?.toUpperCase() === selectedCountry
      );

      setFormData((prev) => ({
        ...prev,
        country: selectedCountry,
        currency: matchedCurrency?.currency || ''
      }));

      return;
    }
    // =========================
    // Normal input handling
    // =========================
    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue
    }));
  };

  const getCompanyById = async (row) => {
    console.log('THE SELECTED BRANCH ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `commonmaster/company/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCompany = response.paramObjectsMap.companyVO[0];

        const createdDate =
          particularCompany?.commonDate?.createdon
            ? dayjs(particularCompany.commonDate.createdon, 'DD-MM-YYYY hh:mm:ss A')
            : null;

        if (createdDate) {
          localStorage.setItem(
            'companyCreatedDate',
            createdDate.format('YYYY-MM-DD')
          );
        }

        console.log('PARTICULAR COMPANY IS:', particularCompany);

        console.log('PARTICULAR COMPANY IS:', particularCompany);
        setLogo(response.paramObjectsMap.companyVO[0].companyLogo);
        // Extract weekOffDays as an array
        // const weekOffDays = particularCompany.companyWeekOffVO ? particularCompany.companyWeekOffVO.map((item) => item.weekOffDays) : [];

        // Map API week off data into weekOffRows state format
        const weekOffDataFromApi =
          particularCompany.companyWeekOffVO?.map((item) => ({
            weekOff: item.weekOffDays || '',
            weekNumbers: item.weekNumbers || [],
            designation: item.type
              ? item.type.split(',').map((d) => d.trim())
              : []
          })) || [];

        setWeekOffRows(weekOffDataFromApi);

        setFormData({
          companyCode: particularCompany.companyCode,
          companyName: particularCompany.companyName,
          ceo: particularCompany.ceo,
          address: particularCompany.address,
          country: particularCompany.country,
          currency: particularCompany.currency,
          state: particularCompany.state,
          city: particularCompany.city,
          pincode: particularCompany.zip,
          mobileNo: particularCompany.phone,
          gstIn: particularCompany.gstIn,
          panNo: particularCompany.panNo,
          leaveCreditControl: particularCompany.leaveCreditControl,
          // autoCreditDate: particularCompany.autoCreditDate,
          autoCreditDate: particularCompany.autoCreditDate
            ? dayjs(particularCompany.autoCreditDate) // Convert to Dayjs object
            : null,
          leavePolicy: particularCompany.leavePolicy,
          // attendanceMode: particularCompany.attendanceMode,
          attendanceMode: particularCompany.attendanceMode ? particularCompany.attendanceMode.split(',').map((item) => item.trim()) : [],
          overTime: particularCompany.otFlag,
          separation: particularCompany.separation
            ? particularCompany.separation.split(',').map((item) => item.trim())
            : [],
          otType: particularCompany.otType,
          otPolicy: particularCompany.otPolicy,
          gstRegistered: particularCompany.gstregistered === 'Active',
          monthlyAttendanceMail: particularCompany.monthlyAttendanceMail,
          permissionRequest: particularCompany.permissionRequest,
          active: particularCompany.active === 'Active',
          // weekOff: weekOffDays,
          // shiftIn: particularCompany.shiftIn || null,
          // shiftOut: particularCompany.shiftOut || null,
          latitude: particularCompany.latitude || 0,
          longitude: particularCompany.longitude || 0,
          locationAddress: particularCompany.locationAddress || '',
          shiftHours: particularCompany.shiftHours || '',
          otEligibleHours: particularCompany.otEligibleHours || '',
          hybrid: particularCompany.hybrid === true // if it's already a boolean
        });

        // console.log('WEEK OFF DAYS:', weekOffDays);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        const companyList = response.paramObjectsMap.companyVO;
        setListViewData(companyList);

        console.log('THE LISTVIEW COMPANY IS:', companyList);

        // Check if orgId exists and matches any company's id
        const matchedCompany = companyList.find((company) => company.id === parseInt(orgId));

        if (matchedCompany) {
          console.log('MATCHED COMPANY ID FOUND:', matchedCompany.id);
          await getCompanyById({ original: { id: matchedCompany.id } }); // Call getCompanyById if match is found
        } else {
          console.log('No matching company found for the given orgId.');
        }
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleClear = () => {
    setFormData({
      // companyCode: '',
      companyCode: formData.companyCode,
      companyName: formData.companyName,
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gstIn: '',
      panNo: '',
      leaveCreditControl: '',
      autoCreditDate: null,
      leavePolicy: '',
      attendanceMode: '',
      overTime: '',
      separation: [],
      otType: '',
      otPolicy: '',
      weekOff: '',
      shiftIn: null,
      shiftOut: null,
      gstRegistered: true,
      monthlyAttendanceMail: true,
      permissionRequest: true,
      active: true,
      latitude: null,
      longitude: null,
      locationAddress: '',
      hybrid: false,
      shiftHours: '',
      otEligibleHours: ''
    });
    setFieldErrors({
      // companyCode: '',
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gstIn: '',
      panNo: '',
      leaveCreditControl: '',
      autoCreditDate: null,
      leavePolicy: '',
      attendanceMode: '',
      overTime: '',
      separation: '',
      otType: '',
      otPolicy: '',
      weekOff: '',
      shiftIn: null,
      shiftOut: null,
      gstRegistered: true,
      monthlyAttendanceMail: true,
      permissionRequest: true,
      active: true,
      latitude: null,
      longitude: null,
      locationAddress: '',
      shiftHours: '',
      otEligibleHours: ''
    });
    setEditId('');
    getCompanyDetails();
  };

  const getCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCg2Peu6mH9J6uKh3mvTVvXp4EAeKFIgKU`
        );
        const data = await response.json();
        const address = data.results[0]?.formatted_address || '';

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          locationAddress: address
        }));

        console.log('📍 LOCATION SET:', lat, lng, address);

        // ✅ Show success toast here
        showToast('success', 'Location fetched successfully');
      },
      (error) => {
        console.error('Geolocation error:', error);
        showToast('error', 'Unable to fetch location. Please enable location services.');
      }
    );
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.ceo) {
      errors.ceo = 'CEO is required';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    // if (!formData.mobileNo) {
    //   errors.mobileNo = 'Mobile No is required';
    // } else if (formData.mobileNo.length < 10) {
    //   errors.mobileNo = 'Invalid mobileNo No';
    // }
    if (formData.pincode.length < 6 && formData.pincode.length >= 1) {
      errors.pincode = 'Invalid Pincode';
    }

    const isInvalidWeekOff = weekOffRows.some((row) => !row.weekOff || row.weekNumbers.length === 0);
    if (isInvalidWeekOff) {
      showToast('error', 'Please fill all week off rows before saving');
      return;
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        // id: parseInt(orgId),
        active: formData.active,
        address: formData.address,
        cancel: true,
        ceo: formData.ceo,
        city: formData.city,
        companyCode: formData.companyCode,
        companyName: formData.companyName,
        // companyWeekOffDTO: formData.weekOff?.map((day) => ({ weekOffDays: day })) || [],
        companyWeekOffDTO: weekOffRows
          .filter((row) => row.weekOff && row.weekNumbers.length > 0)
          .map((row) => ({
            weekOffDays: row.weekOff,
            weekNumbers: row.weekNumbers.includes(-1) ? [-1] : row.weekNumbers,
            type: row.designation.includes('ALL')
              ? ['ALL']
              : row.designation
          })),
        country: formData.country,
        createdBy: loginUserName,
        currency: formData.currency,
        gstIn: formData.gstIn,
        gstRegistered: formData.gstRegistered,
        monthlyAttendanceMail: formData.monthlyAttendanceMail,
        permissionRequest: formData.permissionRequest,
        leaveCreditControl: formData.leaveCreditControl,
        // autoCreditDate: formData.autoCreditDate,
        autoCreditDate: formData.autoCreditDate
          ? dayjs(formData.autoCreditDate).format('YYYY-MM-DD') // Convert to YYYY-MM-DD
          : null,
        leavePolicy: formData.leavePolicy,
        attendanceMode: formData.attendanceMode,
        separation: formData.separation,
        otFlag: formData.overTime,
        otType: formData.otType,
        otPolicy: formData.otPolicy,
        panNo: formData.panNo,
        phone: formData.mobileNo,
        state: formData.state,
        zip: formData.pincode,
        // shiftIn: formData.shiftIn,
        // shiftOut: formData.shiftOut,
        locationAddress: formData.locationAddress,
        shiftHours: formData.shiftHours,
        otEligibleHours: formData.otEligibleHours,
        latitude: formData.latitude,
        longitude: formData.longitude,
        hybrid: formData.hybrid
      };
      console.log('THE SAVE FORM DATA IS:', saveFormData);

      try {
        const response = await apiCalls('put', `commonmaster/updateCompany`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', 'Company updated Successfully');
          const generatedId = response.paramObjectsMap.CompanyVO.id;
          console.log('save', typeof logo);
          if (generatedId && typeof logo === 'object') {
            console.log('Generated ID:', generatedId);
            console.log('Uploaded Item', logo);
            handleFileUpload(generatedId);
          } else {
            console.log('handle Img Upload failed');
          }
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Company updation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Company updation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };
  const [logo, setLogo] = useState(null);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };
  const handleFileUpload = async (generatedId) => {
    if (!generatedId) {
      console.warn('Generated ID is missing');
      showToast('error', 'Generated ID is required');
      return;
    }
    const formData = new FormData();
    formData.append('file', logo);
    try {
      const response = await apiCalls(
        'post',
        `/commonmaster/uploadCompanyLogoInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      console.log('Img Upload Response:', response);

      if (response.status === true) {
        showToast('success', response.message || 'Image Uploaded successfully!');
        window.location.reload();
      } else {
        console.warn('Img upload failed:', response);
        showToast('error', 'Img upload failed');
      }
    } catch (error) {
      console.error('Img Upload Error:', error);
      showToast('error', 'Failed to upload Img');
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

  const handleDateChange = (field, newValue) => {
    if (newValue.isValid()) {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue
      }));
    }
  };

  const handleTimeChange = (fieldName, newValue) => {
    if (!newValue) return;

    const timeFormat = 'HH:mm';
    const newTime = dayjs(newValue).format(timeFormat);

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newTime
    }));
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} /> */}
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              enableEditing={true}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getCompanyById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Company Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="companyName"
                  value={formData.companyName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleInputChange}
                  // error={!!fieldErrors.companyCode}
                  // helperText={fieldErrors.companyCode}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="CEO"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="ceo"
                  value={formData.ceo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.ceo}
                  helperText={fieldErrors.ceo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="address"
                  multiline
                  value={formData.address}
                  onChange={handleInputChange}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.country}>
                  <InputLabel id="country">Country</InputLabel>
                  <Select labelId="country" label="Country" name="country" value={formData.country} onChange={handleInputChange}>
                    {countryList?.map((row) => (
                      <MenuItem key={row.id} value={row.countryName.toUpperCase()}>
                        {row.countryName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="state">State</InputLabel>
                  <Select labelId="state" label="State" name="state" value={formData.state} onChange={handleInputChange}>
                    {stateList?.map((row) => (
                      <MenuItem key={row.id} value={row.stateName}>
                        {row.stateName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.state && <FormHelperText>{fieldErrors.state}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.city}>
                  <InputLabel id="city">City</InputLabel>
                  <Select labelId="city" label="City" name="city" value={formData.city} onChange={handleInputChange}>
                    {cityList?.map((row) => (
                      <MenuItem key={row.id} value={row.cityName}>
                        {row.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city && <FormHelperText>{fieldErrors.city}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.currency}>
                  <InputLabel id="currency-label">Currency</InputLabel>
                  <Select labelId="currency-label" label="currency" value={formData.currency} onChange={handleInputChange} name="currency">
                    {currencyList?.map((row) => (
                      <MenuItem key={row.id} value={row.currency}>
                        {row.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.currency && <FormHelperText>{fieldErrors.currency}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Pincode"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="pincode"
                  value={formData.pincode}
                  maxLength={6}
                  onChange={handleInputChange}
                  error={!!fieldErrors.pincode}
                  helperText={fieldErrors.pincode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Mobile No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.mobileNo}
                  helperText={fieldErrors.mobileNo}
                />

              </div >
              <div className="col-md-3 mb-3">
                <TextField
                  label="GST In"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="gstIn"
                  value={formData.gstIn}
                  onChange={handleInputChange}
                  error={!!fieldErrors.gstIn}
                  helperText={fieldErrors.gstIn}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="PAN No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="panNo"
                  value={formData.panNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.panNo}
                  helperText={fieldErrors.panNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.leaveCreditControl}>
                  <InputLabel id="leaveCreditControl">Leave Credit Control</InputLabel>
                  <Select
                    labelId="leaveCreditControl"
                    id="leaveCreditControl"
                    name="leaveCreditControl"
                    value={formData.leaveCreditControl || ''}
                    onChange={handleInputChange}
                    label="Leave Credit Control" // Add this line
                  >
                    <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                    <MenuItem value="QUARTERLY">QUARTERLY</MenuItem>
                    <MenuItem value="HALF YEARLY">HALF YEARLY</MenuItem>
                    <MenuItem value="YEARLY">YEARLY</MenuItem>
                  </Select>
                  {fieldErrors.leaveCreditControl && <FormHelperText>{fieldErrors.leaveCreditControl}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Auto Credit Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.autoCreditDate}
                      onChange={(newValue) => handleDateChange('autoCreditDate', newValue)}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.leavePolicy}>
                  <InputLabel id="leavePolicy">Leave Policy</InputLabel>
                  <Select
                    labelId="leavePolicy"
                    id="leavePolicy"
                    name="leavePolicy"
                    value={formData.leavePolicy || ''}
                    onChange={handleInputChange}
                    label="Leave Policy" // Add this line
                  >
                    <MenuItem value="REGULAR">REGULAR</MenuItem>
                    <MenuItem value="SANDWICH ">SANDWICH</MenuItem>
                  </Select>
                  {fieldErrors.leavePolicy && <FormHelperText>{fieldErrors.leavePolicy}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.attendanceMode}>
                  <InputLabel id="attendanceMode">Attendance Mode</InputLabel>
                  <Select
                    labelId="attendanceMode"
                    id="attendanceMode"
                    name="attendanceMode"
                    label="Attendance Mode"
                    multiple
                    value={Array.isArray(formData.attendanceMode) ? formData.attendanceMode : []} // ✅ Always pass array
                    onChange={handleInputChange}
                    renderValue={(selected) => (Array.isArray(selected) ? selected.join(', ') : '')}
                  >
                    <MenuItem value="Files">Files</MenuItem>
                    <MenuItem value="System">System</MenuItem>
                    <MenuItem value="Biometric">Biometric</MenuItem>
                  </Select>
                  {fieldErrors.attendanceMode && <FormHelperText>{fieldErrors.attendanceMode}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  multiple
                  size="small"
                  options={designationData.map((d) => d.designationName)}
                  value={Array.isArray(formData.separation) ? formData.separation : []}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      separation: newValue
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Separation"
                      error={!!fieldErrors.separation}
                      helperText={fieldErrors.separation}
                    />
                  )}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.overTime}>
                  <InputLabel id="overTime">OverTime</InputLabel>
                  <Select
                    labelId="overTime"
                    id="overTime"
                    name="overTime"
                    label="OverTime"
                    value={formData.overTime}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="YES">YES</MenuItem>
                    <MenuItem value="NO">NO</MenuItem>
                  </Select>
                  {fieldErrors.overTime && <FormHelperText>{fieldErrors.overTime}</FormHelperText>}
                </FormControl>
              </div>

              {formData.overTime === 'YES' && (
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.otType}>
                    <InputLabel id="otType">OT Type</InputLabel>
                    <Select labelId="otType" id="otType" name="otType" label="OT Type" value={formData.otType} onChange={handleInputChange}>
                      <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                      <MenuItem value="CONTRACT">CONTRACT</MenuItem>
                      <MenuItem value="ALL">ALL</MenuItem>
                    </Select>
                    {fieldErrors.otType && <FormHelperText>{fieldErrors.otType}</FormHelperText>}
                  </FormControl>
                </div>
              )}

              {formData.overTime === 'YES' && (
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.otPolicy}>
                    <InputLabel id="otPolicy">OT Policy</InputLabel>
                    <Select
                      labelId="otPolicy"
                      id="otPolicy"
                      name="otPolicy"
                      label="OT Policy"
                      value={formData.otPolicy}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="Hourly">Hourly</MenuItem>
                      <MenuItem value="Slab">Slab</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                    {fieldErrors.otPolicy && <FormHelperText>{fieldErrors.otPolicy}</FormHelperText>}
                  </FormControl>
                </div>
              )}
              {formData.otPolicy === 'Others' && (
                <>
                  <div className="col-md-3 mb-3">
                    <TextField
                      label="Shift Hours"
                      variant="outlined"
                      size="small"
                      fullWidth
                      name="shiftHours"
                      value={formData.shiftHours}
                      onChange={handleInputChange}
                      error={!!fieldErrors.shiftHours}
                      helperText={fieldErrors.shiftHours}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <TextField
                      label="OT Hours"
                      variant="outlined"
                      size="small"
                      fullWidth
                      name="otEligibleHours"
                      value={formData.otEligibleHours}
                      onChange={handleInputChange}
                      error={!!fieldErrors.otEligibleHours}
                      helperText={fieldErrors.otEligibleHours}
                    />
                  </div>
                </>
              )}
              <div className="col-md-3 mb-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Button variant="outlined" onClick={handleOpenDialog}>
                    Week Off
                  </Button>

                  <div>
                    {weekOffRows.length === 0 ? (
                      <em>No Week Off Selected</em>
                    ) : (
                      weekOffRows.map((row, idx) => (
                        <div key={idx} style={{ fontSize: '0.875rem', color: '#555' }}>
                          <strong>{row.weekOff || 'Select Day'}</strong> :{' '}
                          {row.weekNumbers.includes(-1) ? 'All Weeks' : row.weekNumbers.join(', ')}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Shift In"
                      value={formData.shiftIn ? dayjs(formData.shiftIn, 'HH:mm') : null}
                      onChange={(newValue) => handleTimeChange('shiftIn', newValue)}
                      ampm={false} // 24-hour format
                      slots={{
                        openPickerIcon: AccessTimeIcon
                      }}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div> */}
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Shift Out"
                      value={formData.shiftOut ? dayjs(formData.shiftOut, 'HH:mm') : null}
                      onChange={(newValue) => handleTimeChange('shiftOut', newValue)}
                      ampm={false}
                      disabled={!formData.shiftIn}
                      minTime={formData.shiftIn ? dayjs(formData.shiftIn, 'HH:mm') : undefined}
                      slots={{
                        openPickerIcon: AccessTimeIcon
                      }}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    multiline
                    startIcon={<CloudUploadIcon />}
                    sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
                  >
                    {/* {logo ? logo.name === '' ? "Logo" : logo.name : 'Upload Logo'} */}
                    {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Logo') : 'Upload Logo'}

                    <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
                  </Button>

                  {logo && (
                    <IconButton variant="contained" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }} onClick={handleOpen}>
                      <ControlCameraIcon />
                    </IconButton>
                  )}
                </Box>
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                  <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h5" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }}>
                      Company Logo
                    </Typography>
                    {logo ? (
                      <Box>
                        <Avatar
                          src={typeof logo === 'object' ? URL.createObjectURL(logo) : `data:image/jpeg;base64,${logo}`}
                          alt="Company Logo"
                          sx={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', borderRadius: 2 }}
                        />
                        <Box display="flex" gap={2} mt={2}>
                          {/* <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleRemoveLogo}
                          >
                            Delete
                          </IconButton> */}
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Avatar sx={{ width: 150, height: 150, bgcolor: '#F0F0F0', borderRadius: 2 }}>
                          <Typography variant="caption">Upload Logo</Typography>
                        </Avatar>
                        <Box display="flex" gap={2} mt={2}>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '15px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.gstRegistered} onChange={handleInputChange} name="gstRegistered" />}
                  label="Gst Registered"
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.monthlyAttendanceMail} onChange={handleInputChange} name="monthlyAttendanceMail" />}
                  label="Monthly Attendance Mail"
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.permissionRequest} onChange={handleInputChange} name="permissionRequest" />}
                  label="Permission Request"
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hybrid}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hybrid: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Hybrid (Work from Office + Home)"
                />
              </div>
              <div className="col-md-3 mb-3">
                <Button onClick={getCurrentLocation}>Detect Location</Button>
              </div>
            </div>
          </>
        )}
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="lg">
        <DialogTitle>Select Week Off Days</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Week Off</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Week Numbers</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {weekOffRows.map((row, index) => (
                <TableRow key={index}>

                  {/* Week Off */}
                  <TableCell sx={{ width: '25%' }}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={row.weekOff}
                        onChange={(e) => handleWeekOffChange(index, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Select Day</em>
                        </MenuItem>
                        {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
                          <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>

                  {/* Week Numbers */}
                  <TableCell sx={{ width: '25%' }}>
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={row.weekNumbers}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updated = value.includes(-1) ? [-1] : value;
                          handleWeekNumberChange(index, updated);
                        }}
                        renderValue={(selected) =>
                          selected.includes(-1) ? 'All' : selected.join(', ')
                        }
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                        <MenuItem value={-1}>All</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>

                  {/* Designation */}
                  <TableCell sx={{ width: '25%' }}>
                    <Autocomplete
                      multiple
                      size="small"
                      options={['ALL', ...designationData.map((d) => d.designationName)]}
                      value={Array.isArray(row.designation) ? row.designation : []}
                      onChange={(event, newValue) => {
                        const value = newValue.includes('ALL') ? ['ALL'] : newValue;
                        handleDesignationChange(index, value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Designation"
                          placeholder="Select Designation"
                        />
                      )}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell sx={{ width: '25%' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleClearRow(index)}
                      sx={{ mr: 1 }}
                    >
                      Clear
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteRow(index)}
                    >
                      Delete
                    </Button>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add New Row Button */}
          <Box mt={2}>
            <Button variant="outlined" onClick={handleAddRow}>
              Add
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDialog} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ToastComponent />
    </>
  );
};

export default Company;