// src/components/Dashboard/RecentCirculars.jsx
import React, { useState } from 'react';

import {
    Paper,
    Typography,
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Avatar,
} from '@mui/material';

import {
    Description,
    Policy,
    ArrowForward,
    Close,
} from '@mui/icons-material';

const circulars = [
    {
        title: 'Working from Home Policy',
        date: '15 May 2026',
        description:
            'Updated work from home policy effective from 15 May 2026',
        type: 'policy',
    },
    {
        title: 'Office Re-Opening Guidelines',
        date: '01 June 2026',
        description:
            'New guidelines for office re-opening from 01 June 2026',
        type: 'guidelines',
    },
    {
        title: 'Leave Policy Update',
        date: '10 June 2026',
        description:
            'Updated leave rules and carry forward policies.',
        type: 'policy',
    },
    {
        title: 'Security Compliance Notice',
        date: '15 June 2026',
        description:
            'Mandatory password update and compliance rules.',
        type: 'guidelines',
    },
];

const CircularCard = ({ circular }) => {
    const isPolicy = circular.type === 'policy';

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: '16px',
                background: '#ffffffcc',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.7)',
                transition: '0.25s ease',

                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                },
            }}
        >
            {/* Top */}
            <Box
                display="flex"
                alignItems="center"
                gap={1.2}
                mb={1}
            >
                <Avatar
                    sx={{
                        width: 38,
                        height: 38,
                        background: isPolicy
                            ? '#dbeafe'
                            : '#fce7f3',
                        color: isPolicy
                            ? '#2563eb'
                            : '#db2777',
                    }}
                >
                    {isPolicy ? (
                        <Policy sx={{ fontSize: 18 }} />
                    ) : (
                        <Description sx={{ fontSize: 18 }} />
                    )}
                </Avatar>

                <Box flex={1}>
                    <Typography
                        sx={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.3,
                        }}
                    >
                        {circular.title}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '0.68rem',
                            color: '#64748b',
                            fontWeight: 600,
                            mt: 0.2,
                        }}
                    >
                        {circular.date}
                    </Typography>
                </Box>

                <Chip
                    label={
                        isPolicy
                            ? 'Policy'
                            : 'Guidelines'
                    }
                    size="small"
                    sx={{
                        height: 22,
                        borderRadius: '7px',
                        background: isPolicy
                            ? '#dbeafe'
                            : '#fce7f3',
                        color: isPolicy
                            ? '#2563eb'
                            : '#db2777',
                        fontWeight: 700,
                        fontSize: '0.64rem',
                    }}
                />
            </Box>

            {/* Description */}
            <Typography
                sx={{
                    fontSize: '0.72rem',
                    color: '#64748b',
                    lineHeight: 1.5,
                    fontWeight: 500,
                }}
            >
                {circular.description}
            </Typography>
        </Box>
    );
};

const CircularPopup = ({
    open,
    onClose,
}) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
            sx: {
                borderRadius: '24px',
                p: 1,
            },
        }}
    >
        <DialogTitle
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
                fontWeight: 800,
            }}
        >
            Recent Circulars

            <IconButton onClick={onClose}>
                <Close />
            </IconButton>
        </DialogTitle>

        <DialogContent>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2,
                }}
            >
                {circulars.map((circular) => (
                    <CircularCard
                        key={circular.title}
                        circular={circular}
                    />
                ))}
            </Box>
        </DialogContent>
    </Dialog>
);

const RecentCirculars = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: '22px',
                    border: '1px solid #e2e8f0',
                    background:
                        'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow Effect */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background: '#3b82f620',
                        top: -70,
                        right: -60,
                    }}
                />

                {/* Header */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1.8}
                    position="relative"
                    zIndex={2}
                >
                    <Typography
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: '#0f172a',
                        }}
                    >
                        Recent Circulars
                    </Typography>

                    <Button
                        size="small"
                        onClick={() => setOpen(true)}
                        endIcon={
                            <ArrowForward sx={{ fontSize: 14 }} />
                        }
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            color: '#2563eb',
                            minWidth: 'auto',
                            px: 1,
                        }}
                    >
                        View All
                    </Button>
                </Box>

                {/* Show Only 3 */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.2,
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {circulars
                        .slice(0, 3)
                        .map((circular) => (
                            <CircularCard
                                key={circular.title}
                                circular={circular}
                            />
                        ))}
                </Box>
            </Paper>

            {/* Popup */}
            <CircularPopup
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export default RecentCirculars;