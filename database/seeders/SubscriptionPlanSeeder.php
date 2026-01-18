<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Perfect for small businesses starting out',
                'tier' => 'basic',
                'price' => 299000,
                'currency' => 'IDR',
                'billing_interval' => 'monthly',
                'trial_days' => 14,
                'max_stores' => 1,
                'max_merchants' => 1, // Single merchant only
                'max_products' => 1000,
                'max_users' => 3,
                'max_transactions_per_month' => null,
                'features' => [
                    'pos' => true,
                    'appointments' => true,
                    'basic_reports' => true,
                    'multi_merchant' => false,
                    'advanced_reports' => false,
                    'api_access' => false,
                    'custom_branding' => false,
                    'priority_support' => false,
                ],
                'is_active' => true,
                'is_public' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'For growing businesses with multiple locations',
                'tier' => 'pro',
                'price' => 799000,
                'currency' => 'IDR',
                'billing_interval' => 'monthly',
                'trial_days' => 14,
                'max_stores' => 5,
                'max_merchants' => 1, // Single merchant (default)
                'max_products' => 10000,
                'max_users' => 10,
                'max_transactions_per_month' => null,
                'features' => [
                    'pos' => true,
                    'appointments' => true,
                    'basic_reports' => true,
                    'advanced_reports' => true,
                    'multi_merchant' => false,
                    'api_access' => false,
                    'custom_branding' => false,
                    'priority_support' => true,
                ],
                'is_active' => true,
                'is_public' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Unlimited everything for large organizations',
                'tier' => 'enterprise',
                'price' => 0,
                'currency' => 'IDR',
                'billing_interval' => 'monthly',
                'trial_days' => 14,
                'max_stores' => 999999, // Unlimited stores (use large number)
                'max_merchants' => 999999, // Unlimited merchants (enterprise add-on)
                'max_products' => 999999,
                'max_users' => 999999,
                'max_transactions_per_month' => 999999,
                'features' => [
                    'pos' => true,
                    'appointments' => true,
                    'basic_reports' => true,
                    'advanced_reports' => true,
                    'multi_merchant' => true,
                    'api_access' => true,
                    'custom_branding' => true,
                    'priority_support' => true,
                ],
                'is_active' => true,
                'is_public' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $planData) {
            \App\Models\SubscriptionPlan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }
    }
}
