import React from "react";
import { Resource } from "../types/resource";
import fetchVMResources from "../services/getVMResources";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface RechartVMResourceProps {
    VMAPI: string;
    update_interval: number;
}

export default function RechartVMResource({ VMAPI, update_interval }: RechartVMResourceProps) {
    // hold a list of resources which will be fetched from the backend, addResources will append to this list, for a list of up to 30 resources, oldest resources will be removed
    const [resources, setResources] = React.useState<Resource[]>([]);
    const addResources = (newResources: Resource[]) => {
        setResources((prevResources) => {
            const combinedResources = [...prevResources, ...newResources];
            return combinedResources.slice(Math.max(combinedResources.length - 30, 0));
        });
    }
    // const [dates, setDates] = React.useState<string[]>([]);
    // const [loadingResources, setLoadingResources] = React.useState(false);
    // const [error, setError] = React.useState('');

    React.useEffect(() => {
        const intervalId = setInterval(async () => {
          try {
            const data = await fetchVMResources(VMAPI);
            addResources(data);
          } catch (error) {
            console.error('Failed to fetch VM stats:', error);
          }
        }, update_interval * 1000); // Fetch data every update_interval seconds
      
        return () => clearInterval(intervalId); // Cleanup interval on unmount
      }, []);
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