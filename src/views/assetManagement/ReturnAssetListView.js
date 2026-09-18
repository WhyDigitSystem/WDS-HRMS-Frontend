import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Tooltip
} from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const ReturnAssetListView = ({ data, onRemove }) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        background: '#fff',
        boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              background:
                'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              '& .MuiTableCell-root': {
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.4px',
                borderBottom: 'none',
                py: 1.5,
                whiteSpace: 'nowrap'
              }
            }}
          >
            <TableCell>Asset Code</TableCell>
            <TableCell>Asset Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Serial No</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <TableRow
                key={row.id || row.assetCode}
                hover
                sx={{
                  transition: 'all 0.2s ease',
                  backgroundColor:
                    index % 2 === 0
                      ? '#ffffff'
                      : '#f8fafc',
                  '&:hover': {
                    backgroundColor: '#eef6f6'
                  },
                  '& .MuiTableCell-root': {
                    borderBottom:
                      '1px solid #eef2f7',
                    py: 1.3,
                    fontSize: '13px',
                    color: '#334155'
                  }
                }}
              >
                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: '#2a4b4d'
                    }}
                  >
                    {row.assetCode}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: '13px'
                    }}
                  >
                    {row.assetName}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      background: '#ecfeff',
                      color: '#0f766e',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '999px',
                      display: 'inline-flex',
                      fontWeight: 600
                    }}
                  >
                    {row.category}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    {row.brand}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: '#475569'
                    }}
                  >
                    {row.serialNumber}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Return Asset">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onRemove(row)}
                      sx={{
                        minWidth: 78,
                        height: 28,
                        px: 1.2,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        lineHeight: 1,
                        background:
                          'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color: '#fff',
                        boxShadow:
                          '0 3px 10px rgba(220,38,38,0.22)',
                        transition: 'all 0.2s ease',
                        '& .MuiButton-startIcon': {
                          marginRight: '4px',
                          marginLeft: '-2px'
                        },
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          boxShadow:
                            '0 5px 14px rgba(220,38,38,0.32)',
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'scale(0.97)'
                        }
                      }}
                    >
                      Return
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                sx={{
                  py: 6,
                  background: '#fff'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 74,
                      height: 74,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(135deg, rgba(58,107,109,0.08) 0%, rgba(42,75,77,0.14) 100%)',
                      border:
                        '1px solid rgba(58,107,109,0.12)'
                    }}
                  >
                    <Inventory2OutlinedIcon
                      sx={{
                        fontSize: 36,
                        color: '#64748b'
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#334155'
                    }}
                  >
                    No Assets Found
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}
                  >
                    Returned asset records will appear here
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReturnAssetListView;
