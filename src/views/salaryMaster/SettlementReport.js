import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PreviewIcon from '@mui/icons-material/Visibility';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import {
  Autocomplete,
  FormControl,
  Box,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Paper,
  TablePagination,
  Tooltip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const SettlementReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [formData, setFormData] = useState({
    employeeCode: null
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [employeeList, setEmployeeList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeCode: '',
    employeeName: '',
    resignationDate: '',
    lastWorkingDate: '',
    finalWorkingDate: '',
    sumOfEarnings: '',
    deductions: '',
    department: '',
    position: '',
    separationType: '',
    reasonCategory: ''
  });

  // Fetch company details
  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);

      if (response.status === true && response.paramObjectsMap?.companyVO) {
        const companyList = response.paramObjectsMap.companyVO;
        const matchedCompany = companyList.find((company) => company.id === parseInt(orgId));

        if (matchedCompany) {
          setCompanyDetails(matchedCompany);
        } else {
          console.log('No matching company found for the given orgId.');
        }
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  // Fetch employees from the separation API
  const getAllEmployees = async () => {
    setIsFetchingEmployees(true);
    try {
      const params = {
        branchCode: branchCode,
        orgId: orgId
      };

      const result = await apiCalls('get', '/payslipsettlement/getSeparationEmployeeForSettlement', null, params);

      if (result?.status === true && result?.paramObjectsMap?.employeeVO) {
        const employees = result.paramObjectsMap.employeeVO;

        const transformedEmployees = employees.map(emp => ({
          employeeCode: emp.employeecode,
          employeeName: emp.employeename,
          resignationDate: emp.resignation,
          lastWorkingDate: emp.lastworkingdate,
          finalWorkingDate: emp.lastworkingdate,
          department: emp.department,
          position: emp.position,
          separationType: emp.separationtype,
          reasonCategory: emp.reasoncategory,
          status: emp.status
        }));

        setEmployeeList(transformedEmployees);
      } else {
        showToast('error', result?.paramObjectsMap?.message || 'No employees found for settlement');
      }
    } catch (error) {
      console.error('Error fetching employee list:', error);
      showToast('error', 'Error fetching employee list');
    } finally {
      setIsFetchingEmployees(false);
    }
  };

  useEffect(() => {
    getAllEmployees();
    getCompanyDetails();
  }, []);

  const handleAllClear = () => {
    setFormData({
      employeeCode: null
    });
    setFieldErrors({});
    setReportData([]);
    setEmployeeDetails({
      employeeCode: '',
      employeeName: '',
      resignationDate: '',
      lastWorkingDate: '',
      finalWorkingDate: '',
      sumOfEarnings: '',
      deductions: '',
      department: '',
      position: '',
      separationType: '',
      reasonCategory: ''
    });
    setPage(0);
  };

  const handleClick = async () => {
    const errors = {};
    if (!formData.employeeCode) {
      errors.employeeCode = 'Employee is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const params = {
        branchCode: branchCode,
        empCode: formData.employeeCode,
        orgId: orgId
      };

      const result = await apiCalls('get', '/api/payslipsettlement/getpayslipSettlementDetails', null, params);

      if (result?.status === true && result?.paramObjectsMap?.payslipSettlementDetails) {
        const settlementData = result.paramObjectsMap.payslipSettlementDetails;
        const employeeRecord = settlementData.find(item => item.employeecode !== 'TOTAL');
        const selectedEmployee = employeeList.find(emp => emp.employeeCode === formData.employeeCode);

        if (employeeRecord) {
          const filteredData = settlementData.filter(item => item.employeecode !== 'TOTAL');
          const totalEarnings = filteredData.reduce((sum, item) => sum + parseFloat(item.sumofearning || 0), 0);
          const totalDeductions = filteredData.reduce((sum, item) => sum + parseFloat(item.sumofdetection || 0), 0);

          setEmployeeDetails({
            employeeCode: employeeRecord.employeecode || '',
            employeeName: employeeRecord.employee || '',
            resignationDate: employeeRecord.resignation || '',
            lastWorkingDate: employeeRecord.lastworkingdate || '',
            finalWorkingDate: employeeRecord.finalWorkingDate || '',
            sumOfEarnings: totalEarnings.toFixed(2),
            deductions: totalDeductions.toFixed(2),
            department: selectedEmployee?.department || '',
            position: selectedEmployee?.position || '',
            separationType: selectedEmployee?.separationType || '',
            reasonCategory: selectedEmployee?.reasonCategory || ''
          });
        }

        const filteredData = settlementData.filter(item => item.employeecode !== 'TOTAL');
        setReportData(filteredData);
        setPage(0);

        if (filteredData.length === 0) {
          showToast('info', 'No settlement data found for this employee');
        } else {
          showToast('success', 'Settlement data loaded successfully');
        }
      } else {
        showToast('error', result?.paramObjectsMap?.message || 'No settlement data found');
        setReportData([]);
        setEmployeeDetails({
          employeeCode: '',
          employeeName: '',
          resignationDate: '',
          lastWorkingDate: '',
          finalWorkingDate: '',
          sumOfEarnings: '',
          deductions: '',
          department: '',
          position: '',
          separationType: '',
          reasonCategory: ''
        });
      }
    } catch (err) {
      showToast('error', 'Error fetching settlement data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeChange = async (event, newValue) => {
    if (!newValue) {
      setFormData({ employeeCode: null });
      setEmployeeDetails({
        employeeCode: '',
        employeeName: '',
        resignationDate: '',
        lastWorkingDate: '',
        finalWorkingDate: '',
        sumOfEarnings: '',
        deductions: '',
        department: '',
        position: '',
        separationType: '',
        reasonCategory: ''
      });
      setReportData([]);
      return;
    }

    setFormData({ employeeCode: newValue.employeeCode });
    setFieldErrors((prev) => ({ ...prev, employeeCode: '' }));
    setIsLoading(true);

    try {
      const params = {
        branchCode: branchCode,
        empCode: newValue.employeeCode,
        orgId: orgId
      };

      const result = await apiCalls(
        'get',
        '/payslipsettlement/getpayslipSettlementDetails',
        null,
        params
      );

      if (result?.status === true && result?.paramObjectsMap?.payslipSettlementDetails) {
        const settlementData = result.paramObjectsMap.payslipSettlementDetails;
        const filteredData = settlementData.filter(item => item.employeecode !== 'TOTAL');

        const totalEarnings = filteredData.reduce((sum, item) => sum + parseFloat(item.sumofearning || 0), 0);
        const totalDeductions = filteredData.reduce((sum, item) => sum + parseFloat(item.sumofdetection || 0), 0);

        const firstRecord = filteredData[0] || {};

        setEmployeeDetails({
          employeeCode: firstRecord.employeecode || newValue.employeeCode,
          employeeName: firstRecord.employee || newValue.employeeName,
          resignationDate: firstRecord.resignation || newValue.resignationDate,
          lastWorkingDate: firstRecord.lastworkingdate || newValue.lastWorkingDate,
          finalWorkingDate: firstRecord.finalWorkingDate || newValue.finalWorkingDate,
          sumOfEarnings: totalEarnings.toFixed(2),
          deductions: totalDeductions.toFixed(2),
          department: newValue.department || '',
          position: newValue.position || '',
          separationType: newValue.separationType || '',
          reasonCategory: newValue.reasonCategory || ''
        });

        setReportData(filteredData);

        if (filteredData.length === 0) {
          showToast('info', 'No settlement data found');
        } else {
          showToast('success', 'Settlement loaded successfully');
        }

      } else {
        showToast('error', 'No settlement data found');
        setReportData([]);
      }

    } catch (error) {
      console.error(error);
      showToast('error', 'Error fetching settlement data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = reportData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Download Settlement Slip as PDF with proper number formatting and alignment
  const handleDownloadSlipPDF = () => {
    if (reportData.length === 0) {
      showToast('error', 'No settlement data to generate slip');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    let yPos = 15;

    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    const centerX = pageWidth / 2;

    // ✅ FIXED COLUMN ALIGNMENT
    const amountColumnX = rightMargin - 2;
    const componentColumnX = leftMargin + 5;
    const componentMaxWidth = amountColumnX - componentColumnX - 10;

    const primaryColor = [42, 75, 77];
    const lightBgColor = [245, 245, 245];

    const formatAmount = (amount) => {
      const num = parseFloat(amount || 0);
      return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    // ================= HEADER =================
    if (companyDetails?.companyLogo) {
      try {
        const logoBase64 = `data:image/png;base64,${companyDetails.companyLogo}`;
        doc.addImage(logoBase64, 'PNG', leftMargin, yPos, 50, 25);
      } catch (error) { }
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails?.companyName || 'Why Digit System Pvt. Ltd.', centerX, yPos + 12, { align: 'center' });

    doc.setFontSize(11);
    doc.text('Full and Final Settlement Confirmation', centerX, yPos + 22, { align: 'center' });

    yPos += 38;

    doc.setDrawColor(221, 221, 221);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;

    // ================= DATE =================
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dayjs().format('DD/MM/YYYY')}`, amountColumnX, yPos, { align: 'right' });
    yPos += 8;

    // ================= BODY =================
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dear ${employeeDetails.employeeName || 'Employee'},`, leftMargin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const resignationDateFormatted = employeeDetails.resignationDate
      ? dayjs(employeeDetails.resignationDate).format('DD/MM/YYYY')
      : '';

    const lastWorkingDateFormatted = employeeDetails.lastWorkingDate
      ? dayjs(employeeDetails.lastWorkingDate).format('DD/MM/YYYY')
      : '';

    const text = `This letter serves to confirm that your full and final settlement with ${companyDetails?.companyName || 'the company'} has been completed. Your resignation submitted on ${resignationDateFormatted} was accepted, and your last working day was ${lastWorkingDateFormatted}.`;

    const splitText = doc.splitTextToSize(text, pageWidth - 40);
    doc.text(splitText, leftMargin, yPos);
    yPos += splitText.length * 5 + 8;

    // ================= TABLE HEADER =================
    doc.setFillColor(...primaryColor);
    doc.rect(leftMargin, yPos - 3, rightMargin - leftMargin, 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    doc.text('Component', componentColumnX, yPos + 2);
    doc.text('Amount (INR)', amountColumnX, yPos + 2, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    yPos += 8;

    // ================= TABLE ROWS =================
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    let rowBg = false;

    const sortedData = [...reportData].sort((a, b) => new Date(a.month) - new Date(b.month));

    sortedData.forEach((item) => {
      const earnings = parseFloat(item.sumofearning || 0);
      const deductions = parseFloat(item.sumofdetection || 0);

      // Earnings
      if (rowBg) {
        doc.setFillColor(...lightBgColor);
        doc.rect(leftMargin, yPos - 3, rightMargin - leftMargin, 7, 'F');
      }

      doc.text(`${item.month} - Earnings`, componentColumnX, yPos + 2, {
        maxWidth: componentMaxWidth
      });

      doc.text(formatAmount(earnings), amountColumnX, yPos + 2, { align: 'right' });
      yPos += 7;

      // Deductions
      if (!rowBg) {
        doc.setFillColor(...lightBgColor);
        doc.rect(leftMargin, yPos - 3, rightMargin - leftMargin, 7, 'F');
      }

      doc.text(`${item.month} - Deductions`, componentColumnX, yPos + 2, {
        maxWidth: componentMaxWidth
      });

      doc.text(formatAmount(deductions), amountColumnX, yPos + 2, { align: 'right' });
      yPos += 7;

      rowBg = !rowBg;
    });

    yPos += 2;

    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, yPos - 2, rightMargin, yPos - 2);

    // ================= TOTALS =================
    const totalEarnings = sortedData.reduce((sum, i) => sum + parseFloat(i.sumofearning || 0), 0);
    const totalDeductions = sortedData.reduce((sum, i) => sum + parseFloat(i.sumofdetection || 0), 0);
    const netPayable = totalEarnings - totalDeductions;

    doc.setFont('helvetica', 'bold');

    doc.text('Total Earnings', componentColumnX, yPos + 3);
    doc.text(formatAmount(totalEarnings), amountColumnX, yPos + 3, { align: 'right' });
    yPos += 7;

    doc.text('Total Deductions', componentColumnX, yPos + 2);
    doc.text(formatAmount(totalDeductions), amountColumnX, yPos + 2, { align: 'right' });
    yPos += 8;

    // Net Payable
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos - 3, rightMargin, yPos - 3);

    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);

    doc.text('Net Payable Amount', componentColumnX, yPos + 2);
    doc.text(formatAmount(netPayable), amountColumnX, yPos + 2, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    yPos += 10;

    // ================= FOOTER =================
    const footer1 = doc.splitTextToSize(
      'All company property assigned to you has been returned and acknowledged by the relevant departments. There are no outstanding dues pending from your side.',
      pageWidth - 40
    );
    doc.text(footer1, leftMargin, yPos);
    yPos += footer1.length * 4 + 6;

    const footer2 = doc.splitTextToSize(
      'We sincerely thank you for your valuable contributions during your tenure and wish you continued success in your future endeavours.',
      pageWidth - 40
    );
    doc.text(footer2, leftMargin, yPos);
    yPos += footer2.length * 4 + 12;

    doc.text('Sincerely,', leftMargin, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails?.ceo || 'XYZ', leftMargin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.text('CEO / Managing Director', leftMargin, yPos);
    yPos += 6;

    doc.text(companyDetails?.companyName || 'Why Digit System Pvt. Ltd.', leftMargin, yPos);

    doc.save(`Settlement_Slip_${employeeDetails.employeeCode}_${dayjs().format('YYYY-MM-DD')}.pdf`);
  };

  const handlePreview = () => {
    if (reportData.length === 0) {
      showToast('error', 'No settlement data to preview');
      return;
    }
    setPreviewOpen(true);
  };

  const formatNumberWithCommas = (value) => {
    if (!value || value === '0') return '₹ 0.00';
    const num = parseFloat(value);
    if (isNaN(num)) return `₹ ${value}`;
    return `₹ ${num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })}`;
  };

  // Calculate totals for display
  const totalGross = reportData.reduce((sum, item) => sum + parseFloat(item.grossSalary || 0), 0);
  const totalEarnings = reportData.reduce((sum, item) => sum + parseFloat(item.sumofearning || 0), 0);
  const totalDeductions = reportData.reduce((sum, item) => sum + parseFloat(item.sumofdetection || 0), 0);
  const totalNet = reportData.reduce((sum, item) => sum + parseFloat(item.netSalary || 0), 0);

  // Preview Slip Component with company details and all months
  const SettlementPreviewSlip = () => {
    const totalEarningsPreview = reportData.reduce((sum, item) => sum + parseFloat(item.sumofearning || 0), 0);
    const totalDeductionsPreview = reportData.reduce((sum, item) => sum + parseFloat(item.sumofdetection || 0), 0);
    // const netPayablePreview = totalEarningsPreview - totalDeductionsPreview;
    const netPayablePreview = reportData.reduce((sum, item) => sum + parseFloat(item.netSalary || 0), 0);
    const currencySymbol = companyDetails?.currency === 'INR' ? '₹' : '£';

    // Format dates safely
    const resignationDateFormatted = employeeDetails.resignationDate
      ? dayjs(employeeDetails.resignationDate).format('DD/MM/YYYY')
      : '';
    const lastWorkingDateFormatted = employeeDetails.lastWorkingDate
      ? dayjs(employeeDetails.lastWorkingDate).format('DD/MM/YYYY')
      : '';

    return (
      <Box sx={{
        maxWidth: '650px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #e0e0e0',
        borderRadius: '8px'
      }}>
        {/* Company Logo and Header - Logo Left, Company Name Center */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0 }}>
          {/* Logo on Left - No background */}
          <Box sx={{ width: '80px', display: 'flex', justifyContent: 'flex-start' }}>
            {companyDetails?.companyLogo && (
              <img
                src={`data:image/png;base64,${companyDetails.companyLogo}`}
                alt="Company Logo"
                style={{
                  width: '140px',
                  height: '140px',
                  objectFit: 'contain',
                  backgroundColor: 'transparent'
                }}
              />
            )}
          </Box>

          {/* Company Name and Title Centered */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2a4b4d' }}>
              {companyDetails?.companyName || ''}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
              Full and Final Settlement Confirmation
            </Typography>
          </Box>

          {/* Empty Box for balance (same width as logo) */}
          <Box sx={{ width: '80px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Date */}
        <Typography variant="body2" align="right" sx={{ mb: 2 }}>
          Date: {dayjs().format('DD/MM/YYYY')}
        </Typography>

        {/* Dear */}
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Dear {employeeDetails.employeeName || 'Employee'},
        </Typography>

        {/* Letter Body */}
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'justify' }}>
          This letter serves to confirm that your full and final settlement with {companyDetails?.companyName || 'the company'} has been completed.
          Your resignation submitted on {resignationDateFormatted} was accepted, and your last working day was {lastWorkingDateFormatted}.
        </Typography>

        {/* Table - Show ALL months dynamically with correct order */}
        <Box sx={{ my: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', py: 1, backgroundColor: '#f5f5f5' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Component</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Amount ({companyDetails?.currency || 'INR'})</Typography>
          </Box>

          {reportData.map((item, idx) => (
            <React.Fragment key={idx}>

              {/* Earnings */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body2">
                  Salary for {parseInt(item.payableDays || 0)} days in {item.month}
                </Typography>
                <Typography variant="body2">
                  {currencySymbol} {parseFloat(item.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>

              {/* Deductions (only if > 0) */}
              {parseFloat(item.sumofdetection || 0) > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2" sx={{ pl: 2 }}>
                    Deductions for {item.month}
                  </Typography>
                  <Typography variant="body2">
                    {currencySymbol} {parseFloat(item.sumofdetection || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              )}

            </React.Fragment>
          ))}

          {/* Totals Section */}
          {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', py: 1, mt: 1, backgroundColor: '#f9f9f9' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Earnings</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{currencySymbol} {totalEarningsPreview.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
          </Box> */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Deductions</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{currencySymbol} {totalDeductionsPreview.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #2a4b4d', py: 1, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>Net Payable Amount</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2a4b4d' }}>{currencySymbol} {netPayablePreview.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
          </Box>
        </Box>

        {/* Company Property Statement */}
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'justify' }}>
          All company property assigned to you has been returned and acknowledged by the relevant departments.
          There are no outstanding dues pending from your side.
        </Typography>

        {/* Thank You Note */}
        <Typography variant="body2" sx={{ mb: 3, textAlign: 'justify' }}>
          We sincerely thank you for your valuable contributions during your tenure and wish you continued success in your future endeavours.
        </Typography>

        {/* Signature */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2">Sincerely,</Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>{companyDetails?.ceo || 'XYZ'}</Typography>
          <Typography variant="body2">CEO / Managing Director</Typography>
          <Typography variant="body2">{companyDetails?.companyName || 'Why Digit System Pvt. Ltd.'}</Typography>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        {/* Search Section */}
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px', gap: '8px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={handleClick} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleAllClear} />
            <ActionButton title="Preview" icon={PreviewIcon} onClick={handlePreview} disabled={reportData.length === 0} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <Autocomplete
              size="small"
              options={employeeList}
              getOptionLabel={(option) => option ? `${option.employeeCode} - ${option.employeeName}` : ''}
              value={employeeList.find((emp) => emp.employeeCode === formData.employeeCode) || null}
              onChange={handleEmployeeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Employee *"
                  variant="outlined"
                  fullWidth
                  error={!!fieldErrors.employeeCode}
                  helperText={fieldErrors.employeeCode || ''}
                />
              )}
              isOptionEqualToValue={(option, value) => option.employeeCode === value?.employeeCode}
              loading={isFetchingEmployees}
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Employee Name"
              variant="outlined"
              fullWidth
              value={employeeDetails.employeeName}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Department"
              variant="outlined"
              fullWidth
              value={employeeDetails.department}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Position"
              variant="outlined"
              fullWidth
              value={employeeDetails.position}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Separation Type"
              variant="outlined"
              fullWidth
              value={employeeDetails.separationType}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Reason Category"
              variant="outlined"
              fullWidth
              value={employeeDetails.reasonCategory}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Resignation Date"
              variant="outlined"
              fullWidth
              value={employeeDetails.resignationDate ? dayjs(employeeDetails.resignationDate).format('DD-MM-YYYY') : ''}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Last Working Date"
              variant="outlined"
              fullWidth
              value={employeeDetails.lastWorkingDate ? dayjs(employeeDetails.lastWorkingDate).format('DD-MM-YYYY') : ''}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Final Working Date"
              variant="outlined"
              fullWidth
              value={employeeDetails.finalWorkingDate ? dayjs(employeeDetails.finalWorkingDate).format('DD-MM-YYYY') : ''}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Sum Of Earnings"
              variant="outlined"
              fullWidth
              value={formatNumberWithCommas(employeeDetails.sumOfEarnings)}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextField
              size="small"
              label="Deductions"
              variant="outlined"
              fullWidth
              value={formatNumberWithCommas(employeeDetails.deductions)}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
          </div>

          {(isLoading || isFetchingEmployees) && (
            <div className="col-md-12" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <CircularProgress size={40} />
            </div>
          )}
        </div>

        {/* Settlement Report Table */}
        <Box sx={{ mt: 4 }}>
          <Table stickyHeader component={Paper}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', fontWeight: 'bold' }}>Month</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', fontWeight: 'bold' }} align="center">Total Days</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', fontWeight: 'bold' }} align="center">Payable Days</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', fontWeight: 'bold' }} align="right">Earnings</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', fontWeight: 'bold' }} align="right">Deductions</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', fontWeight: 'bold' }} align="right">Gross Salary</TableCell>
                <TableCell sx={{ backgroundColor: '#2a4b4d', color: '#fff', fontWeight: 'bold' }} align="right">Net Salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{item.month}</TableCell>
                    <TableCell align="center">{item.totalDays}</TableCell>
                    <TableCell align="center">{item.payableDays}</TableCell>
                    <TableCell align="right">{formatNumberWithCommas(item.sumofearning)}</TableCell>
                    <TableCell align="right">{formatNumberWithCommas(item.sumofdetection)}</TableCell>
                    <TableCell align="right">{formatNumberWithCommas(item.grossSalary)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2a4b4d' }}>
                      {formatNumberWithCommas(item.netSalary)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    {isLoading ? 'Loading settlement data...' :
                      formData.employeeCode ? 'No settlement data found. Please click Search to fetch data.' :
                        'Please select an employee and click Search to view settlement details.'}
                  </TableCell>
                </TableRow>
              )}
              {reportData.length > 0 && (
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumberWithCommas(totalEarnings)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumberWithCommas(totalDeductions)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumberWithCommas(totalGross)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2a4b4d', fontSize: '1.1em' }}>
                    {formatNumberWithCommas(totalNet)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {reportData.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={reportData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </Box>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#2a4b4d', color: '#fff' }}>
          Settlement Slip Preview
        </DialogTitle>
        <DialogContent dividers>
          <SettlementPreviewSlip />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreviewOpen(false)}
            sx={{
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleDownloadSlipPDF}
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            sx={{
              backgroundColor: '#2a4b4d',
              '&:hover': { backgroundColor: '#1d3536' },
              color: '#fff'
            }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettlementReport;