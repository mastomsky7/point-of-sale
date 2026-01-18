import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconChartBar } from '@tabler/icons-react';

export default function SalaryStructure({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Salary Structure"
            description="Define salary components"
            icon={IconChartBar}
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