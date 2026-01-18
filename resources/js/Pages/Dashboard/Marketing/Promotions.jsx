import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconGift } from '@tabler/icons-react';

export default function Promotions({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Promotions"
            description="Create promotional offers"
            icon={IconGift}
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