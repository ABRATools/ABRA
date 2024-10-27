import { Node } from "../types/node";
// import axios from 'axios';
const fetchNodes = async (API_ENDPOINT: string) => {
// not using axios for now due to JSON parsing issues
    try {
        const response = await fetch(API_ENDPOINT);
        if (response.ok) {
            const data = await response.json();
            const nodes: Node[] = JSON.parse(data);
            return nodes;
        } else {
            console.log('An error occurred while fetching nodes');
            throw new Error('An error occurred while fetching nodes');
        }
    } catch (error) {
        console.log('An error occurred while connecting to the server');
        throw new Error('An error occurred while connecting to the server');
    }
// axios code
    // try {
    //     const response = await axios.get(VMAPI);
    //     if (response.status === 200) {
    //         const resource: Resource = response.data;
    //         console.log(resource)
    //         return [resource];
    //     } else {
    //         console.log('An error occurred while fetching VM stats');
    //         throw new Error('An error occurred while fetching VM stats');
    //     }
    // } catch (error) {
    //     console.error('An error occurred while connecting to the server', error);
    //     throw new Error('An error occurred while connecting to the server');
    // }
    
};

export default fetchNodes;