import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconChartDots } from '@tabler/icons-react';

export default function MarketAnalysis({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Market Analysis"
            description="Market research and analysis"
            icon={IconChartDots}
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