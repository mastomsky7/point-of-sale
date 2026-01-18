<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreMerchantMapping;
use App\Models\PaymentMerchant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreMerchantMappingController extends Controller
{
    /**
     * Display store-merchant mappings
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $client = $user->client;

        if (!$client) {
            return redirect()->route('dashboard')
                ->with('error', 'No client associated with your account');
        }

        // Get all stores for this client with their merchant mappings
        $stores = Store::where('client_id', $client->id)
            ->with(['merchantMapping.merchant'])
            ->orderBy('name')
            ->get()
            ->map(function ($store) {
                $mapping = $store->merchantMapping;
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                    'code' => $store->code,
                    'is_active' => $store->is_active,
                    'merchant' => $mapping ? [
                        'id' => $mapping->merchant->id,
                        'name' => $mapping->merchant->name,
                        'merchant_code' => $mapping->merchant->merchant_code,
                    ] : null,
                    'mapping_id' => $mapping?->id,
                ];
            });

        // Get all available merchants for this client
        $merchants = PaymentMerchant::where('client_id', $client->id)
            ->where('is_active', true)
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($merchant) {
                return [
                    'id' => $merchant->id,
                    'name' => $merchant->name,
                    'merchant_code' => $merchant->merchant_code,
                    'is_default' => $merchant->is_default,
                    'midtrans_enabled' => $merchant->midtrans_enabled,
                    'xendit_enabled' => $merchant->xendit_enabled,
                ];
            });

        return Inertia::render('Dashboard/StoreMerchants/Index', [
            'stores' => $stores,
            'merchants' => $merchants,
        ]);
    }

    /**
     * Map a merchant to a store
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $client = $user->client;

        if (!$client) {
            return redirect()->back()->with('error', 'No client associated with your account');
        }

        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'merchant_id' => 'required|exists:payment_merchants,id',
            'notes' => 'nullable|string',
        ]);

        // Verify store belongs to client
        $store = Store::find($validated['store_id']);
        if ($store->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        // Verify merchant belongs to client
        $merchant = PaymentMerchant::find($validated['merchant_id']);
        if ($merchant->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        // Check if mapping already exists
        $existingMapping = StoreMerchantMapping::where('store_id', $validated['store_id'])
            ->where('is_active', true)
            ->first();

        if ($existingMapping) {
            // Update existing mapping
            $existingMapping->update([
                'merchant_id' => $validated['merchant_id'],
                'notes' => $validated['notes'] ?? null,
                'activated_at' => now(),
            ]);

            return redirect()->route('store-merchants.index')
                ->with('success', 'Store merchant mapping updated successfully');
        }

        // Create new mapping
        $mapping = StoreMerchantMapping::create([
            'store_id' => $validated['store_id'],
            'merchant_id' => $validated['merchant_id'],
            'is_active' => true,
            'activated_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        // Activate this mapping (deactivates others for this store)
        $mapping->activate();

        return redirect()->route('store-merchants.index')
            ->with('success', 'Store merchant mapping created successfully');
    }

    /**
     * Update the merchant mapping for a store
     */
    public function update(Request $request, StoreMerchantMapping $storeMerchant)
    {
        $user = $request->user();
        $client = $user->client;

        // Verify store belongs to client
        if ($storeMerchant->store->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        $validated = $request->validate([
            'merchant_id' => 'required|exists:payment_merchants,id',
            'notes' => 'nullable|string',
        ]);

        // Verify merchant belongs to client
        $merchant = PaymentMerchant::find($validated['merchant_id']);
        if ($merchant->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        $storeMerchant->update([
            'merchant_id' => $validated['merchant_id'],
            'notes' => $validated['notes'] ?? null,
            'activated_at' => now(),
        ]);

        // Ensure this is the active mapping
        $storeMerchant->activate();

        return redirect()->route('store-merchants.index')
            ->with('success', 'Store merchant mapping updated successfully');
    }

    /**
     * Remove the merchant mapping from a store
     */
    public function destroy(StoreMerchantMapping $storeMerchant)
    {
        $user = auth()->user();
        $client = $user->client;

        // Verify store belongs to client
        if ($storeMerchant->store->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        // Deactivate the mapping (soft removal)
        $storeMerchant->deactivate();

        return redirect()->route('store-merchants.index')
            ->with('success', 'Store merchant mapping removed successfully');
    }
}
