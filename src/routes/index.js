import { useRoutes } from 'react-router-dom';

// routes
import AdminRoute from './AdminRoute';
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import HrmsRoute from './HrmsRoute';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([MainRoutes, AuthenticationRoutes, HrmsRoute, AdminRoute]);
}
