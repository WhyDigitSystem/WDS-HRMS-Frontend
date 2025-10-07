// SearchSection.jsx
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI
import {
  Avatar,
  Box,
  ButtonBase,
  Card,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Paper,
  Popper
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';
import menu from 'menu-items/index'; // adjust path if needed

// Icons
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';

// Transitions
import Transitions from 'ui-component/extended/Transitions';

// === Screen Code to Path Mapping ===
// const screenCodePathMap = {
//   UC: '/admin/user-creation/userCreation',
//   RR: '/basicMaster/roles',
//   SN: '/companysetup/ScreenNames',
//   SCA: '/companysetup/ScreenAccess',
//   LAD: '/companysetup/LeaveAssigned',
//   CS: '/companysetup/companysetup',
//   AP: '/attendanceProcess/AttendenceProcess',
//   MA: '/attendanceProcess/MonthlyAttendance',
//   CO: '/basicMaster/country',
//   ST: '/basicMaster/state',
//   CT: '/basicMaster/city',
//   CU: '/basicMaster/currency',
//   RG: '/basicMaster/RegionMaster',
//   DP: '/basicMaster/Department',
//   DS: '/basicMaster/Designation',
//   SM: '/basicMaster/ShiftMaster',
//   SA: '/basicMaster/ShiftAssign',
//   CM: '/basicMaster/ContractMaster',
//   OTM: '/basicMaster/OverTimeMaster',
//   OT: '/basicMaster/OverTime',
//   GR: '/basicMaster/groupMaster',
//   CL: '/calendar',
//   DB: '/dashboard/default',
//   ED: '/employeeMaster/employeeDetails',
//   LT: '/leaveMaster/LeaveType',
//   HD: '/leaveMaster/Holidays',
//   AD: '/salaryMaster/Advance',
//   SH: '/salaryMaster/salaryHeads',
//   SS: '/salaryMaster/SalaryStructure',
//   GSS: '/salaryMaster/groupSalaryStructure',
//   SP: '/salaryMaster/SalaryProcess',
//   SR: '/salaryMaster/SalaryReport',
//   PS: '/finance/payslip',
//   ESIR: '/finance/ESIReport',
//   PFR: '/finance/PFCalculationReport',
//   HR: '/me/HolidayReport',
//   LR: '/me/leaveRequest',
//   PR: '/me/permissionRequest',
//   CIO: '/me/SwipeInSwipeOut',
//   LA: '/team/LeaveApproval',
//   PA: '/team/PermissionApproval',
//   AR: '/team/AttendanceReport',
//   TA: '/team/TodayAttendance',
//   CIOR: '/team/EmployeeAttanceReport',
//   SAR: '/team/ShiftAssignReport',
// };

// === Styled Components ===

const PopperStyle = styled(Popper)(({ theme }) => ({
  zIndex: 1300,
  width: '100%',
  marginTop: theme.spacing(1),
  position: 'absolute',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

const OutlineInputStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 434,
  marginLeft: 16,
  paddingLeft: 16,
  paddingRight: 16,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& input': {
    background: 'transparent !important',
    paddingLeft: '4px !important'
  },
  [theme.breakpoints.down('lg')]: {
    width: 250
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 4
  }
}));

const HeaderAvatarStyle = styled(Avatar)(({ theme }) => ({
  ...theme.typography.commonAvatar,
  ...theme.typography.mediumAvatar,
  background: theme.palette.secondary.light,
  color: theme.palette.secondary.dark,
  '&:hover': {
    background: theme.palette.secondary.dark,
    color: theme.palette.secondary.light
  }
}));

const SearchResultsPaper = styled(Paper)(({ theme }) => ({
  maxHeight: 300,
  overflowY: 'auto',
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius
}));

// === Mobile Search ===
const MobileSearch = ({ value, setValue, popupState, screens }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const filteredScreens = screens.filter((screen) =>
    screen.name.toLowerCase().includes(value.toLowerCase())
  );

  const handleSearch = (screen) => {
    navigate(screen.path);
    setValue('');
    popupState.close();
  };

  return (
    <>
      <OutlineInputStyle
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        startAdornment={
          <InputAdornment position="start">
            <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <ButtonBase onClick={() => popupState.close()}>
              <Avatar
                variant="rounded"
                sx={{
                  background: theme.palette.orange.light,
                  color: theme.palette.orange.dark,
                  '&:hover': {
                    background: theme.palette.orange.dark,
                    color: theme.palette.orange.light
                  }
                }}
              >
                <IconX stroke={1.5} size="1.3rem" />
              </Avatar>
            </ButtonBase>
          </InputAdornment>
        }
        fullWidth
      />
      {value && (
        <SearchResultsPaper sx={{ mt: 1 }}>
          <List>
            {filteredScreens.length > 0 ? (
              filteredScreens.map((screen) => (
                <ListItem key={screen.path} disablePadding>
                  <ListItemButton onClick={() => handleSearch(screen)}>
                    <ListItemText primary={screen.name} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No results found" />
              </ListItem>
            )}
          </List>
        </SearchResultsPaper>
      )}
    </>
  );
};

MobileSearch.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  popupState: PropTypes.object.isRequired,
  screens: PropTypes.array.isRequired
};

// === Desktop Search ===
const DesktopSearch = ({ value, setValue, screens }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const filteredScreens = screens.filter((screen) =>
    screen.name.toLowerCase().includes(value.toLowerCase())
  );

  const handleSearch = (screen) => {
    navigate(screen.path);
    setValue('');
    window.location.reload();
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <OutlineInputStyle
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        startAdornment={
          <InputAdornment position="start">
            <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <ButtonBase>
              <HeaderAvatarStyle variant="rounded">
                <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
              </HeaderAvatarStyle>
            </ButtonBase>
          </InputAdornment>
        }
      />
      {value && (
        <SearchResultsPaper
          sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, ml: 2, zIndex: 1600 }}
        >
          <List>
            {filteredScreens.length > 0 ? (
              filteredScreens.map((screen) => (
                <ListItem key={screen.path} disablePadding>
                  <ListItemButton onClick={() => handleSearch(screen)}>
                    <ListItemText primary={screen.name} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No results found" />
              </ListItem>
            )}
          </List>
        </SearchResultsPaper>
      )}
    </Box>
  );
};

DesktopSearch.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  screens: PropTypes.array.isRequired
};

// === Main Component ===
const SearchSection = () => {
  const [value, setValue] = useState('');
  const [screenList, setScreenList] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const extractSearchableItems = (menuItems) => {
      const result = [];

      const traverse = (items) => {
        items.forEach((item) => {
          if (!item) return;
          if (item.type === 'item' && item.title && item.url) {
            result.push({ name: item.title, path: item.url });
          }
          if (item.children) {
            traverse(item.children);
          }
        });
      };

      traverse(menuItems);
      return result;
    };

    const allMenuItems = menu.items || [];
    const screens = extractSearchableItems(allMenuItems);
    setScreenList(screens);
  }, []);

  return (
    <>
      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
        <PopupState variant="popper" popupId="mobile-search-popper">
          {(popupState) => (
            <>
              <Box sx={{ ml: 2 }}>
                <ButtonBase>
                  <HeaderAvatarStyle variant="rounded" {...bindToggle(popupState)}>
                    <IconSearch stroke={1.5} size="1.2rem" />
                  </HeaderAvatarStyle>
                </ButtonBase>
              </Box>
              <PopperStyle {...bindPopper(popupState)} transition placement="bottom-start">
                {({ TransitionProps }) => (
                  <Transitions type="zoom" {...TransitionProps}>
                    <Card sx={{ width: '100%' }}>
                      <Box sx={{ p: 1 }}>
                        <MobileSearch
                          value={value}
                          setValue={setValue}
                          popupState={popupState}
                          screens={screenList}
                        />
                      </Box>
                    </Card>
                  </Transitions>
                )}
              </PopperStyle>
            </>
          )}
        </PopupState>
      </Box>

      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
        <DesktopSearch value={value} setValue={setValue} screens={screenList} />
      </Box>
    </>
  );
};

export default SearchSection;