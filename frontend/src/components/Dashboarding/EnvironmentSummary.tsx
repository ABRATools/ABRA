/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSummary.tsx
Description: same as node summary but with env in the title jaja
*/
import { Environment } from "@/types/environment";

export default function EnvironmentSummary( envData: Environment ) {
    return (
        <div className="px-[10px]">
            <h2 className="text-[#007bff] border-b-[2px] border-[#0056b3] text-2xl">Environment Summary</h2>
            <p><strong>Name:</strong> {envData.name}</p>
            <p><strong>OS:</strong> {envData.os}</p>
            <p><strong>IP:</strong> {envData.ip}</p>
            <p><strong>Uptime:</strong> {envData.uptime}</p>
            <p><strong>Status:</strong> {envData.status}</p>


            <h3 className="text-[#007bff] text-xl">Resources</h3>
            <ul className="list-none">
                <li className="mb-[5px]"><strong>CPU Usage:</strong> {envData.cpu_percent}%</li>
                <li className="mb-[5px]"><strong>Memory Usage:</strong> {envData.memory_percent}%</li>
                <li className="mb-[5px]"><strong>Disk Usage:</strong> {envData.disk_percent}%</li>
                <li className="mb-[5px]"><strong>Max CPUs:</strong> {envData.max_cpus}</li>
                <li className="mb-[5px]"><strong>Max Memory:</strong> {envData.max_memory} GB</li>
                <li className="mb-[5px]"><strong>Max Disk:</strong> {envData.max_disk} GB</li>
            </ul>
        </div>
    );
}