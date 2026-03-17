import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    Divider,
    Autocomplete,
    TextField
} from '@mui/material';
import {
    Download as DownloadIcon,
    Print as PrintIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    Business as BusinessIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import apiCalls from 'apicall';

const fontStyles = {
    title: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1e3a5f'
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#1e3a5f'
    },
    body: {
        fontSize: '1rem',
        color: '#334155',
        lineHeight: 1.8,
        mb: 3
    },
    label: {
        fontSize: '0.85rem',
        color: '#64748b'
    },
    value: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#0f172a'
    },
    small: {
        fontSize: '0.8rem',
        color: '#64748b'
    }
};

const RelievingLetter = ({ seperationDetails = [] }) => {
    const [companyDetails, setCompanyDetails] = useState(null);
    const [companyLogo, setCompanyLogo] = useState(null);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const letterRef = useRef();
    const [isDownloading, setIsDownloading] = useState(false);
    const [relievingData, setRelievingData] = useState(null);
    const [gmDetails, setGMDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);

    const loginUserRole = localStorage.getItem('designation');
    const loginEmployeeCode = localStorage.getItem('employeeCode');

    const branchCode = localStorage.getItem('branchCode');

    useEffect(() => {
        getCompanyDetails();
        getGMDetails();

        if (seperationDetails.includes(loginUserRole)) {
            fetchEmployees(); // HR user
        } else {
            getAllSeparations(loginEmployeeCode); // Employee user
        }
    }, []);

    const fetchEmployees = async () => {
        try {
            const apiUrl = `employeseparation/getInitiateSeparationByDepartment?branchCode=${branchCode}&empCode=ALL&department=ALL&orgId=${orgId}&type=ALL`;

            const response = await apiCalls('get', apiUrl);

            if (response.status === true) {
                const list = response.paramObjectsMap.initiateSeparationVO
                    .filter(emp => emp.status === "APPROVED")
                    .map((emp) => ({
                        employeeCode: emp.employeeCode,
                        employeeName: emp.employeeName,
                        name: `${emp.employeeName} (${emp.employeeCode})`
                    }));

                setEmployees(list);
            }
        } catch (error) {
            console.error("Error fetching employees", error);
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
                const gm = response.paramObjectsMap.employeeVO?.[0]; // get first GM
                setGMDetails(gm);
            }
        } catch (error) {
            console.error('Error fetching GM:', error);
        }
    };

    const sendRelievingLetterApi = async (pdfFile) => {
        try {
            const formData = new FormData();
            formData.append("files", pdfFile);

            const apiUrl =
                `/employeseparation/sendRelievingLetter` +
                `?employeeEmail=${relievingData?.employeeEmail}` +
                `&employeeName=${relievingData?.employeeName}`;

            const response = await apiCalls("post", apiUrl, formData);

            if (response.status === true) {
                alert("Relieving letter sent successfully!");
            }
        } catch (error) {
            console.error("Error sending mail:", error);
            alert("Failed to send email.");
        }
    };

    const getAllSeparations = async (empCode) => {
        if (!orgId || !branchCode) return;

        try {
            setLoading(true);

            const apiUrl = `employeseparation/getInitiateSeparationByDepartment?branchCode=${branchCode}&empCode=${empCode}&department=ALL&orgId=${orgId}&type=ALL`;

            const response = await apiCalls('get', apiUrl);

            if (response.status === true) {
                const data = response.paramObjectsMap.initiateSeparationVO
                    ?.find(emp => emp.status === "APPROVED");

                if (data && data.status === "APPROVED") {
                    setRelievingData(data);
                } else {
                    setRelievingData(null);
                }
            }
        } catch (error) {
            console.error('Error fetching separation:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleMail = async () => {
        let originalWidth;
        let originalPadding;

        try {
            setIsDownloading(true);

            const input = letterRef.current;

            // Save original styles
            originalWidth = input.style.width;
            originalPadding = input.style.padding;

            // Lock layout for PDF
            input.style.width = "794px";
            input.style.padding = "40px";

            const canvas = await html2canvas(input, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                windowWidth: input.scrollWidth
            });

            const imgData = canvas.toDataURL('image/png');

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const pdfBlob = pdf.output("blob");

            const pdfFile = new File(
                [pdfBlob],
                `Relieving_Letter_${relievingData?.employeeName.replace(/\s+/g, '_')}.pdf`,
                { type: "application/pdf" }
            );

            await sendRelievingLetterApi(pdfFile);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to send email.');
        } finally {

            // ✅ Restore styles here
            const input = letterRef.current;
            if (input) {
                input.style.width = originalWidth;
                input.style.padding = originalPadding;
            }

            setIsDownloading(false);
        }
    };

    const handleDownload = async () => {
        let originalWidth;
        let originalPadding;

        try {
            setIsDownloading(true);

            const input = letterRef.current;

            // Save original styles
            originalWidth = input.style.width;
            originalPadding = input.style.padding;

            // Lock layout for PDF (A4 width)
            input.style.width = "794px";
            input.style.padding = "40px";

            const canvas = await html2canvas(input, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
                windowWidth: input.scrollWidth
            });

            const imgData = canvas.toDataURL("image/png");

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

            pdf.save(
                `Relieving_Letter_${relievingData?.employeeName.replace(/\s+/g, "_")}.pdf`
            );

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {

            // Restore original styles
            const input = letterRef.current;
            if (input) {
                input.style.width = originalWidth;
                input.style.padding = originalPadding;
            }

            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        const printContent = letterRef.current;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent.outerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <>
            {seperationDetails.includes(loginUserRole) && (
                <Box sx={{ width: '100%', maxWidth: '300px', mb: 3 }}>
                    <Autocomplete
                        options={employees}
                        getOptionLabel={(option) => option.name}
                        value={selectedEmployee}
                        onChange={(event, newValue) => {
                            setSelectedEmployee(newValue);

                            if (newValue) {
                                getAllSeparations(newValue.employeeCode);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Employee"
                                placeholder="Search employee..."
                                size="small"
                            />
                        )}
                    />
                </Box>
            )}

            {!relievingData && (
                <Box
                    sx={{
                        mt: 4,
                        p: 3,
                        border: "1px dashed #cbd5e1",
                        borderRadius: 2,
                        textAlign: "center",
                        color: "#64748b",
                        background: "#ffffff"
                    }}
                >
                    Relieving Letter will be available only after the separation request is <b>APPROVED</b>.
                </Box>
            )}

            {relievingData && (
                <Box sx={{
                    p: { xs: 2, md: 3 },
                    backgroundColor: '#f5f7fa',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
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
                        <Button
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            onClick={handleMail}
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
                            Mail
                        </Button>
                        <Button
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
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            disabled={isDownloading}
                            sx={{
                                bgcolor: '#1e3a5f',
                                px: 3.5,
                                py: 1,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)',
                                '&:hover': {
                                    bgcolor: '#152b4a',
                                    boxShadow: '0 6px 16px rgba(30, 58, 95, 0.3)'
                                },
                                '&.Mui-disabled': {
                                    bgcolor: '#94a3b8'
                                }
                            }}
                        >
                            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                        </Button>
                    </Stack>

                    {/* Relieving Letter Paper - Distinct Design */}
                    <Paper
                        ref={letterRef}
                        elevation={0}
                        sx={{
                            p: 4,
                            width: '100%',
                            maxWidth: '900px',
                            margin: '0 auto',
                            backgroundColor: '#ffffff',
                            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(30, 58, 95, 0.02) 0%, transparent 20%)',
                            border: '1px solid #eaeef2',
                            borderRadius: '12px',
                            position: 'relative',
                            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
                            '@media print': {
                                boxShadow: 'none',
                                border: '1px solid #ddd',
                                borderRadius: 0,
                                p: 4,
                            }
                        }}
                    >

                        {/* Main Content - Higher z-index */}
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            {/* Header Section - Different Layout */}
                            <Box
                                sx={{
                                    mb: 4,
                                    pb: 2,
                                    borderBottom: '1px solid #dbe2ea'
                                }}
                            >
                                {/* Logo + Letter Title */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}
                                >
                                    {/* Logo */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {companyLogo ? (
                                            <img
                                                src={companyLogo}
                                                alt="Company Logo"
                                                style={{
                                                    height: '55px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        ) : (
                                            <BusinessIcon sx={{ fontSize: 48, color: '#1e3a5f' }} />
                                        )}

                                        {/* Company Name */}
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: fontStyles.sectionTitle,
                                                color: '#1e3a5f',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            {companyDetails?.companyName}
                                        </Typography>
                                    </Box>

                                    {/* Document Title */}
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: fontStyles.title,
                                                color: '#1e3a5f',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            RELIEVING LETTER
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: '0.85rem',
                                                color: '#64748b'
                                            }}
                                        >
                                            Certificate of Relieving
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Company Address and Details - Two Column Layout */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    mb: 4,
                                    pb: 2,
                                    borderBottom: '1px dashed #e2e8f0'
                                }}
                            >
                                {/* Ref + Date (Left) */}
                                <Box sx={{ minWidth: '220px' }}>
                                    {/*<Typography
                                        sx={{
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            color: '#1e3a5f',
                                            mb: 1
                                        }}
                                    >
                                        Ref No : REL/{new Date().getFullYear()}/
                                        {String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}
                                    </Typography>*/}

                                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', mb: 0.5 }}>
                                        <strong>Date :</strong> {new Date().toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.9rem', color: '#334155' }}>
                                        <strong>Place :</strong> {companyDetails?.city}
                                    </Typography>
                                </Box>

                                {/* Address Section (Right) */}
                                <Box
                                    sx={{
                                        maxWidth: '50%',
                                        textAlign: 'right'
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '0.95rem',
                                            color: '#334155',
                                            fontWeight: 500,
                                            mb: 0.5
                                        }}
                                    >
                                        {companyDetails?.address}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.9rem', color: '#475569' }}>
                                        {companyDetails?.city}
                                    </Typography>

                                    {companyDetails?.gstNo && (
                                        <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mt: 1 }}>
                                            GST No: {companyDetails.gstNo}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Employee Information Card */}
                            <Box sx={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                p: 2.5,
                                mb: 4,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                                <Typography sx={{
                                    color: '#1e3a5f',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    borderBottom: '1px solid #e2e8f0',
                                    pb: 1
                                }}>
                                    <VerifiedIcon sx={{ fontSize: 18 }} />
                                    EMPLOYEE DETAILS
                                </Typography>

                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                    <Box>
                                        <Typography sx={{ color: '#64748b', fontSize: fontStyles.label }}>Employee Name</Typography>
                                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{relievingData?.employeeName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#64748b', fontSize: fontStyles.label }}>Employee Code</Typography>
                                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{relievingData?.employeeCode}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#64748b', fontSize: fontStyles.label }}>Designation</Typography>
                                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{relievingData?.position}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#64748b', fontSize: fontStyles.label }}>Department</Typography>
                                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{relievingData?.department}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Letter Content - Formal and Warm */}
                            <Box sx={{ mb: 4 }}>
                                {/* Salutation */}
                                <Typography sx={{ mb: 3, fontSize: fontStyles.body, color: '#1e3a5f', fontWeight: 500 }}>
                                    Dear {relievingData?.employeeName},
                                </Typography>

                                {/* Main Content with Indented Paragraphs */}
                                <Box sx={{ pl: 2 }}>
                                    <Typography sx={fontStyles.body}>
                                        This has reference to your letter of resignation dated <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{formatDate(relievingData?.resignation)}</span>, wherein you have requested to be relieved from the services of <span style={{ fontWeight: 600 }}>{companyDetails?.companyName}</span> on <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{formatDate(relievingData?.lastWorkingDate)}</span>.
                                    </Typography>

                                    <Typography sx={fontStyles.body}>
                                        We confirm that you have been working with us as <span style={{ fontWeight: 600 }}>{relievingData?.position}</span> from <span style={{ fontWeight: 600 }}>{formatDate(relievingData?.joiningDate)}</span>. During your tenure with us, you have demonstrated professionalism and dedication to your work.
                                    </Typography>
                                </Box>

                                {/* Closing */}
                                <Typography sx={{ mt: 4, mb: 2, fontSize: fontStyles.body, color: '#1e3a5f', fontWeight: 500 }}>
                                    With Warm Regards,
                                </Typography>
                            </Box>

                            {/* Signature Section - Different Layout */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    mt: 4,
                                    pt: 2
                                }}
                            >
                                {/* Right - Signature */}
                                <Box
                                    sx={{
                                        textAlign: 'right',
                                        width: '300px',
                                        ml: 'auto'   // ⭐ pushes content to the right
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: '#1e3a5f',
                                            fontSize: '1.1rem',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        {gmDetails?.employeeName}
                                    </Typography>

                                    <Typography sx={{ color: '#475569', fontSize: '0.95rem' }}>
                                        {gmDetails?.designation}
                                    </Typography>

                                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5 }}>
                                        {companyDetails?.companyName}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Footer with Company Details */}
                            <Box sx={{
                                mt: 5,
                                pt: 2,
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'center',
                                textAlign: 'center',
                                alignItems: 'center',
                                backgroundColor: '#fafcfd',
                                mx: -4,
                                px: 4,
                                pb: 2,
                                mt: 6,
                                borderBottomLeftRadius: '12px',
                                borderBottomRightRadius: '12px',
                            }}>
                                {/* <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 14 }} /> hr@{companyDetails?.companyName?.toLowerCase().replace(/[^a-z]/g, '') || 'whydigit'}.com
                                    </Typography>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PhoneIcon sx={{ fontSize: 14 }} /> +91 80 1234 5678
                                    </Typography>
                                </Box> */}

                                {/*<Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center' }}>
                                    This is a system-generated document, no signature is required
                                </Typography>*/}
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            )}
        </>
    );
};

export default RelievingLetter;