import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconAdjustments } from '@tabler/icons-react';

export default function StockAdjustments({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Stock Adjustments"
            description="Adjust inventory quantities"
            icon={IconAdjustments}
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