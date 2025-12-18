// import React, { useEffect, useState } from 'react';
// import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
// import TrendingUpIcon from '@mui/icons-material/TrendingUp';
// import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import apiCalls from 'apicall';

// const StatsCards = ({ refreshTrigger }) => {
//   const [counts, setCounts] = useState({
//     totalCount: 0,
//     pendingCount: 0,
//     completedCount: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [orgId] = useState(localStorage.getItem('orgId'));
//   const [branchCode] = useState(localStorage.getItem('branchCode'));

//   // ✅ Fetch API Data
//   const getSeparationCounts = async () => {
//     setLoading(true);
//     try {
//       const response = await apiCalls(
//         'get',
//         `employeseparation/getInitiateSeparationCountByOrgId?branchCode=${branchCode}&orgId=${orgId}`
//       );

//       if (response.status === true) {
//         const data = response.paramObjectsMap.initiateSeparationVO?.[0] || {};
//         setCounts({
//           totalCount: data.totalCount || 0,
//           pendingCount: data.pendingCount || 0,
//           completedCount: data.completedCount || 0,
//         });
//       } else {
//         console.error('Failed to fetch counts');
//       }
//     } catch (error) {
//       console.error('Error fetching separation counts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getSeparationCounts();
//   }, [refreshTrigger]);

//   // 🧩 Card Config
//   const stats = [
//     {
//       label: 'TOTAL CASES',
//       value: counts.totalCount,
//       icon: <TrendingUpIcon sx={{ fontSize: 30 }} />,
//       color: '#2563eb',
//       gradient: 'linear-gradient(145deg, #e3f2fd, #ffffff)',
//     },
//     {
//       label: 'IN PROGRESS',
//       value: counts.pendingCount,
//       icon: <HourglassBottomIcon sx={{ fontSize: 30 }} />,
//       color: '#f59e0b',
//       gradient: 'linear-gradient(145deg, #fff8e1, #ffffff)',
//     },
//     {
//       label: 'COMPLETED',
//       value: counts.completedCount,
//       icon: <CheckCircleIcon sx={{ fontSize: 30 }} />,
//       color: '#16a34a',
//       gradient: 'linear-gradient(145deg, #dcfce7, #ffffff)',
//     },
//   ];

//   return (
//     <Grid container spacing={3} sx={{ mb: 0 }}>
//       {loading ? (
//         <Grid item xs={12} sx={{ textAlign: 'center', py: 5 }}>
//           <CircularProgress />
//           <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
//             Loading stats...
//           </Typography>
//         </Grid>
//       ) : (
//         stats.map((stat, index) => (
//           <Grid item xs={12} sm={6} md={4} key={index}>
//             <Card
//               sx={{
//                 borderRadius: 3,
//                 background: stat.gradient,
//                 border: '1px solid #e2e8f0',
//                 boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
//                 transition: 'all 0.3s ease',
//                 cursor: 'pointer',
//                 '&:hover': {
//                   transform: 'translateY(-4px)',
//                   boxShadow: `0 6px 20px ${stat.color}25`,
//                 },
//               }}
//             >
//               <CardContent
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   // py: 2,
//                   px: 3,
//                 }}
//               >
//                 {/* Icon Section */}
//                 <Box
//                   sx={{
//                     width: 56,
//                     height: 56,
//                     borderRadius: '50%',
//                     background: `${stat.color}15`,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     color: stat.color,
//                     boxShadow: `inset 0 0 6px ${stat.color}30`,
//                   }}
//                 >
//                   {stat.icon}
//                 </Box>

//                 {/* Value & Label */}
//                 <Box sx={{ textAlign: 'right' }}>
//                   <Typography
//                     variant="h4"
//                     sx={{
//                       fontWeight: 700,
//                       color: '#1e293b',
//                       mb: 0.3,
//                       letterSpacing: 0.5,
//                     }}
//                   >
//                     {stat.value}
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       color: '#64748b',
//                       fontWeight: 500,
//                       letterSpacing: 0.5,
//                     }}
//                   >
//                     {stat.label}
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))
//       )}
//     </Grid>
//   );
// };

// export default StatsCards;

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiCalls from 'apicall';

const StatsCards = ({ refreshTrigger }) => {
  const [counts, setCounts] = useState({
    totalCount: 0,
    pendingCount: 0,
    completedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchCode');

  const getSeparationCounts = async () => {
    setLoading(true);
    try {
      const response = await apiCalls(
        'get',
        `employeseparation/getInitiateSeparationCountByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );

      if (response?.status) {
        const data =
          response.paramObjectsMap?.initiateSeparationVO?.[0] || {};
        setCounts({
          totalCount: data.totalCount || 0,
          pendingCount: data.pendingCount || 0,
          completedCount: data.completedCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSeparationCounts();
  }, [refreshTrigger]);

  const stats = [
    {
      label: 'TOTAL CASES',
      value: counts.totalCount,
      icon: <TrendingUpIcon sx={{ fontSize: 26 }} />,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      label: 'IN PROGRESS',
      value: counts.pendingCount,
      icon: <HourglassBottomIcon sx={{ fontSize: 26 }} />,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'COMPLETED',
      value: counts.completedCount,
      icon: <CheckCircleIcon sx={{ fontSize: 26 }} />,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
  ];

  return (
    <Grid container spacing={2}>
      {loading ? (
        <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={28} />
          <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
            Loading statistics...
          </Typography>
        </Grid>
      ) : (
        stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                backgroundColor: '#fff',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 10px 24px ${stat.color}20`,
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 3,
                  '&:last-child': {
                    pb: 1.5, // 🔑 removes extra MUI padding
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>

                {/* Text */}
                <Box sx={{ textAlign: 'right' }}>
                 <Typography
  sx={{
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    color: stat.color,
    backgroundColor: `${stat.color}15`,
    px: 1.5,
    py: 0.5,
    borderRadius: '999px', 
    display: 'inline-block',
    minWidth: 36,
    textAlign: 'center',
  }}
>
  {stat.value}
</Typography>

                <Typography
  sx={{
    fontSize: 11,
    fontWeight: 600,
    color: '#6b7280',
    backgroundColor: `${stat.color}12`,
    px: 1,
    py: 0.4,
    borderRadius: 1,
    letterSpacing: 0.6,
    // display: 'inline-block',
    mt: 0.5,
  }}
>
  {stat.label}
</Typography>

                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default StatsCards;

