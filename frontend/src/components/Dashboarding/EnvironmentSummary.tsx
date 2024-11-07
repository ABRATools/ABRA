/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSummary.tsx
Description: same as node summary but with env in the title jaja
*/

export default function EnvironmentSummary({ envData }) {

    return (
        <>
            <div>
                <h2>Env Summary</h2>
                <p><strong>ID:</strong> {envData.id}</p>
                <p><strong>OS:</strong> {envData.os}</p>
                <p><strong>Date Created:</strong> {envData.date_created}</p>

                <h3>Resources</h3>
                <ul>
                    <li><strong>CPU Usage:</strong> {envData.resources.cpu_percent}%</li>
                    <li><strong>Memory Usage:</strong> {envData.resources.memory_percent}%</li>
                    <li><strong>Latency:</strong> {envData.resources.latency} ms</li>
                </ul>
            </div>
        </>
    );
}