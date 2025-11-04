import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Grid,
    Card,
    CardContent,
    alpha,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    BusinessCenter,
    CheckCircle,
    Schedule,
    TrendingUp,
    Person,
    Refresh,
    Visibility
} from '@mui/icons-material';
import KPIBox from 'utils/KPIBox';
import apiCalls from 'apicall';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const DashboardExpenseTravel = ({ onReturnAsset, onShowAllocation, config }) => {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [loading, setLoading] = useState(true);
    const [listLoading, setListLoading] = useState(true);
    const [error, setError] = useState(null);
    const [listError, setListError] = useState(null);

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };
    const [summaryCounts, setSummaryCounts] = useState({
        totalClaims: 0,
        pending: 0,
        approved: 0,
        totalAmount: 0
    });
    const getKPIDetails = async () => {
        try {
            const response = await apiCalls('get', `/transaction/getLeadcount?branchCode=`);
            if (response.status === true) {
                const quality = response.paramObjectsMap.leadCounts[0];
                setSummaryCounts({
                    totalClaims: quality.totalClaims || 0,
                    pending: quality.pending || 0,
                    approved: quality.approved || 0,
                    totalAmount: quality.totalAmount || 0
                });
            } else {
                summaryCounts([]);
            }
            // setIsLoading(false);
        } catch (error) {
            console.error('Error fetching leads:', error);
            showSnackbar('error', 'Failed to fetch leads');
            // setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2}>
                {/* Total Claims */}
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox
                        label="Total Claims"
                        count={summaryCounts.totalClaims}
                        color="#1976d2" // Blue
                        icon={<SummarizeIcon />} // Summary / total representation
                    />
                </Grid>

                {/* Pending */}
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox
                        label="Pending"
                        count={summaryCounts.pending}
                        color="#ffb300" // Amber/yellow for 'waiting' status
                        icon={<HourglassTopIcon />} // Symbolizes pending/in progress
                    />
                </Grid>

                {/* Approved */}
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox
                        label="Approved"
                        count={summaryCounts.approved}
                        color="#4caf50" // Green for success
                        icon={<CheckCircleIcon />} // Approval/verified
                    />
                </Grid>

                {/* Total Amount */}
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox
                        label="Total Amount"
                        count={summaryCounts.totalAmount}
                        color="#9c27b0" // Purple for financial totals
                        icon={<CurrencyRupeeIcon  />} // Currency/amount icon
                    />
                </Grid>
            </Grid>

        </Box>
    );
};

export default DashboardExpenseTravel;