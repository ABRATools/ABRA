import { Environment } from './environment';

export type Node = {
    id: number;
    name: string;
    ip: string;
    os: string;
    status: string;
    uptime: string;
    cpu_percent: number;
    memory: number;
    disk: number;
    max_cpus: number;
    max_memory: number;
    max_disk: number;
    environments: Environment[];
};