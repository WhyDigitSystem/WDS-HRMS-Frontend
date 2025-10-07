import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const CurrencyExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" marginTop="20px">
        <CircularProgress />
        <Typography variant="h6" color="textSecondary" marginTop="10px">
          Loading exchange rates...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" marginTop="20px">
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];
  const filteredRates = Object.entries(exchangeRates).filter(([currency]) => majorCurrencies.includes(currency));

  return (
    <Box padding="20px">
      <Box display="flex" justifyContent="center" alignItems="center" marginBottom="20px">
        <MonetizationOnIcon style={{ fontSize: 40, color: '#4caf50', marginRight: '10px' }} />
        <Typography variant="h4" fontWeight="bold">
          Ex Rates (1 Unit to INR)
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '16px', color: '#3f51b5' }}>
                Currency
              </TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '16px', color: '#3f51b5' }}>
                Ex Rate (INR)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRates.map(([currency, rate]) => (
              <TableRow key={currency} style={{ backgroundColor: '#f9f9f9' }}>
                <TableCell align="center" style={{ fontSize: '14px', color: '#333' }}>
                  {currency}
                </TableCell>
                <TableCell align="center" style={{ fontSize: '14px', color: '#333' }}>
                  {(1 / rate).toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CurrencyExchangeRates;
