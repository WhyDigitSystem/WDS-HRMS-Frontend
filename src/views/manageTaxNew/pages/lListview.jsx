import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete
} from '@mui/material';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ControlCameraOutlinedIcon from '@mui/icons-material/ControlCameraOutlined';

import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

const Listview = ({
  data = [],
  columns = [],
  totalDeclared = '₹0',
  id,
  branch,
  branchCode,
  employeeCode,
  userName,
  orgId,
  createdBy
}) => {
  const designation = localStorage.getItem('designation');

  const [tableData, setTableData] = useState([]);

  const statusData = [
    {
      id: 1,
      name: '✅ Verified'
    },
    {
      id: 2,
      name: '⏳ Under Review'
    },
    {
      id: 3,
      name: '🕒 Pending'
    },
    {
      id: 4,
      name: '⚠️ Review Needed'
    }
  ];

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Chip
            label="Approved"
            size="small"
            sx={{
              background: 'rgba(34,197,94,0.12)',
              color: '#15803d',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          />
        );

      case 'Pending':
        return (
          <Chip
            label="Pending"
            size="small"
            sx={{
              background: 'rgba(245,158,11,0.14)',
              color: '#b45309',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          />
        );

      default:
        return (
          <Chip
            label="Draft"
            size="small"
            sx={{
              background: 'rgba(100,116,139,0.14)',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          />
        );
    }
  };

  const handleChange = (e, rowIndex, accessor) => {
    const value = e.target.value;

    const updatedData = [...tableData];

    if (Number(value) > Number(updatedData[rowIndex].limitAmount)) {
      showToast(
        'error',
        'Declared amount should not exceed limit amount'
      );
      return;
    }

    updatedData[rowIndex][accessor] = value;

    setTableData(updatedData);
  };

  const upDateDataList = async (
    updatedTableData = tableData
  ) => {
    try {
      const investmentDeclarationVO = {
        id: id,
        orgId: orgId,
        branch: branch,
        branchCode: branchCode,
        employeeCode: employeeCode,
        createdBy: createdBy,
        employeeName: userName,

        investmentDeclarationDetailsDTO:
          updatedTableData.map((item) => ({
            id: item.id,
            section: item.section,
            investmentType: item.investmentType,
            declared: Number(item.declared || 0),
            limitAmount: Number(item.limitAmount || 0),
            proof: item.proof || null,
            status: item.status,
            fileName:
              item.fileName ||
              item.uploadFile?.name ||
              null,
            filePath: item.filePath || null
          }))
      };

      const res = await apiCalls(
        'put',
        '/investmentDeclaration/updateCreateInvestmentDeclaration',
        investmentDeclarationVO
      );

      if (res.status === true) {
        showToast(
          'success',
          res?.paramObjectsMap?.message ||
            'Investment Declaration Updated Successfully'
        );

        const latestData =
          res?.paramObjectsMap?.investmentDeclarationVO
            ?.investmentDeclarationDetailsVO || [];

        setTableData(latestData);

        return res;
      }
    } catch (error) {
      console.log(error);

      showToast(
        'error',
        error?.response?.data?.message ||
          'Update Failed'
      );
    }
  };

  const handleFileUpload = async (
    e,
    rowIndex
  ) => {
    try {
      const files = e.target.files[0];

      if (!files) return;

      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(files.type)) {
        showToast(
          'error',
          'Only Image, PDF, and Excel files are allowed'
        );

        return;
      }

      const updatedData = [...tableData];

      updatedData[rowIndex].uploadFile = files;
      updatedData[rowIndex].fileName = files.name;

      setTableData(updatedData);

      const updateRes =
        await upDateDataList(updatedData);

      const updatedRows =
        updateRes?.paramObjectsMap
          ?.investmentDeclarationVO
          ?.investmentDeclarationDetailsVO || [];

      const matchedRow = updatedRows.find(
        (item) =>
          item.section ===
            updatedData[rowIndex].section &&
          item.investmentType ===
            updatedData[rowIndex].investmentType
      );

      if (!matchedRow) {
        showToast(
          'error',
          'Row not found after update'
        );

        return;
      }

      const formData = new FormData();

      formData.append('files', files);
      formData.append('fileName', files.name);

      const uploadRes = await apiCalls(
        'post',
        `/investmentDeclaration/uploadImageInvestmentDeclarationDetails?investmentDeclarationId=${id}&investmentDeclarationDetailsId=${matchedRow.id}`,
        formData
      );

      if (uploadRes?.status === true) {
        showToast(
          'success',
          'File uploaded successfully'
        );

        const latestRows =
          uploadRes?.paramObjectsMap?.response
            ?.investmentDeclarationVO
            ?.investmentDeclarationDetailsVO || [];

        setTableData(latestRows);
      }
    } catch (error) {
      console.log(error);

      showToast(
        'error',
        error?.response?.data?.message ||
          'File Upload Failed'
      );
    }
  };

  return (
    <>
      <ToastComponent />

      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid #dbe4e6',
          mt: 1,
          background: '#fff',
          boxShadow:
            '0 8px 24px rgba(42,75,77,0.06)'
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            px: 2,
            py: 1.2,
            background:
              'linear-gradient(135deg, #3a6b6d 0%, #2a4b4d 100%)',
            borderBottom: '1px solid #dbe4e6'
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff',
                letterSpacing: '0.3px'
              }}
            >
              Investment Declarations
            </Typography>

            <Chip
              label={`${data.length} Items`}
              size="small"
              sx={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '8px',
                border:
                  '1px solid rgba(255,255,255,0.18)'
              }}
            />
          </Stack>
        </Box>

        {/* TABLE */}

        <TableContainer
          sx={{
            maxHeight: '350px',
            overflowY: 'auto',
            px: 1.5,
            py: 1,
            background: '#fff'
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((head, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      fontWeight: 700,
                      fontSize: '11px',
                      color: '#2a4b4d',
                      background:
                        'linear-gradient(135deg, #eef5f5 0%, #f8fbfb 100%)',
                      borderBottom:
                        '1px solid #dbe4e6',
                      padding: '8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {head.Label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  hover
                  sx={{
                    transition:
                      'all 0.2s ease',

                    '&:hover': {
                      background:
                        'rgba(58,107,109,0.04)'
                    }
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      sx={{
                        padding: '6px',
                        fontSize: '12px',
                        borderBottom:
                          '1px solid #eef2f6',
                        color: '#334155'
                      }}
                    >
                      {col.accessor ===
                      'declared' ? (
                        <TextField
                          type="number"
                          size="small"
                          value={
                            row?.[col.accessor] || ''
                          }
                          inputProps={{
                            min: 0
                          }}
                          onChange={(e) =>
                            handleChange(
                              e,
                              rowIndex,
                              col.accessor
                            )
                          }
                          sx={{
                            width: '110px',

                            '& .MuiOutlinedInput-root':
                              {
                                borderRadius: '10px',
                                background: '#fff',

                                '& fieldset': {
                                  borderColor:
                                    '#dbe4e6'
                                },

                                '&:hover fieldset': {
                                  borderColor:
                                    '#3a6b6d'
                                },

                                '&.Mui-focused fieldset':
                                  {
                                    borderColor:
                                      '#3a6b6d'
                                  }
                              },

                            '& .MuiInputBase-input':
                              {
                                fontSize: '12px',
                                py: 1
                              }
                          }}
                        />
                      ) : col.accessor ===
                          'status' &&
                        designation ===
                          'HR MANAGER' ? (
                        <Autocomplete
                          disablePortal
                          size="small"
                          options={statusData}
                          getOptionLabel={(
                            option
                          ) => option.name}
                          sx={{
                            width: 170,

                            '& .MuiOutlinedInput-root':
                              {
                                borderRadius:
                                  '10px',
                                background:
                                  '#fff',

                                '& fieldset': {
                                  borderColor:
                                    '#dbe4e6'
                                },

                                '&:hover fieldset': {
                                  borderColor:
                                    '#3a6b6d'
                                },

                                '&.Mui-focused fieldset':
                                  {
                                    borderColor:
                                      '#3a6b6d'
                                  }
                              }
                          }}
                          renderInput={(
                            params
                          ) => (
                            <TextField
                              {...params}
                              placeholder="Select Status"
                              size="small"
                            />
                          )}
                        />
                      ) : col.accessor ===
                          'status' &&
                        designation !==
                          'HR MANAGER' ? (
                        getStatusChip(
                          row?.status
                        )
                      ) : col.accessor ===
                        'fileName' ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          {/* UPLOAD */}

                          <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            sx={{
                              gap: '4px',
                              borderRadius:
                                '10px',
                              textTransform:
                                'none',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderColor:
                                '#3a6b6d',
                              color:
                                '#3a6b6d',

                              '&:hover': {
                                borderColor:
                                  '#2a4b4d',
                                background:
                                  'rgba(58,107,109,0.06)'
                              }
                            }}
                            disabled={
                              Number(
                                row?.declared
                              ) <= -1
                            }
                          >
                            <CloudUploadOutlinedIcon
                              sx={{
                                fontSize: 16
                              }}
                            />

                            {row?.fileName
                              ? 'Done'
                              : 'Upload'}

                            <input
                              hidden
                              type="file"
                              accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx"
                              onChange={(e) =>
                                handleFileUpload(
                                  e,
                                  rowIndex
                                )
                              }
                            />
                          </Button>

                          {/* PREVIEW */}

                          {row?.fileName && (
                            <ControlCameraOutlinedIcon
                              onClick={() =>
                                window.open(
                                  `${row.filePath}`,
                                  '_blank'
                                )
                              }
                              sx={{
                                fontSize: 19,
                                color:
                                  '#3a6b6d',
                                cursor: 'pointer',

                                '&:hover': {
                                  color:
                                    '#2a4b4d'
                                }
                              }}
                            />
                          )}
                        </Stack>
                      ) : (
                        row?.[
                          col.accessor
                        ] || '-'
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* FOOTER */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 2,
            py: 1.2,
            borderTop: '1px solid #dbe4e6',
            background:
              'linear-gradient(135deg, #f8fbfb 0%, #f1f5f9 100%)'
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <InfoOutlinedIcon
              sx={{
                fontSize: 17,
                color: '#3a6b6d'
              }}
            />

            <Typography
              sx={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: 500
              }}
            >
              Upload proof for each
              declaration
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontWeight: 700,
              color: '#2a4b4d',
              fontSize: '13px'
            }}
          >
            Total Declared:
            <span
              style={{
                marginLeft: 6,
                color: '#3a6b6d'
              }}
            >
              {totalDeclared}
            </span>
          </Typography>
        </Stack>
      </Paper>
    </>
  );
};

export default Listview;