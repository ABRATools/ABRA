/*
Author: Anthony Silva
Date: 11/17/24
File: NodeConfig.tsx
Description: Component for viewing/editing node configurations
*/
import { Node } from "@/types/node";

export default function NodeConfig( nodeData: Node ) {
    /*
    page to edit firewall rules, network settings, etc.
    */

    return (
        <>
            <div className="p-[10px] rounded-[8px]">
                <h2 className="text-[#007bff] text-2xl">Node Configuration</h2>
                <p><strong>Node Name:</strong> {nodeData.name}</p>
                <p><strong>OS:</strong> {nodeData.os}</p>
                <p><strong>IP:</strong> {nodeData.ip}</p>
                <p><strong>Status:</strong> {nodeData.status}</p>
                <p><strong>Uptime:</strong> {nodeData.uptime}</p>

                <h3 className="text-[#007bff] text-xl">Firewall Rules</h3>
                <ul>
                    <li><strong>SSH:</strong> Open 22</li>
                    <li><strong>HTTP:</strong> Closed</li>
                    <li><strong>HTTPS:</strong> Closed</li>
                </ul>

                <h3 className="text-[#007bff] text-xl">Network Settings</h3>
                <ul>
                    <li><strong>Subnet:</strong> 192.0.1.0/24</li>
                    <li><strong>Gateway:</strong> gateway</li>
                    <li><strong>DNS:</strong> 0.0.0.0</li>
                </ul>
            </div>
        </>
    )
}
