import React, { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';

const Form = ({ employeeCode, employeeName, selectedYear }) => {
  const branch = localStorage.getItem('branch');
  const branchCode = localStorage.getItem('branchCode');
  const createdBy = localStorage.getItem('employeeName');
  const orgId = localStorage.getItem('orgId');
  const [file, setFile] = useState(null);
  const fileUpload = async (e) => {
    try {
      const selectedFile = e.target.files[0];

      if (!selectedFile) {
        showToast('error', 'Please select a file');
        return;
      }
      setFile(selectedFile);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await apiCalls(
        'post',
        `investmentDeclaration/uploadImageForm16?branch=${branch}&branchCode=${branchCode}&createdBy=${createdBy}&employeeCode=${employeeCode}&employeeName=${employeeName}&finYear=${selectedYear}&orgId=${orgId}`,
        formData
      );

      if (res.status === true) {
        showToast('success', res?.paramObjectsMap?.message || 'File uploaded successfully');
      } else {
        showToast('error', res?.paramObjectsMap?.message || 'File upload failed');
      }
    } catch (error) {
      console.log(error);

      showToast('error', error?.paramObjectsMap?.message || 'File upload failed');
    }
  };
  return (
    <>
      <ToastComponent />
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          p: 3,
          mt: 0
        }}
      >
        {/* Title */}

        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#0f172a',
            mb: 1
          }}
        >
          Form 16 (Part A & B)
        </Typography>

        {/* Description */}

        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#475569',
            mb: 1
          }}
        >
          Form 16 for FY 2024–25 will be available after{' '}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              color: '#334155'
            }}
          >
            15th June 2025.
          </Box>
        </Typography>

        {/* Alert Box */}

        <Alert
          icon={<AccessTimeOutlinedIcon fontSize="inherit" />}
          severity="warning"
          sx={{
            mb: 2,
            borderRadius: '12px',
            backgroundColor: '#fefce8',
            color: '#b45309',
            border: '1px solid #fde68a',

            '& .MuiAlert-icon': {
              color: '#b45309'
            }
          }}
        >
          Previous year Form 16 (2023–24) available for download.
        </Alert>

        {/* Download Button */}

        {/* <Button
        variant="outlined"
        startIcon={<DownloadOutlinedIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: '10px',
          px: 2.5,
          py: 1,
          borderColor: '#cbd5e1',
          color: '#0f172a',
          fontWeight: 600,

          '&:hover': {
            borderColor: '#94a3b8',
            backgroundColor: '#f8fafc',
          },
        }}
      >
        Download FY 2023–24
      </Button> */}
        <Button
          component="label"
          variant="contained"
          startIcon={<UploadFileOutlinedIcon />}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            px: 2.5,
            py: 1
          }}
        >
          {file ? file.name : 'Upload Form 16'}

          <input type="file" hidden onChange={fileUpload} />
        </Button>
      </Paper>
    </>
  );
};

export default Form;
