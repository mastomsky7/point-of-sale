import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconChartLine } from '@tabler/icons-react';

export default function Performance({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Performance"
            description="Track employee performance"
            icon={IconChartLine}
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