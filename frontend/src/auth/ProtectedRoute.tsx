import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredPermission 
}) => {
  const { isAuthenticated, hasPermission, checkingPermissions } = useAuth();
  const location = useLocation();

  // show loading while checking permissions
  if (checkingPermissions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // check permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/display/systems" replace />;
  }

  return <Outlet />;
};