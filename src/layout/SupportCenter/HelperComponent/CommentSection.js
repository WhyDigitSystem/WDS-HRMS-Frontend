import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const CommentSection = ({ commentsVO, currentUser, onSubmitComment, onEditComment, onDeleteComment }) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    const transformed = commentsVO.map((c) => ({
      id: c.id,
      author: c.createdBy,
      text: c.comments,
      createdAt: dayjs(c.commonDate?.createdon, 'DD-MM-YYYY hh:mm:ss a').fromNow()
    }));
    setComments(transformed);
  }, [commentsVO]);

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleSubmit = () => {
    if (editingCommentId) {
      onEditComment(comment, editingCommentId);
    } else {
      onSubmitComment(comment);
    }
    setComment('');
    setEditingCommentId(null);
  };

  const handleEditComment = (comment) => {
    setComment(comment.text);
    setEditingCommentId(comment.id);
    handleMenuClose();
  };

  const handleDeleteComment = (comment) => {
    onDeleteComment(comment.id);
    handleMenuClose();
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#007BFF' }}>
        💬 Comments
      </Typography>

      <Stack spacing={2} sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
        {comments.map((c) => (
          <Fade in={true} key={c.id}>
            <Paper
              elevation={2}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1,
                borderRadius: 3,
                backgroundColor: '#fafafa',
                borderLeft: '5px solid #FF421B',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                position: 'relative'
              }}
            >
              <Avatar sx={{ bgcolor: '#FF421B', color: 'white' }}>{c.author?.charAt(0)}</Avatar>

              <Box flex={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={600} variant="subtitle2">
                    {c.author}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {c.createdAt}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                  {c.text}
                </Typography>
              </Box>

              {c.author === currentUser && (
                <Tooltip title="Options">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, c)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          </Fade>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          multiline
          minRows={1}
          maxRows={4}
          label={editingCommentId ? 'Edit your comment' : 'Write a comment...'}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <Tooltip title={editingCommentId ? 'Update' : 'Send'}>
          <span>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={!comment.trim()}
              sx={{
                backgroundColor: '#FF421B',
                textTransform: 'none',
                borderRadius: 3,
                px: 2,
                '&:hover': { backgroundColor: '#e63e1a' }
              }}
            >
              {editingCommentId ? 'Update' : 'Send'}
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleEditComment(selectedComment)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteComment(selectedComment)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CommentSection;
