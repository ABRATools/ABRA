import api from './api';

export interface ContainerCreateParams {
  target_ip: string;
  name: string;
  image: string;
  ip?: string;
  ebpf_modules?: string[];
}

export interface ContainerDeleteParams {
  env_id: string;
  env_name: string;
  target_ip: string;
}

export interface ContainerActionParams {
  env_id: string;
  target_ip: string;
}

export const containersService = {
  // Get eBPF module names from the backend
  async getEbpfModuleNames() {
    try {
      const response = await api.get('/ebpf/get_ebpf_module_names');
      // Make sure we handle both cases where module_names might be undefined or not an array
      if (!response || !response.module_names) return [];
      if (Array.isArray(response.module_names)) return response.module_names;
      return [];
    } catch (error) {
      console.error('Error fetching eBPF module names:', error);
      throw error;
    }
  },

  // List container images available on a node
  async listImages(targetIp: string) {
    try {
      const response = await api.post('/api/containers/list_images', {
        target_ip: targetIp
      });
      
      // Try to parse the images JSON safely
      if (!response || !response.images) return [];
      
      try {
        const parsedImages = JSON.parse(response.images);
        if (Array.isArray(parsedImages)) return parsedImages;
        return [];
      } catch (parseError) {
        console.error('Error parsing container images JSON:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching container images:', error);
      throw error;
    }
  },

  // Create a new container on a node
  async createContainer(params: ContainerCreateParams) {
    try {
      return await api.post('/api/containers/create', params);
    } catch (error) {
      console.error('Error creating container:', error);
      throw error;
    }
  },

  // Start a container on a node
  async startContainer(params: ContainerActionParams) {
    try {
      return await api.post('/api/containers/start', params);
    } catch (error) {
      console.error('Error starting container:', error);
      throw error;
    }
  },

  // Stop a container on a node
  async stopContainer(params: ContainerActionParams) {
    try {
      return await api.post('/api/containers/stop', params);
    } catch (error) {
      console.error('Error stopping container:', error);
      throw error;
    }
  },

  // Delete a container from a node
  async deleteContainer(params: ContainerDeleteParams) {
    try {
      return await api.post('/api/containers/delete', params);
    } catch (error) {
      console.error('Error deleting container:', error);
      throw error;
    }
  }
};