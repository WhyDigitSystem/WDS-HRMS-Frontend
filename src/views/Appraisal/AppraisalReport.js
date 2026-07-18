import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  FormControlLabel,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const monthsList = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const reportTypes = ['summary', 'detailed'];

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 5; i++) {
    years.push(currentYear - i);
  }
  return years;
};

export default function AppraisalReport({ employeesData }) {
  const getCurrentMonth = () => {
    const currentDate = new Date();
    return monthsList[currentDate.getMonth()];
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [branchList, setBranchList] = useState(['ALL']);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [user] = useState(localStorage.getItem('employeeCode'));
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [reportType, setReportType] = useState('detailed');
  const [includeEmployeeTotals, setIncludeEmployeeTotals] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flattenedData, setFlattenedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const yearsList = generateYears();

  useEffect(() => {
    getCompanyDetails();
    getAllBranches();
  }, []);

  useEffect(() => {
    getAllPerformanceGoals();
  }, [selectedMonth, selectedBranch, selectedYear, orgId]);

  useEffect(() => {
    if (performanceData.length > 0) {
      const flattened = flattenPerformanceData(performanceData);
      setFlattenedData(flattened);
    } else {
      setFlattenedData([]);
    }
  }, [performanceData]);

  useEffect(() => {
    if (flattenedData.length > 0) {
      applyFilters();
    } else {
      setFilteredData([]);
    }
  }, [selectedMonth, selectedBranch, flattenedData]);

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
      if (response.paramObjectsMap && response.paramObjectsMap.companyVO && Array.isArray(response.paramObjectsMap.companyVO)) {
        const companyData = response.paramObjectsMap.companyVO[0];
        setCompanyDetails(companyData);
        console.log('Company details loaded:', companyData);
        if (companyData.companyLogo) {
          console.log('Company logo found, length:', companyData.companyLogo.length);
        } else {
          console.log('No company logo found in company data');
        }
      } else {
        console.log('No company details found in response');
        setCompanyDetails(null);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('Error fetching company details', 'error');
      setCompanyDetails(null);
    }
  };

  const flattenPerformanceData = (data) => {
    const flattened = [];

    data.forEach((employee) => {
      if (employee.performanceGoalsDtlVO && Array.isArray(employee.performanceGoalsDtlVO)) {
        employee.performanceGoalsDtlVO.forEach((goal) => {
          flattened.push({
            id: employee.id,
            empCode: employee.empCode,
            empName: employee.empName,
            reportingto: employee.reportingto,
            reportingname: employee.reportingname,
            department: employee.department,
            branch: employee.branch,
            appraisalYear: employee.appraisalYear,
            pmonth: employee.pmonth,
            finYear: employee.finYear,

            goalId: goal.id,
            perspective: goal.perspective,
            objectivedesc: goal.objectivedesc,
            perassigned: goal.perassigned,
            measurement: goal.measurement,
            qtrtarget: goal.qtrtarget,
            performance: goal.performance,
            comments: goal.comments,
            performanceself: goal.performanceself,
            selfrating: goal.selfrating,
            appraiserrating: goal.appraiserrating,
            apprjustification: goal.apprjustification
          });
        });
      } else {
        flattened.push({
          id: employee.id,
          empCode: employee.empCode,
          empName: employee.empName,
          reportingto: employee.reportingto,
          reportingname: employee.reportingname,
          department: employee.department,
          branch: employee.branch,
          appraisalYear: employee.appraisalYear,
          pmonth: employee.pmonth,
          finYear: employee.finYear,

          goalId: null,
          perspective: null,
          objectivedesc: null,
          perassigned: null,
          measurement: null,
          qtrtarget: null,
          performance: null,
          comments: null,
          performanceself: null,
          selfrating: null,
          appraiserrating: null,
          apprjustification: null
        });
      }
    });

    return flattened;
  };

  const applyFilters = () => {
    let filtered = [...flattenedData];

    if (selectedMonth) {
      filtered = filtered.filter((item) => item.pmonth === selectedMonth);
    }

    if (selectedBranch && selectedBranch !== 'ALL') {
      filtered = filtered.filter((item) => item.branch === selectedBranch);
    }

    setFilteredData(filtered);
  };

  const getAllBranches = async () => {
    try {
      const response = await apiCalls('get', `/master/branch?orgid=${orgId}`);

      if (response.status) {
        const branches = response.paramObjectsMap?.branchVO || [];
        const branchNames = branches.map((branch) => branch.branch || branch.branchName || branch.name || 'Unknown');
        const uniqueBranchNames = ['ALL', ...new Set(branchNames)];
        setBranchList(uniqueBranchNames);
      } else {
        showToast('warning', 'Failed to fetch branches, using default list');
        setBranchList(['ALL', 'BANGALORE', 'CHENNAI', 'Hyderabad']);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      showToast('warning', 'Failed to fetch branches, using default list');
      setBranchList(['ALL', 'BANGALORE', 'CHENNAI', 'Hyderabad']);
    }
  };

  const getAllPerformanceGoals = async () => {
    try {
      setIsLoading(true);

      const response = await apiCalls(
        'get',
        `/performancegoals/getPerformanceGoalsDetailsReport?orgId=${orgId}&pmonth=${selectedMonth}&branch=${selectedBranch}&appraisalYear=${selectedYear}`
      );

      if (response.status) {
        const data = response.paramObjectsMap?.getPerformanceGoalsDetails || [];
        console.log('API Response Data:', data);

        if (data.length > 0) {
          console.log('First employee data:', data[0]);
          if (data[0].performanceGoalsDtlVO) {
            console.log('First goal data:', data[0].performanceGoalsDtlVO[0]);
          }
        }

        setPerformanceData(data);

        if (data.length === 0) {
          showToast('warning', `No performance data found for ${selectedMonth} ${selectedYear} in ${selectedBranch}`);
        } else {
          // showToast('success', `Loaded ${data.length} employee records`);
        }
      } else {
        showToast('error', response.message || 'Failed to fetch performance data');
        setPerformanceData([]);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      showToast('error', 'Failed to fetch performance data');
      setPerformanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addLogoToExcel = async (workbook, sheet, companyDetails) => {
    if (!companyDetails || !companyDetails.companyLogo) {
      console.log('No company logo found in company details');
      return false;
    }

    try {
      let base64Data = companyDetails.companyLogo;
      console.log('Logo data available, length:', base64Data.length);

      if (base64Data.startsWith('data:image/')) {
        base64Data = base64Data.split(',')[1];
      }

      base64Data = base64Data.replace(/\s/g, '');

      console.log('Processed logo data length:', base64Data.length);

      const imageId = workbook.addImage({
        base64: base64Data,
        extension: 'png'
      });

      console.log('Image added to workbook with ID:', imageId);

      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        br: { col: 2, row: 4 } // Adjust size as needed
      });

      console.log('Logo successfully added to Excel');
      return true;
    } catch (error) {
      console.error('Error adding logo to Excel:', error);
      console.error('Error details:', error.message);
      return false;
    }
  };

  const testLogo = async () => {
    if (!companyDetails || !companyDetails.companyLogo) {
      console.log('No company details or logo available');
      return;
    }

    try {
      let base64Data = companyDetails.companyLogo;

      if (base64Data.startsWith('data:image/')) {
        base64Data = base64Data.split(',')[1];
      }

      base64Data = base64Data.replace(/\s/g, '');

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      console.log('Logo blob URL created:', blobUrl);

      const testImg = new Image();
      testImg.onload = () => {
        console.log('Logo image loaded successfully, dimensions:', testImg.width, 'x', testImg.height);
        URL.revokeObjectURL(blobUrl);
      };
      testImg.onerror = () => {
        console.error('Logo image failed to load');
        URL.revokeObjectURL(blobUrl);
      };
      testImg.src = blobUrl;
    } catch (error) {
      console.error('Error testing logo:', error);
    }
  };

  useEffect(() => {
    if (companyDetails && companyDetails.companyLogo) {
      testLogo();
    }
  }, [companyDetails]);

  const parsePercentage = (value) => {
    if (!value) return 0;
    const num = parseFloat(value.toString().replace('%', '').trim());
    return isNaN(num) ? 0 : num / 100;
  };

  const downloadExcel = async (data) => {
    if (reportType === 'summary') {
      await generateSummaryExcel(data);
    } else {
      await generateDetailedExcel(data);
    }
  };

  const generatedOn = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const generateDetailedExcel = async (data) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Appraisal Report');

      /* ================= COLORS ================= */
      const colors = {
        headerDark: 'FF1F3A5F',
        headerBlue: 'FF3F6FB5',
        lightBlue: 'FFEAF1FB',
        evenRow: 'FFFFFFFF',
        oddRow: 'FFF6F8FC',
        border: 'FFB0BEC5',
        textWhite: 'FFFFFFFF'
      };

      /* ================= BORDERS ================= */
      const allBorders = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      let currentRow = 1;

      /* ================= LOGO ================= */
      sheet.mergeCells('A1:B3');
      const logoCell = sheet.getCell('A1');

      if (companyDetails?.companyLogo) {
        try {
          let base64 = companyDetails.companyLogo;
          if (base64.startsWith('data:image/')) base64 = base64.split(',')[1];

          const imageId = workbook.addImage({
            base64,
            extension: 'png'
          });

          sheet.addImage(imageId, 'A1:B3');
        } catch {
          logoCell.value = companyDetails?.companyName || 'COMPANY';
        }
      } else {
        logoCell.value = companyDetails?.companyName || 'COMPANY';
      }

      logoCell.alignment = { vertical: 'middle', horizontal: 'center' };
      logoCell.font = { bold: true, size: 12 };
      logoCell.border = allBorders;

      /* ================= TITLE ================= */
      sheet.mergeCells('C1:G3');
      const titleCell = sheet.getCell('C1');
      titleCell.value = 'EMPLOYEE APPRAISAL REPORT';
      titleCell.font = { size: 18, bold: true, color: { argb: colors.textWhite } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.headerDark }
      };
      titleCell.border = allBorders;

      /* ================= INFO ROW ================= */
      currentRow = 4;
      sheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const infoCell = sheet.getCell(`A${currentRow}`);
      infoCell.value = `Period: ${selectedMonth} ${selectedYear} | Branch: ${
        selectedBranch === 'ALL' ? 'ALL' : selectedBranch
      } | Report: ${reportType.toUpperCase()} | Generated By: ${user} | Generated On: ${generatedOn}}
    `;
      infoCell.font = { bold: true };
      infoCell.alignment = { vertical: 'middle', horizontal: 'center' };
      infoCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.lightBlue }
      };
      infoCell.border = allBorders;

      currentRow += 2;

      /* ================= COLUMNS ================= */
      sheet.columns = [
        { width: 6 },
        { width: 12 },
        { width: 28 },
        { width: 14 },
        { width: 20 },
        { width: 22 },
        { width: 40 },
        { width: 35 },
        { width: 18 },
        { width: 22 },
        { width: 35 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 45 },
        { width: 30 }
      ];
      /* ================= TABLE HEADER ================= */
      const headers = [
        'S.No',
        'Code',
        'Name',
        'Branch',
        'Department',
        'Reporting Manager',
        'Perspective',
        'Objective Description',
        'Assigned (%)',
        'Measurement',
        'Quarter Target',
        'Employee Performance',
        'Self Rating',
        'Appraiser Rating',
        'Comments',
        'Appraiser Justification'
      ];

      const headerRow = sheet.getRow(currentRow);
      headerRow.height = 28;

      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, color: { argb: colors.textWhite } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.headerBlue }
        };
        cell.border = allBorders;
      });

      currentRow++;

      /* ================= DATA ================= */
      const validData = data.filter((d) => d.objectivedesc);

      validData.forEach((row, index) => {
        const r = sheet.getRow(currentRow);
        r.height = 22;

        const values = [
          index + 1,
          row.empCode,
          row.empName,
          row.branch,
          row.department,
          row.reportingname,
          row.perspective,
          row.objectivedesc,
          row.perassigned,
          row.measurement,
          row.qtrtarget,
          row.performance,
          row.selfrating,
          row.appraiserrating,
          row.comments,
          row.apprjustification
        ];

        values.forEach((val, col) => {
          const cell = r.getCell(col + 1);
          cell.value = val || '-';
          cell.border = allBorders;
          cell.alignment = {
            vertical: 'top',
            horizontal: [13, 14].includes(col + 1) ? 'right' : 'left',
            wrapText: true
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: index % 2 === 0 ? colors.evenRow : colors.oddRow
            }
          };
        });

        currentRow++;
      });

      /* ================= FREEZE HEADER ================= */
      sheet.views = [{ state: 'frozen', ySplit: currentRow > 8 ? 8 : 7 }];

      /* ================= SAVE ================= */
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
        `Appraisal_Report_${selectedMonth}_${selectedYear}.xlsx`
      );

      showToast('success', 'Appraisal report generated successfully');
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to generate appraisal report');
    }
  };

  const generateSummaryExcel = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Appraisal Summary");

    /* ================= COLORS ================= */
    const colors = {
      headerDark: "FF1F3A5F",
      headerBlue: "FF3F6FB5",
      lightBlue: "FFEAF1FB",
      evenRow: "FFFFFFFF",
      oddRow: "FFF6F8FC",
      border: "FFB0BEC5",
      textWhite: "FFFFFFFF",
      textDark: "FF000000",
    };

    /* ================= BORDERS ================= */
    const allBorders = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    let currentRow = 1;

    /* ================= LOGO ================= */
    sheet.mergeCells("A1:B3");
    const logoCell = sheet.getCell("A1");

    if (companyDetails?.companyLogo) {
      try {
        let base64 = companyDetails.companyLogo;
        if (base64.startsWith("data:image/")) base64 = base64.split(",")[1];

        const imageId = workbook.addImage({
          base64,
          extension: "png",
        });
        sheet.addImage(imageId, "A1:B3");
      } catch {
        logoCell.value = companyDetails?.companyName || "COMPANY";
      }
    } else {
      logoCell.value = companyDetails?.companyName || "COMPANY";
    }

    logoCell.alignment = { vertical: "middle", horizontal: "center" };
    logoCell.font = { bold: true, size: 12 };
    logoCell.border = allBorders;

    /* ================= TITLE ================= */
    sheet.mergeCells("C1:J3");
    const titleCell = sheet.getCell("C1");
    titleCell.value = "EMPLOYEE APPRAISAL SUMMARY REPORT";
    titleCell.font = { size: 18, bold: true, color: { argb: colors.textWhite } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.headerDark },
    };
    titleCell.border = allBorders;

    /* ================= INFO ROW ================= */
    currentRow = 4;
    sheet.mergeCells(`A${currentRow}:J${currentRow}`);
    const infoCell = sheet.getCell(`A${currentRow}`);

    const generatedOn = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    infoCell.value = `Period: ${selectedMonth} ${selectedYear} | Branch: ${
      selectedBranch === "ALL" ? "ALL BRANCHES" : selectedBranch.toUpperCase()
    } | Report: SUMMARY | Generated By: ${user} | Generated On: ${generatedOn}`;

    infoCell.font = { bold: true, color: { argb: colors.textDark } };
    infoCell.alignment = { vertical: "middle", horizontal: "center" };
    infoCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.lightBlue },
    };
    infoCell.border = allBorders;

    currentRow += 2;

    /* ================= COLUMNS ================= */
    sheet.columns = [
      { width: 6 },   // S.No
      { width: 14 },  // Emp Code
      { width: 24 },  // Name
      { width: 16 },  // Branch
      { width: 20 },  // Department
      { width: 22 },  // Reporting Manager
      { width: 14 },  // Total Goals
      { width: 14 },  // Avg Self Rating
      { width: 18 },  // Avg Appraiser Rating
      { width: 16 },  // Final Score
    ];

    /* ================= HEADER ================= */
    const headers = [
      "S.No",
      "Employee Code",
      "Employee Name",
      "Branch",
      "Department",
      "Reporting Manager",
      "Total Goals",
      "Avg Self Rating",
      "Avg Appraiser Rating",
      "Final Score",
    ];

    const headerRow = sheet.getRow(currentRow);
    headerRow.height = 28;

    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: colors.textWhite } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.headerBlue },
      };
      cell.border = allBorders;
    });

    currentRow++;

    /* ================= SUMMARY LOGIC ================= */
    const summaryMap = {};

    data.forEach((row) => {
      const empCode = row.empCode || "UNKNOWN";

      if (!summaryMap[empCode]) {
        summaryMap[empCode] = {
          empCode,
          empName: row.empName,
          branch: row.branch,
          department: row.department,
          reportingname: row.reportingname || row.reportingto || "-",
          goals: 0,
          totalSelf: 0,
          totalAppr: 0,
          totalScore: 0,
          selfCount: 0,
          apprCount: 0,
        };
      }

      const emp = summaryMap[empCode];

      if (row.objectivedesc) emp.goals++;

      const self = Number(row.selfrating) || 0;
      const appr = Number(row.appraiserrating) || 0;
      const weight = (Number(row.perassigned) || 0) / 100;

      if (self > 0) {
        emp.totalSelf += self;
        emp.selfCount++;
      }
      if (appr > 0) {
        emp.totalAppr += appr;
        emp.apprCount++;
        emp.totalScore += appr * weight;
      }
    });

    const summaryData = Object.values(summaryMap);

    /* ================= SUMMARY DATA ================= */
    summaryData.forEach((emp, index) => {
      const r = sheet.getRow(currentRow);
      r.height = 22;

      const values = [
        index + 1,
        emp.empCode,
        emp.empName,
        emp.branch,
        emp.department,
        emp.reportingname,
        emp.goals,
        emp.selfCount ? (emp.totalSelf / emp.selfCount).toFixed(0) : "-",
        emp.apprCount ? (emp.totalAppr / emp.apprCount).toFixed(0) : "-",
        emp.totalScore.toFixed(0),
      ];

      values.forEach((val, col) => {
        const cell = r.getCell(col + 1);
        cell.value = val;
        cell.border = allBorders;
        cell.alignment = {
          vertical: "middle",
          horizontal: [1, 7, 8, 9, 10].includes(col + 1) ? "right" : "left",
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: index % 2 === 0 ? colors.evenRow : colors.oddRow,
          },
        };
      });

      currentRow++;
    });

    /* ================= FREEZE ================= */
    sheet.views = [{ state: "frozen", ySplit: 6 }];

    /* ================= SAVE ================= */
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Appraisal_Summary_Report_${selectedMonth}_${selectedYear}.xlsx`
    );

    showToast("success", "Appraisal summary report generated successfully");
  } catch (error) {
    console.error("Error creating summary Excel:", error);
    showToast("error", "Failed to generate summary Excel report");
  }
};

  const handleDownload = async () => {
    const dataToDownload = filteredData.length > 0 ? filteredData : flattenedData;

    if (dataToDownload.length === 0) {
      showToast('warning', 'No data available to download. Please check if data is loaded.');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadExcel(dataToDownload);
    } catch (error) {
      console.error('Error downloading report:', error);
      showToast('error', 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Loading performance data for {selectedMonth} {selectedYear}...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label="Month">
                {monthsList.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} label="Year">
                {yearsList.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Branch</InputLabel>
              <Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} label="Branch">
                {branchList.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} onChange={(e) => setReportType(e.target.value)} label="Report Type">
                {reportTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={includeEmployeeTotals}
                                    onChange={(e) => setIncludeEmployeeTotals(e.target.checked)}
                                />
                            }
                            label="Include Employee Totals"
                        />
                    </Grid> */}

          <Grid item xs={12}>
           <Button
  variant="contained"
  onClick={handleDownload}
  disabled={isDownloading || flattenedData.length === 0}
  startIcon={
    isDownloading ? <CircularProgress size={18} thickness={5} sx={{ color: '#fff' }} /> : undefined
  }
  sx={{
    mb: 1,
    borderRadius: '10px',
    px: 2,
    py: 0.8,
    minWidth: 240,
    fontWeight: 600,
    fontSize: '13px',
    textTransform: 'none',

    background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
    color: '#fff',

    boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
    transition: 'all 0.25s ease',

    '&:hover': {
      background: 'linear-gradient(135deg, #325c5e 0%, #223d3f 100%)',
      boxShadow: '0 6px 16px rgba(15,23,42,0.18)',
      transform: 'translateY(-1px)'
    },

    '&:active': {
      transform: 'scale(0.98)'
    },

    '&.Mui-disabled': {
      background: '#90a4ae',
      color: '#fff'
    }
  }}
>
  {isDownloading ? 'Downloading...' : 'Download Appraisal Report'}
</Button>
          </Grid>
        </Grid>
      </Paper>
      <ToastComponent />
    </Box>
  );
}
