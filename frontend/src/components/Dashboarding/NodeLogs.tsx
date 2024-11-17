/*
Author: Anthony Silva
Date: 11/6/24
File: NodeLogs.tsx
Description: Show all logs of that node
*/

export default function NodeLogs({ nodeData }) {

    return (
        <>
            <div className="px-[10px]">
                <h2 className="text-[#007bff] text-2xl">Total Log for {nodeData.id}</h2>
                <p>This is where the total logs will be displayed.</p>
                {/* Replace this with actual log information */}
            </div>
        </>
    );
}