import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Modal, TextField, Fab, Tooltip } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import PostIcon from '@mui/icons-material/PostAdd'; // Icon for POST
import PollIcon from '@mui/icons-material/Poll'; // Icon for POLL
import AddIcon from '@mui/icons-material/Add'; // FAB icon
import Post from './Post';
import Poll from './Poll'; // Ensure this import is correct
import apiCalls from 'apicall';

// Styled Components
const CardWrapper = styled(Box)(({ theme }) => ({
  // backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.5s ease',
  '&:after, &:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    opacity: 0.1,
  },
  '&:after': { top: -85, right: -95 },
  '&:before': { top: -125, right: -15 },
  borderLeft: '4px solid #364152', // Left border color added here
}));

// Modal Style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '12px',
};

// Create Post Modal Component
const CreatePostModal = ({ open, handleClose, handleCreatePost, postContent, isEdit, handleEditPost }) => {
  const [subject, setSubject] = useState(postContent?.subject || ''); // Subject state
  const [content, setContent] = useState(postContent?.content || ''); // Content state

  const handleSubmit = () => {
    if (isEdit) {
      handleEditPost({ subject, content });
    } else {
      handleCreatePost({ subject, content });
    }
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isEdit ? 'Edit Post' : 'Create a New Post'}
        </Typography>
        <TextField
          fullWidth
          label="Subject"
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Post Content"
          variant="outlined"
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {isEdit ? 'Update Post' : 'Create Post'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const Main = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0); // Main tab state (Organization or IT)
  const [nestedTabValue, setNestedTabValue] = useState('POST'); // Nested tab state (POST, POLL)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false); // Post modal state
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false); // Edit post modal state
  const [organizationPosts, setOrganizationPosts] = useState([]); // Organization posts
  const [itPosts, setItPosts] = useState([]); // IT posts
  const [postToEdit, setPostToEdit] = useState(null); // Post to edit
  const [currentPostIndex, setCurrentPostIndex] = useState(0); // Track the current post index in the modal
  const [circularData, setCircularData] = useState([]);
  const [pollData, setPollData] = useState([]);
  const department = localStorage.getItem('department');
  const branchCode = localStorage.getItem('branchCode');
  const orgId = localStorage.getItem('orgId');

  const GetCircularByOrgId = async () => {
    try {
      const type = tabValue === 0 ? 'Organization' : 'IT';
      const endpoint =
        tabValue === 0
          ? `/basicmaster/getAllCircularByOrgId?branchCode=${branchCode}&orgId=${orgId}&type=${type}&department=ALL`
          : `/basicmaster/getAllCircularByOrgId?branchCode=${branchCode}&orgId=${orgId}&department=${department}&type=${type}`;

      const result = await apiCalls('get', endpoint);

      if (result?.paramObjectsMap?.circularVO) {
        const formattedData = result.paramObjectsMap.circularVO.reverse();
        setCircularData(formattedData);
      } else {
        setCircularData([]);
      }
    } catch (err) {
      console.error('Error fetching circulars:', err);
      setCircularData([]);
    }
  };

  const getAllPolls = async () => {
    try {
      const type = tabValue === 0 ? 'Organization' : 'IT';

      const endpoint =
        tabValue === 0
          ? `/basicmaster/getAllPollsByOrgId?branchCode=${branchCode}&orgId=${orgId}&type=${type}&department=ALL`
          : `/basicmaster/getAllPollsByOrgId?branchCode=${branchCode}&orgId=${orgId}&department=${department}&type=${type}`;

      const result = await apiCalls('get', endpoint);

      if (result && result.paramObjectsMap.pollsVO) {
        const transformed = result.paramObjectsMap.pollsVO.map(poll => ({
          ...poll,
          options: poll.pollDetailsVO.map(option => ({
            id: option.id.toString(),
            text: option.options,
            votes: option.votes || 0
          }))
        }));
        setPollData(transformed);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPollData(error.message || 'Failed to fetch');
    }
  };

  useEffect(() => {
    GetCircularByOrgId();
    getAllPolls();
  }, [tabValue]);


  // Get current posts based on tab
  const posts = tabValue === 0 ? organizationPosts : itPosts;
  const currentPost = posts[currentPostIndex];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Custom Buttons for Organization and IT */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant={tabValue === 0 ? 'contained' : 'outlined'}
          onClick={() => setTabValue(0)}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: tabValue === 0 ? theme.palette.primary.main : 'transparent',
            color: tabValue === 0 ? '#fff' : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: tabValue === 0 ? theme.palette.primary.dark : theme.palette.action.hover,
            },
          }}
        >
          Organization
        </Button>

        {/* Render department button only if department exists */}
        {department && (
          <Button
            variant={tabValue === 1 ? 'contained' : 'outlined'}
            onClick={() => setTabValue(1)}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: tabValue === 1 ? theme.palette.secondary.main : 'transparent',
              color: tabValue === 1 ? '#fff' : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: tabValue === 1 ? theme.palette.secondary.dark : theme.palette.action.hover,
              },
            }}
          >
            {department}
          </Button>
        )}
      </Box>


      {/* Content for Organization or IT Tab */}
      <CardWrapper>
        {/* Nested Tabs for POST, POLL */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-start' }}>
          {['POST', 'POLL'].map((tab) => (
            <Button
              key={tab}
              startIcon={tab === 'POST' ? <PostIcon /> : <PollIcon />}
              onClick={() => setNestedTabValue(tab)}
              variant={nestedTabValue === tab ? 'contained' : 'outlined'}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '20px',
              }}
            >
              {tab}
            </Button>
          ))}
        </Box>

        {/* Content for POST Tab */}
        {nestedTabValue === 'POST' && (
          <Box sx={{ mt: 3, minHeight: '280px' }}>
            <Post tabValue={tabValue} circularData={circularData} setCircularData={setCircularData} />
          </Box>
        )}

        {/* Content for POLL Tab */}
        {nestedTabValue === 'POLL' && (
          <Box sx={{ mt: 3, minHeight: '280px' }}>
            <Poll tabValue={tabValue} pollData={pollData} setPollData={setPollData} />
          </Box>
        )}
      </CardWrapper>

    </Box>
  );
};

export default Main;
