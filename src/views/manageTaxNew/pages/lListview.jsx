import React from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Listview = ({ rows = [], totalDeclared = '₹0' }) => {
  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Chip
            label="Approved"
            size="small"
            sx={{
              backgroundColor: '#dcfce7',
              color: '#059669',
              fontWeight: 600
            }}
          />
        );

      case 'Pending':
        return (
          <Chip
            label="Pending"
            size="small"
            sx={{
              backgroundColor: '#fef3c7',
              color: '#d97706',
              fontWeight: 600
            }}
          />
        );

      default:
        return (
          <Chip
            label="Draft"
            size="small"
            sx={{
              backgroundColor: '#e2e8f0',
              color: '#475569',
              fontWeight: 600
            }}
          />
        );
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        mt: 1
      }}
    >
      {/* Header */}

      <Box
        sx={{
          px: 1,
          py: 1,
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#0f172a'
            }}
          >
            Investment Declarations
          </Typography>

          <Chip
            label={`${rows.length} items`}
            size="small"
            sx={{
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              fontWeight: 600
            }}
          />
        </Stack>
      </Box>

      {/* Table */}

      <TableContainer sx={{
    maxHeight: '300px',
    overflowY: 'auto',
  }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#f8fafc'
              }}
            >
              {['SECTION', 'INVESTMENT TYPE', 'DECLARED (₹)', 'LIMIT (₹)', 'PROOF', 'STATUS', 'UPLOAD'].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#64748b',
                    padding: '8px 4px'
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} sx={{ padding: '8px' }} hover>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: '#0f172a',
                    padding: '8px'
                  }}
                >
                  {row.section}
                </TableCell>

                <TableCell
                  sx={{
                    padding: '8px'
                  }}
                >
                  {row.type}
                </TableCell>

                <TableCell
                  sx={{
                    padding: '8px'
                  }}
                >
                  {/* <TextField */}
                  {/* size="small" */}
                  {/* value={row.declared} */}
                  {row.declared}
                  {/* sx={{
                      width: '100px',
                    }} */}
                  {/* /> */}
                </TableCell>

                <TableCell
                  sx={{
                    color: '#94a3b8',
                    fontWeight: 500,
                    padding: '8px'
                  }}
                >
                  {row.limit}
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {row.proof === 'Uploaded' ? (
                      <CheckCircleOutlineIcon
                        sx={{
                          color: '#10b981',
                          fontSize: 18,
                          padding: '8px'
                        }}
                      />
                    ) : (
                      <AccessTimeOutlinedIcon
                        sx={{
                          color: '#f59e0b',
                          fontSize: 18,
                          padding: '8px'
                        }}
                      />
                    )}

                    <Typography
                      sx={{
                        fontSize: '0.85rem'
                      }}
                    >
                      {row.proof}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell
                  sx={{
                    padding: '8px'
                  }}
                >
                  {getStatusChip(row.status)}
                </TableCell>

                <TableCell
                  sx={{
                    padding: '8px'
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadOutlinedIcon />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none'
                    }}
                  >
                    Upload
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#fafafa'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <InfoOutlinedIcon
            sx={{
              fontSize: 18,
              color: '#64748b'
            }}
          />

          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#64748b'
            }}
          >
            Upload proof for each declaration
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontWeight: 700,
            color: '#475569'
          }}
        >
          Total Declared: {totalDeclared}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default Listview;
