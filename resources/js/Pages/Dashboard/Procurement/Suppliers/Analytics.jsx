import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconChartBar } from '@tabler/icons-react';

export default function Analytics({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Supplier Analytics"
            description="Analyze supplier performance"
            icon={IconChartBar}
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