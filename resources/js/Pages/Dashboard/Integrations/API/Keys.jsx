import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconKey } from '@tabler/icons-react';

export default function Keys({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="API Keys"
            description="Generate and manage API keys"
            icon={IconKey}
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