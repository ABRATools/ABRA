import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SystemsApi } from '@/lib/apis/systems';
import { useToast } from '@/hooks/use-toast';

export function useSystems() {
  return useQuery({
    queryKey: ['systems'],
    queryFn: SystemsApi.getAll
  });
}

export function useSystem(id: string) {
  return useQuery({
    queryKey: ['systems', id],
    queryFn: () => SystemsApi.getById(id),
    enabled: !!id
  });
}

export function useCreateSystem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: SystemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['systems']);
      toast({
        title: 'Success',
        description: 'System created successfully'
      });
    }
  });
}

export function useUpdateSystem(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => SystemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['systems']);
      toast({
        title: 'Success',
        description: 'System updated successfully'
      });
    }
  });
}

export function useDeleteSystem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: SystemsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['systems']);
      toast({
        title: 'Success',
        description: 'System deleted successfully'
      });
    }
  });
}