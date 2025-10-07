import { Add } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  useTheme
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { useCallback, useMemo, useState } from 'react';
import ActionButton from 'utils/ActionButton';

const BranchTable = ({ data, onUpdateBranch, branchData }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tableData, setTableData] = useState(data || []);
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rowToEdit, setRowToEdit] = useState(null);

  const theme = useTheme();

  const handleCreateNewRow = (values) => {
    setTableData((prev) => {
      const newData = [...prev, values];
      onUpdateBranch(newData);
      return newData;
    });
  };

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      setTableData((prev) => {
        const newData = [...prev];
        newData[row.index] = values;
        onUpdateBranch(newData);
        return newData;
      });
      exitEditingMode();
    }
  };

  const handleSaveEditedRow = (values) => {
    setTableData((prev) => {
      const newData = [...prev];
      newData[rowToEdit.index] = values;
      onUpdateBranch(newData);
      return newData;
    });
    setEditModalOpen(false);
    setRowToEdit(null);
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback((row) => {
    setRowToDelete(row);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDeleteRow = () => {
    setTableData((prev) => {
      const newData = prev.filter((_, index) => index !== rowToDelete.index);
      onUpdateBranch(newData);
      return newData;
    });
    setDeleteConfirmOpen(false);
    setRowToDelete(null);
  };

  const getCommonEditTextFieldProps = useCallback(
    (cell) => {
      return {
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
            setValidationErrors({
              ...validationErrors
            });
          }
        }
      };
    },
    [validationErrors]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'branch',
        header: 'Branch',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell)
        })
      }
    ],
    [getCommonEditTextFieldProps]
  );

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center'
            },
            size: 120
          }
        }}
        columns={columns}
        data={tableData}
        editingMode="modal"
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <ActionButton title="delete" icon={DeleteIcon} onClick={() => handleDeleteRow(row)} />
            <ActionButton
              title="edit"
              icon={EditIcon}
              onClick={() => {
                setRowToEdit(row);
                setEditModalOpen(true);
              }}
            />
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={2} className="ml-5 ">
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
                  aria-haspopup="true"
                  color="inherit"
                >
                  <Add size="1.3rem" stroke={1.5} />
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
        branchData={branchData}
      />
      {rowToEdit && (
        <EditBranchModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleSaveEditedRow}
          rowToEdit={rowToEdit}
          columns={columns}
          branchData={branchData}
        />
      )}
      <ConfirmDeleteModal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} onConfirm={confirmDeleteRow} />
    </>
  );
};

const CreateNewAccountModal = ({ open, columns, onClose, onSubmit, branchData }) => {
  const [values, setValues] = useState(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = '';
      return acc;
    }, {})
  );

  const handleSubmit = () => {
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Add</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem'
            }}
          >
            {columns.map((column) => (
              <div key={column.accessorKey}>
                {column.accessorKey === 'branch' ? (
                  <Select
                    label={column.header}
                    name={column.accessorKey}
                    value={values[column.accessorKey]}
                    onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                    fullWidth
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select a Branch
                    </MenuItem>
                    {branchData &&
                      branchData.map((branch, index) => (
                        <MenuItem key={index} value={branch}>
                          {branch}
                        </MenuItem>
                      ))}
                  </Select>
                ) : (
                  <TextField
                    label={column.header}
                    name={column.accessorKey}
                    value={values[column.accessorKey]}
                    onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                    fullWidth
                  />
                )}
              </div>
            ))}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditBranchModal = ({ open, columns, onClose, onSubmit, rowToEdit, branchData }) => {
  const [values, setValues] = useState(rowToEdit ? rowToEdit.original : {});

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Edit</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem'
            }}
          >
            {columns.map((column) => (
              <div key={column.accessorKey}>
                {column.accessorKey === 'branch' ? (
                  <FormControl fullWidth>
                    <InputLabel htmlFor={column.accessorKey}>{column.label}</InputLabel>
                    <Select
                      labelId={`${column.accessorKey}-label`}
                      id={column.accessorKey}
                      name={column.accessorKey}
                      value={values[column.accessorKey]}
                      onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                      fullWidth
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select a Branch
                      </MenuItem>
                      {branchData &&
                        branchData.map((branch, index) => (
                          <MenuItem key={index} value={branch}>
                            {branch}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label={column.header}
                    name={column.accessorKey}
                    value={values[column.accessorKey]}
                    onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
                    fullWidth
                  />
                )}
              </div>
            ))}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConfirmDeleteModal = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Confirm Delete</DialogTitle>
      <DialogContent>
        <p>Are you sure you want to delete this row?</p>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="secondary" onClick={onConfirm} variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const validateRequired = (value) => !!value.length;

export default BranchTable;
