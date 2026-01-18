import React from 'react';
import ComingSoon from '@/Components/Dashboard/ComingSoon';
import { IconBrandWhatsapp } from '@tabler/icons-react';

export default function WhatsApp({ auth }) {
    return (
        <ComingSoon
            auth={auth}
            title="WhatsApp Business"
            description="WhatsApp Business API"
            icon={IconBrandWhatsapp}
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