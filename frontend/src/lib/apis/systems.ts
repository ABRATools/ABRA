import api from '../api';
import type { System } from '@/types/machine';

// system data from api
interface ApiSystem {
  system_id: string;
  name: string;
  description?: string;
  environments: Array<{
    env_id: string;
    name: string;
    status: string;
    node_id: string;
    node_name: string;
    ip?: string;
    os?: string;
  }>;
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
  source?: 'database' | 'auto-generated';
}

// input for creating a system
export interface CreateSystemInput {
  system_id: string; 
  name: string;
  description?: string;
  is_custom?: boolean;
  environment_ids: string[];
}

// convert api system to frontend system type
const mapApiSystemToSystem = (apiSystem: ApiSystem): System => ({
  id: apiSystem.system_id,
  name: apiSystem.name,
  description: apiSystem.description,
  status: 'healthy', // calculated by frontend based on environments
  nodeCount: 0, // will be calculated if needed
  totalContainers: apiSystem.environments.length,
  nodes: [], // will be populated if needed
  environments: apiSystem.environments.map(env => ({
    env_id: env.env_id,
    name: env.name,
    status: env.status,
    ip: env.ip || '',
    networks: [],
    ports: [],
    state: env.status || 'unknown',
    image: '',
    names: [env.name],
    started_at: 0,
    exited: false,
    exit_code: 0,
    exited_at: 0,
    cpu_percentage: 0,
    memory_percent: 0,
    uptime: 0,
    sourceNode: {
      node_id: env.node_id,
      name: env.node_name
    }
  })),
  isCustom: apiSystem.is_custom,
  createdAt: apiSystem.created_at ? new Date(apiSystem.created_at) : undefined,
  updatedAt: apiSystem.updated_at ? new Date(apiSystem.updated_at) : undefined,
  source: apiSystem.source
});

export const SystemsApi = {
  // get all systems
  getAll: async (): Promise<System[]> => {
    try {
      const response = await api.post<{systems: ApiSystem[]}>('/api/systems', {});
      return response.data.systems.map(mapApiSystemToSystem);
    } catch (error) {
      console.error('Error getting systems:', error);
      return [];
    }
  },
  
  // get a specific system by id
  getById: async (id: string): Promise<System | null> => {
    try {
      const response = await api.post<{system: ApiSystem}>(`/api/system/${id}`, {});
      return mapApiSystemToSystem(response.data.system);
    } catch (error) {
      console.error(`Error getting system ${id}:`, error);
      return null;
    }
  },
  
  // create a new system
  create: async (data: CreateSystemInput): Promise<string | null> => {
    try {
      const response = await api.post<{system_id: string, message: string}>('/api/system', data);
      return response.data.system_id;
    } catch (error) {
      console.error('Error creating system:', error);
      return null;
    }
  },
  
  // update system information
  update: async (id: string, data: Partial<CreateSystemInput>): Promise<boolean> => {
    try {
      await api.post(`/api/system/${id}/update`, data);
      return true;
    } catch (error) {
      console.error(`Error updating system ${id}:`, error);
      return false;
    }
  },
  
  // delete a system
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/system/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete system ${id}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting system ${id}:`, error);
      throw error; // Re-throw to allow proper error handling by the caller
    }
  },
  
  // add environment to system
  addEnvironment: async (systemId: string, envId: string): Promise<boolean> => {
    try {
      await api.post(`/api/system/${systemId}/add-environment/${envId}`);
      return true;
    } catch (error) {
      console.error(`Error adding environment ${envId} to system ${systemId}:`, error);
      return false;
    }
  },
  
  // remove environment from system
  removeEnvironment: async (systemId: string, envId: string): Promise<boolean> => {
    try {
      await api.post(`/api/system/${systemId}/remove-environment/${envId}`);
      return true;
    } catch (error) {
      console.error(`Error removing environment ${envId} from system ${systemId}:`, error);
      return false;
    }
  }
};