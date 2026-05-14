import React,{useState,useEffect} from 'react';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import Listview from '../pages/lListview';
import apiCalls from 'apicall';
const TaxDeclarations = () => {
  const branch = localStorage.getItem('branch');
  const userName = localStorage.getItem('userName');
  const orgId = localStorage.getItem('orgId');
  const [data, setData] = useState([]);
const formatNumber = (value) =>{
  return Number(value).toLocaleString('en-IN');
}
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

const rows = [
  {
    section: '80C',
    type: 'PPF (Public Provident Fund)',
    declared: '148800',
    limit: '1,50,000',
    proof: 'Uploaded',
    status: 'Approved',
  },
  {
    section: '80C',
    type: 'ELSS Mutual Fund',
    declared: '50000',
    limit: '1,50,000',
    proof: 'Pending',
    status: 'Pending',
  },
  {
    section: '80D',
    type: 'Health Insurance (Self & Family)',
    declared: '25000',
    limit: '25,000',
    proof: 'Uploaded',
    status: 'Approved',
  },
  {
    section: '80D',
    type: 'Health Insurance (Parents)',
    declared: '50000',
    limit: '50,000',
    proof: 'Not Uploaded',
    status: 'Draft',
  },
  {
    section: 'HRA',
    type: 'House Rent Allowance (Metro)',
    declared: '180000',
    limit: '—',
    proof: 'Uploaded',
    status: 'Approved',
  },
  {
    section: '80E',
    type: 'Education Loan Interest',
    declared: '42000',
    limit: 'No Limit',
    proof: 'Pending',
    status: 'Pending',
  },
];

const CardsData = async () => {
  try{
  const res = await apiCalls('get',`investmentDeclaration/getDashBoardDetailsNew?branch=${branch}&employeeCode=${userName}&orgId=${orgId}`);
  if(res.status === true){
     setData(res.paramObjectsMap.dashBoardDetails);
  }
  }catch(error){
    console.log(error)
  }
}

useEffect(()=>{
  CardsData();
},[]);


  return (
    <>
      {/* card */}
      <div className="container-fluid">
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                    padding: '17px',
                  }}
                >
                  <Stack spacing={0.2} >
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
  rows={rows}
  totalDeclared="₹4,95,800"
/>
      </div>
    </>
  );
};

export default TaxDeclarations;
