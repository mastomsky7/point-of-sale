import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconCards } from '@tabler/icons-react';

export default function Vouchers({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Vouchers"
            description="Manage gift vouchers"
            icon={IconCards}
            features={[
                'Full feature implementation',
                'Data management and CRUD operations',
                'Advanced filtering and search',
                'Export and reporting capabilities',
                'Real-time updates and notifications',
                'Mobile-responsive interface'
            ]}
        />
    );
}