import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconSettings } from '@tabler/icons-react';

export default function Settings({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Loyalty Settings"
            description="Configure loyalty program"
            icon={IconSettings}
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