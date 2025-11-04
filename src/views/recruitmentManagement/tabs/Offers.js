import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Grid,
  Avatar
} from '@mui/material';
import { Add as AddIcon, Description as DescriptionIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Offers = ({ offers, onCreateOffer, onViewOffer, onDeleteOffer, config }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateOffer}
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${config.primary_action_color} 0%, #2563eb 100%)`,
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
            borderRadius: 1,
            px: 1,
            py: 1,
            fontSize: '0.8rem',
            minWidth: '110px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
              boxShadow: '0 3px 8px rgba(59, 130, 246, 0.4)',
            },
          }}
        >
          Create Offer
        </Button>
      </Box>

      {
        offers.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: 2,
              border: '2px dashed #cbd5e1'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No offers created yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create an offer letter to get started
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {offers.map((offer) => (
              <Grid item xs={12} md={6} key={offer.id}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: config.primary_action_color }}>
                          {offer.candidate_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {offer.candidate_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {offer.position}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={offer.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            offer.status === 'Accepted' ? '#10b98120' :
                              offer.status === 'Pending' ? `${config.primary_action_color}20` :
                                `${config.secondary_action_color}20`,
                          color:
                            offer.status === 'Accepted' ? '#10b981' :
                              offer.status === 'Pending' ? config.primary_action_color :
                                config.secondary_action_color,
                          fontWeight: 500
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ color: config.text_color }}>
                          📧 {offer.candidate_email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ color: config.text_color }}>
                          📍 {offer.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: config.text_color }}>
                          🏢 {offer.department}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<DescriptionIcon />}
                      onClick={() => onViewOffer(offer)}
                      sx={{
                        color: config.primary_action_color,
                        borderColor: config.primary_action_color,
                        '&:hover': {
                          backgroundColor: `${config.primary_action_color}10`
                        }
                      }}
                      variant="outlined"
                    >
                      View Letter
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => onDeleteOffer(offer.id)}
                      sx={{
                        color: config.secondary_action_color,
                        '&:hover': {
                          color: '#ef4444'
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      }
    </Box >
  );
};

export default Offers;