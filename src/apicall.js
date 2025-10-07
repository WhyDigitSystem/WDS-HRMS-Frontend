// src/apiCalls.js
import api from './api';

const apiCalls = async (method, url, data = {}, params = {}, headers = {}) => {
  try {
    const response = await api({
      method: method,
      url: url,
      data: data,
      params: params,
      headers: headers
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiCalls;
