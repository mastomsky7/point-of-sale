import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconAffiliate } from '@tabler/icons-react';

export default function Referrals({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Referrals"
            description="Referral program management"
            icon={IconAffiliate}
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