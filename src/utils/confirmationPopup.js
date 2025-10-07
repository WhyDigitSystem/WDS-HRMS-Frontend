import { Close as CloseIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';

const ConfirmationModal = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirmation-dialog-title"
      PaperProps={{
        style: {
          borderRadius: '12px', // Subtle rounding of corners
          padding: '20px',
          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)' // Light shadow for a crisp effect
        }
      }}
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 1.5,
          fontSize: '18px',
          fontWeight: '500',
          color: 'primary.main' // Primary color for the title
        }}
      >
        {title || 'Confirm Action'}
        <IconButton
          onClick={onCancel}
          aria-label="close"
          size="small"
          sx={{ color: 'secondary.main' }} // Secondary color for the close button
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: 1, textAlign: 'center' }}>
        <Typography
          variant="body1"
          sx={{
            fontSize: '15px',
            color: '#555',
            marginBottom: '20px',
            lineHeight: 1.6
          }}
        >
          {message || 'Are you sure you want to proceed with this action?'}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 1
        }}
      >
        <Button
          onClick={onCancel}
          sx={{
            backgroundColor: '#fff',
            color: 'secondary.main',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '8px 18px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            backgroundColor: 'primary.main',
            color: '#fff',
            borderRadius: '8px',
            padding: '8px 18px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'primary.dark' // Darker shade on hover
            }
          }}
          variant="contained"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
