/*
Author: Anthony Silva
Date: 11/6/24
File: EnvironmentLogs.tsx
Description: Show logs for that environment. Right now just passes to NodeLogs because its the same logic
*/

import NodeLogs from "./NodeLogs";

export default function EnvironmentLogs({ envData }) {

    return (
        <>
        <NodeLogs nodeData={envData} />
        </>
    );
}