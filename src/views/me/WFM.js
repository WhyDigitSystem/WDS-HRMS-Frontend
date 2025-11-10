import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { Autocomplete } from '@mui/material';
import emailjs from '@emailjs/browser';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { message } from 'antd';

const WFM = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode'));
  const [editId, setEditId] = useState('');
  const [companyList, setCompanyList] = useState([]);
  const [allReportingPersonList, setAllReportingPersonList] = useState([]);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });

  const [formData, setFormData] = useState({
    wfhDate: dayjs(),
    reportingManager: '',
    departmentHead: '',
    workAccomplished: '',
    reason: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    wfhDate: '',
    reportingManager: '',
    departmentHead: '',
    workAccomplished: '',
    reason: ''
  });

  const [listView, setListView] = useState(false);

  const listViewColumns = [
    { accessorKey: 'wfhDate', header: 'Date', size: 140 },
    { accessorKey: 'workAccomplished', header: 'Work Accomplished', size: 140 },
    { accessorKey: 'reportingManager', header: 'Reporting Manager', size: 140 },
    { accessorKey: 'departmentHead', header: 'Department Head', size: 140 },
    { accessorKey: 'status', header: 'Status', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllWorkFromHomeRequests();
    getNotifyList();
    getAllReportingPersonList();
  }, []);

  const getAllWorkFromHomeRequests = async () => {
    try {
      const response = await apiCalls('get', `/leaveprocess/getWorkFromHomeByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.workFromHomeVO || []);
      } else {
        showToast('error', response.message || 'Failed to fetch WFH records');
      }
    } catch (error) {
      console.error('Error fetching WFH records:', error);
      showToast('error', 'Failed to fetch WFH records');
    }
  };

  const getNotifyList = async () => {
    try {
      const result = await apiCalls('get', `employeemaster/getReportingPerson?employeeCode=${loginUserName}&orgId=${orgId}`);
      if (result?.paramObjectsMap?.PermisionRequestVO) {
        const notifyList = result.paramObjectsMap.PermisionRequestVO.map((person) => ({
          reportingPersonCode: person.reportingPersonCode,
          reportingPerson: person.reportingPerson,
          notifyEmail: person.email
        }));
        setCompanyList(notifyList);
      }
    } catch (error) {
      console.error('Error fetching reporting persons:', error);
    }
  };

  const getAllReportingPersonList = async () => {
    try {
      const result = await apiCalls(
        'get',
        `master/getReportingNameForEmployee?branchCode=${branchCode}&employeeCode="Undefined"&orgId=${orgId}`
      );
      const employeeList = result?.paramObjectsMap?.employeeVO || [];
      const mappedList = employeeList.map((emp) => ({
        label: emp.employeeName,
        code: emp.employeeCode,
        email: emp.email,
        role: emp.role
      }));
      setAllReportingPersonList(mappedList);
    } catch (err) {
      console.log('Error fetching notify list', err);
    }
  };

  const getWorkFromHomeById = async (row) => {
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/leaveprocess/getWorkFromHomeById?id=${row.original.id}`);
      if (response.status === true) {
        setListView(false);
        const wfhDetails = response.paramObjectsMap.workFromHomeVO;
        setFormData({
          wfhDate: dayjs(wfhDetails.wfhDate),
          workAccomplished: wfhDetails.workAccomplished || '',
          reason: wfhDetails.reason || '',
          reportingManager: wfhDetails.reportingManager || '',
          departmentHead: wfhDetails.departmentHead || ''
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'wfhDate' ? dayjs(value) : value
    }));
  };

  const handleClear = () => {
    setFormData({
      wfhDate: dayjs(),
      reportingManager: '',
      departmentHead: '',
      workAccomplished: '',
      reason: ''
    });
    setFieldErrors({
      wfhDate: '',
      reportingManager: '',
      departmentHead: '',
      workAccomplished: '',
      reason: ''
    });
    setEditId('');
    setListView(false);
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.wfhDate) errors.wfhDate = 'Date is required';
    if (!formData.workAccomplished) errors.workAccomplished = 'Work Accomplished is required';
    if (!formData.reason) errors.reason = 'Reason is required';
    if (!formData.reportingManager) errors.reportingManager = 'Reporting Manager is required';
    if (!formData.departmentHead) errors.departmentHead = 'Department Head is required';

    // Get reporting person and HOD data from list
    const reportingManagerObj = allReportingPersonList.find((person) => person.label === formData.reportingManager);
    const departmentHeadObj = allReportingPersonList.find((person) => person.label === formData.departmentHead);

    const reportingManagerEmail = reportingManagerObj?.email || '';
    const reportingManagerCode = reportingManagerObj?.code || '';
    const departmentHeadEmail = departmentHeadObj?.email || '';
    const departmentHeadCode = departmentHeadObj?.code || '';

    if (!reportingManagerEmail) errors.reportingManagerEmail = 'Reporting Manager email not found';
    if (!departmentHeadEmail) errors.departmentHeadEmail = 'Department Head email not found';

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveData = {
        ...(editId && { id: editId }),
        branch,
        branchCode,
        createdBy: loginUserName,
        departmentHead: formData.departmentHead,
        departmentHeadCode,
        departmentHeadEmail,
        employeeCode,
        employeeName,
        orgId: Number(orgId),
        reason: formData.reason,
        reportingManager: formData.reportingManager,
        reportingManagerCode,
        reportingManagerEmail,
        wfhDate: dayjs(formData.wfhDate).format('YYYY-MM-DD'),
        workAccomplished: formData.workAccomplished,
        finYear: dayjs().format('YYYY'),
      };

      try {
        const response = await apiCalls('put', '/leaveprocess/createUpdateWorkFromHome', saveData);

        if (response.status === true) {
          showToast('success', editId ? 'Work From Home Updated Successfully' : 'Work From Home Request created successfully');
          await sendEmailNotification(saveData);
          handleClear();
          getAllWorkFromHomeRequests();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Request failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Request failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const sendEmailNotification = async (newRows) => {
    try {
      for (const row of newRows) {
        const baseURL = 'http://localhost:3000/pages/confirmationPage/confirmationPage';
        const approveLink = `${baseURL}?id=${row.id}&action=APPROVED&employeeCode=${row.employeeCode}&actionBy=${employeeName}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${row.screenName}`;
        const rejectLink = `${baseURL}?id=${row.id}&action=REJECTED&employeeCode=${row.employeeCode}&actionBy=${employeeName}&orgId=${orgId}&notifyCode=${employeeCode}&notify=${employeeName}&screenName=${row.screenName}`;

        const emailParams = {
          name: row.reportingManager,
          from_name: employeeName,
          email: row.reportingManagerEmail,
          date: dayjs(row.wfhDate).format('DD-MM-YYYY'),
          message: row.reason,
          work_Accomplished: row.workAccomplished,
          approve_link: approveLink,
          reject_link: rejectLink,
          screenName: row.screenName || "WORKFROMHOME"
        };

        console.log('Email Params:', emailParams);

        if (!emailParams.email) {
          console.error('Error: Recipient email is missing!');
          showToast('error', 'Recipient email is missing!');
          continue;
        }

        // ✅ Send email with EmailJS
        await emailjs.send('service_ywei7br', 'template_rl5cfjh', emailParams, '-y3NVuC6et9lUpj0-');
        console.log('Email Sent Successfully for', emailParams.email);
      }
    } catch (error) {
      console.error('Email Sending Failed:', error);
      showToast('error', 'Failed to send email notification. Please try again.');
    }
  };
  
  const handleView = () => {
    setListView(!listView);
  };

  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: '' });
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>

        {listView ? (
          <div className="mt-0">
            <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={true} toEdit={getWorkFromHomeById} />
          </div>
        ) : (
          <>
            <div className="row">
              {/* WFH Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="WFH Date"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="wfhDate"
                  value={dayjs(formData.wfhDate).format('YYYY-MM-DD')}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldErrors.wfhDate}
                  helperText={fieldErrors.wfhDate}
                />
              </div>

              {/* Work Accomplished */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Work Accomplished"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="workAccomplished"
                  value={formData.workAccomplished}
                  onChange={handleInputChange}
                  error={!!fieldErrors.workAccomplished}
                  helperText={fieldErrors.workAccomplished}
                />
              </div>

              {/* Reason */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Reason"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  error={!!fieldErrors.reason}
                  helperText={fieldErrors.reason}
                />
              </div>

              {/* Reporting Manager */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={companyList}
                  getOptionLabel={(option) => option.reportingPerson || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={companyList.find((c) => c.reportingPerson === formData.reportingManager) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      reportingManager: newValue?.reportingPerson || ''
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting Manager"
                      name="reportingManager"
                      error={Boolean(fieldErrors.reportingManager)}
                      helperText={fieldErrors.reportingManager || ''}
                    />
                  )}
                />
              </div>

              {/* Department Head */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={allReportingPersonList}
                  getOptionLabel={(option) => option.label || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={allReportingPersonList.find((p) => p.label === formData.departmentHead) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      departmentHead: newValue?.label || ''
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Department Head"
                      name="departmentHead"
                      error={Boolean(fieldErrors.departmentHead)}
                      helperText={fieldErrors.departmentHead || ''}
                    />
                  )}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default WFM;
