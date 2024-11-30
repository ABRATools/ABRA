// import React from 'react';
import Navbar from './Navbar';
import useAuth from '../hooks/useAuth';

export default function UpdatingTerminal() {
    const { isAuthorized, loading } = useAuth(() => {
		window.location.href = '/login';
		// console.log('Unauthorized');
	});

	if (isAuthorized) {
		// window.location.href = '/dashboard';
		console.log('Authorized');
	}

	if (loading) {
		return <div>Loading...</div>;
	}
    return (
        <div>
            <Navbar />
        </div>
    );
}