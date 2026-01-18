import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconArrowsExchange } from '@tabler/icons-react';

export default function StockTransfers({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Stock Transfers"
            description="Transfer stock between locations"
            icon={IconArrowsExchange}
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