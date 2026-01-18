import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconClipboardList } from '@tabler/icons-react';

export default function Index({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Purchase Orders"
            description="Manage purchase orders to suppliers"
            icon={IconClipboardList}
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