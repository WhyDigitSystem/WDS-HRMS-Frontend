import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { IconCheck, IconClock, IconHelp, IconListCheck, IconPlus, IconUser } from '@tabler/icons-react';
import apiCalls from 'apicall';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import AllTicketsTab from './AllTicketsTab';
import RaiseTicketTab from './RaiseTicketTab';

const getStatusChip = (status) => {
  switch (status) {
    case 'Open':
      return <Chip label="Open" icon={<IconClock size={18} />} color="warning" variant="outlined" />;
    case 'Closed':
      return <Chip label="Closed" icon={<IconCheck size={18} />} color="success" variant="outlined" />;
    case 'In Progress':
      return <Chip label="In Progress" icon={<IconUser size={18} />} color="info" variant="outlined" />;
    default:
      return <Chip label="Unknown" variant="outlined" />;
  }
};

const employees = ['Alice', 'Bob', 'Charlie', 'David'];

const SupportTickets = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [ticket, setTicket] = useState({
    subject: '',
    description: '',
    status: 'Open',
    image: null,
    errors: {
      subject: false,
      description: false
    }
  });

  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const userType = localStorage.getItem('userType');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [tickets, setTickets] = useState([]);

  const [adminTickets, setAdminTickets] = useState([]);

  useEffect(() => {
    getTicketsByUser();
    getTicketsByOrgId();
  }, []);

  const handleToggle = () => setOpen(!open);
  const handleTabChange = (_, newTab) => setTab(newTab);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setTicket((prev) => ({
      ...prev,
      [name]: name === 'image' ? (files ? files[0] : null) : value,
      errors: {
        ...prev.errors,
        [name]: false // clear the error on change
      }
    }));
  };

  const handleRowClick = (params) => {
    setSelectedTicket(params.row);
    setDetailDialog(true);
  };

  const handleAssign = (id, assignedTo) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assignedTo } : t)));
  };

  const handleStatusChange = (id, status) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const getTicketsByUser = async () => {
    try {
      const response = await apiCalls('get', `ticketcontroller/getTicketByUserName?userName=${loginUserName}&orgId=${orgId}`);

      if (response.status === true) {
        setTickets(response.paramObjectsMap.ticketVO);
        return response.paramObjectsMap?.ticketVO || [];
      } else {
        showToast('error', response.paramObjectsMap?.ticketVO.errorMessage || 'Failed to fetch tickets');
        return [];
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // showToast('error', 'Something went wrong while fetching tickets');
      return [];
    }
  };

  const getTicketsByOrgId = async () => {
    try {
      const response = await apiCalls('get', `ticketcontroller/getTicketByOrgId?orgId=${orgId}`);

      if (response.status === true) {
        setAdminTickets(response.paramObjectsMap.ticketVO);
        return response.paramObjectsMap?.ticketVO || [];
      } else {
        showToast('error', response.paramObjectsMap?.ticketVO.errorMessage || 'Failed to fetch tickets');
        return [];
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // showToast('error', 'Something went wrong while fetching tickets');
      return [];
    }
  };

  const handleSubmit = async () => {
    console.log('Testing', ticket);

    const errors = {
      subject: !ticket.subject.trim(),
      description: !ticket.description.trim()
    };

    if (errors.subject || errors.description) {
      setTicket((prev) => ({
        ...prev,
        errors
      }));
      return;
    }

    const payload = {
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      userName: loginUserName,
      orgId: orgId,
      createdBy: loginUserName
    };

    try {
      setIsLoading(true);

      const response = await apiCalls('put', 'ticketcontroller/createUpdateTicket', payload);

      if (response.status === true && response.paramObjectsMap?.ticketVO?.id) {
        const ticketId = response.paramObjectsMap.ticketVO.id;
        showToast('success', 'Ticket created successfully');
        getTicketsByUser();
        getTicketsByOrgId();

        // Upload image if available
        // Upload image if available
        if (ticket.image) {
          const formData = new FormData();
          formData.append('file', ticket.image);

          const uploadUrl = `${process.env.REACT_APP_API_URL}/api/ticketcontroller/uploadTicketScreenShotInBloob?id=${ticketId}`;

          const uploadResponse = await axios.post(uploadUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (uploadResponse.data.status === true) {
          } else {
            showToast('error', uploadResponse.data.paramObjectsMap?.errorMessage || 'Image upload failed');
          }
        }

        // Clear form
        setTicket({
          subject: '',
          description: '',
          image: null,
          errors: {
            subject: false,
            description: false
          }
        });

        // Optional: refresh list
        // getAllTickets?.();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Ticket save failed');
      }
    } catch (error) {
      console.error('API Error:', error);
      // showToast('error', 'Something went wrong while saving the ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const userTabs = [
    {
      label: 'Raise Ticket',
      icon: <IconPlus size={18} /> // Green color
    },
    {
      label: 'All Tickets',
      icon: <IconListCheck size={18} /> // Blue color
    }
  ];

  // const adminTab = {
  //   label: 'IT Admin',
  //   icon: <IconSettings size={18} /> // Orange color
  // };

  const tabs = userTabs;

  return (
    <>
      <Tooltip title="Need help? Raise a support ticket">
        <Fab
          color="secondary"
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1500,
            backgroundColor: '#FF421B',
            '&:hover': { backgroundColor: '#E03B16' }
          }}
        >
          <IconHelp stroke={2} />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={handleToggle} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%, #2a4b4d 90%)',
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '1.6rem',
            paddingY: 2,
            borderTopLeftRadius: '6px', // More rounded corners
            borderTopRightRadius: '6px',
            boxShadow: '0 6px 15px rgba(0,0,0,0.3)' // Deeper shadow for better depth
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 600,
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              letterSpacing: 1.2,
              gap: 1.5 // Slightly bigger gap between icon and text
            }}
          >
            <IconHelp size={24} color="#fff" />
            Support Center
          </Typography>
        </DialogTitle>

        <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} variant="scrollable" scrollButtons="auto">
          {tabs.map((t, index) => (
            <Tab key={t.label} icon={t.icon} label={t.label} iconPosition="start" sx={{ minHeight: 48, minWidth: 120, font: 'bold' }} />
          ))}
        </Tabs>
        <DialogContent>
          {/* Raise Ticket Tab */}
          {tab === 0 && <RaiseTicketTab ticket={ticket} handleChange={handleChange} handleSubmit={handleSubmit} />}
          {tab === 1 && (
            <AllTicketsTab
              tickets={userType === 'ADMIN' ? adminTickets : tickets}
              onRowClick={handleRowClick}
              getAllTickets={getTicketsByOrgId}
            />
          )}
          {/* {isAdmin && tab === 2 && (
            <AdminTicketsTab
              tickets={adminTickets}
              employees={employees}
              handleAssign={handleAssign}
              handleStatusChange={handleStatusChange}
              handleRowClick={handleRowClick}
            />
          )} */}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          {tab === 0 ? (
            // <Button variant="contained" onClick={handleSubmit}>
            //   Submit Ticket
            // </Button>
            ''
          ) : (
            <Button variant="outlined" onClick={handleToggle}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Ticket Details Dialog */}
    </>
  );
};

export default SupportTickets;
