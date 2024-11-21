export type Environment = {
    id: number;
    machine_name: string;
    description: string;
    os: string;
    total_cpu: number;
    total_memory: number;
    total_disk: number;
    
    ip: string;
    port: number;
    status: string;
    node_id: number;
};