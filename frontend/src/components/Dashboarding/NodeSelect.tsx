/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSelect.tsx
Description: Node Select Component (for selecting a node to focus on)
*/
import { useState } from 'react';
import NodeSubSelect from "./NodeSubSelect";
import { Node } from '@/types/node';

export default function NodeSelect() {
    const test_data: Node[] = [
        {
            id: 1,
            name: 'Node 1',
            ip: '10.0.1.1',
            os: 'Linux',
            status: 'Active',
            uptime: '1d 2h 3m',
            cpu_percent: 10,
            memory_percent: 20,
            disk_percent: 30,
            max_cpus: 4,
            max_memory: 8,
            max_disk: 100,
            environments: [
                {
                    id: 1,
                    name: 'Env 1',
                    ip: '10.0.2.1',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 10,
                    memory_percent: 20,
                    disk_percent: 30,
                    max_cpus: 4,
                    max_memory: 8,
                    max_disk: 100,
                },
                {
                    id: 2,
                    name: 'Env 2',
                    ip: '10.0.2.2',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 10,
                    memory_percent: 20,
                    disk_percent: 30,
                    max_cpus: 4,
                    max_memory: 8,
                    max_disk: 100,
                },
            ],
        },
        {
            id: 2,
            name: 'Node 2',
            ip: '10.0.1.2',
            os: 'Linux',
            status: 'Active',
            uptime: '1d 2h 3m',
            cpu_percent: 10,
            memory_percent: 20,
            disk_percent: 30,
            max_cpus: 4,
            max_memory: 8,
            max_disk: 100,
            environments: [
                {
                    id: 1,
                    name: 'Env 1',
                    ip: '10.0.2.1',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 10,
                    memory_percent: 20,
                    disk_percent: 30,
                    max_cpus: 4,
                    max_memory: 8,
                    max_disk: 100,
                },
            ],
        },
        {
            id: 3,
            name: 'Node 3',
            ip: '10.0.1.3',
            os: 'Linux',
            status: 'Active',
            uptime: '1d 2h 3m',
            cpu_percent: 10,
            memory_percent: 20,
            disk_percent: 30,
            max_cpus: 4,
            max_memory: 8,
            max_disk: 100,
            environments: [
                {
                    id: 1,
                    name: 'Env 1',
                    ip: '10.0.2.1',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 10,
                    memory_percent: 20,
                    disk_percent: 30,
                    max_cpus: 4,
                    max_memory: 8,
                    max_disk: 100,
                },
                {
                    id: 2,
                    name: 'Env 2',
                    ip: '10.0.2.2',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 10,
                    memory_percent: 20,
                    disk_percent: 30,
                    max_cpus: 4,
                    max_memory: 8,
                    max_disk: 100,
                },
                {
                    id: 3,
                    name: 'Env 3',
                    ip: '10.0.2.3',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 10,
                    memory_percent: 20,
                    disk_percent: 30,
                    max_cpus: 4,
                    max_memory: 8,
                    max_disk: 100,
                },
            ],
        }
    ];
    const [selectedNode, setSelectedNode] = useState<Node>(test_data[0]);

    return (
        <>
        <div className='flex flex-row w-full h-full min-h-[70vh] shadow-xl'>
            {/* Left Side - Node Buttons */}
            <div className="max-w-[5vw] min-w-min border-[#ccc] border-r-[1px] h-full box-border min-h-[70vh]">
                {test_data.map((node) => (
                    <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className='hover:bg-blue-500 hover:cursor-pointer border border-foreground text-lg py-[40x] px-[20px] lg:px-[40px] color-foreground'
                        style={{
                            backgroundColor: selectedNode.id === node.id ? '#007bff' : '',
                        }}
                    >
                        {node.name}
                    </button>
                ))}
            </div>

            {/* Right Side - NodeSubSelect Component */}
            <div className="w-full h-full min-h-[70vh]">
                <NodeSubSelect {...selectedNode} />
            </div>
        </div>
        </>
    );
}