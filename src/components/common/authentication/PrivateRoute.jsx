import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ element}) => {
  const { isAuthenticated, isLoading, setAuthentication } = useAuth();

  useEffect(() =>{
    let token = localStorage.getItem("token");
    if(token) {
      setAuthentication(true);
    } else {
      setAuthentication(false);
    }
  }, [])

  if(isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
