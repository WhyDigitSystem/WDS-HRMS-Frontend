import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { showToast } from 'utils/toast-component';
import CommentSection from './HelperComponent/CommentSection';
import TicketInfo from './HelperComponent/TicketInfo';
import { ToastContainer } from 'react-toastify';

dayjs.extend(relativeTime);

const getStatusChip = (status) => {
  const colorMap = {
    Open: 'primary',
    Closed: 'success',
    Pending: 'warning'
  };

  const iconMap = {
    Open: <VisibilityIcon fontSize="small" />,
    Closed: <VisibilityIcon fontSize="small" />,
    Pending: <VisibilityIcon fontSize="small" />
  };

  return (
    <Chip
      label={status}
      icon={iconMap[status]}
      color={colorMap[status] || 'default'}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
};

const AllTicketsTab = ({ tickets, onRowClick, getAllTickets }) => {
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const userType = localStorage.getItem('userType');
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All'); // Default to Open & InProgress

  const [isSearchExpanded, setSearchExpanded] = useState(false);

  const handleOpenDialog = (ticket) => {
    setSelectedTicket(ticket);
    getComments(ticket.id);
    setComment('');
    setOpenDialog(true);
    onRowClick && onRowClick(ticket); 
  };

  const handleSearchExpand = () => {
    setSearchExpanded(!isSearchExpanded);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    setComment('');
  };

  const getComments = async (id) => {
    try {
      setIsLoading(true);

      const response = await apiCalls('get', `ticketcontroller/getCommentsByTicketId?orgId=${orgId}&ticketId=${id}`);

      if (response.status === true && Array.isArray(response.paramObjectsMap?.commentsVO)) {
        const transformedComments = response.paramObjectsMap.commentsVO;

        setComments(transformedComments);
      } else {
        showToast('error', 'No comments found or error in response');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showToast('error', 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (comment, editingId) => {
    if (!comment.trim()) {
      showToast('error', 'Please enter a comment');
      return;
    }

    console.log('Testing==<<', selectedTicket);

    const payload = {
      comments: comment,
      ticketId: selectedTicket?.id,
      createdBy: loginUserName,
      ...(editingId && { id: editingId }),
      orgId: orgId,
      userName: loginUserName
    };

    try {
      setIsLoading(true);

      const response = await apiCalls('put', 'ticketcontroller/updateCreateComments', payload);

      if (response.status === true) {
        showToast('success', editingId ? 'Comment updated' : 'Comment added');
        getComments(selectedTicket?.id);
        setComment('');
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Failed to save comment');
      }
    } catch (error) {
      console.error('Comment submit error:', error);
      // showToast('error', 'Something went wrong while submitting the comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, rowData) => {
    console.log('Testing==>', rowData);
    try {
      const response = await apiCalls(
        'put',
        `ticketcontroller/updateTicketStatus?orgId=${parseInt(orgId)}&userName=${loginUserName}&status=${newStatus}&ticketId=${rowData.id}`
      );

      if (response.status === true) {
        showToast('success', 'Ticket status updated');
        // Optional: refresh ticket list
        getAllTickets();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Update failed');
      }
    } catch (error) {
      console.error('Status update error:', error);
      // showToast('error', 'Something went wrong');
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      setIsLoading(true);

      const response = await apiCalls('delete', `ticketcontroller/deleteCommentsById?id=${id}`);

      if (response.status) {
        getComments(selectedTicket?.id);
      } else {
        showToast('error', 'error in response');
      }
    } catch (error) {
      showToast('error', 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  };

  const transformedTickets = tickets.map((t) => ({
    ...t,
    createdonFormatted: dayjs(t.commonDate.createdon, 'DD-MM-YYYY hh:mm:ss a').format('DD MMM YYYY')
  }));

  const filteredTickets = transformedTickets.filter(
    (ticket) => ticket.subject.toLowerCase().includes(search.toLowerCase()) || ticket.status.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTicketsNew = filteredTickets.filter((ticket) =>
    statusFilter === 'All'
      ? true
      : statusFilter === 'Open'
        ? ticket.status === 'Open' || ticket.status === 'InProgress'
        : ticket.status === statusFilter
  );

  return (
    <>
    <ToastContainer />
    <Box sx={{ height: 400, mt: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        {/* Left side: Title */}
        <Typography variant="h6" fontWeight="bold">
          All Tickets
        </Typography>

        {/* Right side: Filter + Search in a horizontal stack */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Filter Icon */}
          <IconButton onClick={() => setStatusFilter(statusFilter === 'All' ? 'Open' : 'All')} size="small">
            <FilterListIcon sx={{ color: '#007BFF' }} />
          </IconButton>

          {/* Status Filter Dropdown */}
          {statusFilter !== 'All' && (
            <FormControl size="small" sx={{ width: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Search Icon with Expandable Input */}
          <IconButton onClick={handleSearchExpand} size="small">
            <SearchIcon fontSize="small" sx={{ color: '#17A2B8' }} />
          </IconButton>

          {isSearchExpanded && (
            <TextField
              size="small"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 250 }}
              //   InputProps={{
              //     startAdornment: (
              //       <InputAdornment position="start">
              //         <SearchIcon fontSize="small" />
              //       </InputAdornment>
              //     )
              //   }}
            />
          )}
        </Stack>
      </Stack>
      <DataGrid
        rows={filteredTicketsNew}
        columns={[
          {
            field: 'id',
            headerName: '#',
            width: 110,
            headerAlign: 'center',
            align: 'center'
          },
          {
            field: 'subject',
            headerName: 'Subject',
            flex: 1,
            minWidth: 100
          },
          {
            field: 'description',
            headerName: 'Description',
            flex: 1,
            minWidth: 150
          },

          {
            field: 'status',
            headerName: 'Status',
            width: 160,
            renderCell: (params) => {
              if (userType === 'ADMIN') {
                return (
                  <Select
                    value={params.value}
                    onChange={(e) => handleStatusChange(e.target.value, params.row)}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiSelect-select': {
                        padding: '4px 8px', // Adjust padding to make the input smaller
                        fontSize: '0.875rem' // Smaller font size
                      },
                      '& .MuiMenuItem-root': {
                        fontSize: '0.875rem' // Smaller font size for the menu items
                      },
                      height: '32px' // Adjust the height of the dropdown
                    }}
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="InProgress">In Progress</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                );
              } else {
                return getStatusChip(params.value);
              }
            }
          },
          ...(userType === 'ADMIN'
            ? [
                {
                  field: 'userName',
                  headerName: 'User',
                  width: 160
                }
              ]
            : []),

          {
            field: 'createdonFormatted',
            headerName: 'Created On',
            width: 140
          },
          {
            field: 'actions',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
              <IconButton onClick={() => handleOpenDialog(params.row)} size="small" color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            )
          }
        ]}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        sx={{
          borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#2a4b4d',
            fontWeight: 'bold',
            color : '#fff'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#fff'
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #eee'
          }
        }}
      />

      {/* Dialog for Ticket Details */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Stack spacing={3}>
              <TicketInfo selectedTicket={selectedTicket} />
              <CommentSection
                commentsVO={comments}
                currentUser={loginUserName}
                onSubmitComment={handleSubmitComment}
                onGetComments={getComments}
                onEditComment={handleSubmitComment}
                onDeleteComment={handleDeleteComment}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
};

export default AllTicketsTab;
