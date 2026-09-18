import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Paper,
    Divider,
} from "@mui/material";

const MonthlyTrend = ({ performanceData = [] }) => {
    const ratingScale = [
        { range: [4.5, 5], label: "Outstanding", color: "#16a34a", bgColor: "#dcfce7" },
        { range: [4.0, 4.5], label: "Excellent", color: "#0284c7", bgColor: "#e0f2fe" },
        { range: [3.5, 4.0], label: "Very Good", color: "#6366f1", bgColor: "#e0e7ff" },
        { range: [3.0, 3.5], label: "Good", color: "#8b5cf6", bgColor: "#ede9fe" },
        { range: [2.5, 3.0], label: "Satisfactory", color: "#f59e0b", bgColor: "#fef3c7" },
        { range: [2.0, 2.5], label: "Needs Improvement", color: "#ef4444", bgColor: "#fee2e2" },
    ];

    const getRatingInfo = (score) => {
        const rating = ratingScale.find((r) => score >= r.range[0] && score <= r.range[1]);
        return rating || { label: "Below Expectations", color: "#dc2626", bgColor: "#fee2e2" };
    };

    const processTrendData = () => {
        if (!performanceData || performanceData.length === 0) return [];
        const totalScore = performanceData.reduce(
            (sum, goal) => sum + (goal.appraiserrating || 0),
            0
        );
        const averageScore = totalScore / performanceData.length;
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString("default", { month: "long" });
        const currentYear = currentDate.getFullYear();
        
        // Fix: Format period as MM/YYYY instead of MMYYYY
        const formattedPeriod = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${currentYear}`;

        return [
            {
                month: `${currentMonth} ${currentYear}`,
                period: formattedPeriod, // Use the formatted period here
                score: averageScore,
                goals: performanceData.length,
                status: getRatingInfo(averageScore).label,
            },
        ];
    };

    const trendData = processTrendData();
    const currentMonthData = trendData[0];
    if (!currentMonthData) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper
                    sx={{
                        p: 5,
                        textAlign: "center",
                        borderRadius: 3,
                        background: "linear-gradient(135deg,#f1f5f9,#f8fafc)",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <Typography variant="h6" sx={{ color: "#475569", mb: 1 }}>
                        No Performance Data Available
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Performance data will appear here once available.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    const ratingInfo = getRatingInfo(currentMonthData.score);

    return (
        <Box sx={{ p: 4, background: "#f9fafb", borderRadius: 3 }}>

            <Grid container spacing={4}>
                {/* Left: Rating Scale */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                            background: "white",
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#334155" }}>
                            Current Month Performance
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {/* 🎨 Updated Professional Background Card */}
                        <Card
                            sx={{
                                border: `2px solid ${ratingInfo.color}`,
                                borderRadius: 4,
                                overflow: "hidden",
                                boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
                                background: `linear-gradient(145deg, ${ratingInfo.color}20, ${ratingInfo.bgColor}, #ffffff)`,
                                position: "relative",
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 5 }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: ratingInfo.color,
                                        mb: 1,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    {ratingInfo.label}
                                </Typography>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        color: "#1e293b",
                                        mb: 2,
                                        textShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    {currentMonthData.score.toFixed(2)}
                                </Typography>
                                <Typography sx={{ color: "#475569", fontWeight: 500 }}>
                                    {currentMonthData.goals} Goals • {currentMonthData.period}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Box
                            sx={{
                                mt: 3,
                                p: 2.5,
                                borderRadius: 2,
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <Typography sx={{ color: "#475569" }}>
                                <strong>Overall Summary:</strong> {ratingInfo.label} overall with an average score of{" "}
                                <strong>{currentMonthData.score.toFixed(2)}</strong> this month.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right: Current Month */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                            background: "white",
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#334155" }}>
                            Performance Rating Scale
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
                            {ratingScale.map((rating, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1.2,
                                        borderRadius: 2,
                                        background: rating.bgColor,
                                        border: `1px solid ${rating.color}33`,
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 600, color: rating.color }}>
                                        {rating.label}
                                    </Typography>
                                    <Typography
                                        sx={{ color: "#475569", fontWeight: 800 }}
                                    >{`${rating.range[0]}+`}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MonthlyTrend;