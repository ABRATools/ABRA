import Navbar from './Navbar';
import NodeSelect from './Dashboarding/NodeSelect';
import useAuth from '../hooks/useAuth';
import { ThemeProvider } from './Theming/ThemeProvider';
import LoadingDisplay from './LoadingDisplay';

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
            <NodeSelect />
        </ThemeProvider>
    );
}