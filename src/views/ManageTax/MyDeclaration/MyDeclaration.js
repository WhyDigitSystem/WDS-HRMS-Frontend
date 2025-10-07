import React from 'react';
import {
    Box, Card, CardContent, Typography, Chip, TableCell,
    TableBody, TableContainer, Table, Paper, TableHead, TableRow,
    useTheme, Grid, useMediaQuery
} from '@mui/material';
import {
    CheckCircleOutline as CheckCircleOutlineIcon,
    CancelOutlined as CancelOutlinedIcon,
    Assignment as AssignmentIcon,
    CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';

function MyDeclaration() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const months = [
        "APR 2025", "MAY 2025", "JUN 2025", "JUL 2025", "AUG 2025",
        "SEP 2025", "OCT 2025", "NOV 2025", "DEC 2025",
        "JAN 2026", "FEB 2026", "MAR 2026"
    ];

    const declarationsData = [
        {
            name: "1.5 Lac Deductions",
            count: 0,
            declared: "0",
            proof: 0,
            rejected: "0",
            accepted: "0",
        },
        {
            name: "Other Deductions",
            count: 1,
            declared: "0",
            proof: 0,
            rejected: "0",
            accepted: "0",
        },
        {
            name: "Tax Saving Allowances",
            count: 0,
            declared: "0",
            proof: 0,
            rejected: "0",
            accepted: "0",
        },
        {
            name: "House Property",
            count: 1,
            declared: "96,000",
            proof: 1,
            rejected: "0",
            accepted: "0",
        },
        {
            name: "Income from Other Sources",
            count: 0,
            declared: "0",
            proof: 0,
            rejected: "0",
            accepted: "0",
        },
    ];

    return (
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
            {/* Declarations Table */}
            <Card elevation={6} sx={{ borderRadius: 4, mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon color="primary" />
                        My Declarations
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Below are the declarations done by you under various sections.
                    </Typography>

                    <TableContainer component={Paper} variant="outlined">
                        <Table size={isMobile ? 'small' : 'medium'}>
                            <TableHead sx={{ 
                                backgroundColor: theme.palette.mode === 'light' 
                                    ? theme.palette.grey[100] 
                                    : theme.palette.grey[800] 
                            }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>DECLARATIONS</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>COUNT</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>DECLARED (INR)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>PROOF</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>REJECTED (INR)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>ACCEPTED (INR)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {declarationsData.map((row, index) => (
                                    <TableRow 
                                        key={index} 
                                        hover
                                        sx={{ 
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: theme.palette.action.hover
                                            }
                                        }}
                                    >
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={row.count}
                                                size="small"
                                                color={row.count > 0 ? 'primary' : 'default'}
                                                variant={row.count > 0 ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">{row.declared}</TableCell>
                                        <TableCell align="center">
                                            {row.proof > 0 ? (
                                                <CheckCircleOutlineIcon 
                                                    fontSize="small" 
                                                    color="success" 
                                                />
                                            ) : (
                                                <CancelOutlinedIcon 
                                                    fontSize="small" 
                                                    color="error" 
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="right" sx={{ 
                                            color: row.rejected !== '0' ? 'error.main' : 'inherit',
                                            fontWeight: row.rejected !== '0' ? 600 : 'inherit'
                                        }}>
                                            {row.rejected}
                                        </TableCell>
                                        <TableCell align="right" sx={{ 
                                            color: row.accepted !== '0' ? 'success.main' : 'inherit',
                                            fontWeight: row.accepted !== '0' ? 600 : 'inherit'
                                        }}>
                                            {row.accepted}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Monthly Tax Deduction Details */}
            <Card elevation={4} sx={{ borderRadius: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon color="primary" />
                        Monthly Tax Deduction Details
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Below deductions are based on your declared amount. Tax amount may change based on the amount approved.
                    </Typography>

                    <Grid container spacing={2} sx={{ my: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{ 
                                p: 2, 
                                bgcolor: 'primary.light',
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" color="textSecondary">
                                    TOTAL TAX PAYABLE
                                </Typography>
                                <Typography variant="h6">₹0</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{ 
                                p: 2,
                                bgcolor: 'secondary.light',
                                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" color="textSecondary">
                                    TAX PAID TILL NOW
                                </Typography>
                                <Typography variant="h6">₹0</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{ 
                                p: 2,
                                bgcolor: 'warning.light',
                                borderLeft: `4px solid ${theme.palette.warning.main}`,
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" color="textSecondary">
                                    REMAINING TAX AMOUNT
                                </Typography>
                                <Typography variant="h6">₹0</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">MONTH</TableCell>
                                    {months.map((month, index) => (
                                        <TableCell 
                                            key={index} 
                                            align="center"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {month}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                                        Monthly Total Tax
                                    </TableCell>
                                    {months.map((_, index) => (
                                        <TableCell key={index} align="center">₹0</TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2, 
                        mt: 3,
                        '& .MuiChip-root': { borderRadius: 1 }
                    }}>
                        <Chip 
                            label="Tax Deduction from previous employer" 
                            sx={{ bgcolor: 'primary.light' }} 
                        />
                        <Chip 
                            label="Imported tax deduction from current employer" 
                            sx={{ bgcolor: 'secondary.light' }} 
                        />
                        <Chip 
                            label="Tax deduction from projected salary" 
                            sx={{ bgcolor: 'warning.light' }} 
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default MyDeclaration;
