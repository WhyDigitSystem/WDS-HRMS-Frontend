import React from 'react';
import {
  Box, Card, CardContent, Typography, Button
} from '@mui/material';

const IncomeFromOtherSources = () => {
  return (
    <Box p={4}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Income From Other Sources
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Income from other sources is a residual category used to classify income that is not classified as taxed under any other head of income.
          </Typography>
          <Box mt={3}>
            <Button variant="outlined" color="primary">
              +Add Income From Other Sources
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IncomeFromOtherSources;
