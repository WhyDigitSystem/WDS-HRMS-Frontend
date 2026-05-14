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
        borderRadius: 3,
        border: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        height: 400,
        backgroundColor: "#fafafa"
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #e0e0e0",
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "white",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
      >
        <Typography fontWeight={600}>💬 Comments</Typography>
      </Box>

      {/* CHAT AREA */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
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
                display="flex "
                justifyContent={mine ? "flex-end" : "flex-start"}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-end"
                  flexDirection={mine ? "row-reverse" : "row"}
                >
                  {/* AVATAR */}
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: mine ? "#1976d2" : "#9e9e9e",
                      fontSize: 14
                    }}
                  >
                    {c.display?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  {/* MESSAGE */}
                  <Paper
                    elevation={2}
                    sx={{
                      px: 2,
                      gap:3,
                      py: 1.2,
                      maxWidth: 280,
                      borderRadius: 3,
                      bgcolor: mine ? "#1976d2" : "#ffffff",
                      color: mine ? "white" : "black",
                      position: "relative"
                    }}
                  >
                    {/* HEADER */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={0.5}
                      width={150}
                    >
                      <Typography
                        fontSize={11}
                        fontWeight={600}
                        sx={{ opacity: 0.8 }}
                      >
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
                            sx={{ color: "inherit", p: 0.5 }}
                          >
                            <MoreVertIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>

                    {/* TEXT */}
                    <Typography fontSize={13} lineHeight={1.4}>
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

      {/* INPUT */}
      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fff"
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder={editing ? "Edit comment..." : "Write a comment..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3
              }
            }}
          />

          <IconButton
            onClick={handleSend}
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              "&:hover": { bgcolor: "#1565c0" }
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