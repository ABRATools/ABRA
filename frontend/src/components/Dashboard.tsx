import React from 'react';
import Navbar from './Navbar';
import PageLayout from './PageLayout';
import Environment from './Environment';

import { Node } from '../types/node';
import fetchNodes from '../services/getNodes';

export default function Dashboard() {
    const [nodes, setNodes] = React.useState<Node[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>('');
    React.useEffect(() => {
        fetchNodes('/get_nodes')
            .then((nodes) => {
                setNodes(nodes);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, []);
    return (
        <>
        <Navbar />
        <PageLayout>
            <>
            <h1 className='text-3xl'>Dashboard</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {nodes.map((node) => (
                    <div key={node.id} className="p-4 border rounded-md bg-neutral-content shadow-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 mx-2 my-2 flex flex-col justify-between">
                        <h2 className="text-lg font-semibold">{node.name}</h2>
                        <div className="flex justify-between mt-2">
                            <p>{node.ip}:{node.port}</p>
                            <p>{node.status}</p>
                        </div>
                        <div className='flex flex-wrap'>
                            {node.environments.map((env) => (
                                <Environment key={env.id} {...env} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            </>        
       </PageLayout>
        </>
    );
}