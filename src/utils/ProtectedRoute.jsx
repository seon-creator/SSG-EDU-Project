// // ProtectedRoute.jsx
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { getToken } from './auth';

// const ProtectedRoute = ({ element: Component }) => {
//   const token = getToken();

//   if (!token) {
//     return <Navigate to="/login" />;
//   }

//   return <Component />;
// };

// export default ProtectedRoute;

import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('access_token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;