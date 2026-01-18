<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChartOfAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $client = \App\Models\Client::first();

        if (!$client) {
            $this->command->warn('No client found. Please create a client first.');
            return;
        }

        $accounts = [
            // ASSETS
            ['code' => '1000', 'name' => 'Assets', 'type' => 'asset', 'parent_id' => null],
            ['code' => '1100', 'name' => 'Current Assets', 'type' => 'asset', 'parent_code' => '1000'],
            ['code' => '1110', 'name' => 'Cash', 'type' => 'asset', 'parent_code' => '1100'],
            ['code' => '1120', 'name' => 'Bank Account', 'type' => 'asset', 'parent_code' => '1100'],
            ['code' => '1130', 'name' => 'Accounts Receivable', 'type' => 'asset', 'parent_code' => '1100'],
            ['code' => '1140', 'name' => 'Inventory', 'type' => 'asset', 'parent_code' => '1100'],
            ['code' => '1200', 'name' => 'Fixed Assets', 'type' => 'asset', 'parent_code' => '1000'],
            ['code' => '1210', 'name' => 'Equipment', 'type' => 'asset', 'parent_code' => '1200'],
            ['code' => '1220', 'name' => 'Furniture', 'type' => 'asset', 'parent_code' => '1200'],
            ['code' => '1230', 'name' => 'Accumulated Depreciation', 'type' => 'asset', 'parent_code' => '1200'],

            // LIABILITIES
            ['code' => '2000', 'name' => 'Liabilities', 'type' => 'liability', 'parent_id' => null],
            ['code' => '2100', 'name' => 'Current Liabilities', 'type' => 'liability', 'parent_code' => '2000'],
            ['code' => '2110', 'name' => 'Accounts Payable', 'type' => 'liability', 'parent_code' => '2100'],
            ['code' => '2120', 'name' => 'Tax Payable', 'type' => 'liability', 'parent_code' => '2100'],
            ['code' => '2130', 'name' => 'Salary Payable', 'type' => 'liability', 'parent_code' => '2100'],
            ['code' => '2200', 'name' => 'Long-term Liabilities', 'type' => 'liability', 'parent_code' => '2000'],
            ['code' => '2210', 'name' => 'Loans Payable', 'type' => 'liability', 'parent_code' => '2200'],

            // EQUITY
            ['code' => '3000', 'name' => 'Equity', 'type' => 'equity', 'parent_id' => null],
            ['code' => '3100', 'name' => 'Owner Equity', 'type' => 'equity', 'parent_code' => '3000'],
            ['code' => '3200', 'name' => 'Retained Earnings', 'type' => 'equity', 'parent_code' => '3000'],
            ['code' => '3300', 'name' => 'Current Year Earnings', 'type' => 'equity', 'parent_code' => '3000'],

            // REVENUE
            ['code' => '4000', 'name' => 'Revenue', 'type' => 'revenue', 'parent_id' => null],
            ['code' => '4100', 'name' => 'Sales Revenue', 'type' => 'revenue', 'parent_code' => '4000'],
            ['code' => '4110', 'name' => 'Product Sales', 'type' => 'revenue', 'parent_code' => '4100'],
            ['code' => '4120', 'name' => 'Service Revenue', 'type' => 'revenue', 'parent_code' => '4100'],
            ['code' => '4200', 'name' => 'Other Revenue', 'type' => 'revenue', 'parent_code' => '4000'],
            ['code' => '4210', 'name' => 'Interest Income', 'type' => 'revenue', 'parent_code' => '4200'],

            // EXPENSES
            ['code' => '5000', 'name' => 'Expenses', 'type' => 'expense', 'parent_id' => null],
            ['code' => '5100', 'name' => 'Cost of Goods Sold', 'type' => 'expense', 'parent_code' => '5000'],
            ['code' => '5200', 'name' => 'Operating Expenses', 'type' => 'expense', 'parent_code' => '5000'],
            ['code' => '5210', 'name' => 'Salaries & Wages', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5220', 'name' => 'Rent Expense', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5230', 'name' => 'Utilities Expense', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5240', 'name' => 'Marketing & Advertising', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5250', 'name' => 'Office Supplies', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5260', 'name' => 'Insurance Expense', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5270', 'name' => 'Depreciation Expense', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5280', 'name' => 'Repairs & Maintenance', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5290', 'name' => 'Miscellaneous Expense', 'type' => 'expense', 'parent_code' => '5200'],
        ];

        $created = [];

        foreach ($accounts as $accountData) {
            $parent_id = null;

            if (isset($accountData['parent_code'])) {
                $parent = \App\Models\ChartOfAccount::where('code', $accountData['parent_code'])
                    ->where('client_id', $client->id)
                    ->first();
                $parent_id = $parent ? $parent->id : null;
            } elseif (isset($accountData['parent_id'])) {
                $parent_id = $accountData['parent_id'];
            }

            $account = \App\Models\ChartOfAccount::create([
                'client_id' => $client->id,
                'code' => $accountData['code'],
                'name' => $accountData['name'],
                'type' => $accountData['type'],
                'parent_id' => $parent_id,
                'is_active' => true,
                'balance' => 0,
            ]);

            $created[] = $account->code . ' - ' . $account->name;
        }

        $this->command->info('Created ' . count($created) . ' chart of accounts for client: ' . $client->name);

        // Create default expense categories
        $expenseAccount = \App\Models\ChartOfAccount::where('code', '5200')
            ->where('client_id', $client->id)
            ->first();

        if ($expenseAccount) {
            $categories = [
                ['name' => 'Operational', 'description' => 'Daily operational expenses'],
                ['name' => 'Marketing', 'description' => 'Marketing and advertising expenses'],
                ['name' => 'Staff', 'description' => 'Staff-related expenses'],
                ['name' => 'Inventory', 'description' => 'Inventory purchases'],
                ['name' => 'Utilities', 'description' => 'Utilities and bills'],
                ['name' => 'Maintenance', 'description' => 'Repairs and maintenance'],
                ['name' => 'Other', 'description' => 'Other miscellaneous expenses'],
            ];

            foreach ($categories as $cat) {
                \App\Models\ExpenseCategory::create([
                    'client_id' => $client->id,
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'account_id' => $expenseAccount->id,
                    'is_active' => true,
                ]);
            }

            $this->command->info('Created ' . count($categories) . ' expense categories');
        }
    }
}
