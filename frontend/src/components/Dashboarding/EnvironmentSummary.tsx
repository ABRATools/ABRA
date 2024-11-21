/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSummary.tsx
Description: same as node summary but with env in the title jaja
*/

import { Environment } from "../../types/environment";

export default function EnvironmentSummary({ envData } : { envData: Environment}) {

    return (
        <>
            <div className="px-[10px]">
                <h2 className="text-[#007bff] border-b-[2px] border-[#0056b3] text-2xl">Environment Summary</h2>
                <p><strong>ID:</strong> {envData.id}</p>
                <p><strong>OS:</strong> {envData.os}</p>

                <h3 className="text-[#007bff] text-xl">Resources</h3>
                <ul className="list-none">
                    <li className="mb-[5px]"><strong>CPU Usage:</strong> {envData.cpu_percent}%</li>
                    <li className="mb-[5px]"><strong>Memory Usage:</strong> {envData.memory_percent}%</li>
                </ul>
            </div>
        </>
    );
}