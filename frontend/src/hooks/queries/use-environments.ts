import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnvironmentsApi } from '@/lib/api/environments';
import { useToast } from '@/hooks/use-toast';

export function useEnvironments(systemId: string, nodeId: string) {
  return useQuery({
    queryKey: ['systems', systemId, 'nodes', nodeId, 'environments'],
    queryFn: () => EnvironmentsApi.getAll(systemId, nodeId),
    enabled: !!systemId && !!nodeId
  });
}

export function useEnvironment(systemId: string, nodeId: string, envId: string) {
  return useQuery({
    queryKey: ['systems', systemId, 'nodes', nodeId, 'environments', envId],
    queryFn: () => EnvironmentsApi.getById(systemId, nodeId, envId),
    enabled: !!systemId && !!nodeId && !!envId
  });
}

export function useCreateEnvironment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: EnvironmentsApi.create,
      onSuccess: () => {
        queryClient.invalidateQueries(['environments']);
        toast({
          title: 'Success',
          description: 'Environment created successfully'
        });
      }
    });
}
  
export function useUpdateEnvironment(id: string) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: (data) => EnvironmentsApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries(['environments']);
        toast({
          title: 'Success',
          description: 'Environment updated successfully'
        });
      }
    });
}
  
export function useDeleteEnvironment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: EnvironmentsApi.delete,
      onSuccess: () => {
        queryClient.invalidateQueries(['environments']);
        toast({
          title: 'Success',
          description: 'Environment deleted successfully'
        });
      }
    });
}