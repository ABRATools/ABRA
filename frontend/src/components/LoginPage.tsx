// posts username to /login endpoint, if successful, redirects to /dashboard

import React from 'react';
import PageLayout from './PageLayout';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = React.useState({ username: '', password: '' });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log(form);
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: form.username, password: form.password }),
            });

            if (response.ok) {
                setSuccess(true);
                navigate('/dashboard');
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            setError('An error occurred');
        }

        setLoading(false);
    };

    return (
        <>
        <nav className='w-full py-[40px] flex flex-row align-center px-[40px] bg-abra-accent'>
            <Link to='/'>
                <h1 className='text-4xl font-bold'>ABRA Tools</h1>
            </Link>
        </nav>
        <PageLayout>
            <div className='flex flex-col items-center justify-center gap-[20px] h-screen-70'>
                <div className='flex flex-col items-center justify-center gap-[20px] p-[20px] py-[20px] rounded-md border-2 border-abra-primary bg-white'>
                    <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-5'>
                        <div className='flex flex-col items-center justify-center gap-x-1.5'>
                            <input
                                className='rounded-md text-2xl border-abra-primary border-2 mb-[10px] p-[5px]'
                                type="text"
                                placeholder="Username"
                                value={form.username}
                                required={true}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                            <input
                                className='rounded-md text-2xl border-abra-primary border-2 mb-[40px] p-[5px]'
                                type="password"
                                placeholder="Password"
                                value={form.password}
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