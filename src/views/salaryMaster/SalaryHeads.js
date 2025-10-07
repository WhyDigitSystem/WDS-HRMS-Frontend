import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { FormHelperText, MenuItem } from '@mui/material';

const SalaryHeads = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    heading: '',
    code: '',
    category: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    type: '',
    heading: '',
    code: '',
    category: '',
    active: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'heading', header: 'Heading', size: 140 },
    { accessorKey: 'code', header: 'Code', size: 140 },
    { accessorKey: 'category', header: 'Category', size: 140 },
    { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllSalaryHeads();
  }, []);

  const getAllSalaryHeads = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllSalaryHeadsByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.salaryHeadsVO);

      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getSalaryHeadsById = async (row) => {
    console.log('THE SELECTED COMPANY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `employeemaster/getSalaryHeadsById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularSalaryHeads = response.paramObjectsMap.salaryHeadsVO;
        console.log('THE PARTICULAR COMPANY DETAILS ARE:', particularSalaryHeads);

        setFormData({
          type: particularSalaryHeads.type,
          heading: particularSalaryHeads.heading,
          code: particularSalaryHeads.code,
          category: particularSalaryHeads.category,
          active: particularSalaryHeads.active === 'Active' ? true : false
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;

    let updatedValue = value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue
    }));

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: updatedValue
      }));

      setFieldErrors({ ...fieldErrors, [name]: '' });

      // Update the cursor position after the input change only for text inputs
      if (type === 'text' || type === 'email' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }, 0);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      type: '',
      heading: '',
      fromDate: '',
      toDate: '',
      code: '',
      category: '',
      month: '',
      active: true
    });
    setFieldErrors({
      type: '',
      heading: '',
      fromDate: '',
      toDate: '',
      code: '',
      category: '',
      month: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.type) {
      errors.type = 'Type is required';
    }
    if (!formData.heading) {
      errors.heading = 'Heading is required';
    }
    if (!formData.code) {
      errors.code = 'Code is required';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        type: formData.type,
        heading: formData.heading,
        createdBy: loginUserName,
        code: formData.code,
        category: formData.category,
        orgId: orgId
      };
      console.log('DATA TO SAVE IS:', saveData);

      try {
        const response = await apiCalls('put', '/employeemaster/createUpdateSalaryHeads', saveData);

        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Salary Heads Updated Successfully' : 'Salary Heads created successfully');

          handleClear();
          getAllSalaryHeads();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Salary Heads creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Company creation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '15px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getSalaryHeadsById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Heading"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="heading"
                  value={formData.heading}
                  onChange={handleInputChange}
                  error={!!fieldErrors.heading}
                  helperText={fieldErrors.heading}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  error={!!fieldErrors.code}
                  helperText={fieldErrors.code}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Category"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  error={!!fieldErrors.category}
                  helperText={fieldErrors.category}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.type}>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select labelId="type-label" label="Type" value={formData.type} onChange={handleInputChange} name="type">
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="DEDUCTION">DEDUCTION</MenuItem>
                    <MenuItem value="EARNING">EARNING</MenuItem>
                  </Select>
                  {fieldErrors.type && <FormHelperText>{fieldErrors.type}</FormHelperText>}
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

export default SalaryHeads;
