import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControlLabel, FormHelperText, TextField } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCountries } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import COASample from '../../assets/sample-files/COASample.xlsx';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Currency = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [countryList, setCountryList] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    currency: '',
    currencyDescription: '',
    subCurrency: '',
    country: 'INDIA',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    currency: '',
    currencyDescription: '',
    subCurrency: '',
    country: ''
  });
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllCurrencies();
    getAllCountries();
  }, []);

  const getAllCountries = async () => {
    try {
      const countryData = await getAllActiveCountries(orgId);
      setCountryList(countryData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
  //   const nameRegex = /^[A-Za-z ]*$/;
  //   let errorMessage = '';

  //   switch (name) {
  //     case 'currency':
  //     case 'currencyDescription':
  //     case 'subCurrency':
  //       if (!nameRegex.test(value)) {
  //         errorMessage = 'Only Alphabets Allowed  ';
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  //   if (errorMessage) {
  //     setFieldErrors({ ...fieldErrors, [name]: errorMessage });
  //   } else {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       [name]: name === 'active' ? checked : value.toUpperCase()
  //     }));

  //     setFieldErrors({ ...fieldErrors, [name]: '' });

  //     // Preserve the cursor position for text-based inputs
  //     if (type === 'text' || type === 'textarea') {
  //       setTimeout(() => {
  //         const inputElement = document.getElementsByName(name)[0];
  //         if (inputElement && inputElement.setSelectionRange) {
  //           inputElement.setSelectionRange(selectionStart, selectionEnd);
  //         }
  //       }, 0);
  //     }
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    let errorMessage = '';

    // Define max length for each field
    const maxLengths = {
      currency: 3,
      currencyDescription: 50,
      subCurrency: 20
    };
    switch (name) {
      case 'currency':
      case 'currencyDescription':
      case 'subCurrency':
        if (!nameRegex.test(value)) {
          errorMessage = 'Only Alphabets Allowed';
        } else if (value.length > maxLengths[name]) {
          errorMessage = `Exceeded Max length`;
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: name === 'active' ? checked : value.toUpperCase()
      }));

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

  const handleClear = () => {
    setFormData({
      currency: '',
      currencyDescription: '',
      subCurrency: '',
      country: 'INDIA',
      active: true
    });
    setFieldErrors({
      currency: '',
      currencyDescription: '',
      subCurrency: '',
      country: ''
    });
    setEditId('');
  };

  const handleExcelFileDownload = () => {
    console.log("Downloading Excel...");  // Debugging step
    console.log("List View Data:", listViewData); // Check if data exists

    if (!listViewData || listViewData.length === 0) {
      showToast('error', 'No data available to download');
      return;
    }

    try {
      const filteredData = listViewData.map(({ currency, currencyDescription, country, active }) => ({
        'Currency': currency,
        'Currency Description': currencyDescription,
        'Country': country,
        'Active': (active === true || active === 'Active') ? 'Yes' : 'No'
      }));

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Currencies');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, 'Currency_List.xlsx');
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
      showToast('error', 'No currency data available to download');
      setLoading(false);
      return;
    }

    try {
      const doc = new jsPDF();
      doc.text('Currency List', 14, 10);

      const tableColumn = ['Currency', 'Currency Description', 'Country', 'Active'];
      const tableRows = [];

      listViewData.forEach(({ currency, currencyDescription, country, active }) => {
        tableRows.push([
          currency,
          currencyDescription,
          country,
          active === true || active === 'Active' ? 'Yes' : 'No', // Ensuring Active status is shown correctly
        ]);
      });

      autoTable(doc, {  // ✅ Use 'autoTable' function directly with doc
        head: [tableColumn],
        body: tableRows,
        startY: 20
      });

      doc.save('Currency_List.pdf');
      showToast('success', 'Currency List PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating Currency List PDF:', error);
      showToast('error', 'Failed to generate Currency List PDF');
    }

    setLoading(false);
  };




  const getAllCurrencies = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/currency?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.currencyVO.reverse());
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCurrencyById = async (row) => {
    console.log('THE SELECTED CURRENCY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/currency/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCurrency = response.paramObjectsMap.currencyVO;

        setFormData({
          currency: particularCurrency.currency,
          currencyDescription: particularCurrency.currencyDescription,
          country: particularCurrency.country,
          subCurrency: particularCurrency.subCurrency,
          active: particularCurrency.active === 'Active' ? true : false
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
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    } else if (formData.currency.length <= 2) {
      errors.currency = 'Min Length is 3';
    }

    if (!formData.currencyDescription) {
      errors.currencyDescription = 'Currency Description is required';
    } else if (formData.currencyDescription.length <= 2) {
      errors.currencyDescription = 'Min Length is 3';
    }

    if (formData.subCurrency.length <= 2) {
      errors.subCurrency = 'Min Length is 3';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        currency: formData.currency,
        currencyDescription: formData.currencyDescription,
        subCurrency: formData.subCurrency ? formData.subCurrency : null,
        country: formData.country,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE', saveData);

      try {
        const response = await apiCalls('put', `commonmaster/createUpdateCurrency`, saveData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Currency Updated Successfully' : 'Currency Created Successfully');
          handleClear();
          getAllCurrencies();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Currency Creation Failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Currency Creation Failed');
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
    { accessorKey: 'currency', header: 'Currency', size: 140 },
    { accessorKey: 'currencyDescription', header: 'Currency Description', size: 250 },
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getCurrencyById} enableEditing={true} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Currency"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  error={!!fieldErrors.currency}
                  helperText={fieldErrors.currency}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Currency Description"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="currencyDescription"
                  value={formData.currencyDescription}
                  onChange={handleInputChange}
                  error={!!fieldErrors.currencyDescription}
                  helperText={fieldErrors.currencyDescription}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Sub Currency"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="subCurrency"
                  value={formData.subCurrency}
                  onChange={handleInputChange}
                  error={!!fieldErrors.subCurrency}
                  helperText={fieldErrors.subCurrency}
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

export default Currency;
