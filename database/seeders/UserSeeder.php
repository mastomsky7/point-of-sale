<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update super admin user
        $user = User::updateOrCreate(
            ['email' => 'arya@gmail.com'],
            [
                'name' => 'Arya Dwi Putra',
                'password' => bcrypt('password'),
            ]
        );

        // get admin role
        $role = Role::where('name', 'super-admin')->first();

        if ($role) {
            // get all permissions
            $permissions = Permission::all();

            // assign role to user
            $user->syncPermissions($permissions);

            // assign a role to user
            $user->syncRoles([$role]);
        }

        // Create or update cashier user
        $cashier = User::updateOrCreate(
            ['email' => 'cashier@gmail.com'],
            [
                'name' => 'Cashier',
                'password' => bcrypt('password'),
            ]
        );

        // Get cashier role
        $cashierRole = Role::where('name', 'cashier')->first();

        if ($cashierRole) {
            $cashier->syncRoles([$cashierRole]);
        }

        $transactionsPermission = Permission::where('name', 'transactions-access')->first();

        if ($transactionsPermission) {
            $cashier->syncPermissions([$transactionsPermission]);
        }
    }
}
