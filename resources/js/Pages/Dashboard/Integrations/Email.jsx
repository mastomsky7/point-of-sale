import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconMail } from '@tabler/icons-react';

export default function Email({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Email Platform"
            description="Email service integration"
            icon={IconMail}
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