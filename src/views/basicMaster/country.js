import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import COASample from '../../assets/sample-files/COASample.xlsx';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Country = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    countryCode: '',
    countryName: ''
  });
  const [editId, setEditId] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    countryName: '',
    countryCode: ''
  });

  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'countryName', header: 'Country', size: 140 },
    { accessorKey: 'countryCode', header: 'Code', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllCountries();
  }, []);
  const getAllCountries = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/country?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.countryVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleExcelFileDownload = () => {
    console.log('Downloading Excel...'); // Debugging step
    console.log('List View Data:', listViewData); // Check if data exists

    if (!listViewData || listViewData.length === 0) {
      showToast('error', 'No data available to download');
      return;
    }

    try {
      // Convert the country data into a format suitable for Excel
      const filteredData = listViewData.map(({ countryCode, countryName, active }) => ({
        'Country Code': countryCode,
        'Country Name': countryName,
        Active: active === true || active === 'Active' ? 'Yes' : 'No' // ✅ Fix applied here
      }));

      // Create a worksheet and a workbook
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Countries');

      // Generate Excel file and trigger download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, 'Country_List.xlsx');
      showToast('success', 'Excel file downloaded successfully');
    } catch (error) {
      console.error('Error generating Excel:', error);
      showToast('error', 'Failed to generate Excel');
    }
  };

  const getCountryById = async (row) => {
    console.log('THE SELECTED COUNTRY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/country/${row.original.id}`);

      if (response.status === true) {
        const particularCountry = response.paramObjectsMap.Country;
        setFormData({
          countryCode: particularCountry.countryCode,
          countryName: particularCountry.countryName,
          active: particularCountry.active === 'Active' ? true : false
        });
        setListView(false);
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;

    const codeRegex = /^[A-Z]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    let newValue = value;

    if (name === "countryCode") {
      newValue = value.toUpperCase();

      if (!codeRegex.test(newValue)) {
        setFieldErrors((prev) => ({
          ...prev,
          countryCode: "Only Alphabets Allowed",
        }));
        return;
      }

      if (newValue.length > 3) {
        setFieldErrors((prev) => ({
          ...prev,
          countryCode: "Max Length is 3",
        }));
        return;
      }
    }

    if (name === "countryName") {
      newValue = value;

      if (!nameRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          countryName: "Only Alphabets Allowed",
        }));
        return;
      }

      if (newValue.length > 57) {
        setFieldErrors((prev) => ({
          ...prev,
          countryName: "Exceeded Max Length",
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (type === "text" || type === "textarea") {
      setTimeout(() => {
        const input = document.getElementsByName(name)[0];
        if (input) {
          input.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleClear = () => {
    setFormData({
      countryName: '',
      countryCode: '',
      active: true
    });
    setFieldErrors({
      countryName: '',
      countryCode: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.countryCode) {
      errors.countryCode = 'Country Code is required';
    } else if (formData.countryCode.length < 2) {
      errors.countryCode = 'Min Length is 2';
    }
    if (!formData.countryName) {
      errors.countryName = 'Country is required';
    } else if (formData.countryName.length < 4) {
      errors.countryName = 'Min Length is 4';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active, // Ensure this is passed correctly
        countryCode: formData.countryCode,
        countryName: formData.countryName,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('post', `commonmaster/createUpdateCountry`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Country Updated Successfully' : 'Country created successfully');
          handleClear();
          getAllCountries();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Country creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Country creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
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

  const handleCheckboxChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      active: event.target.checked // Directly set checked value (true/false)
    }));
  };

  const handlePDFDownload = async () => {
    setLoading(true);

    if (!listViewData || listViewData.length === 0) {
      showToast('error', 'No data available to download');
      setLoading(false);
      return;
    }

    try {
      const doc = new jsPDF();
      doc.text('Country List', 14, 10);

      // Define table headers
      const tableColumn = ['Country Code', 'Country Name', 'Active'];
      const tableRows = [];

      // Populate table rows
      listViewData.forEach(({ countryCode, countryName, active }) => {
        tableRows.push([
          countryCode,
          countryName,
          active === true || active === 'Active' ? 'Yes' : 'No' // ✅ Fix applied here
        ]);
      });

      autoTable(doc, {  // ✅ Use 'autoTable' function directly with doc
        head: [tableColumn],
        body: tableRows,
        startY: 20
      });

      // Save PDF file
      doc.save('Country_List.pdf');

      console.log('PDF Download triggered for country list');
      showToast('success', 'PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('error', 'Failed to generate PDF');
    }

    setLoading(false);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              isLoading={isLoading}
              onClick={() => handleSave()}
              margin="0 10px 0 10px"
            /> &nbsp;{' '}
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
              <div className="ps-2">
                <ActionButton icon={FaFileExcel} title="Excel Download" onClick={handleExcelFileDownload} />
                <ActionButton icon={FaFilePdf} title="PDF Download" onClick={handlePDFDownload} />
              </div>
            )}
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getCountryById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="countryName"
                  value={formData.countryName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.countryName}
                  helperText={fieldErrors.countryName}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.countryCode}
                  helperText={fieldErrors.countryCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                  label="Active"
                  labelPlacement="end"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div>
        <ToastComponent />
      </div>
    </>
  );
};
export default Country;