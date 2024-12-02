import { useEffect, useState } from "react"
import Navbar from './Navbar';
import NodeSelect from './Dashboarding/NodeSelect';
import useAuth from '../hooks/useAuth';
import { ThemeProvider } from './Theming/ThemeProvider';
import LoadingDisplay from './LoadingDisplay';
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

const RenderDashboard = () => {
	const [, forceUpdate] = useState(true);
	const [data, setData] = useState<Node[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
	  const fetchData = async () => {
		try {
			const nodes = await FetchNodes();
			console.log('Fetched nodes:', nodes);
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
	  return <div>Loading...</div>;
	}
	if (data.length === 0) {
	  return <div>No data</div>;
	}
	return <NodeSelect {...data} />;
  }

export default function Dashboard() {
	const { isAuthorized, loading } = useAuth(() => {
		window.location.href = '/login';
	});
	if (isAuthorized) {
		console.log('Authorized');
	}
	if (loading) {
		return <LoadingDisplay />;
	}
    return (
        <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
            <Navbar />
            <RenderDashboard />
        </ThemeProvider>
    );
}