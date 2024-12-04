import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// weird typescript type for callback function
const useAuth = (onUnauthorized: () => void) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = async () => {
      const token = sessionStorage.getItem('token');

      if (!token) {
        setIsAuthorized(false);
        setLoading(false);
        if (onUnauthorized) onUnauthorized();
        return;
      }

      try {
        const response = await fetch('/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);

          // run onUnauthorized callback if provided
          if (onUnauthorized) onUnauthorized();
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
        if (onUnauthorized) onUnauthorized();
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [onUnauthorized]);

  return { isAuthorized, loading };
};

export default useAuth;