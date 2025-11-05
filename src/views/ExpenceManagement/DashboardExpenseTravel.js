import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import KPIBox from 'utils/KPIBox';
import apiCalls from 'apicall';
import {
    MonetizationOn as MonetizationOnIcon,
    CheckCircle as CheckCircleIcon,
    HourglassTop as HourglassTopIcon,
    FlightTakeoff as FlightTakeoffIcon,
    Luggage as LuggageIcon,
    Schedule as ScheduleIcon,
    CurrencyRupee as CurrencyRupeeIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = ['#4caf50', '#ffb300', '#f44336'];
const CATEGORY_COLORS = ['#2196f3', '#3f51b5', '#ff9800', '#9c27b0', '#00bcd4'];

const DashboardExpenseTravel = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [summaryCounts, setSummaryCounts] = useState({});
    const [expenseStatusData, setExpenseStatusData] = useState([]);
    const [travelStatusData, setTravelStatusData] = useState([]);
    const [monthlyTrendData, setMonthlyTrendData] = useState([]);
    const [recentExpenseClaims, setRecentExpenseClaims] = useState([]);
    const [recentTravelRequests, setRecentTravelRequests] = useState([]);
    const [expenseByCategory, setExpenseByCategory] = useState([]);
    const [topSpenders, setTopSpenders] = useState([]);

    const [orgId] = useState(localStorage.getItem('orgId'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));
    const [branchCode] = useState(localStorage.getItem('branchCode'));

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState([]);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogLoading, setDialogLoading] = useState(false);
    const [dialogTab, setDialogTab] = useState(0);

    useEffect(() => {
        // fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await apiCalls('get', `/assetmanagement/getDashboardData?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`);
            if (response.status) {
                const data = response.paramObjectsMap.dashboardVO;
                setSummaryCounts({
                    totalExpenseClaims: data.expenseClaims.total || 0,
                    approvedClaims: data.expenseClaims.approved || 0,
                    pendingClaims: data.expenseClaims.pending || 0,
                    totalTravelRequests: data.travelRequests.total || 0,
                    approvedTravels: data.travelRequests.approved || 0,
                    pendingTravels: data.travelRequests.pending || 0,
                    totalAmountSpent: data.expenseClaims.totalAmount || 0
                });
                setExpenseStatusData([
                    { name: 'Approved', value: data.expenseClaims.approved || 0 },
                    { name: 'Pending', value: data.expenseClaims.pending || 0 },
                    { name: 'Rejected', value: data.expenseClaims.rejected || 0 }
                ]);
                setTravelStatusData([
                    { name: 'Approved', value: data.travelRequests.approved || 0 },
                    { name: 'Pending', value: data.travelRequests.pending || 0 },
                    { name: 'Rejected', value: data.travelRequests.rejected || 0 }
                ]);
                setMonthlyTrendData(data.monthlyTrend || []);
                setRecentExpenseClaims(data.recentExpenseClaims || []);
                setRecentTravelRequests(data.recentTravelRequests || []);
                setExpenseByCategory(data.expenseByCategory || []);
                setTopSpenders(data.topSpenders || []);
            } else {
                setError('Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleKpiClick = async (type) => {
        setDialogTitle(type);
        setDialogLoading(true);
        setDialogOpen(true);
        setDialogTab(0);
        try {
            const response = await apiCalls('get', `/assetmanagement/getKpiDetail?type=${type}&branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`);
            setDialogData(response.paramObjectsMap.detailVO || []);
        } catch (err) {
            setDialogData([]);
        } finally {
            setDialogLoading(false);
        }
    };

    // if (loading) return <CircularProgress />;
    // if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Expense Claims', value: summaryCounts.totalExpenseClaims, color: '#2196f3', icon: <MonetizationOnIcon /> },
                    { label: 'Approved Claims', value: summaryCounts.approvedClaims, color: '#4caf50', icon: <CheckCircleIcon /> },
                    { label: 'Pending Claims', value: summaryCounts.pendingClaims, color: '#ffb300', icon: <HourglassTopIcon /> },
                    { label: 'Total Travel Requests', value: summaryCounts.totalTravelRequests, color: '#3f51b5', icon: <FlightTakeoffIcon /> },
                    { label: 'Approved Travels', value: summaryCounts.approvedTravels, color: '#4caf50', icon: <LuggageIcon /> },
                    { label: 'Pending Travels', value: summaryCounts.pendingTravels, color: '#ffa726', icon: <ScheduleIcon /> },
                    { label: 'Total Amount Spent', value: summaryCounts.totalAmountSpent, color: '#9c27b0', icon: <CurrencyRupeeIcon /> }
                ].map((kpi, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <KPIBox label={kpi.label} count={kpi.value} color={kpi.color} icon={kpi.icon} onClick={() => handleKpiClick(kpi.label)} />
                    </Grid>
                ))}
            </Grid>

            {/* Pie Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Expense Claim Status</Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={expenseStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {expenseStatusData.map((entry, index) => <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                            </Pie>
                            <ReTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Travel Request Status</Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={travelStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {travelStatusData.map((entry, index) => <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                            </Pie>
                            <ReTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>

            {/* Monthly Trend Bar Chart */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Monthly Expense vs Travel Request Trend</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyTrendData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ReTooltip />
                        <Legend />
                        <Bar dataKey="expense" fill="#2196f3" />
                        <Bar dataKey="travel" fill="#3f51b5" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* Recent Tables */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Recent Expense Claims</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentExpenseClaims.map((row, idx) => (
                                    <TableRow key={idx} hover>
                                        <TableCell>{row.title}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Recent Travel Requests</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentTravelRequests.map((row, idx) => (
                                    <TableRow key={idx} hover>
                                        <TableCell>{row.title}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {/* Dialog for KPI Details */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>{dialogTitle} Details</DialogTitle>
                <DialogContent>
                    {dialogLoading ? <CircularProgress /> : (
                        <>
                            <Tabs value={dialogTab} onChange={(e, val) => setDialogTab(val)}>
                                <Tab label="Details" />
                                <Tab label="Analytics" />
                            </Tabs>

                            {dialogTab === 0 && (
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Emp Code</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Designation</TableCell>
                                                <TableCell>Department</TableCell>
                                                <TableCell>Category</TableCell>
                                                <TableCell>Amount</TableCell>
                                                <TableCell>Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dialogData.map((row, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{row.empCode}</TableCell>
                                                    <TableCell>{row.name}</TableCell>
                                                    <TableCell>{row.designation}</TableCell>
                                                    <TableCell>{row.department}</TableCell>
                                                    <TableCell>{row.category}</TableCell>
                                                    <TableCell>{row.amount}</TableCell>
                                                    <TableCell>{row.date}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {dialogTab === 1 && (
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">Expenses by Category</Typography>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie data={expenseByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                                                    {expenseByCategory.map((entry, index) => (
                                                        <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ReTooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">Top Spenders</Typography>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={topSpenders}>
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <ReTooltip />
                                                <Bar dataKey="amount" fill="#3f51b5" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default DashboardExpenseTravel;
