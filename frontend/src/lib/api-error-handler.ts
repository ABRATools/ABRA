import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from './api';

export const ApiErrorHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'An error occurred',
          variant: 'destructive',
        });
        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [toast]);

  return null;
};