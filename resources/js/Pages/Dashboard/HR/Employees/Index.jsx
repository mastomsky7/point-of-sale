import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconUsers } from '@tabler/icons-react';

export default function Index({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Employees"
            description="Manage employee database"
            icon={IconUsers}
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