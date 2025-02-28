import api from '../apis';
import type { Environment } from '@/types/machine';

export const EnvironmentsApi = {
  getAll: (systemId: string, nodeId: string) => 
    api.get<Environment[]>(`/systems/${systemId}/nodes/${nodeId}/environments`),
  
  getById: (systemId: string, nodeId: string, envId: string) => 
    api.get<Environment>(`/systems/${systemId}/nodes/${nodeId}/environments/${envId}`),
  
  create: (systemId: string, nodeId: string, data: Partial<Environment>) => 
    api.post<Environment>(`/systems/${systemId}/nodes/${nodeId}/environments`, data),
  
  update: (systemId: string, nodeId: string, envId: string, data: Partial<Environment>) => 
    api.put<Environment>(`/systems/${systemId}/nodes/${nodeId}/environments/${envId}`, data),
  
  delete: (systemId: string, nodeId: string, envId: string) => 
    api.delete(`/systems/${systemId}/nodes/${nodeId}/environments/${envId}`)
};