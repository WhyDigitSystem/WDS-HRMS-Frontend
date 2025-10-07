import { Box, Chip, ClickAwayListener, Divider, List, ListItem, ListItemText, Paper, Popper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconSettings } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

const sitemapData = [
  {
    title: 'Modules',
    items: [
      {
        name: 'Setup',
        items: [
          { name: 'Company Setup' },
          { name: 'Financial Year' },
          { name: 'Doc Type' },
          { name: 'Doc Type Mapping' },
          { name: 'Doc Type Mapping - Multiple' }
        ]
      },
      {
        name: 'User Management',
        items: [{ name: 'User Creation' }, { name: 'Roles' }, { name: 'Responsibility' }]
      },
      {
        name: 'Basic Master',
        items: [
          { name: 'Country' },
          { name: 'Currency' },
          { name: 'State / Province / Region' },
          { name: 'City' },
          { name: 'Region' },
          { name: 'Department' },
          { name: 'Designation' },
          { name: 'Employee' }
        ]
      }
    ]
  }
];

const SiteMapSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // Flatten sitemap data to render as a single list
  const flattenSitemap = (data) => {
    const result = [];
    data.forEach((section) => {
      if (section.title) result.push({ name: section.title });
      section.items?.forEach((item) => {
        result.push({ name: `- ${item.name}` });
        item.items?.forEach((subItem) => {
          result.push({ name: `-- ${subItem.name}` });
        });
      });
    });
    return result;
  };

  const flattenedSitemap = flattenSitemap(sitemapData);

  return (
    <>
      <Chip
        sx={{
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          transition: 'all .2s ease-in-out',
          borderColor: theme.palette.primary.light,
          backgroundColor: theme.palette.primary.light,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.light
          }
        }}
        label={<IconSettings stroke={1.5} size="1.5rem" color={theme.palette.primary.main} />}
        variant="outlined"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      />
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <PerfectScrollbar style={{ height: '300px', overflowX: 'hidden' }}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h4" gutterBottom>
                        Sitemap
                      </Typography>
                      <Divider />
                      <List>
                        {flattenedSitemap.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={item.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </PerfectScrollbar>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default SiteMapSection;
