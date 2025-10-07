import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { TextField } from '@mui/material';
import CommonListViewTable from './CommonListViewTable';
import { useRef, useState, useMemo, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

export const Grade = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [finYear] = useState(localStorage.getItem('finYear'));

  const [formData, setFormData] = useState({
    grade: '',
    score: '',
    rangeFrom: 0,
    rangeTo: 0,
    indication: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    grade: '',
    score: '',
    rangeFrom: '',
    rangeTo: '',
    indication: ''
  });
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllGrade();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;

    // setFormData({ ...formData, [name]: value });
    // setFieldErrors({ ...fieldErrors, [name]: '' });
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));

    // Optional: Preserve cursor position after uppercase transformation
    // if (type === 'text' || type === 'textarea') {
    //   setTimeout(() => {
    //     const inputElement = document.getElementsByName(name)[0];
    //     if (inputElement) {
    //       inputElement.setSelectionRange(selectionStart, selectionEnd);
    //     }
    //   }, 0);
    // }
  };

  const handleClear = () => {
    setFormData({
      grade: '',
      score: '',
      rangeFrom: 0,
      rangeTo: 0,
      indication: ''
    });
    setFieldErrors({
      grade: '',
      score: '',
      // rangeFrom: '',
      // rangeTo: '',
      indication: ''
    });
    setEditId('');
  };

  const getAllGrade = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getGradeByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.gradeVO);
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const getGradeById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/goalsController/getGradeById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const grade = response.paramObjectsMap.gradeVO;
        setFormData({
          grade: grade.grade,
          score: grade.score,
          rangeFrom: parseInt(grade.rangeFrom),
          rangeTo: parseInt(grade.rangeTo),
          indication: grade.indications
          // active: grade.active === 'Active' ? true : false
        });
      }
    } catch (error) {
      console.error('Error fetching grade details:', error);
      showToast('error', 'Failed to fetch grade details');
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.grade) errors.grade = 'Grade is required';
    if (!formData.score) errors.score = 'Score is required';
    // if (!formData.rangeFrom) errors.rangeFrom = 'Range From is required';
    // if (!formData.rangeTo) errors.rangeTo = 'Range To is required';
    if (!formData.indication) errors.indication = 'Indication is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      active: formData.active,
      createdBy: loginUserName,
      grade: formData.grade,
      indications: formData.indication,
      orgId: parseInt(orgId),
      finYear: finYear,
      rangeFrom: parseInt(formData.rangeFrom),
      rangeTo: parseInt(formData.rangeTo),
      score: formData.score
    };

    try {
      const response = await apiCalls('put', '/goalsController/createUpdateGrade', payload);
      if (response.status) {
        showToast('success', editId ? 'Grade updated successfully' : 'Grade created successfully');
        handleClear();
        getAllGrade();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error saving Weightage:', error);
      showToast('error', 'Failed to save Weightage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const listViewColumns = [
    { accessorKey: 'grade', header: 'Grade', size: 140 },
    { accessorKey: 'score', header: 'Score', size: 140 },
    { accessorKey: 'rangeFrom', header: 'Range From', size: 140 },
    { accessorKey: 'rangeTo', header: 'rangeTo', size: 140 }
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
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getGradeById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Grade"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  error={!!fieldErrors.grade}
                  helperText={fieldErrors.grade}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Score"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  error={!!fieldErrors.score}
                  helperText={fieldErrors.score}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Range From"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="rangeFrom"
                  value={parseInt(formData.rangeFrom) || 0}
                  onChange={handleInputChange}
                  error={!!fieldErrors.rangeFrom}
                  helperText={fieldErrors.rangeFrom}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Range To"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="rangeTo"
                  value={parseInt(formData.rangeTo) || 0}
                  onChange={handleInputChange}
                  error={!!fieldErrors.rangeTo}
                  helperText={fieldErrors.rangeTo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Indication"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="indication"
                  value={formData.indication}
                  onChange={handleInputChange}
                  error={!!fieldErrors.indication}
                  helperText={fieldErrors.indication}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div> */}
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Grade;
