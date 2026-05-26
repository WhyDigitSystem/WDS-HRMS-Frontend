import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, Stack, Typography, Box } from '@mui/material';

import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';

import Listview from '../pages/lListview';
import apiCalls from 'apicall';

const TaxDeclarations = () => {
  const branch = localStorage.getItem('branch');
  const userName = localStorage.getItem('userName');
  const employeeCode = localStorage.getItem('employeeCode');
  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');

  const createdBy = userName;

  const [data, setData] = useState({});
  const [getAllData, setGetAllData] = useState([]);
  const [id, setId] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const formatNumber = (value) =>
    Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const cards = [
    {
      title: 'Gross Income',
      amount: `₹${formatNumber(data?.grossIncome || 0)}`,
      subtitle: 'Per annum',
      icon: <TrendingUpRoundedIcon />,
    },
    {
      title: 'Total Deductions',
      amount: `₹${formatNumber(data?.totalDedcutions || 0)}`,
      subtitle: '80C + 80D + HRA',
      icon: <SavingsRoundedIcon />,
    },
    {
      title: 'Taxable Income',
      amount: `₹${formatNumber(data?.taxableIncome || 0)}`,
      subtitle: 'After exemptions',
      icon: <AccountBalanceWalletRoundedIcon />,
    },
    {
      title: 'Monthly TDS',
      amount: `₹${formatNumber(data?.yearlyTds || 0)}`,
      subtitle: 'Deducted from salary',
      icon: <CurrencyRupeeRoundedIcon />,
    }
  ];

  const columns = [
    { id: 1, Label: 'SECTION', accessor: 'section' },
    { id: 2, Label: 'INVESTMENT TYPE', accessor: 'investmentType' },
    { id: 3, Label: 'DECLARED (₹)', accessor: 'declared' },
    { id: 4, Label: 'LIMIT (₹)', accessor: 'limitAmount' },
    { id: 5, Label: 'PROOF', accessor: 'proof' },
    { id: 6, Label: 'STATUS', accessor: 'status' },
    { id: 7, Label: 'UPLOAD', accessor: 'fileName' }
  ];

  const CardsData = async () => {
    try {
      const res = await apiCalls(
        'get',
        `investmentDeclaration/getDashBoardDetailsNew?branch=${branch}&employeeCode=${userName}&orgId=${orgId}`
      );
      if (res.status) {
        setData(res?.paramObjectsMap?.dashBoardDetails?.[0] || {});
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getAll = async () => {
    try {
      const res = await apiCalls(
        'get',
        `investmentDeclaration/getInvestmentDeclarationDetails?branch=${branch}&employeeCode=${userName}&orgId=${orgId}`
      );
      if (res.status) {
        const main = res?.paramObjectsMap?.investmentDeclarationVO?.[0];
        setId(main?.id);
        setTotalAmount(main?.totalAmount);
        setGetAllData(main?.investmentDeclarationDetailsVO || []);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    CardsData();
    getAll();
  }, []);

  return (
    <>
      {/* SUMMARY CARDS */}
      <Box sx={{ mb: 1 }}>
        <Grid container spacing={1}>
          {cards.map((card, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid rgba(58,107,109,0.15)',
                  background: '#fff',
                  position: 'relative',
                  transition: '0.2s ease',
                  height: '100%',

                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 14px rgba(42,75,77,0.12)'
                  },

                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '3px',
                    width: '100%',
                    background:
                      'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)'
                  }
                }}
              >
                <CardContent sx={{ px: 1.5, py: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {/* TEXT */}
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography
                        sx={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px'
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#2a4b4d',
                          lineHeight: 1.1,
                          mt: 0.3
                        }}
                      >
                        {card.amount}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '10px',
                          color: '#94a3b8',
                          mt: 0.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {card.subtitle}
                      </Typography>
                    </Box>

                    {/* ICON */}
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'linear-gradient(135deg, rgba(58,107,109,0.12), rgba(42,75,77,0.08))',
                        border: '1px solid rgba(58,107,109,0.15)',
                        color: '#3a6b6d',

                        '& svg': {
                          fontSize: 18
                        }
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* TABLE */}
      <Listview
        columns={columns}
        data={getAllData}
        id={id}
        branch={branch}
        branchCode={branchCode}
        employeeCode={employeeCode}
        userName={userName}
        orgId={orgId}
        createdBy={createdBy}
        totalDeclared={`₹${formatNumber(totalAmount || 0)}`}
      />
    </>
  );
};

export default TaxDeclarations;