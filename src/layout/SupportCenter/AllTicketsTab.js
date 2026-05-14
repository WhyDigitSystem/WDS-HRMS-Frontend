import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CircularProgress } from '@mui/material';
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
import { useEffect,useState } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { showToast } from 'utils/toast-component';
import CommentSection from './HelperComponent/CommentSection';
import TicketInfo from './HelperComponent/TicketInfo';

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
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // Default to Open & InProgress

  const [isSearchExpanded, setSearchExpanded] = useState(false);

  const getCommentSuccessMessage = (isEdit) =>
  isEdit ? "Comment updated successfully" : "Comment added successfully";

  const handleOpenDialog = (ticket) => {
    setSelectedTicket(ticket);
    getComments(ticket.id);
    setComment('');
    setOpenDialog(true);
    onRowClick && onRowClick(ticket); // optional external click handler
  };

  const handleSearchExpand = () => {
    setSearchExpanded(!isSearchExpanded);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    setComment('');
  };

 const getComments = async (ticketId) => {
  try {
    setIsLoading(true);

    const [myRes, otherRes] = await Promise.all([
      apiCalls(
        'get',
        `ticketcontroller/getAllCommentsMyServer?ticketId=${ticketId}`
      ),
      apiCalls(
        'get',
        `ticketcontroller/getAllCommentsAnotherServer?ticketId=${ticketId}`
      )
    ]);

    const myComments =
      myRes?.status && Array.isArray(myRes.paramObjectsMap?.commentsVO)
        ? myRes.paramObjectsMap.commentsVO
        : [];

    const otherComments =
      otherRes?.status && Array.isArray(otherRes.paramObjectsMap?.commentsVO)
        ? otherRes.paramObjectsMap.commentsVO
        : [];

    const normalizedMy = myComments.map((c) => ({
      ...c,
      displayName: c.createdBy || c.userName,
      source: 'MY'
    }));

  const normalizedOther = otherComments.map((c) => ({
  ...c,
  displayName: c.sourceUserName
    ? c.sourceUserName.split('@')[0]
    : 'External',
  source: 'OTHER'
}));

    const merged = [...normalizedMy, ...normalizedOther].sort((a, b) => {
      const dateA = dayjs(a.commonDate?.createdon, 'DD-MM-YYYY hh:mm:ss A');
      const dateB = dayjs(b.commonDate?.createdon, 'DD-MM-YYYY hh:mm:ss A');
      return dateB.valueOf() - dateA.valueOf();
    });

    setComments(merged);
  } catch (error) {
    console.error('Error fetching comments:', error);
    setComments([]);
    showToast('error', 'Failed to fetch comments');
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  if (!openDialog || !selectedTicket?.id) return;

  // initial load
  getComments(selectedTicket.id);

  const interval = setInterval(async () => {
    try {
      const [myRes, otherRes] = await Promise.all([
        apiCalls(
          'get',
          `ticketcontroller/getAllCommentsMyServer?ticketId=${selectedTicket.id}`
        ),
        apiCalls(
          'get',
          `ticketcontroller/getAllCommentsAnotherServer?ticketId=${selectedTicket.id}`
        )
      ]);

      const myComments =
        myRes?.status &&
        Array.isArray(myRes.paramObjectsMap?.commentsVO)
          ? myRes.paramObjectsMap.commentsVO
          : [];

      const otherComments =
        otherRes?.status &&
        Array.isArray(otherRes.paramObjectsMap?.commentsVO)
          ? otherRes.paramObjectsMap.commentsVO
          : [];

      const normalizedMy = myComments.map((c) => ({
        ...c,
        displayName: c.createdBy || c.userName,
        source: 'MY'
      }));

      const normalizedOther = otherComments.map((c) => ({
        ...c,
        displayName: c.sourceUserName
          ? c.sourceUserName.split('@')[0]
          : 'External',
        source: 'OTHER'
      }));

      const merged = [...normalizedMy, ...normalizedOther].sort((a, b) => {
        const dateA = dayjs(
          a.commonDate?.createdon,
          'DD-MM-YYYY hh:mm:ss A'
        );

        const dateB = dayjs(
          b.commonDate?.createdon,
          'DD-MM-YYYY hh:mm:ss A'
        );

        return dateB.valueOf() - dateA.valueOf();
      });

      setComments((prev) => {
        const prevString = JSON.stringify(prev);
        const newString = JSON.stringify(merged);

        if (prevString === newString) {
          return prev;
        }

        return merged;
      });
    } catch (error) {
      console.error('Auto refresh comments error:', error);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [openDialog, selectedTicket?.id]);




const handleSubmitComment = async (commentText, editingId) => {
  if (!commentText.trim()) {
    showToast('error', 'Please enter a comment');
    return;
  }

  const basePayload = {
    comments: commentText,
    ticketId: selectedTicket?.id,
    createdBy: loginUserName,
    orgId: orgId,
    userName: loginUserName
  };

  try {
    setIsLoading(true);

    let response;

    // ✏️ UPDATE COMMENT
    if (editingId) {
      response = await apiCalls(
        'put',
        'ticketcontroller/updateComments',
        {
          ...basePayload,
          id: editingId
        }
      );
    } 
    
    // ➕ CREATE COMMENT
    else {
      response = await apiCalls(
        'post',
        'ticketcontroller/createComments',
        basePayload
      );
    }

    console.log('COMMENT RESPONSE =>', response);

    // ✅ SUCCESS CHECK
    if (response) {

      // 🔥 INSTANT UI UPDATE FOR EDIT
      if (editingId) {

        setComments((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? {
                  ...c,
                  comments: commentText
                }
              : c
          )
        );

      } else {

        // 🔥 REFRESH COMMENTS AFTER NEW COMMENT
        await getComments(selectedTicket?.id);

      }

      showToast(
        'success',
        editingId
          ? 'Comment updated successfully'
          : 'Comment added successfully'
      );

      setComment('');

    } else {

      showToast('error', 'Operation failed');

    }

  } catch (error) {

    console.error('Comment submit error:', error);

    showToast(
      'error',
      error?.response?.data?.message ||
      'Failed to submit comment'
    );

  } finally {

    setIsLoading(false);

  }
};

  const handleStatusChange = async (newStatus, rowData) => {
    console.log('Testing==>', rowData);
    setStatusLoadingId(rowData.id);
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
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleDeleteComment = async (id) => {
  try {
    setIsLoading(true);

    const response = await apiCalls(
      'delete',
      `ticketcontroller/deleteComments?id=${id}&sourceId=${id}`
    );

    if (response.status) {
      //  REMOVE LOCALLY INSTEAD OF REFETCH
      setComments((prev) => prev.filter((c) => c?.id !== id));
      showToast('success', 'Comment deleted');
    } else {
      showToast('error', 'Delete failed');
    }
  } catch (error) {
    console.error(error);
    showToast('error', 'Failed to delete comment');
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
              // renderCell: (params) => {
              //   if (loginUserName === 'WDS002') {
              //     return (
              //       <Select
              //         value={params.value}
              //         onChange={(e) => handleStatusChange(e.target.value, params.row)}
              //         size="small"
              //         fullWidth
              //         sx={{
              //           '& .MuiSelect-select': {
              //             padding: '4px 8px', // Adjust padding to make the input smaller
              //             fontSize: '0.875rem' // Smaller font size
              //           },
              //           '& .MuiMenuItem-root': {
              //             fontSize: '0.875rem' // Smaller font size for the menu items
              //           },
              //           height: '32px' // Adjust the height of the dropdown
              //         }}
              //       >
              //         <MenuItem value="Open">Open</MenuItem>
              //         <MenuItem value="InProgress">In Progress</MenuItem>
              //         <MenuItem value="Closed">Closed</MenuItem>
              //       </Select>
              //     );
              //   } else {
              //     return getStatusChip(params.value);
              //   }
              // }
              renderCell: (params) => {
                if (loginUserName === 'WDS002') {
                  return statusLoadingId === params.row.id ? (
                    <Box display="flex" justifyContent="center" width="100%">
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    <Select value={params.value} onChange={(e) => handleStatusChange(e.target.value, params.row)} size="small" fullWidth>
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="InProgress">In Progress</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  );
                }

                return getStatusChip(params.value);
              }
            },
            ...(loginUserName === 'WDS002'
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
              background: 'linear-gradient(145deg, #6a11cb, #2575fc)',
              color: 'white',
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
