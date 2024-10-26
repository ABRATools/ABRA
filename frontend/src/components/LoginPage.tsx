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
        <nav className='w-full py-4 flex flex-row align-center justify-center bg-secondary text-primary-content'>
            <h1 className='text-7xl'>ABRA</h1>                    
        </nav>
        <PageLayout>
            <div className='flex flex-col items-center justify-center gap-5 h-screen-70'>
                <div className='flex flex-col items-center justify-center gap-5 p-5 py-10 rounded-md p-10 text-accent-content bg-neutral-content border-primary-content border-2'>
                    <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-5'>
                        <div className='flex flex-col items-center justify-center gap-x-1.5'>
                            <input
                                className='rounded-md text-[#6fcdc6] text-3xl text-center placeholder-accent border-primary-content border-2 mb-2'
                                type="text"
                                placeholder="Username"
                                // value={username}
                                required={true}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                            <input
                                className='rounded-md text-[#6fcdc6] text-3xl text-center placeholder-accent border-primary-content border-2 mb-2'
                                type="password"
                                placeholder="Password"
                                // value={password}
                                required={true}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                            <button type="submit" disabled={loading} className='p-2 rounded-md w-min-content h-[30px] bg-accent text-2xl text-white text-center flex flex-col align-center justify-center'>
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