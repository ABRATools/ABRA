/*
Author: Anthony Silva
Date: 11/17/24
File: EnvironmentConfig.tsx
Description: Component for viewing/editing node configurations
*/
import { Environment } from "@/types/environment";
import { useEffect, useState } from 'react';

export default function EnvironmentConfig( envData: Environment ) {
    const [data, setData] = useState<Environment | null>(envData);
    useEffect(() => {
        setData(envData);
    }, [envData]);
    /*
    page to edit firewall rules, network settings, etc. with buttons and sliders to change values
    */

    return (
        <>
            <div className="p-[10px] rounded-[8px]">
                <h2 className="text-[#007bff] text-2xl">Environment Configuration</h2>
                <p><strong>Node Name:</strong> {data?.name}</p>
                <p><strong>OS:</strong> {data?.os}</p>
                <p><strong>IP:</strong> {data?.ip}</p>
                <p><strong>Status:</strong> {data?.status}</p>
                <p><strong>Uptime:</strong> {data?.uptime}</p>

                <h3 className="text-[#007bff] text-2xl">Firewall Rules</h3>
                <ul>
                    <li><strong>SSH:</strong> 22 </li>
                    <li><strong>HTTP:</strong> Closed </li>
                    <li><strong>HTTPS:</strong> Closed </li>
                </ul>

                <h3 className="text-[#007bff] text-2xl">Network Settings</h3>
                <ul>
                    <li><strong>Subnet:</strong> 192.168.1.0/24</li>
                    <li><strong>DNS:</strong> 8.8.8.8</li>
                    <li><strong>Gateway:</strong> 192.168.1.1</li>
                    <li><strong>IP Address:</strong> 192.168.1.100</li>
                </ul>

            </div>
        </>
    )
}
