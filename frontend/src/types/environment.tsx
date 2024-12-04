export type Environment = {
    id: number;
    machine_name: string;
    description: string;
    os: string;
    ip: string;
    status: string;
    max_cpus: number;
    max_memory: number;
    max_disk: number;
    current_cpu_percent: number;
    current_memory_percent: number;
    current_disk_percent: number;
    node_id: number;
};