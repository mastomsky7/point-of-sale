import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconCalendarEvent } from '@tabler/icons-react';

export default function Attendance({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Attendance"
            description="Track employee attendance"
            icon={IconCalendarEvent}
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