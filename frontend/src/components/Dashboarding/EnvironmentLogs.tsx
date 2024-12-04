/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentLogs.tsx
Description: Show logs for that environment. Right now just passes to NodeLogs because its the same logic
*/
import { Environment } from "@/types/environment";
import { useEffect, useState } from 'react';

export default function EnvironmentLogs( envData: Environment ) {
    const [data, setData] = useState<Environment | null>(envData);
    useEffect(() => {
        setData(envData);
    }, [envData]);
    return (
        <div className="px-[10px]">
            <h2 className="text-[#007bff] text-2xl">Total Log for {data?.name}</h2>
            <p>This is where the total logs will be displayed.</p>
            {/* Replace this with actual log information */}
        </div>
    );
}