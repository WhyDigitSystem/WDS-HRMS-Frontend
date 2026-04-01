import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Download as DownloadIcon,
    Print as PrintIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    Business as BusinessIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import apiCalls from 'apicall';

const ExperienceLetter = () => {
    const [companyDetails, setCompanyDetails] = useState(null);
    const [companyLogo, setCompanyLogo] = useState(null);
    const [experienceData, setExperienceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [gmDetails, setGMDetails] = useState(null);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const letterRef = useRef();
    const [isDownloading, setIsDownloading] = useState(false);
    const loginUserRole = localStorage.getItem('designation');
    const loginEmployeeCode = localStorage.getItem('employeeCode');

    useEffect(() => {
        getCompanyDetails();
        getGMDetails();
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const apiUrl = `/employeseparation/getInitiateSeparationByDepartment?branchCode=${branchCode}&empCode=ALL&department=ALL&orgId=${orgId}&type=ALL`;

            const response = await apiCalls('get', apiUrl);

            if (response.status === true && response.paramObjectsMap?.initiateSeparationVO) {

                // ✅ FILTER ONLY APPROVED
                const approvedEmployees = response.paramObjectsMap.initiateSeparationVO
                    .filter(emp => emp.status === "APPROVED");

                const list = approvedEmployees.map((emp) => ({
                    id: emp.id,
                    employeeCode: emp.employeeCode,
                    employeeName: emp.employeeName,
                    name: `${emp.employeeName} (${emp.employeeCode})`,
                    position: emp.position,
                    joiningDate: emp.joiningDate,
                    lastWorkingDate: emp.lastWorkingDate,
                    employeeEmail: emp.employeeEmail,
                    department: emp.department,
                    separationType: emp.separationType,
                    originalData: emp
                }));

                setEmployees(list);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error("Error fetching employees", error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const getCompanyDetails = async () => {
        try {
            const response = await apiCalls('get', `commonmaster/company/${orgId}`);

            if (response.status === true) {
                const company = response.paramObjectsMap.companyVO[0];
                setCompanyDetails(company);

                if (company.companyLogo) {
                    setCompanyLogo(`data:image/png;base64,${company.companyLogo}`);
                }
            }
        } catch (error) {
            console.error('Error fetching company:', error);
        }
    };

    const getGMDetails = async () => {
        try {
            const response = await apiCalls('get', `employeseparation/getGeneralManagerByOrgId?orgId=${orgId}`);

            if (response.status === true) {
                const gm = response.paramObjectsMap.employeeVO?.[0];
                setGMDetails(gm);
            }
        } catch (error) {
            console.error('Error fetching GM:', error);
        }
    };

    const sendExperienceLetterApi = async (pdfFile) => {
        try {
            const formData = new FormData();
            formData.append("files", pdfFile);

            const apiUrl =
                `/employeseparation/sendExperienceLetter` +
                `?employeeEmail=${experienceData.employeeEmail}` +
                `&employeeName=${experienceData.employeeName}`;

            const response = await apiCalls("post", apiUrl, formData);

            if (response.status === true) {
                alert("Experience letter sent successfully!");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send email.");
            return false;
        }
    };

    const handleEmployeeSelect = (event, newValue) => {
        setSelectedEmployee(newValue);
        if (newValue) {
            setExperienceData(newValue);
        } else {
            setExperienceData(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const generatePDFBlob = async () => {
        const input = letterRef.current;

        // Store original styles
        const originalWidth = input.style.width;
        const originalPadding = input.style.padding;
        const originalBackground = input.style.backgroundColor;

        // Apply PDF-specific styles before capture
        input.style.width = '900px';
        input.style.padding = '40px';
        input.style.backgroundColor = '#ffffff';

        const canvas = await html2canvas(input, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            useCORS: true,
            windowWidth: 900,
            windowHeight: input.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF({
            orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
            unit: 'mm',
        });

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Restore original styles
        input.style.width = originalWidth;
        input.style.padding = originalPadding;
        input.style.backgroundColor = originalBackground;

        return pdf;
    };

    const handleMail = async () => {
        if (!experienceData) {
            alert('Please select an employee first');
            return;
        }

        try {
            setIsDownloading(true);
            const pdf = await generatePDFBlob();
            const pdfBlob = pdf.output('blob');

            const pdfFile = new File(
                [pdfBlob],
                `Experience_Letter_${experienceData.employeeName.replace(/\s+/g, '_')}.pdf`,
                { type: "application/pdf" }
            );

            await sendExperienceLetterApi(pdfFile);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to send email.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownload = async () => {
        if (!experienceData) {
            alert('Please select an employee first');
            return;
        }

        try {
            setIsDownloading(true);
            const pdf = await generatePDFBlob();
            pdf.save(`Experience_Letter_${experienceData.employeeName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        if (!experienceData) {
            alert('Please select an employee first');
            return;
        }

        const printContent = letterRef.current;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent.outerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <Box sx={{
            p: { xs: 2, md: 3 },
            backgroundColor: '#f0f4f8',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1100px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start", // 👈 LEFT ALIGN
                    mb: 2
                }}
            >
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                    Select Employee
                </Typography>
                <Autocomplete
                    options={employees}
                    getOptionLabel={(option) => option.name}
                    value={selectedEmployee}
                    onChange={handleEmployeeSelect}
                    loading={loading}
                    sx={{
                        width: 300, // 👈 reduce size (you can use 280 / 320 as needed)
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Employee *"
                            placeholder="Type employee name or code..."
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                )
                            }}
                        />
                    )}
                    fullWidth
                />
            </Box>

            {/* No Employee Selected Message */}
            {!experienceData && employees.length > 0 && (
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '900px',
                        p: 4,
                        background: "#ffffff",
                        borderRadius: 2,
                        border: "1px dashed #cbd5e1",
                        textAlign: "center",
                        color: "#64748b"
                    }}
                >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        👤 No Employee Selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please select an employee from the dropdown above to generate the experience letter.
                    </Typography>
                </Box>
            )}

            {/* Loading State */}
            {loading && !experienceData && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Experience Letter Content */}
            {experienceData && (
                <>
                    {/* Action Buttons */}
                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                        sx={{
                            mb: 3,
                            width: '100%',
                            maxWidth: '900px',
                        }}
                    >
                        {/* <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            disabled={isDownloading}
                            sx={{
                                borderColor: '#cbd5e1',
                                color: '#1e293b',
                                px: 3.5,
                                py: 1,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                backgroundColor: '#ffffff',
                                '&:hover': {
                                    borderColor: '#0f172a',
                                    backgroundColor: '#f8fafc'
                                }
                            }}
                        >
                            Print
                        </Button> */}
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            disabled={isDownloading}
                            sx={{
                                bgcolor: '#0f172a',
                                px: 3.5,
                                py: 1,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                                '&:hover': {
                                    bgcolor: '#1e293b',
                                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.3)'
                                },
                                '&.Mui-disabled': {
                                    bgcolor: '#94a3b8'
                                }
                            }}
                        >
                            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                        </Button>
                    </Stack>

                    {/* Experience Letter */}
                    <Paper
                        ref={letterRef}
                        elevation={0}
                        sx={{
                            p: 5,
                            width: '100%',
                            maxWidth: '900px',
                            margin: '0 auto',
                            backgroundColor: '#ffffff',
                            borderRight: '1px solid #e5e7eb',
                            borderTop: '1px solid #e5e7eb',
                            borderBottom: '1px solid #e5e7eb',
                            borderRadius: '0 16px 16px 0',
                            position: 'relative',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            '@media print': {
                                boxShadow: 'none',
                                p: 5,
                            }
                        }}
                    >
                        {/* Header with Clean Layout */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 4,
                            pb: 3,
                            borderBottom: '2px solid #f0f4f8'
                        }}>
                            {/* Logo on Left */}
                            <Box sx={{
                                flex: '0 0 auto',
                                borderRadius: '12px',
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {companyLogo ? (
                                    <img
                                        src={companyLogo}
                                        alt="Company Logo"
                                        style={{
                                            maxHeight: '80px',
                                            maxWidth: '180px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    <BusinessIcon sx={{ fontSize: 60, color: '#94a3b8' }} />
                                )}
                            </Box>

                            {/* Company Info on Right */}
                            <Box sx={{
                                textAlign: 'right',
                                flex: '1',
                                ml: 3
                            }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        mb: 1,
                                        fontSize: '1.6rem',
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1.2
                                    }}
                                >
                                    {companyDetails?.companyName}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#475569',
                                        mb: 0.5,
                                        maxWidth: '50%',
                                        textAlign: 'right',
                                        ml: 'auto'
                                    }}
                                >
                                    {companyDetails?.address}
                                </Typography>

                                {companyDetails?.gstNo && (
                                    <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                                        GST: {companyDetails.gstNo}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Employee Details Card */}
                        <Box sx={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            p: 3,
                            mb: 4,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography sx={{ fontWeight: 600, mb: 2, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Employee Details
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <Box>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>Employee Name</Typography>
                                    <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>{experienceData?.employeeName}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>Designation</Typography>
                                    <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>{experienceData?.position}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>Department</Typography>
                                    <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>{experienceData?.department || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>Employee Code</Typography>
                                    <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>{experienceData?.employeeCode}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>Date of Joining</Typography>
                                    <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>{formatDate(experienceData?.joiningDate)}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>Date of Relieving</Typography>
                                    <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>{formatDate(experienceData?.lastWorkingDate)}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Letter Content */}
                        <Box sx={{ mb: 5 }}>
                            <Typography sx={{ mb: 3, fontSize: '1rem', lineHeight: 1.7, color: '#374151' }}>
                                This is to certify that <span style={{ fontWeight: 600 }}>{experienceData?.employeeName}</span> has worked with our organization as <span style={{ fontWeight: 600 }}>{experienceData?.position}</span> from <span style={{ fontWeight: 600 }}>{formatDate(experienceData?.joiningDate)}</span> to <span style={{ fontWeight: 600 }}>{formatDate(experienceData?.lastWorkingDate)}</span>.
                            </Typography>

                            <Typography sx={{ mb: 3, fontSize: '1rem', lineHeight: 1.7, color: '#374151' }}>
                                His main job responsibilities to involve project development and also supports technically. During his tenure, we found him very cordial and professional in the approach.
                            </Typography>

                            <Typography sx={{ mb: 4, fontSize: '1rem', lineHeight: 1.7, color: '#374151' }}>
                                Why Digit, wishes him a success in all his future endeavors.
                            </Typography>
                        </Box>

                        {/* Signature */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            mt: 6
                        }}>
                            <Box>
                                <Typography sx={{ color: '#6b7280', fontSize: '0.9rem', mb: 1 }}>
                                    Place: {companyDetails?.city || companyDetails?.address?.split(',')[0] || 'N/A'}
                                </Typography>
                                <Typography sx={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                    Date: {new Date().toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'end' }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1f2937' }}>
                                    {gmDetails?.employeeName || 'Authorized Signatory'}
                                </Typography>
                                <Typography sx={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                    {gmDetails?.designation || 'General Manager'}
                                </Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.75rem', mt: 0.5 }}>
                                    {companyDetails?.companyName}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default ExperienceLetter;