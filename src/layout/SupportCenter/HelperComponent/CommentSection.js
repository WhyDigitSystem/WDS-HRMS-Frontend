import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';

import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const CommentSection = ({
  commentsVO = [],
  currentUser,
  onSubmitComment,
  onEditComment,
  onDeleteComment
}) => {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] =
    useState(null);

  const scrollRef = useRef(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [commentsVO]);

  /* ---------------- NORMALIZE COMMENTS ---------------- */
  const comments = useMemo(() => {
    return commentsVO
      .map((c) => ({
        id: c.id,

        text: c.comments,

        createdAt: c.commonDate?.createdon,

        time: dayjs(
          c.commonDate?.createdon,
          'DD-MM-YYYY hh:mm:ss A'
        ).fromNow(),

        user: (
          c.userName ||
          c.createdBy ||
          ''
        )
          .toLowerCase()
          .trim(),

        display:
          c.displayName ||
          c.userName?.split('@')[0] ||
          c.createdBy ||
          'User'
      }))
      .sort((a, b) => {
        const first = dayjs(
          a.createdAt,
          'DD-MM-YYYY hh:mm:ss A'
        ).valueOf();

        const second = dayjs(
          b.createdAt,
          'DD-MM-YYYY hh:mm:ss A'
        ).valueOf();

        return first - second;
      });
  }, [commentsVO]);

  /* ---------------- CHECK OWNER ---------------- */
  const isMine = (comment) =>
    currentUser?.toLowerCase()?.trim() ===
    comment.user;

  /* ---------------- MENU ---------------- */
  const handleMenuOpen = (
    event,
    comment
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  /* ---------------- SEND COMMENT ---------------- */
  const handleSend = async () => {
    if (!text.trim()) return;

    if (editing) {
      await onEditComment(
        text,
        editing.id
      );

      setEditing(null);
    } else {
      await onSubmitComment(text);
    }

    setText('');
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = () => {
    setEditing(selectedComment);

    setText(selectedComment.text);

    handleMenuClose();
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    await onDeleteComment(
      selectedComment.id
    );

    handleMenuClose();
  };

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: 430,
        overflow: 'hidden',
        backgroundColor: '#f4f7fb'
      }}
    >
      {/* ---------------- HEADER ---------------- */}
      <Box
        sx={{
          px: 2,
          py: 1.6,
          borderBottom:
            '1px solid #e2e8f0',

          background:
            'linear-gradient(135deg, #4f46e5, #6366f1)',

          color: '#ffffff'
        }}
      >
        <Typography
          fontWeight={700}
          fontSize={16}
        >
          💬 Comments
        </Typography>
      </Box>

      {/* ---------------- COMMENTS ---------------- */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 2
        }}
      >
        <Stack spacing={2}>
          {comments.map((c) => {
            const mine = isMine(c);

            return (
              <Box
                key={c.id}
                display="flex"
                justifyContent={
                  mine
                    ? 'flex-end'
                    : 'flex-start'
                }
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-end"
                  flexDirection={
                    mine
                      ? 'row-reverse'
                      : 'row'
                  }
                >
                  {/* ---------------- AVATAR ---------------- */}
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,

                      bgcolor: mine
                        ? '#4f46e5'
                        : '#94a3b8',

                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    {c.display
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </Avatar>

                  {/* ---------------- MESSAGE ---------------- */}
                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.3,
                      maxWidth: 320,
                      borderRadius: 4,

                      bgcolor: mine
                        ? '#4f46e5'
                        : '#ffffff',

                      color: mine
                        ? '#ffffff'
                        : '#1e293b',

                      position: 'relative',

                      boxShadow:
                        '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* ---------------- TOP BAR ---------------- */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                      mb={0.7}
                    >
                      <Typography
                        fontSize={11}
                        fontWeight={700}
                        sx={{
                          opacity: 0.9
                        }}
                      >
                        {c.display}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                      >
                        <Typography
                          fontSize={10}
                          sx={{
                            opacity: 0.75,

                            color: mine
                              ? '#e0e7ff'
                              : '#64748b',

                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {c.time}
                        </Typography>

                        {mine && (
                          <IconButton
                            size="small"
                            onClick={(e) =>
                              handleMenuOpen(
                                e,
                                c
                              )
                            }
                            sx={{
                              color:
                                '#e0e7ff',

                              p: 0.3
                            }}
                          >
                            <MoreVertIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>

                    {/* ---------------- TEXT ---------------- */}
                    <Typography
                      fontSize={13}
                      lineHeight={1.5}
                      sx={{
                        wordBreak:
                          'break-word'
                      }}
                    >
                      {c.text}
                    </Typography>
                  </Paper>
                </Stack>
              </Box>
            );
          })}

          <div ref={scrollRef} />
        </Stack>
      </Box>

      {/* ---------------- INPUT AREA ---------------- */}
      <Box
        sx={{
          p: 1.5,
          borderTop:
            '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <TextField
            fullWidth
            size="small"
            placeholder={
              editing
                ? 'Edit comment...'
                : 'Write a comment...'
            }
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            sx={{
              '& .MuiOutlinedInput-root':
              {
                borderRadius: 3,
                backgroundColor:
                  '#f8fafc'
              }
            }}
          />

          <IconButton
            onClick={handleSend}
            disabled={!text.trim()}
            sx={{
              bgcolor: '#4f46e5',
              color: '#ffffff',

              '&:hover': {
                bgcolor: '#4338ca'
              },

              '&.Mui-disabled': {
                bgcolor: '#c7d2fe',
                color: '#ffffff'
              }
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* ---------------- MENU ---------------- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Edit
        </MenuItem>

        <MenuItem onClick={handleDelete}>
          <DeleteIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CommentSection;