// src/components/OtherDeductions.js
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, useTheme,
  TextField, TableContainer, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Chip, Select, MenuItem,
  Dialog, DialogActions, DialogContent, Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  FormatListBulletedTwoTone as FormatListBulletedTwoToneIcon,
  Save as SaveIcon,
  CheckCircleOutline,
  CancelOutlined,
  CloudUpload as CloudUploadIcon,
  ControlCamera as ControlCameraIcon
} from '@mui/icons-material';

import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';

function TaxSavingAllowances() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [declarationId, setDeclarationId] = useState(null);
  const finYear = localStorage.getItem('finYear')
  const orgId = localStorage.getItem('orgId')
  const [deductions, setDeductions] = useState([
    {
      id: Date.now(),
      section: '',
      deductions: '',
      maxLimit: '',
      declaration: '',
      proofFile: null,
      proofFileName: '',
      status: 'Auto Accepted'
    }
  ]);

  const [proofDialog, setProofDialog] = useState({
    open: false,
    proofUrl: null
  });

  useEffect(() => {
    getAllGoals();
  }, []);

  const handleStatusChange = (id, status) => {
    setDeductions(
      deductions.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      section: '',
      deductions: '',
      maxLimit: '',
      declaration: '',
      proofFile: null,
      proofFileName: '',
      status: 'Auto Accepted'
    };
    setDeductions([...deductions, newRow]);
  };

  const handleDeleteRow = (id) => {
    if (deductions.length > 1) {
      setDeductions(deductions.filter(item => item.id !== id));
    }
  };

  const handleDeductionChange = (id, field, value) => {
    setDeductions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleClear = () => {
    setDeductions([
      {
        id: Date.now(),
        section: '',
        deductions: '',
        maxLimit: '',
        declaration: '',
        proofFile: null,
        proofFileName: '',
        status: 'Auto Accepted'
      }
    ]);
  };

  const handleProofChange = (id, file) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'application/pdf')) {
      setDeductions(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, proofFile: file, proofFileName: file.name }
            : item
        )
      );
    } else {
      showToast('error', 'Please upload a valid file (PNG, JPEG, or PDF)');
    }
  };

  const handleViewProof = (proofFile) => {
    if (!proofFile) return;

    const url = URL.createObjectURL(proofFile);
    setProofDialog({
      open: true,
      proofUrl: url
    });
  };

  const handleCloseProofDialog = () => {
    setProofDialog({ open: false, proofUrl: null });
    if (proofDialog.proofUrl) {
      URL.revokeObjectURL(proofDialog.proofUrl);
    }
  };

  const getAllGoals = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/managetax/getAllDeclarationByOrgId?orgId=${orgId}&finYear=2025`
      );

      if (response.status) {
        const declarationList = response.paramObjectsMap.declarationVO;

        if (declarationList.length > 0) {
          console.log('Fetched Declaration ID:', declarationList[0].id); // ✅ Confirm this logs correctly
          setDeclarationId(declarationList[0].id);
        } else {
          console.warn('Declaration list is empty');
        }
      } else {
        showToast('error', response.message || 'Failed to fetch declarations');
      }
    } catch (error) {
      console.error('Error fetching declarations:', error);
      showToast('error', 'Failed to fetch declarations');
    }
  };

  const handleSaveDeductions = async () => {
    setIsLoading(true);

    if (!declarationId) {
      showToast('error', 'Declaration ID missing');
      setIsLoading(false);
      return;
    }

    const hasEmptyDeclaration = deductions.some(d =>
      d.declaration === '' || isNaN(parseFloat(d.declaration))
    );

    const hasInvalidFiles = deductions.some(d =>
      d.proofFileName && !d.proofFile
    );

    if (hasEmptyDeclaration) {
      showToast('error', 'Please fill valid declaration amounts');
      setIsLoading(false);
      return;
    }

    if (hasInvalidFiles) {
      showToast('error', 'Proof files need to be re-uploaded');
      setIsLoading(false);
      return;
    }

    const payload = deductions.map(d => ({
      localId: d.id,
      section: d.section,
      declarationId,
      deductions: d.deductions,
      maxLimit: parseFloat(d.maxLimit) || 0,
      declaration: d.declaration.toString(),
      status: d.status,
    }));

    try {
      const response = await apiCalls(
        'put',
        '/managetax/saveOneCroreFiveLacDeductionsList',
        payload
      );

      if (response.status === true) {
        const savedList = response.paramObjectsMap?.savedList || [];

        const uploadPromises = savedList.map(async (saved) => {
          const matchingLocal = deductions.find(d => d.section === saved.section);

          if (matchingLocal && matchingLocal.proofFile) {
            const formData = new FormData();
            formData.append('file', matchingLocal.proofFile);

            return apiCalls(
              'post',
              `/managetax/uploadOneCroreFiveLacDeductionsInBloob?deductionId=${saved.id}`,
              formData,
              {},
              { 'Content-Type': 'multipart/form-data' }
            );
          }
        });

        await Promise.all(uploadPromises);

        showToast('success', 'Deductions saved successfully');
        handleClear();
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Saving failed');
      }
    } catch (error) {
      console.error('Error saving deductions:', error);
      showToast('error', 'Failed to save deductions');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary amounts
  const declaredAmount = deductions.reduce((sum, item) =>
    sum + parseFloat(item.declaration || 0), 0);

  const autoApprovedAmount = deductions.reduce((sum, item) =>
    item.status === 'Auto Accepted' ? sum + parseFloat(item.declaration || 0) : sum, 0);

  const acceptedAmount = deductions.reduce((sum, item) =>
    item.status === 'Accepted' ? sum + parseFloat(item.declaration || 0) : sum, 0);

  const rejectedAmount = deductions.reduce((sum, item) =>
    item.status === 'Rejected' ? sum + parseFloat(item.declaration || 0) : sum, 0);

  return (
    <>
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4">
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton
              title="List View"
              icon={FormatListBulletedTwoToneIcon}
              onClick={() => setListView(!listView)}
            />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              onClick={handleSaveDeductions}
              disabled={isLoading || !declarationId}
            />
          </div>

          {!listView ? (
            <Card elevation={4} sx={{ borderRadius: 2, marginBottom: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tax Saving Allowances
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Deductions under section 80C up to ₹1.5 lakhs
                </Typography>

                <Grid container spacing={3} my={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Amount Declared</Typography>
                    <Typography variant="subtitle1">₹ {declaredAmount.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Auto Approved Amount</Typography>
                    <Typography variant="subtitle1">₹ {autoApprovedAmount.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Amount Accepted</Typography>
                    <Typography variant="subtitle1">₹ {acceptedAmount.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Amount Rejected</Typography>
                    <Typography variant="subtitle1">₹ {rejectedAmount.toLocaleString()}</Typography>
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                  >
                    Add Deduction
                  </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                        <TableCell>Section</TableCell>
                        <TableCell>Deductions</TableCell>
                        <TableCell>Max Limit (₹)</TableCell>
                        <TableCell>Declaration (₹)</TableCell>
                        <TableCell>Proof</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deductions.map((row) => (
                        <TableRow hover key={row.id}>
                          <TableCell>
                            <TextField
                              size="small"
                              variant="outlined"
                              value={row.section}
                              fullWidth
                              onChange={(e) => handleDeductionChange(row.id, 'section', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              variant="outlined"
                              value={row.deductions}
                              fullWidth
                              onChange={(e) => handleDeductionChange(row.id, 'deductions', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              variant="outlined"
                              type="number"
                              value={row.maxLimit}
                              fullWidth
                              onChange={(e) => handleDeductionChange(row.id, 'maxLimit', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              variant="outlined"
                              type="number"
                              value={row.declaration}
                              fullWidth
                              onChange={(e) => handleDeductionChange(row.id, 'declaration', e.target.value)}
                              error={!row.declaration || isNaN(parseFloat(row.declaration))}
                              helperText={!row.declaration ? "Required" : ""}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                startIcon={<CloudUploadIcon />}
                                sx={{ color: 'rgb(103 58 183)' }}
                              >
                                {row.proofFileName || 'Upload Proof'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/png, image/jpeg, application/pdf"
                                  onChange={(e) => handleProofChange(row.id, e.target.files[0])}
                                />
                              </Button>
                              {row.proofFile && (
                                <IconButton
                                  onClick={() => handleViewProof(row.proofFile)}
                                  sx={{ color: 'rgb(103 58 183)' }}
                                  size="small"
                                >
                                  <ControlCameraIcon />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              variant="outlined"
                              color={
                                row.status === 'Auto Accepted' ? 'success' :
                                  row.status === 'Accepted' ? 'primary' : 'error'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton
                                size="small"
                                color="success"
                                title="Accept"
                                onClick={() => handleStatusChange(row.id, 'Accepted')}
                                disabled={row.status === 'Accepted'}
                              >
                                <CheckCircleOutline />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                title="Reject"
                                onClick={() => handleStatusChange(row.id, 'Rejected')}
                                disabled={row.status === 'Rejected'}
                              >
                                <CancelOutlined />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                title="Delete"
                                onClick={() => handleDeleteRow(row.id)}
                                disabled={deductions.length <= 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Dialog open={proofDialog.open} onClose={handleCloseProofDialog}>
                  <DialogContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Proof Document
                    </Typography>
                    {proofDialog.proofUrl ? (
                      proofDialog.proofUrl.endsWith('.pdf') ? (
                        <iframe
                          src={proofDialog.proofUrl}
                          width="500"
                          height="700"
                          title="proof-document"
                        />
                      ) : (
                        <Avatar
                          src={proofDialog.proofUrl}
                          alt="Proof document"
                          sx={{ width: '100%', height: 'auto', maxWidth: 500 }}
                          variant="square"
                        />
                      )
                    ) : (
                      <Typography>No proof available</Typography>
                    )}
                    <DialogActions>
                      <Button onClick={handleCloseProofDialog}>Close</Button>
                    </DialogActions>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={4} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Saved Deductions
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                        <TableCell>Section</TableCell>
                        <TableCell>Deductions</TableCell>
                        <TableCell>Max Limit</TableCell>
                        <TableCell>Declaration</TableCell>
                        <TableCell>Proof</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deductions.map((row) => (
                        <TableRow hover key={row.id}>
                          <TableCell>{row.section}</TableCell>
                          <TableCell>{row.deductions}</TableCell>
                          <TableCell>₹ {parseFloat(row.maxLimit || 0).toLocaleString()}</TableCell>
                          <TableCell>₹ {parseFloat(row.declaration || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            {row.proofFileName || '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              variant="outlined"
                              color={
                                row.status === 'Auto Accepted' ? 'success' :
                                  row.status === 'Accepted' ? 'primary' : 'error'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default TaxSavingAllowances;