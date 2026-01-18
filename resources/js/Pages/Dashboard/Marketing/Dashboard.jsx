import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconSpeakerphone } from '@tabler/icons-react';

export default function Dashboard({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Marketing Dashboard"
            description="Overview of marketing campaigns"
            icon={IconSpeakerphone}
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