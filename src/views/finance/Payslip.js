import React, { useState, useEffect, useMemo } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from 'utils/toast-component';
import ActionButton from 'utils/ActionButton';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, InputLabel, Select, MenuItem } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';

const Payslip = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem('orgId') || '');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
  const [payslipCompanydetails, setPayslipCompanydetails] = useState();
  const [totalEarningRow, setTotalEarningRow] = useState(null);
  const [deductionsData, setDeductionsData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showPayslip, setShowPayslip] = useState(false);
  const now = dayjs();
  const prevMonth = now.subtract(1, 'month');
  // const [selectedMonth, setSelectedMonth] = useState(prevMonth.month() + 1);
  // const [selectedYear, setSelectedYear] = useState(prevMonth.year());
  const [errors, setErrors] = useState({ month: '', year: '' });
  const [noDataFound, setNoDataFound] = useState(false);
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode') || '');
  const location = useLocation();
  const { employeeCode: passedEmployeeCode } = location.state || {};
  const [companyDetails, setCompanyDetails] = useState(null);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [openPayslipDialog, setOpenPayslipDialog] = useState(false);
  const [netPayOnHand, setNetPayOnHand] = useState(0);
  // Change from previous month to current month
  // Remove this line: const prevMonth = now.subtract(1, 'month');
  const [selectedMonth, setSelectedMonth] = useState(now.month() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(now.year()); // Current year

  useEffect(() => {
    if (passedEmployeeCode) {
      setEmployeeCode(passedEmployeeCode);
    }
  }, [passedEmployeeCode]);

  useEffect(() => {
    getPayslipCompanyDetails();
  }, [orgId]);

  const logoUrl = useMemo(() => {
    if (!companyDetails?.companylogo) return null;

    const logo = companyDetails.companylogo;

    // Handle base64 strings
    if (logo.startsWith('data:image')) {
      return logo;
    }

    // Handle raw base64 strings without prefix
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(logo)) {
      return `data:image/png;base64,${logo}`;
    }

    // Handle relative paths
    if (logo.startsWith('/')) {
      return `${window.location.origin}${logo}`;
    }

    // Handle missing protocol
    if (!logo.startsWith('http://') && !logo.startsWith('https://')) {
      return `https://${logo}`;
    }

    return logo;
  }, [companyDetails]);

  const getPayslipCompanyDetails = async () => {
    try {
      const result = await apiCalls('get', `basicmaster/getpayslipCompanydetails?orgId=${orgId}`);
      if (result.paramObjectsMap?.Company?.length > 0) {
        setCompanyDetails(result.paramObjectsMap.Company[0]);
      }
    } catch (err) {
      console.error('Failed to fetch company details:', err);
    }
  };

  // Allow current month in validation
  // const validateForm = () => {
  //   let valid = true;
  //   const newErrors = { month: '', year: '' };
  //   const currentYear = dayjs().year();
  //   const currentMonth = dayjs().month() + 1;

  //   if (!selectedMonth || !selectedYear) {
  //     newErrors.month = 'Month is required';
  //     newErrors.year = 'Year is required';
  //     valid = false;
  //   } else {
  //     const selectedDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
  //     if (selectedDate.isAfter(dayjs(), 'month')) {
  //       newErrors.month = 'Future month not allowed';
  //       valid = false;
  //     }
  //   }

  //   if (!selectedYear) {
  //     newErrors.year = 'Year is required';
  //     valid = false;
  //   } else if (selectedYear > currentYear) {
  //     newErrors.year = 'Future year not allowed';
  //     valid = false;
  //   }

  //   setErrors(newErrors);
  //   return valid;
  // };

  const validateForm = () => {
    let valid = true;
    const newErrors = { month: '', year: '' };
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;

    if (!selectedMonth || !selectedYear) {
      newErrors.month = 'Month is required';
      newErrors.year = 'Year is required';
      valid = false;
    } else {
      const selectedDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
      // Allow current month, only disable future months
      if (selectedDate.isAfter(dayjs(), 'month')) {
        newErrors.month = 'Future month not allowed';
        valid = false;
      }
    }

    if (!selectedYear) {
      newErrors.year = 'Year is required';
      valid = false;
    } else if (selectedYear > currentYear) {
      newErrors.year = 'Future year not allowed';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // const fetchPayslipData = async (empCode = employeeCode) => {
  //   setIsLoading(true);
  //   setNoDataFound(false);
  //   setEmployeeDetails(null);
  //   setEarningsData([]);
  //   setDeductionsData([]);
  //   setTotalEarningRow(null);
  //   setTotalEarnings(0);
  //   setPayslipCompanydetails();
  //   setNetPayOnHand(0); // Add this line to reset net pay

  //   try {
  //     const [employeeRes, earningsRes, deductionsRes, payslipCompanydetails, payOnHandRes] = await Promise.all([
  //       apiCalls('get', `/basicmaster/getpayslipemployeedetails?Employeecode=${employeeCode}&orgId=${orgId}`),
  //       apiCalls(
  //         'get',
  //         `/basicmaster/getpayslipearningdetails?Employeecode=${employeeCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`
  //       ),
  //       apiCalls(
  //         'get',
  //         `/basicmaster/getpayslipdeductiondetails?Employeecode=${employeeCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`
  //       ),
  //       apiCalls('get', `basicmaster/getpayslipCompanydetails?orgId=${orgId}`),
  //       apiCalls(
  //         'get',
  //         `basicmaster/getpayslipPayOnHandAmount?Employeecode=${employeeCode}&month=${selectedMonth}&year=${selectedYear}&orgId=${orgId}`
  //       )
  //     ]);

  //     const handleApiError = (response, defaultMessage) => {
  //       if (!response?.status) {
  //         const errorMsg = response?.paramObjectsMap?.errorMessage || defaultMessage;
  //         throw new Error(errorMsg);
  //       }
  //     };

  //     handleApiError(employeeRes, 'Failed to fetch employee details');
  //     handleApiError(earningsRes, 'Failed to fetch earnings details');
  //     handleApiError(deductionsRes, 'Failed to fetch deduction details');
  //     handleApiError(payOnHandRes, 'Failed to fetch pay-on-hand amount');

  //     const hasEarnings = earningsRes.paramObjectsMap?.employee?.length > 0;
  //     const hasDeductions = deductionsRes.paramObjectsMap?.employee?.length > 0;

  //     if (!hasEarnings && !hasDeductions) {
  //       setNoDataFound(true);
  //       showToast(`No payslip found for ${monthName} ${selectedYear}`, 'warning');
  //       return;
  //     }

  //     if (employeeRes.paramObjectsMap.employee?.length > 0) {
  //       setEmployeeDetails(employeeRes.paramObjectsMap.employee[0]);
  //     }

  //     if (hasEarnings) {
  //       const processedEarnings = processEarningsData(earningsRes.paramObjectsMap.employee);
  //       setEarningsData(processedEarnings.rows);
  //       setTotalEarningRow(processedEarnings.total);
  //       setTotalEarnings(processedEarnings.total.amount);
  //     }

  //     if (hasDeductions) {
  //       const filteredDeductions = deductionsRes.paramObjectsMap.employee
  //         .filter((item) => item.heading !== 'Total Deduction')
  //         .map((item) => ({
  //           ...item,
  //           amount: parseFloat((item.amount || '0').replace(/,/g, '')) || 0
  //         }));
  //       setDeductionsData(filteredDeductions);
  //     }

  //     // Extract and set the net pay from pay-on-hand API response
  //     if (payOnHandRes.paramObjectsMap?.payslip?.length > 0) {
  //       const payOnHandData = payOnHandRes.paramObjectsMap.payslip[0];
  //       const netPayAmount = parseFloat(payOnHandData.payOnHand) || 0;
  //       setNetPayOnHand(netPayAmount);
  //     }
  //   } catch (error) {
  //     console.error('Payslip fetch error:', error);
  //     setNoDataFound(true);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const processEarningsData = (data) => {
  //   const merged = data.reduce((acc, item) => {
  //     const key = item.heading;
  //     const amount = parseFloat((item.amount || '0').replace(/,/g, '')) || 0;
  //     const actuals = parseFloat((item.actuals || '0').replace(/,/g, '')) || 0;

  //     if (!acc[key]) {
  //       acc[key] = { ...item, amount, actuals };
  //     } else {
  //       acc[key].amount += amount;
  //       acc[key].actuals += actuals;
  //     }
  //     return acc;
  //   }, {});

  //   const mergedArray = Object.values(merged);
  //   const total = mergedArray.find((item) => item.heading === 'Total Earnings') || { amount: 0, actuals: 0 };

  //   return {
  //     rows: mergedArray.filter((item) => item.heading !== 'Total Earnings'),
  //     total
  //   };
  // };

  const fetchPayslipData = async (empCode = employeeCode) => {
    if (!empCode) {
      showToast('Please select an employee', 'warning');
      return;
    }

    setIsLoading(true);
    setNoDataFound(false);
    setEmployeeDetails(null);
    setEarningsData([]);
    setDeductionsData([]);
    setTotalEarningRow(null);
    setTotalEarnings(0);
    setPayslipCompanydetails();
    setNetPayOnHand(0);

    try {
      const [employeeRes, earningsRes, deductionsRes, payslipCompanydetails, payOnHandRes] = await Promise.all([
        apiCalls('get', `/basicmaster/getpayslipemployeedetails?Employeecode=${empCode}&orgId=${orgId}&month=${selectedMonth}&year=${selectedYear}`),
        apiCalls(
          'get',
          `/basicmaster/getpayslipearningdetails?Employeecode=${empCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`
        ),
        apiCalls(
          'get',
          `/basicmaster/getpayslipdeductiondetails?Employeecode=${empCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`
        ),
        apiCalls('get', `basicmaster/getpayslipCompanydetails?orgId=${orgId}`),
        apiCalls(
          'get',
          `basicmaster/getpayslipPayOnHandAmount?Employeecode=${empCode}&month=${selectedMonth}&year=${selectedYear}&orgId=${orgId}`
        )
      ]);

      console.log('API Responses:', {
        employeeRes,
        earningsRes,
        deductionsRes,
        payslipCompanydetails,
        payOnHandRes
      });

      // Check if we have at least some data to show
      const hasEmployeeData = employeeRes?.paramObjectsMap?.employee?.length > 0;
      const hasEarningsData = earningsRes?.paramObjectsMap?.employee?.length > 0;
      const hasDeductionsData = deductionsRes?.paramObjectsMap?.employee?.length > 0;
      const hasPayOnHandData = payOnHandRes?.paramObjectsMap?.payslip?.length > 0;

      if (!hasEmployeeData && !hasEarningsData && !hasDeductionsData) {
        setNoDataFound(true);
        showToast(`No payslip data found for ${monthName} ${selectedYear}`, 'warning');
        return;
      }

      // Set employee details
      if (hasEmployeeData) {
        setEmployeeDetails(employeeRes.paramObjectsMap.employee[0]);
      }

      // Set earnings data
      if (hasEarningsData) {
        const processedEarnings = processEarningsData(earningsRes.paramObjectsMap.employee);
        setEarningsData(processedEarnings.rows);
        setTotalEarningRow(processedEarnings.total);
        setTotalEarnings(processedEarnings.total.amount);
      } else {
        setEarningsData([]);
        setTotalEarningRow({ amount: 0, actuals: 0 });
        setTotalEarnings(0);
      }

      // Set deductions data
      if (hasDeductionsData) {
        const filteredDeductions = deductionsRes.paramObjectsMap.employee
          .filter((item) => item.heading !== 'Total Deduction')
          .map((item) => ({
            ...item,
            amount: parseFloat((item.amount || '0').toString().replace(/,/g, '')) || 0
          }));
        setDeductionsData(filteredDeductions);
      } else {
        setDeductionsData([]);
      }

      // Set net pay on hand
      if (hasPayOnHandData) {
        const payOnHandData = payOnHandRes.paramObjectsMap.payslip[0];
        const netPayAmount = parseFloat(payOnHandData.payOnHand) || 0;
        setNetPayOnHand(netPayAmount);
      } else {
        setNetPayOnHand(0);
      }

      // Set company details
      if (payslipCompanydetails?.paramObjectsMap?.Company?.length > 0) {
        setCompanyDetails(payslipCompanydetails.paramObjectsMap.Company[0]);
      }

      setShowPayslip(true);
      setOpenPayslipDialog(true);

    } catch (error) {
      console.error('Payslip fetch error:', error);
      setNoDataFound(true);
      showToast(error.message || 'Failed to fetch payslip data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const processEarningsData = (data) => {
    if (!data || !Array.isArray(data)) {
      return { rows: [], total: { amount: 0, actuals: 0 } };
    }

    const merged = data.reduce((acc, item) => {
      const key = item.heading;
      const amount = parseFloat((item.amount || '0').toString().replace(/,/g, '')) || 0;
      const actuals = parseFloat((item.actuals || '0').toString().replace(/,/g, '')) || 0;

      if (!acc[key]) {
        acc[key] = { ...item, amount, actuals };
      } else {
        acc[key].amount += amount;
        acc[key].actuals += actuals;
      }
      return acc;
    }, {});

    const mergedArray = Object.values(merged);
    const total = mergedArray.find((item) => item.heading === 'Total Earnings') || {
      amount: mergedArray.reduce((sum, item) => sum + (item.amount || 0), 0),
      actuals: mergedArray.reduce((sum, item) => sum + (item.actuals || 0), 0)
    };

    return {
      rows: mergedArray.filter((item) => item.heading !== 'Total Earnings'),
      total
    };
  };

  const handleSearch = () => {
    if (!validateForm()) {
      setShowPayslip(false);
      setOpenPayslipDialog(false);
      return;
    }

    fetchPayslipData(passedEmployeeCode);
    setShowPayslip(true);
    setOpenPayslipDialog(true);
  };

  const handleClear = () => {
    // Reset to previous month and year
    const now = dayjs();
    const prevMonth = now.subtract(1, 'month');

    setSelectedYear(prevMonth.year());
    setSelectedMonth(prevMonth.month() + 1);

    setShowPayslip(false);
    setEmployeeDetails(null);
    setEarningsData([]);
    setDeductionsData([]);
    setTotalEarningRow(null);
    setTotalEarnings(0);
    setErrors({ month: '', year: '' });
    setNoDataFound(false);
  };

  const handleDownload = () => {
    if (!showPayslip || !employeeDetails || noDataFound) {
      showToast('Please generate a valid payslip first', 'warning');
      return;
    }

    const input = document.getElementById('payslip-container');
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Payslip_${employeeDetails.employeecode}_${selectedMonth}_${selectedYear}.pdf`);
      })
      .catch((error) => {
        console.error('PDF generation failed:', error);
        showToast('Failed to generate PDF', 'error');
      });
  };

  const totalDeductions = useMemo(() => deductionsData.reduce((sum, item) => sum + item.amount, 0), [deductionsData]);

  const netPay = useMemo(() => totalEarnings - totalDeductions, [totalEarnings, totalDeductions]);

  const monthName = useMemo(
    () =>
      selectedMonth
        ? dayjs()
          .month(selectedMonth - 1)
          .format('MMMM')
        : '',
    [selectedMonth]
  );

  const handleLogoError = () => {
    console.error('Failed to load company logo');
    setLogoLoadError(true);
  };

  const convertNumberToWords = (amount) => {
    const units = [
      'Zero',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen'
    ];

    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertThreeDigits = (n) => {
      if (n === 0) return '';
      let str = '';
      const hundreds = Math.floor(n / 100);
      if (hundreds > 0) {
        str += `${units[hundreds]} Hundred `;
        n %= 100;
      }
      if (n > 0) {
        if (n < 20) {
          str += units[n];
        } else {
          const tensDigit = Math.floor(n / 10);
          const onesDigit = n % 10;
          str += tens[tensDigit];
          if (onesDigit > 0) {
            str += ` ${units[onesDigit]}`;
          }
        }
      }
      return str.trim();
    };

    if (isNaN(amount)) return 'Invalid Amount';
    if (amount === 0) return 'Zero';

    // Separate rupees and paise
    const rupees = Math.floor(amount);
    let paise = Math.round((amount - rupees) * 100);

    // Handle potential floating-point issues
    if (paise >= 100) {
      paise = 0;
    }

    const groups = [];
    let num = rupees;

    // Break into groups (last 3 digits, then pairs of 2 digits)
    groups.push(num % 1000);
    num = Math.floor(num / 1000);

    while (num > 0) {
      groups.push(num % 100);
      num = Math.floor(num / 100);
    }

    const unitsText = ['', 'Thousand', 'Lakh', 'Crore'];
    let words = '';

    // Process groups from highest to lowest
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i] !== 0) {
        words += `${convertThreeDigits(groups[i])} ${unitsText[i]} `;
      }
    }

    // Add paise if exists
    if (paise > 0) {
      words = words.trim();
      words += ` and ${convertThreeDigits(paise)} Paise`;
    }

    return words.trim();
  };

  const amountInWords = useMemo(() => {
    if (!showPayslip || noDataFound || !employeeDetails || netPayOnHand === undefined) return '';
    return convertNumberToWords(netPayOnHand);
  }, [netPayOnHand, showPayslip, noDataFound, employeeDetails]);

  // Update the disableFutureMonth function
  // const disableFutureMonth = (month) => {
  //   const currentYear = dayjs().year();
  //   const currentMonth = dayjs().month(); // 0-indexed
  //   const selectedYearNum = Number(selectedYear);

  //   if (selectedYearNum === currentYear) {
  //     // Disable current month and future months
  //     return month.month() >= currentMonth;
  //   }

  //   return false;
  // };

  // Allow current month selection
  const disableFutureMonth = (month) => {
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month(); // 0-indexed
    const selectedYearNum = Number(selectedYear);

    if (selectedYearNum === currentYear) {
      // Only disable future months, allow current month
      return month.month() > currentMonth;
    }

    return false;
  };

  // Function to disable future years
  const disableFutureYear = (date) => {
    return date.year() > dayjs().year();
  };

  const formatDate = (dateString) => {
    if (!dateString || !dayjs(dateString).isValid()) return '-';
    return dayjs(dateString).format('DD MMM YYYY');
  };

  // Function to format decimal values properly
  const formatDecimal = (value) => {
    if (value === null || value === undefined || value === '') return '-';

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Check if it's a whole number
    if (num % 1 === 0) {
      return num.toString();
    }

    // Format decimal numbers to remove trailing zeros
    return num
      .toString()
      .replace(/(\.\d*?[1-9])0+$/, '$1')
      .replace(/\.0+$/, '');
  };

  return (
    <CardContainer>
      <ControlSection>
        <ButtonGroup>
          <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} disabled={isLoading} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} disabled={isLoading} />
          <ActionButton
            title="Download"
            icon={DownloadIcon}
            onClick={handleDownload}
            margin="0 10px"
            disabled={!showPayslip || isLoading || noDataFound}
          />
        </ButtonGroup>
      </ControlSection>

      <DateSection>
        {/* <div className="col-md-3 mb-3">
          <FormControl error={!!errors.year}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Year"
                views={['year']}
                openTo="year"
                format="YYYY"
                shouldDisableYear={disableFutureYear}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!errors.year,
                    variant: 'outlined'
                  }
                }}
                value={dayjs(`${selectedYear}-01-01`)}
                onChange={(date) => {
                  const year = date ? dayjs(date).format('YYYY') : null;
                  setSelectedYear(year);
                  setErrors({ ...errors, year: '' });
                  setShowPayslip(false);
                }}
              />
            </LocalizationProvider>
            {errors.year && <ErrorText>{errors.year}</ErrorText>}
          </FormControl>
        </div> */}
        <div className="col-md-3 mb-3">
          <FormControl size="small" variant="outlined" fullWidth error={!!errors.year}>
            <InputLabel id="year-label">Year</InputLabel>
            <Select
              labelId="year-label"
              label="Year"
              name="year"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setErrors({ ...errors, year: '' });
                setShowPayslip(false);
              }}
            >
              {[
                dayjs().year(), // Current year
                dayjs().year() - 1 // Previous year
              ].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
            {errors.year && <ErrorText>{errors.year}</ErrorText>}
          </FormControl>
        </div>

        <div className="col-md-3 mb-3">
          <FormControl error={!!errors.month}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Month"
                views={['month']}
                openTo="month"
                format="MMMM"
                shouldDisableMonth={disableFutureMonth}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!errors.month,
                    variant: 'outlined'
                  }
                }}
                value={dayjs()
                  .year(selectedYear)
                  .month(selectedMonth - 1)}
                onChange={(newValue) => {
                  if (newValue) {
                    setSelectedMonth(newValue.month() + 1);
                    setErrors({ ...errors, month: '' });
                  } else {
                    setSelectedMonth(null);
                  }
                  setShowPayslip(false);
                }}
              />
            </LocalizationProvider>
            {errors.month && <ErrorText>{errors.month}</ErrorText>}
          </FormControl>
        </div>
      </DateSection>

      {isLoading && <LoadingContainer>Loading payslip data...</LoadingContainer>}

      <Dialog
        open={openPayslipDialog}
        onClose={() => setOpenPayslipDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 768} // Fullscreen on mobile
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '1rem',
            height: '40px',
            pr: 1,
            padding: '8px 16px' // Reduced padding for mobile
          }}
        >
          <span>
            Payslip - {monthName.toUpperCase()} {selectedYear}
          </span>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleDownload} size="small" color="primary" title="Download PDF">
              <PictureAsPdfIcon />
            </IconButton>
            <IconButton onClick={() => setOpenPayslipDialog(false)} size="small" color="error" title="Close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers style={{ padding: '6px' }}>
          {showPayslip && !noDataFound && employeeDetails && !isLoading && (
            <PayslipContainer id="payslip-container">
              <HeaderSection>
                <LogoContainer>
                  {logoUrl && !logoLoadError ? (
                    <>
                      <CompanyLogo src={logoUrl} alt="Company Logo" onError={handleLogoError} />
                      <CompanyInfo>
                        <CompanyName>{companyDetails?.companyname || 'Company Name'}</CompanyName>
                        <CompanyAddress>
                          {companyDetails?.address ? `${companyDetails.address},` : ''}
                          {companyDetails?.pincode ? ` ${companyDetails.pincode}` : ''}
                        </CompanyAddress>
                      </CompanyInfo>
                    </>
                  ) : (
                    <CompanyInfo fullWidth>
                      <CompanyName>{companyDetails?.companyname || 'Company Name'}</CompanyName>
                      <CompanyAddress>
                        {companyDetails?.address ? `${companyDetails.address},` : ''}
                        {companyDetails?.pincode ? ` ${companyDetails.pincode}` : ''}
                      </CompanyAddress>
                    </CompanyInfo>
                  )}
                </LogoContainer>

                <PayslipTitle>
                  PAY SLIP FOR THE MONTH OF {monthName.toUpperCase()} {selectedYear}
                </PayslipTitle>
              </HeaderSection>
              <EmployeeInfoSection>
                <InfoColumn>
                  <InfoItem>
                    <InfoLabel>Name:</InfoLabel>
                    <InfoValue>
                      {employeeDetails?.employee || '-'}
                      {employeeDetails?.employeecode ? ` [${employeeDetails.employeecode}]` : ''}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Join Date:</InfoLabel>
                    <InfoValue>{formatDate(employeeDetails?.joiningdate)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Designation:</InfoLabel>
                    <InfoValue>
                      {employeeDetails?.designation
                        ? employeeDetails.designation
                          .toLowerCase()
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                        : '-'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Location:</InfoLabel>
                    <InfoValue>
                      {employeeDetails?.branch
                        ? employeeDetails.branch
                          .toLowerCase()
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                        : '-'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Effective Work Days:</InfoLabel>
                    <InfoValue>{formatDecimal(employeeDetails?.effectiveworkingdays)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Days In Month:</InfoLabel>
                    <InfoValue>{formatDecimal(employeeDetails?.monthDays)}</InfoValue>
                  </InfoItem>
                </InfoColumn>

                <VerticalDivider />

                <InfoColumn>
                  <InfoItem>
                    <InfoLabel>Bank Name:</InfoLabel>
                    <InfoValue>{employeeDetails?.bankName || '-'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Account No:</InfoLabel>
                    <InfoValue>{employeeDetails?.accountno || '-'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>UAN:</InfoLabel>
                    <InfoValue>{employeeDetails?.uanno || '-'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>PAN No:</InfoLabel>
                    <InfoValue>{employeeDetails?.panno || '-'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>LOP:</InfoLabel>
                    <InfoValue>{formatDecimal(employeeDetails?.lop) || '0'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>OT Hours:</InfoLabel>
                    <InfoValue>{formatDecimal(employeeDetails?.otHours) || '0'}</InfoValue>
                  </InfoItem>
                </InfoColumn>
              </EmployeeInfoSection>
              <DividerLine />
              <FinancialSection>
                <EarningsTable>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell width="50%">Earnings</TableHeaderCell>
                      <TableHeaderCell width="25%" align="right">
                        Full
                      </TableHeaderCell>
                      <TableHeaderCell width="25%" align="right">
                        Actual
                      </TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earningsData.length > 0 ? (
                      <>
                        {earningsData.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell width="40%">{item.heading || '-'}</TableCell>
                            <TableCell width="30%" align="right">
                              {formatDecimal(item.amount) || '0.00'}
                            </TableCell>
                            <TableCell width="30%" align="right">
                              {formatDecimal(item.actuals) || '0.00'}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TotalRow>
                          <TableCell width="40%" style={{ fontWeight: 'bold' }}>
                            Total Earnings: Rs.
                          </TableCell>
                          <TableCell width="30%" align="right">
                            {formatDecimal(totalEarningRow?.amount) || '0.00'}
                          </TableCell>
                          <TableCell width="30%" align="right">
                            {formatDecimal(totalEarningRow?.actuals) || '0.00'}
                          </TableCell>
                        </TotalRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No earnings data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </EarningsTable>

                <DeductionsTable>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell width="60%">Deductions</TableHeaderCell>
                      <TableHeaderCell width="40%" align="right">
                        Actual
                      </TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deductionsData.length > 0 ? (
                      <>
                        {deductionsData.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell width="60%">{item.heading || '-'}</TableCell>
                            <TableCell width="40%" align="right">
                              {formatDecimal(item.amount) || '0.00'}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TotalRow>
                          <TableCell width="60%" style={{ fontWeight: 'bold' }}>
                            Total Deductions: Rs.
                          </TableCell>
                          <TableCell width="40%" align="right">
                            {formatDecimal(totalDeductions) || '0.00'}
                          </TableCell>
                        </TotalRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No deductions data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </DeductionsTable>
              </FinancialSection>
              <NetPaySection>
                <NetPayLabel>Net Pay for the month : Rs. {netPayOnHand ? formatDecimal(netPayOnHand.toFixed(2)) : '0.00'}</NetPayLabel>
                <AmountInWords>{netPayOnHand ? `(Rupees ${amountInWords} Only)` : '(Rupees Zero Only)'}</AmountInWords>
              </NetPaySection>
              <Footer>
                <Disclaimer>This is a system-generated payslip and does not require signature.</Disclaimer>
                <ContactInfo>
                  {companyDetails?.email ? `Email: ${companyDetails.email} | ` : ''}
                  {companyDetails?.phone ? `Phone: ${companyDetails.phone} | ` : ''}
                  {companyDetails?.website ? `Website: ${companyDetails.website}` : ''}
                </ContactInfo>
              </Footer>
            </PayslipContainer>
          )}
          {showPayslip && noDataFound && !isLoading && (
            <NoDataMessage>
              {selectedMonth && selectedYear
                ? `No payslip found for ${monthName} ${selectedYear}`
                : 'Please select month and year to generate payslip'}
            </NoDataMessage>
          )}
        </DialogContent>
      </Dialog>
    </CardContainer>
  );
};

// ====== Styled Components ====== //
const CardContainer = styled.div`
  padding: 15px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ControlSection = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const DateSection = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const ErrorText = styled.div`
  color: #e53935;
  font-size: 12px;
  margin-top: 5px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: #5c6bc0;
  background: #e8eaf6;
  border-radius: 8px;
  margin-top: 15px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: #ff9800;
  border: 1px dashed #ffb74d;
  margin-top: 15px;
  background-color: #fff8e1;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const PayslipContainer = styled.div`
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  margin: auto;
  max-width: 800px;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
    border-radius: 6px;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 8px;
  padding: 0 10px;

  @media (max-width: 768px) {
    padding: 0 5px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
`;

const CompanyLogo = styled.img`
  max-height: 80px;
  max-width: 140px;
  object-fit: contain;

  @media (max-width: 768px) {
    max-height: 60px;
    max-width: 120px;
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${(props) => props.fullWidth && 'width: 100%;'}
`;

const CompanyName = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 0.5px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const CompanyAddress = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 4px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const PayslipTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 5px 0 0;
  padding: 8px;
  background: #e8f5e9;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 6px;
    letter-spacing: 0;
  }
`;

const EmployeeInfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px;
  background: #f9fbfd;
  border-radius: 6px;
  margin-bottom: 0;
  margin-left: 10px;
  margin-right: 10px;
  border: 1px solid #eaeaea;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 8px;
    margin-left: 5px;
    margin-right: 5px;
  }
`;

const InfoColumn = styled.div`
  width: 48%;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 5px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 6px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 768px) {
    margin-bottom: 4px;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #34495e;
  min-width: 130px;
  word-break: break-word;
  font-size: 13px;

  @media (max-width: 768px) {
    min-width: 100px;
    font-size: 12px;
  }
`;

const InfoValue = styled.span`
  color: #2c3e50;
  flex: 1;
  font-size: 13px;
  margin-left: 40px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  background: #e0e0e0;
  margin: 0 10px;

  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    margin: 8px 0;
  }
`;

const DividerLine = styled.hr`
  border: 0;
  height: 1px;
  margin: 10px;
  margin-left: 10px;
  margin-right: 10px;

  @media (max-width: 768px) {
    margin: 8px 5px;
  }
`;

const FinancialSection = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  padding: 0 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    padding: 0 5px;
  }
`;

const EarningsTable = styled.table`
  width: 60%;
  border-collapse: collapse;
  border-radius: 6px;
  overflow: hidden;
  table-layout: fixed;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 12px;
  }
`;

const DeductionsTable = styled.table`
  width: 40%;
  border-collapse: collapse;
  border-radius: 6px;
  overflow: hidden;
  table-layout: fixed;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 12px;
  }
`;

const TableHeader = styled.thead`
  background: #e3f2fd;
  color: black;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const TableHeaderCell = styled.th`
  padding: 10px 12px;
  text-align: ${(props) => props.align || 'left'};
  font-weight: 600;
  width: ${(props) => props.width || 'auto'};
  word-wrap: break-word;
  white-space: normal;
  font-size: 13px;

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 12px;
  }
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #eaeaea;
  text-align: ${(props) => props.align || 'left'};
  width: ${(props) => props.width || 'auto'};
  word-wrap: break-word;
  white-space: normal;
  font-size: 13px;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const TotalRow = styled.tr`
  background-color: #e3f2fd !important;
  font-weight: bold;
  border-top: 2px solid #bbdefb;
`;

const NetPaySection = styled.div`
  padding: 12px 10px;
  background: #e8f5e9;
  border-radius: 6px;
  margin-bottom: 8px;
  margin-left: 10px;
  margin-right: 10px;
  border-left: 3px solid #4caf50;

  @media (max-width: 768px) {
    padding: 10px 8px;
    margin-left: 5px;
    margin-right: 5px;
  }
`;

const NetPayLabel = styled.p`
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 4px;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const NetPayValue = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: #1b5e20;
  margin: 4px 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const AmountInWords = styled.p`
  font-style: italic;
  color: #43a047;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #a5d6a7;
  font-size: 13px;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-top: 6px;
    padding-top: 6px;
  }
`;

const Footer = styled.div`
  text-align: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-top: 8px;
  margin-left: 10px;
  margin-right: 10px;

  @media (max-width: 768px) {
    padding: 10px;
    margin-left: 5px;
    margin-right: 5px;
  }
`;

const Disclaimer = styled.p`
  font-size: 12px;
  color: #757575;
  margin-bottom: 6px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const ContactInfo = styled.div`
  font-size: 11px;
  color: #9e9e9e;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;
export default Payslip;
