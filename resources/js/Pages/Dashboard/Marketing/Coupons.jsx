import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconTicket } from '@tabler/icons-react';

export default function Coupons({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Coupons"
            description="Generate coupon codes"
            icon={IconTicket}
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