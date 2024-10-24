// gets food name, quantity, and log date from a user and sends it to /submit-entry

import React from 'react';
import Navbar from './Navbar';
import PageLayout from './PageLayout';
import { Link } from 'react-router-dom';

export default function SubmitEntry() {
    const [date, setDate] = React.useState('');
    const [foodname, setFoodName] = React.useState('');
    const [foodamount, setFoodAmount] = React.useState<number>();
    const [loadingsubmit, setLoadingSubmit] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const fetchSubmit = async () => {
        try {
            setLoadingSubmit(true);
            const response = await fetch('/submit_entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ food_name: foodname, food_quantity: foodamount, date }),
            });
            setLoadingSubmit(false);
            if (response.ok) {
                // window.location.href = '/dashboard';
                setSuccess('Entry submitted successfully');
            } else {
                setError('An error occurred while submitting entry');
            }
        } catch (error) {
            setError('An error occurred while submitting entry');
        }
    }
    return (
        <>
        <Navbar />
        <PageLayout>
            <div className='flex flex-col'>
                <div>
                <h1 className='mt-[5px] mb-5'>
                    Submit Entry
                </h1>
                <div className='flex flex-row justify-between w-full mb-5'>
                    <input
                        className='p-2 rounded-md w-[200px] h-[40px] text-[#6fcdc6] text-xl text-center placeholder-[#6fcdc6] border-[#6fcdc6] border-2 flex flex-col align-center justify-center'
                        type="text"
                        placeholder="Food Name"
                        value={foodname}
                        onChange={(e) => setFoodName(e.target.value)}
                    />
                    <input
                        className='p-2 rounded-md w-[200px] h-[40px] text-[#6fcdc6] text-xl text-center placeholder-[#6fcdc6] border-[#6fcdc6] border-2 flex flex-col align-center justify-center'
                        type="number"
                        placeholder="Food Quantity"
                        value={foodamount}
                        onChange={(e) => setFoodAmount(e.target.valueAsNumber)}
                    />
                    <input
                        className='p-2 rounded-md w-[200px] h-[40px] text-[#6fcdc6] text-xl text-center placeholder-[#6fcdc6] border-[#6fcdc6] border-2 flex flex-col align-center justify-center'
                        type="date"
                        placeholder="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <button type="submit" disabled={
                        date === "" || foodname === undefined || foodamount === undefined || loadingsubmit
                    } onClick={fetchSubmit}
                    className='p-2 rounded-md w-min-content h-[30px] bg-[#6fcdc6] text-xl text-white text-center flex flex-col align-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'>
                        {loadingsubmit ? 'Loading...' : 'Submit'}
                    </button>
                </div>
                </div>
                <div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}
                </div>
                <div className='w-full flex flex-row justify-end'>
                    <button
                    className='p-2 rounded-md w-[200px] h-[60px] bg-[#6fcdc6] text-xl text-white text-center flex flex-col align-center justify-center'>
                        <Link to='/dashboard' className='no-underline text-white'>Back to Dashboard</Link>
                    </button>
                </div>
            </div>
        </PageLayout>
        </>
    );
}