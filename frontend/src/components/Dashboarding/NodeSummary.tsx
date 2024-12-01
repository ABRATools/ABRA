/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSummary.tsx
Description: Shows what summary data can be seen for a node
*/
import { Node } from "@/types/node";

export default function NodeSummary( nodeData: Node ) {
    return (
        <div className="p-[10px] rounded-[8px]">
            <h2 className="text-[#007bff] text-2xl">Node Summary</h2>
            <p><strong>Name:</strong> {nodeData.name}</p>
            <p><strong>OS:</strong> {nodeData.os}</p>
            <p><strong>IP:</strong> {nodeData.ip}</p>
            <p><strong>Uptime:</strong> {nodeData.uptime}</p>
            <p><strong>Status:</strong> {nodeData.status}</p>

            <h3 className="text-[#007bff] text-xl">Resources</h3>
            <ul>
                <li><strong>CPU Usage:</strong> {nodeData.cpu_percent}%</li>
                <li><strong>Memory Usage:</strong> {nodeData.memory_percent}%</li>
                <li><strong>Disk Usage:</strong> {nodeData.disk_percent}%</li>
                <li><strong>Max CPUs:</strong> {nodeData.max_cpus}</li>
                <li><strong>Max Memory:</strong> {nodeData.max_memory} GB</li>
                <li><strong>Max Disk:</strong> {nodeData.max_disk} GB</li>
            </ul>
        </div>
    );
}

// export default NodeSummary;