<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    // Refactor the RoleSeeder to improve readability and avoid repetitive code
    public function run(): void
    {
        // Update existing permissions with store scope
        Permission::query()->update(['scope' => 'store']);

        $this->createRoleWithPermissions('users-access', '%users%');
        $this->createRoleWithPermissions('roles-access', '%roles%');
        $this->createRoleWithPermissions('permission-access', '%permissions%');
        $this->createRoleWithPermissions('categories-access', '%categories%');
        $this->createRoleWithPermissions('products-access', '%products%');
        $this->createRoleWithPermissions('customers-access', '%customers%');
        $this->createRoleWithPermissions('transactions-access', '%transactions%');
        $this->createRoleWithPermissions('services-access', '%services%');
        $this->createRoleWithPermissions('staff-access', '%staff%');
        $this->createRoleWithPermissions('appointments-access', '%appointments%');
        $this->createRoleWithPermissions('reports-access', '%reports%');
        $this->createRoleWithPermissions('profits-access', '%profits%');
        $this->createRoleWithPermissions('payment-settings-access', '%payment-settings%');

        // Global scope role - Super Admin
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->update(['scope' => 'global', 'description' => 'Full system access across all clients and stores']);

        // Create cashier role with basic permissions for public registration
        $cashierRole        = Role::firstOrCreate(['name' => 'cashier']);
        $cashierRole->update(['scope' => 'store', 'description' => 'POS cashier with transaction access']);
        $cashierPermissions = Permission::whereIn('name', [
            'dashboard-access',
            'transactions-access',
            'customers-access',
            'customers-create',
            'services-access',
            'staff-access',
            'appointments-access',
        ])->get();
        $cashierRole->givePermissionTo($cashierPermissions);

        // Multi-tenant specific roles
        $this->createMultiTenantRoles();
    }

    private function createRoleWithPermissions($roleName, $permissionNamePattern)
    {
        $permissions = Permission::where('name', 'like', $permissionNamePattern)->get();
        $role        = Role::firstOrCreate(['name' => $roleName]);
        $role->update(['scope' => 'store']);
        $role->syncPermissions($permissions);
    }

    private function createMultiTenantRoles()
    {
        // Client Owner - Full access to client and all stores
        $clientOwner = Role::firstOrCreate(['name' => 'client-owner']);
        $clientOwner->update([
            'scope' => 'client',
            'description' => 'Full access to all stores within a client organization',
        ]);
        // Give all permissions except super admin only permissions
        $clientOwnerPermissions = Permission::where('name', 'not like', 'clients-%')->get();
        $clientOwner->syncPermissions($clientOwnerPermissions);

        // Store Manager - Full access to assigned store
        $storeManager = Role::firstOrCreate(['name' => 'store-manager']);
        $storeManager->update([
            'scope' => 'store',
            'description' => 'Full access to assigned store only',
        ]);
        $storeManager->syncPermissions(Permission::all());

        // Store Cashier - Limited POS access to assigned store
        $storeCashier = Role::firstOrCreate(['name' => 'store-cashier']);
        $storeCashier->update([
            'scope' => 'store',
            'description' => 'Limited POS access to assigned store',
        ]);
        $cashierPermissions = Permission::whereIn('name', [
            'dashboard-access',
            'transactions-access',
            'customers-access',
            'customers-create',
            'services-access',
            'staff-access',
            'appointments-access',
            'appointments-create',
        ])->get();
        $storeCashier->syncPermissions($cashierPermissions);

        // Store Viewer - Read-only access to assigned store
        $storeViewer = Role::firstOrCreate(['name' => 'store-viewer']);
        $storeViewer->update([
            'scope' => 'store',
            'description' => 'Read-only access to assigned store',
        ]);
        $viewerPermissions = Permission::where('name', 'like', '%-access')
            ->where('name', 'not like', '%-create')
            ->where('name', 'not like', '%-edit')
            ->where('name', 'not like', '%-delete')
            ->get();
        $storeViewer->syncPermissions($viewerPermissions);
    }
}
