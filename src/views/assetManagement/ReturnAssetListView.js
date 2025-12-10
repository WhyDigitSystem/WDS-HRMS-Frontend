import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper,
  Typography, Button
} from '@mui/material';

const ReturnAssetListView = ({ data, onRemove }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
      <Table size='small'>
        <TableHead>
          <TableRow
            sx={{
              background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
              '& .MuiTableCell-root': {
                color: 'white',
                fontWeight: 'bold',
                fontSize: '13px',
              },
            }}
          >
            <TableCell>Asset Code</TableCell>
            <TableCell>Asset Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Serial No</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.id || row.assetCode} hover sx={{ height: 30 }}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {row.assetCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.assetName}</Typography>
                </TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {row.brand}
                  </Typography>
                </TableCell>
                <TableCell>{row.serialNumber}</TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  {/* <Button
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => onRemove(row)}
                    sx={{
                      textTransform: "none",
                      fontSize: "10px",
                      minWidth: "60px",
                      paddingY: 0.1,
                    }}
                  >
                    Remove
                  </Button> */}
                  <Button
                  variant="contained"
                  size="small"
                  onClick={() => onRemove(row)}
                  sx={{
                   textTransform: "none",
                   fontSize: "10px",
                   minWidth: "60px",
                   paddingY: 0.1,
                   background: "linear-gradient(45deg, #FF6B6B, #FF3D3D)", 
                   color: "#fff", 
                  "&:hover": {
                    background: "linear-gradient(45deg, #FF4B4B, #FF1D1D)",
                  },
            }}
>
  Remove
</Button>

                </TableCell>
              </TableRow>
            ))
          ) : (
            // <TableRow>
            //   <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
            //     <Typography variant="body2" color="text.secondary">
            //       Data not found
            //     </Typography>
            //   </TableCell>
            // </TableRow>
            <TableRow>
  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      
      {/* Animated Icon */}
      <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
        <circle cx="45" cy="45" r="20" stroke="#999" strokeWidth="4" />
        <line x1="60" y1="60" x2="80" y2="80" stroke="#999" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="x2" values="80;75;80" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="y2" values="80;75;80" dur="1.4s" repeatCount="indefinite" />
        </line>

        <circle cx="45" cy="45" r="10" stroke="#999" strokeWidth="3">
          <animate attributeName="r" values="10;13;10" dur="1.4s" repeatCount="indefinite" />
        </circle>
      </svg>

      <Typography variant="body2" color="text.secondary">
        Data not found
      </Typography>
    </div>
  </TableCell>
</TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReturnAssetListView;

