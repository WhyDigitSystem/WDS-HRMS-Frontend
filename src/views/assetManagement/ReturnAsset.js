import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';
import {
  Box,
  CircularProgress,
  Fab,
  TextField,
  Autocomplete
} from "@mui/material";
import ReturnAssetListView from './ReturnAssetListView';

const ReturnAsset = () => {
  const { control, setValue, watch } = useForm({
    defaultValues: { employeeName: null },
  });

  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const orgId = localStorage.getItem("orgId");
  const branchCode = localStorage.getItem("branchCode");
  const branch = localStorage.getItem("branch");
  const finYear = localStorage.getItem("finYear");
  const createdBy = localStorage.getItem("userName");
  const [employeeAssets, setEmployeeAssets] = useState([]);

  const employeeName = watch("employeeName");

  const getAllEmployees = async () => {
    try {
      const res = await apiCalls("get", `/master/getAllEmployeeByOrgId?orgId=${orgId}`);
      const list = res?.paramObjectsMap?.employeeVO || [];
      setAllEmployees(list);
    } catch (err) {
      showToast("error", err.message || "Failed to fetch employees");
    }
  };

  const getEmployeeList = async () => {
    
    if (!employeeName?.employeeCode) {
      setEmployeeAssets([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiCalls("get", `/assetmanagement/getAssetAllocationListAll?branchCode=${branchCode}&employeeCode=${employeeName.employeeCode}&orgId=${orgId}`);
      const list = res?.paramObjectsMap?.assetAllocationList || [];
      setEmployeeAssets(list);
    } catch (err) {
      showToast("error", err.message || "Failed to fetch assets");
      setEmployeeAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getAllEmployees(); }, []);
  useEffect(() => { getEmployeeList(); }, [employeeName]);

  const handleReset = () => {
    setValue("employeeName", null);
    setEmployeeAssets([]);
  };

  const handleRemove = async (row) => {
    console.log(row);
    if (!row?.assetCode) {
      showToast("error", "Invalid asset selected");
      return;
    }

    const payload = {
      //  id: row.id || row.assetCode,
      // id:row.id,
      assetCode: row.assetCode,
      assetName: row.assetName,
      category: row.category,
      brand: row.brand,
      serialNumber: row.serialNumber,
      branchCode: branchCode,
      orgId: orgId,
      employeeCode: employeeName.employeeCode,
      employeeName: employeeName.employee,
      branch:branch,
      finYear: finYear,
      createdBy: createdBy,
    };

    try {
      await apiCalls("put", `/assetmanagement/CreateUpdateAssetReturn`, payload);
      showToast("success", "Asset returned successfully");
      setEmployeeAssets(prev => prev.filter(a => a.assetCode !== row.assetCode));
    } catch (err) {
      showToast("error", err.message || "Failed to return asset");
    }
  };

  return (
    <>
      <ToastContainer />
      <Box display="flex" alignItems="center" gap={2}>
        <Controller
          name="employeeName"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={allEmployees}
              getOptionLabel={(option) => option ? `${option.employee} - ${option.employeeCode}` : ""}
              onChange={(event, value) => setValue("employeeName", value)}
              renderInput={(params) => (
                <TextField 
                  {...params}
                  label="Select Employee"
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 250 }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              value={employeeName}
            />
          )}
        />

        {loading ? (
          <CircularProgress size={28} />
        ) : (
          <Fab
            color="secondary"
            size="small"
            onClick={handleReset}
            sx={{
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                '& .rotate-icon': { transform: 'rotate(360deg)' },
              },
            }}
          >
            <CancelOutlined
              className="rotate-icon"
              fontSize="small"
              sx={{ transition: 'transform 0.5s ease', display: 'block' }}
            />
          </Fab>
        )}
      </Box>

      {employeeName && (
        <Box sx={{ mt: 2 }}>
          <ReturnAssetListView data={employeeAssets} onRemove={handleRemove} />
        </Box>
      )}
    </>
  );
};

export default ReturnAsset;


