import { useEffect, useState } from "react"
import Navbar from '../Navbar';
import ListNodeSettings from "./ListNodeSettings";
import useAuth from "../../hooks/useAuth";
import { ThemeProvider } from '../Theming/ThemeProvider';
import LoadingDisplay from '../LoadingDisplay';
import { Node } from "@/types/node";

const REFRESH_INTERVAL = 10000;

async function FetchNodes(): Promise<Node[]> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return [];
    }
    try {
      const response = await fetch('/node-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const json = await response.json();
        return json.nodes;
      } else {
        console.error('Failed to fetch nodes');
      }
    } catch (error) {
      console.error('Authorization check failed:', error);
    }
      return [];
  }

const Manager = () => {
    const [, forceUpdate] = useState(true);
    const [data, setData] = useState<Node[]>([]);
    const [loading, setLoading] = useState(true);

    

    // on mount
    useEffect(() => {
      const fetchData = async () => {
        try {
            const nodes = await FetchNodes();
            setData(nodes);
        } catch (error) {
            console.error('Failed to fetch nodes:', error);
        } finally {
            setLoading(false);
            forceUpdate((x) => !x);
        }
      }
      fetchData();
      const interval = setInterval(() => {
        fetchData();
      }, REFRESH_INTERVAL);
      return () => {
        clearInterval(interval);
      };
    }, []);

    if (loading) {
        return <LoadingDisplay />;
    }
    if (!data) {
        return <p>No data</p>;
    }

    console.log("Data: ", data);

    return (
        <ThemeProvider>
            <Navbar />
            <ListNodeSettings nodes={data}/>
        </ThemeProvider>
    );
}

export default () => {
    const { isAuthorized, loading } = useAuth(() => {
        window.location.href = '/login';
});
    if (isAuthorized) {
        console.log('Authorized');
    }
    if (loading) {
        return <LoadingDisplay />;
    }
    return <Manager />;
}