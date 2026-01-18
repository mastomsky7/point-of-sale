import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconBarcode } from '@tabler/icons-react';

export default function InventoryTracking({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Inventory Tracking"
            description="Track inventory with batch/serial/expiry"
            icon={IconBarcode}
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