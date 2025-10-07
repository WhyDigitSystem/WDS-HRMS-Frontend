import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, useTheme,
  TextField, TableContainer, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Chip,
  Dialog, DialogActions, DialogContent
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

function LacDeclaration() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [declarationId, setDeclarationId] = useState(null);
  const finYear = localStorage.getItem('finYear');
  const orgId = localStorage.getItem('orgId');
  const [deductions, setDeductions] = useState([
    {
      id: Date.now(),
      section: '',
      deductions: '',
      maxLimit: '',
      declaration: '',
      proofBase64: null,
      proofFileName: '',
      proofFileType: '',
      status: 'Auto Accepted'
    }
  ]);

  const [proofDialog, setProofDialog] = useState({
    open: false,
    proofUrl: null,
    fileType: ''
  });

  useEffect(() => {
    getAllDeclarations();
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
      proofBase64: null,
      proofFileName: '',
      proofFileType: '',
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
        proofBase64: null,
        proofFileName: '',
        proofFileType: '',
        status: 'Auto Accepted'
      }
    ]);
  };

  const handleProofChange = (id, file) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Please upload a valid file (PNG, JPG, or PDF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result.split(',')[1];
      setDeductions(prev =>
        prev.map(item =>
          item.id === id ? {
            ...item,
            proofBase64: base64Data,
            proofFileName: file.name,
            proofFileType: file.type
          } : item
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleViewProof = (proofBase64, fileType) => {
    if (!proofBase64) return;

    const dataUrl = `data:${fileType};base64,${proofBase64}`;
    setProofDialog({
      open: true,
      proofUrl: dataUrl,
      fileType: fileType
    });
  };

  const handleCloseProofDialog = () => {
    setProofDialog({ open: false, proofUrl: null, fileType: '' });
  };

  const getAllDeclarations = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/managetax/getAllDeclarationByOrgId?orgId=${orgId}&finYear=2025`
      );

      if (response.status) {
        const declarationList = response.paramObjectsMap.declarationVO;
        if (declarationList.length > 0) {
          setDeclarationId(declarationList[0].id);
          fetchDeductions(declarationList[0].id);
          console.log("ID", declarationList[0].id)
        }
      } else {
        showToast('error', response.message || 'Failed to fetch declarations');
      }
    } catch (error) {
      console.error('Error fetching declarations:', error);
      showToast('error', 'Failed to fetch declarations');
    }
  };

  const fetchDeductions = async (decId) => {
    try {
      const response = await apiCalls(
        'get',
        `/managetax/getOneCroreFiveLacDeductionsList?declarationId=${decId}`
      );
      
      if (response.status) {
        const deductionsList = response.paramObjectsMap?.oneCroreFiveLacDeductionsVO || [];
        setDeductions(
          deductionsList.map(item => ({
            id: item.id,
            section: item.section || '',
            deductions: item.deductions || '',
            maxLimit: item.maxLimit?.toString() || '',
            declaration: item.declaration?.toString() || '',
            status: item.status || 'Auto Accepted',
            proofBase64: item.proofBase64 || null,
            proofFileName: item.proofFileName || '',
            proofFileType: item.proofFileType || ''
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching deductions:', error);
      showToast('error', 'Failed to fetch deductions');
    }
  };

  const uploadProofForDeduction = async (deductionId, proofBase64, fileType, fileName) => {
    try {
      // Convert base64 to Blob
      const byteCharacters = atob(proofBase64);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: fileType });
      const file = new File([blob], fileName, { type: fileType });

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await apiCalls(
        'post',
        `/managetax/uploadOneCroreFiveLacDeductionsInBloob?id=${deductionId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );

      return uploadResponse.status;
    } catch (error) {
      console.error('Error uploading proof:', error);
      return false;
    }
  };

  const handleSaveDeductions = async () => {
    setIsLoading(true);

    if (!declarationId) {
      showToast('error', 'Declaration ID missing');
      setIsLoading(false);
      return;
    }

    // Validate declaration amounts
    const invalidDeclarations = deductions.filter(d =>
      d.declaration === '' || isNaN(parseFloat(d.declaration)) || parseFloat(d.declaration) < 0
    );

    if (invalidDeclarations.length > 0) {
      showToast('error', 'Please enter valid declaration amounts (non-negative numbers)');
      setIsLoading(false);
      return;
    }

    // Check max limits
    const exceededLimits = deductions.filter(d => {
      const maxLimit = parseFloat(d.maxLimit) || 0;
      const declaration = parseFloat(d.declaration) || 0;
      return maxLimit > 0 && declaration > maxLimit;
    });

    if (exceededLimits.length > 0) {
      showToast('error', 'Declaration amounts cannot exceed max limits');
      setIsLoading(false);
      return;
    }

    // Prepare payload without proofs
    const payload = deductions.map(d => ({
      localId: d.id,
      section: d.section,
      declarationId,
      deductions: d.deductions,
      maxLimit: parseFloat(d.maxLimit) || 0,
      declaration: d.declaration.toString(),
      status: d.status,
      // Exclude proofBase64 from payload
    }));

    try {
      // Save deductions first
      const saveResponse = await apiCalls(
        'put',
        '/managetax/saveOneCroreFiveLacDeductionsList',
        payload
      );

      if (saveResponse.status === true) {
        const updatedList = saveResponse.paramObjectsMap?.oneCroreFiveLacDeductionsVO || [];
        
        // Upload proofs for deductions that have them
        const uploadPromises = updatedList.map(async (item) => {
          const deduction = deductions.find(d => d.id === item.localId);
          if (deduction?.proofBase64) {
            return uploadProofForDeduction(
              item.id,
              deduction.proofBase64,
              deduction.proofFileType,
              deduction.proofFileName
            );
          }
          return true;
        });

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises);
        const allUploadsSuccessful = uploadResults.every(result => result);

        if (!allUploadsSuccessful) {
          showToast('warning', 'Deductions saved but some proof uploads failed');
        }

        // Update state with saved deductions
        setDeductions(
          updatedList.map(item => ({
            id: item.id,
            section: item.section || '',
            deductions: item.deductions || '',
            maxLimit: item.maxLimit?.toString() || '',
            declaration: item.declaration?.toString() || '',
            status: item.status || 'Auto Accepted',
            proofBase64: item.proofBase64 || null,
            proofFileName: item.proofFileName || '',
            proofFileType: item.proofFileType || ''
          }))
        );
        
        showToast('success', 'Deductions saved successfully');
      } else {
        showToast('error', saveResponse.paramObjectsMap?.errorMessage || 'Saving failed');
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
    (item.status === 'Auto Accepted' ? sum + (parseFloat(item.declaration) || 0) : sum), 0);

  const acceptedAmount = deductions.reduce((sum, item) =>
    (item.status === 'Accepted' ? sum + (parseFloat(item.declaration) || 0) : sum), 0);

  const rejectedAmount = deductions.reduce((sum, item) =>
    (item.status === 'Rejected' ? sum + (parseFloat(item.declaration) || 0) : sum), 0);

  return (
    <>
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4">
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton
              title={listView ? "Form View" : "List View"}
              icon={FormatListBulletedTwoToneIcon}
              onClick={() => setListView(!listView)}
            />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              onClick={handleSaveDeductions}
              disabled={isLoading || !declarationId}
              isLoading={isLoading}
            />
          </div>

          {!listView ? (
            <Card elevation={4} sx={{ borderRadius: 2, marginBottom: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  1.5 Lac Deductions
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Deductions under section 80C up to ₹1.5 lakhs
                </Typography>

                <Grid container spacing={3} my={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Amount Declared</Typography>
                    <Typography variant="subtitle1">₹ {declaredAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Auto Approved Amount</Typography>
                    <Typography variant="subtitle1">₹ {autoApprovedAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Amount Accepted</Typography>
                    <Typography variant="subtitle1">₹ {acceptedAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">Amount Rejected</Typography>
                    <Typography variant="subtitle1">₹ {rejectedAmount.toLocaleString('en-IN')}</Typography>
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
                              inputProps={{ min: 0 }}
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
                              error={!row.declaration || isNaN(parseFloat(row.declaration)) || parseFloat(row.declaration) < 0}
                              helperText={
                                !row.declaration ? "Required" :
                                  parseFloat(row.declaration) < 0 ? "Must be positive" : ""
                              }
                              inputProps={{ min: 0 }}
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
                                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                                  onChange={(e) => handleProofChange(row.id, e.target.files[0])}
                                />
                              </Button>
                              {row.proofBase64 && (
                                <IconButton
                                  onClick={() => handleViewProof(row.proofBase64, row.proofFileType)}
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

                <Dialog
                  open={proofDialog.open}
                  onClose={handleCloseProofDialog}
                  fullWidth
                  maxWidth={proofDialog.fileType.includes('pdf') ? 'lg' : 'sm'}
                >
                  <DialogContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Proof Document
                    </Typography>
                    {proofDialog.proofUrl ? (
                      proofDialog.fileType.includes('pdf') ? (
                        <iframe
                          src={proofDialog.proofUrl}
                          width="100%"
                          height="600px"
                          title="proof-document"
                          style={{ border: 'none' }}
                        />
                      ) : (
                        <Box display="flex" justifyContent="center" sx={{ maxHeight: '80vh' }}>
                          <img
                            src={proofDialog.proofUrl}
                            alt="Proof document"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </Box>
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
                          <TableCell>₹ {(parseFloat(row.maxLimit) || 0).toLocaleString('en-IN')}</TableCell>
                          <TableCell>₹ {(parseFloat(row.declaration) || 0).toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            {row.proofFileName || 'No Proof'}
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

export default LacDeclaration;