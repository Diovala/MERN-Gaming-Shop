import { createContext, useState, useEffect } from 'react';
export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);

  useEffect(() => {
    if (token) localStorage.setItem('admin_token', token);
    else localStorage.removeItem('admin_token');
  }, [token]);

  const login = (newToken) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AdminContext.Provider value={{ token, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};