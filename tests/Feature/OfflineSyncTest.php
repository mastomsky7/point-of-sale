<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Service;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OfflineSyncTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    /**
     * I4: Test can sync products
     */
    public function test_can_sync_products(): void
    {
        $category = Category::create(['name' => 'Test Category']);
        Product::factory()->count(10)->create(['category_id' => $category->id]);

        $response = $this->getJson(route('api.sync.products'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'products' => [
                '*' => [
                    'id',
                    'title',
                    'barcode',
                    'sell_price',
                    'stock',
                    'category_id',
                    'image',
                ]
            ],
            'last_sync'
        ]);
        $response->assertJsonCount(10, 'products');
    }

    /**
     * I4: Test can sync services
     */
    public function test_can_sync_services(): void
    {
        Service::factory()->count(5)->create(['is_active' => true]);

        $response = $this->getJson(route('api.sync.services'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'services' => [
                '*' => [
                    'id',
                    'name',
                    'price',
                    'duration',
                    'category_id',
                ]
            ],
            'last_sync'
        ]);
        $response->assertJsonCount(5, 'services');
    }

    /**
     * I4: Test can sync customers
     */
    public function test_can_sync_customers(): void
    {
        Customer::factory()->count(15)->create();

        $response = $this->getJson(route('api.sync.customers'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'customers' => [
                '*' => [
                    'id',
                    'name',
                    'phone',
                    'email',
                    'loyalty_tier',
                    'loyalty_points',
                ]
            ],
            'last_sync'
        ]);
        $response->assertJsonCount(15, 'customers');
    }

    /**
     * I4: Test can sync staff
     */
    public function test_can_sync_staff(): void
    {
        Staff::factory()->count(8)->create(['is_active' => true]);

        $response = $this->getJson(route('api.sync.staff'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'staff' => [
                '*' => [
                    'id',
                    'name',
                    'is_active',
                ]
            ],
            'last_sync'
        ]);
        $response->assertJsonCount(8, 'staff');
    }

    /**
     * I4: Test can sync offline transaction
     */
    public function test_can_sync_offline_transaction(): void
    {
        $category = Category::create(['name' => 'Test Category']);
        $customer = Customer::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'sell_price' => 50000,
            'stock' => 100,
        ]);

        $transactionData = [
            'customer_id' => $customer->id,
            'payment_method' => 'cash',
            'grand_total' => 100000,
            'discount' => 0,
            'cash_amount' => 100000,
            'change_amount' => 0,
            'items' => [
                [
                    'product_id' => $product->id,
                    'qty' => 2,
                    'price' => 50000,
                ]
            ],
            'synced_at' => now()->toISOString(),
        ];

        $response = $this->postJson(route('api.sync.transactions'), $transactionData);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'transaction' => [
                'id',
                'invoice',
                'grand_total',
            ]
        ]);

        $this->assertDatabaseHas('transactions', [
            'customer_id' => $customer->id,
            'payment_method' => 'cash',
            'grand_total' => 100000,
        ]);

        // Check stock reduction
        $product->refresh();
        $this->assertEquals(98, $product->stock);
    }

    /**
     * I4: Test can sync offline appointment
     */
    public function test_can_sync_offline_appointment(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['price' => 100000, 'duration' => 30]);
        $staff = Staff::factory()->create();

        $appointmentData = [
            'customer_id' => $customer->id,
            'appointment_date' => now()->addDays(1)->format('Y-m-d'),
            'appointment_time' => '10:00',
            'status' => 'pending',
            'payment_status' => 'pending',
            'notes' => 'Synced from offline',
            'services' => [
                [
                    'service_id' => $service->id,
                    'staff_id' => $staff->id,
                ]
            ],
            'synced_at' => now()->toISOString(),
        ];

        $response = $this->postJson(route('api.sync.appointments'), $appointmentData);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'appointment' => [
                'id',
                'appointment_number',
                'customer_id',
            ]
        ]);

        $this->assertDatabaseHas('appointments', [
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);
    }

    /**
     * I4: Test sync requires authentication
     */
    public function test_sync_requires_authentication(): void
    {
        $response = $this->getJson(route('api.sync.products'));

        $response->assertStatus(401);
    }

    /**
     * I4: Test sync handles incremental updates
     */
    public function test_sync_handles_incremental_updates(): void
    {
        $category = Category::create(['name' => 'Test Category']);

        // Create initial products
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'updated_at' => now()->subHours(2),
        ]);

        // Create new products
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'updated_at' => now(),
        ]);

        $lastSync = now()->subHour()->toISOString();

        $response = $this->getJson(route('api.sync.products', ['last_sync' => $lastSync]));

        $response->assertStatus(200);
        // Should only return products updated after last_sync
        $response->assertJsonCount(3, 'products');
    }

    /**
     * I4: Test sync validates transaction data
     */
    public function test_sync_validates_transaction_data(): void
    {
        $invalidData = [
            'payment_method' => 'cash',
            'grand_total' => 100000,
            // Missing required fields
        ];

        $response = $this->postJson(route('api.sync.transactions'), $invalidData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_id', 'items']);
    }

    /**
     * I4: Test sync handles conflicts gracefully
     */
    public function test_sync_handles_conflicts_gracefully(): void
    {
        $category = Category::create(['name' => 'Test Category']);
        $customer = Customer::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock' => 1,
        ]);

        // Try to sync transaction with more qty than stock
        $transactionData = [
            'customer_id' => $customer->id,
            'payment_method' => 'cash',
            'grand_total' => 100000,
            'discount' => 0,
            'cash_amount' => 100000,
            'change_amount' => 0,
            'items' => [
                [
                    'product_id' => $product->id,
                    'qty' => 5, // More than available stock
                    'price' => 20000,
                ]
            ],
        ];

        $response = $this->postJson(route('api.sync.transactions'), $transactionData);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'Insufficient stock']);
    }
}
