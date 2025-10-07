import { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  return <SessionContext.Provider value={{ sessionExpired, setSessionExpired }}>{children}</SessionContext.Provider>;
};
