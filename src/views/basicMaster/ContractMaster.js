import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Box from '@mui/material/Box';

export const ContractMaster = () => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    contractorCode: '',
    contractorName: '',
    contactPerson: '',
    contactNumber: '',
    contractStartDate: '',
    contractEndDate: '',
    address: '',
    panNo: '',
    gst: '',
    email: '',
    contractValue: '',
    remarks: '',
    contractType: '',
    renewalRequired: false,
    status: true
  });

  const [editId, setEditId] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [listView, setListView] = useState(false);

  const listViewColumns = [
    { accessorKey: 'contractorCode', header: 'Code', size: 140 },
    { accessorKey: 'contractor', header: 'Contractor', size: 140 },
    { accessorKey: 'contactPerson', header: 'Contact Person', size: 140 },
    { accessorKey: 'contactNumber', header: 'Contact Number', size: 140 },
    { accessorKey: 'status', header: 'Status', size: 100 }
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllContracts();
  }, []);

  const getAllContracts = async () => {
    try {
      const result = await apiCalls('get', `shiftmaster/getAllContractMasterByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.contractMasterVO.reverse());
    } catch (err) {
      console.error('error', err);
    }
  };

  const getContractById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `shiftmaster/getContractMasterById?id=${row.original.id}`);
      if (response.status) {
        const data = response.paramObjectsMap.contractMasterVO;
        setFormData({
          contractorCode: data.contractorCode,
          contractorName: data.contractor,
          contactPerson: data.contactPerson,
          contactNumber: data.contactNumber,
          contractStartDate: data.startDate,
          contractEndDate: data.endDate,
          address: data.address,
          panNo: data.panNo || '',
          gst: data.gst || '',
          email: data.email || '',
          contractValue: data.contractValue || '',
          remarks: data.remarks || '',
          contractType: data.contractType || '',
          renewalRequired: data.renewalRequired || false,
          status: data.status === 'Active'
        });
        setListView(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;
    let error = '';

    switch (name) {
      // CODE → Alpha Numeric + - + /
      case 'contractorCode':
        updatedValue = value.toUpperCase().replace(/[^A-Z0-9/-]/g, '');
        if (!updatedValue.trim()) {
          error = 'Code is required';
        }
        break;

      // CONTRACTOR NAME → Only letters + spaces
      case 'contractorName':
        updatedValue = value.replace(/[^A-Za-z ]/g, '');
        if (!updatedValue.trim()) {
          error = 'Contractor name is required';
        } else if (updatedValue.length < 3) {
          error = 'Minimum 3 characters required';
        }
        break;

      // CONTACT PERSON → Only letters
      case 'contactPerson':
        updatedValue = value.replace(/[^A-Za-z ]/g, '');
        break;

      // CONTACT NUMBER → Only 10 digits
      case 'contactNumber':
        updatedValue = value.replace(/\D/g, '').slice(0, 10);

        if (updatedValue && updatedValue.length < 10) {
          error = 'Contact number must be 10 digits';
        }
        break;

      // EMAIL VALIDATION
      case 'email':
        updatedValue = value.toLowerCase();

        if (
          updatedValue &&
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(updatedValue)
        ) {
          error = 'Invalid email address';
        }
        break;

      // CONTRACT VALUE → Numbers only + decimal
      case 'contractValue':
        updatedValue = value.replace(/[^0-9.]/g, '');

        // prevent multiple decimals
        const decimalCount = (updatedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          updatedValue = updatedValue.substring(
            0,
            updatedValue.lastIndexOf('.')
          );
        }
        break;

      // PAN NUMBER → ABCDE1234F
      case 'panNo':
        updatedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (
          updatedValue &&
          !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(updatedValue)
        ) {
          error = 'Invalid PAN format';
        }
        break;

      // GST NUMBER
      case 'gst':
        updatedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (
          updatedValue &&
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(updatedValue)
        ) {
          error = 'Invalid GST number';
        }
        break;

      // REMARKS
      case 'remarks':
        updatedValue = value.slice(0, 250);
        break;

      // ADDRESS
      case 'address':
        updatedValue = value.slice(0, 500);
        break;

      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  const handleClear = () => {
    setFormData({
      contractorCode: '',
      contractorName: '',
      contactPerson: '',
      contactNumber: '',
      contractStartDate: '',
      contractEndDate: '',
      address: '',
      panNo: '',
      gst: '',
      email: '',
      contractValue: '',
      remarks: '',
      contractType: '',
      renewalRequired: false,
      status: true
    });
    setFieldErrors({});
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};

    // REQUIRED VALIDATIONS
    if (!formData.contractorCode.trim()) {
      errors.contractorCode = 'Code is required';
    }

    if (!formData.contractorName.trim()) {
      errors.contractorName = 'Contractor is required';
    }

    // START DATE
    if (!formData.contractStartDate) {
      errors.contractStartDate = 'Start Date is required';
    }

    // END DATE
    if (!formData.contractEndDate) {
      errors.contractEndDate = 'End Date is required';
    }

    // DATE COMPARISON
    if (
      formData.contractStartDate &&
      formData.contractEndDate &&
      new Date(formData.contractEndDate) <
      new Date(formData.contractStartDate)
    ) {
      errors.contractEndDate =
        'End Date cannot be before Start Date';
    }

    // CONTACT NUMBER VALIDATION
    if (
      formData.contactNumber &&
      formData.contactNumber.length !== 10
    ) {
      errors.contactNumber =
        'Contact number must be 10 digits';
    }

    // EMAIL VALIDATION
    if (
      formData.email &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        formData.email
      )
    ) {
      errors.email = 'Invalid email address';
    }

    // PAN VALIDATION
    if (
      formData.panNo &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo)
    ) {
      errors.panNo = 'Invalid PAN format';
    }

    // GST VALIDATION
    if (
      formData.gst &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gst
      )
    ) {
      errors.gst = 'Invalid GST number';
    }

    // CONTRACT VALUE VALIDATION
    if (
      formData.contractValue &&
      Number(formData.contractValue) <= 0
    ) {
      errors.contractValue =
        'Contract value must be greater than 0';
    }

    // STOP SAVE IF ERRORS
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    const payload = {
      ...(editId && { id: editId }),

      contractorCode: formData.contractorCode,
      contractor: formData.contractorName,
      contactPerson: formData.contactPerson,
      contactNumber: formData.contactNumber,
      startDate: formData.contractStartDate,
      endDate: formData.contractEndDate,
      address: formData.address,
      panNo: formData.panNo,
      gst: formData.gst,
      email: formData.email,
      contractValue: formData.contractValue,
      remarks: formData.remarks,
      contractType: formData.contractType,
      renewalRequired: formData.renewalRequired,
      status: formData.status ? 'Active' : 'Inactive',

      orgId: parseInt(orgId),
      branch,
      branchCode,
      finYear,
      createdBy: loginUserName
    };

    try {
      const response = await apiCalls(
        'put',
        `shiftmaster/createUpdateContractMaster`,
        payload
      );

      if (response.status) {
        showToast(
          'success',
          editId
            ? 'Contract Updated Successfully'
            : 'Contract Created Successfully'
        );

        handleClear();
        getAllContracts();
      } else {
        showToast(
          'error',
          response.paramObjectsMap?.errorMessage ||
          'Failed to save contract'
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        'error',
        'Server error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, status: e.target.checked });
  };

  const handleView = () => setListView(!listView);

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
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
              toEdit={getContractById}
              enableEditing={true}
            />
          </div>
        ) : (
          <div className="row">
            <div className="col-md-3 mb-3">
              <TextField
                label="Code"
                name="contractorCode"
                value={formData.contractorCode}
                onChange={handleInputChange}
                error={!!fieldErrors.contractorCode}
                helperText={fieldErrors.contractorCode}
                size="small"
                fullWidth
                inputProps={{ maxLength: 15 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Contractor"
                name="contractorName"
                value={formData.contractorName}
                onChange={handleInputChange}
                error={!!fieldErrors.contractorName}
                helperText={fieldErrors.contractorName}
                size="small"
                fullWidth
                inputProps={{ maxLength: 50 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                error={!!fieldErrors.contactPerson}
                helperText={fieldErrors.contactPerson}
                size="small"
                fullWidth
                inputProps={{ maxLength: 40 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                error={!!fieldErrors.contactNumber}
                helperText={fieldErrors.contactNumber}
                size="small"
                fullWidth
                inputProps={{ maxLength: 10 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                size="small"
                fullWidth
                inputProps={{ maxLength: 100 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Contract Value"
                name="contractValue"
                type="text"
                value={formData.contractValue}
                onChange={handleInputChange}
                size="small"
                fullWidth
                inputProps={{
                  inputMode: 'decimal',
                  maxLength: 12
                }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                size="small"
                fullWidth
                multiline
                inputProps={{ maxLength: 250 }}
                helperText={`${formData.remarks.length}/250`}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Contract Type"
                name="contractType"
                select
                value={formData.contractType}
                onChange={handleInputChange}
                fullWidth
                size="small"
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Manpower">Manpower</MenuItem>
                <MenuItem value="AMC">AMC</MenuItem>
                <MenuItem value="Supply">Supply</MenuItem>
                <MenuItem value="Consulting">Consulting</MenuItem>
                <MenuItem value="Rental">Rental</MenuItem>
              </TextField>
            </div>
            <div className="col-md-3 mb-3">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.renewalRequired}
                    onChange={(e) => setFormData({ ...formData, renewalRequired: e.target.checked })}
                  />
                }
                label="Renewal Required"
              />
            </div>

            <div className="col-md-3 mb-3">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.contractStartDate ? new Date(formData.contractStartDate) : null}
                  onChange={(newValue) => {
                    handleInputChange({
                      target: {
                        name: 'contractStartDate',
                        value: newValue ? newValue.toISOString().split('T')[0] : ''
                      }
                    });
                  }}
                  format="dd-MM-yyyy" // Add this line
                  minDate={new Date(new Date().getFullYear() - 1, 0, 1)} // January 1st of previous year
                  maxDate={new Date(new Date().getFullYear(), 11, 31)} // December 31st of current year
                  shouldDisableYear={(date) => {
                    const year = date.getFullYear();
                    const currentYear = new Date().getFullYear();
                    return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!fieldErrors.contractStartDate,
                      helperText: fieldErrors.contractStartDate,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
            <div className="col-md-3 mb-3">
              <Box display="flex" alignItems="center">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={formData.contractEndDate ? new Date(formData.contractEndDate) : null}
                    onChange={(newValue) => {
                      handleInputChange({
                        target: {
                          name: 'contractEndDate',
                          value: newValue ? newValue.toISOString().split('T')[0] : ''
                        }
                      });
                    }}
                    format="dd-MM-yyyy" // Add this line
                    minDate={
                      formData.contractStartDate ? new Date(formData.contractStartDate) : new Date(new Date().getFullYear() - 1, 0, 1)
                    }
                    maxDate={new Date(new Date().getFullYear(), 11, 31)} // December 31st of current year
                    shouldDisableYear={(date) => {
                      const year = date.getFullYear();
                      const currentYear = new Date().getFullYear();
                      return year < currentYear - 1 || year > currentYear; // Disable years outside current and previous
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!fieldErrors.contractEndDate,
                        helperText: fieldErrors.contractEndDate,
                        variant: 'outlined'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                size="small"
                fullWidth
                multiline
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.address.length}/500`}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="PAN No"
                name="panNo"
                value={formData.panNo}
                onChange={handleInputChange}
                error={!!fieldErrors.panNo}
                helperText={fieldErrors.panNo}
                size="small"
                fullWidth
                inputProps={{ maxLength: 10 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="GST"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                error={!!fieldErrors.gst}
                helperText={fieldErrors.gst}
                size="small"
                fullWidth
                inputProps={{ maxLength: 15 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <FormControlLabel control={<Checkbox checked={formData.status} onChange={handleCheckboxChange} />} label="Status" />
            </div>
          </div>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default ContractMaster;
