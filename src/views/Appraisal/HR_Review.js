import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { useEffect, useState } from 'react';
import ActionButton from 'utils/ActionButton';
import { useForm } from 'react-hook-form';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';
import apiCalls from 'apicall';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import Slide from '@mui/material/Slide';
import * as React from 'react';
const Transition = React.forwardRef(function Transition(props, ref) {
  return (
    <Slide
      direction="down"
      ref={ref}
      {...props}
      timeout={{
        appear: 1000,
        enter: 1000,
        exit: 1000
      }}
    />
  );
});
const HR_Review = () => {
  // const paginationModel = { page: 0, pageSize: 5 };
  const Engagement = [{ value: 'Yes' }, { value: 'No' }];
  const Status = [{ value: 'Promoted' }, { value: 'Not Promoted' }];
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(true);
  const [listView, setListView] = useState(true);
  const [editId, setEditId] = useState(null);
  const [listViewData, setListViewData] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const orgId = localStorage.getItem('orgId');
  const finYear = localStorage.getItem('finYear');
  const createdBy = localStorage.getItem('userName');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      code: '',
      name: '',
      promotion: '',
      increment: '',
      score: 0,
      engagement: '',
      status: '',
      hrRemarks: ''
    }
  });

  const handleClear = () => {
    setEditId(null);
    setSelectedRow(null);
    reset({
      code: watch('code'),
      name: watch('name'),
      promotion: '',
      increment: '',
      score: 0,
      engagement: '',
      status: '',
      hrRemarks: ''
    });
  };

  const handleListView = () => {
    setListView(!listView);
  };

  useEffect(() => {
    getAllData();
    getAllEmployees();
  }, []);

  const getAllEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await apiCalls('get', `/employeemaster/getAllEmployeeByActive?orgId=${orgId}`);
      if (response.status === true) {
        setAllEmployees(response.paramObjectsMap.employeeVO);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const getAllData = async () => {
    try {
      const res = await apiCalls('get', `/goalsController/getHrReviewByOrgId?orgId=${orgId}`);
      setListViewData(res.paramObjectsMap.hrReviewVO.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const rowEditgetbyid = async (row) => {
    setEditId(row.original.id);
    setListView(true);
    handleCloseDialog();
    try {
      const results = await apiCalls('get', `/goalsController/getHrReviewById?id=${row.original.id}`);
      if (results.status === true) {
        const item = results.paramObjectsMap.hrReviewVO;
        reset({
          code: item.code || '',
          name: item.name || '',
          promotion: item.elgibilityOfPromption || '',
          increment: item.elgibilityOfIncrement || '',
          score: parseInt(item.score || 0),
          engagement: item.adheranceOfEmployeeEngagement || '',
          status: item.promotionStatus || '',
          hrRemarks: item.remrks || ''
        });
      } else {
        showToast('error', results.paramObjectsMap?.errorMessage || 'Error fetching details');
      }
    } catch (error) {
      showToast('error', 'Error fetching details');
    }
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();
    const sendData = {
      ...(editId && { id: editId }),
      code: data.code,
      name: data.name,
      elgibilityOfPromption: data.promotion,
      elgibilityOfIncrement: data.increment,
      score: parseInt(data.score),
      adheranceOfEmployeeEngagement: data.engagement,
      promotionStatus: data.status,
      remrks: data.hrRemarks,
      orgId: parseInt(orgId),
      finYear: finYear,
      createdBy: createdBy
    };
    try {
      const result = await apiCalls('put', 'goalsController/createUpdateHrReview', sendData);
      if (result.status) {
        showToast('success', editId ? 'Updated Successfully' : 'Created Successfully');
        getAllData();
        handleClear();
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Creation failed');
      }
    } catch (error) {
      showToast('error', 'API call failed');
    }
  };

  const listViewColumns = [
    { accessorKey: 'code', header: 'Code', size: 140 },
    { accessorKey: 'name', header: 'Name', size: 140 },
    { accessorKey: 'score', header: 'Score', size: 140 }
  ];

  const columns = [
    { field: 'employeeCode', headerName: 'Employee Code', width: 130 },
    { field: 'employeeName', headerName: 'Employee Name', width: 130 }
  ];

  const handleEmployeeSelect = () => {
    if (!selectedRow) {
      showToast('error', 'Please select an employee');
      return;
    }
    setValue('code', selectedRow.employeeCode || '');
    setValue('name', selectedRow.employeeName || '');
    trigger(['code', 'name']);
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <ToastContainer />
      {(!open || !listView) && (
        <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
          <div className="row d-flex ml">
            <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleListView} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="Save" icon={SaveIcon} onClick={handleSubmit(onSubmit)} />
            </div>
            {listView ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row d-flex ml">
                  {/* Code */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      label={
                        <span>
                          Code<span style={{ color: 'red' }}> *</span>
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      name="code"
                      value={watch('code') || ''}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      {...register('code', { required: 'Code is required' })}
                      error={!!errors.code}
                      helperText={errors.code?.message}
                    />
                  </div>

                  {/* Name */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      label={
                        <span>
                          Name<span style={{ color: 'red' }}> *</span>
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      name="name"
                      value={watch('name') || ''}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      {...register('name', { required: 'Name is required' })}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </div>
                  {!editId && (
                    <div className="col-md-3 mb-3">
                      <ActionButton title="Open Employee List" icon={FileOpenIcon} onClick={() => setOpen(true)} />
                    </div>
                  )}
                </div>

                <div className="row d-flex ml mt-3">
                  <div className="mt-0 pb-3 fw-bold">Supervisor 1 Feedback</div>

                  {/* Promotion */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      label={
                        <span>
                          Eligibility for Promotion <span style={{ color: 'red' }}> *</span>
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      name="promotion"
                      value={watch('promotion') || ''}
                      fullWidth
                      {...register('promotion', { required: 'Eligibility for Promotion is required' })}
                      error={!!errors.promotion}
                      helperText={errors.promotion?.message}
                    />
                  </div>
                  {/* Increment */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      // label="Eligibility for Increment"
                      label={
                        <span>
                          Eligibility for Increment <span style={{ color: 'red' }}> *</span>
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      name="increment"
                      value={watch('increment') || ''}
                      fullWidth
                      {...register('increment', { required: 'Eligibility for Increment is required' })}
                      error={!!errors.increment}
                      helperText={errors.increment?.message}
                    />
                  </div>
                  {/* Score */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      // label="Score"
                      label={
                        <span>
                          Score <span style={{ color: 'red' }}> *</span>
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      name="score"
                      value={watch('score') ?? 0}
                      fullWidth
                      {...register('score', {
                        required: 'Score is required',
                        pattern: {
                          value: /^[0-9]*$/,
                          message: 'Only allowed numbers'
                        }
                      })}
                      error={!!errors.score}
                      helperText={errors.score?.message}
                    />
                  </div>
                  {/* Engagement */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      id="outlined-basic"
                      // label="Adherance to Employee Engagement Plan"
                      label={
                        <span>
                          Adherance to Employee Engagement Plan <span style={{ color: 'red' }}> *</span>
                        </span>
                      }
                      select
                      size="small"
                      fullWidth
                      variant="outlined"
                      name="engagement"
                      value={watch('engagement') || ''}
                      {...register('engagement', { required: 'Adherance to Employee Engagement Plan is required' })}
                      onChange={(e) => {
                        setValue('engagement', e.target.value);
                        trigger('engagement');
                      }}
                      error={!!errors.engagement}
                      helperText={errors.engagement?.message}
                    >
                      {Engagement.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  {/* Promotion Status */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      id="outlined-basic"
                      // label="Promotion Status"
                      label={
                        <span>
                          Promotion Status <span style={{ color: 'red' }}> *</span>
                        </span>
                      }
                      select
                      size="small"
                      fullWidth
                      variant="outlined"
                      name="status"
                      value={watch('status') || ''}
                      {...register('status', { required: 'Promotion Status is required' })}
                      onChange={(e) => {
                        setValue('status', e.target.value);
                        trigger('status');
                      }}
                      error={!!errors.status}
                      helperText={errors.status?.message}
                    >
                      {Status.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                  {/* HR Remarks */}
                  <div className="col-md-3 mb-3">
                    <TextField
                      label="HR Remarks"
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      name="hrRemarks"
                      value={watch('hrRemarks') || ''}
                      {...register('hrRemarks')}
                    />
                  </div>

                  {/* isLoading Part */}
                  {isLoading && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '20px',
                        width: '100%'
                      }}
                    >
                      <CircularProgress size={40} />
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={true} toEdit={rowEditgetbyid} />
            )}
          </div>
        </div>
      )}
      {open && (
        <Dialog open={open} onClose={handleCloseDialog} TransitionComponent={Transition} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#f0f0f0', fontSize: '15px' }}>Select Employee</DialogTitle>
          <DialogContent>
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={allEmployees}
                columns={columns}
                // initialState={{ pagination: { paginationModel } }}
                // pageSizeOptions={[5, 10]}
                hideFooter={true}
                onRowClick={(params) => setSelectedRow(params.row)}
                sx={{ border: 0 }}
              />
            </Paper>
            <DialogActions>
              <Button variant="contained" color="error" size="small" onClick={handleCloseDialog} autoFocus>
                Close
              </Button>

              <Button variant="contained" size="small" onClick={handleEmployeeSelect} autoFocus>
                Select
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
export default HR_Review;
