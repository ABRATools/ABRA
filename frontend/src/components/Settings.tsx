import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuthenticateUser } from '../hooks/useAuthenticateUser';
import { User } from '../types/user';

// get user possible user settings such as changing password, email, updating 2FA, etc.
export default function Settings() {
    useAuthenticateUser();
    const [email, setEmail] = useState<string>("");
    const [groups, setGroups] = useState<string[]>([]);
    const [passwordChangeDate, setPasswordChangeDate] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const response = await fetch('/get_user_settings');
                if (response.ok) {
                    const data: User = await response.json();
                    console.log(data);
                    // set the user settings if they exist
                    setEmail(data.email || "");
                    setGroups(data.groups || []);
                    setPasswordChangeDate(data.passwordChangeDate);

                } else {
                    console.error('Failed to fetch user settings');
                }
            } catch (error) {
                console.error('Error fetching user settings:', error);
            }
        }
        fetchUserSettings();
    }, []);

    const handleUpdateSettings = async () => {
        try {
            const response = await fetch('/update_user_settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    confirmPassword
                })
            });
            if (response.ok) {
                alert('Settings updated successfully');
            } else {
                alert('Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    }

    return (
        <div>
            <Navbar />
            <div className="flex flex-col w-full">
                <div className="flex flex-row w-full justify-between px-[10px] lg:px-[60px] min-w-max py-[25px]">
                    <div>
                        <h1 className="text-3xl font-semibold align-middle">Settings</h1>
                    </div>
                    <div>
                        <button className="bg-abra-accent text-white p-2 rounded-lg">Update</button>
                    </div>
                </div>
                <div className="flex flex-col px-[10px] lg:px-[60px]">
                    <div className="flex flex-col gap-y-[20px]">
                        <div className="flex flex-col gap-y-[10px]">
                            <label>Email</label>
                            <input className="border border-gray-300 p-2 rounded-lg" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-y-[10px]">
                            <label>Password</label>
                            <input type="password" className="border border-gray-300 p-2 rounded-lg" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-y-[10px]">
                            <label>Confirm Password</label>
                            <input type="password" className="border border-gray-300 p-2 rounded-lg" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}