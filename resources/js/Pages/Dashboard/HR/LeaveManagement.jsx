import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconBeach } from '@tabler/icons-react';

export default function LeaveManagement({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Leave Management"
            description="Manage leave requests and approvals"
            icon={IconBeach}
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