import React, { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Modal,
  IconButton,
  Button,
  TextField,
  Divider,
  LinearProgress,
  FormControl,
  CircularProgress,
  RadioGroup,
  Radio,
  Chip,
  FormControlLabel
} from '@mui/material';
import {
  Poll as PollIcon,
  HowToVote as HowToVoteIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';

function Poll({ tabValue, setPollData, pollData }) {
  const theme = useTheme();
  const [polls, setPolls] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [editId, setEditId] = useState('');
  const [showAllPolls, setShowAllPolls] = useState(false);
  const [pollDetails, setPollDetails] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [newPoll, setNewPoll] = useState({
    question: '',
    expiresDate: '',
    maxSelection: 1,
    multiSelect: false
  });
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');
  const branchName = localStorage.getItem('branch');
  const department = localStorage.getItem('department');
  const loginUserName = localStorage.getItem('userName');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    getAllPolls();
  }, []);

  const getAllPolls = async () => {
    try {
      setIsLoading(true);
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
        setPolls(transformed);
        setPollData(transformed);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      setFetchError(error.message || 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId) => {
    console.log("Submitting vote for:", pollId);
    const selectedOptionId = selectedOptions[pollId];
    if (!selectedOptionId) {
      toast.warning('Please select an option before voting');
      return;
    }

    // Find the relevant poll and selected option
    const poll = polls.find(p => p.id === pollId);
    if (!poll) {
      toast.error('Poll not found');
      return;
    }
    const selectedOption = poll.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) {
      toast.error('Invalid option selected');
      return;
    }

    // Prepare payload according to API requirements
    const saveData = [{
      branchCode: branchCode,
      branchName: branchName,
      department: department,
      options: selectedOption.id,
      // Send option text instead of ID
      orgId: parseInt(orgId, 10),  // Ensure number type
      pollId: pollId,
      question: poll.question,      // Get question from poll object
      userName: loginUserName,
    }];

    try {
      setIsLoading(true);
      const response = await apiCalls('put', '/basicmaster/createUpdatepollVote', saveData);


      if (response?.status) {
        // Update local state with new votes
        const updatedPolls = polls.map(item => {
          if (item.id === pollId) {
            const updatedOptions = item.options.map(opt =>
              opt.id === selectedOptionId ? { ...opt, votes: opt.votes + 1 } : opt
            );
            const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);
            return { ...item, options: updatedOptions, totalVotes, hasVoted: true };
          }
          return item;
        });

        setPolls(updatedPolls);
        setListViewData(updatedPolls);
        toast.success('Vote submitted successfully!');
      } else {
        toast.error(response?.message || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Error submitting vote');
      console.error('Voting error:', error);
    } finally {
      setIsLoading(false);
      setSelectedOptions(prev => ({ ...prev, [pollId]: null }));
    }
  };

  const handleSave = async () => {
    // Filter out empty options
    const validOptions = pollDetails.filter(opt => opt.trim() !== '');
    
    if (!newPoll.question.trim() || validOptions.length < 2) {
      showToast('error', 'Please fill in all required fields and provide at least two options.');
      return;
    }

    const type = tabValue === 0 ? 'Organization' : 'IT';
    const saveData = {
      ...(editId && { id: editId }),
      active: true,
      branchCode,
      branchName,
      createdBy: loginUserName,
      department: tabValue === 0 ? 'All' : department,
      maxSelection: newPoll.maxSelection,
      multiSelect: newPoll.multiSelect,
      orgId,
      pollDetailsDTO: validOptions.map(opt => ({ options: opt })),
      question: newPoll.question,
      expiresDate: newPoll.expiresDate,
      updatedBy: loginUserName,
      type
    };

    try {
      setIsLoading(true);
      const response = await apiCalls('put', '/basicmaster/createUpdatepolls', saveData);
      if (response.status) {
        showToast('success', editId ? 'Poll updated successfully' : 'Poll created successfully');
        getAllPolls();
        setOpenCreateModal(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'Failed to save poll');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Error saving poll');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePollDetailsChange = (index, value) => {
    const updatedPollDetails = [...pollDetails];
    updatedPollDetails[index] = value;
    setPollDetails(updatedPollDetails);
  };

  const addOption = () => {
    setPollDetails([...pollDetails, ""]);
  };

  const removeOption = (index) => {
    if (pollDetails.length <= 2) {
      showToast('error', 'Poll must have at least two options');
      return;
    }
    const updatedPollDetails = [...pollDetails];
    updatedPollDetails.splice(index, 1);
    setPollDetails(updatedPollDetails);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && polls.length === 0 && !fetchError) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Grid container spacing={3}>
        {pollData.length > 0 ? (
          pollData
            .slice(0, showAllPolls ? pollData.length : 1)
            .map(poll => (
              <Grid item xs={12} md={6} lg={12} key={poll.id}>
                <Card variant="outlined" sx={{
                  height: '100%',
                  width: '100%',
                  borderColor: poll.hasVoted ? theme.palette.success.light : theme.palette.primary.light,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={poll.hasVoted ? 'Voted' : 'Active'} size="small" color={poll.hasVoted ? 'success' : 'primary'} />
                      <Typography variant="caption" color="text.secondary">{formatDate(poll.createdDate)}</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>{poll.question}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>{poll.totalVotes || 0} votes</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>{poll.expiresDate ? `Ends ${formatDate(poll.expiresDate)}` : 'No deadline'}</Typography>
                      </Box>
                    </Box>

                    {poll.hasVoted ? (
                      poll.options.map(option => (
                        <Box key={option.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight={500}>{option.text}</Typography>
                            <Typography variant="body2">{Math.round((option.votes / (poll.totalVotes || 1)) * 100)}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={(option.votes / (poll.totalVotes || 1)) * 100} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                          <Typography variant="caption">{option.votes} votes</Typography>
                        </Box>
                      ))
                    ) : (
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          value={selectedOptions[poll.id] || ''}
                          onChange={(e) => setSelectedOptions(prev => ({ ...prev, [poll.id]: e.target.value }))}
                        >
                          <Grid container spacing={1}>
                            {poll.options.map(option => (
                              <Grid item xs={12} sm={6} key={option.id}>
                                <FormControlLabel
                                  value={option.id}
                                  control={<Radio />}
                                  label={option.text}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </RadioGroup>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>

                          <Button
                            variant="contained"
                            startIcon={<HowToVoteIcon sx={{ fontSize: 20 }} />}
                            onClick={() => handleVote(poll.id)}
                            sx={{
                              mt: 2,
                              width: { xs: '90%', sm: '30%' },
                              fontWeight: 'bold',
                              borderRadius: 2,
                              background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                              color: 'white',
                              boxShadow: '0 3px 5px 2px rgba(63, 81, 181, .3)',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #2196f3, #3f51b5)',
                                boxShadow: '0 6px 10px 4px rgba(33, 150, 243, .3)',
                                transform: 'scale(1.03)'
                              }
                            }}
                          >
                            Submit Vote
                          </Button>

                        </Box>
                      </FormControl>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
        ) : !fetchError ? (
          <Grid item xs={12}>
            <Card sx={{ p: 5, textAlign: 'center', border: '2px dashed', borderColor: theme.palette.divider }}>
              <PollIcon sx={{ fontSize: 50, color: theme.palette.text.secondary, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6">No active polls</Typography>
              <Typography variant="body2" color="text.secondary">Create a new poll to get started.</Typography>
            </Card>
          </Grid>
        ) : null}
      </Grid>

      <div className='d-flex justify-content-between align-items-center mt-2'>
        <IconButton
          size="large"
          color="primary"
          onClick={() => {
            setNewPoll({ question: '', expiresDate: '', maxSelection: 1, multiSelect: false });
            setPollDetails(["", ""]);
            setEditId('');
            setOpenCreateModal(true);
          }}
          disabled={userType === 'USER' && tabValue === 0 || userType === 'TEAM LEAD' && tabValue === 0}
          sx={{
            p: 1.5, // increase padding
            background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #2196f3, #3f51b5)'
            }
          }}
        >
          <AddIcon />
        </IconButton>


        <Button
          variant="contained"
          color="primary"
          endIcon={<MoreHorizIcon />}
          onClick={() => setViewAllModalOpen(true)}
          sx={{
            background: "linear-gradient(45deg, #3f51b5, #2196f3)",
            "&:hover": {
              background: "linear-gradient(45deg, #2196f3, #3f51b5)",
            },
          }}
        >
          View More
        </Button>
      </div>

      {/* Edit Poll Modal */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          width: { xs: '90vw', sm: '500px' },
        }}>
          <Typography variant="h6" mb={2}>{editId ? 'Edit Poll' : 'Create Poll'}</Typography>

          <TextField
            label="Question"
            variant="outlined"
            fullWidth
            value={newPoll.question}
            onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Expires At"
            type="date"
            fullWidth
            value={newPoll.expiresDate}
            onChange={(e) => setNewPoll({ ...newPoll, expiresDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Max Selection"
            type="number"
            fullWidth
            value={newPoll.maxSelection}
            onChange={(e) => setNewPoll({ ...newPoll, maxSelection: parseInt(e.target.value) || 1 })}
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            {pollDetails.map((detail, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  label={`Option ${index + 1}`}
                  fullWidth
                  value={detail}
                  onChange={(e) => handlePollDetailsChange(index, e.target.value)}
                  required
                />
                {index >= 2 && (
                  <IconButton 
                    onClick={() => removeOption(index)}
                    sx={{ ml: 1, color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addOption}
              sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
              Add Option
            </Button>
          </Box>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Poll'}
          </Button>
        </Box>
      </Modal>

      {/* View All Polls Modal */}
      <Modal open={viewAllModalOpen} onClose={() => setViewAllModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          width: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">All Polls</Typography>
            <IconButton onClick={() => setViewAllModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            {polls.length > 0 ? polls.map(poll => (
              <Grid item xs={12} md={6} key={poll.id}>
                <Card variant="outlined" sx={{
                  borderColor: poll.hasVoted ? theme.palette.success.light : theme.palette.primary.light,
                  '&:hover': {
                    boxShadow: 3
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={poll.hasVoted ? 'Voted' : 'Active'} size="small" color={poll.hasVoted ? 'success' : 'primary'} />
                      <Typography variant="caption" color="text.secondary">{formatDate(poll.createdDate)}</Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{poll.question}</Typography>
                    <Divider sx={{ mb: 1 }} />
                    {poll.options.map(option => (
                      <Box key={option.id} sx={{ mb: 1 }}>
                        <Typography variant="body2">{option.text} - {option.votes} vote(s)</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )) : (
              <Typography>No polls available.</Typography>
            )}
          </Grid>
        </Box>
      </Modal>

    </Box>
  );
}

export default Poll;