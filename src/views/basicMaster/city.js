import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, ButtonBase, FormHelperText, Tooltip, TextField, Checkbox, FormControlLabel } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from './CommonListViewTable';
import axios from 'axios';
import { useRef, useState, useMemo, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { getAllActiveCountries, getAllActiveStatesByCountry } from 'utils/CommonFunctions';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import COASample from '../../assets/sample-files/COASample.xlsx';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const City = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cityCode: '',
    cityName: '',
    state: '',
    country: 'INDIA',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    cityCode: '',
    cityName: '',
    state: '',
    country: ''
  });
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllCities();
    getAllCountries();
    if (formData.country) {
      getAllStates();
    }
  }, [formData.country]);

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
  const handleExcelFileDownload = () => {
    console.log("Downloading Excel...");  // Debugging step
    console.log("List View Data:", listViewData); // Check if data exists

    if (!listViewData || listViewData.length === 0) {
      showToast('error', 'No data available to download');
      return;
    }

    try {
      const filteredData = listViewData.map(({ cityCode, cityName, state, country, active }) => ({
        'City Code': cityCode,
        'City Name': cityName,
        'State': state,
        'Country': country,
        'Active': (active === true || active === 'Active') ? 'Yes' : 'No'
      }));

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cities');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, 'City_List.xlsx');
      showToast('success', 'Excel file downloaded successfully');
    } catch (error) {
      console.error('Error generating Excel:', error);
      showToast('error', 'Failed to generate Excel');
    }
  };



  const handleBulkUploadClose = () => {
    setUploadOpen(false); // Close dialog
  };

  const handleSubmit = () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handlePDFDownload = async () => {
    setLoading(true);

    if (!listViewData || listViewData.length === 0) {
      showToast('error', 'No city data available to download');
      setLoading(false);
      return;
    }

    try {
      const doc = new jsPDF();
      doc.text('City List', 14, 10);

      const tableColumn = ['City Name', 'State', 'Country', 'Active'];
      const tableRows = [];

      listViewData.forEach(({ cityName, state, country, active }) => {
        tableRows.push([
          cityName,
          state,
          country,
          active === true || active === 'Active' ? 'Yes' : 'No',
        ]);
      });

      autoTable(doc, {  // ✅ Use 'autoTable' function directly with doc
        head: [tableColumn],
        body: tableRows,
        startY: 20
      });

      doc.save('City_List.pdf');
      showToast('success', 'City List PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating City List PDF:', error);
      showToast('error', 'Failed to generate City List PDF');
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'cityCode' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Only AlphaNumerics are Allowed' });
    } else if (name === 'cityCode' && value.length > 3) {
      setFieldErrors({ ...fieldErrors, [name]: 'Max Length is 3' });
    } else if (name === 'cityName' && !nameRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Only Alphabets Allowed' });
    } else if (name === 'cityName' && value.length > 40) {
      setFieldErrors({ ...fieldErrors, [name]: 'Exceeded Max Length' });
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

  const handleClear = () => {
    setFormData({
      cityCode: '',
      cityName: '',
      state: '',
      country: 'INDIA',
      active: true
    });
    setFieldErrors({
      cityCode: '',
      cityName: '',
      state: '',
      country: ''
    });
    setEditId('');
  };

  const getAllCities = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/city?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.cityVO.reverse());
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCityById = async (row) => {
    console.log('THE SELECTED CITY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/city/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCity = response.paramObjectsMap.cityVO;

        setFormData({
          cityCode: particularCity.cityCode,
          cityName: particularCity.cityName,
          country: particularCity.country,
          state: particularCity.state,
          active: particularCity.active === 'Active' ? true : false
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.cityCode) {
      errors.cityCode = 'City Code is required';
    } else if (formData.cityCode.length <= 1) {
      errors.cityCode = 'Min Length is 2';
    }

    if (!formData.cityName) {
      errors.cityName = 'City Name is required';
    } else if (formData.cityName.length <= 2) {
      errors.cityName = 'Min Length is 3';
    }

    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        cityCode: formData.cityCode,
        cityName: formData.cityName,
        state: formData.state,
        country: formData.country,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE', saveData);

      try {
        const response = await apiCalls('post', `commonmaster/createUpdateCity`, saveData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' City Updated Successfully' : 'City created successfully');
          handleClear();
          getAllCities();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'City creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'City creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const listViewColumns = [
    { accessorKey: 'cityCode', header: 'Code', size: 140 },
    { accessorKey: 'cityName', header: 'City', size: 140 },
    { accessorKey: 'state', header: 'State', size: 140 },
    { accessorKey: 'country', header: 'Country', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
            {uploadOpen && (
              <CommonBulkUpload
                open={uploadOpen}
                handleClose={handleBulkUploadClose}
                title="Upload Files"
                uploadText="Upload file"
                downloadText="Sample File"
                onSubmit={handleSubmit}
                sampleFileDownload={COASample}
                handleFileUpload={handleFileUpload}
                apiUrl={`master/excelUploadForGroupLedger`}
                screen="COA"
                loginUser={loginUserName}
                orgId={orgId}
              ></CommonBulkUpload>
            )}
            {/* <ActionButton icon={FaFileExcel} title="Excel Download" onClick={handleExcelFileDownload} />
            <ActionButton icon={FaFilePdf} title="PDF Download" onClick={handlePDFDownload} /> */}
            {listView && (
              <div className='ps-2'>
                <ActionButton icon={FaFileExcel} title="Excel Download" onClick={handleExcelFileDownload} />
                <ActionButton icon={FaFilePdf} title="PDF Download" onClick={handlePDFDownload} />
              </div>
            )}
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getCityById} enableEditing={true} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="cityCode"
                  value={formData.cityCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.cityCode}
                  helperText={fieldErrors.cityCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="cityName"
                  value={formData.cityName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.cityName}
                  helperText={fieldErrors.cityName}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.country}>
                  <InputLabel id="country-label">Country</InputLabel>
                  <Select labelId="country-label" label="Country" value={formData.country} onChange={handleInputChange} name="country">
                    {Array.isArray(countryList) &&
                      countryList?.map((row) => (
                        <MenuItem key={row.id} value={row.countryName}>
                          {row.countryName}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select labelId="state-label" label="State" value={formData.state} onChange={handleInputChange} name="state">
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
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default City;
