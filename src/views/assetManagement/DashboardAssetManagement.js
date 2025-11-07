import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  BusinessCenter,
  CheckCircle,
  TrendingUp,
  Refresh,
  Visibility,
  Inventory2
} from '@mui/icons-material';
import apiCalls from 'apicall';
import CommonListView from '../../utils/AssetCommonListViewTable';

const AssetManagement = ({ onReturnAsset, onShowAllocation }) => {
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

  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchCode] = useState(localStorage.getItem("branchCode"));

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const tableColumns = [
    {
      key: 'asset_details',
      label: 'Asset Details',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {row.asset_code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.asset_name}
          </Typography>
        </Box>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => (
        <Typography variant="body2" fontWeight="500">
          {value}
        </Typography>
      )
    },
    {
      key: 'employeeName',
      label: 'Assigned To',
      render: (value) => (
        <Typography variant="body2" fontWeight="500">
          {value}
        </Typography>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => (
        <Typography variant="body2" fontWeight="500">
          {value || 'Not specified'}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
          sx={{
            fontWeight: '600',
            minWidth: 100,
            height: '24px',
            fontSize: '0.75rem'
          }}
        />
      )
    }
  ];

  const tableActions = [
    {
      icon: <Visibility fontSize="small" />,
      tooltip: 'View allocation details',
      color: 'info',
      onClick: (asset) => handleShowAllocation(asset.id)
    }
  ];

  // Fixed pagination configuration - pass full assets array to CommonListView
  const paginationConfig = {
    currentPage,
    totalPages: Math.ceil(assets.length / itemsPerPage),
    itemsPerPage,
    indexOfFirstItem: (currentPage - 1) * itemsPerPage,
    indexOfLastItem: Math.min(currentPage * itemsPerPage, assets.length),
    onPageChange: (event, value) => setCurrentPage(value)
  };

  const fetchAssetCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCalls(
        'get',
        `/assetmanagement/getAssetCountByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );

      if (response.status && response.paramObjectsMap?.assetAllocationVO?.length > 0) {
        const assetData = response.paramObjectsMap.assetAllocationVO[0];
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
        throw new Error(response.paramObjectsMap?.message || 'No data received from API');
      }
    } catch (err) {
      console.error('Error fetching asset counts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetList = async () => {
    try {
      setListLoading(true);
      setListError(null);

      const response = await apiCalls(
        'get',
        `/assetmanagement/getAssetDashboardByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );

      if (response.status && response.paramObjectsMap?.assetAllocationVO) {
        const transformedAssets = response.paramObjectsMap.assetAllocationVO.map((asset, index) => ({
          id: index + 1,
          asset_code: `AST-${String(index + 1).padStart(3, '0')}`,
          asset_name: asset.assetname,
          category: asset.category,
          employeeName: asset.employeeName || 'Unassigned',
          status: asset.status === 'ASSIGNED' ? 'Allocated' : 'Available',
          assigned_to: asset.employeeName || '',
          location: asset.location
        }));

        setAssets(transformedAssets);
      } else {
        throw new Error(response.paramObjectsMap?.message || 'No asset data received from API');
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
    setCurrentPage(1); // Reset to first page on refresh
  };

  const handleShowAllocation = (assetId) => {
    if (onShowAllocation) {
      onShowAllocation(assetId);
    }
    console.log('Show allocation dialog for asset:', assetId);
  };

  const summaryCards = [
    {
      title: 'Total Assets',
      value: assetCounts.totalAssets,
      subtitle: `Allocated: ${assetCounts.allocatedAssets}`,
      icon: <BusinessCenter sx={{ fontSize: 32, color: 'white' }} />,
      gradientStart: '#667eea',
      gradientEnd: '#764ba2'
    },
    {
      title: 'Allocated',
      value: assetCounts.allocatedAssets,
      subtitle: 'Assets in use',
      icon: <CheckCircle sx={{ fontSize: 32, color: 'white' }} />,
      gradientStart: '#43cea2',
      gradientEnd: '#185a9d'
    },
    {
      title: 'Available',
      value: assetCounts.availableAssets,
      subtitle: 'Ready for allocation',
      icon: <TrendingUp sx={{ fontSize: 32, color: 'white' }} />,
      gradientStart: '#a8c0ff',
      gradientEnd: '#3f2b96'
    }
  ];

  return (
    <Box sx={{ p: 0 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${card.gradientStart}, ${card.gradientEnd})`,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.35s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.01)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
                },
              }}
            >
              <CardContent sx={{ p: 3.5, position: 'relative', zIndex: 2 }}>
                {loading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100px',
                    }}
                  >
                    <CircularProgress size={40} sx={{ color: 'white' }} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          letterSpacing: 0.5,
                          opacity: 0.9,
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.9)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Typography
                        variant="h4"
                        component="div"
                        fontWeight="700"
                        sx={{
                          mb: 1,
                          lineHeight: 1.2,
                          color: '#fff',
                          textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      >
                        {card.value}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          opacity: 0.9,
                          fontWeight: 500,
                        }}
                      >
                        {card.title === 'Allocation Rate' && <TrendingUp sx={{ fontSize: 18 }} />}
                        {card.subtitle}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: '0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.35)',
                          transform: 'rotate(8deg)',
                        },
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

      {/* Header with Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="600" color="text.primary">
          Asset Overview
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Common List View Component - Pass full assets array */}
      <CommonListView
        data={assets} // Pass full array, let CommonListView handle pagination
        columns={tableColumns}
        actions={tableActions}
        loading={listLoading}
        emptyMessage="No Assets Found"
        emptyDescription={listError ? 'Failed to load assets. Please try refreshing.' : 'Get started by adding your first asset to the system'}
        emptyIcon={Inventory2}
        pagination={paginationConfig}
        sx={{ mb: 2 }}
      />
    </Box>
  );
};

export default AssetManagement;