import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { IconCamera, IconSend, IconX } from '@tabler/icons-react';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  background: '#ffffff'
}));

const ModernInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '14px',
    backgroundColor: '#f9f9f9',
    paddingRight: '10px',
    paddingLeft: '10px'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main
  }
}));

const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  backgroundColor: '#f0f0f0',
  color: '#333',
  '&:hover': {
    backgroundColor: '#e0e0e0'
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: '10px',
  textTransform: 'none',
  padding: '6px 16px',
  background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '13px',
  boxShadow: '0 6px 16px rgba(42, 75, 77, 0.25)',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: 'linear-gradient(135deg, #4b8587 0%, #355f61 100%)',
    boxShadow: '0 8px 20px rgba(42, 75, 77, 0.35)',
    transform: 'translateY(-1px)'
  },

  '&:active': {
    transform: 'translateY(0px)'
  }
}));

const RaiseTicketTab = ({ ticket, handleChange, handleSubmit }) => {
  return (
    <StyledPaper elevation={4}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ModernInput
            label="Subject"
            name="subject"
            value={ticket.subject}
            onChange={handleChange}
            fullWidth
            required
            error={ticket.errors.subject}
            helperText={ticket.errors.subject && 'Subject is required.'}
          />
        </Grid>
        <Grid item xs={12}>
          <ModernInput
            label="Description"
            name="description"
            value={ticket.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            required
            error={ticket.errors.description}
            helperText={ticket.errors.description && 'Description is required.'}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <UploadButton
                variant="outlined"
                component="label"
                startIcon={<IconCamera size={20} />}
                style={{
                  textTransform: 'none',
                  borderRadius: 10,
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid #3a6b6d',
                  color: '#2a4b4d',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(58, 107, 109, 0.08)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(42, 75, 77, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                Upload Screenshot
                <input type="file" name="image" hidden accept="image/*" onChange={handleChange} />
              </UploadButton>

              {ticket.image && (
                <Box mt={1} display="flex" alignItems="center" gap={2}>
                  <Box position="relative" display="inline-block">
                    <img
                      src={URL.createObjectURL(ticket.image)}
                      alt="Preview"
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
                    />
                    <IconX
                      size={18}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        background: '#fff',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        color: '#f44336',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => handleChange({ target: { name: 'image', value: null } })}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Selected: <strong>{ticket.image.name}</strong>
                  </Typography>
                </Box>
              )}
            </Box>

            <SubmitButton
              variant="contained"
              endIcon={<IconSend size={18} />}
              onClick={handleSubmit}
              style={{
                background: 'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
                paddingLeft: 24,
                paddingRight: 24
              }}
            >
              Submit Ticket
            </SubmitButton>
          </Box>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default RaiseTicketTab;
