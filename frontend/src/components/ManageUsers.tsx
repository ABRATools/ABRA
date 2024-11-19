import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuthenticateUser } from '../hooks/useAuthenticateUser';
import { User } from '../types/user';
import UserSettings from './UserSettings';

export default function ManageUsers() {
    useAuthenticateUser();
    const [users, setUsers] = useState<User[] | null>(null);

    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const response = await fetch('/get_users');
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
