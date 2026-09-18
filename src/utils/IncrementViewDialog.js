import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { useState } from 'react';

const IncrementViewDialog = ({ open, onClose, data, onApprove, onReject, isProcessing }) => {
  const [processingAction, setProcessingAction] = useState(null);

  if (!data) return null;

  const handleApprove = async () => {
    setProcessingAction('approve');
    try {
      await onApprove(data);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async () => {
    setProcessingAction('reject');
    try {
      await onReject(data);
    } finally {
      setProcessingAction(null);
    }
  };

  const isProcessingApprove = processingAction === 'approve' || isProcessing;
  const isProcessingReject = processingAction === 'reject' || isProcessing;

  // Calculate current amounts based on proposed amounts and increase percentage
  const calculateCurrentAmount = (proposedAmount, increasePercentage) => {
    const proposed = parseFloat(proposedAmount);
    const increase = parseFloat(increasePercentage);
    if (isNaN(proposed) || isNaN(increase)) return 0;
    return proposed / (1 + increase / 100);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>
        Increment Details
      </DialogTitle>
      <Divider />

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Name:</strong> {data.employeeName}</Typography>
            <Typography variant="body2"><strong>Code:</strong> {data.employeeCode}</Typography>
            <Typography variant="body2"><strong>Effective From:</strong> {data.effectiveFrom}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Reporting To:</strong> {data.reportingTo || '—'}</Typography>
            <Typography variant="body2"><strong>Department:</strong> {data.department}</Typography>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Salary Components
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell><strong>Component</strong></TableCell>
                <TableCell align="right"><strong>Current Amount (₹)</strong></TableCell>
                <TableCell align="right"><strong>Proposed Amount (₹)</strong></TableCell>
                <TableCell align="right"><strong>Increase %</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.incrementManagementDetailsVO?.length > 0 ? (
                data.incrementManagementDetailsVO.map((item, idx) => {
                  const currentAmount = calculateCurrentAmount(item.amount, data.totalCtcPercentage);
                  const increasePercentage = data.totalCtcPercentage || '15.00';
                  
                  return (
                    <TableRow key={idx}>
                      <TableCell>{item.heading}</TableCell>
                      <TableCell align="right">{formatCurrency(currentAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell align="right">{increasePercentage}%</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                    No salary components available
                  </TableCell>
                </TableRow>
              )}
              
              {/* Total Row */}
              {data.incrementManagementDetailsVO?.length > 0 && (
                <TableRow sx={{ backgroundColor: 'grey.50', borderTop: '2px solid grey' }}>
                  <TableCell><strong>Total CTC</strong></TableCell>
                  <TableCell align="right">
                    <strong>
                      {formatCurrency(
                        data.incrementManagementDetailsVO.reduce((total, item) => 
                          total + calculateCurrentAmount(item.amount, data.totalCtcPercentage), 0
                        )
                      )}
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      {formatCurrency(
                        data.incrementManagementDetailsVO.reduce((total, item) => total + parseFloat(item.amount || 0), 0)
                      )}
                    </strong>
                  </TableCell>
                  <TableCell align="right"><strong>{data.totalCtcPercentage}%</strong></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {data.remarks && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Remarks:</strong> {data.remarks}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleApprove}
          variant="contained" 
          color="success"
          disabled={isProcessingApprove || isProcessingReject}
          startIcon={isProcessingApprove ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ 
            minWidth: 100,
            '&:hover': {
              backgroundColor: 'success.dark',
              // Ensure text color remains visible
              color: 'white'
            }
          }}
        >
          {isProcessingApprove ? 'Approving...' : 'Approve'}
        </Button>

        <Button 
          onClick={handleReject}
          variant="contained" 
          color="error"
          disabled={isProcessingApprove || isProcessingReject}
          startIcon={isProcessingReject ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ 
            minWidth: 100,
            '&:hover': {
              backgroundColor: 'error.dark',
              // Ensure text color remains visible
              color: 'white'
            }
          }}
        >
          {isProcessingReject ? 'Rejecting...' : 'Reject'}
        </Button>

        <Button 
          onClick={onClose} 
          variant="outlined" 
          disabled={isProcessingApprove || isProcessingReject}
          sx={{
            minWidth: 100,
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'primary.main',
              // Ensure text color remains visible
              color: 'primary.main'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncrementViewDialog;