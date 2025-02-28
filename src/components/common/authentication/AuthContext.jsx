import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const isSuperAdminIn = sessionStorage.getItem('isSuperAdminIn');
    const isMemberIn = sessionStorage.getItem('isMemberIn');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    if(isSuperAdminIn === "true") {
      setIsSuperAdmin(true);
    }
    if(isMemberIn === "true") {
      setIsMember(true);
    }
    setIsLoading(false);
    console.log(isMember);
    console.log(isSuperAdmin);
  }, [isAuthenticated, isMember, isSuperAdmin]);

  const login = (token, isSuperAdminIn, isMemberIn, emailId, userId) => {
    setIsMember(isMemberIn);
    setIsSuperAdmin(isSuperAdminIn);
    setToken(token);
    setIsAuthenticated(true);
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("email", emailId);
    sessionStorage.setItem("isSuperAdminIn", isSuperAdminIn); 
    sessionStorage.setItem("isMemberIn", isMemberIn); 
    sessionStorage.setItem("userId", userId); 
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem("isSuperAdminIn"); 
    sessionStorage.removeItem("isMemberIn");
    sessionStorage.removeItem("userId");
  };

  const setAuthentication = (status) => {
    setIsAuthenticated(status);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, isLoading, setAuthentication, isSuperAdmin, isMember }}>
      {children}
    </AuthContext.Provider>
  );
};
