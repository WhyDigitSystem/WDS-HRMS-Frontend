import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Tabs,
    Tab
} from '@mui/material';

const PerformanceGoalsDashboard = ({ performanceData = [] }) => {
    const [activeTab, setActiveTab] = useState(0);

    // Filter out goals without descriptions and group by perspective
    const goalsWithDescriptions = performanceData.filter(goal => goal.objectivedesc);

    // Group goals by perspective
    const groupedGoals = goalsWithDescriptions.reduce((acc, goal) => {
        const perspective = goal.perspective || 'OTHER';
        if (!acc[perspective]) {
            acc[perspective] = [];
        }
        acc[perspective].push(goal);
        return acc;
    }, {});

    // Get all perspectives for tabs
    const perspectives = Object.keys(groupedGoals);
    const currentPerspective = perspectives[activeTab] || '';
    const currentGoals = groupedGoals[currentPerspective] || [];

    // Original color configuration
    const perspectiveConfig = {
        'CUSTOMER': { 
            color: '#1e40af', 
            bgColor: '#dbeafe',
            borderColor: '#bfdbfe'
        },
        'FINANCIAL': { 
            color: '#dc2626', 
            bgColor: '#fee2e2',
            borderColor: '#fecaca'
        },
        'INTERNAL PROCESSES': { 
            color: '#047857', 
            bgColor: '#d1fae5',
            borderColor: '#a7f3d0'
        },
        'LEARNING & GROWTH': { 
            color: '#d97706', 
            bgColor: '#fef3c7',
            borderColor: '#fde68a'
        },
        'OTHER': { 
            color: '#7c3aed', 
            bgColor: '#ede9fe',
            borderColor: '#ddd6fe'
        }
    };

    // Format perspective name for display
    const formatPerspectiveName = (name) => {
        return name.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Render rating dots
    const renderRatingDots = (rating, color) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Box
                        key={star}
                        sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: star <= (rating || 0) ? color : '#f8fafc',
                            border: `2px solid ${star <= (rating || 0) ? color : '#cbd5e1'}`,
                            transition: 'all 0.2s ease'
                        }}
                    />
                ))}
                <Typography
                    variant="body2"
                    sx={{
                        color: '#374151',
                        fontWeight: 700,
                        ml: 1.5,
                        fontSize: '0.875rem'
                    }}
                >
                    {rating || '0'}
                </Typography>
            </Box>
        );
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>

            {Object.keys(groupedGoals).length === 0 ? (
                <Box 
                    sx={{ 
                        textAlign: 'center',
                        py: 8,
                        border: '2px dashed #e5e7eb',
                        borderRadius: 2,
                        background: '#fafafa'
                    }}
                >
                    <Typography 
                        variant="h6" 
                        color="textSecondary"
                        sx={{ mb: 1 }}
                    >
                        No Performance Goals
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="textSecondary"
                    >
                        No performance goals available for the selected period.
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Tabs Section */}
                    <Card
                        sx={{
                            mb: 3,
                            border: '1px solid #e2e8f0',
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: '48px',
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    minHeight: '48px',
                                    color: '#64748b',
                                    '&.Mui-selected': {
                                        color: '#334155',
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '2px 2px 0 0',
                                }
                            }}
                        >
                            {perspectives.map((perspective, index) => (
                                <Tab
                                    key={perspective}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {formatPerspectiveName(perspective)}
                                            <Chip
                                                label={groupedGoals[perspective].length}
                                                size="small"
                                                sx={{
                                                    background: `${perspectiveConfig[perspective]?.color || perspectiveConfig.OTHER.color}15`,
                                                    color: perspectiveConfig[perspective]?.color || perspectiveConfig.OTHER.color,
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: 20,
                                                    minWidth: 20
                                                }}
                                            />
                                        </Box>
                                    }
                                    sx={{
                                        '&.Mui-selected': {
                                            color: perspectiveConfig[perspective]?.color || perspectiveConfig.OTHER.color,
                                        }
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Card>

                    {/* Tab Content */}
                    <Card
                        key={currentPerspective}
                        sx={{
                            border: `1px solid ${perspectiveConfig[currentPerspective]?.borderColor || perspectiveConfig.OTHER.borderColor}`,
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.2s ease',
                            margin: '0 auto',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                            }
                        }}
                    >
                        {/* Perspective Header - Reduced Height */}
                        <Box
                            sx={{
                                background: perspectiveConfig[currentPerspective]?.bgColor || perspectiveConfig.OTHER.bgColor,
                                px: 2.5,
                                py: 1, // Reduced from py: 2
                                borderBottom: `1px solid ${perspectiveConfig[currentPerspective]?.borderColor || perspectiveConfig.OTHER.borderColor}`
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: perspectiveConfig[currentPerspective]?.color || perspectiveConfig.OTHER.color,
                                        fontWeight: 600,
                                        fontSize: '1rem', // Slightly smaller
                                    }}
                                >
                                    {formatPerspectiveName(currentPerspective)}
                                </Typography>
                                <Chip
                                    label={`${currentGoals.length} goal${currentGoals.length !== 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{
                                        background: 'white',
                                        color: perspectiveConfig[currentPerspective]?.color || perspectiveConfig.OTHER.color,
                                        fontWeight: 600,
                                        border: `1px solid ${perspectiveConfig[currentPerspective]?.color || perspectiveConfig.OTHER.color}`,
                                        fontSize: '0.75rem',
                                        height: 24
                                    }}
                                />
                            </Box>
                        </Box>

                        <CardContent sx={{ p: 3, background: '#ffffff' }}>
                            <Grid container spacing={2}>
                                {currentGoals.map((goal, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Card
                                            sx={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 1.5,
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                                transition: 'all 0.2s ease',
                                                height: '100%',
                                                '&:hover': {
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                }
                                            }}
                                        >
                                            <Box sx={{ p: 2 }}>
                                                {/* Goal Title and Percentage */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500,
                                                            flex: 1,
                                                            mr: 1,
                                                            color: '#374151',
                                                            lineHeight: 1.4,
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {goal.objectivedesc}
                                                    </Typography>
                                                    <Chip
                                                        label={`${goal.perassigned || '0'}%`}
                                                        size="small"
                                                        sx={{
                                                            background: '#f8fafc',
                                                            color: '#475569',
                                                            fontWeight: 600,
                                                            border: '1px solid #e2e8f0',
                                                            minWidth: 50,
                                                            height: 22,
                                                            fontSize: '0.65rem',
                                                        }}
                                                    />
                                                </Box>

                                                {/* Ratings Section */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#6b7280',
                                                                minWidth: 40,
                                                                fontWeight: 500,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            Self:
                                                        </Typography>
                                                        {renderRatingDots(goal.selfrating, '#10b981')}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#6b7280',
                                                                minWidth: 40,
                                                                fontWeight: 500,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            Appraiser:
                                                        </Typography>
                                                        {renderRatingDots(goal.appraiserrating, '#3b82f6')}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Empty state */}
                            {currentGoals.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#9ca3af',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No goals available for this perspective
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </Box>
    );
};

export default PerformanceGoalsDashboard;