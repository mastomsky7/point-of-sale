import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconMailbox } from '@tabler/icons-react';

export default function Index({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Campaigns"
            description="Manage marketing campaigns"
            icon={IconMailbox}
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