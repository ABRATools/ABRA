// posts username to /login endpoint, if successful, redirects to /dashboard

import React from 'react';
import PageLayout from './PageLayout';

export default function LoginPage() {
    const [form, setForm] = React.useState({ username: '', password: '' });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: form.username, password: form.password }),
            });

            if (response.ok) {
                setSuccess(true);
                window.location.href = '/dashboard';
            } else {
                setError('Username not found in database');
            }
        } catch (error) {
            setError('An error occurred');
        }

        setLoading(false);
    };

    return (
        <>
        <nav className='w-full py-[2rem] flex flex-row align-center px-[40px] bg-abra-accent'>
            <h1 className='text-7xl'>ABRA Tools</h1>
        </nav>
        <PageLayout>
            <div className='flex flex-col items-center justify-center gap-[20px] h-screen-70'>
                <div className='flex flex-col items-center justify-center gap-[20px] p-[40px] py-[60px] rounded-md border-2 border-abra-primary bg-white'>
                    <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-5'>
                        <div className='flex flex-col items-center justify-center gap-x-1.5'>
                            <input
                                className='rounded-md text-3xl border-abra-primary border-2 mb-[10px] p-[10px]'
                                type="text"
                                placeholder="Username"
                                // value={username}
                                required={true}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                            <input
                                className='rounded-md text-3xl border-abra-primary border-2 mb-[40px] p-[10px]'
                                type="password"
                                placeholder="Password"
                                // value={password}
                                required={true}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                            <button type="submit" disabled={loading} className='rounded-md w-min-content h-[30px] border-abra-accent border-4 text-2xl text-center flex flex-col align-center justify-center p-[25px]'>
                                {loading ? 'Loading...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>Success!</p>}
            </div>
        </PageLayout>
        </>
    );
  }