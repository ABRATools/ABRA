import api from '../apis';
import type { Node } from '@/types/machine';

export const NodesApi = {
  getAll: (systemId: string) => 
    api.get<Node[]>(`/systems/${systemId}/nodes`),
  
  getById: (systemId: string, nodeId: string) => 
    api.get<Node>(`/systems/${systemId}/nodes/${nodeId}`),
  
  create: (systemId: string, data: Pick<Node, 'name' | 'description'>) => 
    api.post<Node>(`/systems/${systemId}/nodes`, data),
  
  update: (systemId: string, nodeId: string, data: Partial<Pick<Node, 'name' | 'description'>>) => 
    api.put<Node>(`/systems/${systemId}/nodes/${nodeId}`, data),
  
  delete: (systemId: string, nodeId: string) => 
    api.delete(`/systems/${systemId}/nodes/${nodeId}`)
};