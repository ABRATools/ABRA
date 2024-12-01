/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentSummary.tsx
Description: same as node summary but with env in the title jaja
*/
import { Environment } from "@/types/environment";
import { Progress } from "@/components/ui/progress";

export default function EnvironmentSummary( envData: Environment ) {
    return (
        <div className="px-[10px]">
            <h2 className="text-[#007bff] border-b-[2px] border-[#0056b3] text-2xl">Environment Summary</h2>
            <p><strong>Name:</strong> {envData.name}</p>
            <p><strong>OS:</strong> {envData.os}</p>
            <p><strong>IP:</strong> {envData.ip}</p>
            <p><strong>Uptime:</strong> {envData.uptime}</p>
            <p><strong>Status:</strong> {envData.status}</p>

            <h3 className="text-[#007bff] text-xl">Resources</h3>
            <div className="w-full flex flex-col gap-y-[10px]">
                <div>
                    <strong className="mb-2">CPU Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {envData.cpu_percent}%
                        </p>
                        <Progress className="self-center" value={envData.cpu_percent} />
                        <p className="self-center min-w-max">
                            {envData.max_cpus} CPUs
                        </p>
                    </div>
                </div>
                <div>
                    <strong className="mb-2">Memory Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {envData.memory} GB
                        </p>
                        <Progress className="self-center" value={(envData.memory / envData.max_memory) * 100} />
                        <p className="self-center min-w-max">
                            {envData.max_memory} GB
                        </p>
                    </div>
                </div>
                <div>
                    <strong className="mb-2">Disk Usage:</strong>
                    <div className="flex flex-row gap-x-4">
                        <p className="self-center min-w-max">
                            {envData.disk} GB
                        </p>
                        <Progress className="self-center" value={(envData.disk / envData.max_disk) * 100} />
                        <p className="self-center min-w-max">
                            {envData.max_disk} GB
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}