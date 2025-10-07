// src/utils/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://139.5.189.195:8051', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
