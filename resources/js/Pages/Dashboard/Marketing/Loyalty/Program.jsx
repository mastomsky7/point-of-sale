import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconAward } from '@tabler/icons-react';

export default function Program({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Loyalty Program"
            description="Customer loyalty management"
            icon={IconAward}
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