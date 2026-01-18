import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconPlugConnected } from '@tabler/icons-react';

export default function Dashboard({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Integrations Dashboard"
            description="Overview of all integrations"
            icon={IconPlugConnected}
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