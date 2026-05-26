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
    // {
    //   key: 'employeeName',
    //   label: 'Assigned To',
    //   render: (value) => (
    //     <Typography variant="body2" fontWeight="500">
    //       {value}
    //     </Typography>
    //   )
    // },
    {
      key: 'location',
      label: 'Assigned To',
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
      icon: <BusinessCenter sx={{ fontSize: 26, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #3a6b6d 0%, #2f5b5d 45%, #244446 100%)',
      shadow: '0 10px 24px rgba(58,107,109,0.25)'
    },
    {
      title: 'Allocated',
      value: assetCounts.allocatedAssets,
      subtitle: 'Assets currently in use',
      icon: <CheckCircle sx={{ fontSize: 26, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #3a6b6d 0%, #2f5b5d 45%, #244446 100%)',
      shadow: '0 10px 24px rgba(58,107,109,0.25)'
    },
    {
      title: 'Available',
      value: assetCounts.availableAssets,
      subtitle: 'Ready for allocation',
      icon: <TrendingUp sx={{ fontSize: 26, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #3a6b6d 0%, #2f5b5d 45%, #244446 100%)',
      shadow: '0 10px 24px rgba(58,107,109,0.25)'
    }
  ];

  return (
    <Box sx={{ p: 0 }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
  {summaryCards.map((card, index) => (
    <Grid item xs={12} sm={4} md={4} key={index}>
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          background: card.gradient,
          color: '#fff',
          boxShadow: card.shadow,
          height: '88px',
          display: 'flex',
          alignItems: 'center',
          px: 1.8,
          transition: 'all 0.2s ease',

          '&:hover': {
            transform: 'translateY(-2px)'
          },

          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-22px',
            right: '-18px',
            width: '75px',
            height: '75px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)'
          }
        }}
      >
        {loading ? (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress
              size={20}
              sx={{ color: '#fff' }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* LEFT CONTENT */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.1,
                  mb: 0.5
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.1,
                  mb: 0.3
                }}
              >
                {card.value}
              </Typography>

              <Typography
                sx={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.78)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2
                }}
              >
                {card.subtitle}
              </Typography>
            </Box>

            {/* RIGHT ICON */}
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                flexShrink: 0
              }}
            >
              {React.cloneElement(card.icon, {
                sx: {
                  fontSize: 18,
                  color: '#fff'
                }
              })}
            </Box>
          </Box>
        )}
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