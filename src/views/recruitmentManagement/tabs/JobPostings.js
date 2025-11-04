import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Box,
    IconButton,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    WorkOutline as WorkIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';

const JobPostings = ({ jobs, onViewJob, onDeleteJob, onAddJob, config }) => {
    const primaryColor = config.primary_action_color || '#2563eb';
    const secondaryColor = config.secondary_action_color || '#6b7280';

    if (jobs.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 6,
                    background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    maxWidth: 400,
                    mx: 'auto',
                    mt: 2
                }}
            >
                <WorkIcon
                    sx={{
                        fontSize: 48,
                        color: '#7c3aed', // Purple
                        mb: 1.5,
                        opacity: 0.8
                    }}
                />
                <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    No Job Postings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 280, mx: 'auto', fontSize: '0.875rem' }}>
                    Create your first job posting to attract qualified candidates.
                </Typography>
                <Button
                    variant="contained"
                    size="medium"
                    startIcon={<AddIcon />}
                    onClick={onAddJob}
                    sx={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, #1d4ed8 100%)`,
                        boxShadow: '0 2px 8px 0 rgba(37, 99, 235, 0.2)',
                        borderRadius: 1,
                        px: 2.5,
                        py: 0.75,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        '&:hover': {
                            boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.3)',
                            transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    Create Job
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Grid container spacing={1.5}>
                {jobs.map((job) => (
                    <Grid item xs={12} sm={6} lg={4} key={job.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'white',
                                border: '1px solid #f1f5f9',
                                borderRadius: 1.5,
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
                                    borderColor: primaryColor
                                }
                            }}
                        >
                            {/* Header with subtle accent */}
                            <Box 
                                sx={{ 
                                    height: 3,
                                    background: `linear-gradient(90deg, ${primaryColor} 0%, #3b82f6 100%)`,
                                    opacity: 0.8
                                }}
                            />
                            
                            <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                                {/* Job Title with Work Icon */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                                    <WorkIcon 
                                        sx={{ 
                                            fontSize: 18, 
                                            color: '#dc2626', // Red
                                            mt: 0.25,
                                            opacity: 0.9
                                        }} 
                                    />
                                    <Typography
                                        variant="h6"
                                        component="h3"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            lineHeight: 1.4,
                                            color: 'text.primary',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            flex: 1
                                        }}
                                    >
                                        {job.job_title}
                                    </Typography>
                                </Box>

                                {/* Department and Location - Compact */}
                                <Stack spacing={1} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <BusinessIcon
                                            sx={{
                                                fontSize: 14,
                                                color: '#059669', // Emerald Green
                                                opacity: 0.8
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ 
                                            color: 'text.primary', 
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            {job.department}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <LocationIcon
                                            sx={{
                                                fontSize: 14,
                                                color: '#7c3aed', // Purple
                                                opacity: 0.8
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ 
                                            fontSize: '0.8rem'
                                        }}>
                                            {job.location}
                                        </Typography>
                                    </Box>
                                    {/* Added Posted Date Icon */}
                                    {job.postedDate && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <ScheduleIcon
                                                sx={{
                                                    fontSize: 14,
                                                    color: '#ea580c', // Orange
                                                    opacity: 0.8
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ 
                                                fontSize: '0.8rem'
                                            }}>
                                                {job.postedDate}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>

                            {/* Footer with Status and Actions - Compact */}
                            <Box sx={{ 
                                p: 2, 
                                pt: 1,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                borderTop: '1px solid #f8fafc'
                            }}>
                                {/* Status Chip */}
                                <Chip
                                    label={job.status}
                                    size="small"
                                    sx={{
                                        backgroundColor: job.status === 'Active'
                                            ? '#dcfce7' // Light green
                                            : '#f3f4f6', // Light gray
                                        color: job.status === 'Active'
                                            ? '#166534' // Dark green
                                            : '#374151', // Dark gray
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: 22,
                                        border: job.status === 'Active'
                                            ? `1px solid #bbf7d0` // Green border
                                            : `1px solid #e5e7eb`, // Gray border
                                        borderRadius: 0.75
                                    }}
                                />

                                {/* Actions - Minimal */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<ViewIcon sx={{ fontSize: 16, color: primaryColor }} />}
                                        onClick={() => onViewJob(job)}
                                        sx={{
                                            color: primaryColor,
                                            fontWeight: 500,
                                            fontSize: '0.75rem',
                                            minWidth: 'auto',
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: 0.75,
                                            '&:hover': {
                                                backgroundColor: `${primaryColor}08`
                                            }
                                        }}
                                    >
                                        View
                                    </Button>
                                    <IconButton
                                        onClick={() => onDeleteJob(job.id)}
                                        size="small"
                                        sx={{
                                            color: '#d97706', // Amber
                                            borderRadius: 0.75,
                                            p: 0.5,
                                            '&:hover': {
                                                color: '#dc2626', // Red
                                                backgroundColor: '#fef2f2'
                                            },
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default JobPostings;