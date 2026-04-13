import React, { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Autocomplete,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchIcon from "@mui/icons-material/Search";
import apiCalls from "apicall";
import PerspectiveRatingChart from "./PerspectiveRatingDashboard";
import { calculatePerspectiveRatings, calculatePerformanceMetrics } from "../../utils/PerspectiveUtils";
import PerformanceGoalsDashboard from "./DashboardPerformanceRating";
import MonthlyTrend from "./MonthlyTrendDashboard";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";

const AppraisalDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [activeTab, setActiveTab] = useState(0);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        totalGoals: 0,
        percentageAssigned: 0,
        avgSelfRating: 0,
        avgAppraiserRating: 0,
        finalScore: 0
    });
    const [perspectiveData, setPerspectiveData] = useState([]);

    // Generate months and years
    const months = [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString(),
    }));

    useEffect(() => {
        fetchEmployees();
        // Set default month and year to current
        const currentDate = new Date();
        const currentMonthValue = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentMonthObj = months.find(month => month.value === currentMonthValue);
        const currentYearValue = currentDate.getFullYear().toString();
        const currentYearObj = years.find(year => year.value === currentYearValue);

        setSelectedMonth(currentMonthObj);
        setSelectedYear(currentYearObj);
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await apiCalls("get", `/master/getAllEmployeeByOrgId?orgId=${orgId}`);
            const list = response?.paramObjectsMap?.employeeVO || [];
            const formatted = list.map((emp) => ({
                label: `${emp.employee || emp.employeeName} - ${emp.employeeCode}`,
                code: emp.employeeCode,
                name: emp.employee || emp.employeeName,
                reportingPerson: emp.reportingPerson,
            }));
            setEmployees(formatted);
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!selectedEmployee) {
            alert("Please select an employee");
            return;
        }
        if (!selectedMonth || !selectedYear) {
            alert("Please select both month and year");
            return;
        }

        try {
            setSearchLoading(true);
            console.log('Searching for employee:', selectedEmployee.code);

            // Fetch performance data for the selected employee
            const response = await apiCalls('get',
                `/performancegoals/getPerformanceGoalsDetailsReport?orgId=${orgId}&pmonth=${selectedMonth.label}&branch=ALL&appraisalYear=${selectedYear.value}`
            );

            console.log('API Response:', response);

            if (response.status) {
                const data = response.paramObjectsMap?.getPerformanceGoalsDetails || [];
                console.log('Raw performance data:', data);

                // Filter data for the selected employee
                const employeePerformanceData = data.filter(emp =>
                    emp.empCode === selectedEmployee.code
                );

                console.log('Filtered employee data:', employeePerformanceData);

                if (employeePerformanceData.length > 0) {
                    // Extract goals from the first matching employee
                    const goals = employeePerformanceData[0].performanceGoalsDtlVO || [];
                    console.log('Employee goals:', goals);

                    // Calculate metrics using utility functions
                    const metrics = calculatePerformanceMetrics(goals);
                    console.log('Calculated metrics:', metrics);
                    setPerformanceMetrics(metrics);

                    // Calculate perspective ratings using utility function
                    const perspectiveRatings = calculatePerspectiveRatings(goals);
                    console.log('Calculated perspective ratings:', perspectiveRatings);
                    setPerspectiveData(perspectiveRatings);

                    setEmployeeData({
                        ...selectedEmployee,
                        period: `${selectedMonth.value}/${selectedYear.value}`,
                        month: selectedMonth.label,
                        year: selectedYear.label,
                        performanceData: goals
                    });
                } else {
                    console.log('No employee performance data found');
                    // No data found for employee
                    setPerformanceMetrics({
                        totalGoals: 0,
                        percentageAssigned: 0,
                        avgSelfRating: 0,
                        avgAppraiserRating: 0,
                        finalScore: 0
                    });
                    setPerspectiveData([]);
                    setEmployeeData({
                        ...selectedEmployee,
                        period: `${selectedMonth.value}/${selectedYear.value}`,
                        month: selectedMonth.label,
                        year: selectedYear.label,
                        performanceData: []
                    });
                }
            } else {
                throw new Error(response.message || 'Failed to fetch performance data');
            }
        } catch (err) {
            console.error("Error fetching employee data:", err);
            // alert("Error fetching employee data");
            // Reset metrics on error
            setPerformanceMetrics({
                totalGoals: 0,
                percentageAssigned: 0,
                avgSelfRating: 0,
                avgAppraiserRating: 0,
                finalScore: 0
            });
            setPerspectiveData([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Performance Goals Content Component
    const PerformanceGoalsContent = () => (
        <PerformanceGoalsDashboard performanceData={employeeData?.performanceData || []} />
    );

    // Professional color scheme for tabs
    const tabData = [
        // {
        //     label: "Perspective Ratings",
        //     icon: <BarChartIcon />,
        //     count: perspectiveData.length,
        //     color: "#3b82f6", // Blue
        //     iconColor: "#2563eb", // Darker blue for icon
        //     bgColor: "#dbeafe", // Light blue background
        //     indicatorColor: "#3b82f6"
        // },
        {
            label: "Monthly Trend",
            icon: <TrendingUpIcon />,
            count: employeeData?.performanceData?.length || 0,
            color: "#8b5cf6", // Purple
            iconColor: "#7c3aed", // Darker purple for icon
            bgColor: "#f3e8ff", // Light purple background
            indicatorColor: "#8b5cf6"
        },
        {
            label: "Performance Goals",
            icon: <CheckCircleIcon />,
            count: performanceMetrics.totalGoals,
            color: "#10b981", // Green
            iconColor: "#059669", // Darker green for icon
            bgColor: "#d1fae5", // Light green background
            indicatorColor: "#10b981"
        }
    ];

    // Helper function to format rating display
    const formatRating = (rating) => {
        return rating > 0 ? `${rating} / 5` : "N/A";
    };

    // Helper function to format final score display
    const formatFinalScore = (score) => {
        return score > 0 ? score.toFixed(2) : "N/A";
    };

    // Helper function to get score status
    const getScoreStatus = (score) => {
        if (score === 0) return "No Ratings";
        if (score >= 4) return "Excellent";
        if (score >= 3) return "Good";
        if (score >= 2) return "Average";
        return "Needs Improvement";
    };

    // Helper function to get score color
    const getScoreColor = (score) => {
        if (score === 0) return "#ef4444";
        if (score >= 4) return "#10b981";
        if (score >= 3) return "#3b82f6";
        if (score >= 2) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <Paper
            elevation={0}
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                borderRadius: 0,
            }}
        >
            {/* Search Section */}
            <CardContent sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Employee Selection */}
                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => option.label || ""}
                            value={selectedEmployee}
                            onChange={(e, val) => setSelectedEmployee(val)}
                            size="small"
                            loading={loading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Name"
                                    variant="outlined"
                                    placeholder="Select Employee"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 1,
                                            height: 38,
                                        },
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Month Selection */}
                    <Grid item xs={12} md={2.5}>
                        <Autocomplete
                            options={months}
                            getOptionLabel={(option) => option.label}
                            value={selectedMonth}
                            onChange={(e, val) => setSelectedMonth(val)}
                            size="small"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Month"
                                    variant="outlined"
                                    placeholder="Select month"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 1,
                                            height: 38,
                                        },
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Year Selection */}
                    <Grid item xs={12} md={2.5}>
                        <Autocomplete
                            options={years}
                            getOptionLabel={(option) => option.label}
                            value={selectedYear}
                            onChange={(e, val) => setSelectedYear(val)}
                            size="small"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Year"
                                    variant="outlined"
                                    placeholder="Select year"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 1,
                                            height: 38,
                                        },
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Search Button */}
                    <Grid item xs="auto">
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={searchLoading}
                            sx={{
                                height: 38,
                                width: 42,
                                minWidth: 42,
                                borderRadius: 1,
                                p: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                                },
                            }}
                        >
                            {searchLoading ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <SearchIcon fontSize="small" />
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>

            {/* Main Content */}
            {employeeData && (
                <Box sx={{ p: 2, pt: 0 }}>
                    {/* Info Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Employee Details */}
                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    backdropFilter: "blur(10px)",
                                    background: "rgba(45, 212, 191, 0.08)", // teal tint
                                    borderLeft: "5px solid #14B8A6", // teal accent
                                    borderRadius: 3,
                                    boxShadow: "0 4px 20px rgba(20,184,166,0.2)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 8px 24px rgba(13,148,136,0.4)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                        <BadgeOutlinedIcon sx={{ color: "#0F766E", fontSize: 28, mr: 1 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
                                            Employee Details
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            Code: <strong>{employeeData.code}</strong>
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            Reporting To: <strong>{employeeData.reportingPerson}</strong>
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            Status:{" "}
                                            <span
                                                style={{
                                                    color: "#0D9488",
                                                    background: "#CCFBF1",
                                                    padding: "2px 8px",
                                                    borderRadius: "8px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Pending
                                            </span>
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            Period: <strong>{employeeData.period}</strong>
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Performance Summary */}
                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    backdropFilter: "blur(10px)",
                                    background: "rgba(251,191,36,0.08)", // amber tint
                                    borderLeft: "5px solid #F59E0B", // amber accent
                                    borderRadius: 3,
                                    boxShadow: "0 4px 20px rgba(245,158,11,0.2)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 8px 24px rgba(217,119,6,0.4)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                        <BarChartOutlinedIcon sx={{ color: "#B45309", fontSize: 28, mr: 1 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1E293B" }}>
                                            Performance Summary
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            Total Goals: <strong>{performanceMetrics.totalGoals}</strong>
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            % Assigned:{" "}
                                            <strong>{performanceMetrics.percentageAssigned.toFixed(1)}%</strong>
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            Avg Self:{" "}
                                            <strong>{formatRating(performanceMetrics.avgSelfRating)}</strong>
                                        </Typography>
                                        <Typography sx={{ fontSize: 14, color: "#334155" }}>
                                            Avg Appraiser:{" "}
                                            <strong>{formatRating(performanceMetrics.avgAppraiserRating)}</strong>
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Final Score */}
                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    backdropFilter: "blur(10px)",
                                    background: "rgba(99,102,241,0.08)", // indigo tint
                                    borderLeft: "5px solid #6366F1", // indigo accent
                                    borderRadius: 3,
                                    boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 8px 24px rgba(79,70,229,0.4)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                        <EmojiEventsOutlinedIcon sx={{ color: "#4F46E5", fontSize: 28, mr: 1 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1E293B" }}>
                                            Final Score
                                        </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: "center" }}>
                                        <Typography sx={{ fontWeight: 500, fontSize: 14, mb: 0.5, color: "#334155" }}>
                                            Overall Score
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: getScoreColor(performanceMetrics.finalScore),
                                                fontWeight: 700,
                                                fontSize: "1.8rem",
                                            }}
                                        >
                                            {formatFinalScore(performanceMetrics.finalScore)}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "#3730A3",
                                                background: "rgba(99,102,241,0.15)",
                                                px: 2,
                                                py: 0.3,
                                                borderRadius: 2,
                                                display: "inline-block",
                                                fontWeight: 600,
                                                fontSize: 13,
                                            }}
                                        >
                                            {getScoreStatus(performanceMetrics.finalScore)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tab Section */}
                    <Card
                        sx={{
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            overflow: "hidden",
                        }}
                    >
                        {/* Tab Headers */}
                        <Box sx={{ borderBottom: 1, borderColor: "divider", background: "#f8fafc" }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                aria-label="appraisal tabs"
                                sx={{
                                    "& .MuiTab-root": {
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        minHeight: 60,
                                        color: "#64748b",
                                        position: "relative",
                                        "&.Mui-selected": {
                                            color: "#334155",
                                            background: "rgba(255,255,255,0.9)",
                                        },
                                        "&:hover": {
                                            background: "rgba(255,255,255,0.7)",
                                            color: "#334155",
                                        },
                                        transition: "all 0.2s ease-in-out",
                                    },
                                    "& .MuiTabs-indicator": {
                                        height: 3,
                                        borderRadius: "2px 2px 0 0",
                                    },
                                }}
                            >
                                {tabData.map((tab, index) => (
                                    <Tab
                                        key={index}
                                        icon={React.cloneElement(tab.icon, {
                                            sx: {
                                                color: activeTab === index ? tab.iconColor : "#94a3b8",
                                                transition: "color 0.2s ease-in-out"
                                            }
                                        })}
                                        iconPosition="start"
                                        label={
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                {tab.label}
                                                <Box
                                                    sx={{
                                                        background: activeTab === index ? tab.color : `${tab.color}15`,
                                                        color: activeTab === index ? "white" : tab.color,
                                                        borderRadius: "12px",
                                                        width: 24,
                                                        height: 24,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: 600,
                                                        fontSize: "0.75rem",
                                                        transition: "all 0.2s ease-in-out",
                                                    }}
                                                >
                                                    {tab.count}
                                                </Box>
                                            </Box>
                                        }
                                        sx={{
                                            "&.Mui-selected": {
                                                color: tab.color,
                                                "& .MuiSvgIcon-root": {
                                                    color: tab.iconColor,
                                                },
                                            },
                                            mx: 0.5,
                                            borderRadius: 1,
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ p: 0 }}>
                            {tabData.map((tab, index) => (
                                <div
                                    key={index}
                                    role="tabpanel"
                                    hidden={activeTab !== index}
                                    id={`tabpanel-${index}`}
                                    aria-labelledby={`tab-${index}`}
                                >
                                    {activeTab === index && (
                                        <Box sx={{ p: 0 }}>
                                            {/* {index === 0 && <PerspectiveRatingChart data={perspectiveData} />} */}
                                            {index === 0 && (
                                                <MonthlyTrend
                                                    performanceData={employeeData?.performanceData || []}
                                                    selectedEmployee={selectedEmployee}
                                                    orgId={orgId}
                                                    selectedMonth={selectedMonth} // Pass selectedMonth if needed
                                                    selectedYear={selectedYear}
                                                />
                                            )}
                                            {index === 1 && <PerformanceGoalsDashboard performanceData={employeeData?.performanceData || []} />}
                                        </Box>
                                    )}
                                </div>
                            ))}
                        </Box>
                    </Card>
                </Box>
            )}
        </Paper>
    );
};

export default AppraisalDashboard;