import React from 'react';
import Navbar from './Navbar';
import PageLayout from './PageLayout';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type Resource = {
    date: string;
    cpu_percent: number;
    mem_percent: number;
    total_mem: number;
    avail_mem: number;
    disk_percent: number;
    total_disk: number;
    used_disk: number;
    free_disk: number;
};

export default function Dashboard() {
    // hold a list of resources which will be fetched from the backend, addResources will append to this list, for a list of up to 30 resources, oldest resources will be removed
    const [resources, setResources] = React.useState<Resource[]>([]);
    const addResources = (newResources: Resource[]) => {
        setResources((prevResources) => {
            const combinedResources = [...prevResources, ...newResources];
            return combinedResources.slice(Math.max(combinedResources.length - 30, 0));
        });
    }
    // const [dates, setDates] = React.useState<string[]>([]);
    const [loadingResources, setLoadingResources] = React.useState(false);
    const [error, setError] = React.useState('');
    const fetchResources = async () => {
        try {
            setLoadingResources(true);
            const response = await fetch('/get_resources');
            setLoadingResources(false);
            if (response.ok) {
                const data = await response.json();
                const resource: Resource = JSON.parse(data);
                // console.log([resource]);
                addResources([resource]);
            } else {
                setError('An error occurred while fetching dates');
            }
        } catch (error) {
            setError('An error occurred while fetching dates');
        }
    };

    React.useEffect(() => {
        const intervalId = setInterval(async () => {
          try {
            fetchResources();
          } catch (error) {
            console.error('Failed to fetch VM stats:', error);
          }
        }, 10000); // Fetch data every 10 seconds
      
        return () => clearInterval(intervalId); // Cleanup interval on unmount
      }, []);

    // React.useEffect(() => {
        // fetchResources();
    // }, []);

    return (
        <>
        <Navbar />
        <PageLayout>
            <>
            <h1 className='text-3xl'>Dashboard</h1>
            {/* {loadingResources && <p>Loading...</p>} */}
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={resources} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu_percent" stroke="#8884d8" strokeWidth={3} isAnimationActive={false}/>
                    <Line type="monotone" dataKey="mem_percent" stroke="#82ca9d" strokeWidth={3} isAnimationActive={false}/>
                    <Line type="monotone" dataKey="disk_percent" stroke="#ff7300" strokeWidth={3} isAnimationActive={false}/>
                </LineChart>
            </ResponsiveContainer>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* <button onClick={fetchResources}>
                <p> Fetch Backend Data </p>
            </button> */}
            </>
        </PageLayout>
        </>
    );
}