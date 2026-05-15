// src/components/Dashboard/QuickActionsRow.jsx
import React from 'react';
import {
    Grid,
    Button,
    Typography,
    Box
} from '@mui/material';

import {
    EventNote,
    AccessTime,
    Assignment,
    Work,
    ArrowOutward
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const actions = [
    {
        title: 'Apply Leave',
        icon: <EventNote />,
        color: '#7c3aed',
        bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        border: '#ddd6fe',
        iconBg: '#ede9fe',
        path: '/me/leaveRequest'
    },
    {
        title: 'Comp-Off',
        icon: <Assignment />,
        color: '#be123c',
        bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        border: '#fecdd3',
        iconBg: '#ffe4e6',
        path: '/me/Comp_Off'
    },
    {
        title: 'Submit Task',
        icon: <Work />,
        color: '#b45309',
        bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '#fde68a',
        iconBg: '#fef3c7',
        path: '/me/Task'
    },
    {
        title: 'Attendance',
        icon: <AccessTime />,
        color: '#0f766e',
        bg: 'linear-gradient(135deg, #ecfeff 0%, #ccfbf1 100%)',
        border: '#99f6e4',
        iconBg: '#ccfbf1',
        path: '/me/CheckInOut'
    },
];

const QuickActionsRow = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                borderRadius: '24px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                p: 2,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    px: 0.5,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            mb: 0.3,
                        }}
                    >
                        Quick Actions
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '0.68rem',
                            color: '#64748b',
                            fontWeight: 500,
                        }}
                    >
                        Frequently used employee actions
                    </Typography>
                </Box>
            </Box>

            {/* Cards */}
            <Grid container spacing={1.5}>
                {actions.map((action) => (
                    <Grid item xs={12} sm={6} md={3} key={action.title}>
                        <Button
                            fullWidth
                            onClick={() => navigate(action.path)}
                            sx={{
                                p: 1.2,
                                borderRadius: '20px',
                                textTransform: 'none',
                                background: action.bg,
                                border: `1px solid ${action.border}`,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.25s ease',
                                minHeight: 74,
                                position: 'relative',
                                overflow: 'hidden',

                                '&:hover': {
                                    background: action.bg,
                                    transform: 'translateY(-3px)',
                                    boxShadow: `0 12px 24px ${action.color}18`,
                                    borderColor: action.color,
                                },

                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -25,
                                    right: -25,
                                    width: 70,
                                    height: 70,
                                    borderRadius: '50%',
                                    background: `${action.color}10`,
                                }
                            }}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1.3}
                            >
                                {/* Icon */}
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: '14px',
                                        background: `${action.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: action.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    {React.cloneElement(action.icon, {
                                        sx: {
                                            fontSize: 21,
                                        }
                                    })}
                                </Box>

                                {/* Content */}
                                <Box textAlign="left">
                                    <Typography
                                        sx={{
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            lineHeight: 1.2,
                                            mb: 0.4,
                                        }}
                                    >
                                        {action.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: '0.64rem',
                                            color: '#64748b',
                                            fontWeight: 500,
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        Quick access
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Arrow */}
                            <ArrowOutward
                                sx={{
                                    fontSize: 16,
                                    color: action.color,
                                    opacity: 0.7,
                                }}
                            />
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default QuickActionsRow;