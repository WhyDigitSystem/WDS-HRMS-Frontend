import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import SubjectIcon from '@mui/icons-material/Subject';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Chip, IconButton, Modal, Paper, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useState } from 'react';

dayjs.extend(customParseFormat);

const TicketInfo = ({ selectedTicket }) => {
  const [open, setOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${selectedTicket.screenShot}`;
    link.download = `screenshot-${selectedTicket.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusChip = (status) => {
    const colorMap = {
      Open: 'primary',
      Closed: 'success',
      InProgress: 'warning'
    };

    return <Chip label={status} color={colorMap[status] || 'default'} size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
  };
  return (
    <>
      <Paper
        elevation={4}
        sx={{
          maxWidth: 900,
          mx: 'auto',
          p: 2,
          borderRadius: 5,
          background: 'linear-gradient(145deg, #ffffff, #f2f2f2)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          🧾 Ticket Summary
        </Typography> */}
        {/* 
        <Divider sx={{ mb: 3 }} /> */}

        <Box display="flex" justifyContent="space-between" gap={4} flexWrap="wrap">
          {/* Left Side */}
          <Box flex="1" display="grid" rowGap={2}>
            <Typography>
              <InfoIcon fontSize="small" sx={{ color: '#007BFF', verticalAlign: 'middle', mr: 1 }} />
              <strong>ID:</strong> {selectedTicket.id}
            </Typography>
            <Typography>
              <SubjectIcon fontSize="small" sx={{ color: '#28A745', verticalAlign: 'middle', mr: 1 }} />
              <strong>Subject:</strong> {selectedTicket.subject}
            </Typography>
            <Typography>
              <DescriptionIcon fontSize="small" sx={{ color: '#FFC107', verticalAlign: 'middle', mr: 1 }} />
              <strong>Description:</strong> {selectedTicket.description}
            </Typography>
            <Typography>
              <VisibilityIcon fontSize="small" sx={{ color: '#17A2B8', verticalAlign: 'middle', mr: 1 }} />
              <strong>Status:</strong> {getStatusChip(selectedTicket.status)}
            </Typography>
            <Typography>
              <EventIcon fontSize="small" sx={{ color: '#6F42C1', verticalAlign: 'middle', mr: 1 }} />
              <strong>Created On:</strong> {dayjs(selectedTicket.commonDate.createdon, 'DD-MM-YYYY hh:mm:ss a').format('DD MMM YYYY')}
            </Typography>
          </Box>

          {/* Screenshot with overlay download */}
          {selectedTicket.screenShot && (
            <Box
              position="relative"
              width={180}
              height={180}
              sx={{
                flexShrink: 0,
                overflow: 'hidden',
                borderRadius: 3,
                cursor: 'pointer',
                border: '1px solid #ddd',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover img': {
                  transform: 'scale(1.05)',
                  filter: 'brightness(1.1)'
                },
                '&:hover .download-icon': {
                  opacity: 1
                }
              }}
              onClick={() => setOpen(true)}
            >
              <img
                src={`data:image/png;base64,${selectedTicket.screenShot}`}
                alt="Screenshot"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease, filter 0.3s ease'
                }}
              />
              <Tooltip title="Download">
                <IconButton
                  className="download-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.8)'
                    }
                  }}
                  size="small"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Full Image Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
            zIndex: 1500
          }}
        >
          <Box position="relative">
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={`data:image/png;base64,${selectedTicket.screenShot}`}
              alt="Full Screenshot"
              style={{
                maxWidth: '92vw',
                maxHeight: '92vh',
                borderRadius: 16,
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
              }}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default TicketInfo;
