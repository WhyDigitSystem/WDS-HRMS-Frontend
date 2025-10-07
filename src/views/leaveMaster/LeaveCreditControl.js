import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import dayjs from 'dayjs';

export const LeaveCreditControl = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: null,
    day: '',
    festival: ''
  });
  const [editId, setEditId] = useState('');


  const [fieldErrors, setFieldErrors] = useState({
    date: '',
    day: '',
    festival: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'date', header: 'Date', size: 140 },
    {
      accessorKey: 'Day',
      header: 'Day',
      size: 140
    }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllLeaveCreditControl();
  }, []);

  const getAllLeaveCreditControl = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.departmentVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getLeaveCreditControlById = async (row) => {
    console.log('THE SELECTED DEPARTMENT ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/commonmaster/getLeaveCreditControlById?id=${row.original.id}`);
      console.log('API Response:', response);
      if (response.status === true) {
        setListView(false);
        const particularDepartment = response.paramObjectsMap.departmentVO;
        setFormData({
          department: particularDepartment.departmentName,
          departmentCode: particularDepartment.departmentCode
        });
        
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

const handleDateChange = (newValue) => {
  const selectedDate = newValue ? dayjs(newValue) : null;
  const dayName = selectedDate ? selectedDate.format('dddd') : ''; // Extracts the day name (e.g., Monday)

  setFormData({ ...formData, date: newValue, day: dayName });
};

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'department' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'departmentCode' && !nameRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase() });
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
      date: null,
      day: '',
      festival: ''
    });
    setFieldErrors({
      date: null,
      day: '',
      festival: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.day) {
      errors.day = 'Day is required';
    }
    if (!formData.festival) {
      errors.festival = 'Festival is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        festival: formData.festival,
        day: formData.day,
        date: formData.date,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('post', `commonmaster/createUpdateDepartment`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Leave Credit Control Updated Successfully' : 'Leave Credit Control created successfully');
          handleClear();
          getAllLeaveCreditControl();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Leave Credit Control creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Leave Credit Control creation failed');
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
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              isLoading={isLoading}
              onClick={() => handleSave()}
              margin="0 10px 0 10px"
            /> &nbsp;{' '}
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getLeaveCreditControlById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
            <div className="col-md-3 mb-3">
                  <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date"
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        value={formData.date}
                        onChange={handleDateChange}
                        // onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Day"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="day"
                  disabled
                  value={formData.day}
                  onChange={handleInputChange}
                  error={!!fieldErrors.day}
                  helperText={fieldErrors.day}
                />
              </div>
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
export default LeaveCreditControl;
