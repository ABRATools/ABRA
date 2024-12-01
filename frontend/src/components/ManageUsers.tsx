import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import useAuth from '../hooks/useAuth';
import { User } from '../types/user';
import UserSettings from './UserSettings';
import { ThemeProvider } from './Theming/ThemeProvider';

export default function ManageUsers() {
    const { isAuthorized, loading } = useAuth(() => {
		window.location.href = '/login';
	});

	if (isAuthorized) {
		console.log('Authorized');
	}
	if (loading) {
		return <div>Loading...</div>;
	}
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RenderManageUsers />
        </ThemeProvider>
    );
}

const RenderManageUsers = () => {
    const [users, setUsers] = useState<User[] | null>(null);
    const token = sessionStorage.getItem('token');
    if (!token) {
        return <div>Unauthorized</div>;
    }
    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const response = await fetch('/get_users', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const userData: User[] = data['users'];
                    setUsers(userData);
                } else {
                    console.error('Failed to fetch user settings');
                }
            } catch (error) {
                console.error('Error fetching user settings:', error);
            }
        };
        fetchUserSettings();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="flex flex-col w-full px-[10px] lg:px-[10vw] gap-y-[20px]">
                <div className="flex flex-row w-full justify-between min-w-max py-[25px]">
                    <div>
                        <h1 className="text-3xl font-semibold align-middle">Manage User Attributes</h1>
                    </div>
                </div>
                {users?.map((user) => (
                    <UserSettings key={user.username} user={user} />
                ))}
            </div>
        </div>
    );
}
