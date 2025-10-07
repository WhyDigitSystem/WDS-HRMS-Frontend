// material-ui
import { Link, Stack, Typography } from '@mui/material';

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

const AuthFooter = () => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="subtitle2" component={Link} href="https://binbee.com" target="_blank" underline="hover">
      binbee.com
    </Typography>
    <Typography variant="subtitle2" component={Link} href="https://whydigit.com" target="_blank" underline="hover">
      &copy; whydigit.com
    </Typography>
  </Stack>
);

export default AuthFooter;
