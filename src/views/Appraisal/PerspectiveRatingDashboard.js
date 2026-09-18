import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip
} from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";

const PerspectiveRatingChart = ({ data = [] }) => {
    const getPerspectiveColor = (perspective) => {
        const colors = {
            'Financial': '#3b82f6',
            'Customer': '#ef4444',
            'Internal Processes': '#10b981',
            'Internal': '#10b981',
            'Learning & Growth': '#f59e0b',
            'Learning': '#f59e0b',
            'Other': '#8b5cf6'
        };
        return colors[perspective] || '#6b7280';
    };

    const overallAverage = data.length > 0
        ? data.reduce((sum, item) => sum + item.averageRating, 0) / data.length
        : 0;

    // Define compulsory perspectives based on actual data
    const getCompulsoryPerspectives = () => {
        const perspectivesFromData = data.map(item => item.perspective);
        const defaultPerspectives = ['Financial', 'Customer', 'Internal Processes', 'Learning & Growth'];

        // Use perspectives from data if available, otherwise use defaults
        return [...new Set([...defaultPerspectives, ...perspectivesFromData])];
    };

    const compulsoryPerspectives = getCompulsoryPerspectives();

    // Create data for all compulsory perspectives, even if no data exists
    const allPerspectivesData = compulsoryPerspectives.map(perspective => {
        const existingData = data.find(item => item.perspective === perspective);
        return existingData || {
            perspective,
            averageRating: 0,
            totalRating: 0,
            totalWeight: 0,
            count: 0,
            goals: [],
            hasData: false
        };
    });

    // Add "Other" perspective if it exists in data but not in compulsory
    const otherPerspectives = data.filter(item => !compulsoryPerspectives.includes(item.perspective));
    if (otherPerspectives.length > 0) {
        // If there are multiple other perspectives, combine them
        const otherPerspective = {
            perspective: 'Other',
            averageRating: otherPerspectives.reduce((sum, item) => sum + item.averageRating, 0) / otherPerspectives.length,
            totalRating: otherPerspectives.reduce((sum, item) => sum + item.totalRating, 0),
            totalWeight: otherPerspectives.reduce((sum, item) => sum + item.totalWeight, 0),
            count: otherPerspectives.reduce((sum, item) => sum + item.count, 0),
            goals: otherPerspectives.flatMap(item => item.goals),
            hasData: true
        };
        allPerspectivesData.push(otherPerspective);
    }

    // Calculate weighted data for overview pie chart - using percentage distribution
    const totalRating = allPerspectivesData.reduce((sum, item) => sum + item.averageRating, 0);
    const overviewPieData = allPerspectivesData
        .filter(item => item.averageRating > 0)
        .map(item => ({
            ...item,
            value: item.averageRating,
            percentage: totalRating > 0 ? (item.averageRating / totalRating) * 100 : 0,
            color: getPerspectiveColor(item.perspective)
        }));

    // Custom tooltip for pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box
                    sx={{
                        backgroundColor: 'white',
                        p: 1.5,
                        border: '1px solid #e2e8f0',
                        borderRadius: 1,
                        boxShadow: 2,
                        minWidth: 120
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                        {data.perspective}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Rating: <strong>{data.averageRating.toFixed(1)}/5</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Distribution: <strong>{data.percentage.toFixed(1)}%</strong>
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    // Individual perspective pie chart component
    const PerspectivePie = ({ perspective, rating, color, hasData = true, size = 'medium' }) => {
        const chartSizeWidth = size === 'large' ? 150 : 280;
        const chartSizeHeight = size === 'large' ? 150 : 120;
        const innerRadius = size === 'large' ? 50 : 30;
        const outerRadius = size === 'large' ? 70 : 50;
        const fontSize = size === 'large' ? '20px' : '16px';

        const pieData = [
            { name: 'Achieved', value: rating, color: color },
            { name: 'Remaining', value: 5 - rating, color: '#e2e8f0' }
        ];

        if (!hasData || rating === 0) {
            return (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: '#334155',
                            mb: 1,
                            fontSize: size === 'large' ? '1.1rem' : '0.875rem'
                        }}
                    >
                        {perspective}
                    </Typography>
                    <Box
                        sx={{
                            width: chartSizeWidth,
                            height: chartSizeHeight,
                            borderRadius: '50%',
                            backgroundColor: '#f8fafc',
                            border: '2px dashed #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#94a3b8',
                                fontWeight: 500,
                                fontSize: size === 'large' ? '1rem' : '0.75rem'
                            }}
                        >
                            No Data
                        </Typography>
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#64748b',
                            fontSize: size === 'large' ? '0.9rem' : '0.7rem'
                        }}
                    >
                        0.0/5.0
                    </Typography>
                </Box>
            );
        }

        return (
            <Box sx={{ textAlign: 'center' }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        color: '#334155',
                        mb: 1,
                        fontSize: size === 'large' ? '1.1rem' : '0.875rem'
                    }}
                >
                    {perspective}
                </Typography>
                <ResponsiveContainer width={chartSizeWidth} height={chartSizeHeight}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                                fontSize: fontSize,
                                fontWeight: 'bold',
                                fill: '#334155'
                            }}
                        >
                            {rating.toFixed(1)}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
                <Typography
                    variant="caption"
                    sx={{
                        color: '#64748b',
                        mt: 0.5,
                        fontSize: size === 'large' ? '0.9rem' : '0.7rem'
                    }}
                >
                    {rating.toFixed(1)}/5.0
                </Typography>
            </Box>
        );
    };

    // Updated Overview Pie Chart Component with breakdown below the chart
    const OverviewPieChart = () => {
        if (data.length === 0 || overviewPieData.length === 0) {
            return (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155', mb: 0 }}>
                        OVERVIEW
                    </Typography>
                    <Box
                        sx={{
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            backgroundColor: '#f8fafc',
                            border: '2px dashed #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 0
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                            No Data
                        </Typography>
                    </Box>
                </Box>
            );
        }

        return (
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155', mb: 0 }}>
                    OVERVIEW
                </Typography>
                <ResponsiveContainer width={340} height={200}>
                    <PieChart>
                        <Pie
                            data={overviewPieData}
                            cx="60%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {overviewPieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getPerspectiveColor(entry.perspective)}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        {/* Main Average Rating */}
                        <text
                            x="60%"
                            y="45%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                fill: '#334155'
                            }}
                        >
                            {overallAverage.toFixed(1)}
                        </text>
                        {/* Scale */}
                        <text
                            x="60%"
                            y="60%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                                fontSize: '12px',
                                fill: '#64748b',
                                fontWeight: '500'
                            }}
                        >
                            /5.0
                        </text>
                    </PieChart>
                </ResponsiveContainer>

                {/* Perspective Breakdown Below Pie Chart */}
                <Box sx={{ mt: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: 'white' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mb: 2, textAlign: 'center' }}>
                        Avg: {overallAverage.toFixed(1)} /5.0
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        {overviewPieData.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: getPerspectiveColor(item.perspective)
                                    }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                    {item.perspective}: {item.averageRating.toFixed(1)} ({item.percentage.toFixed(1)}%)
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        );
    };

    // No Data State Component
    const NoDataState = () => (
        <Card sx={{
            borderRadius: 3,
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: 500,
            mx: 'auto',
            mt: 4
        }}>
            <CardContent>
                {/* Abstract Chart Illustration */}
                <Box sx={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Box sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Typography variant="h4" sx={{ color: '#64748b' }}>
                                ?
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        color: '#334155',
                        mb: 2,
                        fontWeight: 700
                    }}
                >
                    No Data to Display
                </Typography>
                <Chip
                    label="Data Pending"
                    variant="outlined"
                    sx={{
                        color: '#475569',
                        borderColor: '#cbd5e1',
                        fontWeight: 500
                    }}
                />
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 0, mt: 2, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#334155' }}>
                    PERSPECTIVE RATINGS - {new Date().toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' }).toUpperCase()}
                </Typography>
            </Box>

            {/* Show No Data State if no data */}
            {data.length === 0 ? (
                <NoDataState />
            ) : (
                /* Main Content - Side by Side Layout */
                <Card sx={{ borderRadius: 2, mb: 4, mt: 0 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={4}>
                            {/* Left Side - Overview */}
                            <Grid item xs={12} md={5}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: '2px solid #3b82f630',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                        height: '100%'
                                    }}
                                >
                                    <CardContent sx={{ p: '0 !important' }}>
                                        <OverviewPieChart />
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Right Side - 4 Subheading Perspective Pie Charts in 2x2 grid */}
                            <Grid item xs={12} md={7}>
                                <Typography variant="h6" sx={{ mb: 3, color: '#334155', fontWeight: 600, textAlign: 'center' }}>
                                    BY PERSPECTIVE
                                </Typography>

                                <Grid container spacing={3}>
                                    {allPerspectivesData
                                        .filter(item => compulsoryPerspectives.includes(item.perspective))
                                        .map((item, index) => (
                                            <Grid item xs={12} sm={6} key={index} sx={{ textAlign: 'center' }}>
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: `2px solid ${getPerspectiveColor(item.perspective)}20`,
                                                        background: 'white',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        '&:hover': {
                                                            borderColor: getPerspectiveColor(item.perspective),
                                                            boxShadow: `0 4px 12px ${getPerspectiveColor(item.perspective)}20`
                                                        }
                                                    }}
                                                >
                                                    <CardContent sx={{ p: '0 !important' }}>
                                                        <PerspectivePie
                                                            perspective={item.perspective}
                                                            rating={item.averageRating}
                                                            color={getPerspectiveColor(item.perspective)}
                                                            hasData={item.averageRating > 0}
                                                            size="medium"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default PerspectiveRatingChart;