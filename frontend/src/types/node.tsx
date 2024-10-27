import { Environment } from './environment';

export type Node = {
    id: number;
    name: string;
    ip: string;
    port: number;
    status: string;
    environments: Environment[];
};