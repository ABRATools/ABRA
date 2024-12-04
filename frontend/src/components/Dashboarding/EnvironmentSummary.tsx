/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSummary.tsx
Description: same as node summary but with env in the title jaja
*/
import { useEffect, useState } from 'react';
import { Environment } from "@/types/environment";
import { Progress } from "@/components/ui/progress";

export default function EnvironmentSummary( envData: Environment ) {
    const [data, setData] = useState<Environment | null>(envData);
    useEffect(() => {
        setData(envData);
    }, [envData]);
    return (
        <div className="px-[10px]">
            <h2 className="text-[#007bff] border-b-[2px] border-[#0056b3] text-2xl">Environment Summary</h2>
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
                        <Progress className="self-center" value={envData.cpu_percent} />
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
                        <Progress className="self-center" value={data ? (data?.memory / data?.max_memory) * 100 : 0} />
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
                        <Progress className="self-center" value={data ? (data?.disk / data?.max_disk) * 100 : 0} />
                        <p className="self-center min-w-max">
                            {data?.max_disk} GB
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}