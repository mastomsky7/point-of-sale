import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconBrandFacebook } from '@tabler/icons-react';

export default function SocialMedia({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="Social Media"
            description="Social media management"
            icon={IconBrandFacebook}
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