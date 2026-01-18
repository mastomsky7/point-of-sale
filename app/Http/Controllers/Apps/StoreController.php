<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreLicense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    /**
     * Display a listing of stores
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $client = $user->client;

        if (!$client) {
            return redirect()->route('dashboard')
                ->with('error', 'No client associated with your account');
        }

        $stores = Store::where('client_id', $client->id)
            ->with(['license.plan'])
            ->orderBy('is_active', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                    'code' => $store->code,
                    'address' => $store->address,
                    'city' => $store->city,
                    'phone' => $store->phone,
                    'is_active' => $store->is_active,
                    'license' => $store->license ? [
                        'status' => $store->license->status,
                        'expires_at' => $store->license->expires_at?->format('Y-m-d'),
                        'plan_name' => $store->license->plan?->name,
                    ] : null,
                ];
            });

        // Get subscription plan limits
        $subscription = $client->subscription;
        $plan = $subscription?->plan;

        $canAddStore = true;
        $storeLimit = null;

        if ($plan) {
            $currentCount = $stores->count();
            $storeLimit = $plan->max_stores;
            $canAddStore = $plan->canAddStore($currentCount);
        }

        return Inertia::render('Dashboard/Stores/Index', [
            'stores' => $stores,
            'canAddStore' => $canAddStore,
            'storeLimit' => $storeLimit,
            'currentCount' => $stores->count(),
        ]);
    }

    /**
     * Store a newly created store
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $client = $user->client;

        if (!$client) {
            return redirect()->back()->with('error', 'No client associated with your account');
        }

        // Check store limit
        $subscription = $client->subscription;
        $plan = $subscription?->plan;

        if ($plan) {
            $currentCount = Store::where('client_id', $client->id)->count();
            if (!$plan->canAddStore($currentCount)) {
                return redirect()->back()->with('error', 'Store limit reached. Please upgrade your plan.');
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        // Check if code is unique for this client
        $exists = Store::where('client_id', $client->id)
            ->where('code', $validated['code'])
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Store code already exists for your organization');
        }

        $store = Store::create(array_merge($validated, [
            'client_id' => $client->id,
            'is_active' => true,
        ]));

        // Create default license for the store
        $basicPlan = \App\Models\SubscriptionPlan::where('slug', 'basic')->first();
        if ($basicPlan) {
            StoreLicense::create([
                'store_id' => $store->id,
                'plan_id' => $basicPlan->id,
                'license_key' => \Illuminate\Support\Str::random(32),
                'status' => 'active',
                'activated_at' => now(),
                'expires_at' => now()->addMonth(),
                'grace_period_ends_at' => now()->addMonth()->addDays(7),
                'auto_renew' => true,
            ]);
        }

        return redirect()->route('stores.index')
            ->with('success', 'Store created successfully');
    }

    /**
     * Update the specified store
     */
    public function update(Request $request, Store $store)
    {
        $user = $request->user();
        $client = $user->client;

        // Ensure store belongs to this client
        if ($store->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        // Check if code is unique (excluding this store)
        $exists = Store::where('client_id', $client->id)
            ->where('code', $validated['code'])
            ->where('id', '!=', $store->id)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Store code already exists for your organization');
        }

        $store->update($validated);

        return redirect()->route('stores.index')
            ->with('success', 'Store updated successfully');
    }

    /**
     * Remove the specified store
     */
    public function destroy(Store $store)
    {
        $user = auth()->user();
        $client = $user->client;

        // Ensure store belongs to this client
        if ($store->client_id !== $client->id) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        // Check if store has transactions
        $transactionsCount = $store->transactions()->count();
        if ($transactionsCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete store. It has {$transactionsCount} transaction(s) associated with it.");
        }

        $store->delete();

        return redirect()->route('stores.index')
            ->with('success', 'Store deleted successfully');
    }

    /**
     * Switch user's current store
     */
    public function switch(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
        ]);

        $user = $request->user();
        $store = Store::find($validated['store_id']);

        // Check if user has access to this store
        $hasAccess = false;

        if ($user->isSuperAdmin()) {
            $hasAccess = true;
        } elseif ($user->client_id && $store->client_id === $user->client_id) {
            $hasAccess = true;
        } elseif ($user->default_store_id === $store->id) {
            $hasAccess = true;
        }

        if (!$hasAccess) {
            return redirect()->back()->with('error', 'You do not have access to this store');
        }

        // Update user's default store
        $user->update(['default_store_id' => $store->id]);

        return redirect()->back()->with('success', "Switched to {$store->name}");
    }
}
