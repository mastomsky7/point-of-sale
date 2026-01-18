import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconUserPlus } from '@tabler/icons-react';

export default function Recruitment({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Recruitment"
            description="Manage hiring pipeline"
            icon={IconUserPlus}
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