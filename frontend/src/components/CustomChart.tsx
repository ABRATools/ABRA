import React from "react";
import { Resource } from "../types/resource";
import fetchVMResources from "../services/getVMResources";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface RechartVMResourceProps {
    input_data: Resource[];
}

export default function RechartVMResource({ VMAPI, update_interval }: RechartVMResourceProps) {
    return (
        <>
        {/* {loadingResources && <p>Loading...</p>} */}
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={resources} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu_percent" stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false} strokeWidth={3}/>
                <Line type="monotone" dataKey="mem_percent" stroke="#82ca9d" isAnimationActive={false} strokeWidth={3}/>
                <Line type="monotone" dataKey="disk_percent" stroke="#ffc658" isAnimationActive={false} strokeWidth={3}/>
            </LineChart>
        </ResponsiveContainer>
        </>
    );
}