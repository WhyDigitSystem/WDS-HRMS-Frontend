import React, { useEffect, useState } from 'react';
import { Avatar, Box, Card, Chip, Divider, Grid, IconButton, Stack, Typography, Autocomplete, TextField } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import apiCalls from 'apicall';

const initialData = [
  {
    id: 1,
    employeeName: 'Anzar',
    employeeId: 'EMP001',
    financialYear: '2025-26',
    fileName: 'Form16_2025.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadedDate: '20 May 2026'
  },
  {
    id: 2,
    employeeName: 'Rahman',
    employeeId: 'EMP002',
    financialYear: '2025-26',
    fileName: '',
    fileUrl: '',
    uploadedDate: ''
  }
];

export default function Form16ModernScreen() {
  const branch = localStorage.getItem('branch');
  const orgId = localStorage.getItem('orgId');
  const employeeCode = localStorage.getItem('employeeCode');
  const [tableData, setTableData] = useState(initialData);
  const [employeeData, setEmployeeData] = useState([]);
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 0; i <= currentYear + 1; i++) {
    yearOptions.push(i);
  }
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const getEmployeeData = async () => {
    try {
      const res = await apiCalls(
        'get',
        `investmentDeclaration/getFormDetails?branch=${branch}&employeeCode=${employeeCode}&finYear=${selectedYear}&orgId=${orgId}`
      );
      if (res.status === true) {
        setEmployeeData(res.paramObjectsMap.formVO || []);
      } else {
        setEmployeeData([]);
      }
    } catch (err) {
      console.log(err.paramObjectsMap.message || 'fetch api failed');
    }
  };

  useEffect(() => {
    getEmployeeData();
  }, [selectedYear]);

//   file name pdf,excel,image icon
const getFileIcon = (fileName) => {

  if (!fileName) {
    return (
      <InsertDriveFileRoundedIcon
        color="disabled"
        sx={{ fontSize: 30 }}
      />
    );
  }

  const extension = fileName
    .split('.')
    .pop()
    .toLowerCase();

  
  if (extension === 'pdf') {
    return (
      <PictureAsPdfRoundedIcon
        color="error"
        sx={{ fontSize: 30 }}
      />
    );
  }

  if (
    extension === 'xls' ||
    extension === 'xlsx'
  ) {
    return (
      <InsertDriveFileRoundedIcon
        sx={{
          fontSize: 30,
          color: '#16a34a'
        }}
      />
    );
  }
}
// ================= FILE NAME SHORT FUNCTION =================

const getShortFileName = (
  fileName,
  maxLength = 18
) => {

  if (!fileName) return 'No File';

  if (fileName.length <= maxLength) {
    return fileName;
  }

  const extension =
    fileName.split('.').pop();

  const nameWithoutExtension =
    fileName.substring(
      0,
      fileName.lastIndexOf('.')
    );

  return `${nameWithoutExtension.substring(
    0,
    5
  )}.....${extension}`;
};

  return (
    <>
    <Box
      sx={{
        minHeight: '100vh',
        // background: 'linear-gradient(to right, #eef2ff, #f8fafc)',
        px: 2,
        py: 1
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'start', md: 'center' }}
        mb={1}
        spacing={2}
        
      >
        <Box>
          <Typography
          
             sx={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#0f172a',
                     
                    }}
            // sx={{
            //   background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
            //   WebkitBackgroundClip: 'text',
            //   WebkitTextFillColor: 'transparent'
            // }}
          >
            Form 16
          </Typography>

          {/* <Typography color="text.secondary" mt={0}>
            preview and manage employee Form 16 files
          </Typography> */}
        </Box>

        <Autocomplete
          disablePortal
          size="small"
          options={yearOptions}
          value={selectedYear}
          onChange={(event, newValue) => setSelectedYear(newValue)}
          sx={{
            width: 180,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: '#fff'
            }
          }}
          renderInput={(params) => <TextField {...params} label="Select Year" size="small" />}
        />
      </Stack>

{employeeData.length === 0 ? (
 <>
    <Box
      sx={{
        height: '40vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >

      <Card
        sx={{
          width: 320,
          p: 2,
          textAlign: 'center',
          borderRadius: '24px',
          bgcolor: '#ffffff',
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.08)'
        }}
      >

        <Box
          component="img"
          src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
          alt="No Data"
          sx={{
            width: 120,
            mb: 2
          }}
        />

        <Typography
          fontWeight={700}
          fontSize={18}
          color="#0f172a"
          mb={1}
        >
          No Form 16 Found
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          No employee files available for
          selected year.
        </Typography>

      </Card>

    </Box>
</>
  ) : (
 <>
      {/* Cards */}
      <Grid container spacing={1}>
        {employeeData.map((row, index) => (
          <Grid item xs={12} md={2} lg={4} key={row.id}>
            <Card
              sx={{
                borderRadius: '24px',
                px: 2,
                py:1,
                height: '100%',
                // backdropFilter: 'blur(12px)',
                // background: 'rgba(255,255,255,0.75)',
                background: 'linear-gradient(to right, #eef2ff, #f8fafc)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 14px 40px rgba(0,0,0,0.12)'
                }
              }}
            >
              {/* Employee */}
              <Stack direction="row" spacing={2} alignItems="center" mb={0.5}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: '#2563eb',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 20
                  }}
                >
                  {row.employeeName.charAt(0)}
                </Avatar>

                <Box>
                  <Typography fontWeight={600} fontSize={15}>
                    {row.employeeName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {row.employeeCode}
                  </Typography>
                </Box>
              </Stack>

              {/* Status */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Financial Year
                </Typography>

                <Typography fontWeight={700}>{selectedYear}</Typography>
              </Stack>

              <Divider sx={{ mb: 1 }} />

              <Box
                sx={{
                  p: 2,
                  borderRadius: '18px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {/* <PictureAsPdfRoundedIcon color="error" sx={{ fontSize: 36 }} /> */}
                    {getFileIcon(row.fileName)}
                    <Box>
                      <Typography fontWeight={700} fontSize={10}>
                        {/* {row.fileName} */}{getShortFileName(row.fileName)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {new Date(row.uploadOn).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    {/* Preview */}
                    <IconButton
                      color="primary"
                        onClick={() =>
                          window.open(
                            `${row.filePath}`,
                            '_blank'
                          )
                        }
                      sx={{
                        bgcolor: '#eff6ff',
                        '&:hover': {
                          bgcolor: '#dbeafe'
                        }
                      }}
                    >
                      <VisibilityRoundedIcon />
                    </IconButton>

                    {/* Download */}
                    {/* <IconButton
                      component="a"
                      href={row.filePath}
                      download={row.fileName}
                      color="success"
                      sx={{
                        bgcolor: '#ecfdf5',
                        '&:hover': {
                          bgcolor: '#d1fae5'
                        }
                      }}
                    >
                      <DownloadRoundedIcon />
                    </IconButton> */}
                  </Stack>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      </>
  )}
      
    </Box>

    </>
  );
}
