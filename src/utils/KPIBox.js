import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const KPIBox = ({ label, count, color, icon }) => {
  if (!label) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Paper
        elevation={4}
        component={motion.div}
        whileHover={{
          scale: 1.03,
          boxShadow: `0 12px 25px ${color}55`,
          background: `linear-gradient(135deg, ${color}20, #ffffff)`
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1, sm: 2 },
          //   padding: '18px 26px',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${color}15, #ffffff)`,
          borderLeft: `6px solid ${color}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          // subtle pulse animation
          '&:hover': {
            animation: 'pulse 1.2s infinite'
          }
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#555', fontWeight: 500, mb: 1 }}>
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: '#111'
              //   fontSize: { xs: 22, sm: 26, md: 30 }
            }}
          >
            <CountUp start={0} end={count ?? 0} duration={1.5} separator="," />
          </Typography>
        </Box>

        {/* Animated Icon */}
        <motion.div whileHover={{ rotate: [0, 10, -10, 0], y: [0, -5, 5, 0] }} transition={{ duration: 0.6, repeat: 0 }}>
          <Box
            sx={{
              fontSize: { xs: 32, sm: 42, md: 40 }, // Increased size
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': {
                fontSize: { xs: 32, sm: 42, md: 40 } // Ensures MUI icons scale properly
              }
            }}
          >
            {icon}
          </Box>
        </motion.div>
      </Paper>

      {/* Pulse keyframes */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </motion.div>
  );
};

export default KPIBox;
