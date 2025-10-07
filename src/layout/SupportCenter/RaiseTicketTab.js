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
  borderRadius: '30px',
  textTransform: 'none',
  padding: '5px 15px',
  background: 'linear-gradient(145deg, #6a11cb, #2575fc)',
  color: '#fff',
  fontWeight: 400,
  fontSize: '14px',
  boxShadow: '0 4px 14px rgba(13, 7, 7, 0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #FF5252, #FFC107)'
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
              <UploadButton variant="outlined" component="label" startIcon={<IconCamera size={20} />}>
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

            <SubmitButton variant="contained" endIcon={<IconSend size={18} />} onClick={handleSubmit}>
              Submit Ticket
            </SubmitButton>
          </Box>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default RaiseTicketTab;
