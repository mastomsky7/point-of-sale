import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconClock } from '@tabler/icons-react';

export default function Shifts({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Shifts"
            description="Schedule and manage work shifts"
            icon={IconClock}
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