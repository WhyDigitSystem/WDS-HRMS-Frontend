import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import KPIBox from 'utils/KPIBox';
import apiCalls from 'apicall';
import {
    MonetizationOn as MonetizationOnIcon,
    CheckCircle as CheckCircleIcon,
    HourglassTop as HourglassTopIcon,
    Cancel as CancelIcon,
    FlightTakeoff as FlightTakeoffIcon,
    Luggage as LuggageIcon,
    Schedule as ScheduleIcon,
    CurrencyRupee as CurrencyRupeeIcon
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as ReTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const STATUS_COLORS = ['#43a047', '#ffb300', '#e53935']; // Green, Amber, Red
const CATEGORY_COLORS = ['#1E88E5', '#3949AB', '#FB8C00', '#8E24AA', '#00ACC1'];

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: 2,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                }}
            >
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    ₹{payload[0].value.toLocaleString()}
                </Typography>
            </Box>
        );
    }
    return null;
};

const DashboardExpenseTravel = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summaryCounts, setSummaryCounts] = useState({});
    const [expenseStatusData, setExpenseStatusData] = useState([]);
    const [travelStatusData, setTravelStatusData] = useState([]);
    const [expenseByCategory, setExpenseByCategory] = useState([]);

    const orgId = localStorage.getItem('orgId');
    const employeeCode = localStorage.getItem('employeeCode');
    const branchCode = localStorage.getItem('branchCode');
    const year = new Date().getFullYear();
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        fetchKpiData();
        fetchExpenseGraphData();
    }, [month]);

    // ✅ Fetch KPI Data
    const fetchKpiData = async () => {
        setLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getExpenseCountByOrgId?branchCode=${branchCode}&employeeCode=${employeeCode}&month=${month}&orgId=${orgId}&year=${year}`
            );

            if (response.status && response.paramObjectsMap?.expenseClaimsVO?.length > 0) {
                const data = response.paramObjectsMap.expenseClaimsVO[0];

                setSummaryCounts({
                    expenseTotalCount: data.expenseTotalCount || 0,
                    expenseApproved: data.expenseApproved || 0,
                    expensePending: data.expensePending || 0,
                    expenseRejected: data.expenseRejected || 0,
                    travelTotalCount: data.travelTotalCount || 0,
                    travelApproved: data.travelApproved || 0,
                    travelPending: data.travelPending || 0,
                    travelRejected: data.travelRejected || 0,
                    expenseAmount: data.expenseAmount || 0,
                    travelAmount: data.travelAmount || 0
                });

                setExpenseStatusData([
                    { name: 'Approved', value: data.expenseApproved || 0 },
                    { name: 'Pending', value: data.expensePending || 0 },
                    { name: 'Rejected', value: data.expenseRejected || 0 }
                ]);

                setTravelStatusData([
                    { name: 'Approved', value: data.travelApproved || 0 },
                    { name: 'Pending', value: data.travelPending || 0 },
                    { name: 'Rejected', value: data.travelRejected || 0 }
                ]);
            } else {
                setError('No data found');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching KPI data');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch Expense Graph Data
    const fetchExpenseGraphData = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/assetmanagement/getExpenseGraphByOrgId?branchCode=${branchCode}&employeeCode=${employeeCode}&month=${month}&orgId=${orgId}&year=${year}`
            );

            if (response.status && response.paramObjectsMap?.graphData) {
                const monthKey = Object.keys(response.paramObjectsMap.graphData)[0];
                const categoryData = response.paramObjectsMap.graphData[monthKey] || [];
                setExpenseByCategory(categoryData);
            }
        } catch (err) {
            console.error('Error fetching graph data', err);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#fafafa', borderRadius: 2 }}>
            {/* HEADER */}
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Grid item>
                    <Typography variant="h6" fontWeight={600}>
                        Expense & Travel Overview ({year})
                    </Typography>
                </Grid>
                <Grid item>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Select Month</InputLabel>
                        <Select
                            value={month}
                            label="Select Month"
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            {MONTHS.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* KPI CARDS */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Total Expense Claims" count={summaryCounts.expenseTotalCount} color="#1976d2" icon={<MonetizationOnIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Approved Expense" count={summaryCounts.expenseApproved} color="#43a047" icon={<CheckCircleIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Pending Expense" count={summaryCounts.expensePending} color="#ffb300" icon={<HourglassTopIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Rejected Expense" count={summaryCounts.expenseRejected} color="#e53935" icon={<CancelIcon />} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Total Travel Requests" count={summaryCounts.travelTotalCount} color="#3f51b5" icon={<FlightTakeoffIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Approved Travels" count={summaryCounts.travelApproved} color="#4caf50" icon={<LuggageIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Pending Travels" count={summaryCounts.travelPending} color="#ff9800" icon={<ScheduleIcon />} />
                </Grid>
                {/* <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Rejected Travels" count={summaryCounts.travelRejected} color="#f44336" icon={<CancelIcon />} />
                </Grid> */}
                <Grid item xs={12} sm={6} md={3}>
                    <KPIBox label="Total Amount Spent" count={summaryCounts.expenseAmount + summaryCounts.travelAmount} color="#9c27b0" icon={<CurrencyRupeeIcon />} />
                </Grid>
            </Grid>

            {/* PIE CHARTS */}
            {/* <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Expense Claim Status
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={expenseStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {expenseStatusData.map((entry, index) => (
                                        <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Travel Request Status
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={travelStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {travelStatusData.map((entry, index) => (
                                        <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid> */}

            {/* BAR CHART (Expense by Category) */}
            <Grid item xs={12} md={6}>
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
                        background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Expense by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={expenseByCategory} barSize={40}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey="category"
                                axisLine={false}
                                tickLine={false}
                                style={{ fontSize: '13px', fill: '#616161' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                style={{ fontSize: '13px', fill: '#616161' }}
                            />
                            <ReTooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar radius={[8, 8, 0, 0]} dataKey="amount">
                                {expenseByCategory.map((entry, index) => (
                                    <Cell key={`bar-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Box>
    );
};

export default DashboardExpenseTravel;
