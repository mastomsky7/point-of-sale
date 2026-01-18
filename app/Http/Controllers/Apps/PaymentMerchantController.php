<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\PaymentMerchant;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMerchantController extends Controller
{
    /**
     * Display a listing of merchants for the client
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get client from user
        $client = $user->client;

        if (!$client) {
            return redirect()->route('dashboard')
                ->with('error', 'No client associated with your account');
        }

        // Get all merchants for this client
        $merchants = PaymentMerchant::where('client_id', $client->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($merchant) {
                return [
                    'id' => $merchant->id,
                    'name' => $merchant->name,
                    'merchant_code' => $merchant->merchant_code,
                    'description' => $merchant->description,
                    'midtrans_enabled' => $merchant->midtrans_enabled,
                    'xendit_enabled' => $merchant->xendit_enabled,
                    'is_active' => $merchant->is_active,
                    'is_default' => $merchant->is_default,
                    'stores_count' => $merchant->storeMappings()->count(),
                ];
            });

        // Get subscription plan limits
        $subscription = $client->subscription;
        $plan = $subscription?->plan;

        $canAddMerchant = true;
        $merchantLimit = null;

        if ($plan) {
            $currentCount = $merchants->count();
            $merchantLimit = $plan->max_merchants;
            $canAddMerchant = $plan->canAddMerchant($currentCount);
        }

        return Inertia::render('Dashboard/Merchants/Index', [
            'merchants' => $merchants,
            'canAddMerchant' => $canAddMerchant,
            'merchantLimit' => $merchantLimit,
            'currentCount' => $merchants->count(),
        ]);
    }

    /**
     * Store a newly created merchant
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $client = $user->client;

        if (!$client) {
            return redirect()->back()->with('error', 'No client associated with your account');
        }

        // Check merchant limit
        $subscription = $client->subscription;
        $plan = $subscription?->plan;

        if ($plan) {
            $currentCount = PaymentMerchant::where('client_id', $client->id)->count();
            if (!$plan->canAddMerchant($currentCount)) {
                return redirect()->back()->with('error', 'Merchant limit reached. Please upgrade your plan.');
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'merchant_code' => 'required|string|max:100',
            'description' => 'nullable|string',
            'midtrans_enabled' => 'boolean',
            'midtrans_merchant_id' => 'nullable|string',
            'midtrans_server_key' => 'nullable|string',
            'midtrans_client_key' => 'nullable|string',
            'midtrans_is_production' => 'boolean',
            'xendit_enabled' => 'boolean',
            'xendit_api_key' => 'nullable|string',
            'xendit_webhook_token' => 'nullable|string',
            'xendit_public_key' => 'nullable|string',
            'xendit_is_production' => 'boolean',
            'is_default' => 'boolean',
        ]);

        // Check if merchant code is unique for this client
        $exists = PaymentMerchant::where('client_id', $client->id)
            ->where('merchant_code', $validated['merchant_code'])
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Merchant code already exists for your organization');
        }

        // If this is set as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            PaymentMerchant::where('client_id', $client->id)
                ->update(['is_default' => false]);
        }

        $merchant = PaymentMerchant::create(array_merge($validated, [
            'client_id' => $client->id,
        ]));

        return redirect()->route('merchants.index')
            ->with('success', 'Payment merchant created successfully');
    }

    /**
     * Update the specified merchant
     */
    public function update(Request $request, PaymentMerchant $merchant)
    {
        $user = $request->user();
        $client = $user->client;

        // Ensure merchant belongs to this client
        if ($merchant->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'merchant_code' => 'required|string|max:100',
            'description' => 'nullable|string',
            'midtrans_enabled' => 'boolean',
            'midtrans_merchant_id' => 'nullable|string',
            'midtrans_server_key' => 'nullable|string',
            'midtrans_client_key' => 'nullable|string',
            'midtrans_is_production' => 'boolean',
            'xendit_enabled' => 'boolean',
            'xendit_api_key' => 'nullable|string',
            'xendit_webhook_token' => 'nullable|string',
            'xendit_public_key' => 'nullable|string',
            'xendit_is_production' => 'boolean',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        // Check if merchant code is unique (excluding this merchant)
        $exists = PaymentMerchant::where('client_id', $client->id)
            ->where('merchant_code', $validated['merchant_code'])
            ->where('id', '!=', $merchant->id)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Merchant code already exists for your organization');
        }

        // If this is set as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            PaymentMerchant::where('client_id', $client->id)
                ->where('id', '!=', $merchant->id)
                ->update(['is_default' => false]);
        }

        $merchant->update($validated);

        return redirect()->route('merchants.index')
            ->with('success', 'Payment merchant updated successfully');
    }

    /**
     * Remove the specified merchant
     */
    public function destroy(PaymentMerchant $merchant)
    {
        $user = auth()->user();
        $client = $user->client;

        // Ensure merchant belongs to this client
        if ($merchant->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        // Check if merchant is being used by any stores
        $storesCount = $merchant->storeMappings()->count();
        if ($storesCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete merchant. It is currently mapped to {$storesCount} store(s).");
        }

        // Check if merchant has transactions
        $transactionsCount = $merchant->transactions()->count();
        if ($transactionsCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete merchant. It has {$transactionsCount} transaction(s) associated with it.");
        }

        $merchant->delete();

        return redirect()->route('merchants.index')
            ->with('success', 'Payment merchant deleted successfully');
    }

    /**
     * Set a merchant as default
     */
    public function setDefault(PaymentMerchant $merchant)
    {
        $user = auth()->user();
        $client = $user->client;

        // Ensure merchant belongs to this client
        if ($merchant->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        // Unset all other defaults
        PaymentMerchant::where('client_id', $client->id)
            ->update(['is_default' => false]);

        // Set this as default
        $merchant->update(['is_default' => true]);

        return redirect()->route('merchants.index')
            ->with('success', 'Default payment merchant updated');
    }
}
