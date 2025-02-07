import api from '../api';
import type { System } from '@/types/machine';

export const SystemsApi = {
  getAll: () => 
    api.get<System[]>('/systems'),
  
  getById: (id: string) => 
    api.get<System>(`/systems/${id}`),
  
  create: (data: Pick<System, 'name' | 'description'>) => 
    api.post<System>('/systems', data),
  
  update: (id: string, data: Partial<Pick<System, 'name' | 'description'>>) => 
    api.put<System>(`/systems/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/systems/${id}`)
};