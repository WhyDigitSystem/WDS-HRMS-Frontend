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
import { useEffect, useState } from 'react';

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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{
            background: '#fff',
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {/* Left: Title */}
          <Typography variant="h6" fontWeight={700} sx={{ color: '#2a4b4d' }}>
            All Tickets
          </Typography>

          {/* Right: Controls */}
          <Stack direction="row" spacing={1.5} alignItems="center">

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 240 }}
            />

            {/* Optional action buttons */}
            <IconButton size="small" sx={{ bgcolor: '#f1f5f9', borderRadius: 2 }}>
              <FilterListIcon sx={{ color: '#3a6b6d' }} />
            </IconButton>

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
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            background: '#fff',

            // Header styling (aligned with your teal system theme)
            '& .MuiDataGrid-columnHeaders': {
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              borderBottom: 'none'
            },

            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              letterSpacing: '0.3px'
            },

            // Rows
            '& .MuiDataGrid-row': {
              fontSize: 13
            },

            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f1f5f9',
              transition: '0.2s ease'
            },

            // Cells
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #eef2f7',
              fontSize: 13,
              color: '#334155'
            },

            // Remove ugly focus outline
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            },

            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none'
            },

            // Footer (pagination area)
            '& .MuiDataGrid-footerContainer': {
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              minHeight: 50
            },

            '& .MuiTablePagination-root': {
              fontSize: 12
            },

            // Checkbox (if enabled later)
            '& .MuiCheckbox-root': {
              color: '#3a6b6d'
            },

            // Selected row (optional but clean UX)
            '& .Mui-selected': {
              backgroundColor: 'rgba(58, 107, 109, 0.08) !important'
            }
          }}
        />

        {/* Dialog for Ticket Details */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 18px 45px rgba(15,23,42,0.2)',
              border: '1px solid #e2e8f0'
            }
          }}
        >
          {/* HEADER */}
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              py: 1.5,
              letterSpacing: '0.3px'
            }}
          >
            Ticket Details
          </DialogTitle>

          {/* BODY */}
          <DialogContent
            dividers
            sx={{
              background: '#f8fafc',
              p: 2.5
            }}
          >
            {selectedTicket && (
              <Stack spacing={2.5}>
                <TicketInfo selectedTicket={selectedTicket} />

                <Box
                  sx={{
                    background: '#fff',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    p: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <CommentSection
                    commentsVO={comments}
                    currentUser={loginUserName}
                    onSubmitComment={handleSubmitComment}
                    onGetComments={getComments}
                    onEditComment={handleSubmitComment}
                    onDeleteComment={handleDeleteComment}
                  />
                </Box>
              </Stack>
            )}
          </DialogContent>

          {/* FOOTER */}
          <DialogActions
            sx={{
              background: '#fff',
              px: 2,
              py: 1.5,
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

    </>
  );
};

export default AllTicketsTab;
