import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserPermissions {
  routes: string[];
  permissions: string[];
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  permissions: UserPermissions | null;
  checkingPermissions: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // check authentication status when token changes
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
      setIsAuthenticated(true);
      fetchUserPermissions();
    } else {
      sessionStorage.removeItem('token');
      setIsAuthenticated(false);
      setPermissions(null);
    }
  }, [token]);

  // fetch user permissions when authenticated
  const fetchUserPermissions = async () => {
    setCheckingPermissions(true);
    try {
      const response = await fetch('/rbac/routes/accessible', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      if (data.success) {
        setPermissions({
          routes: data.routes || [],
          permissions: data.permissions || [],
        });
      } else {
        console.error('Error fetching permissions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // 401, token might be bad
      if (error instanceof Response && error.status === 401) {
        setToken(null);
      }
    } finally {
      setCheckingPermissions(false);
    }
  };

  // check access whenever route changes
  useEffect(() => {
    if (isAuthenticated && permissions && !checkingPermissions) {
      const canAccess = canAccessRoute(location.pathname);
      if (!canAccess && location.pathname !== '/login') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate('/display/systems');
      }
    }
  }, [location.pathname, permissions, isAuthenticated, checkingPermissions]);

  const logout = () => {
    fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    }).then(() => {
      setToken(null);
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    }).catch(error => {
      console.error('Logout failed:', error);
      setToken(null);
      navigate('/login');
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    
    // admin permission grants access to everything
    if (permissions.permissions.includes('admin:all')) {
      return true;
    }
    
    return permissions.permissions.includes(permission);
  };

  const canAccessRoute = (route: string): boolean => {
    if (!permissions) return false;
    
    if (permissions.permissions.includes('admin:all')) {
      return true;
    }

    // public routes for anyone
    const publicRoutes = ['/login', '/'];
    if (publicRoutes.includes(route)) {
      return true;
    }
    
    // check if the exact route is in accessible routes
    if (permissions.routes.includes(route)) {
      return true;
    }

    // normalize route with parameters
    // /display/systems/123 should match /display/systems/:systemId
    const parts = route.split('/').filter(Boolean);
    
    for (const accessibleRoute of permissions.routes) {
      const accessibleParts = accessibleRoute.split('/').filter(Boolean);
      
      // if different number of segments, can't match
      if (parts.length !== accessibleParts.length) {
        continue;
      }
      
      // check if all parts match (accounting for params)
      let matches = true;
      for (let i = 0; i < parts.length; i++) {
        if (accessibleParts[i].startsWith(':') || parts[i] === accessibleParts[i]) {
          // parameter or exact match, this part is fine
          continue;
        } else {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      setToken, 
      logout, 
      isAuthenticated,
      hasPermission,
      canAccessRoute,
      permissions,
      checkingPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}