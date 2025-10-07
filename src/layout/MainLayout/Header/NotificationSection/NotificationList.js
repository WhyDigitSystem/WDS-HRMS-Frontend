// material-ui
import { useTheme, styled } from '@mui/material/styles';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  Box
} from '@mui/material';

// assets
import { IconBrandTelegram, IconBuildingStore, IconMailbox, IconPhoto } from '@tabler/icons-react';
import User1 from 'assets/images/users/user-round.svg';

// styles
const ListItemWrapper = styled('div')(({ theme }) => ({
  cursor: 'pointer',
  padding: theme.spacing(1),
  transition: 'background-color 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.primary.light,
  },
  '& .MuiListItem-root': {
    padding: 0,
    alignItems: 'flex-start'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75),
    '&:active': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.grey[700] 
        : theme.palette.grey[200]
    }
  }
}));

// ==============================|| NOTIFICATION LIST ITEM ||============================== //

const NotificationList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Compact dimensions for mobile
  const avatarSize = isMobile ? 28 : 36;
  const iconSize = isMobile ? "0.8rem" : "1.1rem";
  const primaryVariant = isMobile ? "body2" : "subtitle1";
  const secondaryVariant = isMobile ? "caption" : "body2";
  const timeVariant = isMobile ? "0.6rem" : "0.7rem";
  const minWidthAvatar = isMobile ? 38 : 48;

  // Chip styles with mobile adjustments
  const chipBaseSX = {
    height: isMobile ? 20 : 24,
    padding: '0 4px',
    fontSize: isMobile ? '0.6rem' : '0.7rem',
    borderRadius: 2
  };
  
  const chipErrorSX = {
    ...chipBaseSX,
    color: theme.palette.orange.dark,
    backgroundColor: theme.palette.orange.light,
    marginRight: '4px'
  };

  const chipWarningSX = {
    ...chipBaseSX,
    color: theme.palette.warning.dark,
    backgroundColor: theme.palette.warning.light
  };

  const chipSuccessSX = {
    ...chipBaseSX,
    color: theme.palette.success.dark,
    backgroundColor: theme.palette.success.light,
    height: isMobile ? 22 : 26
  };

  return (
    <List
      sx={{
        width: '100%',
        maxWidth: isMobile ? '100%' : isTablet ? 340 : 380,
        py: 0,
        borderRadius: '10px',
        boxShadow: theme.shadows[isMobile ? 0 : 2],
        backgroundColor: theme.palette.background.paper,
        [theme.breakpoints.down('sm')]: {
          borderRadius: 0,
          boxShadow: 'none'
        },
        '& .MuiListItemSecondaryAction-root': {
          top: isMobile ? 10 : 18
        },
        '& .MuiDivider-root': {
          my: 0,
          backgroundColor: theme.palette.divider
        }
      }}
    >
      {/* Notification 1: User Message */}
      <ListItemWrapper>
        <ListItem alignItems="center">
          <ListItemAvatar sx={{ minWidth: minWidthAvatar }}>
            <Avatar 
              alt="John Doe" 
              src={User1} 
              sx={{ 
                width: avatarSize, 
                height: avatarSize,
                border: `1px solid ${theme.palette.primary.main}`
              }} 
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography 
                variant={primaryVariant} 
                fontWeight={500}
                color="textPrimary"
                sx={{ lineHeight: 1.3 }}
              >
                John Doe
              </Typography>
            }
            sx={{ mt: isMobile ? 0 : 0 }}
          />
          <ListItemSecondaryAction>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ fontSize: timeVariant }}
            >
              2 min ago
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <Box sx={{ pl: minWidthAvatar, pt: 0.25 }}>
          <Typography 
            variant={secondaryVariant} 
            color="textSecondary"
            sx={{ pb: 1, lineHeight: 1.4 }}
          >
            It is a long established fact that a reader will be distracted
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Chip label="Unread" sx={chipErrorSX} />
            <Chip label="New" sx={chipWarningSX} />
          </Stack>
        </Box>
      </ListItemWrapper>
      <Divider />

      {/* Notification 2: Store Verification */}
      <ListItemWrapper>
        <ListItem alignItems="center">
          <ListItemAvatar sx={{ minWidth: minWidthAvatar }}>
            <Avatar
              sx={{
                color: theme.palette.success.dark,
                backgroundColor: theme.palette.success.light,
                width: avatarSize,
                height: avatarSize
              }}
            >
              <IconBuildingStore size={iconSize} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography 
                variant={primaryVariant} 
                fontWeight={500}
                color="textPrimary"
                sx={{ lineHeight: 1.3 }}
              >
                Store Verified
              </Typography>
            }
            sx={{ mt: isMobile ? 0 : 0 }}
          />
          <ListItemSecondaryAction>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ fontSize: timeVariant }}
            >
              10 min ago
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <Box sx={{ pl: minWidthAvatar, pt: 0.25 }}>
          <Typography 
            variant={secondaryVariant} 
            color="textSecondary"
            sx={{ pb: 1, lineHeight: 1.4 }}
          >
            We have successfully received your request
          </Typography>
          <Chip label="Completed" sx={chipSuccessSX} />
        </Box>
      </ListItemWrapper>
      <Divider />

      {/* Notification 3: Email Notification */}
      <ListItemWrapper>
        <ListItem alignItems="center">
          <ListItemAvatar sx={{ minWidth: minWidthAvatar }}>
            <Avatar
              sx={{
                color: theme.palette.primary.dark,
                backgroundColor: theme.palette.primary.light,
                width: avatarSize,
                height: avatarSize
              }}
            >
              <IconMailbox size={iconSize} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography 
                variant={primaryVariant} 
                fontWeight={500}
                color="textPrimary"
                sx={{ lineHeight: 1.3 }}
              >
                Check Mail
              </Typography>
            }
            sx={{ mt: isMobile ? 0 : 0 }}
          />
          <ListItemSecondaryAction>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ fontSize: timeVariant }}
            >
              1 hour ago
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <Box sx={{ pl: minWidthAvatar, pt: 0.25 }}>
          <Typography 
            variant={secondaryVariant} 
            color="textSecondary"
            sx={{ pb: 1, lineHeight: 1.4 }}
          >
            Check your inbox for a sweet treat!
          </Typography>
          <Button 
            variant="contained" 
            size={isMobile ? "small" : "medium"}
            disableElevation 
            endIcon={<IconBrandTelegram size={iconSize} />}
            sx={{ 
              py: isMobile ? 0.2 : 0.5,
              px: isMobile ? 1 : 1.5,
              fontSize: isMobile ? '0.65rem' : '0.8rem',
              borderRadius: 1.5
            }}
          >
            Mail
          </Button>
        </Box>
      </ListItemWrapper>
      <Divider />

      {/* Notification 4: File Upload */}
      <ListItemWrapper>
        <ListItem alignItems="center">
          <ListItemAvatar sx={{ minWidth: minWidthAvatar }}>
            <Avatar 
              alt="John Doe" 
              src={User1} 
              sx={{ 
                width: avatarSize, 
                height: avatarSize,
                border: `1px solid ${theme.palette.secondary.main}`
              }} 
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography 
                variant={primaryVariant} 
                fontWeight={500}
                color="textPrimary"
                sx={{ lineHeight: 1.3 }}
              >
                Sarah Johnson
              </Typography>
            }
            sx={{ mt: isMobile ? 0 : 0 }}
          />
          <ListItemSecondaryAction>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ fontSize: timeVariant }}
            >
              3 hours ago
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <Box sx={{ pl: minWidthAvatar, pt: 0.25 }}>
          <Typography 
            variant={secondaryVariant} 
            color="textSecondary"
            sx={{ pb: 1, lineHeight: 1.4 }}
          >
            Uploaded files on {' '}
            <Typography 
              component="span" 
              variant={secondaryVariant}
              color="primary"
              fontWeight={500}
            >
              21 Jan
            </Typography>
          </Typography>
          <Card
            sx={{
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.grey[100],
              borderRadius: 1.5,
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              maxWidth: isMobile ? 180 : 240
            }}
          >
            <CardContent sx={{ p: isMobile ? 1 : 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                  bgcolor: theme.palette.primary.light,
                  p: 0.5,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconPhoto size={iconSize} color={theme.palette.primary.main} />
                </Box>
                <Box>
                  <Typography 
                    variant={secondaryVariant}
                    fontWeight={500}
                    color="textPrimary"
                    sx={{ lineHeight: 1.2 }}
                  >
                    demo.jpg
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ fontSize: timeVariant, lineHeight: 1.2 }}
                  >
                    2.4 MB
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </ListItemWrapper>
      <Divider />

      {/* Notification 5: Account Confirmation */}
      <ListItemWrapper>
        <ListItem alignItems="center">
          <ListItemAvatar sx={{ minWidth: minWidthAvatar }}>
            <Avatar 
              alt="John Doe" 
              src={User1} 
              sx={{ 
                width: avatarSize, 
                height: avatarSize,
                border: `1px solid ${theme.palette.success.main}`
              }} 
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography 
                variant={primaryVariant} 
                fontWeight={500}
                color="textPrimary"
                sx={{ lineHeight: 1.3 }}
              >
                Michael Chen
              </Typography>
            }
            sx={{ mt: isMobile ? 0 : 0 }}
          />
          <ListItemSecondaryAction>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ fontSize: timeVariant }}
            >
              1 day ago
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <Box sx={{ pl: minWidthAvatar, pt: 0.25 }}>
          <Typography 
            variant={secondaryVariant} 
            color="textSecondary"
            sx={{ pb: 1, lineHeight: 1.4 }}
          >
            Account successfully verified
          </Typography>
          <Chip 
            label="Verified" 
            sx={chipSuccessSX} 
            icon={<Box sx={{
              width: 6,
              height: 6,
              bgcolor: theme.palette.success.main,
              borderRadius: '50%',
              ml: 0.5
            }} />}
          />
        </Box>
      </ListItemWrapper>
      
      {/* View All Button */}
      <Box sx={{ p: isMobile ? 1 : 1.5, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          fullWidth
          size={isMobile ? "small" : "medium"}
          sx={{
            py: isMobile ? 0.5 : 0.8,
            borderRadius: 1.5,
            fontWeight: 500,
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            borderWidth: 1,
            '&:hover': { borderWidth: 1 }
          }}
        >
          View All
        </Button>
      </Box>
    </List>
  );
};

export default NotificationList;