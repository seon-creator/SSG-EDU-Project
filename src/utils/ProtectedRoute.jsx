// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from './auth';

const ProtectedRoute = ({ element: Component }) => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <Component />;
};

export default ProtectedRoute;