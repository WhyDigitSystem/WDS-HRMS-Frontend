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
import { Inventory2 } from '@mui/icons-material';

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

    const getPaginatedData = () => {
        if (!pagination || !pagination.itemsPerPage) {
            return data;
        }

        const startIndex =
            (pagination.currentPage - 1) *
            pagination.itemsPerPage;

        const endIndex =
            startIndex + pagination.itemsPerPage;

        return data.slice(startIndex, endIndex);
    };

    const getDisplayIndices = () => {
        if (!pagination || !pagination.itemsPerPage) {
            return {
                start: 1,
                end: data.length,
                total: data.length
            };
        }

        const start =
            (pagination.currentPage - 1) *
            pagination.itemsPerPage + 1;

        const end = Math.min(
            pagination.currentPage *
            pagination.itemsPerPage,
            data.length
        );

        return {
            start,
            end,
            total: data.length
        };
    };

    const paginatedData = getPaginatedData();

    const { start, end, total } =
        getDisplayIndices();

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 8
                }}
            >
                <CircularProgress
                    sx={{
                        color: '#3a6b6d'
                    }}
                />
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    overflow: 'hidden',
                    ...sx
                }}
            >
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                align="center"
                                sx={{ py: 8 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <EmptyIcon
                                        sx={{
                                            fontSize: 55,
                                            color: '#cbd5e1',
                                            mb: 1.5
                                        }}
                                    />

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#64748b',
                                            fontWeight: 600
                                        }}
                                    >
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
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    overflow: 'auto',
                    background: '#fff',
                    boxShadow:
                        '0 10px 30px rgba(0,0,0,0.06)',
                    mb: 2,
                    ...sx
                }}
            >
                <Table stickyHeader={stickyHeader}>
                    <TableHead>
                        <TableRow
                            sx={{
                                background:
                                    'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',

                                '& .MuiTableCell-root': {
                                    background:
                                        'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                                    color: '#fff',
                                    borderBottom: 'none'
                                }
                            }}
                        >
                            {actions.length > 0 && (
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        py: 1.8,
                                        textAlign: 'center',
                                        width: '120px',
                                        fontSize: '13px',
                                        letterSpacing: '0.3px'
                                    }}
                                >
                                    Actions
                                </TableCell>
                            )}

                            {columns.map((column) => (
                                <TableCell
                                    key={column.key}
                                    sx={{
                                        fontWeight: 700,
                                        py: 1.8,
                                        width: column.width,
                                        textAlign:
                                            column.align || 'left',
                                        fontSize: '13px',
                                        letterSpacing: '0.3px',
                                        whiteSpace: 'nowrap'
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
                                onClick={() =>
                                    onRowClick &&
                                    onRowClick(row)
                                }
                                sx={{
                                    transition:
                                        'all 0.25s ease',

                                    '&:nth-of-type(even)': {
                                        background:
                                            '#fcfcfd'
                                    },

                                    '&:hover': {
                                        background:
                                            'rgba(58,107,109,0.06)',

                                        transform:
                                            'translateY(-1px)',

                                        cursor:
                                            onRowClick
                                                ? 'pointer'
                                                : 'default'
                                    },

                                    '& .MuiTableCell-root': {
                                        borderBottom:
                                            '1px solid #eef2f7'
                                    }
                                }}
                            >
                                {actions.length > 0 && (
                                    <TableCell
                                        sx={{
                                            textAlign: 'center',
                                            py: 1.2
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent:
                                                    'center',
                                                gap: 0.7
                                            }}
                                        >
                                            {actions.map(
                                                (
                                                    action,
                                                    actionIndex
                                                ) => (
                                                    <Tooltip
                                                        key={
                                                            actionIndex
                                                        }
                                                        title={
                                                            action.tooltip
                                                        }
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={(
                                                                e
                                                            ) => {
                                                                e.stopPropagation();
                                                                action.onClick(
                                                                    row
                                                                );
                                                            }}
                                                            disabled={action.disabled?.(
                                                                row
                                                            )}
                                                            sx={{
                                                                width: 34,
                                                                height: 34,
                                                                borderRadius:
                                                                    '10px',
                                                                background:
                                                                    'rgba(58,107,109,0.08)',

                                                                color:
                                                                    '#2a4b4d',

                                                                transition:
                                                                    'all 0.25s ease',

                                                                '&:hover': {
                                                                    background:
                                                                        'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',

                                                                    color:
                                                                        '#fff',

                                                                    transform:
                                                                        'scale(1.05)'
                                                                }
                                                            }}
                                                        >
                                                            {action.icon}
                                                        </IconButton>
                                                    </Tooltip>
                                                )
                                            )}
                                        </Box>
                                    </TableCell>
                                )}

                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        sx={{
                                            py: 1.4,
                                            textAlign:
                                                column.align ||
                                                'left',
                                            fontSize: '13px',
                                            color: '#334155'
                                        }}
                                    >
                                        {column.render
                                            ? column.render(
                                                row[column.key],
                                                row
                                            )
                                            : row[column.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination &&
                data.length >
                pagination.itemsPerPage && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                            mt: 2,
                            px: 1
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#64748b',
                                fontWeight: 500
                            }}
                        >
                            Showing {start}-{end} of{' '}
                            {total} items
                        </Typography>

                        <Stack spacing={2}>
                            <Pagination
                                count={
                                    pagination.totalPages
                                }
                                page={
                                    pagination.currentPage
                                }
                                onChange={
                                    pagination.onPageChange
                                }
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root':
                                    {
                                        borderRadius: '10px',
                                        fontWeight: 600
                                    },

                                    '& .Mui-selected': {
                                        background:
                                            'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%) !important',
                                        color: '#fff'
                                    }
                                }}
                            />
                        </Stack>

                        <Chip
                            label={`${pagination.itemsPerPage} per page`}
                            size="small"
                            sx={{
                                borderRadius: '10px',
                                background:
                                    'rgba(58,107,109,0.08)',
                                color: '#2a4b4d',
                                fontWeight: 600
                            }}
                        />
                    </Box>
                )}
        </>
    );
};

export default CommonListView;