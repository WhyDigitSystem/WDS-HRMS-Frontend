import { useEffect, useRef, useState } from 'react';

// material-ui
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CardActions,
  ClickAwayListener,
  Divider,
  Grid,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third-party

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

// assets

import { IconWorld } from '@tabler/icons-react';
import apiCalls from 'apicall';
import { ToastContainer } from 'react-toastify';
import { showToast } from 'utils/toast-component';

// notification status options

// ==============================|| NOTIFICATION ||============================== //

const GlobalSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [finYearValue, setFinYearValue] = useState('');
  const [companyValue, setCompanyValue] = useState('');
  const [customerValue, setCustomerValue] = useState('');
  // const [warehouseValue, setWarehouseValue] = useState('');
  const [clientValue, setClientValue] = useState('');
  const [branchValue, setBranchValue] = useState('');
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [branchVO, setBranchVO] = useState([]);
  const [finVO, setFinVO] = useState([]);
  const [warehouseVO, setWarehouseVO] = useState([]);
  const [customerVO, setCustomerVO] = useState([]);
  const [clientVO, setClientVO] = useState([]);
  const [globalParameter, setGlobalParameter] = useState([]);
  const [branchName, setBranchName] = useState('');

  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  useEffect(() => {
    getGlobalParameter();
    getAccessBranch();
    getFinYear();
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [selectedBranch, setSelectedBranch] = useState({ branch: '', branchcode: '' });

  const handleBranchChange = (event) => {
    const branchcode = event.target.value;
    const branch = branchVO.find((option) => option.branchcode === branchcode);

    if (branch) {
      setSelectedBranch({ branch: branch.branch, branchcode: branchcode });
      setBranchName(branch.branch); // Set the branchName state
    }

    setBranchValue(branchcode);

    getCustomer(branchcode);
  };
  const getAccessBranch = async () => {
    try {
      const result = await apiCalls('get', `GlobalParam/globalparamBranchByUserName?orgid=${orgId}&userName=${userName}`);
      setBranchVO(result.paramObjectsMap.GlopalParameters || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getFinYear = async () => {
    try {
      const result = await apiCalls('get', `/commonmaster/getAllAciveFInYear?orgId=${orgId}`);
      setFinVO(result.paramObjectsMap.financialYearVOs || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getCustomer = async (branchcode) => {
    const formData = {
      branchcode: branchcode,
      orgid: orgId,
      userName: userName
    };

    const queryParams = new URLSearchParams(formData).toString();

    try {
      const result = await apiCalls('get', `GlobalParam/globalparamCustomerByUserName?${queryParams}`);
      setCustomerVO(result.paramObjectsMap.GlopalParameterCustomer);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getClient = async (customer, branchCode) => {
    const formData = {
      branchcode: branchCode,
      orgid: orgId,
      userName: userName,
      customer: customer
    };

    const queryParams = new URLSearchParams(formData).toString();

    try {
      const result = await apiCalls('get', `GlobalParam/globalparamClientByUserName?${queryParams}`);
      setClientVO(result.paramObjectsMap.GlopalParameterClient);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getGlobalParameter = async () => {
    try {
      const result = await apiCalls('get', `GlobalParam/globalparam/username?orgid=${orgId}&userId=${userId}`);
      const globalParameterVO = result.paramObjectsMap.globalParam;
      setGlobalParameter(globalParameterVO);
      // setCustomerValue(globalParameterVO.customer);
      setClientValue(globalParameterVO.client);
      setFinYearValue(globalParameterVO.finYear);
      // setWarehouseValue(globalParameterVO.warehouse);
      setBranchValue(globalParameterVO.branchcode);
      setBranchName(globalParameterVO.branch);
      console.log('Test', result);

      // localStorage.setItem('customer', globalParameterVO.customer);
      // localStorage.setItem('client', globalParameterVO.client);
      localStorage.setItem('finYear', globalParameterVO.finYear);
      // localStorage.setItem('warehouse', globalParameterVO.warehouse);
      localStorage.setItem('branchcode', globalParameterVO.branchcode);
      localStorage.setItem('branch', globalParameterVO.branch);

      getCustomer(globalParameterVO.branchcode);
      getClient(globalParameterVO.customer, globalParameterVO.branchcode);
      // getWareHouse(globalParameterVO.branchcode);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleSubmit = async () => {
    const formData = {
      branch: branchName,
      branchcode: branchValue,
      finYear: finYearValue,
      // warehouse: warehouseValue,
      userid: userId,
      orgId
    };
    try {
      const result = await apiCalls('put', `GlobalParam/globalparam`, formData);
      showToast('success', 'Global Parameter updated succesfully');
      // setOpen(false);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleChange = (event) => {
    if (event?.target.value) setValue(event?.target.value);
  };

  const handleFinYearChange = (event) => {
    setFinYearValue(event.target.value);
  };

  const handleClientChange = (event) => {
    setClientValue(event.target.value);
    // getWareHouse(selectedBranch.branchcode);
  };

  const handleCustomerChange = (event) => {
    setCustomerValue(event.target.value);

    getClient(event.target.value, selectedBranch.branchcode);
  };

  // const handleWarehouseChange = (event) => {
  //   setWarehouseValue(event.target.value);
  // };

  return (
    <>
      <Box
        sx={{
          ml: 2,
          mr: 2,
          [theme.breakpoints.down('md')]: {
            mr: 2
          }
        }}
      >
        <ButtonBase sx={{ borderRadius: '12px' }}>
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
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            color="inherit"
          >
            <IconWorld stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? 5 : 0, 20]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ width: 300 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                        <Grid item>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1">Global Parameter</Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container direction="column" spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ px: 2, pt: 0.25 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              fullWidth
                              label="Fin Year"
                              value={finYearValue}
                              onChange={handleFinYearChange}
                              SelectProps={{
                                native: true
                              }}
                              size="small"
                            >
                              <option value="" disabled>
                                {/* Select FinYear */}
                              </option>
                              {finVO?.map((option) => (
                                <option key={option.id} value={option.finYear}>
                                  {option.finYear}
                                </option>
                              ))}
                            </TextField>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ px: 2, pt: 0.25 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              small
                              fullWidth
                              label="Branch"
                              value={branchValue}
                              onChange={handleBranchChange}
                              SelectProps={{
                                native: true
                              }}
                              size="small"
                            >
                              <option value="" disabled>
                                {/* Select Branch */}
                              </option>
                              {branchVO.map((option) => (
                                <option key={option.branchcode} value={option.branchcode}>
                                  {option.branch}
                                </option>
                              ))}
                            </TextField>
                          </Box>
                        </Grid>
                        {/* 
                        <Grid item xs={12}>
                          <Box sx={{ px: 2, pt: 0.25 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              fullWidth
                              label="customer"
                              value={customerValue}
                              onChange={handleCustomerChange}
                              SelectProps={{
                                native: true
                              }}
                              size="small"
                            >
                              <option value="" disabled></option>
                              {customerVO?.map((option) => (
                                <option key={option.customer} value={option.customer}>
                                  {option.customer}
                                </option>
                              ))}
                            </TextField>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ px: 2, pt: 0.25 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              fullWidth
                              label="client"
                              value={clientValue}
                              onChange={handleClientChange}
                              SelectProps={{
                                native: true
                              }}
                              size="small"
                            >
                              <option value="" disabled></option>
                              {clientVO?.map((option) => (
                                <option key={option.client} value={option.client}>
                                  {option.client}
                                </option>
                              ))}
                            </TextField>
                          </Box>
                        </Grid> */}

                        {/* <Grid item xs={12}>
                          <Box sx={{ px: 2, pt: 0.25 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              fullWidth
                              label="Warehouse"
                              value={warehouseValue}
                              onChange={handleWarehouseChange}
                              SelectProps={{
                                native: true
                              }}
                              size="small"
                            >
                              <option value="" disabled></option>
                              {warehouseVO?.map((option) => (
                                <option key={option.Warehouse} value={option.Warehouse}>
                                  {option.Warehouse}
                                </option>
                              ))}
                            </TextField>
                          </Box>
                        </Grid> */}
                        <Grid item xs={12} p={0}>
                          <Divider sx={{ my: 0 }} />
                        </Grid>
                      </Grid>
                      {/* <NotificationList /> */}
                    </Grid>
                  </Grid>
                  <Divider />
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button size="small" disableElevation onClick={handleSubmit}>
                      change
                    </Button>
                  </CardActions>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <ToastContainer />
    </>
  );
};

export default GlobalSection;
