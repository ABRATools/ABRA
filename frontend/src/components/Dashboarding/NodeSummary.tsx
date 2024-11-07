/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSummary.tsx
Description: Shows what summary data can be seen for a node
*/

// import { Node } from "../../types/node";
import "../../styles/dashboard.css";

export default function NodeSummary({ nodeData }) {
    return (
        <div className="summary">
            <h2>Node Summary</h2>
            <p><strong>ID:</strong> {nodeData.id}</p>
            <p><strong>OS:</strong> {nodeData.os}</p>
            <p><strong>Date Created:</strong> {nodeData.date_created}</p>

            <h3>Resources</h3>
            <ul>
                <li><strong>CPU Usage:</strong> {nodeData.resources.cpu_percent}%</li>
                <li><strong>Memory Usage:</strong> {nodeData.resources.memory_percent}%</li>
                <li><strong>Latency:</strong> {nodeData.resources.latency} ms</li>
            </ul>
        </div>
    );
}

// export default NodeSummary;