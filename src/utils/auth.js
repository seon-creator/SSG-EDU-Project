// src/utils/auth.js
export const setToken = (token) => {
    sessionStorage.setItem('token', token);
};

export const refreshToken = (newToken) => {
  sessionStorage.refreshToken('token', newToken);
}
  
export const getToken = () => {
  return sessionStorage.getItem('token');
};

export const removeToken = () => {
  sessionStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};