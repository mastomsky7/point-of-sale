<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartService
{
    /**
     * Get cart items for cashier
     *
     * @param int $cashierId
     * @param string|null $holdId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCartItems(int $cashierId, ?string $holdId = null)
    {
        return Cart::with(['product.category', 'service', 'staff'])
            ->where('cashier_id', $cashierId)
            ->where('hold_id', $holdId)
            ->get();
    }

    /**
     * Add product to cart
     *
     * @param int $cashierId
     * @param int $productId
     * @param int $qty
     * @param string|null $holdId
     * @return Cart
     */
    public function addProduct(int $cashierId, int $productId, int $qty = 1, ?string $holdId = null): Cart
    {
        $product = Product::findOrFail($productId);

        $existingCart = Cart::where('cashier_id', $cashierId)
            ->where('product_id', $productId)
            ->where('hold_id', $holdId)
            ->first();

        if ($existingCart) {
            $existingCart->increment('qty', $qty);
            return $existingCart->fresh();
        }

        return Cart::create([
            'cashier_id' => $cashierId,
            'product_id' => $productId,
            'qty' => $qty,
            'price' => $product->sell_price,
            'hold_id' => $holdId,
        ]);
    }

    /**
     * Add service to cart
     *
     * @param int $cashierId
     * @param int $serviceId
     * @param int|null $staffId
     * @param int $qty
     * @param string|null $holdId
     * @return Cart
     */
    public function addService(int $cashierId, int $serviceId, ?int $staffId = null, int $qty = 1, ?string $holdId = null): Cart
    {
        $service = Service::findOrFail($serviceId);

        return Cart::create([
            'cashier_id' => $cashierId,
            'service_id' => $serviceId,
            'staff_id' => $staffId,
            'qty' => $qty,
            'price' => $service->price,
            'hold_id' => $holdId,
        ]);
    }

    /**
     * Update cart item quantity
     *
     * @param int $cartId
     * @param int $qty
     * @return Cart
     */
    public function updateQuantity(int $cartId, int $qty): Cart
    {
        $cart = Cart::findOrFail($cartId);
        $cart->update(['qty' => $qty]);
        return $cart;
    }

    /**
     * Remove item from cart
     *
     * @param int $cartId
     * @return bool
     */
    public function removeItem(int $cartId): bool
    {
        return Cart::findOrFail($cartId)->delete();
    }

    /**
     * Clear all cart items for cashier
     *
     * @param int $cashierId
     * @param string|null $holdId
     * @return int
     */
    public function clearCart(int $cashierId, ?string $holdId = null): int
    {
        return Cart::where('cashier_id', $cashierId)
            ->where('hold_id', $holdId)
            ->delete();
    }

    /**
     * Hold current cart
     *
     * @param int $cashierId
     * @return string Hold ID
     */
    public function holdCart(int $cashierId): string
    {
        $holdId = 'HOLD-' . Str::random(10);

        Cart::where('cashier_id', $cashierId)
            ->whereNull('hold_id')
            ->update(['hold_id' => $holdId]);

        return $holdId;
    }

    /**
     * Resume held cart
     *
     * @param int $cashierId
     * @param string $holdId
     * @return int Number of items resumed
     */
    public function resumeCart(int $cashierId, string $holdId): int
    {
        // Clear current active cart first
        $this->clearCart($cashierId, null);

        // Resume the held cart
        return Cart::where('cashier_id', $cashierId)
            ->where('hold_id', $holdId)
            ->update(['hold_id' => null]);
    }

    /**
     * Get all held carts for cashier
     *
     * @param int $cashierId
     * @return \Illuminate\Support\Collection
     */
    public function getHeldCarts(int $cashierId)
    {
        return Cart::where('cashier_id', $cashierId)
            ->whereNotNull('hold_id')
            ->with(['product', 'service'])
            ->get()
            ->groupBy('hold_id')
            ->map(function ($items, $holdId) {
                return [
                    'hold_id' => $holdId,
                    'items_count' => $items->count(),
                    'total' => $items->sum(fn($item) => $item->qty * $item->price),
                    'created_at' => $items->first()->created_at,
                ];
            })
            ->values();
    }

    /**
     * Delete held cart
     *
     * @param int $cashierId
     * @param string $holdId
     * @return int
     */
    public function deleteHeldCart(int $cashierId, string $holdId): int
    {
        return Cart::where('cashier_id', $cashierId)
            ->where('hold_id', $holdId)
            ->delete();
    }

    /**
     * Calculate cart totals
     *
     * @param int $cashierId
     * @param string|null $holdId
     * @return array
     */
    public function calculateTotals(int $cashierId, ?string $holdId = null): array
    {
        $items = $this->getCartItems($cashierId, $holdId);

        $subtotal = $items->sum(fn($item) => $item->qty * $item->price);
        $itemCount = $items->sum('qty');

        return [
            'subtotal' => $subtotal,
            'item_count' => $itemCount,
            'items' => $items,
        ];
    }
}
