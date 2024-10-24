// posts username to /login endpoint, if successful, redirects to /dashboard

import React from 'react';
import PageLayout from './PageLayout';

export default function LoginPage() {
    const [username, setUsername] = React.useState('');
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
                body: JSON.stringify({ username }),
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
        <nav className='w-full py-10 flex flex-row align-center justify-center bg-[#6fcdc6] text-accent-content mb-5'>
            <h1 className='text-3xl'>Login to start tracking!</h1>                    
        </nav>
        <PageLayout>
            <div className='flex flex-col items-center justify-center gap-5'>
                <form onSubmit={handleSubmit} className='flex flex-col w-full items-center justify-center gap-5'>
                    <div className='flex flex-row items-center justify-center'>
                    <input
                        className='p-2 rounded-md w-[200px] h-[30px] text-[#6fcdc6] text-xl text-center placeholder-[#6fcdc6] border-[#6fcdc6] border-2'
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className='p-2 rounded-md w-min-content h-[30px] bg-[#6fcdc6] text-xl text-white text-center flex flex-col align-center justify-center'>
                        {loading ? 'Loading...' : 'Submit'}
                    </button>
                
                    </div>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>Success!</p>}
            </div>
        </PageLayout>
        </>
    );
  }