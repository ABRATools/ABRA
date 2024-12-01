/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSelect.tsx
Description: Node Select Component (for selecting a node to focus on)
*/

// imports
import { useState } from 'react';
import NodeSubSelect from "./NodeSubSelect";

export default function NodeSelect() {

    const test_data = {
        nodes: [
            {
                id: "node1",
                os: "TempleOS",
                date_created: "10/10/10",
                resources: {
                    "cpu_percent": 5,
                    "memory_percent": 20,
                    "latency": 50
                },
                environments: [
                    {
                        id: "env1",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    },
                    {
                        id: "env2",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    },
                    {
                        id: "env3",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    }
                ]
            },
            {
                id: "node2",
                os: "TempleOS",
                date_created: "10/10/10",
                resources: {
                    "cpu_percent": 5,
                    "memory_percent": 20,
                    "latency": 50
                },
                environments: [
                    {
                        id: "env4",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    },
                    {
                        id: "env5",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    },
                    {
                        id: "env6",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    }
                ]
            },
            {
                id: "node3",
                os: "TempleOS",
                date_created: "10/10/10",
                resources: {
                    "cpu_percent": 5,
                    "memory_percent": 20,
                    "latency": 50
                },
                environments: [
                    {
                        id: "env7",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    },
                    {
                        id: "env8",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    },
                    {
                        id: "env9",
                        os: "Amazon Linux 2",
                        date_created: "10/11/10",
                        resources: {
                            "cpu_percent": 2,
                            "memory_percent": 15,
                            "latenct": 10
                        }
                    }
                ]
            }
        ]
    };

    const [selectedNode, setSelectedNode] = useState(test_data.nodes[0]);

    return (
        <>
        <div className='flex flex-row w-full h-full min-h-[70vh] shadow-xl'>
            {/* Left Side - Node Buttons */}
            <div className="max-w-[5vw] min-w-min border-[#ccc] border-r-[1px] h-full box-border min-h-[70vh]">
                {test_data.nodes.map((node) => (
                    <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className='hover:bg-blue-500 hover:cursor-pointer border border-foreground text-lg py-[40x] px-[20px] lg:px-[40px] color-foreground'
                        style={{
                            backgroundColor: selectedNode.id === node.id ? '#007bff' : '',
                            // color: selectedNode.id === node.id ? '#fff' : '#000',
                        }}
                    >
                        {node.id}
                    </button>
                ))}
            </div>

            {/* Right Side - NodeSubSelect Component */}
            <div className="w-full h-full min-h-[70vh]">
                <NodeSubSelect nodeData={selectedNode} />
            </div>
        </div>
        </>
    );
}