import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconFileText } from '@tabler/icons-react';

export default function Create({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Create Purchase Order"
            description="Create new purchase orders"
            icon={IconFileText}
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