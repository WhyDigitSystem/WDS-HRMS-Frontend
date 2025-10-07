import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import ActionButton from 'utils/ActionButton';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { useEffect, useState } from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Button, TextField, Box, Tab, Tabs, FormControlLabel, Checkbox } from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import apiCalls from 'apicall';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

function Appraiser() {
  const [scoreAllData, setScoreAllData] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const orgId = localStorage.getItem('orgId');
  const branch = localStorage.getItem('branch');
  const createdBy = localStorage.getItem('userName');
  // const finYear = localStorage.getItem('finYear');
  const [editId, setEditId] = useState(null);
  const [empDetails, setEmpDetails] = useState([]);
  const [supervisorsCode, setSupervisorCode] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [listView, setListView] = useState(true);

  const [formData, setFormData] = useState({
    appraisalID: '',
    name: '',
    code: '',
    department: '',
    supervisorName: '',
    supervisorCode: ''
    // active: true
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const [tableData, setTableData] = useState([
    {
      id: 1,
      area: '',
      goals: '',
      keyPerformanceIndicator: '',
      remarks: '',
      input: '',
      score: ''
    }
  ]);
  const [tableDataErrors, setTableDataErrors] = useState([{}]);

  // const handleCheckboxChange = (event) => {
  //   setFormData({
  //     ...formData,
  //     active: event.target.checked
  //   });
  // };

  const listViewColumns = [
    { accessorKey: 'empName', header: 'Name', size: 140 },
    { accessorKey: 'empCode', header: 'Code', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value.toUpperCase();
    setFormData((prev) => ({ ...prev, [name]: inputValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAllClear = () => {
    setFormData({
      appraisalID: '',
      supervisorCode: '',
      supervisorName: '',
      name: '',
      code: '',
      department: ''
      // active: true
    });
    setFieldErrors({});
    setTableData([
      {
        id: Date.now,
        area: '',
        goals: '',
        keyPerformanceIndicator: '',
        remarks: '',
        input: '',
        score: ''
      }
    ]);
    setEmpDetails([]);
    setTableDataErrors([{}]);
  };
  const handleTabChange = (_, newValue) => setValue(newValue);
  //
  const handleFullGrid = () => {
    if (formData.supervisorCode) {
      setModalOpen(true);
      getAllFillGrid();
    } else {
      setModalOpen(false);
      showToast('warning', formData.supervisorCode ? `${formData.supervisorCode} has No Data` : 'Please Select supervisor Code ');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(fillGridData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  // const handleSubmitSelectedRows = async () => {
  //   const selectedData = selectedRows.map((index) => fillGridData[index]);
  //   const newData = selectedData
  //     .filter((data) => {
  //       return !tableData.some((item) => item.area === data.area && item.goals === data.goals);
  //     })
  //     .map((data) => ({
  //       id: Date.now() + Math.random(),
  //       area: data.area,
  //       goals: data.goals,
  //       keyPerformanceIndicator: data.keyPerformanceIndicator,
  //       remarks: data.remarks
  //     }));
  //   if (newData.length < selectedData.length) {
  //     showToast('warning', 'Some of the selected items are already added!');
  //   }
  //   if (newData.length === 0) {
  //     return;
  //   }
  //   if (tableData.length === 1 && !tableData[0].area && !tableData[0].goals && !tableData[0].keyPerformanceIndicator) {
  //     setTableData(newData);
  //   } else {
  //     setTableData((prev) => [...prev, ...newData]);
  //   }

  //   // setTableData((prev) => [...prev, ...newData]);
  //   setSelectedRows([]);
  //   setSelectAll(false);
  //   handleCloseModal();
  // };

  const handleSubmitSelectedRows = async () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);

    const newData = selectedData
      .filter((data) => {
        return !tableData.some(
          (item) =>
            item.area === data.area &&
            item.goals === data.goals &&
            item.keyPerformanceIndicator === data.keyPerformanceIndicator &&
            item.remarks === data.remarks
        );
      })
      .map((data) => ({
        id: Date.now() + Math.random(),
        area: data.area,
        goals: data.goals,
        keyPerformanceIndicator: data.keyPerformanceIndicator,
        remarks: data.remarks
      }));

    if (newData.length < selectedData.length) {
      showToast('warning', 'Some of the selected items are already added!');
    }

    if (newData.length === 0) return;

    const isTableEmpty = tableData.length === 1 && !tableData[0].area && !tableData[0].goals && !tableData[0].keyPerformanceIndicator;

    if (isTableEmpty) {
      setTableData(newData);
    } else {
      setTableData((prev) => [...prev, ...newData]);
    }

    setSelectedRows([]);
    setSelectAll(false);
    handleCloseModal();
  };

  // const handleAddRow = () => {
  //   const newId = tableData.length > 0 ? Math.min(...tableData.map((d) => d.id)) - 1 : -1;

  //   setTableData((prev) => [...prev, { id: newId, area: '', keyPerformanceIndicator: '', goals: '', remarks: '' }]);
  // };

  //
  const getAllSupervisorCode = async () => {
    try {
      const res = await apiCalls('get', `goalsController/getReportingPerson?orgId=${orgId}`);
      setSupervisorCode(res.paramObjectsMap.reportingPersons);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllEmployeeDetails = async () => {
    try {
      const res = await apiCalls(
        'get',
        `/goalsController/getEmpUnderReportingPerson?orgId=${orgId}&ReportingPersonCode=${formData.supervisorCode}`
      );
      setEmpDetails(res.paramObjectsMap.empDetails);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getAllSupervisorCode();
    getAllData();
    getScoreByOrgId();
  }, []);

  useEffect(() => {
    if (formData.supervisorCode) {
      getAllEmployeeDetails();
      const selected = supervisorsCode.find((row) => row.reportingPersonCode === formData.supervisorCode);

      if (selected) {
        setFormData((prev) => ({
          ...prev,
          supervisorName: selected.reportingPerson
          // code: '',
          // name: '',
          // department: ''
        }));
      }
    }
  }, [formData.supervisorCode, supervisorsCode]);
  useEffect(() => {
    if (formData.code) {
      const selected = empDetails.find((row) => row.empName === formData.code);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          name: selected.empCode,
          department: selected.department
        }));
      }
    }
  }, [formData.code, empDetails]);

  const getAllFillGrid = async () => {
    try {
      const response = await apiCalls('get', `/goalsController/getAppraiserFillGrid?empCode=${formData.code}&orgId=${orgId}`);
      if (response.status === true) {
        setFillGridData(response.paramObjectsMap.empDetails);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const ValidForm = () => {
    const errors = {};
    const tableErrors = [];
    if (!formData.appraisalID) {
      errors.appraisalID = 'Appraisal ID is required';
    }
    if (!formData.supervisorCode) {
      errors.supervisorCode = 'Supervisor Code is required';
    }
    if (!formData.code) {
      errors.code = 'Employee Code is required';
    }
    tableData.forEach((row, index) => {
      const rowErrors = {};
      if (!row.input) {
        rowErrors.input = 'Rating is required';
      }
      tableErrors[index] = rowErrors;
    });
    const hasTableErrors = tableErrors.some((row) => Object.keys(row).length > 0);
    setFieldErrors(errors);
    setTableDataErrors(tableErrors);
    return Object.keys(errors).length === 0 && !hasTableErrors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!ValidForm()) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    const detailVO = tableData.map((row) => ({
      ...(editId && { id: row.id }),
      area: row.area,
      keyPerformanceIndicator: row.keyPerformanceIndicator,
      goals: row.goals,
      reMarks: row.remarks,
      input: row.input,
      score: parseInt(row.score)
    }));
    const sendData = {
      ...(editId && { id: editId }),
      createdBy: createdBy,
      modifiedBy: createdBy,
      orgId: parseInt(orgId),
      finYear: '2025',
      branch: branch,
      appraisalId: formData.appraisalID,
      supCode: formData.supervisorCode,
      supName: formData.supervisorName,
      empName: formData.name,
      empCode: formData.code,
      department: formData.department,
      // active: formData.active,
      appraiserDetailsDTO: detailVO
    };
    try {
      const result = await apiCalls('put', '/goalsController/createUpdateAppraiser', sendData);
      if (result.status) {
        showToast('success', editId ? 'Updated Successfully' : 'Created Successfully');
        handleAllClear();
        getAllData();
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Creation failed');
      }
    } catch (error) {
      showToast('error', 'API call failed');
    }
  };

  const rowEditgetbyid = async (row) => {
    setEditId(row.original.id);
    setFieldErrors({});
    setTableDataErrors([{}]);
    setListView(true);
    try {
      const results = await apiCalls('get', `/goalsController/getAppraiserById?id=${row.original.id}`);
      console.log('Edit API Response:', results);
      if (results.status === true) {
        const item = results.paramObjectsMap.appraiserVO;
        setFormData({
          createdBy: createdBy,
          modifiedBy: createdBy,
          orgId: parseInt(orgId),
          finYear: '2025',
          appraisalID: item.appraisalId,
          supervisorCode: item.supCode,
          supervisorName: item.supName,
          code: item.empCode,
          name: item.empName,
          department: item.department
        });
        setTableData(
          item.appraiserDetailsVO.map((data) => ({
            id: data.id,
            area: data.area,
            goals: data.goals,
            keyPerformanceIndicator: data.keyPerformanceIndicator,
            remarks: data.reMarks,
            score: parseInt(data.score),
            input: data.input
          }))
        );
      } else {
        console.warn('Error fetching product details:', results.paramObjectsMap?.errorMessage);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const getAllData = async () => {
    try {
      const res = await apiCalls('get', `/goalsController/getAppraiserByOrgId?orgId=${orgId}`);
      setListViewData(res.paramObjectsMap.appraiserVO.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setListView(!listView);
  };

  const getScoreByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/goalsController/getScoreByOrgId?orgId=${orgId}`);
      setScoreAllData(result.paramObjectsMap.scoreVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };
  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleAllClear} />
            <ActionButton title="Save" icon={SaveIcon} margin="0 10px 0 10px" onClick={handleSave} />
          </div>
        </div>

        {!listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={rowEditgetbyid}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Appraisal ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="appraisalID"
                  value={formData.appraisalID}
                  onChange={handleInputChange}
                  error={!!fieldErrors.appraisalID}
                  helperText={fieldErrors.appraisalID}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl variant="outlined" size="small" error={!!fieldErrors.supervisorCode} fullWidth>
                  <InputLabel id="supervisorCode-label">Supervisor Code</InputLabel>
                  <Select
                    labelId="supervisorCode-label"
                    label="Supervisor Code"
                    name="supervisorCode"
                    value={formData.supervisorCode}
                    onChange={handleInputChange}
                  >
                    {supervisorsCode?.map((row) => (
                      <MenuItem key={row.id} value={row.reportingPersonCode}>
                        {row.reportingPersonCode}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.supervisorCode && <FormHelperText>{fieldErrors.supervisorCode}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Supervisor Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="supervisorName"
                  disabled
                  value={formData.supervisorName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl variant="outlined" size="small" error={!!fieldErrors.code} fullWidth>
                  <InputLabel id="code-label">Code</InputLabel>
                  <Select labelId="code-label" label="Code" name="code" onChange={handleInputChange} value={formData.code}>
                    {empDetails?.map((row) => (
                      <MenuItem key={row.id} value={row.empName}>
                        {row.empName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.code && <FormHelperText>{fieldErrors.code}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="name"
                  disabled
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Department"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="department"
                  disabled
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                  label="Active"
                  labelPlacement="end"
                />
              </div> */}
            </div>

            {/*  */}
            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                  <Tab value={0} label="Inputs" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <>
                      <div className="mb-1">
                        <ActionButton title="Fill Grid" icon={GridOnIcon} onClick={handleFullGrid} />
                      </div>
                    </>
                    <div className="row mt-2">
                      <div className="col-lg-12">
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr
                                style={{
                                  background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                  color: 'white'
                                }}
                              >
                                <th className="px-2 py-2 text-white text-center" style={{ width: '5%' }}>
                                  S.No
                                </th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '18%' }}>
                                  Area
                                </th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '18%' }}>
                                  keyPerformanceIndicator
                                </th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '18%' }}>
                                  Goals
                                </th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '18%' }}>
                                  Remarks
                                </th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '18%' }}>
                                  Supervisor 1 Rating
                                </th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '5%' }}>
                                  Score
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {tableData.length > 0 && tableData.some((row) => row.area || row.goals || row.keyPerformanceIndicator) ? (
                                tableData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="text-center pt-3">{index + 1}</td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.area}
                                        disabled
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTableData((prev) =>
                                            prev.map((rowData) => (rowData.id === row.id ? { ...rowData, area: value } : rowData))
                                          );
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.keyPerformanceIndicator}
                                        disabled
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTableData((prev) =>
                                            prev.map((rowData) =>
                                              rowData.id === row.id ? { ...rowData, keyPerformanceIndicator: value } : rowData
                                            )
                                          );
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.goals}
                                        disabled
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTableData((prev) =>
                                            prev.map((rowData) => (rowData.id === row.id ? { ...rowData, goals: value } : rowData))
                                          );
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.remarks}
                                        disabled
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTableData((prev) =>
                                            prev.map((rowData) => (rowData.id === row.id ? { ...rowData, remarks: value } : rowData))
                                          );
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <FormControl variant="outlined" size="small" error={!!tableDataErrors[index]?.input} fullWidth>
                                        <InputLabel id="input-label">Rating</InputLabel>
                                        <Select
                                          labelId="input-label"
                                          label="Rating"
                                          name="input"
                                          value={row.input}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const selectedScore = scoreAllData.find((item) => item.input === value)?.score || '';
                                            setTableData((prev) =>
                                              prev.map((rowData) =>
                                                rowData.id === row.id ? { ...rowData, input: value, score: selectedScore } : rowData
                                              )
                                            );
                                            setTableDataErrors((prev) => {
                                              const newErrors = Array.isArray(prev) ? [...prev] : [];
                                              newErrors[index] = { ...newErrors[index], input: '' };
                                              return newErrors;
                                            });
                                          }}
                                        >
                                          {scoreAllData?.map((row) => (
                                            <MenuItem key={row.id} value={row.input}>
                                              {row.input}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                        {tableDataErrors.input && <FormHelperText>{tableDataErrors.input}</FormHelperText>}
                                      </FormControl>
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={row.score}
                                        disabled
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTableData((prev) =>
                                            prev.map((rowData) => (rowData.id === row.id ? { ...rowData, score: value } : rowData))
                                          );
                                        }}
                                      />
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7} className="text-center">
                                    No data available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Box>
              <Dialog
                open={modalOpen}
                maxWidth={'md'}
                fullWidth={true}
                onClose={handleCloseModal}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
              >
                <DialogTitle textAlign="center" style={{ cursor: 'move' }} id="draggable-dialog-title">
                  <h6>Grid Details</h6>
                </DialogTitle>
                <DialogContent className="pb-0">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr style={{ background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)', color: 'white' }}>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                <Checkbox
                                  sx={{
                                    color: 'white',
                                    '&.Mui-checked': {
                                      color: 'white'
                                    }
                                  }}
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                />
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '10%' }}>
                                S.No
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '25%' }}>
                                Area
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '25%' }}>
                                keyPerformanceIndicator
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '25%' }}>
                                Goals
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '25%' }}>
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {fillGridData?.map((row, index) => (
                              <tr key={row.id}>
                                <td className="border p-0 text-center">
                                  <Checkbox
                                    sx={{
                                      // borderColor: 'white',
                                      // color: 'white'
                                      backgroundColor: 'white'
                                    }}
                                    checked={selectedRows.includes(index)}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setSelectedRows((prev) => (isChecked ? [...prev, index] : prev.filter((i) => i !== index)));
                                    }}
                                  />
                                </td>
                                <td className="text-center">{index + 1}</td>
                                <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                  {row.area || ''}
                                </td>
                                <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                  {row.keyPerformanceIndicator || ''}
                                </td>
                                <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                  {row.goals || ''}
                                </td>
                                <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                  {row.remarks || ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }} className="pt-0">
                  <Button onClick={handleCloseModal} sx={{ color: 'red' }}>
                    Cancel
                  </Button>
                  <Button
                    color="secondary"
                    onClick={handleSubmitSelectedRows}
                    variant="contained"
                    sx={{
                      backgroundColor: 'green',
                      '&:hover': {
                        backgroundColor: 'green'
                      }
                    }}
                  >
                    Proceed
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </>
        )}

        {/*  */}
      </div>
    </>
  );
}

export default Appraiser;
