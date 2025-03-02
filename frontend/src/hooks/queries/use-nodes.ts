import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NodesApi } from '@/lib/apis/nodes';
import { useToast } from '@/hooks/use-toast';

export function useNodes(systemId: string) {
  return useQuery({
    queryKey: ['systems', systemId, 'nodes'],
    queryFn: () => NodesApi.getAll(systemId),
    enabled: !!systemId
  });
}

export function useNode(systemId: string, nodeId: string) {
  return useQuery({
    queryKey: ['systems', systemId, 'nodes', nodeId],
    queryFn: () => NodesApi.getById(systemId, nodeId),
    enabled: !!systemId && !!nodeId
  });
}

export function useCreateNode() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: NodesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['nodes']);
            toast({
                title: 'Success',
                description: 'Node created successfully'
            });
        }
    });
}

export function useUpdateNode(system_id: string, id: string) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: (data) => NodesApi.update(system_id, id, data),
      onSuccess: () => {
        queryClient.invalidateQueries(['nodes']);
        toast({
          title: 'Success',
          description: 'Node updated successfully'
        });
      }
    });
}
  
export function useDeleteNode() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: NodesApi.delete,
      onSuccess: () => {
        queryClient.invalidateQueries(['nodes']);
        toast({
          title: 'Success',
          description: 'Node deleted successfully'
        });
      }
    });
}