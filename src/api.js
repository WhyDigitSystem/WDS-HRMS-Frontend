// api.js
import axios from 'axios';
import { refreshToken } from 'utils/authUtils';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      console.error('Error response:', error.response);

      if (error.response.status === 401 && !originalRequest._retry) {
        // Mark the request as a retry
        originalRequest._retry = true;

        try {
          const token = localStorage.getItem('tokenId');
          const userName = localStorage.getItem('userName'); // Retrieve the userName from your context or storage
          const newToken = await refreshToken(token, userName);

          console.log('NewToken => ', newToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Handle refresh token failure

          return Promise.reject(refreshError);
        }
      } else {
        // toast.error(`Error: ${error.response.status} - ${error.response.data.message || 'An error occurred'}`, {
        //   autoClose: 2000,
        //   theme: 'colored'
        // });
      }
    } else if (error.request) {
      console.error('Error request:', error.request);
      // toast.error('No response received from server', {
      //   autoClose: 2000,
      //   theme: 'colored'
      // });
    } else {
      console.error('Error message:', error.message);
      // toast.error(`Error: ${error.message}`, {
      //   autoClose: 2000,
      //   theme: 'colored'
      // });
    }

    return Promise.reject(error);
  }
);

export default api;
