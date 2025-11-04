import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  LinearProgress,
  Avatar
} from '@mui/material';
import { Add as AddIcon, Schedule as ScheduleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CommonListView from '../../../utils/AssetCommonListViewTable';
import { borderRadius } from '@mui/system';

const Candidates = ({ candidates, onAddCandidate, onScheduleInterview, onDeleteCandidate, config }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = candidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(candidates.length / itemsPerPage);

  // Define columns for the CommonListView
  const columns = [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: config.primary_action_color,
            width: 32,
            height: 32,
            fontSize: '0.875rem'
          }}>
            {row.candidate_name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {row.candidate_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {row.candidate_email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'position',
      label: 'Position',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
          {value}
        </Typography>
      )
    },
    {
      key: 'resume_score',
      label: 'Resume Score',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 120 }}>
          <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 6,
                borderRadius: 1,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(135deg, ${config.primary_action_color} 0%, #2563eb 100%)`,
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 35, fontSize: '0.8rem' }}>
            {value}%
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: `${config.primary_action_color}20`,
            color: config.primary_action_color,
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px'
          }}
        />
      )
    }
  ];

  // Define actions for the CommonListView
  const actions = [
    {
      icon: <ScheduleIcon fontSize="small" />,
      tooltip: 'Schedule Interview',
      onClick: onScheduleInterview,
      color: 'primary'
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      tooltip: 'Delete Candidate',
      onClick: (candidate) => onDeleteCandidate(candidate.id),
      color: 'error'
    }
  ];

  // Pagination configuration
  const paginationConfig = {
    currentPage,
    totalPages,
    itemsPerPage,
    indexOfFirstItem: indexOfFirstItem + 1,
    indexOfLastItem: Math.min(indexOfLastItem, candidates.length),
    onPageChange: (event, value) => setCurrentPage(value)
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCandidate}
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${config.primary_action_color} 0%, #2563eb 100%)`,
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
            borderRadius: 1,
            px: 1,
            py: 1,
            fontSize: '0.8rem',
            minWidth: '110px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
              boxShadow: '0 3px 8px rgba(59, 130, 246, 0.4)',
            },
          }}
        >
          Add Candidate
        </Button>
      </Box>

      <CommonListView
        data={currentCandidates}
        columns={columns}
        actions={actions}
        emptyMessage="No candidates yet"
        emptyDescription="Add your first candidate to start the hiring process"
        pagination={paginationConfig}
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '2px solid',
          borderRadius: '10px',
          '& .MuiTableCell-root': {
            py: 1,
            fontSize: '0.9rem'
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontSize: '0.9rem',
            py: 1
          }
        }}
      />
    </Box>
  );
};

export default Candidates;