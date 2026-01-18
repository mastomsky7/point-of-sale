<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // dashboard permissions
        Permission::firstOrCreate(['name' => 'dashboard-access']);

        // users permissions
        Permission::firstOrCreate(['name' => 'users-access']);
        Permission::firstOrCreate(['name' => 'users-create']);
        Permission::firstOrCreate(['name' => 'users-update']);
        Permission::firstOrCreate(['name' => 'users-delete']);

        // roles permissions
        Permission::firstOrCreate(['name' => 'roles-access']);
        Permission::firstOrCreate(['name' => 'roles-create']);
        Permission::firstOrCreate(['name' => 'roles-update']);
        Permission::firstOrCreate(['name' => 'roles-delete']);

        // permissions permissions
        Permission::firstOrCreate(['name' => 'permissions-access']);
        Permission::firstOrCreate(['name' => 'permissions-create']);
        Permission::firstOrCreate(['name' => 'permissions-update']);
        Permission::firstOrCreate(['name' => 'permissions-delete']);

        //permission categories
        Permission::firstOrCreate(['name' => 'categories-access']);
        Permission::firstOrCreate(['name' => 'categories-create']);
        Permission::firstOrCreate(['name' => 'categories-edit']);
        Permission::firstOrCreate(['name' => 'categories-delete']);

        //permission products
        Permission::firstOrCreate(['name' => 'products-access']);
        Permission::firstOrCreate(['name' => 'products-create']);
        Permission::firstOrCreate(['name' => 'products-edit']);
        Permission::firstOrCreate(['name' => 'products-delete']);

        //permission customers
        Permission::firstOrCreate(['name' => 'customers-access']);
        Permission::firstOrCreate(['name' => 'customers-create']);
        Permission::firstOrCreate(['name' => 'customers-edit']);
        Permission::firstOrCreate(['name' => 'customers-delete']);

        //permission transactions
        Permission::firstOrCreate(['name' => 'transactions-access']);

        // permission services (beauty salon)
        Permission::firstOrCreate(['name' => 'services-access']);
        Permission::firstOrCreate(['name' => 'services-create']);
        Permission::firstOrCreate(['name' => 'services-edit']);
        Permission::firstOrCreate(['name' => 'services-delete']);

        // permission staff (beauty salon)
        Permission::firstOrCreate(['name' => 'staff-access']);
        Permission::firstOrCreate(['name' => 'staff-create']);
        Permission::firstOrCreate(['name' => 'staff-edit']);
        Permission::firstOrCreate(['name' => 'staff-delete']);

        // permission appointments (beauty salon)
        Permission::firstOrCreate(['name' => 'appointments-access']);
        Permission::firstOrCreate(['name' => 'appointments-create']);
        Permission::firstOrCreate(['name' => 'appointments-edit']);
        Permission::firstOrCreate(['name' => 'appointments-delete']);

        // permission reports
        Permission::firstOrCreate(['name' => 'reports-access']);
        Permission::firstOrCreate(['name' => 'profits-access']);

        // enterprise reporting permissions
        Permission::firstOrCreate(['name' => 'enterprise-reports-access']);
        Permission::firstOrCreate(['name' => 'reports-view']);
        Permission::firstOrCreate(['name' => 'reports-export']);
        Permission::firstOrCreate(['name' => 'reports-save']);
        Permission::firstOrCreate(['name' => 'reports-schedule']);
        Permission::firstOrCreate(['name' => 'reports-manage-all']);
        Permission::firstOrCreate(['name' => 'reports-sales']);
        Permission::firstOrCreate(['name' => 'reports-products']);
        Permission::firstOrCreate(['name' => 'reports-customers']);
        Permission::firstOrCreate(['name' => 'reports-profit']);
        Permission::firstOrCreate(['name' => 'reports-tax']);
        Permission::firstOrCreate(['name' => 'reports-inventory']);

        // settings permissions
        Permission::firstOrCreate(['name' => 'payment-settings-access']);
        Permission::firstOrCreate(['name' => 'notification-settings-access']);
        Permission::firstOrCreate(['name' => 'backup-access']);

        // ==================== ENTERPRISE PERMISSIONS ====================

        // Finance & Accounting
        Permission::firstOrCreate(['name' => 'finance-access']);
        Permission::firstOrCreate(['name' => 'accounting-access']);
        Permission::firstOrCreate(['name' => 'ledger-access']);
        Permission::firstOrCreate(['name' => 'journal-access']);
        Permission::firstOrCreate(['name' => 'accounts-access']);
        Permission::firstOrCreate(['name' => 'invoices-access']);
        Permission::firstOrCreate(['name' => 'invoices-view']);
        Permission::firstOrCreate(['name' => 'invoices-create']);
        Permission::firstOrCreate(['name' => 'invoices-recurring']);
        Permission::firstOrCreate(['name' => 'payments-access']);
        Permission::firstOrCreate(['name' => 'payments-view']);
        Permission::firstOrCreate(['name' => 'payment-methods-manage']);
        Permission::firstOrCreate(['name' => 'banking-access']);
        Permission::firstOrCreate(['name' => 'bank-accounts-access']);
        Permission::firstOrCreate(['name' => 'bank-reconciliation-access']);
        Permission::firstOrCreate(['name' => 'expenses-access']);
        Permission::firstOrCreate(['name' => 'budgets-access']);

        // Procurement & Supply Chain
        Permission::firstOrCreate(['name' => 'purchase-orders-access']);
        Permission::firstOrCreate(['name' => 'purchase-orders-view']);
        Permission::firstOrCreate(['name' => 'purchase-orders-create']);
        Permission::firstOrCreate(['name' => 'suppliers-access']);
        Permission::firstOrCreate(['name' => 'suppliers-view']);
        Permission::firstOrCreate(['name' => 'suppliers-analytics']);
        Permission::firstOrCreate(['name' => 'warehouses-access']);
        Permission::firstOrCreate(['name' => 'warehouses-view']);
        Permission::firstOrCreate(['name' => 'stock-transfers-access']);
        Permission::firstOrCreate(['name' => 'stock-adjustments-access']);
        Permission::firstOrCreate(['name' => 'inventory-tracking-access']);
        Permission::firstOrCreate(['name' => 'batch-tracking-access']);
        Permission::firstOrCreate(['name' => 'serial-tracking-access']);
        Permission::firstOrCreate(['name' => 'expiry-tracking-access']);
        Permission::firstOrCreate(['name' => 'receiving-access']);

        // Human Resources
        Permission::firstOrCreate(['name' => 'hr-access']);
        Permission::firstOrCreate(['name' => 'employees-access']);
        Permission::firstOrCreate(['name' => 'employees-view']);
        Permission::firstOrCreate(['name' => 'employee-profiles-view']);
        Permission::firstOrCreate(['name' => 'departments-access']);
        Permission::firstOrCreate(['name' => 'attendance-access']);
        Permission::firstOrCreate(['name' => 'attendance-view']);
        Permission::firstOrCreate(['name' => 'leave-management-access']);
        Permission::firstOrCreate(['name' => 'shifts-access']);
        Permission::firstOrCreate(['name' => 'payroll-access']);
        Permission::firstOrCreate(['name' => 'payroll-process']);
        Permission::firstOrCreate(['name' => 'payroll-view']);
        Permission::firstOrCreate(['name' => 'salary-structure-access']);
        Permission::firstOrCreate(['name' => 'recruitment-access']);
        Permission::firstOrCreate(['name' => 'job-postings-access']);
        Permission::firstOrCreate(['name' => 'candidates-access']);
        Permission::firstOrCreate(['name' => 'training-access']);
        Permission::firstOrCreate(['name' => 'performance-access']);

        // Marketing & CRM
        Permission::firstOrCreate(['name' => 'marketing-access']);
        Permission::firstOrCreate(['name' => 'campaigns-access']);
        Permission::firstOrCreate(['name' => 'email-campaigns-access']);
        Permission::firstOrCreate(['name' => 'sms-campaigns-access']);
        Permission::firstOrCreate(['name' => 'whatsapp-campaigns-access']);
        Permission::firstOrCreate(['name' => 'promotions-access']);
        Permission::firstOrCreate(['name' => 'discounts-access']);
        Permission::firstOrCreate(['name' => 'coupons-access']);
        Permission::firstOrCreate(['name' => 'vouchers-access']);
        Permission::firstOrCreate(['name' => 'loyalty-access']);
        Permission::firstOrCreate(['name' => 'loyalty-settings-access']);
        Permission::firstOrCreate(['name' => 'loyalty-tiers-access']);
        Permission::firstOrCreate(['name' => 'rewards-access']);
        Permission::firstOrCreate(['name' => 'social-media-access']);
        Permission::firstOrCreate(['name' => 'social-posts-access']);
        Permission::firstOrCreate(['name' => 'social-analytics-access']);
        Permission::firstOrCreate(['name' => 'referrals-access']);
        Permission::firstOrCreate(['name' => 'market-analysis-access']);

        // Integrations
        Permission::firstOrCreate(['name' => 'integrations-access']);
        Permission::firstOrCreate(['name' => 'api-access']);
        Permission::firstOrCreate(['name' => 'api-keys-access']);
        Permission::firstOrCreate(['name' => 'webhooks-access']);
        Permission::firstOrCreate(['name' => 'api-logs-access']);
        Permission::firstOrCreate(['name' => 'third-party-access']);
        Permission::firstOrCreate(['name' => 'google-integration-access']);
        Permission::firstOrCreate(['name' => 'email-integration-access']);
        Permission::firstOrCreate(['name' => 'whatsapp-integration-access']);

        // ==================== MULTI-TENANT SAAS PERMISSIONS ====================

        // Client Management (Super Admin Only)
        Permission::firstOrCreate(['name' => 'clients-access']);
        Permission::firstOrCreate(['name' => 'clients-create']);
        Permission::firstOrCreate(['name' => 'clients-edit']);
        Permission::firstOrCreate(['name' => 'clients-delete']);
        Permission::firstOrCreate(['name' => 'clients-view-all']);
        Permission::firstOrCreate(['name' => 'clients-suspend']);

        // Store Management
        Permission::firstOrCreate(['name' => 'stores-access']);
        Permission::firstOrCreate(['name' => 'stores-create']);
        Permission::firstOrCreate(['name' => 'stores-edit']);
        Permission::firstOrCreate(['name' => 'stores-delete']);
        Permission::firstOrCreate(['name' => 'stores-switch']);

        // Merchant Management
        Permission::firstOrCreate(['name' => 'merchants-access']);
        Permission::firstOrCreate(['name' => 'merchants-create']);
        Permission::firstOrCreate(['name' => 'merchants-edit']);
        Permission::firstOrCreate(['name' => 'merchants-delete']);
        Permission::firstOrCreate(['name' => 'merchants-set-default']);
        Permission::firstOrCreate(['name' => 'merchant-mappings-access']);
        Permission::firstOrCreate(['name' => 'merchant-mappings-manage']);

        // License Management
        Permission::firstOrCreate(['name' => 'licenses-access']);
        Permission::firstOrCreate(['name' => 'licenses-create']);
        Permission::firstOrCreate(['name' => 'licenses-renew']);
        Permission::firstOrCreate(['name' => 'licenses-suspend']);

        // Subscription Management
        Permission::firstOrCreate(['name' => 'subscriptions-access']);
        Permission::firstOrCreate(['name' => 'subscriptions-manage']);
        Permission::firstOrCreate(['name' => 'subscriptions-upgrade']);
        Permission::firstOrCreate(['name' => 'subscriptions-cancel']);
        Permission::firstOrCreate(['name' => 'subscription-plans-access']);
    }
}
