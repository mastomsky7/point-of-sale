import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconDiscount } from '@tabler/icons-react';

export default function Discounts({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Discounts"
            description="Manage discount codes"
            icon={IconDiscount}
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