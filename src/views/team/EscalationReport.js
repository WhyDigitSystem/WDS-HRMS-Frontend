import React, { useEffect, useState } from 'react';
import ActionButton from 'utils/ActionButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Autocomplete, TextField, Avatar, Stack, Alert } from '@mui/material';
import apiCalls from 'apicall';
import Slide from '@mui/material/Slide';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Card,
  CardContent
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const EscalationReport = () => {
  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');
  const [tableData, setTableData] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);

  const defaultFromDate = dayjs().subtract(30, 'day');
  const defaultToDate = dayjs();

  const [empList, setEmpList] = useState([]);
  const [loading, setLoading] = useState(false);

  const escalationTypeOptions = [
    { label: 'LATE CHECK IN OUT', value: 'LATECHECKINOUT' },
    { label: 'MISSING PUNCH', value: 'MISSINGPUNCH' },
    { label: 'ABSENT', value: 'ABSENT' },
    { label: 'CHECK IN OUT ADJUSTMENT', value: 'CHECKINOUTADJUSTMENT' },
    { label: 'PERMISSION', value: 'PERMISSION' },
    { label: 'LEAVE', value: 'LEAVE' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      fromDate: defaultFromDate,
      toDate: defaultToDate,
      employee: null,
      itemType: null
    }
  });

  const fromDate = watch('fromDate');
  const selectedItemType = watch('itemType');
  const selectedEmployee = watch('employee');
  console.log(watch('selectedItemType'));

  const getAllUsers = async () => {
    try {
      const response = await apiCalls('get', `master/getEmployeeNameAndCode?branchCode=${branchCode}&orgId=${orgId}`);

      if (response?.status) {
        const employees =
          response?.paramObjectsMap?.employeeVO?.map((emp) => ({
            ...emp,
            label: `${emp.employeeCode} - ${emp.employeeName || 'Unknown'}`
          })) || [];

        // setEmpList(employees);
        setEmpList([
          {
            employeeCode: 'ALL',
            employeeName: 'ALL',
            label: 'ALL - ALL'
          },
          ...employees
        ]);
      } else {
        setEmpList([]);
      }
    } catch (error) {
      console.error('Employee Fetch Error:', error);
      setEmpList([]);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const url =
        `/AttendanceLogController/attendanceEscalationReport` +
        `?orgId=${orgId}` +
        `&branchCode=${branchCode}` +
        `&employeeCode=${data.employee.employeeCode}` +
        `&itemType=${data.itemType.value}` +
        `&fromDate=${data.fromDate.format('YYYY-MM-DD')}` +
        `&toDate=${data.toDate.format('YYYY-MM-DD')}`;
      setOpenPopup(true);

      const response = await apiCalls('get', url);

      if (response?.status) {
        setTableData(response?.paramObjectsMap?.attendanceEscalationReport || []);
      } else {
        console.log(response?.message || 'No data found');
      }
    } catch (error) {
      console.error('Search Error:', error);
      console.log(error?.response?.data?.message || error?.message || 'Failed to fetch escalation report.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    reset({
      fromDate: defaultFromDate,
      toDate: defaultToDate,
      employee: null,
      itemType: null
    });
  };

  const handleClose = () => {
    setOpenPopup(false);
  };

  const groupedData = tableData.reduce((acc, item) => {
    if (!acc[item.employeeCode]) {
      acc[item.employeeCode] = {
        employeeCode: item.employeeCode,
        employeeName: item.employeeName,
        designation: item.designation,
        records: []
      };
    }

    acc[item.employeeCode].records.push(item);

    return acc;
  }, {});

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div
          className="card shadow-sm"
          style={{
            padding: '20px',
            borderRadius: '12px'
          }}
        >
          {/* Buttons */}
          <div className="d-flex gap-0 mb-4">
            <ActionButton title={loading ? 'Loading...' : 'Search'} icon={SearchIcon} onClick={handleSubmit(onSubmit)} disabled={loading} />

            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          </div>

          <form className="row">
            {/* From Date */}
            <div className="col-md-3 mb-3">
              <Controller
                name="fromDate"
                control={control}
                rules={{
                  required: 'From Date is required'
                }}
                render={({ field }) => (
                  <DatePicker
                    label="From Date *"
                    value={field.value}
                    onChange={field.onChange}
                    maxDate={dayjs()}
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!errors.fromDate,
                        helperText: errors.fromDate?.message
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* To Date */}
            <div className="col-md-3 mb-3">
              <Controller
                name="toDate"
                control={control}
                rules={{
                  required: 'To Date is required',
                  validate: (value) => (value.isBefore(fromDate) ? 'To Date should be greater than From Date' : true)
                }}
                render={({ field }) => (
                  <DatePicker
                    label="To Date *"
                    value={field.value}
                    onChange={field.onChange}
                    minDate={fromDate}
                    maxDate={dayjs()}
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!errors.toDate,
                        helperText: errors.toDate?.message
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* Employee */}
            <div className="col-md-3 mb-3">
              <Controller
                name="employee"
                control={control}
                rules={{
                  required: 'Employee is required'
                }}
                render={({ field }) => (
                  <Autocomplete
                    options={empList}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    getOptionLabel={(option) => option?.label || ''}
                    isOptionEqualToValue={(option, value) => option.employeeCode === value?.employeeCode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Employee *"
                        size="small"
                        error={!!errors.employee}
                        helperText={errors.employee?.message}
                      />
                    )}
                  />
                )}
              />
            </div>

            {/* Escalation Type */}
            <div className="col-md-3 mb-3">
              <Controller
                name="itemType"
                control={control}
                rules={{
                  required: 'Escalation Type is required'
                }}
                render={({ field }) => (
                  <Autocomplete
                    options={escalationTypeOptions}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    getOptionLabel={(option) => option?.label || ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Escalation Type *"
                        size="small"
                        error={!!errors.itemType}
                        helperText={errors.itemType?.message}
                      />
                    )}
                  />
                )}
              />
            </div>
          </form>
        </div>
      </LocalizationProvider>
      {/*  */}
      {selectedItemType?.value === 'LATECHECKINOUT' && (
        <>
          <Dialog
            open={openPopup}
            onClose={handleClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                borderRadius: 4,
                overflow: 'hidden',

                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(193deg, rgb(58,107,109) 30%, rgb(42,75,77) 90%)',
                px: 2,
                py: 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {/* Left Side */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center'
                }}
              >
                <Box>
                  {/* Report Name + Total Records */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,

                      flexWrap: 'wrap'
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#fff',
                        fontWeight: 400,
                        fontSize: '0.85rem'
                      }}
                    >
                      Late Check In Out Report
                    </Typography>
                    {selectedEmployee.employeeCode !== 'ALL' && (
                      <Chip
                        // label={`${tableData.length} Records`}
                        label={`${tableData[0]?.employeeName} - ${tableData[0]?.employeeCode} - ${tableData[0]?.designation}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: '#A7F3D0',
                          fontWeight: 400,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Right Side - Close Button */}
                <IconButton
                  onClick={handleClose}
                  sx={{
                    width: 38,
                    height: 38,
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.22)',
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            <DialogContent sx={{ p: 0, overflowY: 'hidden' }}>
              {tableData.length > 0 ? (
                <TableContainer
                  sx={{
                    maxHeight: 500,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: 8
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c7c7c7',
                      borderRadius: 10
                    }
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {[
                          //   'Employee',
                          //   'Department',
                          'Date',
                          'Shift Timing',
                          'Actual Timing',
                          'Effective Hours',
                          'Early Check-Out',
                          'Permission',
                          'Leave',
                          'Adjustment'
                        ].map((header) => (
                          <TableCell
                            key={header}
                            sx={{
                              //   background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                              background: 'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                              color: '#fff',
                              fontWeight: 500,
                              fontSize: '0.8rem',
                              padding: '8px 8px',
                              borderBottom: 'none',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {selectedEmployee?.employeeCode === 'ALL'
                        ? Object.values(groupedData).map((employee) => (
                            <React.Fragment key={employee.employeeCode}>
                              <TableRow
                                sx={{
                                  background: '#EEF6F7',
                                  '& .MuiTableCell-root': {
                                    padding: '6px 8px'
                                  }
                                }}
                              >
                                <TableCell colSpan={8}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 2,
                                      alignItems: 'center',
                                      flexWrap: 'wrap'
                                    }}
                                  >
                                    <Chip label={employee.employeeName} color="primary" size="small" />

                                    <Chip label={employee.employeeCode} color="success" size="small" />

                                    <Chip label={employee.designation} color="warning" size="small" />
                                  </Box>
                                </TableCell>
                              </TableRow>

                              {/* Employee Records */}
                              {employee.records.map((row, index) => (
                                <TableRow
                                  key={`${employee.employeeCode}-${index}`}
                                  hover
                                  sx={{
                                    '& .MuiTableCell-root': {
                                      padding: '6px 8px'
                                    }
                                  }}
                                >
                                  <TableCell>
                                    <Chip
                                      label={dayjs(row.attendanceDate).format('DD-MM-YYYY')}
                                      color="primary"
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={0}>
                                      <AccessTimeIcon sx={{ color: '#6366F1', fontSize: 18 }} />
                                      <Chip
                                        label={`${row.shiftIn} → ${row.shiftOut}`}
                                        size="small"
                                        sx={{
                                          bgcolor: '#EEF2FF',
                                          color: '#4338CA',
                                          fontWeight: 400,
                                          borderRadius: '8px'
                                        }}
                                      />
                                    </Box>
                                  </TableCell>

                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={0}>
                                      <ScheduleIcon sx={{ color: '#10B981', fontSize: 18 }} />
                                      <Chip
                                        label={`${row.firstIn} → ${row.lastOut}`}
                                        size="small"
                                        sx={{
                                          bgcolor: '#ECFDF5',
                                          color: '#059669',
                                          fontWeight: 400,
                                          borderRadius: '8px'
                                        }}
                                      />
                                    </Box>
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      icon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
                                      label={`${row.effectiveHours} Hrs`}
                                      size="small"
                                      sx={{
                                        bgcolor: '#E8F5E9',
                                        color: '#2E7D32',
                                        fontWeight: 400,
                                        borderRadius: '10px',
                                        '& .MuiChip-icon': {
                                          color: '#2E7D32'
                                        }
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Chip label={row.earlyBy} color="warning" size="small" />
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={row.permissionStatus}
                                      color={row.permissionStatus === 'APPROVED' ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Chip label={row.leaveStatus} color={row.leaveStatus === 'NO' ? 'info' : 'warning'} size="small" />
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={row.adjustmentStatus}
                                      color={row.adjustmentStatus === 'NO' ? 'default' : 'warning'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))
                        : tableData.map((row, index) => (
                            <TableRow
                              key={index}
                              hover
                              sx={{
                                '& .MuiTableCell-root': {
                                  padding: '6px 8px'
                                }
                              }}
                            >
                              <TableCell>
                                <Chip
                                  label={dayjs(row.attendanceDate).format('DD-MM-YYYY')}
                                  color="primary"
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>

                              <TableCell>
                                <Box display="flex" alignItems="center" gap={0}>
                                  <AccessTimeIcon sx={{ color: '#6366F1', fontSize: 18 }} />
                                  <Chip
                                    label={`${row.shiftIn} → ${row.shiftOut}`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#EEF2FF',
                                      color: '#4338CA',
                                      fontWeight: 400,
                                      borderRadius: '8px'
                                    }}
                                  />
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Box display="flex" alignItems="center" gap={0}>
                                  <ScheduleIcon sx={{ color: '#10B981', fontSize: 18 }} />
                                  <Chip
                                    label={`${row.firstIn} → ${row.lastOut}`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#ECFDF5',
                                      color: '#059669',
                                      fontWeight: 400,
                                      borderRadius: '8px'
                                    }}
                                  />
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  icon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
                                  label={`${row.effectiveHours} Hrs`}
                                  size="small"
                                  sx={{
                                    bgcolor: '#E8F5E9',
                                    color: '#2E7D32',
                                    fontWeight: 400,
                                    borderRadius: '10px',
                                    '& .MuiChip-icon': {
                                      color: '#2E7D32'
                                    }
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Chip label={row.earlyBy} color="warning" size="small" />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={row.permissionStatus}
                                  color={row.permissionStatus === 'APPROVED' ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>

                              <TableCell>
                                <Chip label={row.leaveStatus} color={row.leaveStatus === 'NO' ? 'info' : 'warning'} size="small" />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={row.adjustmentStatus}
                                  color={row.adjustmentStatus === 'NO' ? 'default' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Data not Found
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
      {/* MISSINGPUNCH */}
      {selectedItemType?.value === 'MISSINGPUNCH' && (
        <>
          <Dialog
            open={openPopup}
            onClose={handleClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                borderRadius: 5,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
              }
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(193deg, rgb(58,107,109) 30%, rgb(42,75,77) 90%)',
                px: 2,
                py: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 400,
                    fontSize: '0.85rem'
                  }}
                >
                  Missing Punch Report
                </Typography>

                {selectedEmployee.employeeCode !== 'ALL' && (
                  <Chip
                    // label={`${tableData.length} Records`}
                    label={`${tableData[0]?.employeeName} - ${tableData[0]?.employeeCode} - ${tableData[0]?.designation}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: '#A7F3D0',
                      fontWeight: 400,
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </Box>

              <IconButton
                onClick={handleClose}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'rotate(90deg)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Scroll Area */}
            <DialogContent
              sx={{
                p: 2,
                background: '#F5F7FB',
                maxHeight: '75vh',
                overflowY: 'auto',

                '&::-webkit-scrollbar': {
                  width: 8
                },

                '&::-webkit-scrollbar-thumb': {
                  background: '#B0BEC5',
                  borderRadius: '20px'
                },

                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#78909C'
                }
              }}
            >
              {tableData.length > 0 ? (
                selectedEmployee?.employeeCode === 'ALL' ? (
                  Object.values(groupedData).map((employee) => (
                    <Box key={employee.employeeCode} sx={{ mb: 4 }}>
                      {/* Employee Header */}
                      <Card
                        sx={{
                          mb: 1.5,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #3A6B6D 0%, #2A4B4D 100%)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(58,107,109,0.25)',
                          overflow: 'hidden'
                        }}
                      >
                        <CardContent
                          sx={{
                            py: 1,
                            px: 2,
                            '&:last-child': {
                              pb: 1
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 1
                            }}
                          >
                            {/* Left Side */}
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: 'rgba(255,255,255,0.18)',
                                  fontSize: '0.9rem',
                                  fontWeight: 700
                                }}
                              >
                                {employee.employeeName?.charAt(0)}
                              </Avatar>

                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    lineHeight: 1.2
                                  }}
                                >
                                  {employee.employeeName}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: '0.68rem',
                                    opacity: 0.8
                                  }}
                                >
                                  {employee.designation}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Right Side */}
                            <Chip
                              label={employee.employeeCode}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '0.7rem',
                                bgcolor: 'rgba(255,255,255,0.15)',
                                color: '#A7F3D0',
                                fontWeight: 600,
                                border: '1px solid rgba(255,255,255,0.15)'
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Employee Cards */}
                      <Grid container spacing={2}>
                        {employee.records.map((row, index) => (
                          <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
                            <Card
                              sx={{
                                borderRadius: '30px',
                                overflow: 'hidden',
                                background: 'linear-gradient(145deg,#ffffff,#f9fbfd)',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                position: 'relative',

                                '&:hover': {
                                  transform: 'translateY(-6px)',
                                  boxShadow: '0 18px 40px rgba(0,0,0,0.15)'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -40,
                                  right: -40,
                                  width: 120,
                                  height: 120,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg,#FF6B6B,#FFB347)',
                                  opacity: 0.15
                                }}
                              />

                              <CardContent
                                sx={{
                                  p: 2,
                                  textAlign: 'center'
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mx: 'auto',
                                    mb: 0,
                                    color: '#fff',
                                    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                                    boxShadow: '0 8px 20px rgba(99,102,241,0.35)'
                                  }}
                                >
                                  <Box textAlign="center">
                                    <Typography
                                      sx={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        lineHeight: 1
                                      }}
                                    >
                                      {dayjs(row.attendanceDate).format('DD')}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: 8,
                                        fontWeight: 400
                                      }}
                                    >
                                      {dayjs(row.attendanceDate).format('ddd')}
                                    </Typography>
                                  </Box>
                                </Avatar>

                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: '#64748B',
                                    fontWeight: 600,
                                    mb: 1
                                  }}
                                >
                                  {dayjs(row.attendanceDate).format('MMMM YYYY')}
                                </Typography>

                                <Box
                                  sx={{
                                    bgcolor: '#ECFDF5',
                                    borderRadius: '18px',
                                    p: 1,
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: '#059669'
                                    }}
                                  >
                                    First IN
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontWeight: 500,
                                      color: '#065F46'
                                    }}
                                  >
                                    {row.firstIn}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    bgcolor: row.lastOut === '00:00:00' ? '#FEF2F2' : '#EFF6FF',
                                    borderRadius: '18px',
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: row.lastOut === '00:00:00' ? '#DC2626' : '#2563EB'
                                    }}
                                  >
                                    Last OUT
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontWeight: 500,
                                      color: row.lastOut === '00:00:00' ? '#B91C1C' : '#1D4ED8'
                                    }}
                                  >
                                    {row.lastOut === '00:00:00' ? 'Missing Punch' : row.lastOut}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Grid container spacing={2}>
                    {tableData.map((row, index) => (
                      <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
                        <Card
                          sx={{
                            borderRadius: '30px',
                            overflow: 'hidden',
                            background: 'linear-gradient(145deg,#ffffff,#f9fbfd)',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            position: 'relative',

                            '&:hover': {
                              transform: 'translateY(-6px)',
                              boxShadow: '0 18px 40px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          {/* Top Circle */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -40,
                              right: -40,
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg,#FF6B6B,#FFB347)',
                              opacity: 0.15
                            }}
                          />

                          <CardContent
                            sx={{
                              p: 2,
                              textAlign: 'center'
                            }}
                          >
                            {/* Date Circle */}
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                mx: 'auto',
                                mb: 0,
                                color: '#fff',
                                background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                                boxShadow: '0 8px 20px rgba(99,102,241,0.35)'
                              }}
                            >
                              <Box textAlign="center">
                                <Typography
                                  sx={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    lineHeight: 1
                                  }}
                                >
                                  {dayjs(row.attendanceDate).format('DD')}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 8,
                                    fontWeight: 400
                                  }}
                                >
                                  {dayjs(row.attendanceDate).format('ddd')}
                                </Typography>
                              </Box>
                            </Avatar>

                            {/* Month */}
                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                color: '#64748B',
                                fontWeight: 600,
                                mb: 1
                              }}
                            >
                              {dayjs(row.attendanceDate).format('MMMM YYYY')}
                            </Typography>

                            {/* First IN */}
                            <Box
                              sx={{
                                bgcolor: '#ECFDF5',
                                borderRadius: '18px',
                                p: 1,
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.7rem',
                                  color: '#059669'
                                }}
                              >
                                First IN
                              </Typography>

                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  color: '#065F46'
                                }}
                              >
                                {row.firstIn}
                              </Typography>
                            </Box>

                            {/* Last OUT */}
                            <Box
                              sx={{
                                bgcolor: row.lastOut === '00:00:00' ? '#FEF2F2' : '#EFF6FF',
                                borderRadius: '18px',
                                p: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.7rem',
                                  color: row.lastOut === '00:00:00' ? '#DC2626' : '#2563EB'
                                }}
                              >
                                Last OUT
                              </Typography>

                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  color: row.lastOut === '00:00:00' ? '#B91C1C' : '#1D4ED8'
                                }}
                              >
                                {row.lastOut === '00:00:00' ? 'Missing Punch' : row.lastOut}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Data not found
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
      {/*ABSENT  */}
      {selectedItemType?.value === 'ABSENT' && (
        <>
          <Dialog
            open={openPopup}
            onClose={handleClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                borderRadius: 5,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
              }
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(193deg, rgb(58,107,109) 30%, rgb(42,75,77) 90%)',
                px: 2,
                py: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 400,
                    fontSize: '0.85rem'
                  }}
                >
                  Absent Report
                </Typography>
                {selectedEmployee.employeeCode !== 'ALL' && (
                  <Chip
                    // label={`${tableData.length} Records`}
                    label={`${tableData[0]?.employeeName} - ${tableData[0]?.employeeCode} - ${tableData[0]?.designation}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: '#A7F3D0',
                      fontWeight: 400,
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </Box>

              <IconButton
                onClick={handleClose}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'rotate(90deg)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Scroll Area */}
            <DialogContent
              sx={{
                p: 2,
                background: '#F5F7FB',
                maxHeight: '75vh',
                overflowY: 'auto',

                '&::-webkit-scrollbar': {
                  width: 8
                },

                '&::-webkit-scrollbar-thumb': {
                  background: '#B0BEC5',
                  borderRadius: '20px'
                },

                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#78909C'
                }
              }}
            >
              {tableData.length > 0 ? (
                selectedEmployee?.employeeCode === 'ALL' ? (
                  Object.values(groupedData).map((employee) => (
                    <Box key={employee.employeeCode} sx={{ mb: 4 }}>
                      {/* Employee Header */}
                      <Card
                        sx={{
                          mb: 1.5,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #3A6B6D 0%, #2A4B4D 100%)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(58,107,109,0.25)',
                          overflow: 'hidden'
                        }}
                      >
                        <CardContent
                          sx={{
                            py: 1,
                            px: 2,
                            '&:last-child': {
                              pb: 1
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 1
                            }}
                          >
                            {/* Left Side */}
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: 'rgba(255,255,255,0.18)',
                                  fontSize: '0.9rem',
                                  fontWeight: 700
                                }}
                              >
                                {employee.employeeName?.charAt(0)}
                              </Avatar>

                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    lineHeight: 1.2
                                  }}
                                >
                                  {employee.employeeName}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: '0.68rem',
                                    opacity: 0.8
                                  }}
                                >
                                  {employee.designation}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Right Side */}
                            <Chip
                              label={employee.employeeCode}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '0.7rem',
                                bgcolor: 'rgba(255,255,255,0.15)',
                                color: '#A7F3D0',
                                fontWeight: 600,
                                border: '1px solid rgba(255,255,255,0.15)'
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                      <Grid container spacing={2}>
                        {tableData.map((row, index) => (
                          <Grid item xs={12} sm={6} md={3} lg={2} key={index}>
                            <Card
                              sx={{
                                borderRadius: '24px',
                                overflow: 'hidden',
                                position: 'relative',
                                background: 'linear-gradient(145deg,#FFF5F5,#FFECEC)',
                                border: '1px solid #FFD6D6',
                                boxShadow: '0 8px 24px rgba(255,0,0,0.08)',
                                transition: 'all .3s ease',

                                '&:hover': {
                                  transform: 'translateY(-8px)',
                                  boxShadow: '0 18px 40px rgba(255,0,0,0.18)'
                                }
                              }}
                            >
                              {/* Background Circle */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -40,
                                  right: -40,
                                  width: 120,
                                  height: 120,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg,#EF4444,#F97316)',
                                  opacity: 0.12
                                }}
                              />

                              {/* Absent Badge */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 10,
                                  px: 1,
                                  // py: 0.4,
                                  borderRadius: '20px',
                                  background: 'linear-gradient(135deg,#EF4444,#DC2626)',
                                  color: '#fff',
                                  fontSize: 8,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  boxShadow: '0 4px 12px rgba(239,68,68,.3)'
                                }}
                              >
                                <HighlightOffIcon sx={{ fontSize: 12 }} />
                                ABSENT
                              </Box>

                              <CardContent
                                sx={{
                                  p: 2,
                                  textAlign: 'center'
                                }}
                              >
                                {/* Calendar Circle */}
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mx: 'auto',
                                    mb: 0,
                                    background: 'linear-gradient(135deg,#EF4444,#F97316)',
                                    boxShadow: '0 10px 25px rgba(239,68,68,.35)'
                                  }}
                                >
                                  <Box textAlign="center">
                                    <Typography
                                      sx={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        color: '#fff'
                                      }}
                                    >
                                      {dayjs(row.attendanceDate).format('DD')}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: 9,
                                        fontWeight: 600,
                                        color: '#fff'
                                      }}
                                    >
                                      {dayjs(row.attendanceDate).format('ddd')}
                                    </Typography>
                                  </Box>
                                </Avatar>

                                {/* Month */}
                                <Typography
                                  sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: '#374151'
                                  }}
                                >
                                  {dayjs(row.attendanceDate).format('MMMM')}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: '#6B7280',
                                    mb: 1
                                  }}
                                >
                                  {dayjs(row.attendanceDate).format('YYYY')}
                                </Typography>

                                {/* Full Date */}
                                <Box
                                  sx={{
                                    mt: 0.5,
                                    py: 0.8,
                                    borderRadius: '12px',
                                    background: '#fff',
                                    border: '1px dashed #FCA5A5',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <CalendarMonthIcon
                                    sx={{
                                      color: '#EF4444',
                                      fontSize: 18
                                    }}
                                  />

                                  <Typography
                                    sx={{
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: '#EF4444'
                                    }}
                                  >
                                    {dayjs(row.attendanceDate).format('DD MMM YYYY')}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Grid container spacing={2}>
                    {tableData.map((row, index) => (
                      <Grid item xs={12} sm={6} md={3} lg={2} key={index}>
                        <Card
                          sx={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            position: 'relative',
                            background: 'linear-gradient(145deg,#FFF5F5,#FFECEC)',
                            border: '1px solid #FFD6D6',
                            boxShadow: '0 8px 24px rgba(255,0,0,0.08)',
                            transition: 'all .3s ease',

                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: '0 18px 40px rgba(255,0,0,0.18)'
                            }
                          }}
                        >
                          {/* Background Circle */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -40,
                              right: -40,
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg,#EF4444,#F97316)',
                              opacity: 0.12
                            }}
                          />

                          {/* Absent Badge */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              px: 1,
                              // py: 0.4,
                              borderRadius: '20px',
                              background: 'linear-gradient(135deg,#EF4444,#DC2626)',
                              color: '#fff',
                              fontSize: 8,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              boxShadow: '0 4px 12px rgba(239,68,68,.3)'
                            }}
                          >
                            <HighlightOffIcon sx={{ fontSize: 12 }} />
                            ABSENT
                          </Box>

                          <CardContent
                            sx={{
                              p: 2,
                              textAlign: 'center'
                            }}
                          >
                            {/* Calendar Circle */}
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                mx: 'auto',
                                mb: 0,
                                background: 'linear-gradient(135deg,#EF4444,#F97316)',
                                boxShadow: '0 10px 25px rgba(239,68,68,.35)'
                              }}
                            >
                              <Box textAlign="center">
                                <Typography
                                  sx={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    color: '#fff'
                                  }}
                                >
                                  {dayjs(row.attendanceDate).format('DD')}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 9,
                                    fontWeight: 600,
                                    color: '#fff'
                                  }}
                                >
                                  {dayjs(row.attendanceDate).format('ddd')}
                                </Typography>
                              </Box>
                            </Avatar>

                            {/* Month */}
                            <Typography
                              sx={{
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#374151'
                              }}
                            >
                              {dayjs(row.attendanceDate).format('MMMM')}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                color: '#6B7280',
                                mb: 1
                              }}
                            >
                              {dayjs(row.attendanceDate).format('YYYY')}
                            </Typography>

                            {/* Full Date */}
                            <Box
                              sx={{
                                mt: 0.5,
                                py: 0.8,
                                borderRadius: '12px',
                                background: '#fff',
                                border: '1px dashed #FCA5A5',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <CalendarMonthIcon
                                sx={{
                                  color: '#EF4444',
                                  fontSize: 18
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#EF4444'
                                }}
                              >
                                {dayjs(row.attendanceDate).format('DD MMM YYYY')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Data not found
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* CHECKINOUTADJUSTMENT */}
      {selectedItemType?.value === 'CHECKINOUTADJUSTMENT' && (
        <>
          <Dialog
            open={openPopup}
            onClose={handleClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                borderRadius: 4,
                overflow: 'hidden',

                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(193deg, rgb(58,107,109) 30%, rgb(42,75,77) 90%)',
                px: 2,
                py: 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,

                      flexWrap: 'wrap'
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#fff',
                        fontWeight: 400,
                        fontSize: '0.85rem'
                      }}
                    >
                      Check In Out Adjustment Report
                    </Typography>
                    {selectedEmployee.employeeCode !== 'ALL' && (
                      <Chip
                        // label={`${tableData.length} Records`}
                        label={`${tableData[0]?.employeeName} - ${tableData[0]?.employeeCode} - ${tableData[0]?.designation}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: '#A7F3D0',
                          fontWeight: 400,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Right Side - Close Button */}
                <IconButton
                  onClick={handleClose}
                  sx={{
                    width: 38,
                    height: 38,
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.22)',
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            {/* contemt */}

            <DialogContent sx={{ p: 0, overflowY: 'hidden' }}>
              {tableData.length > 0 ? (
                <TableContainer
                  sx={{
                    maxHeight: 500,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: 8
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c7c7c7',
                      borderRadius: 10
                    }
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['Attendance Date', 'Status', 'Entry Time', 'Request Reason', 'Approval Status', 'Approved On', 'Approved By'].map(
                          (header) => (
                            <TableCell
                              key={header}
                              sx={{
                                //   background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                background: 'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.8rem',
                                padding: '8px 8px',
                                borderBottom: 'none',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {header}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {selectedEmployee?.employeeCode === 'ALL'
                        ? Object.values(groupedData).map((employee) => (
                            <React.Fragment key={employee.employeeCode}>
                              <TableRow
                                sx={{
                                  background: '#EEF6F7',
                                  '& .MuiTableCell-root': {
                                    padding: '6px 8px'
                                  }
                                }}
                              >
                                <TableCell colSpan={10}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 2,
                                      alignItems: 'center',
                                      flexWrap: 'wrap'
                                    }}
                                  >
                                    <Chip label={employee.employeeName} color="primary" size="small" />

                                    <Chip label={employee.employeeCode} color="success" size="small" />

                                    <Chip label={employee.designation} color="warning" size="small" />
                                  </Box>
                                </TableCell>
                              </TableRow>

                              {/* Employee Records */}
                              {employee.records.map((row, index) => (
                                <TableRow
                                  key={`${employee.employeeCode}-${index}`}
                                  hover
                                  sx={{
                                    '& .MuiTableCell-root': {
                                      padding: '6px 8px'
                                    }
                                  }}
                                >
                                  <TableCell>
                                    <Chip
                                      label={dayjs(row.attendanceDate).format('DD-MM-YYYY')}
                                      color="primary"
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Chip label={row.status} size="small" color={row.status === 'IN' ? 'success' : 'error'} />
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={row.entryTime}
                                      size="small"
                                      sx={{
                                        bgcolor: '#EEF2FF',
                                        color: '#4338CA',
                                        fontWeight: 500
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell>{row.requestReason}</TableCell>

                                  <TableCell>
                                    <Chip
                                      label={row.approvalStatus}
                                      color={
                                        row.approvalStatus === 'APPROVED'
                                          ? 'success'
                                          : row.approvalStatus === 'REJECTED'
                                            ? 'error'
                                            : 'warning'
                                      }
                                      size="small"
                                    />
                                  </TableCell>

                                  <TableCell>{row.approvedOn}</TableCell>
                                  {/* Approved By */}
                                  <TableCell>
                                    <Box display="flex" flexDirection="column">
                                      <Typography fontWeight={600} fontSize={13}>
                                        {row.approvedBy}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {row.approvedByCode}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))
                        : tableData.map((row, index) => (
                            <TableRow
                              key={index}
                              hover
                              sx={{
                                '& .MuiTableCell-root': {
                                  padding: '6px 8px'
                                }
                              }}
                            >
                              <TableCell>
                                <Chip
                                  label={dayjs(row.attendanceDate).format('DD-MM-YYYY')}
                                  color="primary"
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>

                              <TableCell>
                                <Chip label={row.status} size="small" color={row.status === 'IN' ? 'success' : 'error'} />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={row.entryTime}
                                  size="small"
                                  sx={{
                                    bgcolor: '#EEF2FF',
                                    color: '#4338CA',
                                    fontWeight: 500
                                  }}
                                />
                              </TableCell>

                              <TableCell>{row.requestReason}</TableCell>

                              <TableCell>
                                <Chip
                                  label={row.approvalStatus}
                                  color={
                                    row.approvalStatus === 'APPROVED' ? 'success' : row.approvalStatus === 'REJECTED' ? 'error' : 'warning'
                                  }
                                  size="small"
                                />
                              </TableCell>

                              <TableCell>{row.approvedOn}</TableCell>
                              {/* Approved By */}
                              <TableCell>
                                <Box display="flex" flexDirection="column">
                                  <Typography fontWeight={600} fontSize={13}>
                                    {row.approvedBy}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {row.approvedByCode}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Data not Found
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
      {/* PERMISSION */}
      {selectedItemType?.value === 'PERMISSION' && (
        <>
          <Dialog
            open={openPopup}
            onClose={handleClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                borderRadius: 4,
                overflow: 'hidden',

                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(193deg, rgb(58,107,109) 30%, rgb(42,75,77) 90%)',
                px: 2,
                py: 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,

                      flexWrap: 'wrap'
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#fff',
                        fontWeight: 400,
                        fontSize: '0.85rem'
                      }}
                    >
                      Permission Report
                    </Typography>
                    {selectedEmployee.employeeCode !== 'ALL' && (
                      <Chip
                        // label={`${tableData.length} Records`}
                        label={`${tableData[0]?.employeeName} - ${tableData[0]?.employeeCode} - ${tableData[0]?.designation}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: '#A7F3D0',
                          fontWeight: 400,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Right Side - Close Button */}
                <IconButton
                  onClick={handleClose}
                  sx={{
                    width: 38,
                    height: 38,
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.22)',
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            {/* contemt */}

            <DialogContent sx={{ p: 0, overflowY: 'hidden' }}>
              {tableData.length > 0 ? (
                <TableContainer
                  sx={{
                    maxHeight: 500,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: 8
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c7c7c7',
                      borderRadius: 10
                    }
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['Date', 'From Time', 'To Time', 'Hours', 'Reason', 'Approval Status', 'Approved On', 'Approved By'].map(
                          (header) => (
                            <TableCell
                              key={header}
                              sx={{
                                //   background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                background: 'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.8rem',
                                padding: '8px 8px',
                                borderBottom: 'none',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {header}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {selectedEmployee?.employeeCode === 'ALL'
                        ? Object.values(groupedData).map((employee) => (
                            <React.Fragment key={employee.employeeCode}>
                              <TableRow
                                sx={{
                                  background: '#EEF6F7',
                                  '& .MuiTableCell-root': {
                                    padding: '6px 8px'
                                  }
                                }}
                              >
                                <TableCell colSpan={10}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 2,
                                      alignItems: 'center',
                                      flexWrap: 'wrap'
                                    }}
                                  >
                                    <Chip label={employee.employeeName} color="primary" size="small" />

                                    <Chip label={employee.employeeCode} color="success" size="small" />

                                    <Chip label={employee.designation} color="warning" size="small" />
                                  </Box>
                                </TableCell>
                              </TableRow>

                              {/* Employee Records */}
                              {employee.records.map((row, index) => (
                                <TableRow
                                  key={`${employee.employeeCode}-${index}`}
                                  hover
                                  sx={{
                                    '& .MuiTableCell-root': {
                                      padding: '6px 8px'
                                    }
                                  }}
                                >
                                  <TableCell>
                                    <Chip
                                      label={dayjs(row.attendanceDate).format('DD-MM-YYYY')}
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      icon={<AccessTimeIcon />}
                                      label={row.fromTime}
                                      size="small"
                                      sx={{
                                        bgcolor: '#ECFDF5',
                                        color: '#059669'
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      icon={<AccessTimeIcon />}
                                      label={row.toTime}
                                      size="small"
                                      sx={{
                                        bgcolor: '#FFF7ED',
                                        color: '#EA580C'
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Chip label={`${row.totalHours} Hr`} size="small" color="secondary" />
                                  </TableCell>

                                  <TableCell sx={{ maxWidth: 220 }}>
                                    <Typography fontSize="0.8rem" color="text.secondary">
                                      {row.notes || row.reason || '-'}
                                    </Typography>
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={row.approvalStatus}
                                      size="small"
                                      color={
                                        row.approvalStatus === 'APPROVED'
                                          ? 'success'
                                          : row.approvalStatus === 'REJECTED'
                                            ? 'error'
                                            : 'warning'
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography fontSize="0.8rem">{row.approvedOn || '-'}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      <Typography fontWeight={600} fontSize="0.8rem">
                                        {row.approvedBy}
                                      </Typography>

                                      <Typography color="text.secondary" fontSize="0.75rem">
                                        {row.approvedByCode}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))
                        : tableData.map((row, index) => (
                            <TableRow
                              key={index}
                              hover
                              sx={{
                                '& .MuiTableCell-root': {
                                  padding: '6px 8px'
                                }
                              }}
                            >
                              <TableCell>
                                <Chip label={dayjs(row.attendanceDate).format('DD-MM-YYYY')} size="small" color="info" variant="outlined" />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  icon={<AccessTimeIcon />}
                                  label={row.fromTime}
                                  size="small"
                                  sx={{
                                    bgcolor: '#ECFDF5',
                                    color: '#059669'
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  icon={<AccessTimeIcon />}
                                  label={row.toTime}
                                  size="small"
                                  sx={{
                                    bgcolor: '#FFF7ED',
                                    color: '#EA580C'
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Chip label={`${row.totalHours} Hr`} size="small" color="secondary" />
                              </TableCell>

                              <TableCell sx={{ maxWidth: 220 }}>
                                <Typography fontSize="0.8rem" color="text.secondary">
                                  {row.notes || row.reason || '-'}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={row.approvalStatus}
                                  size="small"
                                  color={
                                    row.approvalStatus === 'APPROVED' ? 'success' : row.approvalStatus === 'REJECTED' ? 'error' : 'warning'
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Typography fontSize="0.8rem">{row.approvedOn || '-'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography fontWeight={600} fontSize="0.8rem">
                                    {row.approvedBy}
                                  </Typography>

                                  <Typography color="text.secondary" fontSize="0.75rem">
                                    {row.approvedByCode}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Data not Found
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
      {/* LEAVE */}
      {selectedItemType?.value === 'LEAVE' && (
        <>
          <Dialog
            open={openPopup}
            onClose={handleClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                borderRadius: 4,
                overflow: 'hidden',

                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(193deg, rgb(58,107,109) 30%, rgb(42,75,77) 90%)',
                px: 2,
                py: 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,

                      flexWrap: 'wrap'
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#fff',
                        fontWeight: 400,
                        fontSize: '0.85rem'
                      }}
                    >
                      Leave Report
                    </Typography>
                    {selectedEmployee.employeeCode !== 'ALL' && (
                      <Chip
                        // label={`${tableData.length} Records`}
                        label={`${tableData[0]?.employeeName} - ${tableData[0]?.employeeCode} - ${tableData[0]?.designation}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: '#A7F3D0',
                          fontWeight: 400,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Right Side - Close Button */}
                <IconButton
                  onClick={handleClose}
                  sx={{
                    width: 38,
                    height: 38,
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.22)',
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            {/* contemt */}

            <DialogContent sx={{ p: 0, overflowY: 'hidden' }}>
              {tableData.length > 0 ? (
                <TableContainer
                  sx={{
                    maxHeight: 500,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: 8
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c7c7c7',
                      borderRadius: 10
                    }
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['Date', 'Leave Type', 'Days', 'Reason', 'Approval Status', 'Approved On', 'Approved By'].map((header) => (
                          <TableCell
                            key={header}
                            sx={{
                              //   background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                              background: 'linear-gradient(193deg, rgb(58, 107, 109) 30%, rgb(42, 75, 77) 90%)',
                              color: '#fff',
                              fontWeight: 500,
                              fontSize: '0.8rem',
                              padding: '8px 8px',
                              borderBottom: 'none',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {selectedEmployee?.employeeCode === 'ALL'
                        ? Object.values(groupedData).map((employee) => (
                            <React.Fragment key={employee.employeeCode}>
                              <TableRow
                                sx={{
                                  background: '#EEF6F7',
                                  '& .MuiTableCell-root': {
                                    padding: '6px 8px'
                                  }
                                }}
                              >
                                <TableCell colSpan={7}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 2,
                                      alignItems: 'center',
                                      flexWrap: 'wrap'
                                    }}
                                  >
                                    <Chip label={employee.employeeName} color="primary" size="small" />

                                    <Chip label={employee.employeeCode} color="success" size="small" />

                                    <Chip label={employee.designation} color="warning" size="small" />
                                  </Box>
                                </TableCell>
                              </TableRow>

                              {/* Employee Records */}
                              {employee.records.map((row, index) => (
                                <TableRow
                                  key={`${employee.employeeCode}-${index}`}
                                  hover
                                  sx={{
                                    '& .MuiTableCell-root': {
                                      padding: '6px 8px'
                                    }
                                  }}
                                >
                                  <TableCell>
                                    <Chip
                                      label={dayjs(row.attendanceDate).format('DD-MM-YYYY')}
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Box>
                                      <Chip label={row.leaveCode} size="small" color="secondary" />

                                      <Typography fontSize="0.75rem" mt={0.5}>
                                        {row.leaveType}
                                      </Typography>
                                    </Box>
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={`${row.totalDays} Day`}
                                      size="small"
                                      sx={{
                                        bgcolor: '#EEF2FF',
                                        color: '#4338CA',
                                        fontWeight: 600
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell sx={{ maxWidth: 220 }}>
                                    <Typography fontSize="0.8rem" color="text.secondary">
                                      {row.notes || row.reason || '-'}
                                    </Typography>
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={row.approvalStatus}
                                      size="small"
                                      color={
                                        row.approvalStatus === 'APPROVED'
                                          ? 'success'
                                          : row.approvalStatus === 'REJECTED'
                                            ? 'error'
                                            : 'warning'
                                      }
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Typography fontSize="0.8rem">{row.approvedOn || '-'}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      <Typography fontWeight={600} fontSize="0.8rem">
                                        {row.approvedBy}
                                      </Typography>

                                      <Typography color="text.secondary" fontSize="0.75rem">
                                        {row.approvedByCode}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))
                        : tableData.map((row, index) => (
                            <TableRow
                              key={index}
                              hover
                              sx={{
                                '& .MuiTableCell-root': {
                                  padding: '6px 8px'
                                }
                              }}
                            >
                              <TableCell>
                                <Chip label={dayjs(row.attendanceDate).format('DD-MM-YYYY')} size="small" color="info" variant="outlined" />
                              </TableCell>

                              <TableCell>
                                <Box>
                                  <Chip label={row.leaveCode} size="small" color="secondary" />

                                  <Typography fontSize="0.75rem" mt={0.5}>
                                    {row.leaveType}
                                  </Typography>
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={`${row.totalDays} Day`}
                                  size="small"
                                  sx={{
                                    bgcolor: '#EEF2FF',
                                    color: '#4338CA',
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ maxWidth: 220 }}>
                                <Typography fontSize="0.8rem" color="text.secondary">
                                  {row.notes || row.reason || '-'}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={row.approvalStatus}
                                  size="small"
                                  color={
                                    row.approvalStatus === 'APPROVED' ? 'success' : row.approvalStatus === 'REJECTED' ? 'error' : 'warning'
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Typography fontSize="0.8rem">{row.approvedOn || '-'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography fontWeight={600} fontSize="0.8rem">
                                    {row.approvedBy}
                                  </Typography>

                                  <Typography color="text.secondary" fontSize="0.75rem">
                                    {row.approvedByCode}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Data not Found
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default EscalationReport;
