import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconWebhook } from '@tabler/icons-react';

export default function Webhooks({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Webhooks"
            description="Configure webhook endpoints"
            icon={IconWebhook}
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