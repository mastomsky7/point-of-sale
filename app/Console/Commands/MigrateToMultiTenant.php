<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Store;
use App\Models\SubscriptionPlan;
use App\Models\StoreLicense;
use App\Models\ClientSubscription;
use App\Models\PaymentMerchant;
use App\Models\PaymentSetting;
use App\Models\StoreMerchantMapping;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Service;
use App\Models\Staff;
use App\Models\Appointment;
use App\Models\Cart;
use Illuminate\Support\Str;

class MigrateToMultiTenant extends Command
{
    protected $signature = 'multi-tenant:migrate {--client-name=Default Client} {--store-name=Main Store}';

    protected $description = 'Migrate existing single-tenant data to multi-tenant structure';

    public function handle()
    {
        $this->info('Starting multi-tenant migration...');

        if (!$this->confirm('This will migrate all existing data to a new client/store structure. Continue?')) {
            $this->error('Migration cancelled.');
            return 1;
        }

        // Step 1: Create Client
        $this->info('Step 1: Creating default client...');
        $clientName = $this->option('client-name');
        $client = Client::create([
            'name' => $clientName,
            'slug' => Str::slug($clientName),
            'status' => 'active',
            'trial_ends_at' => now()->addDays(14),
        ]);
        $this->info("✓ Client created: {$client->name} (ID: {$client->id})");

        // Step 2: Create Store
        $this->info('Step 2: Creating default store...');
        $storeName = $this->option('store-name');
        $store = Store::create([
            'client_id' => $client->id,
            'name' => $storeName,
            'code' => 'MAIN',
            'is_active' => true,
        ]);
        $this->info("✓ Store created: {$store->name} (ID: {$store->id})");

        // Step 3: Create Subscription
        $this->info('Step 3: Creating subscription...');
        $plan = SubscriptionPlan::where('slug', 'enterprise')->first();
        if (!$plan) {
            $this->error('Enterprise plan not found. Please run: php artisan db:seed --class=SubscriptionPlanSeeder');
            return 1;
        }

        $subscription = ClientSubscription::create([
            'client_id' => $client->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'price' => 0,
            'current_period_start' => now(),
            'current_period_end' => now()->addYear(),
        ]);
        $this->info("✓ Subscription created: {$plan->name}");

        // Step 4: Create License
        $this->info('Step 4: Creating store license...');
        $expiresAt = now()->addYear();
        $license = StoreLicense::create([
            'store_id' => $store->id,
            'plan_id' => $plan->id,
            'license_key' => 'LIC-' . Str::upper(Str::random(16)),
            'status' => 'active',
            'activated_at' => now(),
            'expires_at' => $expiresAt,
            'grace_period_ends_at' => $expiresAt->copy()->addDays(7), // 7-day grace period
        ]);
        $this->info("✓ License created: {$license->license_key}");

        // Step 5: Migrate PaymentSetting → PaymentMerchant
        $this->info('Step 5: Migrating payment settings to merchant...');
        $oldSettings = PaymentSetting::first();

        if ($oldSettings) {
            $merchant = PaymentMerchant::create([
                'client_id' => $client->id,
                'name' => 'Default Merchant',
                'merchant_code' => 'DEFAULT',
                'midtrans_enabled' => $oldSettings->midtrans_enabled ?? false,
                'midtrans_server_key' => $oldSettings->midtrans_server_key,
                'midtrans_client_key' => $oldSettings->midtrans_client_key,
                'midtrans_is_production' => $oldSettings->midtrans_production ?? false,
                'xendit_enabled' => $oldSettings->xendit_enabled ?? false,
                'xendit_api_key' => $oldSettings->xendit_secret_key,
                'xendit_public_key' => $oldSettings->xendit_public_key,
                'xendit_is_production' => $oldSettings->xendit_production ?? false,
                'is_default' => true,
                'is_active' => true,
            ]);

            StoreMerchantMapping::create([
                'store_id' => $store->id,
                'merchant_id' => $merchant->id,
                'is_active' => true,
            ]);

            $this->info("✓ Merchant created and mapped to store");
        } else {
            $this->warn('No payment settings found to migrate');
        }

        // Step 6: Update Users
        $this->info('Step 6: Updating users...');
        $userCount = User::update([
            'client_id' => $client->id,
            'default_store_id' => $store->id,
        ]);
        $this->info("✓ Updated {$userCount} users");

        // Step 7: Update Products
        $this->info('Step 7: Updating products...');
        $productCount = Product::update(['store_id' => $store->id]);
        $this->info("✓ Updated {$productCount} products");

        // Step 8: Update Categories
        $this->info('Step 8: Updating categories...');
        $categoryCount = Category::update(['store_id' => $store->id]);
        $this->info("✓ Updated {$categoryCount} categories");

        // Step 9: Update Customers
        $this->info('Step 9: Updating customers...');
        $customerCount = Customer::update(['client_id' => $client->id]);
        $this->info("✓ Updated {$customerCount} customers");

        // Step 10: Update Transactions
        $this->info('Step 10: Updating transactions...');
        $transactionCount = Transaction::update([
            'store_id' => $store->id,
            'merchant_id' => $merchant->id ?? null,
        ]);
        $this->info("✓ Updated {$transactionCount} transactions");

        // Step 11: Update Services
        $this->info('Step 11: Updating services...');
        $serviceCount = Service::update(['store_id' => $store->id]);
        $this->info("✓ Updated {$serviceCount} services");

        // Step 12: Update Staff
        $this->info('Step 12: Updating staff...');
        $staffCount = Staff::update(['store_id' => $store->id]);
        $this->info("✓ Updated {$staffCount} staff");

        // Step 13: Update Appointments
        $this->info('Step 13: Updating appointments...');
        $appointmentCount = Appointment::update(['store_id' => $store->id]);
        $this->info("✓ Updated {$appointmentCount} appointments");

        // Step 14: Update Carts
        $this->info('Step 14: Updating carts...');
        $cartCount = Cart::update(['store_id' => $store->id]);
        $this->info("✓ Updated {$cartCount} cart items");

        // Summary
        $this->newLine();
        $this->info('========================================');
        $this->info('Migration Complete!');
        $this->info('========================================');
        $this->table(
            ['Resource', 'Count'],
            [
                ['Client', 1],
                ['Store', 1],
                ['License', 1],
                ['Merchant', isset($merchant) ? 1 : 0],
                ['Users', $userCount],
                ['Products', $productCount],
                ['Categories', $categoryCount],
                ['Customers', $customerCount],
                ['Transactions', $transactionCount],
                ['Services', $serviceCount],
                ['Staff', $staffCount],
                ['Appointments', $appointmentCount],
                ['Carts', $cartCount],
            ]
        );

        $this->newLine();
        $this->info("Client Name: {$client->name}");
        $this->info("Store Name: {$store->name}");
        $this->info("License Key: {$license->license_key}");
        $this->info("License Expires: {$license->expires_at->format('Y-m-d')}");

        $this->newLine();
        $this->info('All data has been migrated to multi-tenant structure.');
        $this->info('Your POS system will continue to work as before.');

        return 0;
    }
}
