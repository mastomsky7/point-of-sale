import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconApps } from '@tabler/icons-react';

export default function ThirdParty({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Third-Party Apps"
            description="Connected applications"
            icon={IconApps}
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