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
    const [error, setError] = useState('');
    const offerLetterRef = useRef();

    useEffect(() => {
        getCandidates();
    }, []);

    // Fetch offer data when candidate is selected
    const fetchOfferData = async (candidateName) => {
        if (!candidateName) {
            setOfferData(null);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `http://192.168.68.135:8047/api/recruitmentmanagement/getApprovedCreateOfferByCompany?branchCode=WDSBLR&candidateName=${encodeURIComponent(candidateName)}&orgId=1000000001`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch offer data');
            }

            const data = await response.json();

            if (data.status && data.paramObjectsMap && data.paramObjectsMap.createOfferVO && data.paramObjectsMap.createOfferVO.length > 0) {
                setOfferData(data.paramObjectsMap.createOfferVO[0]);
            } else {
                setOfferData(null);
                setError('No approved offer found for this candidate');
            }
        } catch (err) {
            setError('Failed to load offer data. Please try again.');
            console.error('Error fetching offer data:', err);
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
        fetchOfferData(candidateName);
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

    // PDF Download Function
    const downloadPDF = async () => {
        if (!offerLetterRef.current) return;

        setLoading(true);
        try {
            const element = offerLetterRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `Offer_Letter_${offerData.candidatename?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Actions */}
            <Card sx={{ mb: 3, backgroundColor: '#f8fafc' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>

                        {/* Candidate Selection */}
                        <Box sx={{ minWidth: 300 }}>
                            <Autocomplete
                                options={candidates}
                                getOptionLabel={(option) => option.candidatesName || ''} // ✅ Correct property
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
                                        <Typography sx={{ fontWeight: 500 }}>{option.candidatesName}</Typography>
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
                                disabled={!offerData || loading}
                                onClick={downloadPDF}
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
                                {loading ? 'Generating...' : 'Download PDF'}
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
                <Alert severity="error" sx={{ mb: 3 }}>
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
                <Paper
                    ref={offerLetterRef}
                    elevation={0}
                    sx={{
                        maxWidth: 800,
                        margin: '0 auto',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    {/* Document Header with Company Logo */}
                    <Box sx={{
                        backgroundColor: '#ffffff',
                        color: 'black',
                        py: 2,
                        px: 6,
                        textAlign: 'center',
                        borderBottom: '2px solid #f1f5f9'
                    }}>
                        {offerData.companyDetails?.companylogo && (
                            <Box sx={{ mb: 0 }}>
                                <img
                                    src={`data:image/png;base64,${offerData.companyDetails.companylogo}`}
                                    alt="Company Logo"
                                    style={{
                                        maxHeight: '70px',
                                        maxWidth: '220px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        )}
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.75rem',
                                letterSpacing: 1,
                                mb: 0,
                                color: '#1a202c',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}
                        >
                            {offerData.companyDetails?.companyname || ''}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontSize: '0.8rem',
                                letterSpacing: 0.3,
                                color: '#4a5568',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}
                        >
                            {offerData.companyDetails?.address || ''}
                        </Typography>
                    </Box>

                    {/* Document Content */}
                    <Box sx={{ p: 6, pt: 2 }}>
                        {/* Professional Offer Title */}
                        <Box sx={{ textAlign: 'center', mb: 0, pt: 0 }}>
                            <Box sx={{
                                display: 'inline-block',
                                borderBottom: '3px solid #2563eb',
                                pb: 1,
                                mb: 1
                            }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#1a202c',
                                        fontSize: '1.5rem',
                                        letterSpacing: 1,
                                        fontFamily: '"Times New Roman", Times, serif',
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
                                    fontSize: '0.85rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}
                            >
                                Date: {getCurrentDate()}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

                        {/* Recipient Information */}
                        <Box sx={{ mb: 5 }}>
                            <Typography variant="body1" sx={{
                                mb: 1,
                                color: '#4a5568',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}>
                                To:
                            </Typography>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#1a202c',
                                mb: 1,
                                fontSize: '1.1rem',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}>
                                {offerData.candidatename}
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: '#4a5568',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}>
                                {offerData.position} Candidate
                            </Typography>
                        </Box>

                        {/* Letter Content */}
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="body1" sx={{
                                mb: 2,
                                lineHeight: 1.8,
                                color: '#2d3748',
                                fontSize: '0.95rem',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}>
                                Dear <strong style={{ color: '#1a202c' }}>{offerData.candidatename?.split(' ')[0]}</strong>,
                            </Typography>

                            <Typography variant="body1" sx={{
                                mb: 2,
                                lineHeight: 1.8,
                                color: '#2d3748',
                                fontSize: '0.95rem',
                                fontFamily: '"Times New Roman", Times, serif'
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
                                fontSize: '0.95rem',
                                fontFamily: '"Times New Roman", Times, serif'
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
                                        fontSize: '1rem',
                                        fontFamily: '"Times New Roman", Times, serif'
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
                                                fontSize: '0.75rem',
                                                fontFamily: '"Times New Roman", Times, serif'
                                            }}>
                                                PROBATION PERIOD
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                fontWeight: 600,
                                                color: '#1a202c',
                                                fontSize: '0.9rem',
                                                fontFamily: '"Times New Roman", Times, serif'
                                            }}>
                                                {offerData.probationperiod} Months
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#4a5568',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                fontFamily: '"Times New Roman", Times, serif'
                                            }}>
                                                NOTICE PERIOD
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                fontWeight: 600,
                                                color: '#1a202c',
                                                fontSize: '0.9rem',
                                                fontFamily: '"Times New Roman", Times, serif'
                                            }}>
                                                {offerData.noticeperiod}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#4a5568',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                fontFamily: '"Times New Roman", Times, serif'
                                            }}>
                                                WORKING HOURS
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                fontWeight: 600,
                                                color: '#1a202c',
                                                fontSize: '0.9rem',
                                                fontFamily: '"Times New Roman", Times, serif'
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
                                fontSize: '0.95rem',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}>
                                Your comprehensive compensation package and benefits details are provided in{' '}
                                <strong style={{ color: '#1a202c' }}>Annexure A</strong> attached to this letter.
                            </Typography>

                            <Typography variant="body1" sx={{
                                color: '#2d3748',
                                fontSize: '0.95rem',
                                fontFamily: '"Times New Roman", Times, serif'
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
                            fontSize: '0.95rem',
                            fontFamily: '"Times New Roman", Times, serif'
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
                                    mb: 2,
                                    color: '#1a202c',
                                    fontSize: '0.95rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}>
                                    For {offerData.companyDetails?.companyname || 'TechCorp Solutions'}
                                </Typography>
                                <Box sx={{ borderBottom: '1px solid #cbd5e1', pb: 1, mb: 1 }}>
                                    <Typography variant="body1" sx={{
                                        fontWeight: 600,
                                        color: '#1a202c',
                                        fontSize: '0.9rem',
                                        fontFamily: '"Times New Roman", Times, serif'
                                    }}>
                                        {offerData.reportingperson}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{
                                    color: '#4a5568',
                                    mb: 0.5,
                                    fontSize: '0.8rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}>
                                    Reporting Manager
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#4a5568',
                                    mb: 0.5,
                                    fontSize: '0.8rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}>
                                    {offerData.companyDetails?.companyname || 'TechCorp Solutions Pvt Ltd'}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#4a5568',
                                    mb: 0.5,
                                    fontSize: '0.8rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}>
                                    {offerData.reportingemail}
                                </Typography>
                            </Box>

                            {/* Candidate Signature */}
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    mb: 2,
                                    color: '#1a202c',
                                    fontSize: '0.95rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}>
                                    Candidate Acceptance
                                </Typography>
                                <Box sx={{ borderBottom: '1px solid #cbd5e1', pb: 1, mb: 1 }}>
                                    <Typography variant="body1" sx={{
                                        fontWeight: 600,
                                        color: '#1a202c',
                                        fontSize: '0.9rem',
                                        fontFamily: '"Times New Roman", Times, serif'
                                    }}>
                                        {offerData.candidatename}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{
                                    color: '#4a5568',
                                    mb: 0.5,
                                    fontSize: '0.8rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}>
                                    {offerData.position}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#4a5568',
                                    fontSize: '0.8rem',
                                    fontFamily: '"Times New Roman", Times, serif'
                                }}>
                                    Date: ___________________
                                </Typography>
                            </Box>
                        </Box>

                        {/* Annexure A */}
                        <Card sx={{
                            mt: 3,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Description sx={{ fontSize: 40, color: '#2563eb', mb: 2 }} />
                                    <Typography variant="h5" sx={{
                                        fontWeight: 700,
                                        color: '#1a202c',
                                        mb: 1,
                                        fontSize: '1.25rem',
                                        fontFamily: '"Times New Roman", Times, serif'
                                    }}>
                                        ANNEXURE A
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        color: '#4a5568',
                                        fontSize: '0.9rem',
                                        fontFamily: '"Times New Roman", Times, serif'
                                    }}>
                                        Compensation & Benefits Details
                                    </Typography>
                                </Box>

                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    mb: 2,
                                    color: '#1a202c',
                                    fontSize: '1rem',
                                    fontFamily: '"Times New Roman", Times, serif'
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
                                                    fontSize: '0.8rem',
                                                    fontFamily: '"Times New Roman", Times, serif'
                                                }}>
                                                    COMPONENT
                                                </TableCell>
                                                <TableCell sx={{
                                                    fontWeight: 700,
                                                    color: '#1a202c',
                                                    borderColor: '#e2e8f0',
                                                    fontSize: '0.8rem',
                                                    fontFamily: '"Times New Roman", Times, serif'
                                                }}>
                                                    ANNUAL (₹)
                                                </TableCell>
                                                <TableCell sx={{
                                                    fontWeight: 700,
                                                    color: '#1a202c',
                                                    borderColor: '#e2e8f0',
                                                    fontSize: '0.8rem',
                                                    fontFamily: '"Times New Roman", Times, serif'
                                                }}>
                                                    MONTHLY (₹)
                                                </TableCell>
                                            </TableRow>
                                            {offerData.compensationDetails?.map((comp, index) => (
                                                <TableRow key={comp.compensationdetailsid || index}>
                                                    <TableCell sx={{
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.8rem',
                                                        fontFamily: '"Times New Roman", Times, serif'
                                                    }}>
                                                        {comp.componenttype}
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.8rem',
                                                        fontFamily: '"Times New Roman", Times, serif'
                                                    }}>
                                                        ₹{(comp.amount * 12).toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.8rem',
                                                        fontFamily: '"Times New Roman", Times, serif'
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
                                                    fontSize: '0.85rem',
                                                    fontFamily: '"Times New Roman", Times, serif'
                                                }}>
                                                    TOTAL CTC
                                                </TableCell>
                                                <TableCell sx={{
                                                    fontWeight: 700,
                                                    borderColor: '#e2e8f0',
                                                    color: '#059669',
                                                    fontSize: '0.85rem',
                                                    fontFamily: '"Times New Roman", Times, serif'
                                                }}>
                                                    ₹{(calculateTotalCTC(offerData.compensationDetails) * 12).toLocaleString('en-IN')}
                                                </TableCell>
                                                <TableCell sx={{
                                                    fontWeight: 700,
                                                    borderColor: '#e2e8f0',
                                                    color: '#059669',
                                                    fontSize: '0.85rem',
                                                    fontFamily: '"Times New Roman", Times, serif'
                                                }}>
                                                    ₹{calculateTotalCTC(offerData.compensationDetails).toLocaleString('en-IN')}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box sx={{
                                    mt: 3,
                                    p: 2,
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: 2,
                                    border: '1px solid #bae6fd'
                                }}>
                                    <Typography variant="body2" sx={{
                                        color: '#0369a1',
                                        fontStyle: 'italic',
                                        fontSize: '0.75rem',
                                        fontFamily: '"Times New Roman", Times, serif'
                                    }}>
                                        Note: The compensation structure outlined above is subject to statutory deductions and compliance with applicable tax regulations as per the Income Tax Act, 1961.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Document Footer */}
                        <Box sx={{
                            mt: 6,
                            pt: 4,
                            borderTop: '1px solid #e2e8f0',
                            textAlign: 'center'
                        }}>
                            <Typography variant="caption" sx={{
                                color: '#4a5568',
                                fontSize: '0.7rem',
                                fontFamily: '"Times New Roman", Times, serif'
                            }}>
                                {offerData.companyDetails?.companyname || 'TechCorp Solutions Private Limited'} • {offerData.companyDetails?.address || 'Tower A, Tech Park, Electronic City, Bangalore 560001'} • {offerData.companyDetails?.website || 'www.techcorp.com'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default Preview;