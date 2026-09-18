// src/components/AdvancedOfferLetterSystem/tabs/Preview.js
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Divider,
    Button,
    Stack,
    Card,
    CardContent,
    TextField,
    CircularProgress,
    Alert,
    Autocomplete
} from '@mui/material';
import { Print, Download, Share, Description } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import apiCalls from 'apicall';
import dayjs from 'dayjs';

const Preview = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
    const [offerData, setOfferData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [error, setError] = useState('');
    const offerLetterRef = useRef();
    const annexureRef = useRef();

    useEffect(() => {
        getCandidates();
    }, []);

    const getOfferData = async (candidateName) => {
        if (!candidateName) {
            setOfferData(null);
            return;
        }
        try {
            setLoading(true);
            setError('');

            const response = await apiCalls(
                'get',
                `recruitmentmanagement/getApprovedCreateOfferByCompany?branchCode=WDSBLR&candidateName=${encodeURIComponent(candidateName)}&orgId=${orgId}`
            );

            if (response.status === true &&
                response.paramObjectsMap?.createOfferVO?.length > 0) {

                setOfferData(response.paramObjectsMap.createOfferVO[0]);

            } else {
                console.error('API Error:', response);
                setOfferData(null);
                setError('No approved offer found for this candidate');
            }
        } catch (error) {
            console.error('Error fetching offer data:', error);
            setOfferData(null);
            setError('Failed to load offer data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCandidates = async () => {
        try {
            setLoading(true);
            const response = await apiCalls(
                'get',
                `recruitmentmanagement/getCandidatesByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response.status === true) {
                setCandidates(response.paramObjectsMap.candidatesVO || []);
            } else {
                console.error('API Error:', response);
                setCandidates([]);
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCandidateChange = (event) => {
        const candidateName = event.target.value;
        setSelectedCandidate(candidateName);
        getOfferData(candidateName);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        // Try parsing flexible formats
        const parsedDate = dayjs(dateString, ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY'], true);

        if (!parsedDate.isValid()) return 'N/A';

        return parsedDate.format('DD MMMM YYYY'); // Example: 08 November 2025
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateTotalCTC = (compensationDetails) => {
        if (!compensationDetails) return 0;
        return compensationDetails.reduce((total, comp) => total + (comp.amount || 0), 0);
    };

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 200);
    };

    // Improved PDF Download Function
    const downloadPDF = async () => {
        if (!offerLetterRef.current || !annexureRef.current) {
            setError("No content available to download");
            return;
        }

        setPdfLoading(true);
        setError("");

        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = 210; // A4 width
            const pageHeight = 297; // A4 height

            // Render HTML section to canvas correctly
            const generateCanvas = async (element) => {
                return await html2canvas(element, {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    width: element.scrollWidth,
                });
            };

            // Add section to PDF, auto-split into multiple pages
            const addToPDF = (canvas) => {
                const imgData = canvas.toDataURL("image/png", 1.0);
                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    pdf.addPage();
                    position = heightLeft - imgHeight;
                    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
            };

            // Generate Offer Letter
            const offerCanvas = await generateCanvas(offerLetterRef.current);
            addToPDF(offerCanvas);

            // Generate Annexure (always new page)
            pdf.addPage();
            const annexureCanvas = await generateCanvas(annexureRef.current);
            addToPDF(annexureCanvas);

            pdf.save(
                `Offer_Letter_${offerData.candidatename?.replace(/\s+/g, "_")}_${Date.now()}.pdf`
            );
        } catch (error) {
            console.error("PDF ERROR:", error);
            setError("PDF generation failed. Try again.");
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
    @media print {
        /* Reset all visibility first */
        body * {
            visibility: hidden !important;
        }

        /* Show only the print area */
        #print-area, #print-area * {
            visibility: visible !important;
        }

        /* Position the print area properly */
        #print-area {
            position: absolute !important;
            padding: '10px' !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
        }

        /* Ensure each component takes exactly one page */
        .offer-letter-content {
            height: 100vh !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-after: page !important;
        }

        /* Specifically target the annexure to always start on new page */
        #annexurePage {
            page-break-before: always !important;
            break-before: page !important;
        }

        /* Remove any margins/padding that might cause extra pages */
        .MuiPaper-root, .MuiBox-root, .MuiCardContent-root {
            margin: 0 !important;
            padding: 4 !important;
            box-shadow: none !important;
        }

        /* Ensure tables don't break across pages */
        table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        /* Page setup */
        @page {
            size: A4 portrait;
            margin: 15mm;
        }

        @page :first {
            margin: 15mm;
        }
    }

    /* Screen styles for better PDF generation */
    @media screen {
        .offer-letter-content {
            min-height: 297mm; /* A4 height */
            box-sizing: border-box;
        }
    }
`}
            </style>
            <Box sx={{ p: 3 }}>
                {/* Header Actions */}
                <Card sx={{ mb: 3, backgroundColor: '#f8fafc' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>

                            {/* Candidate Selection */}
                            <Box sx={{ minWidth: 300 }}>
                                <Autocomplete
                                    options={candidates}
                                    getOptionLabel={(option) => option.candidatesName || ''}
                                    value={
                                        candidates.find((c) => c.candidatesName === selectedCandidate) || null
                                    }
                                    onChange={(event, newValue) => {
                                        handleCandidateChange({
                                            target: { value: newValue ? newValue.candidatesName : '' },
                                        });
                                    }}
                                    loading={loading}
                                    clearOnEscape
                                    disableClearable={false}
                                    size="small"
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <Typography sx={{ fontWeight: 500 }}>{`${option.candidatesName}-${option.candidateId}`}</Typography>
                                        </Box>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Candidate"
                                            placeholder="Start typing to search..."
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Box>

                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Print />}
                                    disabled={!offerData}
                                    onClick={handlePrint}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        px: 3,
                                        borderColor: '#cbd5e1',
                                        color: '#475569'
                                    }}
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Download />}
                                    disabled={!offerData || pdfLoading}
                                    onClick={downloadPDF} // Using alternative method
                                    // onClick={downloadPDFAlternative} // Using alternative method
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        px: 3,
                                        backgroundColor: '#2563eb',
                                        '&:hover': {
                                            backgroundColor: '#1d4ed8'
                                        }
                                    }}
                                >
                                    {pdfLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Download PDF'}
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error State */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* No Candidate Selected */}
                {!selectedCandidate && !loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Description sx={{ fontSize: 64, color: '#e2e8f0', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                            Select a Candidate
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                            Choose a candidate from the dropdown to preview their offer letter
                        </Typography>
                    </Box>
                )}

                {/* Offer Letter Document */}
                {offerData && !loading && (
                    <>
                        <div id="print-area">
                            {/* Main Offer Letter */}
                            <Paper
                                ref={offerLetterRef}
                                elevation={0}
                                sx={{
                                    maxWidth: 800,
                                    margin: '0 auto',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    mb: 3,
                                    minHeight: '297mm',
                                    boxSizing: 'border-box'
                                }}
                                className="offer-letter-content"
                            >
                                {/* Document Header with Company Logo */}
                                <Box
                                    sx={{
                                        backgroundColor: '#ffffff',
                                        color: 'black',
                                        py: 3,
                                        px: 4,
                                        borderBottom: '2px solid #f1f5f9'
                                    }}
                                >
                                    {/* LOGO + COMPANY NAME IN ONE ROW */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',   // Centers the whole block
                                            gap: 2
                                        }}
                                    >
                                        {/* LOGO LEFT */}
                                        {offerData.companyDetails?.companylogo && (
                                            <Box sx={{ flexShrink: 0 }}>
                                                <img
                                                    src={`data:image/png;base64,${offerData.companyDetails.companylogo}`}
                                                    alt="Company Logo"
                                                    style={{
                                                        maxHeight: '45px',
                                                        maxWidth: '120px',
                                                        objectFit: 'contain'
                                                    }}
                                                    onError={(e) => (e.target.style.display = 'none')}
                                                />
                                            </Box>
                                        )}

                                        {/* COMPANY NAME CENTERED */}
                                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '1.4rem',
                                                    color: '#1a202c',
                                                }}
                                            >
                                                {offerData.companyDetails?.companyname || ''}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* ADDRESS BELOW FULL WIDTH CENTERED */}
                                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: '0.9rem',
                                                letterSpacing: 0.3,
                                                color: '#4a5568'
                                            }}
                                        >
                                            {offerData.companyDetails?.address || ''}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Document Content */}
                                <Box sx={{ p: 6, pt: 2 }}>
                                    {/* Professional Offer Title */}
                                    <Box sx={{ textAlign: 'center', mb: 0, pt: 0 }}>
                                        <Box sx={{
                                            display: 'inline-block',
                                            pb: 1,
                                            mb: 0
                                        }}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#1a202c',
                                                    fontSize: '1.2rem',
                                                    letterSpacing: 1,
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                Letter of Employment
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#4a5568',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Date: {getCurrentDate()}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

                                    {/* Recipient Information */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{
                                            mb: 1,
                                            color: '#4a5568'
                                        }}>
                                            To:
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 600,
                                            color: '#1a202c',
                                            mb: 1,
                                            fontSize: '1.1rem'
                                        }}>
                                            {offerData.candidatename}
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#4a5568'
                                        }}>
                                            {offerData.position}
                                        </Typography>
                                    </Box>

                                    {/* Letter Content */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{
                                            mb: 2,
                                            lineHeight: 1.8,
                                            color: '#2d3748',
                                            fontSize: '0.95rem'
                                        }}>
                                            Dear <strong style={{ color: '#1a202c' }}>{offerData.candidatename?.split(' ')[0]}</strong>,
                                        </Typography>

                                        <Typography variant="body1" sx={{
                                            mb: 2,
                                            lineHeight: 1.8,
                                            color: '#2d3748',
                                            fontSize: '0.95rem'
                                        }}>
                                            We are delighted to extend this formal offer of employment for the position of{' '}
                                            <strong style={{ color: '#1a202c' }}>{offerData.position}</strong> in our{' '}
                                            <strong style={{ color: '#1a202c' }}>{offerData.department}</strong> department at{' '}
                                            <strong style={{ color: '#1a202c' }}>{offerData.companyDetails?.companyname || 'TechCorp Solutions Private Limited'}</strong>.
                                        </Typography>

                                        <Typography variant="body1" sx={{
                                            mb: 2,
                                            lineHeight: 1.8,
                                            color: '#2d3748',
                                            fontSize: '0.95rem'
                                        }}>
                                            Your employment is scheduled to commence on{' '}
                                            <strong style={{ color: '#1a202c' }}>{formatDate(offerData.joiningdate)}</strong>. You will report directly to{' '}
                                            <strong style={{ color: '#1a202c' }}>{offerData.reportingperson}</strong> and will be based at our{' '}
                                            <strong style={{ color: '#1a202c' }}>{offerData.worklocation}</strong> office location.
                                        </Typography>

                                        {/* Employment Terms Card */}
                                        <Card variant="outlined" sx={{
                                            mb: 2,
                                            borderColor: '#e2e8f0',
                                            backgroundColor: '#f8fafc',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 600,
                                                    mb: 3,
                                                    color: '#1a202c',
                                                    fontSize: '1rem'
                                                }}>
                                                    EMPLOYMENT TERMS & CONDITIONS
                                                </Typography>
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                                                    gap: 3
                                                }}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{
                                                            color: '#4a5568',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            PROBATION PERIOD
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            fontWeight: 600,
                                                            color: '#1a202c',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {offerData.probationperiod} Months
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{
                                                            color: '#4a5568',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            NOTICE PERIOD
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            fontWeight: 600,
                                                            color: '#1a202c',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {offerData.noticeperiod}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{
                                                            color: '#4a5568',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            WORKING HOURS
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            fontWeight: 600,
                                                            color: '#1a202c',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {offerData.workhours}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        <Typography variant="body1" sx={{
                                            mb: 2,
                                            lineHeight: 1.8,
                                            color: '#2d3748',
                                            fontSize: '0.95rem'
                                        }}>
                                            Your comprehensive compensation package and benefits details are provided in{' '}
                                            <strong style={{ color: '#1a202c' }}>Annexure A</strong> attached to this letter.
                                        </Typography>

                                        <Typography variant="body1" sx={{
                                            color: '#2d3748',
                                            fontSize: '0.95rem'
                                        }}>
                                            Kindly confirm your acceptance of this employment offer by signing and returning a copy of this document on or before{' '}
                                            <strong style={{ color: '#1a202c' }}>{formatDate(offerData.joiningdate)}</strong>.
                                        </Typography>
                                    </Box>

                                    <Typography variant="body1" sx={{
                                        mb: 2,
                                        lineHeight: 1.8,
                                        color: '#2d3748',
                                        fontStyle: 'italic',
                                        fontSize: '0.95rem'
                                    }}>
                                        We are excited about the prospect of you joining our team and look forward to your valuable contributions to {offerData.companyDetails?.companyname || 'TechCorp'}'s success.
                                    </Typography>

                                    <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

                                    {/* Signatures */}
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                        gap: 6,
                                        mb: 2
                                    }}>
                                        {/* Company Signature */}
                                        <Box>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                                color: '#1a202c',
                                                fontSize: '0.95rem'
                                            }}>
                                                For {offerData.companyDetails?.companyname || 'TechCorp Solutions'}
                                            </Typography>
                                            <Box sx={{ borderBottom: '1px solid #cbd5e1', pb: 1, mb: 1 }}>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 600,
                                                    color: '#1a202c',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {offerData.reportingperson}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{
                                                color: '#4a5568',
                                                mb: 0.5,
                                                fontSize: '0.8rem'
                                            }}>
                                                Reporting Manager
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#4a5568',
                                                mb: 0.5,
                                                fontSize: '0.8rem'
                                            }}>
                                                {offerData.companyDetails?.companyname || 'TechCorp Solutions Pvt Ltd'}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#4a5568',
                                                mb: 0.5,
                                                fontSize: '0.8rem'
                                            }}>
                                                {offerData.reportingemail}
                                            </Typography>
                                        </Box>

                                        {/* Candidate Signature */}
                                        <Box>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                                color: '#1a202c',
                                                fontSize: '0.95rem'
                                            }}>
                                                Candidate Acceptance
                                            </Typography>
                                            <Box sx={{ borderBottom: '1px solid #cbd5e1', pb: 1, mb: 1 }}>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 600,
                                                    color: '#1a202c',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {offerData.candidatename}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{
                                                color: '#4a5568',
                                                mb: 0.5,
                                                fontSize: '0.8rem'
                                            }}>
                                                {offerData.position}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#4a5568',
                                                fontSize: '0.8rem'
                                            }}>
                                                Date: ___________________
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Annexure A - Separate Component for PDF */}
                            <Paper
                                ref={annexureRef}
                                id="annexurePage"
                                elevation={0}
                                sx={{
                                    maxWidth: 800,
                                    margin: '0 auto',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    minHeight: '297mm', // A4 height for screen
                                    boxSizing: 'border-box'
                                }}
                                className="offer-letter-content"
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <Description sx={{ fontSize: 40, color: '#2563eb', mb: 2 }} />
                                        <Typography variant="h5" sx={{
                                            fontWeight: 700,
                                            color: '#1a202c',
                                            mb: 1,
                                            fontSize: '1.25rem'
                                        }}>
                                            ANNEXURE A
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            color: '#4a5568',
                                            fontSize: '0.9rem'
                                        }}>
                                            Compensation & Benefits Details
                                        </Typography>
                                    </Box>

                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        mb: 2,
                                        color: '#1a202c',
                                        fontSize: '1rem'
                                    }}>
                                        Cost to Company (CTC) Breakdown
                                    </Typography>

                                    {/* Compensation Table */}
                                    <TableContainer>
                                        <Table sx={{ border: '1px solid #e2e8f0' }}>
                                            <TableBody>
                                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                                    <TableCell sx={{
                                                        fontWeight: 700,
                                                        color: '#1a202c',
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        COMPONENT
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        fontWeight: 700,
                                                        color: '#1a202c',
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        ANNUAL (₹)
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        fontWeight: 700,
                                                        color: '#1a202c',
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        MONTHLY (₹)
                                                    </TableCell>
                                                </TableRow>
                                                {offerData.compensationDetails?.map((comp, index) => (
                                                    <TableRow key={comp.compensationdetailsid || index}>
                                                        <TableCell sx={{
                                                            borderColor: '#e2e8f0',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            {comp.componenttype}
                                                        </TableCell>
                                                        <TableCell sx={{
                                                            borderColor: '#e2e8f0',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            ₹{(comp.amount * 12).toLocaleString('en-IN')}
                                                        </TableCell>
                                                        <TableCell sx={{
                                                            borderColor: '#e2e8f0',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            ₹{comp.amount.toLocaleString('en-IN')}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                                                    <TableCell sx={{
                                                        fontWeight: 700,
                                                        borderColor: '#e2e8f0',
                                                        color: '#059669',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        TOTAL CTC
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        fontWeight: 700,
                                                        borderColor: '#e2e8f0',
                                                        color: '#059669',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        ₹{(calculateTotalCTC(offerData.compensationDetails) * 12).toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        fontWeight: 700,
                                                        borderColor: '#e2e8f0',
                                                        color: '#059669',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        ₹{calculateTotalCTC(offerData.compensationDetails).toLocaleString('en-IN')}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {/* Document Footer */}
                                    <Box sx={{
                                        mt: 6,
                                        pt: 4,
                                        borderTop: '1px solid #e2e8f0',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="caption" sx={{
                                            color: '#4a5568',
                                            fontSize: '0.7rem'
                                        }}>
                                            {offerData.companyDetails?.companyname || 'TechCorp Solutions Private Limited'} • {offerData.companyDetails?.address || 'Tower A, Tech Park, Electronic City, Bangalore 560001'} • {offerData.companyDetails?.website || 'www.techcorp.com'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Paper>
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};

export default Preview;