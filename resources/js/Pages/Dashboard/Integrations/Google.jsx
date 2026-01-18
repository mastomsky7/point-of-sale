import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconBrandGoogle } from '@tabler/icons-react';

export default function Google({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Google Suite"
            description="Google Workspace integration"
            icon={IconBrandGoogle}
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