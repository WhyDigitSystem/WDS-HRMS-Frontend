import React, { useState, useEffect } from "react";
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
    Paper,
} from "@mui/material";
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const reportTypes = ["summary", "detailed"];

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
    const [branchList, setBranchList] = useState(["ALL"]);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [performanceData, setPerformanceData] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("ALL");
    const [reportType, setReportType] = useState("detailed");
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

        data.forEach(employee => {
            if (employee.performanceGoalsDtlVO && Array.isArray(employee.performanceGoalsDtlVO)) {
                employee.performanceGoalsDtlVO.forEach(goal => {
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
            filtered = filtered.filter((item) =>
                item.pmonth === selectedMonth
            );
        }

        if (selectedBranch && selectedBranch !== "ALL") {
            filtered = filtered.filter((item) =>
                item.branch === selectedBranch
            );
        }

        setFilteredData(filtered);
    };

    const getAllBranches = async () => {
        try {
            const response = await apiCalls('get', `/master/branch?orgid=${orgId}`);

            if (response.status) {
                const branches = response.paramObjectsMap?.branchVO || [];
                const branchNames = branches.map(branch =>
                    branch.branch || branch.branchName || branch.name || 'Unknown'
                );
                const uniqueBranchNames = ["ALL", ...new Set(branchNames)];
                setBranchList(uniqueBranchNames);
            } else {
                showToast('warning', 'Failed to fetch branches, using default list');
                setBranchList(["ALL", "BANGALORE", "CHENNAI", "Hyderabad"]);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('warning', 'Failed to fetch branches, using default list');
            setBranchList(["ALL", "BANGALORE", "CHENNAI", "Hyderabad"]);
        }
    };

    const getAllPerformanceGoals = async () => {
        try {
            setIsLoading(true);

            const response = await apiCalls('get',
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
                extension: 'png',
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
        if (reportType === "summary") {
            await generateSummaryExcel(data);
        } else {
            await generateDetailedExcel(data);
        }
    };

    const generateDetailedExcel = async (data) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Appraisal Report");

            const colors = {
                primaryHeader: "2C3E50",
                secondaryHeader: "34495E",
                accentHeader: "3498DB",
                infoHeader: "ECF0F1",
                purpleHeader: "593C8F",
                blueHeader: "3F51B5",
                evenRow: "FFFFFF",
                oddRow: "F3F3F3",
                highlightGreen: "D5EDD8",
                highlightYellow: "FFF2CC",
                border: "BDC3C7",
                employeeHeader: "E8F5E8",
                totalRow: "DEEBF7",
            };

            const allBorders = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };

            let currentRow = 1;

            const logoTitleRow = sheet.getRow(currentRow);
            logoTitleRow.height = 30;

            if (companyDetails?.companyLogo) {
                try {
                    let base64Data = companyDetails.companyLogo;

                    if (base64Data.startsWith('data:image/')) {
                        base64Data = base64Data.split(',')[1];
                    }

                    base64Data = base64Data.replace(/\s/g, '');

                    const imageId = workbook.addImage({
                        base64: base64Data,
                        extension: 'png',
                    });

                    sheet.addImage(imageId, 'A1:B2');
                    console.log('Logo added successfully');

                } catch (logoError) {
                    console.error('Error adding logo:', logoError);
                    // Fallback: Add company name
                    sheet.mergeCells('A1:B2');
                    const logoCell = sheet.getCell('A1');
                    logoCell.value = companyDetails?.companyName || 'COMPANY LOGO';
                    logoCell.font = { bold: true, size: 12, color: { argb: "FF2C3E50" } };
                    logoCell.alignment = { vertical: "middle", horizontal: "center" };
                    logoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECF0F1" } };
                    logoCell.border = allBorders;
                }
            } else {
                // No logo available
                sheet.mergeCells('A1:B2');
                const logoCell = sheet.getCell('A1');
                logoCell.value = companyDetails?.companyName || 'COMPANY LOGO';
                logoCell.font = { bold: true, size: 12, color: { argb: "FF2C3E50" } };
                logoCell.alignment = { vertical: "middle", horizontal: "center" };
                logoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECF0F1" } };
                logoCell.border = allBorders;
            }

            // Title (C1:P2)
            sheet.mergeCells(`C${currentRow}:P${currentRow + 1}`);
            const titleCell = sheet.getCell(`C${currentRow}`);
            titleCell.value = "EMPLOYEE APPRAISAL REPORT";
            titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
            titleCell.alignment = { vertical: "middle", horizontal: "center" };
            titleCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: colors.primaryHeader },
            };
            titleCell.border = allBorders;

            currentRow += 2;

            // Info Row (C3:P3)
            const infoRow = sheet.getRow(currentRow);
            infoRow.height = 25;
            sheet.mergeCells(`C${currentRow}:P${currentRow}`);
            const infoCell = sheet.getCell(`C${currentRow}`);
            infoCell.value = `PERIOD: ${selectedMonth} ${selectedYear} | BRANCH: ${selectedBranch === "ALL"
                ? "ALL BRANCHES"
                : selectedBranch.toUpperCase()
                } | REPORT TYPE: ${reportType.toUpperCase()} | GROUPED: ${includeEmployeeTotals ? "YES" : "NO"}`;
            infoCell.font = { size: 11, bold: true, color: { argb: "FF000000" } };
            infoCell.alignment = { vertical: "middle", horizontal: "center" };
            infoCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: colors.infoHeader },
            };
            infoCell.border = allBorders;

            currentRow += 1;

            // Empty row for spacing
            currentRow += 1;

            // ========== TABLE SECTION ==========

            // Set column widths (removed designation column)
            sheet.columns = [
                { width: 8 },   // A: Line To do
                { width: 12 },  // B: Emp Code
                { width: 20 },  // C: Employee Name
                { width: 15 },  // D: Branch
                { width: 20 },  // E: Reporting To
                { width: 15 },  // F: Perspective
                { width: 35 },  // G: Objective Description
                { width: 12 },  // H: % Assigned
                { width: 20 },  // I: Measurement
                { width: 15 },  // J: Qtr Target
                { width: 25 },  // K: Performance
                { width: 12 },  // L: Self Rating
                { width: 15 },  // M: Appraiser Rating
                { width: 12 },  // N: Score
                { width: 30 },  // O: Comments
                { width: 15 },  // P: Department
            ];

            const formatValue = (val) =>
                val === 0 || val === null || val === undefined || val === "" || val === "N/A"
                    ? "-"
                    : val;

            if (includeEmployeeTotals) {
                // Group data by employee
                const employeesMap = {};
                data.forEach((row) => {
                    const empCode = row.empCode;
                    if (!employeesMap[empCode]) {
                        employeesMap[empCode] = [];
                    }
                    employeesMap[empCode].push(row);
                });

                // Add headers (removed designation)
                const headers = [
                    "Line To do", "Emp Code", "Employee Name", "Branch", "Reporting To", "Perspective",
                    "Objective Description", "% Assigned", "Measurement", "Qtr Target", "Performance",
                    "Self Rating", "Appraiser Rating", "Score", "Comments", "Department"
                ];

                const headerRow = sheet.getRow(currentRow);
                headerRow.height = 24;
                headers.forEach((header, i) => {
                    const cell = headerRow.getCell(i + 1);
                    cell.value = header;
                    cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.blueHeader },
                    };
                    cell.border = allBorders;
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                });
                currentRow++;

                // Process each employee
                Object.keys(employeesMap).forEach((empCode, empIndex) => {
                    const employeeData = employeesMap[empCode];
                    const firstRow = employeeData[0];

                    // Filter valid goals (with objective description)
                    const validGoals = employeeData.filter(goal => goal.objectivedesc);

                    // Add employee header (updated to 16 columns)
                    sheet.mergeCells(`A${currentRow}:P${currentRow}`);
                    const empHeaderCell = sheet.getCell(`A${currentRow}`);
                    empHeaderCell.value = `EMPLOYEE: ${firstRow.empName} (${firstRow.empCode}) | Branch: ${firstRow.branch} | Reporting To: ${firstRow.reportingname || firstRow.reportingto || 'N/A'} | Department: ${firstRow.department || 'N/A'} | Month: ${selectedMonth}/${selectedYear}`;
                    empHeaderCell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
                    empHeaderCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.employeeHeader },
                    };
                    empHeaderCell.border = allBorders;
                    empHeaderCell.alignment = { vertical: "middle", horizontal: "left" };
                    currentRow++;

                    let totalPercentage = 0;
                    let totalSelfRating = 0;
                    let totalAppraiserRating = 0;
                    let totalScore = 0;
                    let validSelfRatings = 0;
                    let validAppraiserRatings = 0;
                    let goalNumber = 1;

                    // Add employee goals (only valid ones)
                    validGoals.forEach((row, goalIndex) => {
                        const perAssignedDecimal = parsePercentage(row.perassigned);
                        const appraiserRating = Number(row.appraiserrating) || 0;
                        const selfRating = Number(row.selfrating) || 0;
                        const calculatedScore = (appraiserRating * perAssignedDecimal);

                        // Calculate totals
                        const percentageValue = parseFloat(row.perassigned) || 0;
                        totalPercentage += percentageValue;

                        if (selfRating > 0) {
                            totalSelfRating += selfRating;
                            validSelfRatings++;
                        }

                        if (appraiserRating > 0) {
                            totalAppraiserRating += appraiserRating;
                            validAppraiserRatings++;
                        }

                        totalScore += calculatedScore;

                        const rowData = [
                            goalNumber, // Line To do
                            formatValue(row.empCode),
                            formatValue(row.empName),
                            formatValue(row.branch),
                            formatValue(row.reportingname || row.reportingto || "N/A"),
                            formatValue(row.perspective),
                            formatValue(row.objectivedesc),
                            formatValue(row.perassigned),
                            formatValue(row.measurement),
                            formatValue(row.qtrtarget),
                            formatValue(row.performance),
                            formatValue(selfRating > 0 ? selfRating : "-"),
                            formatValue(appraiserRating > 0 ? appraiserRating : "-"),
                            formatValue(calculatedScore > 0 ? calculatedScore.toFixed(2) : "-"),
                            formatValue(row.comments),
                            formatValue(row.department),
                            // Designation column removed
                        ];

                        const dataRow = sheet.getRow(currentRow);
                        dataRow.height = 22;

                        rowData.forEach((value, colIndex) => {
                            const cell = dataRow.getCell(colIndex + 1);
                            cell.value = value;
                            cell.border = allBorders;

                            // Apply alternating row colors
                            const isEven = goalIndex % 2 === 0;
                            cell.fill = {
                                type: "pattern",
                                pattern: "solid",
                                fgColor: { argb: isEven ? colors.evenRow : colors.oddRow },
                            };

                            // Center align numeric columns
                            const centeredColumns = [1, 8, 12, 13, 14]; // Line To do, % Assigned, Self Rating, Appraiser Rating, Score
                            if (centeredColumns.includes(colIndex + 1)) {
                                cell.alignment = { horizontal: "center", vertical: "middle" };
                            } else {
                                cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
                            }

                            if (cell.value === "-") {
                                cell.alignment = { horizontal: "center", vertical: "middle" };
                            }
                        });

                        currentRow++;
                        goalNumber++;
                    });

                    // Calculate averages
                    const avgSelfRating = validSelfRatings > 0 ? (totalSelfRating / validSelfRatings).toFixed(1) : "-";
                    const avgAppraiserRating = validAppraiserRatings > 0 ? (totalAppraiserRating / validAppraiserRatings).toFixed(1) : "-";
                    const totalScoreValue = totalScore.toFixed(2);

                    // Add total row (updated to 16 columns)
                    const totalRow = sheet.getRow(currentRow);
                    totalRow.height = 22;

                    // TOTAL: label
                    const totalLabelCell = totalRow.getCell(1);
                    totalLabelCell.value = "TOTAL:";
                    totalLabelCell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
                    totalLabelCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.totalRow },
                    };
                    totalLabelCell.border = allBorders;
                    totalLabelCell.alignment = { horizontal: "right", vertical: "middle" };

                    // Total Goals (column 2)
                    const totalGoalsCell = totalRow.getCell(2);
                    totalGoalsCell.value = validGoals.length;
                    totalGoalsCell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
                    totalGoalsCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.totalRow },
                    };
                    totalGoalsCell.border = allBorders;
                    totalGoalsCell.alignment = { horizontal: "center", vertical: "middle" };

                    // % Assigned total (column 8)
                    const totalPercentCell = totalRow.getCell(8);
                    totalPercentCell.value = `${totalPercentage.toFixed(1)}%`;
                    totalPercentCell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
                    totalPercentCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.totalRow },
                    };
                    totalPercentCell.border = allBorders;
                    totalPercentCell.alignment = { horizontal: "center", vertical: "middle" };

                    // Average Self Rating (column 12)
                    const avgSelfCell = totalRow.getCell(12);
                    avgSelfCell.value = avgSelfRating;
                    avgSelfCell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
                    avgSelfCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.totalRow },
                    };
                    avgSelfCell.border = allBorders;
                    avgSelfCell.alignment = { horizontal: "center", vertical: "middle" };

                    // Average Appraiser Rating (column 13)
                    const avgApprCell = totalRow.getCell(13);
                    avgApprCell.value = avgAppraiserRating;
                    avgApprCell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
                    avgApprCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.totalRow },
                    };
                    avgApprCell.border = allBorders;
                    avgApprCell.alignment = { horizontal: "center", vertical: "middle" };

                    // Total Score (column 14)
                    const totalScoreCell = totalRow.getCell(14);
                    totalScoreCell.value = totalScoreValue;
                    totalScoreCell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
                    totalScoreCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.totalRow },
                    };
                    totalScoreCell.border = allBorders;
                    totalScoreCell.alignment = { horizontal: "center", vertical: "middle" };

                    // Fill empty cells in total row (updated to 16 columns)
                    for (let i = 2; i <= 16; i++) {
                        if (![1, 2, 8, 12, 13, 14].includes(i)) {
                            const cell = totalRow.getCell(i);
                            cell.value = "";
                            cell.fill = {
                                type: "pattern",
                                pattern: "solid",
                                fgColor: { argb: colors.totalRow },
                            };
                            cell.border = allBorders;
                        }
                    }

                    currentRow++;

                    // Add empty row between employees
                    currentRow++;
                });

            } else {
                // Original non-grouped format - CORRECTED VERSION (removed designation)
                const headers = [
                    "No", "Emp Code", "Employee Name", "Branch", "Reporting To",
                    "Perspective", "Objective Description", "% Assigned", "Measurement",
                    "Qtr Target", "Performance", "Self Rating", "Appraiser Rating",
                    "Score", "Comments", "Department" // Added Department, removed Designation
                ];

                const headerRow = sheet.getRow(currentRow);
                headerRow.height = 25;
                headers.forEach((header, i) => {
                    const cell = headerRow.getCell(i + 1);
                    cell.value = header;
                    cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: colors.blueHeader },
                    };
                    cell.border = allBorders;
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                });
                currentRow++;

                // Filter only valid goals for non-grouped view
                const validData = data.filter(row => row.objectivedesc);

                // Add all data without grouping
                validData.forEach((row, index) => {
                    const perAssignedDecimal = parsePercentage(row.perassigned);
                    const appraiserRating = Number(row.appraiserrating) || 0;
                    const calculatedScore = (appraiserRating * perAssignedDecimal).toFixed(2);

                    const rowData = [
                        index + 1, // No
                        formatValue(row.empCode),
                        formatValue(row.empName),
                        formatValue(row.branch),
                        formatValue(row.reportingname || row.reportingto || "N/A"),
                        formatValue(row.perspective),
                        formatValue(row.objectivedesc),
                        formatValue(row.perassigned),
                        formatValue(row.measurement),
                        formatValue(row.qtrtarget),
                        formatValue(row.performance),
                        formatValue(row.selfrating),
                        formatValue(row.appraiserrating),
                        formatValue(calculatedScore),
                        formatValue(row.comments),
                        formatValue(row.department), // Added Department, removed Designation
                    ];

                    const dataRow = sheet.getRow(currentRow);
                    dataRow.height = 22;

                    rowData.forEach((value, colIndex) => {
                        const cell = dataRow.getCell(colIndex + 1);
                        cell.value = value;
                        cell.border = allBorders;

                        const isEven = index % 2 === 0;
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: isEven ? colors.evenRow : colors.oddRow },
                        };

                        // Center align numeric columns
                        const centeredColumns = [1, 8, 12, 13, 14];
                        if (centeredColumns.includes(colIndex + 1)) {
                            cell.alignment = { horizontal: "center", vertical: "middle" };
                        } else {
                            cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
                        }

                        if (cell.value === "-") {
                            cell.alignment = { horizontal: "center", vertical: "middle" };
                        }
                    });

                    currentRow++;
                });
            }

            // Freeze panes (header row + title rows)
            sheet.views = [{ state: "frozen", ySplit: 7 }];

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const timestamp = new Date().toISOString().split("T")[0];
            const branchName =
                selectedBranch === "ALL"
                    ? "AllBranches"
                    : selectedBranch.replace(/\s+/g, "_");
            const fileName = `Appraisal_Report_${selectedMonth}_${selectedYear}_${branchName}_${timestamp}.xlsx`;

            saveAs(blob, fileName);
            showToast(
                "success",
                `${includeEmployeeTotals ? 'Grouped ' : ''}Detailed appraisal report generated with ${data.length} records`
            );
        } catch (error) {
            console.error("Error creating Excel file:", error);
            showToast("error", "Failed to create Excel file. Please try again.");
        }
    };

    const generateSummaryExcel = async (data) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Appraisal Summary");

            // 🎨 Professional color palette
            const colors = {
                primaryHeader: "2C3E50",
                secondaryHeader: "34495E",
                accentHeader: "3498DB",
                infoHeader: "ECF0F1",
                purpleHeader: "593C8F",
                blueHeader: "3F51B5",
                evenRow: "FFFFFF",
                oddRow: "F3F3F3",
                highlightGreen: "D5EDD8",
                highlightYellow: "FFF2CC",
                border: "BDC3C7",
            };

            const allBorders = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };

            // 🏢 Add logo (or fallback to text)
            const logoAdded = await addLogoToExcel(workbook, sheet, companyDetails);

            // Enhanced fallback options
            if (!logoAdded) {
                sheet.mergeCells("A1:B4");
                const logoCell = sheet.getCell("A1");

                if (companyDetails?.companyName) {
                    logoCell.value = companyDetails.companyName;
                } else {
                    logoCell.value = "COMPANY LOGO";
                }

                logoCell.font = {
                    bold: true,
                    size: 12,
                    color: { argb: "FF2C3E50" },
                    name: "Arial",
                };
                logoCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
                logoCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFECF0F1" },
                };
                logoCell.border = allBorders;
            }

            // 📋 Title
            sheet.mergeCells("C1:H2");
            const titleCell = sheet.getCell("C1");
            titleCell.value = "EMPLOYEE APPRAISAL SUMMARY REPORT";
            titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
            titleCell.alignment = { vertical: "middle", horizontal: "center" };
            titleCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: colors.primaryHeader },
            };
            titleCell.border = allBorders;

            // ℹ️ Info line
            sheet.mergeCells("C3:H3");
            const infoCell1 = sheet.getCell("C3");
            infoCell1.value = `PERIOD: ${selectedMonth} ${selectedYear} | BRANCH: ${selectedBranch === "ALL"
                ? "ALL BRANCHES"
                : selectedBranch.toUpperCase()
                } | REPORT TYPE: SUMMARY`;
            infoCell1.font = { size: 11, bold: true, color: { argb: "FF000000" } };
            infoCell1.alignment = { vertical: "middle", horizontal: "center" };
            infoCell1.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: colors.infoHeader },
            };
            infoCell1.border = allBorders;

            // 📊 Header Row
            const headers = [
                "EMP CODE",
                "EMPLOYEE NAME",
                "BRANCH",
                "DEPARTMENT",
                "REPORTING MANAGER",
                "TOTAL GOALS",
                "AVG SELF RATING",
                "AVG APPRAISER RATING",
                "FINAL SCORE"
            ];

            const headerRow = sheet.addRow(headers);
            headerRow.height = 25;
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: colors.blueHeader },
                };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = allBorders;
            });

            // 🧮 Prepare summary data - CORRECTED VERSION
            const summaryMap = {};

            data.forEach((row) => {
                const empCode = row.empCode || "Unknown";
                if (!summaryMap[empCode]) {
                    summaryMap[empCode] = {
                        empCode,
                        empName: row.empName,
                        branch: row.branch,
                        department: row.department,
                        reportingname: row.reportingname || row.reportingto,
                        goals: 0,
                        totalSelf: 0,
                        totalAppr: 0,
                        totalScore: 0,
                        validSelfRatings: 0,
                        validApprRatings: 0,
                    };
                }

                const emp = summaryMap[empCode];

                // Count goals with objective description (valid goals)
                if (row.objectivedesc) {
                    emp.goals += 1;
                }

                const selfRating = parseFloat(row.selfrating) || 0;
                const apprRating = parseFloat(row.appraiserrating) || 0;
                const perAssignedDecimal = (parseFloat(row.perassigned) || 0) / 100;
                const score = apprRating * perAssignedDecimal;

                if (selfRating > 0) {
                    emp.totalSelf += selfRating;
                    emp.validSelfRatings++;
                }

                if (apprRating > 0) {
                    emp.totalAppr += apprRating;
                    emp.validApprRatings++;
                }

                emp.totalScore += score;
            });

            const summaryData = Object.values(summaryMap).map((emp) => ({
                ...emp,
                avgSelf: emp.validSelfRatings > 0 ? (emp.totalSelf / emp.validSelfRatings).toFixed(1) : "-",
                avgAppr: emp.validApprRatings > 0 ? (emp.totalAppr / emp.validApprRatings).toFixed(1) : "-",
                totalScore: emp.totalScore.toFixed(2),
            }));

            // 📄 Add rows
            summaryData.forEach((emp, index) => {
                const row = sheet.addRow([
                    emp.empCode,
                    emp.empName,
                    emp.branch,
                    emp.department,
                    emp.reportingname,
                    emp.goals,
                    emp.avgSelf,
                    emp.avgAppr,
                    emp.totalScore,
                ]);

                row.height = 22;
                const isEven = index % 2 === 0;
                row.eachCell((cell, col) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: isEven ? colors.evenRow : colors.oddRow },
                    };
                    cell.border = allBorders;
                    cell.alignment = {
                        vertical: "middle",
                        horizontal: col >= 6 ? "center" : "left",
                        wrapText: true,
                    };
                });
            });

            // 📌 Freeze header
            sheet.views = [{ state: "frozen", ySplit: 7 }];

            // Adjust column widths
            sheet.columns = [
                { width: 12 },
                { width: 22 },
                { width: 15 },
                { width: 18 },
                { width: 22 },
                { width: 12 },
                { width: 15 },
                { width: 18 },
                { width: 15 },
            ];

            // 💾 Save
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const timestamp = new Date().toISOString().split("T")[0];
            const branchName =
                selectedBranch === "ALL"
                    ? "AllBranches"
                    : selectedBranch.replace(/\s+/g, "_");
            const fileName = `Appraisal_Summary_${selectedMonth}_${selectedYear}_${branchName}_${timestamp}.xlsx`;

            saveAs(blob, fileName);
            showToast("success", `Appraisal summary report generated with ${summaryData.length} employees`);
        } catch (error) {
            console.error("Error creating summary Excel:", error);
            showToast("error", "Failed to generate summary Excel report.");
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
                <Typography sx={{ ml: 2 }}>Loading performance data for {selectedMonth} {selectedYear}...</Typography>
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
                            <Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                label="Month"
                            >
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
                            <Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                label="Year"
                            >
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
                            <Select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                label="Branch"
                            >
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
                            <Select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                label="Report Type"
                            >
                                {reportTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={includeEmployeeTotals}
                                    onChange={(e) => setIncludeEmployeeTotals(e.target.checked)}
                                />
                            }
                            label="Include Employee Totals"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDownload}
                            disabled={isDownloading || flattenedData.length === 0}
                            startIcon={isDownloading && <CircularProgress size={20} />}
                            sx={{ mb: 1 }}
                        >
                            {isDownloading ? "Downloading..." : "Download Appraisal Report"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <ToastComponent />
        </Box>
    );
}