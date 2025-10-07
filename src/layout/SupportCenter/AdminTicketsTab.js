import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { IconEdit, IconEye } from '@tabler/icons-react';
import { useState } from 'react';

const AdminTicketsTab = ({ tickets, employees, handleAssign, handleStatusChange, handleRowClick }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleViewClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDialog = () => {
    setSelectedTicket(null);
  };

  const columns = [
    {
      field: 'id',
      headerName: '#',
      width: 60,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Select
          value={params.value || ''}
          onChange={(e) => handleAssign(params.row.id, e.target.value)}
          variant="standard"
          size="small"
          fullWidth
          sx={{ minWidth: 100, fontSize: '0.8rem' }}
        >
          {employees.map((emp) => (
            <MenuItem key={emp} value={emp}>
              {emp}
            </MenuItem>
          ))}
        </Select>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Select
          value={params.value}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          variant="standard"
          size="small"
          fullWidth
          sx={{ minWidth: 100, fontSize: '0.8rem' }}
        >
          {['Open', 'In Progress', 'Closed'].map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Details">
            <IconButton color="primary" onClick={() => handleViewClick(params.row)}>
              <IconEye size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Ticket">
            <IconButton color="secondary">
              <IconEdit size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <>
      <Box sx={{ height: 420, mt: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Manage Tickets
        </Typography>
        <DataGrid
          rows={tickets}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: 'white',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f4f6f8',
              fontWeight: 'bold'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f0f4ff'
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #eee'
            }
          }}
        />
      </Box>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">Subject:</Typography>
              <Typography>{selectedTicket.subject}</Typography>

              <Divider />

              <Typography variant="subtitle2">Description:</Typography>
              <Typography color="text.secondary">{selectedTicket.description || 'No description available.'}</Typography>

              <Divider />

              <Typography variant="subtitle2">Assigned To:</Typography>
              <Typography>{selectedTicket.assignedTo || 'Unassigned'}</Typography>

              <Typography variant="subtitle2">Status:</Typography>
              <Typography>{selectedTicket.status}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminTicketsTab;
