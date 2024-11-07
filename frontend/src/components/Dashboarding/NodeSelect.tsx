/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSelect.tsx
Description: Node Select Component (for selecting a node to focus on)
*/

// imports
import React, { useState } from 'react';
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
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            {/* Left Side - Node Buttons */}
            <div style={{ width: '30%', padding: '10px', borderRight: '1px solid #ccc' }}>
                {test_data.nodes.map((node) => (
                    <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: selectedNode.id === node.id ? '#007bff' : '#f0f0f0',
                            color: selectedNode.id === node.id ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {node.id}
                    </button>
                ))}
            </div>

            {/* Right Side - NodeSubSelect Component */}
            <div style={{ width: '70%', padding: '10px' }}>
                <NodeSubSelect nodeData={selectedNode} />
            </div>
        </div>
        </>
    );
}