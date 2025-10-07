import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonListViewTable from './CommonListViewTable';

const FinYear = () => {
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState('');
  const [showFields, setShowFields] = useState(true);

  const [formData, setFormData] = useState({
    finYear: dayjs(),
    finYearIdentifier: '',
    finYearId: '',
    startDate: dayjs(),
    endDate: dayjs(),
    closed: false,
    // sno: '',
    active: true,
    createdBy: localStorage.getItem('userName'),
    orgId: parseInt(orgId)
  });

  const [fieldErrors, setFieldErrors] = useState({
    finYear: false,
    finYearIdentifier: false,
    finYearId: false,
    startDate: false,
    endDate: false,
    closed: false
    // sno: false
  });

  const handleClear = () => {
    setFormData({
      finYear: dayjs(),
      finYearId: '',
      finYearIdentifier: '',
      startDate: dayjs(),
      endDate: dayjs(),
      closed: false
      // sno: ''
    });

    setFieldErrors({
      finYear: false,
      finYearIdentifier: false,
      finYearId: false,
      startDate: false,
      endDate: false,
      closed: false
      // sno: false
    });
  };

  const columns = [
    { accessorKey: 'finYear', header: 'FinYear', size: 140 },
    // { accessorKey: 'finYearId', header: 'FinYearId', size: 140 },
    { accessorKey: 'finYearIdentifier', header: 'FinYearIdentifier', size: 140 },
    { accessorKey: 'startDate', header: 'Start Date', size: 140 },
    { accessorKey: 'endDate', header: 'End Date', size: 140 },
    { accessorKey: 'closed', header: 'Closed', size: 140 },
    { accessorKey: 'active', header: 'active', size: 140 }
  ];

  useEffect(() => {
    getFinYear();
  }, []);

  const handleInputChange1 = (e) => {
    const { name, value, checked } = e.target;
    let newValue = value;

    if (name === 'sno') {
      newValue = parseInt(value, 10) || 0; // fallback to 0 if value is not a valid number
    } else if (name === 'active' || name === 'closed') {
      newValue = checked;
    } else {
      newValue = value.toUpperCase();
    }

    setFormData({ ...formData, [name]: newValue });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;
    const numericRegex = /^[0-9]*$/;

    if (name === 'finYearId' && !numericRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'active' || name === 'closed' ? checked : value.toUpperCase()
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

  const handleList = () => {
    setShowFields(!showFields);
  };

  const getFinYear = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/getAllFInYearByOrgId?orgId=${orgId}`);

      if (result) {
        setData(result.paramObjectsMap.financialYearVOs || []);
      } else {
        // Handle error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

    // Perform additional validation if both dates are set
    if (formData.startDate && formData.endDate) {
      const start = dayjs(formData.startDate);
      const end = dayjs(formData.endDate);
      if (start.isAfter(end)) {
        setFieldErrors({ ...fieldErrors, endDate: true });
      } else {
        setFieldErrors({ ...fieldErrors, endDate: false });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Check if any field is empty
      console.log('formData', formData);
      const errors = Object.keys(formData).reduce((acc, key) => {
        // Skip validation for 'active' and 'closed'
        if (key !== 'active' && key !== 'closed' && !formData[key]) {
          acc[key] = true;
        }
        return acc;
      }, {});

      // Check date validation
      if (formData.startDate && formData.endDate) {
        const start = dayjs(formData.startDate);
        const end = dayjs(formData.endDate);
        if (start.isAfter(end)) {
          errors.endDate = true;
        }
      }

      // If there are errors, set the corresponding fieldErrors state to true
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return; // Prevent API call if there are errors
      }
      const formatedFinYear = formData.finYear ? dayjs(formData.finYear).format('YYYY') : null;
      // Format startDate, endDate, and convert finYear to integer before making the API call
      const formattedData = {
        startDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : null,
        // finYear: formData.finYear ? parseInt(formData.finYear, 10) : null,
        finYear: parseInt(formatedFinYear),
        finYearId: parseInt(formData.finYearId),
        finYearIdentifier: formData.finYearIdentifier,
        closed: formData.closed,
        active: formData.active,
        createdBy: localStorage.getItem('userName'),
        id: editId ? formData.id : undefined,
        orgId
      };

      // Make the API call using the apiCall method
      const response = await apiCalls('put', 'commonmaster/createUpdateFinYear', formattedData);

      // Handle successful response
      console.log('Response:', response.data);
      handleClear();
      toast.success(editId ? 'FinYear Updated Successfully' : 'FinYear Created Successfully', {
        autoClose: 2000,
        theme: 'colored'
      });
      getFinYear();
    } catch (error) {
      // Error handling is already managed by the apiCall method
      toast.error(error.message, {
        autoClose: 2000,
        theme: 'colored'
      });
    }
  };

  const getFinYearById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/getAllFInYearById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setShowFields(true);
        const particularFin = response.paramObjectsMap.financialYearVOs;

        setFormData({
          // finYear: particularFin.finYear ? dayjs(particularFin.finYear).format('YYYY') : null,
          finYear: particularFin.finYear ? dayjs().year(particularFin.finYear).format('YYYY') : null,
          finYearId: particularFin.finYearId,
          finYearIdentifier: particularFin.finYearIdentifier,
          closed: particularFin.closed === 'Yes' ? true : false,
          startDate: particularFin.startDate,
          endDate: particularFin.endDate,
          active: particularFin.active === 'Active' ? true : false,
          orgId: particularFin.orgId,
          updatedBy: localStorage.getItem('userName'),
          id: row.original.id
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <div>
        <ToastContainer />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSubmit} margin="0 10px 0 10px" />
        </div>
        {showFields ? (
          <div className="row d-flex">
            {/* <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="finYear"
                  label="Fin Year"
                  size="small"
                  required
                  name="finYear"
                  value={formData.finYear}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 30 }}
                  helperText={<span style={{ color: 'red' }}>{fieldErrors.finYear ? 'This field is required' : ''}</span>}
                />
              </FormControl>
            </div> */}
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Fin Year"
                    value={formData.finYear ? dayjs(formData.finYear) : null}
                    views={['year']}
                    onChange={(date) => handleDateChange('finYear', date)}
                    slotProps={{
                      textField: { size: 'small', clearable: true }
                    }}
                    format="YYYY"
                    error={fieldErrors.finYear}
                    helperText={fieldErrors.finYear ? 'This field is required' : ''}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="finYearId"
                  label="FinYear ID"
                  size="small"
                  required
                  value={formData.finYearId}
                  name="finYearId"
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 30 }}
                  error={fieldErrors.finYearId}
                  helperText={<span style={{ color: 'red' }}>{fieldErrors.finYearId ? 'Fin Year Id required' : ''}</span>}
                />
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="finYearIdentifier"
                  label="FinYear Identifier"
                  size="small"
                  required
                  value={formData.finYearIdentifier}
                  name="finYearIdentifier"
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 30 }}
                  helperText={<span style={{ color: 'red' }}>{fieldErrors.finYearIdentifier ? 'This field is required' : ''}</span>}
                />
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate ? dayjs(formData.startDate) : null}
                    onChange={(date) => handleDateChange('startDate', date)}
                    slotProps={{
                      textField: { size: 'small', clearable: true }
                    }}
                    format="DD-MM-YYYY"
                    error={fieldErrors.startDate}
                    helperText={fieldErrors.startDate ? 'This field is required' : ''}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled" size="small" sx={{ minHeight: '120px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate ? dayjs(formData.endDate) : null}
                    onChange={(date) => handleDateChange('endDate', date)}
                    slotProps={{
                      textField: { size: 'small', clearable: true }
                    }}
                    format="DD-MM-YYYY"
                    error={fieldErrors.endDate}
                    helperText={fieldErrors.endDate ? 'This field is required' : ''}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>

            <div className="col-md-3 mb-3 ml-4">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.closed}
                      onChange={handleInputChange}
                      name="closed"
                      sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                    />
                  }
                  label="Closed"
                />
              </FormGroup>
            </div>
            <div className="col-md-3 mb-3 ml-4">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.active}
                      onChange={handleInputChange}
                      name="active"
                      sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                    />
                  }
                  label="Active"
                />
              </FormGroup>
            </div>
          </div>
        ) : (
          <CommonListViewTable data={Array.isArray(data) ? data : []} columns={columns} toEdit={getFinYearById} blockEdit={true} enableEditing={true} />
        )}
      </div>
    </div>
  );
};

export default FinYear;
