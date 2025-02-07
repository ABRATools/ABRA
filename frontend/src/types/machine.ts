export type Status = 'healthy' | 'warning' | 'error';
export type EnvironmentStatus = 'running' | 'stopped' | 'error';

export interface System {
  id: string;
  name: string;
  description?: string;
  status: Status;
  node_count: number; 
  total_containers: number;
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  system_id: string;
  name: string;
  description?: string;
  status: Status;
  resources: {
    cpu: {
      allocated: number;
      used: number;
      available: number;
    };
    memory: {
      allocated: number;
      used: number;
      available: number;
    };
    storage: {
      allocated: number;
      used: number;
      available: number;
    };
  };
  environment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: string;
  node_id: string;
  system_id: string;
  name: string;
  description?: string;
  status: EnvironmentStatus;
  image: string;
  resources: {
    cpu: number;
    memory: number;
  };
  network: string;
  ports: Array<{
    host: number;
    container: number;
    protocol: 'tcp' | 'udp';
  }>;
  volumes: Array<{
    host: string;
    container: string;
    mode: 'rw' | 'ro';
  }>;
  environment_variables: Record<string, string>;
  created_at: string;
  updated_at: string;
}