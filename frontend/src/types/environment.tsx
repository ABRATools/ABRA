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
    // default value for resource_api_endpoint is /get_resources
    resource_api_endpoint ?: string;
};