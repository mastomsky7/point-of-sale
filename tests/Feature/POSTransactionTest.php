<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Service;
use App\Models\Customer;
use App\Models\Cart;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class POSTransactionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Create user with permissions
        $this->user = User::factory()->create();
        $role = Role::create(['name' => 'cashier']);

        Permission::create(['name' => 'transactions-access']);
        Permission::create(['name' => 'customers-create']);

        $role->givePermissionTo(['transactions-access', 'customers-create']);
        $this->user->assignRole($role);

        // Create category for products
        $this->category = Category::create(['name' => 'Test Category']);
    }

    /**
     * I3: Test can view POS page
     */
    public function test_can_view_pos_page(): void
    {
        $response = $this->actingAs($this->user)->get(route('transactions.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard/Transactions/Index'));
    }

    /**
     * I3: Test can add product to cart
     */
    public function test_can_add_product_to_cart(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'sell_price' => 50000,
            'stock' => 100,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('transactions.addToCart'), [
                'product_id' => $product->id,
                'qty' => 2,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('carts', [
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'qty' => 2,
            'price' => 50000,
        ]);
    }

    /**
     * I3: Test can add service to cart
     */
    public function test_can_add_service_to_cart(): void
    {
        $service = Service::factory()->create([
            'price' => 100000,
            'duration' => 30,
        ]);
        $staff = Staff::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('transactions.addServiceToCart'), [
                'service_id' => $service->id,
                'staff_id' => $staff->id,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('carts', [
            'cashier_id' => $this->user->id,
            'service_id' => $service->id,
            'staff_id' => $staff->id,
            'price' => 100000,
        ]);
    }

    /**
     * I3: Test cannot add out of stock product
     */
    public function test_cannot_add_out_of_stock_product(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'stock' => 0,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('transactions.addToCart'), [
                'product_id' => $product->id,
                'qty' => 1,
            ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('carts', [
            'product_id' => $product->id,
        ]);
    }

    /**
     * I3: Test can update cart quantity
     */
    public function test_can_update_cart_quantity(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'stock' => 100,
        ]);

        $cart = Cart::create([
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'qty' => 2,
            'price' => $product->sell_price,
        ]);

        $response = $this->actingAs($this->user)
            ->patch(route('transactions.updateCart', $cart->id), [
                'qty' => 5,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('carts', [
            'id' => $cart->id,
            'qty' => 5,
        ]);
    }

    /**
     * I3: Test can remove item from cart
     */
    public function test_can_remove_item_from_cart(): void
    {
        $product = Product::factory()->create(['category_id' => $this->category->id]);

        $cart = Cart::create([
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'qty' => 1,
            'price' => $product->sell_price,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('transactions.destroyCart', $cart->id));

        $response->assertStatus(200);
        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id,
        ]);
    }

    /**
     * I3: Test can hold transaction
     */
    public function test_can_hold_transaction(): void
    {
        $product = Product::factory()->create(['category_id' => $this->category->id]);

        Cart::create([
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'qty' => 2,
            'price' => $product->sell_price,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('transactions.hold'), [
                'customer_name' => 'John Doe',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('carts', [
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
        ]);

        // Check that hold_id is not null
        $cart = Cart::where('cashier_id', $this->user->id)
            ->where('product_id', $product->id)
            ->first();
        $this->assertNotNull($cart->hold_id);
    }

    /**
     * I3: Test can resume held transaction
     */
    public function test_can_resume_held_transaction(): void
    {
        $holdId = 'HOLD-' . time();
        $product = Product::factory()->create(['category_id' => $this->category->id]);

        Cart::create([
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'qty' => 2,
            'price' => $product->sell_price,
            'hold_id' => $holdId,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('transactions.resume', $holdId));

        $response->assertStatus(200);
        $this->assertDatabaseHas('carts', [
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'hold_id' => null,
        ]);
    }

    /**
     * I3: Test can complete transaction
     */
    public function test_can_complete_transaction(): void
    {
        $customer = Customer::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'sell_price' => 50000,
            'stock' => 100,
        ]);

        Cart::create([
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'qty' => 2,
            'price' => 50000,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('transactions.store'), [
                'customer_id' => $customer->id,
                'payment_method' => 'cash',
                'cash_amount' => 150000,
                'discount' => 0,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('transactions', [
            'customer_id' => $customer->id,
            'payment_method' => 'cash',
            'grand_total' => 100000,
        ]);

        // Check cart is cleared
        $this->assertDatabaseMissing('carts', [
            'cashier_id' => $this->user->id,
            'hold_id' => null,
        ]);

        // Check stock is reduced
        $product->refresh();
        $this->assertEquals(98, $product->stock);
    }

    /**
     * I3: Test can view transaction history
     */
    public function test_can_view_transaction_history(): void
    {
        Transaction::factory()->count(5)->create([
            'cashier_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('transactions.history'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard/Transactions/History'));
    }

    /**
     * I3: Test can print transaction receipt
     */
    public function test_can_print_transaction_receipt(): void
    {
        $transaction = Transaction::factory()->create([
            'invoice' => 'INV-TEST-001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('transactions.print', $transaction->invoice));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard/Transactions/Print'));
    }

    /**
     * I3: Test transaction updates customer stats
     */
    public function test_transaction_updates_customer_stats(): void
    {
        $customer = Customer::factory()->create([
            'total_spend' => 0,
            'visit_count' => 0,
        ]);

        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'sell_price' => 100000,
            'stock' => 100,
        ]);

        Cart::create([
            'cashier_id' => $this->user->id,
            'product_id' => $product->id,
            'qty' => 1,
            'price' => 100000,
        ]);

        $this->actingAs($this->user)
            ->post(route('transactions.store'), [
                'customer_id' => $customer->id,
                'payment_method' => 'cash',
                'cash_amount' => 100000,
                'discount' => 0,
            ]);

        $customer->refresh();
        $this->assertEquals(100000, $customer->total_spend);
        $this->assertEquals(1, $customer->visit_count);
    }
}
