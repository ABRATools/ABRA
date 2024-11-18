// import React from 'react';
import Navbar from './Navbar';
import { useAuthenticateUser } from '../hooks/useAuthenticateUser';

export default function UpdatingTerminal() {
    useAuthenticateUser();
    return (
        <div>
            <Navbar />
        </div>
    );
}