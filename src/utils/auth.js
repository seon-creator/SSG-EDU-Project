// src/utils/auth.js
import { jwtDecode } from 'jwt-decode';
import { userApi } from './api';
export const getRole = () => {
  const token = getToken(); // 기존에 작성된 getToken() 재사용
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.role; // JWT의 role 값 반환
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
export const getCurrentUser = async () => {
  try {
    const response = await userApi.getCurrentUser();
    return response.data.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const setToken = (token) => {
  localStorage.setItem('access_token', token);
};

export const refreshToken = (newToken) => {
  localStorage.refreshToken('refresh_token', newToken);
}

export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};