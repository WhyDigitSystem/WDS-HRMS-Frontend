import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Paper, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const HouseProperty = () => {
  return (
    <Box p={3} sx={{ backgroundColor: '#f9f9f9' }}>
      <Grid container spacing={3}>
        {/* Own Residence Section */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                I Own Residence
              </Typography>
              <Paper
                elevation={0}
                sx={{ backgroundColor: '#e6f8fc', p: 2, border: '1px solid #bde9f5', borderRadius: 1 }}
              >
                <Typography variant="body2" color="textSecondary">
                  There are no own residence details available.
                </Typography>
              </Paper>
              <Box mt={3} textAlign="center">
                <Button variant="contained" color="primary" size="large">
                  + Add Own Residence
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* House Property Declaration Information Section */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <InfoOutlinedIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                House Property Declaration
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="You can add more than one rented property or own property for the current financial year." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="For rented property if the total rent is more than ₹1,00,000 then you need to provide either PAN of owner or declaration letter." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="For rented property you are eligible for HRA and in case HRA is not paid by your employer you will be eligible for exemption under 80 GG." />
                </ListItem>
                <ListItem>
                  <ListItemText primary="For own property/residence you will be eligible for house loan interest exemption under Section 24." />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HouseProperty;
