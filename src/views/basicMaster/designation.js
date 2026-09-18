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

export const Designation = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    active: true,
    designationCode: '',
    designationName: '',
    expenseLimit: '',
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    designationName: '',
    designationCode: '',
    expenseLimit: '',
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    {
      accessorKey: 'designationName',
      header: 'Designation',
      size: 140
    },
    { accessorKey: 'designationCode', header: 'Designation Code', size: 140 },
    { accessorKey: 'expenseLimit', header: 'Expense Limit', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllDesignation();
  }, []);

  const getAllDesignation = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/getDesignationByOrgId?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.designationVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getDesignationById = async (row) => {
    console.log('THE SELECTED DESIGNATION ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/getDesignationById?id=${row.original.id}`);

      if (response.status === true) {
        const particularCountry = response.paramObjectsMap.designationVO;
        setFormData({
          designationCode: particularCountry.designationCode,
          designationName: particularCountry.designationName,
          expenseLimit: particularCountry.expenseLimit,
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

    const codeRegex = /^[A-Za-z- ]*$/;
    const numericRegex = /^\d*$/;

    // Validation
    if (name === "designationCode") {
      if (!codeRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          designationCode: "Only Alphabets Allowed",
        }));
        return;
      }

      if (value.length > 10) {
        setFieldErrors((prev) => ({
          ...prev,
          designationCode: "Exceeded Max Length",
        }));
        return;
      }
    }

    if (name === "designationName") {
      if (!codeRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          designationName: "Only Alphabets Allowed",
        }));
        return;
      }

      if (value.length > 50) {
        setFieldErrors((prev) => ({
          ...prev,
          designationName: "Exceeded Max Length",
        }));
        return;
      }
    }

    if (name === "expenseLimit") {
      if (!numericRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          expenseLimit: "Only Numbers Allowed",
        }));
        return;
      }
    }

    let newValue = value;

    // Only Designation Code should be uppercase
    if (name === "designationCode") {
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
      designationName: '',
      designationCode: '',
      expenseLimit: '',
      active: true
    });
    setFieldErrors({
      designationName: '',
      designationCode: '',
      expenseLimit: '',
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.designationCode) {
      errors.designationCode = 'Designation Code is required';
    } else if (formData.designationCode.length < 2) {
      errors.designationCode = 'Min Length is 2';
    }
    if (!formData.designationName) {
      errors.designationName = 'Designation is required';
    } else if (formData.designationName.length <= 2) {
      errors.designationName = 'Min Length is 3';
    }
    if (!formData.expenseLimit) {
      errors.expenseLimit = 'Expense Limit is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        designationCode: formData.designationCode,
        designationName: formData.designationName,
        expenseLimit: formData.expenseLimit,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('post', `commonmaster/createUpdateDesignation`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Designation Updated Successfully' : 'Designation created successfully');
          handleClear();
          getAllDesignation();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Designation creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Designation creation failed');
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
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getDesignationById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Designation"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="designationName"
                  value={formData.designationName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.designationName}
                  helperText={fieldErrors.designationName}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Designation Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="designationCode"
                  value={formData.designationCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.designationCode}
                  helperText={fieldErrors.designationCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Expense Limit"
                  variant="outlined"
                  size="small"
                  fullWidth
                  type='number'
                  name="expenseLimit"
                  value={formData.expenseLimit}
                  onChange={handleInputChange}
                  error={!!fieldErrors.expenseLimit}
                  helperText={fieldErrors.expenseLimit}
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
export default Designation;
