import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    setToken(token);
    setIsAuthenticated(true);
    localStorage.setItem("token", token); 
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const setAuthentication = (status) => {
    setIsAuthenticated(status);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, isLoading, setAuthentication }}>
      {children}
    </AuthContext.Provider>
  );
};
