import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconPackageImport } from '@tabler/icons-react';

export default function Receiving({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Goods Receiving"
            description="Receive goods from suppliers"
            icon={IconPackageImport}
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