import {useEffect, useState} from 'react';
import Navbar from './Navbar';
import { useAuthenticateUser } from '../hooks/useAuthenticateUser';
import { User } from '../types/user';

export default function ManageUsers() {
    useAuthenticateUser();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try{
                const response = await fetch('/get_users');
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    // map the data to the User type
                    const outerdata = JSON.parse(data);
                    console.log(outerdata);
                    const userJSONstr = outerdata.users[0];
                    console.log(userJSONstr);
                    const UserArray: User[] = JSON.parse(userJSONstr);
                    console.log(UserArray);
                    setUsers(UserArray);
                } else {
                    console.error('Failed to fetch users');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="flex flex-col w-full">
                <div className="flex flex-row w-full justify-between px-[10px] lg:px-[60px] min-w-max py-[25px]">
                    <div>
                        <h1 className="text-3xl font-semibold align-middle">Manage Users</h1>
                    </div>
                    <div>
                        <input className="border border-gray-300 p-2 rounded-lg rounded-r-none" placeholder="Search users..." />
                        <button className="bg-abra-accent text-white p-2 rounded-lg rounded-l-none">Search</button>
                        <button className="bg-abra-accent text-white p-2 rounded-lg ml-[5px]">Add User</button>
                    </div>
                </div>
                <div className="flex flex-col px-[10px] lg:px-[60px]">
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="border bg-zinc-500 border-gray-300">Username</th>
                                <th className="border bg-zinc-500 border-gray-300">Email</th>
                                <th className="border bg-zinc-500 border-gray-300">Role</th>
                                <th className="border bg-zinc-500 border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.user_id}>
                                    <td className="border border-gray-300">{user.username}</td>
                                    <td className="border border-gray-300">{user.email}</td>
                                    <td className="border border-gray-300">{user.groups?.join(', ')}</td>
                                    <td className="border border-gray-300">
                                        <button className="bg-abra-accent text-white p-2 rounded-lg">Edit</button>
                                        <button className="bg-red-500 text-white p-2 rounded-lg">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}