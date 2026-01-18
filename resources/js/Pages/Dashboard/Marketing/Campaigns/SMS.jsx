import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconMessage } from '@tabler/icons-react';

export default function SMS({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="SMS Campaigns"
            description="Send SMS marketing messages"
            icon={IconMessage}
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