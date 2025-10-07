import React, { useState, useEffect } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import {
    Box, Card, CardContent, Typography, Grid, Button, useTheme,
    TextField, TableContainer, Paper, Table, TableHead, TableRow,
    TableCell, TableBody, IconButton, Chip, Select, MenuItem, useMediaQuery, Divider, Tabs, Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon,
    FormatListBulletedTwoTone as FormatListBulletedTwoToneIcon,
    Save as SaveIcon,
    CheckCircleOutline,
    CancelOutlined
} from '@mui/icons-material';

import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';

import MyDeclaration from './MyDeclaration/MyDeclaration';
import LacDeclaration from './MyDeclaration/LacDeclaration';
import TaxSavingAllowances from './MyDeclaration/TaxSavingAllowances';
import OtherDeductions from './MyDeclaration/OtherDeductions';
import HouseProperty from './MyDeclaration/HouseProperty';
import IncomeFromOtherSources from './MyDeclaration/IncomeFromOtherSources';

const Declaration = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const summaryCards = [
        {
            title: "Investment Declaration",
            endDate: "Till May 25, 2025",
            icon: <InsertChartIcon color="primary" />
        },
        {
            title: "Proof Submission",
            endDate: "Till Mar 15, 2026",
            icon: <CalendarTodayIcon color="primary" />
        }
    ];

    const financeSummary = [
        { title: "Net Taxable Income", amount: "INR", link: true },
        { title: "Total Tax Payable", amount: "INR 0" },
        { title: "Tax Already Paid", amount: "INR 0" }
    ];


    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [finYear] = useState('APR 2025 - MAR 2026');
    const orgId = parseInt(localStorage.getItem('orgId'));
    const createdBy = localStorage.getItem('userName');
    const branch = localStorage.getItem('branch') || '';
    const branchCode = localStorage.getItem('branchCode') || '';
    const department = localStorage.getItem('department') || '';
    const employeeCode = localStorage.getItem('employeeCode') || '';
    const employeeName = localStorage.getItem('userName') || '';

    // State for deductions data
    const [deductions, setDeductions] = useState([
        {
            id: 1,
            section: '80C',
            deductions: 'Life Insurance Premium',
            maxLimit: '150000',
            declaration: '',
            proof: '',
            status: 'Auto Accepted'
        }
    ]);

    // Function to handle input changes in deductions table
    const handleDeductionChange = (id, field, value) => {
        setDeductions(
            deductions.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // Function to handle status change
    const handleStatusChange = (id, status) => {
        setDeductions(
            deductions.map((item) =>
                item.id === id ? { ...item, status } : item
            )
        );
    };

    // Function to add new deduction row
    const handleAddRow = () => {
        const newRow = {
            id: Date.now(),
            section: '',
            deductions: '',
            maxLimit: '',
            declaration: '',
            proof: '',
            status: 'Auto Accepted'
        };
        setDeductions([...deductions, newRow]);
    };

    // Function to delete deduction row
    const handleDeleteRow = (id) => {
        if (deductions.length > 1) {
            setDeductions(deductions.filter(item => item.id !== id));
        }
    };

    // Function to clear all deductions
    const handleClear = () => {
        setDeductions([
            {
                id: 1,
                section: '80C',
                deductions: 'Life Insurance Premium',
                maxLimit: '150000',
                declaration: '',
                proof: '',
                status: 'Auto Accepted'
            }
        ]);
    };

    // Function to save deductions data
    const handleSaveDeductions = async () => {
        setIsLoading(true);

        // Validate that all declarations have values
        const hasEmptyDeclaration = deductions.some(d =>
            d.declaration === '' || d.declaration === null || d.declaration === undefined
        );

        if (hasEmptyDeclaration) {
            showToast('error', 'Please fill in all declaration amounts');
            setIsLoading(false);
            return;
        }

        const payload = {
            branch,
            branchCode,
            createdBy,
            department,
            employeeCode,
            employeeName,
            finYear: finYear.replace('APR ', '').replace(' - MAR', ''),
            oneCroreFiveLacDeductionsDTO: deductions.map(deduction => ({
                section: deduction.section,
                deductions: deduction.deductions,
                maxLimit: parseFloat(deduction.maxLimit) || 0,
                declaration: deduction.declaration.toString(),
                proof: deduction.proof,
                status: deduction.status
            })),
            otherDeclarationDTO: [],
            orgId
        };

        try {
            const response = await apiCalls(
                'put',
                '/managetax/createUpdateDeclaration',
                payload
            );

            if (response.status) {
                showToast('success', 'Deductions saved successfully');
            } else {
                showToast('error', response.message || 'Failed to save deductions');
            }
        } catch (error) {
            console.error('Error saving deductions:', error);
            showToast('error', 'Failed to save deductions');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle view toggle
    const handleView = () => setListView(!listView);

    // Calculate summary values
    const declaredAmount = deductions.reduce((sum, item) =>
        sum + parseFloat(item.declaration || 0), 0);

    const autoApprovedAmount = deductions.reduce((sum, item) =>
        item.status === 'Auto Accepted' ? sum + parseFloat(item.declaration || 0) : sum, 0);

    const acceptedAmount = deductions.reduce((sum, item) =>
        item.status === 'Accepted' ? sum + parseFloat(item.declaration || 0) : sum, 0);

    const rejectedAmount = deductions.reduce((sum, item) =>
        item.status === 'Rejected' ? sum + parseFloat(item.declaration || 0) : sum, 0);


    return (
        <>
            <Box px={{ xs: 2, sm: 3 }} py={3} bgcolor="#f9fbfc">
                {/* Header */}
                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    mb={3}
                    gap={2}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Declaration Summary
                    </Typography>
                    <Select defaultValue="APR 2025 - MAR 2026" size="small" variant="outlined">
                        <MenuItem value="APR 2025 - MAR 2026">APR 2025 - MAR 2026</MenuItem>
                    </Select>
                </Box>

                {/* Status Cards */}
                <Grid container spacing={2}>
                    {summaryCards.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: 4,
                                    transition: '0.3s',
                                    '&:hover': { boxShadow: 6 },
                                    background: `linear-gradient(to right, ${theme.palette.primary.light}, #fff)`
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {item.icon}
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {item.title}
                                            </Typography>
                                        </Box>
                                        <Chip label="OPEN" size="small" color="success" />
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="text.secondary">Current Window</Typography>
                                    <Typography variant="body2">{item.endDate}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {/* Finance Summary */}
                    {financeSummary.map((item, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <CurrencyRupeeIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" color="textSecondary">{item.title}</Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">{item.amount}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Tabs */}
            <Box sx={{ bgcolor: "#f9f9fb", px: { xs: 1, sm: 2 }, py: 1 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="declaration tabs"
                    TabIndicatorProps={{ style: { display: "none" } }}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            minWidth: 120,
                            fontWeight: 500,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: "#555",
                            py: 1,
                        },
                        "& .Mui-selected": {
                            backgroundColor: "#f3f0ff",
                            borderRadius: "8px",
                            color: "#000",
                        }
                    }}
                >
                    <Tab label="My Declarations" />
                    <Tab label="1.5 Lac Deductions" />
                    <Tab label="Other Deductions" />
                    <Tab label="Tax Saving Allowances" />
                    <Tab label="House Property" />
                    <Tab label="Income From Other Sources" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box mt={3} px={{ xs: 1, sm: 2 }}>
                {selectedTab === 0 && <MyDeclaration />}
                {selectedTab === 1 && <LacDeclaration />}
                {selectedTab === 2 && <OtherDeductions />}
                {selectedTab === 3 && <TaxSavingAllowances />}
                {selectedTab === 4 && <HouseProperty />}
                {selectedTab === 5 && <IncomeFromOtherSources />}
            </Box>
        </>
    );
};

export default Declaration;