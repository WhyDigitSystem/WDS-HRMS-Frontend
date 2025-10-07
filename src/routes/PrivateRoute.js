// components/PrivateRoute.js
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // or however you manage auth
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
