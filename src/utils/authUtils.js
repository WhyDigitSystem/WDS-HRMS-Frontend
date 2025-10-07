// utils/authUtils.js

import apiCalls from 'apicall';
import { handleSessionExpiration } from './sessionUtils';

export const refreshToken = async (tokenId, userName) => {
  try {
    const result = await apiCalls('get', `/auth/getRefreshToken?tokenId=${tokenId}&userName=${userName}`);

    // Make sure you have the correct path to access the tokens
    const newToken = result?.paramObjectsMap?.refreshToken?.token;
    const newTokenId = result?.paramObjectsMap?.refreshToken?.tokenId;

    if (!newToken || !newTokenId) {
      throw new Error('Token or TokenId not found in the response');
    }

    // Update the token and tokenId in localStorage using different keys
    localStorage.setItem('token', newToken);
    localStorage.setItem('tokenId', newTokenId);

    console.log('RefreshToken Called:');
    return newToken;
  } catch (error) {
    // console.error('Failed to refresh token', error);
    // If refresh token request fails, handle session expiration
    handleSessionExpiration();
    throw error;
  }
};
