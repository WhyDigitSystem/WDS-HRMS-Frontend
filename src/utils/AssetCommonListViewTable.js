import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Pagination,
    Stack,
    CircularProgress
} from '@mui/material';
import { Edit, Visibility, Inventory2 } from '@mui/icons-material';

const CommonListView = ({
    data = [],
    columns = [],
    actions = [],
    loading = false,
    emptyMessage = "No data found",
    emptyIcon: EmptyIcon = Inventory2,
    pagination = null,
    onRowClick,
    stickyHeader = true,
    sx = {}
}) => {
    // Calculate paginated data
    const getPaginatedData = () => {
        if (!pagination || !pagination.itemsPerPage) {
            return data;
        }
        
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    // Calculate display indices for pagination info
    const getDisplayIndices = () => {
        if (!pagination || !pagination.itemsPerPage) {
            return { start: 1, end: data.length, total: data.length };
        }
        
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = Math.min(pagination.currentPage * pagination.itemsPerPage, data.length);
        return { start, end, total: data.length };
    };

    const paginatedData = getPaginatedData();
    const { start, end, total } = getDisplayIndices();

    // If loading, show loading indicator
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // If no data, show empty state
    if (!data || data.length === 0) {
        return (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, ...sx }}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center" sx={{ py: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <EmptyIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                        {emptyMessage}
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <>
            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'auto',
                    mb: 2,
                    ...sx
                }}
            >
                <Table stickyHeader={stickyHeader}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            {/* Action Column */}
                            {actions.length > 0 && (
                                <TableCell sx={{ fontWeight: '600', py: 1, textAlign: 'center', width: '120px' }}>
                                    Actions
                                </TableCell>
                            )}
                            
                            {/* Data Columns */}
                            {columns.map((column) => (
                                <TableCell
                                    key={column.key}
                                    sx={{
                                        fontWeight: '600',
                                        py: 1,
                                        width: column.width,
                                        textAlign: column.align || 'left'
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow
                                key={row.id || index}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'grey.50',
                                        transition: 'background-color 0.2s ease',
                                        cursor: onRowClick ? 'pointer' : 'default'
                                    }
                                }}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {/* Action Cells */}
                                {actions.length > 0 && (
                                    <TableCell sx={{ textAlign: 'center', py: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                            {actions.map((action, actionIndex) => (
                                                <Tooltip key={actionIndex} title={action.tooltip}>
                                                    <IconButton
                                                        size="small"
                                                        color={action.color || 'primary'}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            action.onClick(row);
                                                        }}
                                                        disabled={action.disabled?.(row)}
                                                    >
                                                        {action.icon}
                                                    </IconButton>
                                                </Tooltip>
                                            ))}
                                        </Box>
                                    </TableCell>
                                )}

                                {/* Data Cells */}
                                {columns.map((column) => (
                                    <TableCell key={column.key} sx={{ py: 1, textAlign: column.align || 'left' }}>
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination && data.length > pagination.itemsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}>
                    {/* Items per page info */}
                    <Typography variant="body2" color="textSecondary">
                        Showing {start}-{end} of {total} items
                    </Typography>

                    {/* Pagination Controls */}
                    <Stack spacing={2}>
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.currentPage}
                            onChange={pagination.onPageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            size="medium"
                        />
                    </Stack>

                    {/* Items per page indicator */}
                    <Chip
                        label={`${pagination.itemsPerPage} per page`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            )}
        </>
    );
};

export default CommonListView;