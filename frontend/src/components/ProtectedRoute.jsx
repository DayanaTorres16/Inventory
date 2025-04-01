import React from 'react';
import { Navigate } from 'react-router-dom';
import AccessDenied from './AccessDenied/AccessDenied';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <AccessDenied />;
  }

  return children;
};

export default ProtectedRoute;