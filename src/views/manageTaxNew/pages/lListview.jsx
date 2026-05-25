import React,{useEffect,useState} from 'react';
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
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import ControlCameraOutlinedIcon from '@mui/icons-material/ControlCameraOutlined';

const Listview = ({ data = [],columns = [], totalDeclared = '₹0', id,branch,branchCode,employeeCode,userName,orgId,createdBy,employee }) => {
  const statusData= [
    {
      id: 1,
      name: 'APPROVED'

    },
    {
      id: 2,
      name: 'REJECTED'

    },
    {
      id: 3,
      name: 'PENDING'
    },
  ];

  const designation = localStorage.getItem('designation');
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip
            label="APPROVED"
            size="small"
            sx={{
              backgroundColor: '#dcfce7',
              color: '#059669',
              fontWeight: 600
            }}
          />
        );

      case 'REJECTED':
        return (
          <Chip
            label="REJECTED"
            size="small"
            sx={{
              backgroundColor: '#fef3c7',
              color: '#d97706',
              fontWeight: 600
            }}
          />
        );
         case 'PENDING':
        return (
          <Chip
            label="PENDING"
            size="small"
            sx={{
              backgroundColor: '#fef3c7',
              color: '#d97706',
              fontWeight: 600
            }}
          />
        );

      default:
        return (
          <Chip
            label="Draft"
            size="small"
            sx={{
              backgroundColor: '#e2e8f0',
              color: '#475569',
              fontWeight: 600
            }}
          />
        );
    }
  };

const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(data);
  }, [data]);

const handleChange = (e, rowIndex, accessor) => {
  const value = e.target.value;

  const updatedData = [...tableData];

  if (Number(value) > Number(updatedData[rowIndex].limitAmount)) {
    // alert('Declared amount should not exceed limit amount');
     showToast('error', 'Declared amount should not exceed limit amount');
    return;
  }
  updatedData[rowIndex][accessor] = value;
  setTableData(updatedData);
};

const upDateDataList = async (updatedTableData = tableData) => {
  try {
    

    const investmentDeclarationVO = {
      id: id,
      orgId: orgId,
      branch: branch,
      branchCode: branchCode,
      employeeCode: employeeCode,
      createdBy: createdBy,
      employeeName: userName,

      investmentDeclarationDetailsDTO: updatedTableData.map((item) => ({
        id: item.id,
        section: item.section,
        investmentType: item.investmentType,
        declared: Number(item.declared || 0),
        limitAmount: Number(item.limitAmount || 0),
        proof: item.proof || null,
        status: item.status,
        // fileName: item.fileName || item.uploadFile?.name || null,
         fileName:
          item.fileName ||
          item.uploadFile?.name ||
          null,
          filePath: item.filePath || null,
      }))
    };

    console.log("Payload :", investmentDeclarationVO);

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
      error?.response?.data?.message || 'Update Failed'
    );
  }
};



const handleStatusChange = async (
  status,
  item,
  rowIndex
) => {

  try {
    const updatedData = [...tableData];

    updatedData[rowIndex].status = status;

    setTableData(updatedData);

    const res = await apiCalls(
      'put',
      `/investmentDeclaration/approveInvestmentDeclaration?action=${status}&actionBy=${employeeCode}&employeeCode=${employee}&id=${id}&orgId=${orgId}&sourceId=${item?.id}`
    );
    if (res?.status === true) {

      showToast(
        'success',
        `Status Updated Successfully`
      );

    }

  } catch (error) {

    console.log(error);

    showToast(
      'error',
      error?.res?.paramObjectsMap?.message ||
      'Status Update Failed'
    );
  }
};

const handleFileUpload = async (e, rowIndex) => {
 
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


      const updateRes = await upDateDataList(updatedData);

   

      const updatedRows =
        updateRes?.paramObjectsMap?.investmentDeclarationVO
          ?.investmentDeclarationDetailsVO || [];

     

      const matchedRow = updatedRows.find(
        (item) =>
          item.section === updatedData[rowIndex].section &&
          item.investmentType ===
          updatedData[rowIndex].investmentType
      );

      if (!matchedRow) {

        showToast('error', 'Row not found after update');

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

        // ========= REFRESH TABLE =========

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
}


  return (
    <>
     <ToastComponent />
    <Paper
      elevation={0}
      sx={{
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        mt: 1
      }}
    >
      {/* Header */}

      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#0f172a'
            }}
          >
            Investment Declarations
          </Typography>

          <Chip
            label={`${data.length} items`}
            size="small"
            sx={{
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              fontWeight: 600
            }}
          />
        </Stack>
      </Box>

      {/* Table */}

      <TableContainer
        sx={{
          maxHeight: '300px',
          overflowY: 'auto',
          px:2,
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#f8fafc'
              }}
            >
              {columns.map((head,index) => (
                <TableCell
                  key={index}
                  sx={{
  
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#64748b',
                    backgroundColor: '#EEEEEE',
                    padding: '4px'
                  }}
                >
                  {head.Label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

  <TableBody>
  {tableData.map((row, rowIndex) => (
    <TableRow key={rowIndex} sx={{ padding: '0px' }} hover>
      {columns.map((col, colIndex) => (
        <TableCell key={colIndex} sx={{ padding: '3px' }}>
          {col.accessor === 'declared' ? (
            <TextField
              type="number"
              size="small"
              value={row?.[col.accessor] || ''}
               inputProps={{ min: 0 }}
              onChange={(e) => handleChange(e, rowIndex, col.accessor)}
              sx={{
                width: '100px',
                '& .MuiInputBase-input': {
                  // padding: '1px',
                  fontSize: '0.75rem',
                }
              }}
            />
          ) : 
      col.accessor === 'status' && designation === 'HR MANAGER' ? (
      <Autocomplete
      disablePortal
      disableClearable
      size="small"
      options={statusData}
      value={
        statusData.find(
          (item) => item.name === row?.status
        ) || null
      }
      getOptionLabel={(option) =>
        option.name || ''
      }
      onChange={(event, newValue) => {

        handleStatusChange(
          newValue?.name,
          row,
          rowIndex
        );

      }}
      sx={{
        width: 140,
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          backgroundColor: '#fff'
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select Status"
          size="small"
        />
      )}
    />
          ) :
          col.accessor === 'status' && designation !== 'HR MANAGER' ? (
        getStatusChip(row?.status)
        ) : 
        
col.accessor === 'fileName' ? (
  <>
    <Stack direction="row" spacing={1}>
      {/* Upload Button */}
      <Button
        component="label"
        variant="outlined"
        size="small"
        sx={{
          gap: '2px',
          borderRadius: '12px',
        }}
        disabled={Number(row?.declared) <= -1}
      >
        <CloudUploadOutlinedIcon />

        {row?.fileName ? 'Done' : ''}

        <input
          hidden
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx"
          onChange={(e) => handleFileUpload(e, rowIndex)}
        />
      </Button>

      {/* Preview Button */}

      {row?.fileName && (
         <ControlCameraOutlinedIcon onClick={() =>
            window.open(
              `${row.filePath}`,
              '_blank'
            )
          } />
        // </Button>
      )}
    </Stack>
  </>
) :
          (
            row?.[col.accessor] || '-'
          )}
        </TableCell>
      ))}
    </TableRow>
  ))}
</TableBody>

        </Table>
      </TableContainer>

      {/* Footer */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#fafafa'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <InfoOutlinedIcon
            sx={{
              fontSize: 18,
              color: '#64748b'
            }}
          />

          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#64748b'
            }}
          >
            Upload proof for each declaration
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontWeight: 700,
            color: '#475569'
          }}
        >
          Total Declared: {totalDeclared}
        </Typography>
      </Stack>
    </Paper>
    </>
  );
};

export default Listview;
