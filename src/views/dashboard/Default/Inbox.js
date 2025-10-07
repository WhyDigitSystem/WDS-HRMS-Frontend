import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// Updated image path
const InboxImage = '/assets/inbox-image.png'; // Change this path based on your project structure

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.warning.dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180,
    opacity: 0.4
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.warning.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: '50%',
    top: -160,
    right: -130,
    opacity: 0.4
  }
}));

const Inbox = ({ isLoading }) => {
  const theme = useTheme();

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.2rem', color: theme.palette.primary.main }}>
              Inbox
            </Typography>
            <List sx={{ py: 0 }}>
              {[{ title: 'New Task', text: '15 new task received' }, { title: 'Pending Task', text: '5 task pending' }].map((item, index) => (
                <ListItem key={index} alignItems="center" disableGutters sx={{ py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                    <StorefrontTwoToneIcon />
                  </Avatar>
                  <ListItemText
                    primary={<Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.title}</Typography>}
                    secondary={<Typography variant="subtitle2" sx={{ color: theme.palette.grey[500], fontSize: '0.875rem' }}>{item.text}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

Inbox.propTypes = {
  isLoading: PropTypes.bool
};

export default Inbox;