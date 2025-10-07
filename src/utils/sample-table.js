import { Add as AddIcon, Delete, Edit } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MaterialReactTable } from 'material-react-table';
import { useCallback, useEffect, useRef, useState } from 'react';

const SampleTable = ({ columns, addCallback, dataCallback, dataToSet, data }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState([data]);
  const [validationErrors, setValidationErrors] = useState({});

  const theme = useTheme();
  const anchorRef = useRef(null);

  useEffect(() => {
    dataCallback(tableData);
    dataToSet(tableData);
    console.log('Dataaa', data);
  }, [tableData, dataCallback]);

  const handleCreateNewRow = (values) => {
    const formattedValues = formatDateValues(values);
    setTableData([...tableData, formattedValues]);
    addCallback(formattedValues);
    setCreateModalOpen(false);
    console.log('tableData', values);
  };

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      const formattedValues = formatDateValues(values);
      const updatedData = [...tableData];
      updatedData[row.index] = formattedValues;
      setTableData(updatedData);
      exitEditingMode();
    }
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback(
    (row) => {
      if (window.confirm(`Are you sure you want to delete ${row.original.firstName}?`)) {
        const updatedData = [...tableData];
        updatedData.splice(row.index, 1);
        setTableData(updatedData);
      }
    },
    [tableData]
  );

  const getCommonEditTextFieldProps = useCallback(
    (cell) => ({
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      onBlur: (event) => {
        const isValid =
          cell.column.id === 'email'
            ? validateEmail(event.target.value)
            : cell.column.id === 'age'
              ? validateAge(+event.target.value)
              : validateRequired(event.target.value);

        if (!isValid) {
          setValidationErrors({
            ...validationErrors,
            [cell.id]: `${cell.column.columnDef.header} is required`
          });
        } else {
          const { [cell.id]: deleted, ...nextValidationErrors } = validationErrors;
          setValidationErrors(nextValidationErrors);
        }
      }
    }),
    [validationErrors]
  );

  return (
    <>
      <MaterialReactTable
        columns={columns.map((column) => ({
          ...column,
          muiTableBodyCellEditTextFieldProps: ({ cell }) => getCommonEditTextFieldProps(cell)
        }))}
        data={tableData}
        editingMode="modal"
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Tooltip arrow placement="left" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={2} className="ml-5">
            <Tooltip title="Add">
              <ButtonBase sx={{ borderRadius: '12px', marginRight: '10px' }} onClick={() => setCreateModalOpen(true)}>
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
                  ref={anchorRef}
                  aria-haspopup="true"
                  color="inherit"
                >
                  <AddIcon size="1.3rem" stroke={1.5} />
                </Avatar>
              </ButtonBase>
            </Tooltip>
          </Stack>
        )}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
      />
    </>
  );
};

export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
  const [values, setValues] = useState(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = column.accessorKey.includes('Date') ? null : '';
      return acc;
    }, {})
  );

  const handleDateChange = (date, accessorKey) => {
    setValues((prevValues) => ({
      ...prevValues,
      [accessorKey]: date
    }));
  };

  const handleSubmit = () => {
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Add</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack spacing={2}>
            {columns.map((column) => (
              <Box
                key={column.accessorKey}
                sx={{
                  width: '100%',
                  minWidth: { xs: '300px', sm: '360px', md: '400px' },
                  gap: '1.5rem'
                }}
              >
                {column.accessorKey.includes('Date') ? (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <MobileDatePicker
                      fullWidth
                      label={column.header}
                      value={values[column.accessorKey]}
                      onChange={(date) => handleDateChange(date, column.accessorKey)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                ) : (
                  <TextField
                    fullWidth
                    label={column.header}
                    name={column.accessorKey}
                    onChange={(e) =>
                      setValues((prevValues) => ({
                        ...prevValues,
                        [e.target.name]: e.target.value
                      }))
                    }
                  />
                )}
              </Box>
            ))}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const formatDateValues = (values) => {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value instanceof Date ? value.toISOString() : value]));
};

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
const validateAge = (age) => age >= 18 && age <= 50;

export default SampleTable;
