import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  TextField,
} from '@mui/material';
import apiCalls from 'apicall';
import { useState, useEffect, useRef } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const DeclarationDate = () => {
  const [listViewData, setListViewData] = useState([]);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);

  const [formData, setFormData] = useState({
    investmentDate: '',
    proofSubmissionDate: '',
    finYear: new Date().getFullYear(),
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    investmentDate: '',
    proofSubmissionDate: '',
    finYear: ''
  });

  const listViewColumns = [
    { accessorKey: 'investmentDate', header: 'Investment Date', size: 140 },
    { accessorKey: 'proofSubmissionDate', header: 'Proof Submission Date', size: 140 },
    { accessorKey: 'finYear', header: 'FinYear', size: 140 }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      await getAllDeclarationDateByOrgId();
    };
    fetchInitialData();
  }, []);

  // getAllDeclarationDateByOrgId
  const getAllDeclarationDateByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/managetax/getAllDeclarationDateByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.declarationDateVO || []);
      } else {
        showToast('error', response.message || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching declaration dates:', error);
      showToast('error', 'Failed to fetch declaration dates');
    }
  };

  // handleInputChange
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));

    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  // getDeclarationDateById
  const getDeclarationDateById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/managetax/getDeclarationDateById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const data = response.paramObjectsMap.declarationDateVO;

        setFormData(prev => ({
          ...prev,
          id: data.id || '',
          investmentDate: data.investmentDate || '',
          proofSubmissionDate: data.proofSubmissionDate || '',
          finYear: data.finYear || '',
          active: data.active === 'Active'
        }));
      } else {
        showToast('error', response.message || 'Failed to fetch record');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      showToast('error', 'Failed to fetch record');
    }
  };

  // handleSave
  const handleSave = async () => {
    const errors = {};
    if (!formData.investmentDate) errors.investmentDate = 'Investment Date is required';
    if (!formData.proofSubmissionDate) errors.proofSubmissionDate = 'Proof Submission Date is required';
    if (!formData.finYear) errors.finYear = 'Financial Year is required';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    const payload = {
      ...(editId && { id: editId }),
      investmentDate: formData.investmentDate,
      proofSubmissionDate: formData.proofSubmissionDate,
      finYear: formData.finYear,
      branch: localStorage.getItem('branch') || '',
      branchCode: localStorage.getItem('branchCode') || '',
      createdBy,
      orgId,
      active: true
    };

    try {
      const response = await apiCalls('put', '/managetax/createUpdateDeclarationDate', payload);
      if (response.status) {
        showToast('success', editId ? 'Declaration Date updated successfully' : 'Declaration Date created successfully');
        handleClear();
        getAllDeclarationDateByOrgId();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('error', 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      investmentDate: '',
      proofSubmissionDate: '',
      finYear: new Date().getFullYear(),
      active: true
    });

    setFieldErrors({
      investmentDate: '',
      proofSubmissionDate: '',
      finYear: ''
    });

    setEditId('');
  };

  const handleView = () => setListView(!listView);
  const handleTabChange = (_, newValue) => setValue(newValue);

  return (
    <>
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4">
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
          </div>

          {!listView ? (
            <div className="row d-flex ml">

              {/* Investment Date */}
              <div className="col-md-2 mb-3">
                <TextField
                  label="Investment Date"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="investmentDate"
                  value={formData.investmentDate}
                  onChange={handleInputChange}
                  error={!!fieldErrors.investmentDate}
                  helperText={fieldErrors.investmentDate}
                  InputLabelProps={{ shrink: true }}
                />
              </div>

              {/* Proof Submission Date */}
              <div className="col-md-2 mb-3">
                <TextField
                  label="Proof Submission Date"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="proofSubmissionDate"
                  value={formData.proofSubmissionDate}
                  onChange={handleInputChange}
                  error={!!fieldErrors.proofSubmissionDate}
                  helperText={fieldErrors.proofSubmissionDate}
                  InputLabelProps={{ shrink: true }}
                />
              </div>

              {/* Financial Year */}
              <div className="col-md-2 mb-3">
                <TextField
                  label="Financial Year"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="finYear"
                  value={formData.finYear}
                  onChange={handleInputChange}
                  error={!!fieldErrors.finYear}
                  helperText={fieldErrors.finYear}
                />
              </div>
            </div>
          ) : (
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              enableEditing={true}
              toEdit={getDeclarationDateById}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default DeclarationDate;
