export type Status = 'healthy' | 'warning' | 'error';
export type EnvironmentStatus = 'running' | 'stopped' | 'error';

export interface System {
  id: string,
  name: string,
  description?: string,
  status: Status,
  nodeCount: number,
  totalContainers: number,
  createdAt?: Date,
  updatedAt?: Date,
  nodes: Node[],
  environments: Environment[],
  isCustom?: boolean,
  source?: 'database' | 'auto-generated' | 'local'
}

export interface Node {
  node_id: string;
  ip_address: string;
  os_name: string;
  os_version: string;
  cpu_count: number;
  mem_percent: number;
  total_memory: number;
  num_containers: number;
  environments: Environment[];
}

export interface Environment {
  env_id: string;
  image: string;
  names: string[];
  state: string;
  started_at: number;
  ports: number[];
  ip: string;
  networks: string[];
  exited: boolean;
  exit_code: number;
  exited_at: number;
  status: string;
  cpu_percentage: number;
  memory_percent: number;
  uptime: number;
}