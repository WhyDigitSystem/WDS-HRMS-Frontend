import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import UploadIcon from '@mui/icons-material/Upload';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const PerformanceGoals = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [department] = useState(localStorage.getItem('department'));
    const [designation] = useState(localStorage.getItem('designation'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));
    const [userType] = useState(localStorage.getItem('userType'));
    const [selectedMonth, setSelectedMonth] = useState('');
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [reportingPersonDetails, setReportingPersonDetails] = useState([]);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [employeeDetailsData, setEmployeeDetailsData] = useState({
        empCode: "",
        empName: "",
    });

    const [formData, setFormData] = useState({
        month: '',
        year: '',
        orgId: orgId
    });

    const [fieldErrors, setFieldErrors] = useState({
        month: '',
        year: '',
        orgId: orgId
    });

    // const listViewColumns = [
    //     { accessorKey: 'empName', header: 'Employee', size: 140 },
    //     { accessorKey: 'empCode', header: 'Code', size: 140 },
    //     { accessorKey: 'performanceGoalsDtlVO.perspective', header: 'Perspective', size: 140 },
    //     { accessorKey: 'performanceGoalsDtlVO.selfrating', header: 'Rating', size: 140 },
    //     {
    //         accessorKey: 'pmonth',
    //         header: 'Month',
    //         size: 140,
    //         Cell: ({ cell }) => {
    //             const monthNumber = cell.getValue();
    //             const monthObj = months.find(m => m.value === monthNumber);
    //             return monthObj ? monthObj.name : monthNumber;
    //         }
    //     },
    //     { accessorKey: 'appraisalYear', header: 'Year', size: 140 },
    // ];

    const listViewColumns = [
  { accessorKey: 'empName', header: 'Employee', size: 140 },
  { accessorKey: 'empCode', header: 'Code', size: 100 },

  {
    header: 'Perspective',
    accessorFn: row =>
      row.performanceGoalsDtlVO?.[0]?.perspective || '-',
    size: 160
  },

  {
    header: 'Rating',
    accessorFn: row =>
      row.performanceGoalsDtlVO?.[0]?.selfrating || '-',
    size: 100
  },
   {
           accessorKey: 'pmonth',
            header: 'Month',
            size: 140,
           Cell: ({ cell }) => {
             const monthNumber = cell.getValue();
              const monthObj = months.find(m => m.value === monthNumber);
                return monthObj ? monthObj.name : monthNumber;
          }
         },
       { accessorKey: 'appraisalYear', header: 'Year', size: 140 },
];


    const [goalsDetailsData, setGoalsDetailsData] = useState([{
        id: null,
        perspective: '',
        objectiveDescription: '',
        assigned: '',
        measurement: '',
        qtrTarget: '',
        performance: '',
        comments: '',
        performanceSelf: '',
        selfRating: '',
    }]);

    const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([{
        perspective: '',
        objectiveDescription: '',
        assigned: '',
        measurement: '',
        qtrTarget: '',
        performance: '',
        comments: '',
        performanceSelf: '',
        selfRating: '',
    }]);

    useEffect(() => {
        getAllUserPerformanceGoals();
        getCompanyDetails();

        const today = new Date();
        const currentMonth = months[today.getMonth()];
        const currentYear = today.getFullYear();

        setSelectedMonth(currentMonth.name);
        setFormData({ month: currentMonth.value, year: currentYear });
    }, []);

    useEffect(() => {
        if (loginUserName) {
            getReportingPerson();
        }
    }, [loginUserName]);

    const months = [
        { name: 'January', value: '01' },
        { name: 'February', value: '02' },
        { name: 'March', value: '03' },
        { name: 'April', value: '04' },
        { name: 'May', value: '05' },
        { name: 'June', value: '06' },
        { name: 'July', value: '07' },
        { name: 'August', value: '08' },
        { name: 'September', value: '09' },
        { name: 'October', value: '10' },
        { name: 'November', value: '11' },
        { name: 'December', value: '12' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, index) => currentYear - index);

    // Add company details function
    const getCompanyDetails = async () => {
        try {
            const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
            // Check if companyVO is an array and get the first item
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

    // const handleSelectChange = (index, field, value) => {
    //     const updatedData = [...goalsDetailsData];
    //     updatedData[index][field] = value;
    //     setGoalsDetailsData(updatedData);
    //     setGoalsDetailsErrors((prev)=>({...prev,perspective:''}))
    // };

   const handleSelectChange = (index, field, value) => {
  const updatedData = [...goalsDetailsData];
  updatedData[index][field] = value;
  setGoalsDetailsData(updatedData);

  setGoalsDetailsErrors(prev => {
    const updatedErrors = [...prev];
    if (updatedErrors[index]) {
      updatedErrors[index] = {
        ...updatedErrors[index],
        [field]: ''   
      };
    }
    return updatedErrors;
  });
   };  


    const handleMonthChange = (event) => {
        const selectedMonthName = event.target.value;
        setSelectedMonth(selectedMonthName);
        const selectedMonthObj = months.find((m) => m.name === selectedMonthName);
        setFormData((prev) => ({ ...prev, month: selectedMonthObj?.value || '' }));
        setFieldErrors((prev) => ({ ...prev, month: '' }));
    };

    const handleYearChange = (event) => {
        const selectedYear = event.target.value;
        setFormData((prev) => ({ ...prev, year: selectedYear }));
        setFieldErrors((prev) => ({ ...prev, year: '' }));
    };

    useEffect(() => {
        const storedEmployeeCode = localStorage.getItem('employeeCode');
        if (storedEmployeeCode) {
            fetchEmployeeDetails(storedEmployeeCode);
        }
    }, []);

    const getReportingPerson = async () => {
        try {
            const response = await apiCalls('get', `/performancegoals/getReportingUserName?username=${loginUserName}`);
            const data = response?.paramObjectsMap?.getReportingUserName?.[0] || null;
            setReportingPersonDetails(data);
        } catch (error) {
            console.error('Error fetching reporting person details:', error);
            showToast('Error fetching reporting person details', 'error');
            setReportingPersonDetails(null);
        }
    };

    const fetchEmployeeDetails = async (employeeCode) => {
        if (!employeeCode || !orgId) return;

        try {
            const response = await apiCalls(
                'get',
                `/goalsController/getEmployeeDetails?employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response.status) {
                const employeeData =
                    response.paramObjectsMap?.employeeVO?.[0] ||
                    response.paramObjectsMap?.employeeDetails ||
                    response.data;

                if (employeeData) {
                    setEmployeeDetailsData({
                        empCode: employeeData.empCode || "",
                        empName: employeeData.empName || employeeData.name || "",
                        department: employeeData.department || "",
                        designation: employeeData.empDesignation || employeeData.designation || "",
                        reportingHeadCode: employeeData.reportingPersonCode || "",
                        reportingHead: employeeData.reportingPerson || "",
                        reportingHeadDesignation: employeeData.reportingPersonRole || "",
                        branch: employeeData.branch || "",
                    });
                } else {
                    showToast('error', 'No employee data found');
                }
            } else {
                showToast('error', response.message || 'Failed to fetch employee details');
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            showToast('error', 'Failed to fetch employee details');
        }
    };

    const getAllAdminPerformanceGoals = async () => {
        try {
            const response = await apiCalls('get', `/performancegoals/getPerformanceGoalsByOrgId?orgId=${orgId}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.performanceVO || []);
            } else {
                showToast('error', response.message || 'Failed to fetch appraisees');
            }
        } catch (error) {
            console.error('Error fetching appraisees:', error);
            showToast('error', 'Failed to fetch appraisees');
        }
    };

    const getAllUserPerformanceGoals = async () => {
        try {
            const response = await apiCalls('get', `/performancegoals/getPerformanceGoalsByOrgIdAndEmployeeCode?orgId=${orgId}&employeeCode=${employeeCode}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.performanceGoalsVO.reverse() || []);
            } else {
                showToast('error', response.message || 'Failed to fetch appraisees');
            }
        } catch (error) {
            console.error('Error fetching appraisees:', error);
            showToast('error', 'Failed to fetch appraisees');
        }
    };

    const getPerformanceGoalsById = async (row) => {
        setEditId(row.original.id);

        try {
            const response = await apiCalls('get', `/performancegoals/getPerformanceGoalsById?id=${row.original.id}`);

            if (response.status) {
                setListView(false);

                const appraisee = response?.paramObjectsMap?.performanceGoalsVO || {};

                setEmployeeDetailsData({
                    empCode: appraisee.empCode || '',
                    empName: appraisee.empName || '',
                    reportingHeadCode: appraisee.reportingHeadCode || '',
                    reportingHead: appraisee.reportingHead || '',
                    branch: appraisee.branch || '',
                    department: appraisee.department || '',
                    designation: appraisee.designation || ''
                });

                setFormData({
                    finYear: appraisee.finYear || '',
                    month: appraisee.pmonth || '',
                    year: appraisee.appraisalYear || '',
                    active: appraisee.active === 'Active',
                });

                // ✅ Set the selected month value to display in dropdown
                setSelectedMonth(appraisee.pmonth || '');

                const details = appraisee.performanceGoalsDtlVO || [];
                setGoalsDetailsData(
                    details.map(detail => ({
                        id: detail.id,
                        perspective: detail.perspective || '',
                        objectiveDescription: detail.objectivedesc || '',
                        assigned: detail.perassigned || '',
                        measurement: detail.measurement || '',
                        qtrTarget: detail.qtrtarget || '',
                        performance: detail.performance || '',
                        comments: detail.comments || '',
                        performanceSelf: detail.performanceself || '',
                        selfRating: detail.selfrating || ''
                    }))
                );

                setGoalsDetailsErrors(
                    details.map(() => ({
                        perspective: '',
                        objectiveDescription: '',
                        assigned: '',
                        measurement: '',
                        qtrTarget: '',
                        performance: '',
                        comments: '',
                        performanceSelf: '',
                        selfRating: ''
                    }))
                );

            } else {
                showToast('error', response.message || 'Failed to fetch appraisee details');
            }
        } catch (error) {
            console.error('Error fetching appraisee details:', error);
            showToast('error', 'Failed to fetch appraisee details');
        }
    };

    const handleSave = async () => {
        // const nonEmptyDetailsData = goalsDetailsData.filter(row =>
        //     row.perspective ||
        //     row.objectiveDescription ||
        //     row.assigned ||
        //     row.measurement ||
        //     row.qtrTarget ||
        //     row.performance ||
        //     row.comments ||
        //     row.performanceSelf ||
        //     row.selfRating
        // );

        const errors = {};
        if (!employeeDetailsData.empCode) errors.employeeCode = 'Employee Code is required';
        if (!employeeDetailsData.empName) errors.employeeName = 'Employee Name is required';
        if (!formData.month) errors.month = 'Month is required';
        if (!formData.year) errors.year = 'Year is required';

        const detailsErrors = [];
        let hasDetailErrors = false;

        goalsDetailsData.forEach((row, index) => {
            const rowErrors = {};

            if (!row.perspective) {
                rowErrors.perspective = 'Perspective is required';
                hasDetailErrors = true;
            }
            if (!row.objectiveDescription) {
                rowErrors.objectiveDescription = 'Objective Description is required';
                hasDetailErrors = true;
            }
            if (!row.assigned) {
                rowErrors.assigned = 'Assigned is required';
                hasDetailErrors = true;
            }
            if (!row.measurement) {
                rowErrors.measurement = 'Measurement is required';
                hasDetailErrors = true;
            }
            if (!row.qtrTarget) {
                rowErrors.qtrTarget = 'Quarter Target is required';
                hasDetailErrors = true;
            }

            detailsErrors[index] = rowErrors;
        });

        if (Object.keys(errors).length > 0 || hasDetailErrors) {
            setFieldErrors(errors);
            setGoalsDetailsErrors(detailsErrors);
            showToast('error', 'Please fill all required fields');
            return;
        }
        

        setIsLoading(true);

        const performanceGoalsDetailsDTO = goalsDetailsData.map(row => ({
            perspective: row.perspective,
            objectivedesc: row.objectiveDescription,
            perassigned: row.assigned,
            measurement: row.measurement,
            qtrtarget: row.qtrTarget,
            performance: row.performance || '',
            comments: row.comments || '',
            performanceself: row.performanceSelf || '',
            selfrating: row.selfRating ? parseInt(row.selfRating) : 0,
        }));

        const payload = {
            ...(editId && { id: parseInt(editId) }),
            empCode: employeeDetailsData.empCode,
            empName: employeeDetailsData.empName,
            reportingto: reportingPersonDetails?.reportingto || '',
            reportingname: reportingPersonDetails?.reportingto || '',
            pmonth: selectedMonth,
            apprisalYear: formData.year.toString(),
            orgId: orgId,
            createdBy: loginUserName,
            performanceGoalsDetailsDTO: performanceGoalsDetailsDTO,
            approve1: '',
            approve1name: '',
            approve1on: '',
            department,
            designation,
            branch,
            branchCode,
        };

        try {
            const response = await apiCalls('put', '/performancegoals/createUpdatePerformanceGoals', payload);
            if (response.status) {
                showToast('success', editId ? 'Performance goal updated successfully' : 'Performance goal created successfully');
                handleClear();
                getAllUserPerformanceGoals();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving performance goal:', error);
            showToast('error', 'Failed to save performance goal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        const currentYear = formData.year;

        setFormData({
            month: '',
            year: currentYear,
            orgId: orgId
        });

        setFieldErrors({
            month: '',
            year: '',
        });

        setGoalsDetailsData([
            {
                id: Date.now(),
                perspective: '',
                objectiveDescription: '',
                assigned: '',
                measurement: '',
                qtrTarget: '',
                performance: '',
                comments: '',
                performanceSelf: '',
                selfRating: ''
            }
        ]);

        setGoalsDetailsErrors([{
            perspective: '',
            objectiveDescription: '',
            assigned: '',
            measurement: '',
            qtrTarget: '',
            performance: '',
            comments: '',
            performanceSelf: '',
            selfRating: '',
        }]);

        setEditId('');

        const storedEmployeeCode = localStorage.getItem('employeeCode');
        if (storedEmployeeCode) {
            fetchEmployeeDetails(storedEmployeeCode);
        } else {
            setEmployeeDetailsData({
                empCode: "",
                empName: "",
            });
        }

        const today = new Date();
        const currentMonth = months[today.getMonth()];
        setSelectedMonth(currentMonth.name);
        setFormData(prev => ({ ...prev, month: currentMonth.value }));
    };

    const handleAddRow = () => {
        if (isLastRowEmpty(goalsDetailsData)) {
            displayRowError(goalsDetailsData);
            return;
        }
        const newRow = {
            id: Date.now(),
            perspective: '',
            objectiveDescription: '',
            assigned: '',
            measurement: '',
            qtrTarget: '',
            performance: '',
            comments: '',
            performanceSelf: '',
            selfRating: '',
        };
        setGoalsDetailsData([...goalsDetailsData, newRow]);
        setGoalsDetailsErrors([...goalsDetailsErrors, {
            perspective: '',
            objectiveDescription: '',
            assigned: '',
            measurement: '',
            qtrTarget: '',
            performance: '',
            comments: '',
            performanceSelf: '',
            selfRating: '',
        }]);
    };

    const isLastRowEmpty = (table) => {
        const lastRow = table[table.length - 1];
        if (!lastRow) return false;

        return !lastRow.perspective || !lastRow.objectiveDescription || !lastRow.assigned || !lastRow.measurement || !lastRow.qtrTarget;
    };

    const displayRowError = (table) => {
        setGoalsDetailsErrors((prevErrors) => {
            const newErrors = [...prevErrors];
            const lastIndex = table.length - 1;

            newErrors[lastIndex] = {
                ...newErrors[lastIndex],
                perspective: !table[lastIndex].perspective ? 'Perspective is required' : '',
                objectiveDescription: !table[lastIndex].objectiveDescription ? 'Objective Description is required' : '',
                assigned: !table[lastIndex].assigned ? 'Assigned is required' : '',
                measurement: !table[lastIndex].measurement ? 'Measurement is required' : '',
                qtrTarget: !table[lastIndex].qtrTarget ? 'Quarter Target is required' : '',
                performance: !table[lastIndex].performance ? 'Performance is required' : '',
                comments: !table[lastIndex].comments ? 'Comments is required' : '',
                performanceSelf: !table[lastIndex].performanceSelf ? 'Performance Self is required' : '',
                selfRating: !table[lastIndex].selfRating ? 'Self Rating is required' : '',
            };
            return newErrors;
        });
    };

    const handleDeleteRow = (id) => {
        const rowIndex = goalsDetailsData.findIndex((row) => row.id === id);
        if (rowIndex !== -1) {
            const updatedData = goalsDetailsData.filter((row) => row.id !== id);
            const updatedErrors = goalsDetailsErrors.filter((_, index) => index !== rowIndex);
            setGoalsDetailsData(updatedData);
            setGoalsDetailsErrors(updatedErrors);
        }
    };

    const handleView = () => {
        setListView(!listView);
    };

    const handleTabChange = (_, newValue) => setValue(newValue);

    const handleDetailChange = (id, field, value) => {
        const index = goalsDetailsData.findIndex((d) => d.id === id);
        if (index === -1) return;

        const newData = [...goalsDetailsData];
        newData[index] = { ...newData[index], [field]: value };
        setGoalsDetailsData(newData);

        if (value) {
            const newErrors = [...goalsDetailsErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setGoalsDetailsErrors(newErrors);
        }
    };

    const downloadPDF = () => {
        if (!listViewData || listViewData.length === 0) {
            return;
        }

        try {
            const doc = new jsPDF('landscape');

            doc.setProperties({
                title: 'Performance Goals Report',
                subject: 'Performance Goals Data',
                author: 'HR System',
                keywords: 'performance, goals, appraisal',
                creator: 'HR Management System'
            });

            // Consistent Header Design
            // doc.setFillColor(30, 60, 114);
            doc.setFillColor(220, 235, 255);
            doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');

            // Company Logo Section
            const logoX = 15;
            const logoY = 2.5;
            const logoWidth = 35;
            const logoHeight = 15;

            if (companyDetails && companyDetails.companyLogo) {
                try {
                    doc.addImage(companyDetails.companyLogo, 'PNG', logoX, logoY, logoWidth, logoHeight);
                } catch (logoError) {
                    console.error('Error adding company logo:', logoError);
                    // Fallback to text logo
                    doc.setFillColor(255, 255, 255);
                    doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 3, 3, 'F');
                    doc.setFontSize(8);
                    doc.setTextColor(30, 60, 114);
                    doc.setFont('helvetica', 'bold');
                    const companyText = companyDetails.companyName ?
                        companyDetails.companyName.substring(0, 10) + (companyDetails.companyName.length > 10 ? '...' : '') :
                        'COMPANY';
                    doc.text(companyText, logoX + logoWidth / 2, logoY + logoHeight / 2 + 2, { align: 'center' });
                }
            } else {
                // Default text logo
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 3, 3, 'F');
                doc.setFontSize(8);
                doc.setTextColor(30, 60, 114);
                doc.setFont('helvetica', 'bold');
                doc.text('COMPANY', logoX + logoWidth / 2, logoY + 7, { align: 'center' });
                doc.text('LOGO', logoX + logoWidth / 2, logoY + 11, { align: 'center' });
            }

            // Main Title
            doc.setFontSize(16);
            // doc.setTextColor(255, 255, 255);
            doc.setTextColor(40, 70, 120);
            doc.setFont('helvetica', 'bold');
            doc.text('PERFORMANCE GOALS', doc.internal.pageSize.width / 2, 10, { align: 'center' });

            // Subtitle
            doc.setFontSize(9);
            // doc.setTextColor(255, 255, 255);
            doc.setTextColor(30, 50, 90);
            doc.setFont('helvetica', 'normal');
            const subtitle = companyDetails && companyDetails.companyName
                // ? `${companyDetails.companyName} - Performance Assessment`
                ? `${companyDetails.companyName}`
                : 'Comprehensive Performance Assessment Report';
            // Truncate subtitle if too long
            const maxSubtitleLength = 50;
            const displaySubtitle = subtitle.length > maxSubtitleLength
                ? subtitle.substring(0, maxSubtitleLength - 3) + '...'
                : subtitle;
            doc.text(displaySubtitle, doc.internal.pageSize.width / 2, 15, { align: 'center' });

            let yPosition = 28;
            let currentPage = 1;

            // Improved text shortening function
            const shortenText = (text, maxLength) => {
                if (!text || text === '-') return '-';
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength - 3) + '...';
            };

            // Process each performance goal record
            listViewData.forEach((record, index) => {
                // Check if we need a new page
                if (yPosition > 170) {
                    doc.addPage('landscape');
                    currentPage++;
                    yPosition = 25;

                    // Consistent header for new pages
                    doc.setFillColor(30, 60, 114);
                    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
                    doc.setFontSize(11);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Performance Goals Report - Continuation`, doc.internal.pageSize.width / 2, 12, { align: 'center' });
                    doc.setFontSize(8);
                    doc.text(`Page ${currentPage}`, doc.internal.pageSize.width / 2, 17, { align: 'center' });
                    yPosition = 28;
                }

                // Enhanced Employee Information Section with better alignment
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(12, yPosition - 4, doc.internal.pageSize.width - 24, 22, 3, 3, 'F');

                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.3);
                doc.roundedRect(12, yPosition - 4, doc.internal.pageSize.width - 24, 22, 3, 3, 'S');

                // Employee header with accent
                doc.setFillColor(30, 60, 114);
                doc.roundedRect(12, yPosition - 4, doc.internal.pageSize.width - 24, 7, 3, 3, 'F');

                // Employee title
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text('EMPLOYEE INFORMATION', 20, yPosition);

                // Employee details with proper alignment
                doc.setFontSize(8);
                doc.setTextColor(60, 60, 60);
                doc.setFont('helvetica', 'normal');

                // Calculate column positions for better alignment
                const col1X = 20;
                const col2X = 90;
                const col3X = 170;
                const col4X = 240; // Adjusted for better branch alignment

                // Column 1: Basic Info
                doc.setFont('helvetica', 'bold');
                doc.text('Name:', col1X, yPosition + 8);
                doc.setFont('helvetica', 'normal');
                doc.text(shortenText(record.empName || 'N/A', 20), col1X + 25, yPosition + 8);

                doc.setFont('helvetica', 'bold');
                doc.text('Code:', col1X, yPosition + 13);
                doc.setFont('helvetica', 'normal');
                doc.text(shortenText(record.empCode || 'N/A', 15), col1X + 25, yPosition + 13);

                // Column 2: Department & Role
                doc.setFont('helvetica', 'bold');
                doc.text('Department:', col2X, yPosition + 8);
                doc.setFont('helvetica', 'normal');
                doc.text(shortenText(record.department || 'N/A', 20), col2X + 30, yPosition + 8);

                doc.setFont('helvetica', 'bold');
                doc.text('Designation:', col2X, yPosition + 13);
                doc.setFont('helvetica', 'normal');
                doc.text(shortenText(record.designation || 'N/A', 20), col2X + 30, yPosition + 13);

                // Column 3: Period & Reporting
                doc.setFont('helvetica', 'bold');
                doc.text('Period:', col3X, yPosition + 8);
                doc.setFont('helvetica', 'normal');
                const periodText = `${record.pmonth || 'N/A'} ${record.appraisalYear || ''}`;
                doc.text(shortenText(periodText, 15), col3X + 20, yPosition + 8);

                doc.setFont('helvetica', 'bold');
                doc.text('Reports To:', col3X, yPosition + 13);
                doc.setFont('helvetica', 'normal');
                doc.text(shortenText(record.reportingto || 'N/A', 20), col3X + 20, yPosition + 13);

                // Column 4: Branch - Fixed alignment
                doc.setFont('helvetica', 'bold');
                doc.text('Branch:', col4X, yPosition + 8);
                doc.setFont('helvetica', 'normal');
                doc.text(shortenText(record.branch || 'N/A', 15), col4X + 18, yPosition + 8);

                yPosition += 22;

                // Performance Goals Details Table with better text handling
                if (record.performanceGoalsDtlVO && record.performanceGoalsDtlVO.length > 0) {
                    const tableData = record.performanceGoalsDtlVO.map((goal, goalIndex) => [
                        (goalIndex + 1).toString(),
                        shortenText(goal.perspective || '-', 15),
                        shortenText(goal.objectivedesc || '-', 40),
                        goal.perassigned ? `${goal.perassigned}%` : '0%',
                        shortenText(goal.measurement || '-', 35),
                        shortenText(goal.qtrtarget || '-', 12),
                        shortenText(goal.performance || '-', 30),
                        shortenText(goal.comments || '-', 30),
                        shortenText(goal.performanceself || '-', 30),
                        goal.selfrating ? goal.selfrating.toString() : '-',
                        goal.appraiserrating?goal.appraiserrating.toString():'Pending',
                    ]);

                    doc.autoTable({
                        startY: yPosition,
                        head: [
                            ['#', 'Perspective', 'Objective Description', 'Assigned %', 'Measurement', 'Qtr Target', 'Performance', 'Comments', 'Performance Self', 'Self Rating','App Rating']
                        ],
                        body: tableData,
                        theme: 'grid',
                        styles: {
                            fontSize: 6.5,
                            cellPadding: 1.8,
                            lineWidth: 0.1,
                            lineColor: [220, 220, 220],
                            textColor: [60, 60, 60],
                            font: 'helvetica',
                            minCellHeight: 7,
                            overflow: 'linebreak',
                            cellWidth: 'wrap'
                        },
                        headStyles: {
                            fillColor: [44, 62, 80],
                            textColor: 255,
                            fontStyle: 'bold',
                            fontSize: 6.5,
                            halign: 'center',
                            cellPadding: 2.5
                        },
                        bodyStyles: {
                            fillColor: [255, 255, 255],
                            textColor: [60, 60, 60],
                            cellPadding: 1.8,
                            fontSize: 6.2
                        },
                        alternateRowStyles: {
                            fillColor: [248, 250, 252]
                        },
                        columnStyles: {
                            0: { cellWidth: 10, halign: 'center' }, // S.No
                            1: { cellWidth: 22, halign: 'center' }, // Perspective
                            2: { cellWidth: 45, halign: 'left' }, // Objective Description
                            3: { cellWidth: 16, halign: 'center' }, // Assigned
                            4: { cellWidth: 40, halign: 'left' }, // Measurement
                            5: { cellWidth: 14, halign: 'center' }, // Qtr Target
                            6: { cellWidth: 38, halign: 'left' }, // Performance
                            7: { cellWidth: 38, halign: 'left' }, // Comments
                            8: { cellWidth: 35, halign: 'left' }, // Self Performance
                            9: { cellWidth: 12, halign: 'center' }, // Self Rating
                            10: { cellWidth: 15, halign: 'center' } // Appraiser Rating

                        },
                        margin: { left: 5, right: 5 },
                        tableWidth: 'auto',
                        didParseCell: function (data) {
                            // Handle long text in cells
                            if (data.cell.raw && data.cell.raw.length > 100) {
                                data.cell.text = [shortenText(data.cell.raw, 100)];
                            }
                        },
                        didDrawPage: function (data) {
                            doc.setFontSize(7);
                            doc.setTextColor(150, 150, 150);
                            const pageCount = doc.internal.getNumberOfPages();
                            doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                        }
                    });

                    // Update yPosition for next record
                    yPosition = doc.lastAutoTable.finalY + 5;

                    // Add professional summary for the record
                    if (yPosition < 175) {
                        doc.setFillColor(240, 245, 250);
                        doc.roundedRect(12, yPosition, doc.internal.pageSize.width - 24, 8, 2, 2, 'F');

                        doc.setFontSize(7);
                        doc.setTextColor(44, 62, 80);
                        doc.setFont('helvetica', 'bold');
                        doc.text('SUMMARY:', 18, yPosition + 5);

                        doc.setFontSize(6.5);
                        doc.setTextColor(100, 100, 100);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`Total Goals: ${record.performanceGoalsDtlVO.length}`, 45, yPosition + 5);
                        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 100, yPosition + 5);
                        doc.text(`Employee: ${shortenText(record.empCode || 'N/A', 15)}`, 150, yPosition + 5);

                        yPosition += 12;
                    }
                } else {
                    // No goals available message
                    doc.setFillColor(255, 250, 250);
                    doc.roundedRect(12, yPosition, doc.internal.pageSize.width - 24, 15, 3, 3, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(150, 150, 150);
                    doc.setFont('helvetica', 'italic');
                    doc.text('No performance goals details available for this employee', doc.internal.pageSize.width / 2, yPosition + 8, { align: 'center' });
                    yPosition += 20;
                }

                // Add professional separation between records
                if (index < listViewData.length - 1 && yPosition < 175) {
                    doc.setDrawColor(220, 220, 220);
                    doc.setLineWidth(0.5);
                    doc.line(50, yPosition, doc.internal.pageSize.width - 50, yPosition);
                    doc.setFontSize(6);
                    doc.setTextColor(180, 180, 180);
                    doc.text('•••', doc.internal.pageSize.width / 2, yPosition + 2, { align: 'center' });
                    yPosition += 10;
                }
            });

            // Add final professional footer to all pages
            const finalPageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= finalPageCount; i++) {
                doc.setPage(i);

                // Footer background
                doc.setFillColor(248, 249, 250);
                doc.rect(0, doc.internal.pageSize.height - 15, doc.internal.pageSize.width, 15, 'F');

                // Footer separator
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.3);
                doc.line(0, doc.internal.pageSize.height - 15, doc.internal.pageSize.width, doc.internal.pageSize.height - 15);

                // Confidential notice
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.setFont('helvetica', 'italic');
                doc.text('CONFIDENTIAL & PROPRIETARY - FOR INTERNAL MANAGEMENT USE ONLY', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

                // Copyright/company info
                doc.setFontSize(6);
                const companyText = companyDetails && companyDetails.companyName
                    ? `© ${new Date().getFullYear()} ${shortenText(companyDetails.companyName, 40)}. All Rights Reserved.`
                    : `© ${new Date().getFullYear()} Company Name. All Rights Reserved.`;
                doc.text(companyText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' });
            }

            // Save the PDF
            const fileName = `Performance_Goals_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <>
            <div>
                <ToastComponent />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
                        {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
                        
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton
                            title="Save"
                            icon={SaveIcon}
                            onClick={handleSave}
                        />
                        {listView && (
                              <ActionButton
                            title="Download PDF"
                            icon={PictureAsPdfIcon}
                            onClick={downloadPDF}
                        />
                        )
                    }
                      
                    </div>

                    {!listView ? (
                        <>
                            <div className="row d-flex ml">

                                <div className="col-md-3 mb-1">
                                    <TextField
                                        id="outlined-textarea-zip"
                                        label="Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="employeeCode"
                                        value={employeeDetailsData.empCode}
                                        disabled
                                        inputProps={{ maxLength: 10 }}
                                    />
                                </div>

                                <div className="col-md-3 mb-1">
                                    <TextField
                                        id="outlined-textarea-name"
                                        label="Name"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="employeeName"
                                        value={employeeDetailsData.empName}
                                        disabled
                                        inputProps={{ maxLength: 50 }}
                                    />
                                </div>

                                <div className="col-md-3 mb-1">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.month}>
                                        <InputLabel>Select Month</InputLabel>
                                        <Select label="Select Month" value={selectedMonth} onChange={handleMonthChange}>
                                            {months.map((m) => (
                                                <MenuItem key={m.value} value={m.name}>
                                                    {m.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.month && <FormHelperText>{fieldErrors.month}</FormHelperText>}
                                    </FormControl>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.year}>
                                        <InputLabel>Select Year</InputLabel>
                                        <Select label="Select Year" value={formData.year} onChange={handleYearChange}>
                                            {years.map((y) => (
                                                <MenuItem key={y} value={y}>
                                                    {y}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.year && <FormHelperText>{fieldErrors.year}</FormHelperText>}
                                    </FormControl>
                                </div>

                            </div>
                            <div className="row">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                                        <Tab value={0} label="Goals" />
                                    </Tabs>
                                </Box>

                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add Row" icon={AddIcon} onClick={handleAddRow} />
                                            </div>
                                            <div className="row mt-0">
                                                <div className="col-lg-12">
                                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                                        <table
                                                            className="table table-bordered"
                                                            style={{ minWidth: '1600px', borderCollapse: 'collapse' }}
                                                        >
                                                            <thead>
                                                                <tr
                                                                    style={{
                                                                        background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                        color: 'white',
                                                                    }}
                                                                >
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                                                        Perspective
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                                                        Objective Description
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '60px' }}>
                                                                        Assigned
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                                                        Measurement
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">Qtr Target</th>
                                                                    <th className="px-2 py-2 text-white text-center">Performance</th>
                                                                    <th className="px-2 py-2 text-white text-center">Comments</th>
                                                                    <th className="px-2 py-2 text-white text-center">Performance Self</th>
                                                                    <th className="px-2 py-2 text-white text-center">Self Rating</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {goalsDetailsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() => handleDeleteRow(row.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center pt-3">{index + 1}</td>
                                                                        <td className="border px-2 py-2">
                                                                            <select
                                                                                value={row.perspective}
                                                                                onChange={(e) => handleSelectChange(index, 'perspective', e.target.value)}
                                                                                className={goalsDetailsErrors[index]?.perspective ? 'error form-control' : 'form-control'}
                                                                            >
                                                                                <option value="">Select Option</option>
                                                                                <option value="Financial">Financial</option>
                                                                                <option value="Customer">Customer</option>
                                                                                <option value="Internal Processes">Internal Processes</option>
                                                                                <option value="Learning & Growth">Learning & Growth</option>
                                                                            </select>

                                                                            {goalsDetailsErrors[index]?.perspective && (
                                                                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                    {goalsDetailsErrors[index].perspective}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.objectiveDescription}
                                                                                onChange={(e) => handleDetailChange(row.id, 'objectiveDescription', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.objectiveDescription}
                                                                                helperText={goalsDetailsErrors[index]?.objectiveDescription}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.assigned}
                                                                                placeholder="%"
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;

                                                                                    // Allow only digits and an optional '%' symbol
                                                                                    if (/^\d{0,3}%?$/.test(value)) {
                                                                                        // Remove % to check numeric range
                                                                                        const numericPart = value.replace('%', '');

                                                                                        // Allow empty or 0–100 range
                                                                                        if (numericPart === '' || Number(numericPart) <= 100) {
                                                                                            handleDetailChange(row.id, 'assigned', value);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                error={!!goalsDetailsErrors[index]?.assigned}
                                                                                helperText={goalsDetailsErrors[index]?.assigned}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.measurement}
                                                                                onChange={(e) => handleDetailChange(row.id, 'measurement', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.measurement}
                                                                                helperText={goalsDetailsErrors[index]?.measurement}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.qtrTarget}
                                                                                onChange={(e) => handleDetailChange(row.id, 'qtrTarget', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.qtrTarget}
                                                                                helperText={goalsDetailsErrors[index]?.qtrTarget}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.performance}
                                                                                onChange={(e) => handleDetailChange(row.id, 'performance', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.performance}
                                                                                helperText={goalsDetailsErrors[index]?.performance}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.comments}
                                                                                onChange={(e) => handleDetailChange(row.id, 'comments', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.comments}
                                                                                helperText={goalsDetailsErrors[index]?.comments}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.performanceSelf}
                                                                                onChange={(e) => handleDetailChange(row.id, 'performanceSelf', e.target.value)}
                                                                                error={!!goalsDetailsErrors[index]?.performanceSelf}
                                                                                helperText={goalsDetailsErrors[index]?.performanceSelf}
                                                                            />
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <select
                                                                                value={row.selfRating}
                                                                                onChange={(e) => handleSelectChange(index, 'selfRating', e.target.value)}
                                                                                className={goalsDetailsErrors[index]?.selfRating ? 'error form-control' : 'form-control'}
                                                                            >
                                                                                <option value="">Select Option</option>
                                                                                {[1, 2, 3, 4, 5].map((val) => (
                                                                                    <option key={val} value={val}>{val}</option>
                                                                                ))}
                                                                            </select>

                                                                            {goalsDetailsErrors[index]?.selfRating && (
                                                                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                    {goalsDetailsErrors[index].selfRating}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Box>
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            blockEdit={true}
                            toEdit={getPerformanceGoalsById}
                            enableEditing={true}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default PerformanceGoals;