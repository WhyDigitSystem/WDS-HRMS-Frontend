import EditIcon from '@mui/icons-material/Edit';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

// import { getStateByCountry } from 'utils/common-functions';

const CommonTable = ({ data, columns, editCallback, countryVO, roleData, blockEdit, toEdit, handleRowEdit, enableEditing }) => {
  const [tableData, setTableData] = useState(data || []);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [stateVO, setStateVO] = useState([]);

  const headerStyle = {
    backgroundColor: '#f5f5f5' // Change this to your desired color
  };

  const theme = useTheme();

  const chipSX = {
    height: 24,
    padding: '0 6px'
  };

  const chipSuccessSX = {
    ...chipSX,
    color: theme.palette.success.dark,
    backgroundColor: theme.palette.success.light,
    height: 28
  };

  const chipErrorSX = {
    ...chipSX,
    color: theme.palette.orange.dark,
    backgroundColor: theme.palette.orange.light,
    marginRight: '5px'
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setEditModalOpen(true);
    setSelectedCountry(row.original.country);
  };

  const handleButtonClick = (row) => {
    if (blockEdit) {
      toEdit(row);
    } else {
      handleEditClick(row);
    }
  };

  // useEffect(() => {
  //   console.log('BlockEdit', blockEdit);
  //   const fetchDataState = async () => {
  //     try {
  //       const stateData = await getStateByCountry(orgId, selectedCountry);
  //       setStateVO(stateData);
  //     } catch (error) {
  //       console.error('Error fetching country data:', error);
  //     }
  //   };
  //   fetchDataState();
  // }, [selectedCountry]);

  const handleSaveRowEdits = async () => {
    if (!Object.keys(validationErrors).length) {
      const updatedRows = [...tableData];
      updatedRows[editingRow.index] = editingRow.original;
      setTableData(updatedRows);

      try {
        await editCallback(editingRow.original);
        setEditModalOpen(false);
        setEditingRow(null);
      } catch (error) {
        console.error('Error updating row:', error);
      }
    }
  };

  const customColumns = columns.map((column) => {
    if (column.accessorKey && column.accessorKey.toLowerCase().includes('date')) {
      return {
        ...column,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value ? dayjs(value).format('DD-MM-YYYY') : '-';
        }
      };
    }

    if (column.accessorKey === 'active') {
      return {
        ...column,

        Cell: ({ cell }) => (
          <Chip label={cell.getValue() === true ? 'Active' : 'Inactive'} sx={cell.getValue() === true ? chipSuccessSX : chipErrorSX} />
        )
      };
    }
    return column;
  });

  const renderRowActions = ({ row }) => (
    <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <Tooltip title="Edit" placement="top">
        <ButtonBase sx={{ borderRadius: '12px', marginRight: '10px' }} onClick={() => handleButtonClick(row)}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&[aria-controls="menu-list-grow"],&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            color="inherit"
          >
            <EditIcon size="1.3rem" stroke={1.5} />
          </Avatar>
        </ButtonBase>
      </Tooltip>
    </Box>
  );

  const handleCancelRowEdits = () => {
    setValidationErrors({});
    setEditModalOpen(false);
    setEditingRow(null);
  };

  const validateRequired = (value) => {
    return value !== '';
  };

  const getCommonEditTextFieldProps = (cell) => ({
    error: !!validationErrors[cell.id],
    helperText: validationErrors[cell.id],
    onBlur: (event) => {
      const isValid = validateRequired(event.target.value);
      if (!isValid) {
        setValidationErrors({
          ...validationErrors,
          [cell.id]: `${cell.column.columnDef.header} is required`
        });
      } else {
        delete validationErrors[cell.id];
        setValidationErrors({ ...validationErrors });
      }
    }
  });

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            //
            header: 'Action',
            //
            muiTableHeadCellProps: {
              align: 'center'
            },
            size: 120
          }
        }}
        columns={customColumns}
        data={tableData && tableData}
        enableColumnOrdering
        enableEditing={enableEditing}
        renderRowActions={renderRowActions}
        renderTopToolbarCustomActions={() => <Stack direction="row" spacing={2} className="ml-5 "></Stack>}
      />
      {editingRow && (
        <Dialog open={editModalOpen} onClose={handleCancelRowEdits}>
          <DialogTitle textAlign="center">
            <h6>Edit</h6>
          </DialogTitle>
          <DialogContent>
            <form onSubmit={(e) => e.preventDefault()}>
              <Stack
                sx={{
                  width: '100%',
                  minWidth: { xs: '300px', sm: '360px', md: '400px' },
                  gap: '1rem',
                  marginTop: '10px'
                }}
              >
                {customColumns.map((column) => (
                  <Box key={column.accessorKey}>
                    {column.accessorKey === 'active' ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editingRow.original[column.accessorKey]}
                            onChange={(e) =>
                              setEditingRow({ ...editingRow, original: { ...editingRow.original, [column.accessorKey]: e.target.checked } })
                            }
                          />
                        }
                        label={column.header}
                      />
                    ) : column.accessorKey === 'country' ? (
                      <FormControl fullWidth>
                        <InputLabel>{column.header}</InputLabel>
                        <Select
                          value={editingRow.original[column.accessorKey]}
                          onChange={(e) =>
                            setEditingRow({ ...editingRow, original: { ...editingRow.original, [column.accessorKey]: e.target.value } })
                          }
                        >
                          {countryVO &&
                            countryVO.map((country) => (
                              <MenuItem key={country} value={country}>
                                {country}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    ) : column.accessorKey === 'state' ? (
                      <FormControl fullWidth>
                        <InputLabel>{column.header}</InputLabel>
                        <Select
                          value={editingRow.original[column.accessorKey]}
                          onChange={(e) =>
                            setEditingRow({ ...editingRow, original: { ...editingRow.original, [column.accessorKey]: e.target.value } })
                          }
                        >
                          {stateVO &&
                            stateVO.map((state) => (
                              <MenuItem key={state} value={state}>
                                {state}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    ) : column.accessorKey === 'screenVO' ? (
                      <Box>
                        <InputLabel>{column.header}</InputLabel>
                        <Stack direction="row" spacing={1}>
                          {editingRow.original[column.accessorKey].map((screen) => (
                            <Chip key={screen.id} label={screen.screenName} />
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        label={column.header}
                        name={column.accessorKey}
                        defaultValue={editingRow.original[column.accessorKey]}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            original: { ...editingRow.original, [column.accessorKey]: e.target.value.toUpperCase() }
                          })
                        }
                        {...getCommonEditTextFieldProps({ id: column.accessorKey })}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </form>
          </DialogContent>
          <DialogActions sx={{ p: '1.25rem' }}>
            <Button onClick={handleCancelRowEdits}>Cancel</Button>
            <Button color="secondary" onClick={handleSaveRowEdits} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default CommonTable;
