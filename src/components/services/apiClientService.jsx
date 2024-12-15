import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://marlinapi-c5bacuaghzcdf0hb.canadacentral-01.azurewebsites.net/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
    if (error.response) {
      console.error('Response error:', error.response);
      if (error.response.status === 401) {
        alert('Session expired. Please log in again.');
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
