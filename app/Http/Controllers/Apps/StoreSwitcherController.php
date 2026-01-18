<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Store;

class StoreSwitcherController extends Controller
{
    /**
     * Switch the user's active store
     */
    public function switch(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
        ]);

        $user = $request->user();
        $storeId = $request->input('store_id');

        // Get the requested store
        $store = Store::find($storeId);

        if (!$store) {
            return back()->with('error', 'Store not found.');
        }

        // Check if user has access to this store
        // Super admin can access all stores
        if (!$user->isSuperAdmin()) {
            // Check if store belongs to user's client
            if ($user->client_id && $store->client_id !== $user->client_id) {
                return back()->with('error', 'You do not have access to this store.');
            }

            // Check if user has a role assigned to this store
            $hasAccess = $user->hasRole(['client-owner', 'store-manager', 'store-cashier']);

            if (!$hasAccess && !$user->client_id) {
                return back()->with('error', 'You do not have permission to switch stores.');
            }
        }

        // Update user's default store
        $user->update(['default_store_id' => $storeId]);

        return back()->with('success', "Switched to {$store->name}");
    }

    /**
     * Get available stores for current user
     */
    public function getAvailableStores(Request $request)
    {
        $user = $request->user();

        // Super admin gets all stores
        if ($user->isSuperAdmin()) {
            return Store::with('client')->get();
        }

        // Client owner gets all stores in their client
        if ($user->client_id) {
            return Store::where('client_id', $user->client_id)->get();
        }

        // Regular users only get their assigned store
        if ($user->default_store_id) {
            return Store::where('id', $user->default_store_id)->get();
        }

        return collect();
    }
}
