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
        <div className="p-[10px] rounded-[8px]">
            <h2 className="text-[#007bff] text-2xl">Node Summary</h2>
            <p><strong>ID:</strong> {nodeData.id}</p>
            <p><strong>OS:</strong> {nodeData.os}</p>
        </div>
    );
}

// export default NodeSummary;