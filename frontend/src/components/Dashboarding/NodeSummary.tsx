/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSummary.tsx
Description: Shows what summary data can be seen for a node
*/
import EnvironmentTable from "@/components/EnvTable/DisplayTable";
import { Node } from "@/types/node";
import { Progress } from "@/components/ui/progress";

export default function NodeSummary( nodeData: Node ) {
    return (
        <>
        <div className="p-[10px] rounded-[8px]">
            <h2 className="text-[#007bff] text-2xl">Node Summary</h2>
            <p><strong>Name:</strong> {nodeData.name}</p>
            <p><strong>OS:</strong> {nodeData.os}</p>
            <p><strong>IP:</strong> {nodeData.ip}</p>
            <p><strong>Uptime:</strong> {nodeData.uptime}</p>
            <p><strong>Status:</strong> {nodeData.status}</p>

            <h3 className="text-[#007bff] text-xl">Resources</h3>
            <div className="w-full flex flex-col gap-y-[10px]">
                <div>
                    <strong className="mb-2">CPU Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {nodeData.cpu_percent}%
                        </p>
                        <Progress className="self-center" value={nodeData.cpu_percent} />
                        <p className="self-center min-w-max">
                            {nodeData.max_cpus} CPUs
                        </p>
                    </div>
                </div>
                <div>
                    <strong className="mb-2">Memory Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {nodeData.memory} GB
                        </p>
                        <Progress className="self-center" value={(nodeData.memory / nodeData.max_memory) * 100} />
                        <p className="self-center min-w-max">
                            {nodeData.max_memory} GB
                        </p>
                    </div>
                </div>
                <div>
                    <strong className="mb-2">Disk Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {nodeData.disk} GB
                        </p>
                        <Progress className="self-center" value={(nodeData.disk / nodeData.max_disk) * 100} />
                        <p className="self-center min-w-max">
                            {nodeData.max_disk} GB
                        </p>
                    </div>
                </div>
            </div>
            <h3 className="text-[#007bff] text-xl">Environment Summary</h3>
        </div>
        <EnvironmentTable {...nodeData.environments} />
        </>
    );
}

// export default NodeSummary;