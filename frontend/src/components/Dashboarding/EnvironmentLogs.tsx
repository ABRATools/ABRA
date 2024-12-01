/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentLogs.tsx
Description: Show logs for that environment. Right now just passes to NodeLogs because its the same logic
*/
import { Environment } from "@/types/environment";

export default function EnvironmentLogs( envData: Environment ) {
    return (
        <div className="px-[10px]">
            <h2 className="text-[#007bff] text-2xl">Total Log for {envData.name}</h2>
            <p>This is where the total logs will be displayed.</p>
            {/* Replace this with actual log information */}
        </div>
    );
}