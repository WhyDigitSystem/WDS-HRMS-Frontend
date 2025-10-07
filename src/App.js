import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import NavigationScroll from 'layout/NavigationScroll';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Routes from 'routes';
import themes from 'themes';

import SessionExpiredPopup from 'utils/SessionExpiredPopup';
// import ToastComponent from './utils/toast-component';

const App = () => {
  const customization = useSelector((state) => state.customization);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      setSessionExpired(true);
    };

    // Add event listener for session expired event
    window.addEventListener('sessionExpired', handleSessionExpiredEvent);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpiredEvent);
    };
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          <Routes />
          {/* <ToastComponent /> */}
          <SessionExpiredPopup open={sessionExpired} />
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
