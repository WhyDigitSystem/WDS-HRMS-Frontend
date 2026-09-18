import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { Checkbox, FormControlLabel } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';

const ListOfValues = () => {
  const [data, setData] = useState([]);
  const [value, setValue] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    name: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: false
  });

  const [listValuesData, setListValuesData] = useState([
    {
      id: '',
      valuesDescription: '',
      activeCheck: true
    }
  ]);

  const [listValuesErrors, setListValuesErrors] = useState([
    {
      valuesDescription: ''
    }
  ]);

  useEffect(() => {
    getAllListOfValues();
  }, []);

  const getAllListOfValues = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllListOfValuesByOrgId?orgId=${orgId}`);
      if (result) {
        setData(result.paramObjectsMap.listOfValuesVO.reverse());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    let errorMessage = '';
    let validInputValue = inputValue;

    setFormData({ ...formData, [name]: validInputValue });

    setFieldErrors({ ...fieldErrors, [name]: errorMessage });
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Name is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const payload = {
        ...(editId && { id: editId }),
        listDescription: formData.name,
        orgId: Number(orgId),
        createdBy: loginUserName,
        listOfValuesDetailsDTO: listValuesData.map((item) => ({
          id: item.id,
          listValues: item.valuesDescription,
          active: item.activeCheck === 'Active' || item.activeCheck === true
        }))
      };

      console.log('DATA TO SAVE', payload);

      try {
        const response = await apiCalls('put', `/master/updateCreateListOfValues`, payload);
        if (response.status === true) {
          showToast('success', editId ? 'List Values updated successfully' : 'List Values created successfully');
          getAllListOfValues();
          handleClear();
        } else {
          showToast('error', editId ? 'List Values updation failed' : 'List Values creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Validation Errors:', errors);
      setFieldErrors(errors);
    }
  };

  const handleClear = () => {
    setFormData({
      name: ''
    });

    setFieldErrors({
      name: false
    });

    setEditId('');
    setEditMode(false);

    setListValuesData([{ id: Date.now(), valuesDescription: '', activeCheck: true }]);

    setListValuesErrors([{ valuesDescription: '' }]);
  };

  const handleListView = () => {
    setShowForm(!showForm);
    handleClear();
    setFieldErrors({
      name: false
    });
  };

  const listViewColumns = [{ accessorKey: 'listDescription', header: 'Name', size: 140 }];

  const getListOfValuesById = async (row) => {
    console.log('Editing:', row.original.id);
    setEditId(row.original.id);
    setShowForm(true);

    try {
      const result = await apiCalls('get', `/master/getAllListOfValuesById?id=${row.original.id}`);

      const listOfValues = result?.paramObjectsMap?.listOfValuesVO;

      if (listOfValues) {
        setEditMode(true);

        setFormData((prev) => ({
          ...prev,
          name: listOfValues.listDescription || ''
        }));

        setListValuesData(
          listOfValues.listOfValuesDetailsVO.map((detail) => ({
            id: detail.id,
            valuesDescription: detail.listValues || '',
            activeCheck: detail.active === 'Active' ? true : false
          }))
        );
      } else {
        console.warn('No data found for this ID');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e, index) => {
    const { value } = e.target;

    setListValuesData((prev) => prev.map((item, i) => (i === index ? { ...item, valuesDescription: value || '' } : item)));
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(listValuesData)) {
      displayRowError(listValuesData);
      return;
    }
    const newRow = {
      id: Date.now(),
      valuesDescription: '',
      activeCheck: true
    };
    setListValuesData([...listValuesData, newRow]);
    setListValuesErrors([
      ...listValuesErrors,
      {
        valuesDescription: ''
      }
    ]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === listValuesData) {
      return !lastRow.valuesDescription;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === listValuesData) {
      setListValuesErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          valuesDescription: !table[table.length - 1].valuesDescription ? 'List Values is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    if (!Array.isArray(table) || !Array.isArray(errorTable)) {
      console.error('Invalid table or errorTable:', { table, errorTable });
      return;
    }

    const rowIndex = table.findIndex((row) => row.id === id);
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);

      setTable(updatedData.length > 0 ? updatedData : [{ id: Date.now(), valuesDescription: '' }]);
      setErrorTable(updatedErrors.length > 0 ? updatedErrors : [{ valuesDescription: '' }]);
    }
  };

  return (
    <>
      <div>
        <ToastContainer />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
          {!showForm && <ActionButton title="New Entry" icon={AddIcon} onClick={handleListView} />}
          {showForm && (
            <>
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleListView} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
            </>
          )}
        </div>

        {showForm ? (
          <>
            <div className="row d-flex ">
              {/* Account Code */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="name"
                    label="Name"
                    size="small"
                    onChange={handleInputChange}
                    name="name"
                    value={formData.name}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name || ''}
                  />
                </FormControl>
              </div>
            </div>

            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab value={0} label="List of Values" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      <div className="mb-1">
                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-lg-8">
                          <div className="table-responsive">
                            <table className="table table-bordered table-responsive">
                              <thead>
                                <tr style={{
                                  background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                  color: 'white'
                                }}>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    #
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '500px' }}>
                                    List Values
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    Active
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {listValuesData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() =>
                                          handleDeleteRow(row.id, listValuesData, setListValuesData, listValuesErrors, setListValuesErrors)
                                        }
                                      />
                                    </td>
                                    <td className="text-center">
                                      <div className="pt-2">{index + 1}</div>
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={listValuesData[index]?.valuesDescription || ''}
                                        onChange={(e) => handleChange(e, index)}
                                        className={listValuesErrors[index]?.valuesDescription ? 'error form-control' : 'form-control'}
                                        placeholder="Enter value"
                                      />
                                      {listValuesErrors[index]?.valuesDescription && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {listValuesErrors[index].valuesDescription}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2 text-center">
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            className="ms-2 pb-0 pt-1"
                                            checked={row.activeCheck || false}
                                            style={{ cursor: 'pointer' }}
                                            onChange={() => {
                                              setListValuesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, activeCheck: !r.activeCheck } : r))
                                              );
                                            }}
                                            name="activeCheck"
                                            color="primary"
                                          />
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        ) : (
          <CommonListViewTable columns={listViewColumns} data={data} blockEdit={true} toEdit={getListOfValuesById} enableEditing={true} />
        )}
      </div>
    </>
  );
};

export default ListOfValues;
