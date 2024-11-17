import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuthenticateUser } from '../hooks/useAuthenticateUser';

// get the audit logs from the backend and display them in a terminal-like interface
// refresh api endpoint every 10 seconds

const REFRESH_INTERVAL = 30000;

export default function Audit() {
    useAuthenticateUser();
    // currently only storing 1 log, but can be expanded to store more in the future
    const [auditLog, setAuditLog] = useState<string>("");
    const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(REFRESH_INTERVAL / 1000);
    // update time until refresh every second
    useEffect(() => {
        const fetchAuditLog = async () => {
            try {
                const response = await fetch('/get_audit_log');
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setAuditLog(data.audit_log);
                } else {
                    console.error('Failed to fetch audit log');
                }
            } catch (error) {
                console.error('Error fetching audit log:', error);
            }
        }
        // fetch the audit log every 10 seconds
        const interval = setInterval(() => {
            fetchAuditLog();
        }, REFRESH_INTERVAL);
        // fetch the audit log immediately
        fetchAuditLog();
        // clear interval when the component is unmounted
        return () => {
            clearInterval(interval);
        }
    }, []);
    // update time until refresh every second
    useEffect(() => {
        const timer = setInterval(() => {
            if (timeUntilRefresh === 0) {
                setTimeUntilRefresh(REFRESH_INTERVAL / 1000);
                return;
            }
            setTimeUntilRefresh(timeUntilRefresh => timeUntilRefresh - 1);
        }, 1000);
        return () => {
            clearInterval(timer);
        }
    }, [timeUntilRefresh]);
    return (
        <div>
            <Navbar />
            <div className="flex flex-col w-full">
                <div className="flex flex-row w-full justify-between px-[10px] lg:px-[60px] min-w-max py-[25px]">
                    <div className='flex flex-row justify-between max-w-max gap-x-[5vw]'>
                        <h1 className="text-3xl font-semibold align-middle">Audit Log</h1>
                        <div className='flex flex-row'>
                            <input className="border border-gray-300 p-2 rounded-lg rounded-r-none" placeholder="Search logs..." />
                            <button className="bg-abra-accent text-white p-2 rounded-lg rounded-l-none">Search</button>
                            <button className="bg-abra-accent text-white p-2 rounded-lg ml-[20px]">Export</button>
                        </div>
                    </div>
                    <div className='flex flex-row justify-around'>
                        <pre className="text-lg self-center mr-[10px] min-w-max">Refreshing in {timeUntilRefresh} seconds</pre>
                        <span className="loading loading-ring loading-lg"></span>
                    </div>
                </div>
                <div className="flex flex-col px-[10px] lg:px-[60px]">
                    <div className="bg-black text-white p-2 rounded-sm w-full h-max max-h-[90vh] overflow-x-auto overflow-y-auto">
                        <pre className='text-sm'>{auditLog}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}