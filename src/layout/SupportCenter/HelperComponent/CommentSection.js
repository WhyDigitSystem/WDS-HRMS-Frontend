import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useState, useMemo, useRef, useEffect } from "react";

const CommentSection = ({
  commentsVO = [],
  currentUser,
  onSubmitComment,
  onEditComment,
  onDeleteComment
}) => {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);

  const scrollRef = useRef(null);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commentsVO]);

  /* ---------- TIME AGO ---------- */
  const timeAgo = (dateStr) => {
    if (!dateStr) return "";

    const parsed = new Date(
      dateStr.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
    );

    const diff = Date.now() - parsed.getTime();
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (min < 1) return "just now";
    if (min < 60) return `${min} min ago`;
    if (hr < 24) return `${hr} hr ago`;
    return `${day} day${day > 1 ? "s" : ""} ago`;
  };

  /* ---------- NORMALIZE ---------- */
  const comments = useMemo(() => {
    return commentsVO
      .map((c) => ({
        id: c.id,
        text: c.comments,
        createdAt: c.commonDate?.createdon,
        time: timeAgo(c.commonDate?.createdon),
        user: (c.userName || c.createdBy || "").toLowerCase(),
        display:
          c.displayName ||   // 🔥 use value from parent (already cleaned)
          c.userName?.split("@")[0] ||
          c.createdBy ||
          "User"
      }))
      .sort((a, b) => {
        const parse = (d) =>
          new Date(
            d?.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
          ).getTime();
        return parse(a.createdAt) - parse(b.createdAt);
      });
  }, [commentsVO]);

  const isMine = (c) =>
    currentUser?.toLowerCase()?.trim() === c.user;

  /* ---------- ACTIONS ---------- */
  const handleSend = async () => {
    if (!text.trim()) return;

    const latestText = text;

    setText("");

    try {
      if (editing) {
        await onEditComment(latestText, editing.id);
        setEditing(null);
      } else {
        await onSubmitComment(latestText);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMenuOpen = (e, c) => {
    setAnchorEl(e.currentTarget);
    setSelected(c);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelected(null);
  };

  const handleEdit = () => {
    setEditing(selected);
    setText(selected.text);
    handleClose();
  };

  const handleDelete = async () => {
    await onDeleteComment(selected.id);
    handleClose();
  };

  return (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRadius: 3,
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      backgroundColor: '#fff'
    }}
  >
    {/* HEADER */}
    <Box
      sx={{
        px: 2,
        py: 1.5,
        background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Typography fontWeight={600} fontSize={14}>
        💬 Comments
      </Typography>
    </Box>

    {/* CHAT AREA */}
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        py: 2,
        backgroundColor: '#f8fafc'
      }}
    >
      <Stack spacing={1.5}>
        {comments.map((c) => {
          const mine = isMine(c);

          return (
            <Box
              key={c.id}
              sx={{
                display: 'flex',
                justifyContent: mine ? 'flex-end' : 'flex-start'
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-end"
                flexDirection={mine ? 'row-reverse' : 'row'}
                sx={{ maxWidth: '75%' }}
              >
                {/* AVATAR */}
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: mine ? '#3a6b6d' : '#94a3b8',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  {c.display?.charAt(0)?.toUpperCase()}
                </Avatar>

                {/* BUBBLE */}
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 3,
                    background: mine
                      ? 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)'
                      : '#ffffff',
                    color: mine ? '#fff' : '#0f172a',
                    border: mine ? 'none' : '1px solid #e2e8f0',
                    boxShadow: mine
                      ? '0 6px 16px rgba(42,75,77,0.25)'
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    wordBreak: 'break-word'
                  }}
                >
                  {/* META */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                      gap: 1
                    }}
                  >
                    <Typography fontSize={11} fontWeight={600} sx={{ opacity: 0.85 }}>
                      {c.display}
                    </Typography>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography fontSize={10} sx={{ opacity: 0.7 }}>
                        {c.time}
                      </Typography>

                      {mine && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, c)}
                          sx={{
                            color: 'inherit',
                            p: 0.3
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>

                  {/* MESSAGE */}
                  <Typography fontSize={13} lineHeight={1.5}>
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

    {/* INPUT AREA */}
    <Box
      sx={{
        p: 1.2,
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#fff'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder={editing ? 'Edit comment...' : 'Write a comment...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#f8fafc',
              fontSize: 13
            }
          }}
        />

        <IconButton
          onClick={handleSend}
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#3a6b6d',
            color: '#fff',
            borderRadius: 2,
            boxShadow: '0 6px 14px rgba(42,75,77,0.25)',
            '&:hover': {
              bgcolor: '#2a4b4d'
            }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>

    {/* MENU */}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
      <MenuItem onClick={handleEdit}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} />
        Edit
      </MenuItem>
      <MenuItem onClick={handleDelete}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
        Delete
      </MenuItem>
    </Menu>
  </Box>
);
};

export default CommentSection;