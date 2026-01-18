import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { IconTrendingUp, IconArrowLeft } from '@tabler/icons-react';

export default function ProfitReport({ auth, profitByProduct, summary, dateRange }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title='Laporan Keuntungan' />
            <div className='py-6'>
                <div className='max-w-7xl mx-auto sm:px-6 lg:px-8'>
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <h2 className='text-2xl font-bold mb-4'>Laporan Keuntungan</h2>
                        <p className='text-lg'>Total Profit: Rp {(summary?.total_profit || 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}