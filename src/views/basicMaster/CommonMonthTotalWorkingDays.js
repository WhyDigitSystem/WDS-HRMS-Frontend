import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Chip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useEffect, useState } from 'react';
import ActionButton from 'utils/ActionButton';
import dayjs from 'dayjs';

const CommonMonthTotalWorkingDays = ({
  data,
  columns,
  blockEdit,
  toEdit,
  disableEditIcon,
  viewIcon,
  isPdf,
  GeneratePdf,
  enableEditing
}) => {
  const [tableData, setTableData] = useState(data || []);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));

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

  const handleButtonClick = (row) => {
    toEdit(row);
  };

  useEffect(() => {
    console.log('BlockEdit', blockEdit);
  }, []);

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
      console.log('the columns are:', column);

      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() === 'Active' ? 'Active' : 'Inactive'}
            sx={cell.getValue() === 'Active' ? chipSuccessSX : chipErrorSX}
          />
        )
      };
    }

    if (column.accessorKey === 'closed') {
      console.log('the columns are:', column);

      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() === 'Yes' ? 'Yes' : 'No'} sx={cell.getValue() === 'Yes' ? chipSuccessSX : chipErrorSX} />
        )
      };
    }

    return column;
  });

  const renderRowActions = ({ row }) => (
    <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      {isPdf && <ActionButton title="Pdf" icon={PictureAsPdfIcon} onClick={() => GeneratePdf(row)} />}
      {!disableEditIcon && <ActionButton title="Edit" icon={EditIcon} onClick={() => handleButtonClick(row)} />}
    </Box>
  );

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
            size: 100
          }
        }}
        // columns={customColumns}
        columns={customColumns.map((col) => ({
          ...col,
          muiTableHeadCellProps: {
            sx: {
              backgroundColor: '#2d3e98',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '13px',
              textAlign: 'left',
              borderBottom: '2px solid #D1D5DB'
            }
          },
          muiTableBodyCellProps: {
            sx: {
              fontSize: '14px',
              padding: '8px',
              color: '#374151',
              textAlign: 'left',
              borderBottom: '1px solid #E5E7EB'
            }
          }
        }))}
        data={tableData && tableData}
        enableColumnOrdering={false}
        enableColumnActions={false}
        enableEditing={enableEditing}
        renderRowActions={renderRowActions}
        initialState={{ density: 'compact' }}
        muiTableContainerProps={{
          sx: {
            background: '#FFFFFF',
            borderRadius: '10px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }
        }}
        muiTableProps={{
          sx: {
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #E5E7EB'
          }
        }}
        muiTableBodyRowProps={{
          sx: {
            height: '42px',
            '&:nth-of-type(even)': { backgroundColor: '#F9FAFB' },
            '&:hover': {
              backgroundColor: '#E5E7EB',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
              transition: '0.2s ease-in-out'
            }
          }
        }}
        // renderTopToolbarCustomActions={() => (
        //   <Stack
        //     direction="row"
        //     spacing={2}
        //     sx={{
        //       marginLeft: '20px'
        //     }}
        //   ></Stack>
        // )}
        //
        renderTopToolbarCustomActions={() => (
          <>
            <Stack direction="row" spacing={2} sx={{ marginLeft: '20px' }}>
              {/* You can add buttons here */}
            </Stack>

            {tableData.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 16px',
                  // backgroundColor: '#F3F4F6',
                  // borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                <Box>
                  Month:{' '}
                  {dayjs()
                    .month(tableData[0]?.month ? tableData[0].month - 1 : 0)
                    .format('MMMM')}
                </Box>
                <Box>Total Working Days: {tableData[0]?.totalCompanyWorkingDays || '-'}</Box>
              </Box>
            )}
          </>
        )}

        //
      />
    </>
  );
};

export default CommonMonthTotalWorkingDays;
