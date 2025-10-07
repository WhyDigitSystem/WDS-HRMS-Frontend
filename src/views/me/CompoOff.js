import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import emailjs from '@emailjs/browser';
import { Select, MenuItem, FormControl, FormHelperText, Checkbox, ListItemText } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export const CompoOff = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [empCode, setEmpCode] = useState(localStorage.getItem('employeeCode'));
  const [empName, setEmpName] = useState(localStorage.getItem('employeeName'));
  const [department, setDepartment] = useState(localStorage.getItem('department'));
  const [designation, setDesignation] = useState(localStorage.getItem('designation'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [isLoading, setIsLoading] = useState(false);
  const [notifyList, setNotifyList] = useState([]);
  const [notifyEmail, setNotifyEmail] = useState([]);
  const [allReportingPersonList, setAllReportingPersonList] = useState([]);
  const [allCompoOff, setAllCompoOff] = useState([]);
  const lastRowRef = useRef(null);
  const [weekOffDays, setWeekOff] = useState([]);
  const [holidayList, setHolidayList] = useState([]);

  const [editId, setEditId] = useState('');
  const [leaveTypeTable, setLeaveTypeTable] = useState([
    {
      id: 1,
      compoOff: null,
      compoOffDay: '',
      assignedBy: '',
      description: '',
      notify: '',
      reportingPerson: ''
    }
  ]);
  const [leaveTypeErrors, setLeaveTypeErrors] = useState([
    {
      compoOff: null,
      compoOffDay: '',
      assignedBy: '',
      description: '',
      notify: '',
      reportingPerson: ''
    }
  ]);
  const [listView, setListView] = useState(false);

  useEffect(() => {
    getAllNotify();
    getAllReportingPersonList();
  }, []);
  const getAllNotify = async () => {
    try {
      const result = await apiCalls('get', `employeemaster/getReportingPerson?employeeCode=${empCode}&orgId=${orgId}`);
      const notifyOptions = result?.paramObjectsMap?.PermisionRequestVO || [];
      setNotifyList(notifyOptions);
      setNotifyEmail(notifyOptions.notifyEmail);
      console.log('Email', notifyOptions.notifyEmail);
      console.log('Notify Options:', notifyOptions);
    } catch (err) {
      console.log('Error fetching notify list', err);
    }
  };
  const getAllReportingPersonList = async () => {
    try {
      const result = await apiCalls(
        'get',
        `master/getReportingNameForEmployee?branchCode=${branchCode}&employeeCode="Undefined"&orgId=${orgId}`
      );
      const notifyOptions = result?.paramObjectsMap?.employeeVO || [];
      setAllReportingPersonList(notifyOptions);
      console.log('Notify Options:', notifyOptions);
    } catch (err) {
      console.log('Error fetching notify list', err);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleAddRow = () => {
    const editableRows = leaveTypeTable.filter((row) => !row.disabled);
    const lastEditableIndex = editableRows.length - 1;
    const lastRow = editableRows[lastEditableIndex];

    if (!lastRow) {
      // No editable rows, allow adding
    } else {
      const errors = {
        compoOff: !lastRow.compoOff ? 'Compensatory Off Date is required' : '',
        assignedBy: !lastRow.assignedBy ? 'Assigned By is required' : '',
        description: !lastRow.description ? 'Description is required' : '',
        notify: !lastRow.notify || lastRow.notify.length === 0 ? 'Notify is required' : ''
      };

      const hasErrors = Object.values(errors).some(Boolean);
      if (hasErrors) {
        setLeaveTypeErrors((prev) => {
          const updated = [...prev];
          const actualIndex = leaveTypeTable.findIndex((r) => r.id === lastRow.id);
          updated[actualIndex] = errors;
          return updated;
        });
        return;
      }
    }

    const newRow = {
      id: Date.now(),
      compoOff: null,
      compoOffDay: '',
      assignedBy: '',
      description: '',
      notify: [],
      disabled: false
    };

    setLeaveTypeTable((prev) => [...prev, newRow]);
    setLeaveTypeErrors((prev) => [...prev, { compoOff: '', assignedBy: '', description: '', notify: '' }]);
  };

  const handleClear = () => {
    setLeaveTypeTable([
      {
        id: Date.now(),
        compoOff: null,
        compoOffDay: '',
        assignedBy: '',
        description: '',
        notify: ''
      }
    ]);

    setLeaveTypeErrors([
      {
        compoOff: '',
        description: '',
        notify: '',
        assignedBy: ''
      }
    ]);
    getAllCompoOff();
  };

  useEffect(() => {
    getCompanyWeekOff();
    getHolidayReport();
  }, []);

  // Fetch company week off days
  const getCompanyWeekOff = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/company/${orgId}`);
      const weekOffList = result.paramObjectsMap.companyVO[0].companyWeekOffVO || [];
      setWeekOff(weekOffList); // ← Save full rule objects
    } catch (error) {
      console.error('Error fetching week offs:', error);
    }
  };

  // Fetch holidays list
  const getHolidayReport = async () => {
    try {
      const result = await apiCalls('get', `basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);
      const holidays = result.paramObjectsMap.holidayVO.map((item) => ({
        holidayDate: item.holidayDate, // yyyy-mm-dd
        day: item.day.toUpperCase(),
        festival: item.festival
      }));
      setHolidayList(holidays);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const isDateEnabled = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const isHoliday = holidayList.some((h) => h.holidayDate === dateStr);

    let isWeekOff = false;

    for (const rule of weekOffDays) {
      if (!rule.weekOffDays || !Array.isArray(rule.weekNumbers)) continue;

      const ruleDay = rule.weekOffDays.toUpperCase();

      if (ruleDay === dayName) {
        const weekNumber = Math.ceil(date.getDate() / 7); // e.g., 1st Saturday = 1
        if (rule.weekNumbers.includes(-1)) {
          isWeekOff = true; // all Sundays, etc.
        } else if (rule.weekNumbers.includes(weekNumber)) {
          isWeekOff = true;
        }
      }

      if (isWeekOff) break; // no need to check more
    }

    return (isWeekOff || isHoliday) && date <= today;
  };

  // Get compoOffDay text for a selected date
  // const getCompoOffDayText = (dateStr) => {
  //   if (!dateStr) return '';

  //   const date = new Date(dateStr);
  //   const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  //   // Check week off
  //   if (weekOffDays.includes(dayName)) {
  //     return `Week-Off - ${dayName}`;
  //   }

  //   // Check holiday
  //   const holiday = holidayList.find((h) => h.holidayDate === dateStr);
  //   if (holiday) {
  //     return `${holiday.festival} - ${holiday.day}`;
  //   }

  //   return '';
  // };

  const getCompoOffDayText = (dateStr) => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const weekNumber = Math.ceil(date.getDate() / 7);

    // Check holiday first
    const holiday = holidayList.find((h) => h.holidayDate === dateStr);
    if (holiday) {
      return `${holiday.festival} - ${holiday.day}`;
    }

    // Check week off
    for (const rule of weekOffDays) {
      if (!rule.weekOffDays || !Array.isArray(rule.weekNumbers)) continue;

      const ruleDay = rule.weekOffDays.toUpperCase();

      if (ruleDay === dayName) {
        if (rule.weekNumbers.includes(-1) || rule.weekNumbers.includes(weekNumber)) {
          return `WeekOff - ${dayName}`;
        }
      }
    }

    return '';
  };

  const formatDate = (date) => {
    return format(date, 'yyyy-MM-dd'); // formats using local timezone
  };

  const handleDateChange = (date, id) => {
    const selectedDateStr = formatDate(date);

    setLeaveTypeTable((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              compoOff: selectedDateStr,
              compoOffDay: getCompoOffDayText(selectedDateStr)
            }
          : row
      )
    );

    setLeaveTypeErrors((prev) =>
      prev.map((err, index) =>
        leaveTypeTable[index].id === id ? { ...err, compoOff: selectedDateStr ? '' : 'Compo Off is required' } : err
      )
    );
  };

  // ✅ Updated: handle description + clear error
  const handleDescriptionChange = (e, id) => {
    const newValue = e.target.value;

    setLeaveTypeTable((prev) => prev.map((row) => (row.id === id ? { ...row, description: newValue } : row)));

    setLeaveTypeErrors((prev) =>
      prev.map((err, index) => (leaveTypeTable[index].id === id ? { ...err, description: newValue ? '' : 'Description is required' } : err))
    );
  };

  // Update assignedBy handler
  const handleAssignedByChange = (e, id, index) => {
    const selectedCode = e.target.value;
    const selectedPerson = allReportingPersonList.find((p) => p.employeeName === selectedCode);

    setLeaveTypeTable((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              assignedBy: selectedCode,
              assignedByName: selectedPerson ? `${selectedPerson.role} - ${selectedPerson.employeeName}` : ''
            }
          : row
      )
    );

    // Clear error
    setLeaveTypeErrors((prev) =>
      prev.map((err, idx) => (idx === index ? { ...err, assignedBy: selectedCode ? '' : err.assignedBy } : err))
    );
  };

  // Update notify handler
  const handleNotifyChange = (e, id, index) => {
    const selectedValues = e.target.value;

    setLeaveTypeTable((prev) => prev.map((row) => (row.id === id ? { ...row, notify: selectedValues } : row)));

    // Clear error
    setLeaveTypeErrors((prev) =>
      prev.map((err, idx) => (idx === index ? { ...err, notify: selectedValues.length > 0 ? '' : err.notify } : err))
    );
  };

  const handleSave = async () => {
    // 1. Get only editable rows (new unsaved rows)
    const editableRows = leaveTypeTable.filter((row) => !row.disabled);

    // 2. Validate only editable rows
    const allErrors = [];
    let hasAnyErrors = false;

    editableRows.forEach((row) => {
      const rowErrors = {
        compoOff: !row.compoOff ? 'Compensatory Off Date is required' : '',
        assignedBy: !row.assignedBy ? 'Assigned By is required' : '',
        description: !row.description ? 'Description is required' : '',
        notify: !row.notify || row.notify.length === 0 ? 'Notify is required' : ''
      };
      allErrors.push(rowErrors);
      if (Object.values(rowErrors).some(Boolean)) hasAnyErrors = true;
    });

    // 3. Map validation errors back to the full table
    const mergedErrors = leaveTypeTable.map((row) => {
      const index = editableRows.findIndex((r) => r.id === row.id);
      return row.disabled
        ? { compoOff: '', assignedBy: '', description: '', notify: '' }
        : allErrors[index] || { compoOff: '', assignedBy: '', description: '', notify: '' };
    });

    setLeaveTypeErrors(mergedErrors);

    if (hasAnyErrors) {
      showToast('error', 'Please fix all required fields before saving');
      return;
    }

    // 4. Prepare payload from editable rows
    const finalPayload = editableRows.map((row) => {
      const selectedNotifyPersons = allReportingPersonList.filter((person) => (row.notify || []).includes(person.employeeCode));

      const firstNotifyPerson = notifyList?.[0] || {};

      return {
        screenName: 'COMPENSATORY OFF',
        assignedBy: row.assignedBy,
        branch,
        branchCode,
        compOffDate: row.compoOff,
        compOffDay: row.compoOffDay,
        compoffNotifyDTO: selectedNotifyPersons.map((person) => ({
          notify2: person.employeeName,
          notify2Code: person.employeeCode,
          notify2Email: person.email
        })),
        createdBy: loginUserName,
        department,
        designation,
        employeeCode: empCode,
        employeeName: empName,
        leaveCode: 'COMP-OFF',
        leaveType: 'Compensatory Off',
        notes: row.description,
        notify: firstNotifyPerson.reportingPerson || '',
        notifyCode: firstNotifyPerson.reportingPersonCode || '',
        notifyEmail: firstNotifyPerson.email || '',
        orgId: parseInt(orgId),
        totalDays: 1
      };
    });

    // 5. Submit the data
    setIsLoading(true);

    try {
      const result = await apiCalls('put', 'leaveprocess/createUpdateCompOff', finalPayload);

      if (result.status === true) {
        // const newId = result.paramObjectsMap.compensatoryOffVO?.id;
        // console.log('newId', newId);
        // if (newId) {
        //   finalPayload.id = newId; // 🔁 Add the ID to sendEmailNotification payload
        // }
        if (Array.isArray(result.paramObjectsMap.compensatoryOffVO)) {
          const newId = result.paramObjectsMap.compensatoryOffVO[0]?.id;

          if (newId) {
            finalPayload[0].id = newId; // ✅ Assign ID to the first payload object
          }
        }
        showToast('success', 'Compensatory Off saved successfully');
        await sendEmailNotification(finalPayload);

        // ✅ Mark all editable rows as saved (disabled)
        setLeaveTypeTable((prev) => prev.map((row) => (!row.disabled ? { ...row, disabled: true } : row)));

        setLeaveTypeErrors([]); // Clear errors
        // Optional: reset editId or form if needed
        // handleClear(); // Uncomment if you want to clear the form
        getAllCompoOff(); // Refresh from server
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Compo Off creation failed');
      }
    } catch (err) {
      console.error('Error:', err);
      showToast('error', 'Compo Off creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailNotification = async (newRows) => {
    try {
      for (const row of newRows) {
        const notify2Emails = (row.compoffNotifyDTO || []).map((p) => p.notify2Email).join(', ');

        const baseURL = 'http://139.5.190.244:8042/pages/confirmationPage/confirmationPage'; // 🔁 Replace with real backend URL
        const approveLink = `${baseURL}?id=${row.id}&action=APPROVED&employeeCode=${row.employeeCode}&actionBy=${empName}&orgId=${orgId}&notifyCode=${row.notifyCode}&notify=${row.notify}&screenName=${row.screenName}`;
        const rejectLink = `${baseURL}?id=${row.id}&action=REJECTED&employeeCode=${row.employeeCode}&actionBy=${empName}&orgId=${orgId}&notifyCode=${row.notifyCode}&notify=${row.notify}&screenName=${row.screenName}`;

        const emailParams = {
          name: row.notify,
          from_name: empName,
          compOffDate: row.compOffDate,
          email: row.notifyEmail,
          notify2Email: notify2Emails,
          notes: row.notes,
          // approve_link: `/team/LeaveApproval/${row.id || 'leave_request_id'}`
          compoOff_id: row.id,
          approve_link: approveLink,
          reject_link: rejectLink,
          notifyCode: row.notifyCode,
          notify: row.notify,
          screenName: row.screenName
        };

        console.log('Email Params:', emailParams);

        if (!emailParams.email) {
          console.error('Error: Recipient email is missing!');
          showToast('error', 'Recipient email is missing!');
          continue;
        }

        await emailjs.send('service_y4jqb7q', 'template_j3mr5vl', emailParams, '4wxbCMaMoQh0TD6tx');
        console.log('Email Sent Successfully for', emailParams.email);
      }
    } catch (error) {
      console.error('Email Sending Failed:', error);
      showToast('error', 'Failed to send email notification. Please try again.');
    }
  };

  const getAllCompoOff = async () => {
    try {
      const response = await apiCalls('get', `leaveprocess/getCompensatoryOffByOrgId?empCode=${empCode}&orgId=${orgId}`);

      console.log('API response:', response);

      if (response.status && response.paramObjectsMap?.compensatoryOffVO && Array.isArray(response.paramObjectsMap.compensatoryOffVO)) {
        const fetchedRows = response.paramObjectsMap.compensatoryOffVO.map((item, index) => ({
          id: item.id || Date.now() + index,
          compoOff: item.compOffDate || null,
          compoOffDay: item.compOffDay || '',
          assignedBy: item.assignedBy || '',
          description: item.notes || '',
          notify: Array.isArray(item.compoffNotifyVO) ? item.compoffNotifyVO.map((n) => n.notify2 || '').filter(Boolean) : [],
          disabled: true
        }));

        setLeaveTypeTable(fetchedRows);
        setLeaveTypeErrors(
          fetchedRows.map(() => ({
            compoOff: '',
            assignedBy: '',
            description: '',
            notify: ''
          }))
        );
      } else {
        setLeaveTypeTable([]);
        setLeaveTypeErrors([]);
        showToast('error', 'No compensatory off data found');
      }
    } catch (error) {
      console.error('Error fetching comp-off data:', error);
      showToast('error', 'Failed to fetch comp-off data');
    }
  };

  useEffect(() => {
    getAllCompoOff();
  }, []);

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
        <>
          <div className="row d-flex ml">
            <div className="mb-1">
              <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
            </div>
            <div className="row mt-2">
              <div className="col-lg-12">
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table table-bordered ">
                    {/* <thead>
                      <tr style={{ background: 'linear-gradient(193deg, #009d90 30%, #7bb9b4 90%)', color: 'white' }}> */}
                    <thead
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%, #2a4b4d 90%)',
                        color: 'white'
                      }}
                    >
                      <tr>
                        {/* <th className="px-2 py-2 text-center" style={{ width: '68px' }}>
                          Action
                        </th> */}
                        <th className="px-2 py-2 text-center" style={{ width: '50px' }}>
                          S.No
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Compensatory Off Date
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Compensatory Off Day
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Assigned By
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Area of Description
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Notify
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {Array.isArray(leaveTypeTable) &&
                        leaveTypeTable.map((row, index) => (
                          <tr key={row.id}>
                            <td className="text-center">
                              <div className="pt-2">{index + 1}</div>
                            </td>
                            <td className="border px-2 py-2">
                              <DatePicker
                                selected={row.compoOff ? new Date(row.compoOff) : null}
                                onChange={(date) => handleDateChange(date, row.id)}
                                dateFormat="yyyy-MM-dd"
                                filterDate={(date) => isDateEnabled(formatDate(date))} // use updated formatDate
                                placeholderText="Select comp-off date"
                                className={`form-control ${leaveTypeErrors[index]?.compoOff ? 'is-invalid' : ''}`}
                                disabled={row.disabled}
                              />
                              {leaveTypeErrors[index]?.compoOff && <div className="text-danger">{leaveTypeErrors[index].compoOff}</div>}
                            </td>

                            <td className="border px-2 py-2">
                              <input type="text" className="form-control" value={row.compoOffDay || ''} readOnly />
                            </td>
                            <td className="border px-2 py-2">
                              <select
                                value={row.assignedBy || ''}
                                onChange={(e) => handleAssignedByChange(e, row.id, index)}
                                className={`form-control ${leaveTypeErrors[index]?.assignedBy ? 'is-invalid' : ''}`}
                                disabled={row.disabled}
                              >
                                <option value="">Select Option</option>
                                {allReportingPersonList.map((person) => (
                                  <option key={person.employeeCode} value={person.employeeName}>
                                    {person.role} - {person.employeeName}
                                  </option>
                                ))}
                              </select>
                              {leaveTypeErrors[index]?.assignedBy && <div className="text-danger">{leaveTypeErrors[index].assignedBy}</div>}
                            </td>
                            <td className="border px-2 py-2">
                              <input
                                type="text"
                                value={row.description}
                                disabled={row.disabled}
                                className={`form-control ${leaveTypeErrors[index]?.description ? 'is-invalid' : ''}`}
                                onChange={(e) => handleDescriptionChange(e, row.id)}
                              />
                              {leaveTypeErrors[index]?.description && (
                                <div className="text-danger">{leaveTypeErrors[index].description}</div>
                              )}
                            </td>
                            <td className="border px-2 py-2">
                              <FormControl fullWidth error={Boolean(leaveTypeErrors[index]?.notify)}>
                                <Select
                                  multiple
                                  displayEmpty
                                  value={row.notify?.length ? row.notify : []}
                                  disabled={row.disabled}
                                  onChange={(e) => handleNotifyChange(e, row.id, index)}
                                  renderValue={(selected) =>
                                    selected.length === 0 ? (
                                      <em>Select Reporting Person</em>
                                    ) : (
                                      selected
                                        .map((code) => allReportingPersonList.find((p) => p.employeeCode === code)?.employeeName || code)
                                        .join(', ')
                                    )
                                  }
                                  size="small"
                                >
                                  <MenuItem disabled value="">
                                    <em>Select Reporting Person</em>
                                  </MenuItem>
                                  {allReportingPersonList.map((person) => (
                                    <MenuItem key={person.employeeCode} value={person.employeeCode}>
                                      <Checkbox checked={row.notify?.includes(person.employeeCode)} />
                                      <ListItemText primary={person.employeeName} />
                                    </MenuItem>
                                  ))}
                                </Select>
                                {leaveTypeErrors[index]?.notify && <FormHelperText>{leaveTypeErrors[index].notify}</FormHelperText>}
                              </FormControl>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
      <div>
        <ToastComponent />
      </div>
    </>
  );
};
export default CompoOff;
