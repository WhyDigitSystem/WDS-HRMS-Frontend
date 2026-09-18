import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCountries } from 'utils/CommonFunctions';
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

export const State = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    stateCode: '',
    stateNo: '',
    stateName: '',
    country: 'INDIA'
  });
  const [editId, setEditId] = useState('');
  const [countryList, setCountryList] = useState([]);

  const theme = useTheme();
  const anchorRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    stateCode: '',
    stateNo: '',
    stateName: '',
    country: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'stateName', header: 'State Name', size: 140 },
    { accessorKey: 'stateCode', header: 'State Code', size: 140 },
    { accessorKey: 'stateNumber', header: 'State No', size: 140 },
    { accessorKey: 'country', header: 'Country', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllStates();

    const fetchData = async () => {
      try {
        const countryData = await getAllActiveCountries(orgId);
        setCountryList(countryData);
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };
    fetchData();
  }, []);

  const getAllStates = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/state?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.stateVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
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
      const filteredData = listViewData.map(({ stateCode, stateName, stateNumber, country, active }) => ({
        'State Code': stateCode,
        'State Name': stateName,
        'State Number': stateNumber,
        'Country': country,
        'Active': (active === true || active === 'Active') ? 'Yes' : 'No'
      }));

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'States');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, 'State_List.xlsx');
      showToast('success', 'Excel file downloaded successfully');
    } catch (error) {
      console.error('Error generating Excel:', error);
      showToast('error', 'Failed to generate Excel');
    }
  };

  const getStateById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/state/${row.original.id}`);
      if (response.status === true) {
        const particularState = response.paramObjectsMap.stateVO;

        setFormData({
          stateCode: particularState.stateCode,
          stateNo: particularState.stateNumber,
          stateName: particularState.stateName,
          country: particularState.country,
          active: particularState.active === 'Active' ? true : false
        });
        setListView(false);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;

    const codeRegex = /^[A-Za-z]*$/;
    const nameRegex = /^[A-Za-z ]*$/;
    const numericRegex = /^[0-9]*$/;

    // Validation
    if (name === "stateCode") {
      if (!codeRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          stateCode: "Only Alphabets Allowed",
        }));
        return;
      }

      if (value.length > 2) {
        setFieldErrors((prev) => ({
          ...prev,
          stateCode: "Max Length is 2",
        }));
        return;
      }
    }

    if (name === "stateNo") {
      if (!numericRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          stateNo: "Only Numerics Allowed",
        }));
        return;
      }

      if (value.length > 3) {
        setFieldErrors((prev) => ({
          ...prev,
          stateNo: "Max Length is 3",
        }));
        return;
      }
    }

    if (name === "stateName") {
      if (!nameRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          stateName: "Only Alphabets Allowed",
        }));
        return;
      }

      if (value.length > 40) {
        setFieldErrors((prev) => ({
          ...prev,
          stateName: "Exceeded Max Length",
        }));
        return;
      }
    }

    // Set value
    let newValue = value;

    if (name === "stateCode") {
      newValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Maintain cursor position
    if (type === "text" || type === "textarea") {
      setTimeout(() => {
        const inputElement = document.getElementsByName(name)[0];
        if (inputElement) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };

  const handleClear = () => {
    setFormData({
      stateCode: '',
      stateNo: '',
      stateName: '',
      country: 'INDIA',
      active: true
    });
    setFieldErrors({
      stateCode: '',
      stateNo: '',
      stateName: '',
      country: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.stateCode) {
      errors.stateCode = 'State Code is required';
    } else if (formData.stateCode.length <= 1) {
      errors.stateCode = 'Min Length is 2';
    }

    if (!formData.stateNo) {
      errors.stateNo = 'State No is required';
    }
    if (!formData.stateName) {
      errors.stateName = 'State Name is required';
    } else if (formData.stateName.length < 4) {
      errors.stateName = 'Min Length is 4';
    }

    if (!formData.country) {
      errors.country = 'Country is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        stateCode: formData.stateCode,
        stateNumber: formData.stateNo,
        stateName: formData.stateName,
        region: '',
        country: formData.country,
        orgId: orgId,
        createdBy: loginUserName
      };
      try {
        const response = await apiCalls('post', `commonmaster/state`, saveFormData);
        if (response.status === true) {
          setIsLoading(false);
          handleClear();
          getAllStates();
          showToast('success', editId ? ' State Updated Successfully' : 'State created successfully');
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'State creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'State creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
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
      showToast('error', 'No data available to download');
      setLoading(false);
      return;
    }

    try {
      const doc = new jsPDF();
      doc.text('State List', 14, 10);

      const tableColumn = ['State Code', 'State Name', 'State Number', 'Country', 'Active'];
      const tableRows = [];

      listViewData.forEach(({ stateCode, stateName, stateNumber, country, active }) => {
        tableRows.push([
          stateCode,
          stateName,
          stateNumber,
          country,
          (active === true || active === 'Active') ? 'Yes' : 'No'
        ]);
      });

      autoTable(doc, {  // ✅ Use 'autoTable' function directly with doc
        head: [tableColumn],
        body: tableRows,
        startY: 20
      });

      doc.save('State_List.pdf');
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
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} margin="0 10px 0 10px" />

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
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getStateById} enableEditing={true} />
          </div>
        ) : (
          <div className="row">
            <div className="col-md-3 mb-3">
              <TextField
                label="Name"
                variant="outlined"
                size="small"
                fullWidth
                name="stateName"
                value={formData.stateName}
                onChange={handleInputChange}
                error={!!fieldErrors.stateName}
                helperText={fieldErrors.stateName}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Code"
                variant="outlined"
                size="small"
                fullWidth
                name="stateCode"
                value={formData.stateCode}
                onChange={handleInputChange}
                error={!!fieldErrors.stateCode}
                helperText={fieldErrors.stateCode}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="State Number"
                variant="outlined"
                size="small"
                fullWidth
                name="stateNo"
                value={formData.stateNo}
                onChange={handleInputChange}
                error={!!fieldErrors.stateNo}
                helperText={fieldErrors.stateNo}
              />
            </div>
            <div className="col-md-3 mb-3">
              <FormControl variant="outlined" size="small" fullWidth error={!!fieldErrors.country}>
                <InputLabel id="country-label">Country</InputLabel>
                <Select labelId="country-label" label="Country" value={formData.country} onChange={handleInputChange} name="country">
                  {countryList?.map((row) => (
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
                control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                label="Active"
                labelPlacement="end"
              />
            </div>
          </div>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default State;
