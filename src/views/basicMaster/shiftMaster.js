import React, { useState, useEffect } from 'react';
import { TextField, Checkbox, Paper, Box, FormHelperText, FormControl, IconButton, MenuItem, Select } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';

import ActionButton from 'utils/ActionButton';
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';

const defaultRow = {
  shiftCode: '',
  shiftName: '',
  inTime: '',
  outTime: '',
  breakTime: '',
  graceTime: '',
  fullDayHours: '',
  halfDayHours: '',
  isNightShift: false,
  isOpenShift: false, // Added Open Shift field
  active: false,
  editable: true,
  errors: {}
};

const ShiftMaster = () => {
  const [rows, setRows] = useState([defaultRow]);
  const [isLoading, setIsLoading] = useState(false);
  const loginUserName = localStorage.getItem('userName');
  const branch = localStorage.getItem('branch');
  const branchCode = localStorage.getItem('branchCode');
  const orgId = localStorage.getItem('orgId');
  const finYear = localStorage.getItem('finYear');
  const [currentShiftPage, setCurrentShiftPage] = useState(0);
  const [rowsPerShiftPage, setRowsPerShiftPage] = useState(5);

  useEffect(() => {
    getAllShiftMaster();
  }, []);

  const getAllShiftMaster = async () => {
    try {
      const result = await apiCalls('get', `shiftmaster/getAllShiftMasterByOrgId?orgId=${orgId}`);
      const transformed = result.paramObjectsMap.shiftMasterVO.map((item) => ({
        id: item.id,
        shiftCode: item.shiftCode,
        shiftName: item.shift,
        inTime: item.inTime,
        outTime: item.outTime,
        breakTime: item.breakTime,
        graceTime: item.graceTime,
        halfDayHours: item.halfDayHours,
        fullDayHours: item.fullDayHours,
        isNightShift: item.nightShift,
        isOpenShift: item.openShift || false, // Added Open Shift field
        active: item.active === 'Active',
        editable: false,
        errors: {}
      }));
      setRows(transformed);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];

    // Allow only numbers and decimal
    const numberFields = ['breakTime', 'graceTime', 'halfDayHours', 'fullDayHours'];

    if (numberFields.includes(field)) {
      // Accept only numbers with optional decimal
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    updated[index][field] = value;

    // If Open Shift is checked, clear time fields
    if (field === 'isOpenShift' && value === true) {
      updated[index].inTime = '';
      updated[index].outTime = '';
      updated[index].errors.inTime = '';
      updated[index].errors.outTime = '';
    }

    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([...rows, { ...defaultRow }]);
  };

  const handleDeleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
    showToast('info', 'Row deleted');
  };

  const handleEditRow = (index) => {
    const updated = [...rows];
    updated[index].editable = true;
    setRows(updated);
  };

  const validateRow = (row) => {
    const errors = {};

    // Always validate these fields
    if (!row.shiftCode || row.shiftCode.length < 2) errors.shiftCode = 'Required, min 2 chars';
    if (!row.shiftName || row.shiftName.length < 3) errors.shiftName = 'Required, min 3 chars';

    // Conditional validation for time fields
    if (!row.isOpenShift) {
      if (!row.inTime) errors.inTime = 'In-Time required';
      if (!row.outTime) errors.outTime = 'Out-Time required';
    }

    return errors;
  };

  const handleSave = async () => {
    const updatedRows = [...rows];
    let hasErrors = false;

    const editableRows = updatedRows.filter((row) => row.editable);

    if (editableRows.length === 0) {
      showToast('info', 'Please add a new row to save.');
      return;
    }

    const savePayload = [];

    updatedRows.forEach((row, index) => {
      if (!row.editable) return;

      const errors = validateRow(row);
      updatedRows[index].errors = errors;

      if (Object.keys(errors).length > 0) {
        hasErrors = true;
      } else {
        savePayload.push({
          ...(row.id && { id: row.id }),
          active: row.active,
          branch,
          branchCode,
          breakTime: row.breakTime,
          createdBy: loginUserName,
          finYear,
          graceTime: row.graceTime,
          halfDayHours: parseFloat(row.halfDayHours),
          fullDayHours: parseFloat(row.fullDayHours),
          inTime: row.inTime,
          nightShift: row.isNightShift,
          openShift: row.isOpenShift, // Added Open Shift to payload
          orgId: parseInt(orgId),
          outTime: row.outTime,
          shift: row.shiftName,
          shiftCode: row.shiftCode
        });
      }
    });

    setRows(updatedRows);

    if (hasErrors) {
      showToast('error', 'Fix validation errors first.');
      return;
    }

    if (savePayload.length === 0) {
      showToast('info', 'No changes to save.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCalls('put', 'shiftmaster/createUpdateShiftMaster', savePayload);
      if (response.status === true) {
        const isEdit = savePayload.some((r) => r.id);
        showToast('success', isEdit ? 'Shift(s) Updated Successfully' : 'Shift(s) Created Successfully');
        getAllShiftMaster();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Shift saving failed');
      }
    } catch (err) {
      showToast('error', 'API error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRows([{ ...defaultRow }]);
    getAllShiftMaster();
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, backgroundColor: '#f9f9f9' }}>
      <Box display="flex" mb={2}>
        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
        <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
      </Box>

      {/* Table Header */}
      <Box
        display="grid"
        gridTemplateColumns="80px repeat(11, 1fr)" // Changed to 11 columns to accommodate new checkbox
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
        <Box>Shift Code</Box>
        <Box>Shift Name</Box>
        <Box>In-Time</Box>
        <Box>Out-Time</Box>
        <Box>Break Time</Box>
        <Box>Grace Time</Box>
        <Box>Half Day Hours</Box>
        <Box>Full Day Hours</Box>
        <Box>Night Shift</Box>
        <Box>Open Shift</Box> {/* Added Open Shift header */}
        <Box>Active</Box>
      </Box>

      {/* Table Rows with Pagination */}
      {rows.slice(currentShiftPage * rowsPerShiftPage, currentShiftPage * rowsPerShiftPage + rowsPerShiftPage).map((row, index) => {
        const actualIndex = currentShiftPage * rowsPerShiftPage + index;
        return (
          <Box
            key={actualIndex}
            display="grid"
            gridTemplateColumns="80px repeat(11, 1.5fr)" // Changed to 11 columns
            gap={1}
            mb={2}
            alignItems="center"
            bgcolor="#fff"
            p={2}
            borderRadius={2}
          >
            <Box>
              {row.editable ? (
                <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteRow(actualIndex)} />
              ) : (
                <ActionButton title="Edit" icon={EditIcon} onClick={() => handleEditRow(actualIndex)} />
              )}
            </Box>

            <FormControl>
              <TextField
                size="small"
                value={row.shiftCode}
                onChange={(e) => handleChange(actualIndex, 'shiftCode', e.target.value)}
                disabled={!row.editable}
                error={!!row.errors.shiftCode}
                placeholder="Shift Code"
              />
              <FormHelperText error>{row.errors.shiftCode}</FormHelperText>
            </FormControl>

            <FormControl>
              <TextField
                size="small"
                value={row.shiftName}
                onChange={(e) => handleChange(actualIndex, 'shiftName', e.target.value)}
                disabled={!row.editable}
                error={!!row.errors.shiftName}
                placeholder="Shift Name"
              />
              <FormHelperText error>{row.errors.shiftName}</FormHelperText>
            </FormControl>

            <FormControl>
              <TextField
                size="small"
                type="time"
                value={row.inTime}
                onChange={(e) => handleChange(actualIndex, 'inTime', e.target.value)}
                disabled={!row.editable || row.isOpenShift} // Disable if Open Shift is checked
                error={!!row.errors.inTime}
              />
              <FormHelperText error>{row.errors.inTime}</FormHelperText>
            </FormControl>

            <FormControl>
              <TextField
                size="small"
                type="time"
                value={row.outTime}
                onChange={(e) => handleChange(actualIndex, 'outTime', e.target.value)}
                disabled={!row.editable || row.isOpenShift} // Disable if Open Shift is checked
                error={!!row.errors.outTime}
              />
              <FormHelperText error>{row.errors.outTime}</FormHelperText>
            </FormControl>

            <TextField
              size="small"
              value={row.breakTime}
              onChange={(e) => handleChange(actualIndex, 'breakTime', e.target.value)}
              disabled={!row.editable}
              placeholder="Break Time"
            />

            <TextField
              size="small"
              value={row.graceTime}
              onChange={(e) => handleChange(actualIndex, 'graceTime', e.target.value)}
              disabled={!row.editable}
              placeholder="Grace Time"
            />

            <TextField
              size="small"
              value={row.halfDayHours}
              onChange={(e) => handleChange(actualIndex, 'halfDayHours', e.target.value)}
              disabled={!row.editable}
              placeholder="Half Day Hours"
            />

            <TextField
              size="small"
              value={row.fullDayHours}
              onChange={(e) => handleChange(actualIndex, 'fullDayHours', e.target.value)}
              disabled={!row.editable}
              placeholder="Full Day Hours"
            />

            <Checkbox
              checked={row.isNightShift}
              onChange={(e) => handleChange(actualIndex, 'isNightShift', e.target.checked)}
              disabled={!row.editable}
            />

            {/* Added Open Shift Checkbox */}
            <Checkbox
              checked={row.isOpenShift}
              onChange={(e) => handleChange(actualIndex, 'isOpenShift', e.target.checked)}
              disabled={!row.editable}
            />

            <Checkbox
              checked={row.active}
              onChange={(e) => handleChange(actualIndex, 'active', e.target.checked)}
              disabled={!row.editable}
            />
          </Box>
        );
      })}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Box display="flex" alignItems="center">
          Rows per page:
          <Select
            size="small"
            value={rowsPerShiftPage}
            onChange={(e) => {
              setRowsPerShiftPage(parseInt(e.target.value, 10));
              setCurrentShiftPage(0);
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
          <IconButton onClick={() => setCurrentShiftPage((prev) => Math.max(prev - 1, 0))} disabled={currentShiftPage === 0}>
            ‹
          </IconButton>
          <span style={{ margin: '0 10px' }}>
            Page {currentShiftPage + 1} of {Math.ceil(rows.length / rowsPerShiftPage)}
          </span>
          <IconButton
            onClick={() => setCurrentShiftPage((prev) => (prev + 1 < Math.ceil(rows.length / rowsPerShiftPage) ? prev + 1 : prev))}
            disabled={currentShiftPage + 1 >= Math.ceil(rows.length / rowsPerShiftPage)}
          >
            ›
          </IconButton>
        </Box>
      </Box>

      <ToastComponent />
    </Paper>
  );
};

export default ShiftMaster;