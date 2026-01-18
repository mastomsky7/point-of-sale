<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\Cart\CartService;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CartServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $cartService;
    protected $cashier;
    protected $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cartService = new CartService();

        // Create test cashier
        $this->cashier = User::factory()->create();

        // Create test product
        $this->product = Product::factory()->create([
            'sell_price' => 10000,
            'stock' => 100,
        ]);
    }

    /** @test */
    public function it_can_add_product_to_cart()
    {
        $cart = $this->cartService->addProduct($this->cashier->id, $this->product->id, 2);

        $this->assertInstanceOf(Cart::class, $cart);
        $this->assertEquals($this->cashier->id, $cart->cashier_id);
        $this->assertEquals($this->product->id, $cart->product_id);
        $this->assertEquals(2, $cart->qty);
        $this->assertEquals($this->product->sell_price, $cart->price);
    }

    /** @test */
    public function it_increments_quantity_when_adding_existing_product()
    {
        // Add product first time
        $this->cartService->addProduct($this->cashier->id, $this->product->id, 2);

        // Add same product again
        $cart = $this->cartService->addProduct($this->cashier->id, $this->product->id, 3);

        $this->assertEquals(5, $cart->qty);
        $this->assertEquals(1, Cart::where('cashier_id', $this->cashier->id)->count());
    }

    /** @test */
    public function it_can_update_cart_quantity()
    {
        $cart = $this->cartService->addProduct($this->cashier->id, $this->product->id, 2);

        $updated = $this->cartService->updateQuantity($cart->id, 5);

        $this->assertEquals(5, $updated->qty);
    }

    /** @test */
    public function it_can_remove_item_from_cart()
    {
        $cart = $this->cartService->addProduct($this->cashier->id, $this->product->id, 2);

        $result = $this->cartService->removeItem($cart->id);

        $this->assertTrue($result);
        $this->assertEquals(0, Cart::where('id', $cart->id)->count());
    }

    /** @test */
    public function it_can_clear_cart()
    {
        $this->cartService->addProduct($this->cashier->id, $this->product->id, 2);
        $product2 = Product::factory()->create();
        $this->cartService->addProduct($this->cashier->id, $product2->id, 1);

        $count = $this->cartService->clearCart($this->cashier->id);

        $this->assertEquals(2, $count);
        $this->assertEquals(0, Cart::where('cashier_id', $this->cashier->id)->count());
    }

    /** @test */
    public function it_can_hold_cart()
    {
        $this->cartService->addProduct($this->cashier->id, $this->product->id, 2);

        $holdId = $this->cartService->holdCart($this->cashier->id);

        $this->assertStringContainsString('HOLD-', $holdId);
        $cart = Cart::where('cashier_id', $this->cashier->id)->first();
        $this->assertEquals($holdId, $cart->hold_id);
    }

    /** @test */
    public function it_can_calculate_totals()
    {
        $this->cartService->addProduct($this->cashier->id, $this->product->id, 2);
        $product2 = Product::factory()->create(['sell_price' => 15000]);
        $this->cartService->addProduct($this->cashier->id, $product2->id, 1);

        $totals = $this->cartService->calculateTotals($this->cashier->id);

        $this->assertEquals(35000, $totals['subtotal']); // (10000 * 2) + (15000 * 1)
        $this->assertEquals(3, $totals['item_count']);
        $this->assertCount(2, $totals['items']);
    }
}
