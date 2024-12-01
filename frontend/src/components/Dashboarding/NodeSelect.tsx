/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSelect.tsx
Description: Node Select Component (for selecting a node to focus on)
*/
import { useState } from 'react';
import NodeSubSelect from "./NodeSubSelect";
import { Node } from '@/types/node';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from '../ui/button';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"

export default function NodeSelect() {
    const test_data: Node[] = [
        {
            id: 1,
            name: 'Node 1',
            ip: '10.0.1.1',
            os: 'Linux',
            status: 'Active',
            uptime: '1d 2h 3m',
            cpu_percent: 40,
            memory: 2,
            disk: 300,
            max_cpus: 4,
            max_memory: 8,
            max_disk: 1000,
            environments: [
                {
                    id: 1,
                    name: 'Env 1',
                    ip: '10.0.2.1',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 19,
                    memory: 20,
                    disk: 10,
                    max_cpus: 4,
                    max_memory: 32,
                    max_disk: 100,
                },
                {
                    id: 2,
                    name: 'Env 2',
                    ip: '10.0.2.2',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 22,
                    memory: 14,
                    disk: 88,
                    max_cpus: 4,
                    max_memory: 16,
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
            cpu_percent: 30,
            memory: 7.7,
            disk: 30,
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
                    memory: 2.1,
                    disk: 30,
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
            cpu_percent: 70,
            memory: 20,
            disk: 300,
            max_cpus: 4,
            max_memory: 32,
            max_disk: 2000,
            environments: [
                {
                    id: 1,
                    name: 'Env 1',
                    ip: '10.0.2.1',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 60,
                    memory: 8.3,
                    disk: 95.3,
                    max_cpus: 4,
                    max_memory: 16,
                    max_disk: 100,
                },
                {
                    id: 2,
                    name: 'Env 2',
                    ip: '10.0.2.2',
                    os: 'Linux',
                    status: 'Active',
                    uptime: '1d 2h 3m',
                    cpu_percent: 78,
                    memory: 3.2,
                    disk: 55.6,
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
                    cpu_percent: 40,
                    memory: 4.8,
                    disk: 30.4,
                    max_cpus: 4,
                    max_memory: 8,
                    max_disk: 100,
                },
            ],
        }
    ];
    const [selectedNode, setSelectedNode] = useState<Node>(test_data[0]);

    return (
        <div className='flex flex-row w-full h-full min-h-[70vh] shadow-xl'>
            {/* Left Side - Node Buttons */}
            <ResizablePanelGroup direction="horizontal" className="max-w-full">
                <ResizablePanel defaultSize={10} className="border-[#ccc] box-border border-r-[2px] min-h-144">
                    <div className="h-full min-h-[70vh]">
                        <ScrollArea className="h-full min-w-fit w-full">
                            {test_data.map((node) => (
                                <div className='flex flex-col w-full h-full'>
                                    <Button
                                        variant={selectedNode.id === node.id ? 'default' : 'ghost'}
                                        key={node.id}
                                        onClick={() => setSelectedNode(node)}
                                        className='hover:bg-blue-500 hover:cursor-pointer rounded-none text-lg px-[20px]'
                                        style={{
                                            backgroundColor: selectedNode.id === node.id ? '#007bff' : '',
                                        }}
                                    >
                                        {node.name}
                                    </Button>
                                    <Separator/>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle/>

                <ResizablePanel defaultSize={90}>
                    {/* Right Side - NodeSubSelect Component */}
                    <div className="w-full h-full min-h-[70vh]">
                        <NodeSubSelect {...selectedNode} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}