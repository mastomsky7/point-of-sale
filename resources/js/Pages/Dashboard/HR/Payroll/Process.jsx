import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconPlayerPlay } from '@tabler/icons-react';

export default function Process({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Process Payroll"
            description="Run payroll calculations"
            icon={IconPlayerPlay}
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