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

export const Score = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const finYear = localStorage.getItem('finYear');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    input: '',
    score: 0
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    input: '',
    score: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    {
      accessorKey: 'input',
      header: 'Input',
      size: 140
    },
    {
      accessorKey: 'score',
      header: 'score',
      size: 140
    }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getScoreByOrgId();
  }, []);

  const getScoreByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/goalsController/getScoreByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.scoreVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getProjectById = async (row) => {
    console.log('THE SELECTED DESIGNATION ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getScoreById?id=${row.original.id}`);

      if (response.status === true) {
        const particularCountry = response.paramObjectsMap.scoreVO;
        setFormData({
          orgId: parseInt(particularCountry.orgId),
          finYear: particularCountry.finYear,
          input: particularCountry.input,
          score: parseInt(particularCountry.score)
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleClear = () => {
    setFormData({
      input: '',
      score: 0
    });
    setFieldErrors({
      input: '',
      score: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.input) {
      errors.input = 'Designation is required';
    } else if (formData.input.length <= 2) {
      errors.input = 'Min Length is 3';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        input: formData.input,
        score: parseInt(formData.score),
        orgId: parseInt(orgId),
        finYear: finYear,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('put', `/goalsController/createUpdateScore`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Score Updated Successfully' : 'Score created successfully');
          handleClear();
          getScoreByOrgId();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Score creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Score creation failed');
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
              toEdit={getProjectById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Input"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="input"
                  value={formData.input}
                  onChange={handleInputChange}
                  error={!!fieldErrors.input}
                  helperText={fieldErrors.input}
                />
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Score"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  name="score"
                  value={parseInt(formData.score) || 0}
                  onChange={handleInputChange}
                  error={!!fieldErrors.score}
                  helperText={fieldErrors.score}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} name="active" />}
                  label="Active"
                  labelPlacement="end"
                />
              </div> */}
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
export default Score;
