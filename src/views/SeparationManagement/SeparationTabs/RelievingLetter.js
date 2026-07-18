import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    Divider,
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

const RelievingLetter = () => {
    const [companyDetails, setCompanyDetails] = useState(null);
    const [companyLogo, setCompanyLogo] = useState(null);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));
    const letterRef = useRef();
    const [isDownloading, setIsDownloading] = useState(false);
    const [relievingData, setRelievingData] = useState(null);
    const [gmDetails, setGMDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);

    const loginUserRole = localStorage.getItem('designation');
    const loginEmployeeCode = localStorage.getItem('employeeCode');

    useEffect(() => {
        getCompanyDetails();
        getGMDetails();
        fetchAllEmployees();
    }, []);

    const fetchAllEmployees = async () => {
        setEmployeeLoading(true);
        try {
            const apiUrl = `/employeseparation/getInitiateSeparationByDepartment?branchCode=${branchCode}&empCode=ALL&department=ALL&orgId=${orgId}&type=ALL`;

            const response = await apiCalls('get', apiUrl);

            if (response.status === true && response.paramObjectsMap?.initiateSeparationVO) {

                // ✅ FILTER ONLY APPROVED
                const approvedEmployees = response.paramObjectsMap.initiateSeparationVO
                    .filter(emp => emp.status?.toUpperCase() === "APPROVED");

                const list = approvedEmployees.map((emp) => ({
                    id: emp.id,
                    employeeCode: emp.employeeCode,
                    employeeName: emp.employeeName,
                    name: `${emp.employeeName} (${emp.employeeCode})`,
                    position: emp.position,
                    department: emp.department,
                    joiningDate: emp.joiningDate,
                    lastWorkingDate: emp.lastWorkingDate,
                    resignation: emp.resignation,
                    employeeEmail: emp.employeeEmail,
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
            setEmployeeLoading(false);
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
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error sending mail:", error);
            alert("Failed to send email.");
            return false;
        }
    };

    const handleEmployeeSelect = (event, newValue) => {
        setSelectedEmployee(newValue);
        if (newValue) {
            setRelievingData(newValue);
        } else {
            setRelievingData(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const generatePDFBlob = async () => {
        const input = letterRef.current;

        // Store original styles
        const originalWidth = input.style.width;
        const originalPadding = input.style.padding;

        // Lock layout for PDF
        input.style.width = "794px";
        input.style.padding = "60px";

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

        // Restore original styles
        input.style.width = originalWidth;
        input.style.padding = originalPadding;

        return pdf;
    };

    const handleMail = async () => {
        if (!relievingData) {
            alert('Please select an employee first');
            return;
        }

        try {
            setIsDownloading(true);
            const pdf = await generatePDFBlob();
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
            setIsDownloading(false);
        }
    };

    const handleDownload = async () => {
        if (!relievingData) {
            alert('Please select an employee first');
            return;
        }

        try {
            setIsDownloading(true);
            const pdf = await generatePDFBlob();
            pdf.save(`Relieving_Letter_${relievingData?.employeeName.replace(/\s+/g, "_")}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        if (!relievingData) {
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
            backgroundColor: '#f5f7fa',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Employee Selection Section */}

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
                    loading={employeeLoading}
                    sx={{
                        width: 300,
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
                                        {employeeLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
            {!relievingData && employees.length > 0 && !employeeLoading && (
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
                        Please select an employee from the dropdown above to generate the relieving letter.
                    </Typography>
                </Box>
            )}

            {/* Loading State */}
            {employeeLoading && !relievingData && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Relieving Letter Content */}
            {relievingData && (
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

                    {/* Relieving Letter Paper */}
                    <Paper
                        ref={letterRef}
                        elevation={0}
                        sx={{
                            p: 8,
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
                        {/* Main Content */}
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            {/* Header Section */}
                            <Box
                                sx={{
                                    mb: 6,
                                    pb: 2,
                                    borderBottom: '1px solid #dbe2ea'
                                }}
                            >
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

                            {/* Company Address and Details */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    mb: 6,
                                    pb: 2,
                                    borderBottom: '1px dashed #e2e8f0'
                                }}
                            >
                                {/* Date and Place */}
                                <Box sx={{ minWidth: '220px' }}>
                                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', mb: 0.5 }}>
                                        <strong>Date :</strong> {new Date().toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </Typography>

                                    <Typography sx={{ fontSize: '0.9rem', color: '#334155' }}>
                                        <strong>Place :</strong> {companyDetails?.city || 'N/A'}
                                    </Typography>
                                </Box>

                                {/* Address Section */}
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

                            {/* Letter Content */}
                            <Box sx={{ mb: 6 }}>
                                <Typography sx={{ mb: 3, fontSize: fontStyles.body, color: '#1e3a5f', fontWeight: 500 }}>
                                    Dear {relievingData?.employeeName},
                                </Typography>

                                <Box sx={{ pl: 2, mb: 3 }}>
                                    <Typography sx={fontStyles.body}>
                                        This has reference to your letter of resignation, dated <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{formatDate(relievingData?.resignation)}</span>, wherein you have requested to be relieved from the services of <span style={{ fontWeight: 600 }}>{companyDetails?.companyName}</span> on <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{formatDate(relievingData?.lastWorkingDate)}</span>.
                                    </Typography>

                                    <Typography sx={fontStyles.body}>
                                        We confirm that you have been working with us as <span style={{ fontWeight: 600 }}>{relievingData?.position}</span>, from <span style={{ fontWeight: 600 }}>{formatDate(relievingData?.joiningDate)}</span>. We would like to thank you for your service and wish you the best for your future endeavors.
                                    </Typography>

                                    <Typography sx={fontStyles.body}>
                                        We appreciate your contributions to the organization and wish you all the very best in your future endeavors.
                                    </Typography>
                                </Box>


                            </Box>

                            <Typography sx={{ mt: 4, mb: 4, fontSize: fontStyles.body, color: '#1e3a5f', fontWeight: 500 }}>
                                With Warm Regards,
                            </Typography>

                            {/* Signature Section */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    mt: 4,
                                    pt: 2,
                                    justifyContent: 'flex-start'
                                }}
                            >
                                <Box
                                    sx={{
                                        textAlign: 'left',
                                        width: '300px'
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
                                        {gmDetails?.employeeName || 'Authorized Signatory'}
                                    </Typography>

                                    <Typography sx={{ color: '#475569', fontSize: '0.95rem' }}>
                                        {gmDetails?.designation || 'General Manager'}
                                    </Typography>

                                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5 }}>
                                        {companyDetails?.companyName}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default RelievingLetter;