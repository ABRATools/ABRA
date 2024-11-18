/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSummary.tsx
Description: same as node summary but with env in the title jaja
*/

export default function EnvironmentSummary({ envData }) {

    return (
        <>
            <div className="px-[10px]">
                <h2 className="text-[#007bff] border-b-[2px] border-[#0056b3] text-2xl">Environment Summary</h2>
                <p><strong>ID:</strong> {envData.id}</p>
                <p><strong>OS:</strong> {envData.os}</p>
                <p><strong>Date Created:</strong> {envData.date_created}</p>

                <h3 className="text-[#007bff] text-xl">Resources</h3>
                <ul className="list-none">
                    <li className="mb-[5px]"><strong>CPU Usage:</strong> {envData.resources.cpu_percent}%</li>
                    <li className="mb-[5px]"><strong>Memory Usage:</strong> {envData.resources.memory_percent}%</li>
                    <li className="mb-[5px]"><strong>Latency:</strong> {envData.resources.latency} ms</li>
                </ul>
            </div>
        </>
    );
}