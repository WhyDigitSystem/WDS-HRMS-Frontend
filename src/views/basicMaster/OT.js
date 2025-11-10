import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';
import { Select, MenuItem, InputLabel, FormControl, FormHelperText, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export const OT = () => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const branch = localStorage.getItem('branch');
  const branchCode = localStorage.getItem('branchCode');
  const finYear = localStorage.getItem('finYear');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    active: true,
    otType: '',
    otCategory: ''
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    active: true,
    otType: '',
    otCategory: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'otType', header: 'OT Type', size: 140 },
    { accessorKey: 'otCategory', header: 'OT Category', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  const [slabRows, setSlabRows] = useState([
    { slab: '', minHours: '', maxHours: '', otRate: '', effectiveFrom: '', effectiveTo: '', applicable: true }
  ]);

  const handleSlabChange = (index, field, value) => {
    const updated = [...slabRows];
    updated[index][field] = value;
    setSlabRows(updated);
  };

  const handleAddSlab = () => {
    setSlabRows([...slabRows, { slab: '', minHours: '', maxHours: '', otRate: '', effectiveFrom: '', effectiveTo: '', applicable: true }]);
  };

  const handleDeleteSlab = (index) => {
    setSlabRows(slabRows.filter((_, i) => i !== index));
  };

  useEffect(() => {
    getAllOverTime();
  }, []);

  const getAllOverTime = async () => {
    try {
      const result = await apiCalls('get', `shiftmaster/getAllOtMasterByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.otMasterVO.reverse());
    } catch (err) {
      console.log('error', err);
    }
  };

  const getOverTimeById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `shiftmaster/getOtMasterById?id=${row.original.id}`);
      if (response.status === true) {
        const data = response.paramObjectsMap.otMasterVO;

        setFormData({
          otCategory: data.otCategory,
          otType: data.otType,
          active: data.active === 'Active'
        });

        const mappedSlabs = data.otMasterDetailsVO.map((item) => ({
          slab: item.slab.toString(),
          minHours: `${item.minHours.toString().padStart(2, '0')}:00`,
          maxHours: `${item.maxHours.toString().padStart(2, '0')}:00`,
          otRate: item.otrate.toString(),
          effectiveFrom: item.effectiveFrom,
          effectiveTo: item.effectiveTo,
          applicable: item.applicable,
          errors: {} // prepare for validation
        }));

        setSlabRows(mappedSlabs);
        setListView(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClear = () => {
    setFormData({ active: true, otType: '', otCategory: '' });
    setFieldErrors({ active: true, otType: '', otCategory: '' });
    setEditId('');
    setSlabRows([{ slab: '', minHours: '', maxHours: '', otRate: '', effectiveFrom: '', effectiveTo: '', applicable: true }]);
  };

  // In your existing OverTimeMaster.js

  // const handleSave = async () => {
  //   const errors = {};
  //   if (!formData.otType) errors.otType = 'OT Type is required';
  //   else if (formData.otType.length <= 2) errors.otType = 'Min Length is 3';

  //   if (!formData.otCategory) errors.otCategory = 'OT Category is required';
  //   else if (formData.otCategory.length < 2) errors.otCategory = 'Min Length is 2';

  //   if (Object.keys(errors).length === 0) {
  //     setIsLoading(true);

  //     // Transform slabRows to otMasterDetailsDTO
  //     const otMasterDetailsDTO = slabRows.map((row) => ({
  //       applicable: row.applicable,
  //       effectiveFrom: row.effectiveFrom,
  //       effectiveTo: row.effectiveTo,
  //       maxHours: Number(row.maxHours.split(':')[0]) || 0, // assume only hours
  //       minHours: Number(row.minHours.split(':')[0]) || 0,
  //       otrate: Number(row.otRate) || 0,
  //       slab: Number(row.slab) || 0
  //     }));

  //     const saveFormData = {
  //       ...(editId && { id: parseInt(editId) }),
  //       active: formData.active,
  //       branch: branch,
  //       branchCode: branchCode,
  //       createdBy: loginUserName,
  //       finYear: finYear,
  //       orgId: parseInt(orgId),
  //       otCategory: formData.otCategory,
  //       otType: formData.otType,
  //       otMasterDetailsDTO
  //     };

  //     try {
  //       const result = await apiCalls('put', '/shiftmaster/createUpdateOtMaster', saveFormData);
  //       if (result.status === true) {
  //         showToast('success', editId ? 'OT Master Updated Successfully' : 'OT Master Created Successfully');
  //         handleClear();
  //         getAllOverTime();
  //       } else {
  //         showToast('error', result.paramObjectsMap?.errorMessage || 'Save failed');
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       showToast('error', 'API Error during save');
  //     }

  //     setIsLoading(false);
  //   } else {
  //     setFieldErrors(errors);
  //   }
  // };

  const handleSave = async () => {
    const errors = {};
    let hasTableError = false;
    const updatedSlabs = [...slabRows];

    // Validate slab rows
    updatedSlabs.forEach((row, index) => {
      const rowErrors = {};

      if (!row.slab) rowErrors.slab = 'Hours / Slab is Required';
      if (!row.minHours) rowErrors.minHours = 'Min Hours is Required';
      if (!row.maxHours) rowErrors.maxHours = 'Max Hours is Required';
      // if (!row.otRate) rowErrors.otRate = 'OT rate is Required';
      // else if (!/^(\d+%?)$/.test(row.otRate)) rowErrors.otRate = 'OT rate is Required';
      // if (!row.effectiveFrom) rowErrors.effectiveFrom = 'Required';
      // if (!row.effectiveTo) rowErrors.effectiveTo = 'Required';

      if (Object.keys(rowErrors).length > 0) {
        updatedSlabs[index].errors = rowErrors;
        hasTableError = true;
      } else {
        updatedSlabs[index].errors = {};
      }
    });

    setSlabRows(updatedSlabs);

    // Validate form fields
    if (!formData.otType) errors.otType = 'OT Type is required';
    else if (formData.otType.length <= 2) errors.otType = 'Min Length is 3';

    if (!formData.otCategory) errors.otCategory = 'OT Category is required';
    else if (formData.otCategory.length < 2) errors.otCategory = 'Min Length is 2';

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0 || hasTableError) return;

    setIsLoading(true);

    // Prepare API payload - Keep otRate as string with % if present
    const otMasterDetailsDTO = slabRows.map((row) => ({
      ...(editId && { id: parseInt(editId) }),
      applicable: row.applicable,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      maxHours: Number(row.maxHours.split(':')[0]) || 0,
      minHours: Number(row.minHours.split(':')[0]) || 0,
      otrate: parseInt(row.otRate),
      slab: row.slab
    }));

    const saveFormData = {
      ...(editId && { id: parseInt(editId) }),
      active: formData.active,
      branch,
      branchCode,
      createdBy: loginUserName,
      finYear,
      orgId: parseInt(orgId),
      otCategory: formData.otCategory,
      otType: formData.otType,
      otMasterDetailsDTO
    };

    try {
      const result = await apiCalls('put', '/shiftmaster/createUpdateOtMaster', saveFormData);
      if (result.status === true) {
        showToast('success', editId ? 'OT Master Updated Successfully' : 'OT Master Created Successfully');
        handleClear();
        getAllOverTime();
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'API Error during save');
    }

    setIsLoading(false);
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleCheckboxChange = (event) => {
    setFormData({ ...formData, active: event.target.checked });
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
        </div>

        {listView ? (
          <CommonListViewTable
            data={listViewData}
            columns={listViewColumns}
            blockEdit={true}
            toEdit={getOverTimeById}
            enableEditing={true}
          />
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.otType}>
                  <InputLabel id="otType-label">OT Type</InputLabel>
                  <Select
                    labelId="otType-label"
                    id="otType"
                    name="otType"
                    value={formData.otType}
                    label="OT Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Select OT Type</em>
                    </MenuItem>
                    <MenuItem value="Hourly">Hourly</MenuItem>
                    <MenuItem value="Slab">Slab</MenuItem>
                  </Select>
                  <FormHelperText>{fieldErrors.otType}</FormHelperText>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.otCategory}>
                  <InputLabel id="ot-category">OT Category</InputLabel>
                  <Select
                    labelId="ot-category"
                    id="otCategory"
                    name="otCategory"
                    value={formData.otCategory}
                    label="OT Category"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Select OT Category</em>
                    </MenuItem>
                    <MenuItem value="Regular">Regular</MenuItem>
                    <MenuItem value="Weekly-Off">Weekly-Off</MenuItem>
                    <MenuItem value="Holiday">Holiday</MenuItem>
                  </Select>
                  <FormHelperText>{fieldErrors.otCategory}</FormHelperText>
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

            <Box className="mt-4">
              {/* Table Header */}
              <Box
                display="grid"
                gridTemplateColumns="80px repeat(7, 1.5fr)"
                bgcolor="#2f4f4f"
                color="white"
                p={2}
                borderRadius={1}
                textAlign="center"
                fontSize={14}
                fontWeight="bold"
                columnGap={2}
              >
                <Box>Action</Box>
                <Box>Hours / Slab</Box>
                <Box>Min Hours</Box>
                <Box>Max Hours</Box>
                <Box>OT Rate %</Box>
                <Box>Effective From</Box>
                <Box>Effective To</Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <span>Applicable</span>
                  <Box ml={1}>
                    <ActionButton title="Add" icon={AddIcon} onClick={handleAddSlab} />
                  </Box>
                </Box>
              </Box>

              {/* Table Rows with Pagination */}
              {slabRows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage).map((row, index) => {
                const actualIndex = currentPage * rowsPerPage + index;
                return (
                  <Box
                    key={actualIndex}
                    display="grid"
                    gridTemplateColumns="80px repeat(7, 1.5fr)"
                    gap={2}
                    mb={2}
                    alignItems="center"
                    bgcolor="#fff"
                    p={2}
                    borderRadius={2}
                  >
                    <Box>
                      <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteSlab(actualIndex)} />
                    </Box>

                    <TextField
                      size="small"
                      placeholder="Hours / Slab"
                      value={row.slab}
                      onChange={(e) => handleSlabChange(actualIndex, 'slab', e.target.value)}
                      fullWidth
                      error={!!row.errors?.slab}
                      helperText={row.errors?.slab}
                    />
                    <TextField
                      size="small"
                      type="text"
                      value={row.minHours}
                      onChange={(e) => handleSlabChange(actualIndex, 'minHours', e.target.value)}
                      fullWidth
                      error={!!row.errors?.minHours}
                      helperText={row.errors?.minHours}
                    />
                    <TextField
                      size="small"
                      type="text"
                      value={row.maxHours}
                      onChange={(e) => handleSlabChange(actualIndex, 'maxHours', e.target.value)}
                      fullWidth
                      error={!!row.errors?.maxHours}
                      helperText={row.errors?.maxHours}
                    />
                    <TextField
                      size="small"
                      placeholder="OT Rate"
                      value={row.otRate}
                      onChange={(e) => handleSlabChange(actualIndex, 'otRate', e.target.value)}
                      fullWidth
                      error={!!row.errors?.otRate}
                      helperText={row.errors?.otRate}
                    />
                    <TextField
                      size="small"
                      type="date"
                      value={row.effectiveFrom}
                      onChange={(e) => handleSlabChange(actualIndex, 'effectiveFrom', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!row.errors?.effectiveFrom}
                      helperText={row.errors?.effectiveFrom}
                    />
                    <TextField
                      size="small"
                      type="date"
                      value={row.effectiveTo}
                      onChange={(e) => handleSlabChange(actualIndex, 'effectiveTo', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!row.errors?.effectiveTo}
                      helperText={row.errors?.effectiveTo}
                    />
                    <Checkbox checked={row.applicable} onChange={(e) => handleSlabChange(actualIndex, 'applicable', e.target.checked)} />
                  </Box>
                );
              })}

              {/* Pagination Controls */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Box display="flex" alignItems="center">
                  Rows per page:
                  <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setCurrentPage(0);
                    }}
                    sx={{ ml: 1, width: 80 }}
                  >
                    {[5, 10, 25].map((count) => (
                      <MenuItem key={count} value={count}>
                        {count}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box display="flex" alignItems="center">
                  <IconButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
                    ‹
                  </IconButton>
                  <span style={{ margin: '0 10px' }}>
                    Page {currentPage + 1} of {Math.ceil(slabRows.length / rowsPerPage)}
                  </span>
                  <IconButton
                    onClick={() => setCurrentPage((prev) => (prev + 1 < Math.ceil(slabRows.length / rowsPerPage) ? prev + 1 : prev))}
                    disabled={currentPage + 1 >= Math.ceil(slabRows.length / rowsPerPage)}
                  >
                    ›
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </div>

      <ToastComponent />
    </>
  );
};

export default OT;
