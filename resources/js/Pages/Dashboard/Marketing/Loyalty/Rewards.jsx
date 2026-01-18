import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconGift } from '@tabler/icons-react';

export default function Rewards({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Rewards"
            description="Manage reward catalog"
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