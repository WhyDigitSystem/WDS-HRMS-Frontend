import PropTypes from 'prop-types';
import { forwardRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery
} from '@mui/material';

import { MENU_OPEN, SET_MENU } from 'store/actions';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const NavItem = ({ item, level }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const customization = useSelector((state) => state.customization);
  const matchesSM = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const isActive = pathname === item.url;

  const Icon = item.icon;

  const itemIcon = Icon ? (
    <Icon stroke={1.5} size="1.2rem" />
  ) : (
    <FiberManualRecordIcon sx={{ color: '#fff' }} />
  );

  const listItemProps = {
    component: forwardRef((props, ref) => (
      <Link
        ref={ref}
        {...props}
        to={item.url}
        style={{
          textDecoration: 'none',
          color: 'inherit'
        }}
      />
    ))
  };

  const itemHandler = () => {
    dispatch({ type: MENU_OPEN, id: item.id });
    if (matchesSM) dispatch({ type: SET_MENU, opened: false });
  };

  useEffect(() => {
    const currentIndex = pathname
      .toString()
      .split('/')
      .findIndex((id) => id === item.id);

    if (currentIndex > -1) {
      dispatch({ type: MENU_OPEN, id: item.id });
    }
  }, [pathname]);

  return (
    <ListItemButton
      {...listItemProps}
      onClick={itemHandler}
      selected={isActive}
      disableRipple
      disableTouchRipple
      sx={{
        borderRadius: `${customization.borderRadius}px`,
        mb: 0.5,
        pl: `${level * 20}px`,
        py: 1,
        color: '#fff',

        backgroundColor: isActive ? '#10413d' : 'transparent',

        '&.Mui-selected': {
          backgroundColor: '#10413d'
        },

        '&.Mui-selected:hover': {
          backgroundColor: '#10413d'
        },

        '&.Mui-focusVisible': {
          backgroundColor: 'transparent',
          outline: 'none'
        },

        '&:hover': {
          backgroundColor: isActive
            ? '#10413d'
            : 'rgba(255,255,255,0.08)'
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: '#fff' }}>
        {itemIcon}
      </ListItemIcon>

      <ListItemText
        primary={
          <Typography
            sx={{
              color: '#fff',
              fontWeight: isActive ? 600 : 400,
              fontSize: level > 0 ? '0.85rem' : '0.95rem'
            }}
          >
            {item.title}
          </Typography>
        }
      />
    </ListItemButton>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number
};

export default NavItem;