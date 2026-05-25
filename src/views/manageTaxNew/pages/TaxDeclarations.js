import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, Stack, Typography, } from '@mui/material';
import Listview from '../pages/lListview';
import apiCalls from 'apicall';

const TaxDeclarations = ({employee,employeeName,selectedYear}) => {
  const branch = localStorage.getItem('branch');
  const userName = localStorage.getItem('userName');
  const employeeCode = localStorage.getItem('employeeCode');
  // const L = 'WDS031'
  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');
  const createdBy = userName;
  const [data, setData] = useState({});
  const [getAllData, setGetAllData] = useState([]);
  const [id, setId] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

 
  

  const formatNumber = (value) => {
    return Number(value).toLocaleString('en-IN', {
      maximumFractionDigits: 0
    });
  };
  const cards = [
    {
      title: 'Gross Income',
      amount: `₹${formatNumber(data?.grossIncome || 0)}`,
      subtitle: 'Per annum',
      textColor: 'rgb(30 41 59)',
      border: '#e2e8f0'
    },
    {
      title: 'Total Deductions',
      amount: `₹${formatNumber(data?.totalDedcutions || 0)}`,
      subtitle: '80C + 80D + HRA',
      textColor: 'rgb(5 150 105)',
      border: '#e2e8f0'
    },
    {
      title: 'Taxable Income',
      amount: `₹${formatNumber(data?.taxableIncome || 0)}`,
      subtitle: 'After exemptions',
      textColor: 'rgb(30 41 59)',
      border: '#e2e8f0'
    },
    {
      title: 'Monthly TDS',
      amount: `₹${formatNumber(data?.yearlyTds || 0)}`,
      subtitle: 'Deducted from salary',
      textColor: 'rgb(217 119 6)',
      border: '#e2e8f0'
    }
  ];

  const columns = [
    { id: 1, Label: 'Section', accessor: 'section' },
    { id: 2, Label: 'INVESTMENT TYPE', accessor: 'investmentType' },
    { id: 3, Label: 'DECLARED (₹)', accessor: 'declared' },
    { id: 4, Label: 'LIMIT (₹)', accessor: 'limitAmount' },
    // { id: 5, Label: 'PROOF', accessor: 'proof' },
    { id: 5, Label: 'STATUS', accessor: 'status' },
    { id: 6, Label: 'UPLOAD', accessor: 'fileName' }
  ];

  const CardsData = async () => {
    try {
      const res = await apiCalls(
        'get',
        `investmentDeclaration/getDashBoardDetailsNew?branch=${branch}&employeeCode=${employee=== ''?employeeCode:employee}&orgId=${orgId}`
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
        `investmentDeclaration/getInvestmentDeclarationDetails?branch=${branch}&employeeCode=${employee=== ''?employeeCode:employee}&orgId=${orgId}`
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
  }, [employee,employeeName,selectedYear]);

  return (
    <>
      {/* card */}
      <div className="container-fluid">
        <Grid container spacing={1}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ p: 0 }}>
              <Card
                sx={{
                  borderRadius: '18px',
                  // backgroundColor: card.bg,

                  border: `1px solid ${card.border}`,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  transition: '0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent
                  sx={{
                    padding: '17px'
                  }}
                >
                  <Stack spacing={0.2}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        //   color: '#0f172a',
                        color: card.textColor
                      }}
                    >
                      {card.amount}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: 'rgb(148 163 184)'
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
      {/* list view */}
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
