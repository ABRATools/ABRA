import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const checkAuth = (test_token: string | null) => {
    if (!test_token) {
      return false;
    }
    fetch('/auth/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${test_token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        console.log("Authenticated");
        return true;
      }
      else {
        console.error('Not authenticated');
        return false;
      }
    }).catch((error) => {
      console.error('Not authenticated', error);
      return false;
    });
    return false;
  }
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token && checkAuth(token));
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      sessionStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isAuthenticated }}>
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
};