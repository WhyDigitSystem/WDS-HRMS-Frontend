import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';

import NavItem from '../NavItem';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

const NavCollapse = ({ menu, level }) => {
  const customization = useSelector((state) => state.customization);
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);

  const isActive =
    menu.children?.some((child) => {
      if (child.url === pathname) return true;
      return child.children?.some((sub) => sub.url === pathname);
    }) || false;

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [pathname]);

  const menus = menu.children?.map((item) => {
    if (item.type === 'item') {
      return <NavItem key={item.id} item={item} level={level + 1} />;
    }
    return null;
  });

  const Icon = menu.icon;

  return (
    <>
      <ListItemButton
        onClick={handleClick}
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

          // ✅ FIX: no purple icon anywhere
          '& .MuiListItemIcon-root': {
            color: '#fff'
          },

          '&.Mui-selected .MuiListItemIcon-root': {
            color: '#fff'
          },

          '&:hover': {
            backgroundColor: isActive
              ? '#10413d'
              : 'rgba(255,255,255,0.08)',

            '& .MuiListItemIcon-root': {
              color: '#fff'
            }
          },

          '&.Mui-selected:hover': {
            backgroundColor: '#10413d'
          },

          '&.Mui-focusVisible': {
            backgroundColor: 'transparent',
            outline: 'none'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: '#fff' }}>
          {Icon ? <Icon strokeWidth={1.5} size="1.2rem" /> : null}
        </ListItemIcon>

        <ListItemText
          primary={
            <Typography sx={{ color: '#fff', fontWeight: isActive ? 600 : 400 }}>
              {menu.title}
            </Typography>
          }
        />

        {open ? (
          <IconChevronUp color="#fff" />
        ) : (
          <IconChevronDown color="#fff" />
        )}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List sx={{ pl: 0, ml: 0 }}>
          {menus}
        </List>
      </Collapse>
    </>
  );
};

NavCollapse.propTypes = {
  menu: PropTypes.object,
  level: PropTypes.number
};

export default NavCollapse;