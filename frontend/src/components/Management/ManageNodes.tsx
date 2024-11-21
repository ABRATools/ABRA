import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import NodeSettings from './NodeSettings';
import { useAuthenticateUser } from '../../hooks/useAuthenticateUser';
import { Node } from '../../types/node';

// get user possible user settings such as changing password, email, updating 2FA, etc.
export default function Settings() {
    useAuthenticateUser();
    const [nodes, setNodes] = useState<Node[] | null>(null);


    // const [displayUpdateEmail, setDisplayUpdateEmail] = useState<boolean>(false);
    // const [displayUpdateGroups, setDisplayUpdateGroups] = useState<boolean>(false);
    // const [displayChangePassword, setDisplayChangePassword] = useState<boolean>(false);

    useEffect(() => {
        const fetchNodeSettings = async () => {
            try {
                const response = await fetch('/get_nodes_and_environments');
                if (response.ok) {
                    const data = await response.json();
                    const nodeData: Node[] = data['nodes'];
                    setNodes(nodeData);
                } else {
                    console.error('Failed to fetch user settings');
                }
            } catch (error) {
                console.error('Error fetching user settings:', error);
            }
        }
        fetchNodeSettings();
    }, []);


    // pretty much the same as ManageUsers.tsx, but add a thing for adding nodes
    return (
        <>
        <div>
            <Navbar />
            <div>
                
            </div>
            <div className="flex flex-col w-full px-[10px] lg:px-[10vw] gap-y-[20px]">
                <div className="flex flex-row w-full justify-between min-w-max py-[25px]">
                    <div>
                        <h1 className="text-3xl font-semibold align-middle">Manage Node Attributes</h1>
                    </div>
                </div>
                {nodes?.map((node) => (
                    <NodeSettings key={node.id} node={node} />
                ))}
            </div>
        </div>
        
        </>
        
    );
}