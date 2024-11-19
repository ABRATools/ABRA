import { useState } from 'react';
import { User } from '../types/user';

function UserSettings({ user }: { user: User }) {
    const [displayUpdateEmail, setDisplayUpdateEmail] = useState(false);
    const [displayUpdateGroups, setDisplayUpdateGroups] = useState(false);
    const [displayChangePassword, setDisplayChangePassword] = useState(false);
    const [displayUpdate2FA, setDisplayUpdate2FA] = useState(false);

    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
    const [passwordResetError, setPasswordResetError] = useState('');

    const [passwordResetForm, setPasswordResetForm] = useState({
        password: "",
        confirmPassword: "",
    });

    const toggleUpdateEmail = () => {
        setDisplayUpdateEmail(!displayUpdateEmail);
    };

    const closeUpdateEmail = () => {
        setDisplayUpdateEmail(false);
    };

    const toggleUpdateGroups = () => {
        setDisplayUpdateGroups(!displayUpdateGroups);
    };

    const toggleChangePassword = () => {
        setDisplayChangePassword(!displayChangePassword);
    };

    const closeUpdatePassword = () => {
        setDisplayChangePassword(false);
    };

    const toggleUpdate2FA = () => {
        setDisplayUpdate2FA(!displayUpdate2FA);
    };

    const closeUpdate2FA = () => {
        setDisplayUpdate2FA(false);
    };

    const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordResetForm.password.length < 8 || passwordResetForm.password !== passwordResetForm.confirmPassword) {
            return;
        }
        try {
            console.log(passwordResetForm);
            const response = await fetch('/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user.username, password: passwordResetForm.password, confirmPassword: passwordResetForm.confirmPassword }),
            });

            if (response.ok) {
                setPasswordResetError('');
                setPasswordResetSuccess(true);
            } else {
                const data = await response.json();
                setPasswordResetError(data.message);
            }
        } catch (error) {
            setPasswordResetError('Something went wrong while changing password');
        }
    }

    return (
        <div className='flex flex-col gap-y-[10px] px-[10px] lg:px-[10vw]'>
            <h2 className='text-2xl font-bold'>Current User Settings for user: {user.username || "ERR"}</h2>
            <div className="flex flex-col w-full min-w-max py-[25px] rounded-md border-2 border-[#ccc] gap-y-[10px]">
                <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                    <div>
                        <h3 className="text-xl font-semibold self-center align-middle">Email: {user.email || "Not Set"}</h3>
                    </div>
                    <div>
                        {!displayUpdateEmail && <button onClick={toggleUpdateEmail} className="bg-abra-accent text-white p-2 rounded-lg">Update</button>}
                    </div>
                </div>
                {displayUpdateEmail && (
                    <div className="mt-2 px-[10px]">
                        {/* Form to update email */}
                        <h3>Update Email for {user.username}</h3>
                        <input type="email" placeholder="New email" className="border p-2 w-full" />
                        <div className='w-full flex flex-row justify-between'>
                            <button className="bg-abra-accent text-white p-2 rounded-lg mt-2">Submit</button>
                            <button onClick={closeUpdateEmail} className="bg-abra-accent text-white p-2 rounded-lg mt-2">Close</button>
                        </div>
                    </div>
                )}

                <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                    <div>
                        <h3 className="text-xl font-semibold self-center align-middle">Groups:</h3>
                    </div>
                    <div>
                        <ul className='flex flex-row'>
                            {user.groups?.length ? user.groups.map((group, index) => (
                                <li key={index} className='p-2 bg-fuchsia-400 text-white rounded-lg text-center mr-2'>
                                    {group}
                                </li>
                            )) : <li className='self-center'>No groups found</li>}
                            <li>
                                <button onClick={toggleUpdateGroups} className="bg-abra-accent text-white p-2 rounded-lg ml-[5px]">+</button>
                            </li>
                        </ul>
                    </div>
                </div>
                {displayUpdateGroups && (
                    <div className="mt-2 px-[10px]">
                        {/* Form to update groups */}
                        <h3>Update Groups for {user.username}</h3>
                        {/* Add group selection or modification logic */}
                        <button className="bg-abra-accent text-white p-2 rounded-lg mt-2">Submit</button>
                    </div>
                )}

                <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                    <div className='flex flex-row gap-x-[10px]'>
                        <h3 className="text-xl font-semibold align-middle items-center">Last Password Change Date:</h3>
                        <div>
                            <p className='self-center'>{user.passwordChangeDate === "1970-01-01 00:00:00" ? "Never updated" : user.passwordChangeDate}</p>
                        </div>
                    </div>
                    <div>
                        {!displayChangePassword && <button onClick={toggleChangePassword} className="bg-abra-accent text-white p-2 rounded-lg">Change Password</button>}
                    </div>
                </div>
                {displayChangePassword && (
                    <div className="mt-2 px-[10px]">
                        {/* Form to change password */}
                        <form onSubmit={handlePasswordChangeSubmit}>
                            <h3>Change Password for {user.username}</h3>
                                <input  value={passwordResetForm.password}
                                        type="password"
                                        placeholder="New password"
                                        required={true}
                                        className="border p-2 w-full"
                                        onChange={(e) => setPasswordResetForm({ ...passwordResetForm, password: e.target.value })}/>
                                <input  value={passwordResetForm.confirmPassword}
                                        type="password"
                                        placeholder="Confirm new password"
                                        required={true}
                                        className="border p-2 w-full"
                                        onChange={(e) => setPasswordResetForm({ ...passwordResetForm, confirmPassword: e.target.value })}/>

                                {passwordResetForm.password.length < 8 && <p className="text-sm text-red-600">Password must be at least 8 characters long</p>}
                                {passwordResetForm.password !== passwordResetForm.confirmPassword && <p className="text-sm text-red-600">Passwords must match</p>}
                                {passwordResetSuccess && <p className="text-sm text-green-600">Password changed successfully!</p>}
                                {passwordResetError && <p className="text-sm text-red-600">{passwordResetError}</p>}
                            <div className='w-full flex flex-row justify-between'>
                                {(passwordResetForm.password.length >= 8 && passwordResetForm.password === passwordResetForm.confirmPassword) ? (
                                    <button type="submit" className="bg-abra-accent text-white p-2 rounded-lg mt-2">Submit</button>
                                ) : (
                                    <button className="bg-gray-500 text-black p-2 rounded-lg mt-2 cursor-not-allowed" disabled>Submit</button>
                                )}
                                <button onClick={closeUpdatePassword} className="bg-abra-accent text-white p-2 rounded-lg mt-2">Close</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="flex flex-row w-full justify-between px-[10px] min-w-max">
                    <div>
                        <h3 className="text-xl font-semibold self-center align-middle">2FA Confirmed: {user.is_totp_confirmed ? "Yes" : "No"}</h3>
                    </div>
                    <div>
                        <button onClick={toggleUpdate2FA} className="bg-abra-accent text-white p-2 rounded-lg">Update 2FA</button>
                    </div>
                </div>
                {displayUpdate2FA && (
                    <div className="mt-2 px-[10px]">
                        {/* Form to update 2FA */}
                        <h3>Update 2FA for {user.username}</h3>
                        {/* 2FA update logic */}
                        <div className='w-full flex flex-row justify-between'>
                            <button className="bg-abra-accent text-white p-2 rounded-lg mt-2">Submit</button>
                            <button onClick={closeUpdate2FA} className="bg-abra-accent text-white p-2 rounded-lg mt-2">Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserSettings;
