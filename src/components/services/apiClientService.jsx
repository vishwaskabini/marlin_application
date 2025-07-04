import axios from 'axios';
import { useAuth } from '../common/authentication/AuthContext';

const apiClient = axios.create({
  baseURL: 'https://marlinapi-c5bacuaghzcdf0hb.canadacentral-01.azurewebsites.net/',
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {    
    if (error.config && error.config.url && error.config.url.includes('/login')) {      
      return Promise.reject(error);
    }

    if (error.response) {
      console.error('Response error:', error.response);
      if (error.response.status === 401) {
        //alert('Session expired. Please log in again.');
      }
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
