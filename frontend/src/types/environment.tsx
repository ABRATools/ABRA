export type Environment = {
    name: string;
    description: string;
    total_ram: number;
    total_disk: number;
    total_cpu: number;
    total_gpu: number;
    total_bandwidth: number;
    total_cores: number;
    resource_api: string;
};