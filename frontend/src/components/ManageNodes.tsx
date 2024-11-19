import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuthenticateUser } from '../hooks/useAuthenticateUser';
import { User } from '../types/user';

// get user possible user settings such as changing password, email, updating 2FA, etc.
export default function Settings() {
    useAuthenticateUser();
    const [users, setUsers] = useState<User[] | null>(null);
    const [displayUpdateEmail, setDisplayUpdateEmail] = useState<boolean>(false);
    const [displayUpdateGroups, setDisplayUpdateGroups] = useState<boolean>(false);
    const [displayChangePassword, setDisplayChangePassword] = useState<boolean>(false);

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
        }
        fetchUserSettings();
    }, []);

    // const handleUpdateSettings = async () => {
    //     try {
    //         const response = await fetch('/update_user_settings', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 email,
    //                 password,
    //                 confirmPassword
    //             })
    //         });
    //         if (response.ok) {
    //             alert('Settings updated successfully');
    //         } else {
    //             alert('Failed to update settings');
    //         }
    //     } catch (error) {
    //         console.error('Error updating settings:', error);
    //     }
    // }

    return (
        <div>
            <Navbar />
            <div className="flex flex-col w-full px-[10px] lg:px-[10vw] gap-y-[20px]">
                <div className="flex flex-row w-full justify-between min-w-max py-[25px]">
                    <div>
                        <h1 className="text-3xl font-semibold align-middle">Manage User Attributes</h1>
                    </div>
                </div>
                {users?.map((user, index) => (
                    <div className='flex flex-col gap-y-[10px] px-[10px] lg:px-[10vw]'>
                        <h2 className='text-2xl font-bold'>Current User Settings for user: {user?.username || "ERR"}</h2>
                        <div className="flex flex-col w-full min-w-max py-[25px] rounded-md border-2 border-[#ccc] gap-y-[10px]">
                            <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                                <div>
                                    <h3 className="text-xl font-semibold self-center align-middle">Email: {user?.email || "Not Set"}</h3>
                                </div>
                                <div>
                                    <button className="bg-abra-accent text-white p-2 rounded-lg">Update</button>
                                </div>
                            </div>
                            <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                                <div>
                                    <h3 className="text-xl font-semibold self-center align-middle">Groups:</h3>
                                </div>
                                <div>
                                    <ul className='flex flex-row'>
                                        {/* if groups is not null and the amount of groups is greater than 0 */}
                                        { user?.groups?.length && user?.groups?.length > 0 ? user.groups.map((group, index) => (
                                            <li key={index}>
                                                <div className='p-2 bg-fuchsia-400 text-white rounded-lg text-center'>
                                                    {group}
                                                </div>
                                            </li>
                                        )): <li className='self-center'>No groups found</li>
                                        }
                                            <li>
                                                <button className="bg-abra-accent text-white p-2 rounded-lg ml-[5px]">+</button>
                                            </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                                <div className='flex flex-row gap-x-[10px]'>
                                    <h3 className="text-xl font-semibold align-middle items-center">Last Password Change Date:</h3>
                                    {/* if equals epoch time, never updated */}
                                    <div>
                                        <p className='self-center'>{user.passwordChangeDate === "1970-01-01 00:00:00" ? "Never updated" : user.passwordChangeDate}</p>
                                    </div>
                                </div>
                                <div>
                                    <button className="bg-abra-accent text-white p-2 rounded-lg">Change Password</button>
                                </div>
                            </div>
                            <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                                <div>
                                    <h3 className="text-xl font-semibold self-center align-middle">2FA Confirmed: {user.is_totp_confirmed ? "Yes" : "No"}</h3>
                                </div>
                                <div>
                                    <button className="bg-abra-accent text-white p-2 rounded-lg">Update 2FA</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}