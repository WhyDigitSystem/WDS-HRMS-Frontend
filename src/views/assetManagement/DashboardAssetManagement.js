import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  alpha,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BusinessCenter,
  CheckCircle,
  Schedule,
  TrendingUp,
  Person,
  Refresh,
  Visibility
} from '@mui/icons-material';

const AssetManagement = ({ onReturnAsset, onShowAllocation, config }) => {
  const [assetCounts, setAssetCounts] = useState({
    totalAssets: 0,
    allocatedAssets: 0,
    availableAssets: 0,
    allocationRate: 0
  });
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listError, setListError] = useState(null);

  // API configuration
  const API_BASE_URL = 'http://192.168.29.111:8047/api/assetmanagement';
  const BRANCH_CODE = 'WDSBLR';
  const ORG_ID = '1000000001';

  // Fetch asset counts from API
  const fetchAssetCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/getAssetCountByOrgId?branchCode=${BRANCH_CODE}&orgId=${ORG_ID}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.paramObjectsMap?.assetAllocationVO?.length > 0) {
        const assetData = data.paramObjectsMap.assetAllocationVO[0];
        const total = assetData.totalAsset || 0;
        const allocated = assetData.allocatedAsset || 0;
        const available = assetData.availableAsset || 0;
        const rate = total > 0 ? (allocated / total) * 100 : 0;

        setAssetCounts({
          totalAssets: total,
          allocatedAssets: allocated,
          availableAssets: available,
          allocationRate: rate
        });
      } else {
        throw new Error(data.paramObjectsMap?.message || 'No data received from API');
      }
    } catch (err) {
      console.error('Error fetching asset counts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch asset list from API
  const fetchAssetList = async () => {
    try {
      setListLoading(true);
      setListError(null);

      const response = await fetch(
        `${API_BASE_URL}/getAssetDashboardByOrgId?branchCode=${BRANCH_CODE}&orgId=${ORG_ID}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.paramObjectsMap?.assetAllocationVO) {
        const transformedAssets = data.paramObjectsMap.assetAllocationVO.map((asset, index) => ({
          id: index + 1,
          asset_code: `AST-${String(index + 1).padStart(3, '0')}`,
          asset_name: asset.assetname,
          category: asset.category,
          status: asset.status === 'ASSIGNED' ? 'Allocated' : 'Available',
          assigned_to: asset.employeeName || '',
          location: asset.location
        }));

        setAssets(transformedAssets);
      } else {
        throw new Error(data.paramObjectsMap?.message || 'No asset data received from API');
      }
    } catch (err) {
      console.error('Error fetching asset list:', err);
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchAssetCounts(), fetchAssetList()]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const summaryCards = [
    {
      title: 'Total Assets',
      value: assetCounts.totalAssets,
      icon: <BusinessCenter />,
      color: 'primary',
      subtitle: 'All company assets',
      gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
    },
    {
      title: 'Allocated',
      value: assetCounts.allocatedAssets,
      icon: <CheckCircle />,
      color: 'success',
      subtitle: `${assetCounts.allocationRate.toFixed(1)}% utilization`,
      gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)'
    },
    {
      title: 'Available',
      value: assetCounts.availableAssets,
      icon: <Schedule />,
      color: 'warning',
      subtitle: 'Ready for allocation',
      gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Allocated': return 'warning';
      case 'Maintenance': return 'error';
      default: return 'default';
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const handleReturnAsset = (assetId) => {
    if (onReturnAsset) {
      onReturnAsset(assetId);
    }
    console.log('Return asset:', assetId);
  };

  const handleShowAllocation = () => {
    if (onShowAllocation) {
      onShowAllocation();
    }
    console.log('Show allocation dialog');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="600"
            color="text.primary"
          >
            Asset Management
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage company assets, allocations, and availability
        </Typography>
      </Box>

      {/* Error Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchAssetCounts}>
              Retry
            </Button>
          }
        >
          Failed to load asset counts: {error}
        </Alert>
      )}

      {listError && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchAssetList}>
              Retry
            </Button>
          }
        >
          Failed to load asset list: {listError}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                background: card.gradient,
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                },
                position: 'relative',
                overflow: 'hidden',
                minHeight: '160px'
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                {loading ? (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100px'
                  }}>
                    <CircularProgress size={40} sx={{ color: 'white' }} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          opacity: 0.9,
                          fontWeight: 500
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="div"
                        fontWeight="700"
                        sx={{ mb: 1 }}
                      >
                        {card.value.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          opacity: 0.8
                        }}
                      >
                        <TrendingUp fontSize="inherit" />
                        {card.subtitle}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Asset Overview Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%)'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Asset Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete list of company assets and their current status
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  py: 2,
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider'
                }}>
                  Asset Details
                </TableCell>
                <TableCell sx={{
                  py: 2,
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider'
                }}>
                  Category
                </TableCell>
                <TableCell sx={{
                  py: 2,
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider'
                }}>
                  Status
                </TableCell>
                <TableCell sx={{
                  py: 2,
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider'
                }}>
                  Assigned To
                </TableCell>
                <TableCell sx={{
                  py: 2,
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider'
                }}>
                  Location
                </TableCell>
                <TableCell sx={{
                  py: 2,
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider'
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight="500">
                        Loading assets...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <BusinessCenter
                        sx={{
                          fontSize: 64,
                          color: 'text.secondary',
                          opacity: 0.3,
                          mb: 2
                        }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="500"
                        gutterBottom
                      >
                        No Assets Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {listError ? 'Failed to load assets. Please try refreshing.' : 'No assets available for this organization.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    sx={{
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'scale(1.002)'
                      },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell sx={{ py: 3 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                          {asset.asset_code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {asset.asset_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Chip
                        label={asset.category}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: '500' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Chip
                        label={asset.status}
                        color={getStatusColor(asset.status)}
                        variant={asset.status === 'Available' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                          fontWeight: '600',
                          minWidth: 90
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {asset.assigned_to && (
                          <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                        )}
                        <Typography variant="body2" fontWeight="500">
                          {asset.assigned_to || 'Unassigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Typography variant="body2">
                        {asset.location || 'Not specified'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Tooltip title="View allocation details">
                        <IconButton
                          size="small"
                          onClick={() => handleShowAllocation(asset.id)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'white'
                            }
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AssetManagement;