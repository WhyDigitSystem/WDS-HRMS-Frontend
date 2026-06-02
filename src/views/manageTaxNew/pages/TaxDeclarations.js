import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import Listview from '../pages/lListview';
import apiCalls from 'apicall';

const TaxDeclarations = ({ employee, employeeName, selectedYear }) => {
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

  const formatNumber = (value) => Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // ✅ TEAL THEME CARDS (UPDATED)
  const cards = [
    {
      title: 'Gross Income',
      amount: `₹${formatNumber(data?.grossIncome || 0)}`,
      subtitle: 'Per annum',
      textColor: '#2a4b4d',
      border: '#d6e6e6'
    },
    {
      title: 'Total Deductions',
      amount: `₹${formatNumber(data?.totalDedcutions || 0)}`,
      subtitle: '80C + 80D + HRA',
      textColor: '#2a4b4d',
      border: '#d6e6e6'
    },
    {
      title: 'Taxable Income',
      amount: `₹${formatNumber(data?.taxableIncome || 0)}`,
      subtitle: 'After exemptions',
      textColor: '#2a4b4d',
      border: '#d6e6e6'
    },
    {
      title: 'Monthly TDS',
      amount: `₹${formatNumber(data?.yearlyTds || 0)}`,
      subtitle: 'Deducted from salary',
      textColor: '#2a4b4d',
      border: '#e5e7eb'
    }
  ];

  const columns = [
    { id: 1, Label: 'Section', accessor: 'section' },
    { id: 2, Label: 'INVESTMENT TYPE', accessor: 'investmentType' },
    { id: 3, Label: 'DECLARED (₹)', accessor: 'declared' },
    { id: 4, Label: 'LIMIT (₹)', accessor: 'limitAmount' },
    { id: 5, Label: 'STATUS', accessor: 'status' },
    { id: 6, Label: 'UPLOAD', accessor: 'fileName' }
  ];

  const CardsData = async () => {
    try {
      const res = await apiCalls(
        'get',
        `investmentDeclaration/getDashBoardDetailsNew?branch=${branch}&employeeCode=${
          employee === '' ? employeeCode : employee
        }&orgId=${orgId}`
      );

      if (res.status === true) {
        setData(res?.paramObjectsMap?.dashBoardDetails[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAll = async () => {
    try {
      const res = await apiCalls(
        'get',
        `investmentDeclaration/getInvestmentDeclarationDetails?branch=${branch}&employeeCode=${
          employee === '' ? employeeCode : employee
        }&orgId=${orgId}`
      );

      if (res.status === true) {
        setId(res?.paramObjectsMap?.investmentDeclarationVO?.[0]?.id);
        setTotalAmount(res?.paramObjectsMap?.investmentDeclarationVO?.[0]?.totalAmount);
        setGetAllData(res?.paramObjectsMap?.investmentDeclarationVO?.[0]?.investmentDeclarationDetailsVO || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    CardsData();
    getAll();
  }, [employee, employeeName, selectedYear]);

  return (
    <>
      {/* ===== CARDS SECTION ===== */}
      <div className="container-fluid">
        <Grid container spacing={0.8}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: '14px',
                  border: `1px solid ${card.border}`,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                  transition: '0.25s',
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.10)'
                  }
                }}
              >
                <CardContent
                  sx={{
                    padding: '10px !important',
                    '&:last-child': { paddingBottom: '10px' }
                  }}
                >
                  <Stack spacing={0.3}>
                    {/* TITLE */}
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {card.title}
                    </Typography>

                    {/* AMOUNT */}
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: card.textColor
                      }}
                    >
                      {card.amount}
                    </Typography>

                    {/* SUBTITLE */}
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: '#94a3b8'
                      }}
                    >
                      {card.subtitle}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* ===== LIST VIEW ===== */}
      <div>
        <Listview
          columns={columns}
          data={getAllData}
          id={id}
          branch={branch}
          branchCode={branchCode}
          employeeCode={employeeCode}
          userName={userName}
          employee={employee}
          orgId={orgId}
          createdBy={createdBy}
          totalDeclared={`₹${formatNumber(totalAmount || 0)}`}
        />
      </div>
    </>
  );
};

export default TaxDeclarations;
