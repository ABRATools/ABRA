// import React from 'react';
import Navbar from './Navbar';
import PageLayout from './PageLayout';
import RechartVMResource from './RechartVMResource';

export default function Dashboard() {
    return (
        <>
        <Navbar />
        <PageLayout>
            <>
            <h1 className='text-3xl'>Dashboard</h1>
            <RechartVMResource VMAPI='/get_resources' update_interval={10} />
            <RechartVMResource VMAPI='/get_resources' update_interval={5} />
            </>
        </PageLayout>
        </>
    );
}