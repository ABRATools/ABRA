/*
Author: Anthony Silva
Date: 11/6/24
File: NodeSummary.tsx
Description: Shows what summary data can be seen for a node
*/
import EnvironmentTable from "@/components/EnvTable/DisplayTable";
import { Node } from "@/types/node";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export default function NodeSummary( nodeData: Node | null ) {
    const [data, setData] = useState<Node | null>(nodeData);
    useEffect(() => {
        setData(nodeData);
    }, [nodeData]);
    return (
        <>
        <div className="p-[10px] rounded-[8px]">
            <h2 className="text-[#007bff] text-2xl">Node Summary</h2>
            <p><strong>Name:</strong> {data?.name}</p>
            <p><strong>OS:</strong> {data?.os}</p>
            <p><strong>IP:</strong> {data?.ip}</p>
            <p><strong>Uptime:</strong> {data?.uptime}</p>
            <p><strong>Status:</strong> {data?.status}</p>

            <h3 className="text-[#007bff] text-xl">Resources</h3>
            <div className="w-full flex flex-col gap-y-[10px]">
                <div>
                    <strong className="mb-2">CPU Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {data?.cpu_percent}%
                        </p>
                        <Progress className="self-center" value={data?.cpu_percent} />
                        <p className="self-center min-w-max">
                            {data?.max_cpus} CPUs
                        </p>
                    </div>
                </div>
                <div>
                    <strong className="mb-2">Memory Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {data?.memory} GB
                        </p>
                        <Progress className="self-center" value={ data ? (data?.memory / data?.max_memory) * 100 : 0} />
                        <p className="self-center min-w-max">
                            {data?.max_memory} GB
                        </p>
                    </div>
                </div>
                <div>
                    <strong className="mb-2">Disk Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {data?.disk} GB
                        </p>
                        <Progress className="self-center" value={data ? (data.disk / data.max_disk) * 100 : 0} />
                        <p className="self-center min-w-max">
                            {data?.max_disk} GB
                        </p>
                    </div>
                </div>
            </div>
            <h3 className="text-[#007bff] text-xl">Environment Summary</h3>
        </div>
        <EnvironmentTable {...data?.environments || []} />
        </>
    );
}

// export default NodeSummary;