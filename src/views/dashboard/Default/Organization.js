import React, { useState } from 'react';
import {
    Box, Typography, Button, Modal, TextField, Card, CardContent, LinearProgress, IconButton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import PostIcon from '@mui/icons-material/PostAdd'; // Icon for POST
import PollIcon from '@mui/icons-material/Poll'; // Icon for POLL
import PraiseIcon from '@mui/icons-material/ThumbUp'; // Icon for PRAISE
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; // Icon for voting
import ThumbDownIcon from '@mui/icons-material/ThumbDown'; // Icon for voting

// Styled Components
const CardWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
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

// Typing Cursor CSS
const typingCursorStyle = {
    display: 'inline-block',
    width: '2px',
    height: '1em',
    backgroundColor: 'black',
    animation: 'blink 1s steps(2, start) infinite',
    '@keyframes blink': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0 },
    },
};

// Create Post Modal Component
const CreatePostModal = ({ open, handleClose, handleCreatePost, postContent, isEdit, handleEditPost }) => {
    const [subject, setSubject] = useState(postContent?.subject || '');
    const [content, setContent] = useState(postContent?.content || '');
    const [image, setImage] = useState(postContent?.image || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        const post = { subject, content, image };
        if (isEdit) {
            handleEditPost(post);
        } else {
            handleCreatePost(post);
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
                {image && (
                    <Box sx={{ mb: 2 }}>
                        <img src={image} alt="Uploaded" style={{ maxWidth: '25%', height: 'auto' }} />
                    </Box>
                )}
                <Box sx={{ mb: 2 }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </Box>
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

// Create Poll Modal Component
const CreatePollModal = ({ open, handleClose, handleCreatePoll }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        const poll = { question, options, votes: Array(options.length).fill(0) };
        handleCreatePoll(poll);
        handleClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Create Poll
                </Typography>
                <TextField
                    fullWidth
                    label="Poll Question"
                    variant="outlined"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    sx={{ mb: 2 }}
                />
                {options.map((option, index) => (
                    <TextField
                        key={index}
                        fullWidth
                        label={`Option ${index + 1}`}
                        variant="outlined"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        sx={{ mb: 2 }}
                    />
                ))}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Create
                </Button>
            </Box>
        </Modal>
    );
};

// Poll Card Component
const PollCard = ({ poll, onVote }) => {
    const totalVotes = poll.votes.reduce((sum, vote) => sum + vote, 0);

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {poll.question}
                </Typography>
                {poll.options.map((option, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {option}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={totalVotes > 0 ? (poll.votes[index] / totalVotes) * 100 : 0}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2">
                                {poll.votes[index]} votes
                            </Typography>
                            <Box>
                                <IconButton onClick={() => onVote(index, 1)}>
                                    <ThumbUpIcon />
                                </IconButton>
                                <IconButton onClick={() => onVote(index, -1)}>
                                    <ThumbDownIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};

const OrganizationTab = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [nestedTabValue, setNestedTabValue] = useState(0);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
    const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
    const [organizationPosts, setOrganizationPosts] = useState([]);
    const [itPosts, setItPosts] = useState([]);
    const [organizationPolls, setOrganizationPolls] = useState([]);
    const [itPolls, setItPolls] = useState([]);
    const [postToEdit, setPostToEdit] = useState(null);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);

    // Handle creating a new post
    const handleCreatePost = (post) => {
        if (tabValue === 0) {
            setOrganizationPosts([...organizationPosts, post]);
        } else {
            setItPosts([...itPosts, post]);
        }
    };

    // Handle editing a post
    const handleEditPost = (post) => {
        if (tabValue === 0) {
            const updatedPosts = organizationPosts.map((p, index) =>
                index === postToEdit ? post : p
            );
            setOrganizationPosts(updatedPosts);
        } else {
            const updatedPosts = itPosts.map((p, index) =>
                index === postToEdit ? post : p
            );
            setItPosts(updatedPosts);
        }
        setPostToEdit(null);
    };

    // Handle creating a new poll
    const handleCreatePoll = (poll) => {
        if (tabValue === 0) {
            setOrganizationPolls([...organizationPolls, poll]);
        } else {
            setItPolls([...itPolls, poll]);
        }
    };

    // Handle voting on a poll
    const handleVote = (pollIndex, optionIndex, vote) => {
        const updatedPolls = tabValue === 0 ? [...organizationPolls] : [...itPolls];
        updatedPolls[pollIndex].votes[optionIndex] += vote;
        if (tabValue === 0) {
            setOrganizationPolls(updatedPolls);
        } else {
            setItPolls(updatedPolls);
        }
    };

    const handleOpenEditPostModal = (index) => {
        setPostToEdit(index);
        setIsEditPostModalOpen(true);
    };

    const handleNextPost = () => {
        const posts = tabValue === 0 ? organizationPosts : itPosts;
        setCurrentPostIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0));
    };

    const handlePreviousPost = () => {
        const posts = tabValue === 0 ? organizationPosts : itPosts;
        setCurrentPostIndex((prev) => (prev > 0 ? prev - 1 : posts.length - 1));
    };

    const posts = tabValue === 0 ? organizationPosts : itPosts;
    const polls = tabValue === 0 ? organizationPolls : itPolls;
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
                    IT
                </Button>
            </Box>

            {/* Content for Organization or IT Tab */}
            <CardWrapper>
                {/* Nested Tabs */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-start' }}>
                    <Box
                        onClick={() => setNestedTabValue(0)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            color: nestedTabValue === 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                            fontWeight: nestedTabValue === 0 ? 600 : 400,
                            '&:hover': {
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        <PostIcon />
                        <Typography variant="h6" style={{ fontSize: '14px' }}>POST</Typography>
                    </Box>
                    <Box
                        onClick={() => setNestedTabValue(1)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            color: nestedTabValue === 1 ? theme.palette.success.main : theme.palette.text.secondary,
                            fontWeight: nestedTabValue === 1 ? 600 : 400,
                            '&:hover': {
                                color: theme.palette.success.main,
                            },
                        }}
                    >
                        <PollIcon />
                        <Typography variant="h6" style={{ fontSize: '14px' }}>POLL</Typography>
                    </Box>
                    <Box
                        onClick={() => setNestedTabValue(2)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            color: nestedTabValue === 2 ? theme.palette.warning.main : theme.palette.text.secondary,
                            fontWeight: nestedTabValue === 2 ? 600 : 400,
                            '&:hover': {
                                color: theme.palette.warning.main,
                            },
                        }}
                    >
                        <PraiseIcon />
                        <Typography variant="h6" style={{ fontSize: '14px' }}>PRAISE</Typography>
                    </Box>
                </Box>

                {/* Content for Nested Tabs */}
                {nestedTabValue === 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsCreatePostModalOpen(true)}
                            >
                                Create Post
                            </Button>
                        </Box>
                        {/* Display Post Count */}
                        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                            Total Posts: {posts.length}
                        </Typography>
                        {/* Display Single Post */}
                        {posts.length > 0 && (
                            <Box sx={{ mt: 4 }}>
                                <Box
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: theme.palette.divider,
                                        borderRadius: '8px',
                                    }}
                                >
                                    <Typography variant="h6" className='text-center fw-bold fs-6' sx={{ fontWeight: 700 }}>
                                        {currentPost.subject}
                                    </Typography>
                                    <div className="d-flex" style={{ width: '100%' }}>
                                        {currentPost.image && (
                                            <Box sx={{ mt: 2, flex: '0 0 25%', maxWidth: '25%' }}>
                                                <img src={currentPost.image} alt="Post" style={{ width: '100%', height: 'auto' }} />
                                            </Box>
                                        )}
                                        <div style={{ flex: 1, marginLeft: currentPost.image ? '16px' : '0' }}>
                                            <Typography>
                                                {currentPost.content}
                                                <span style={typingCursorStyle}></span>
                                            </Typography>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleOpenEditPostModal(currentPostIndex)}
                                        sx={{ mt: 1 }}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                                {/* Next and Previous Buttons */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                    <Button variant="contained" onClick={handlePreviousPost}>
                                        Previous
                                    </Button>
                                    <Button variant="contained" onClick={handleNextPost}>
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
                {nestedTabValue === 1 && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsCreatePostModalOpen(true)}
                            >
                                Create Post
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => setIsCreatePollModalOpen(true)}
                            >
                                Create Poll
                            </Button>
                        </Box>
                        {/* Display Poll Count */}
                        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                            Total Polls: {polls.length}
                        </Typography>
                        {/* Display Polls */}
                        {polls.length > 0 && (
                            <Box sx={{ mt: 4 }}>
                                {polls.map((poll, index) => (
                                    <PollCard
                                        key={index}
                                        poll={poll}
                                        onVote={(optionIndex, vote) => handleVote(index, optionIndex, vote)}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </CardWrapper>

            {/* Modals */}
            <CreatePostModal
                open={isCreatePostModalOpen || isEditPostModalOpen}
                handleClose={() => {
                    setIsCreatePostModalOpen(false);
                    setIsEditPostModalOpen(false);
                    setPostToEdit(null);
                }}
                handleCreatePost={handleCreatePost}
                handleEditPost={handleEditPost}
                postContent={postToEdit !== null ? (tabValue === 0 ? organizationPosts[postToEdit] : itPosts[postToEdit]) : null}
                isEdit={isEditPostModalOpen}
            />
            <CreatePollModal
                open={isCreatePollModalOpen}
                handleClose={() => setIsCreatePollModalOpen(false)}
                handleCreatePoll={handleCreatePoll}
            />
        </Box>
    );
};

export default OrganizationTab;