<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $availableStores = [];
        $currentStore = null;

        if ($user) {
            // Get available stores based on user role
            if ($user->isSuperAdmin()) {
                $availableStores = \App\Models\Store::with('client')->get();
            } elseif ($user->client_id) {
                $availableStores = \App\Models\Store::where('client_id', $user->client_id)->get();
            } elseif ($user->default_store_id) {
                $availableStores = \App\Models\Store::where('id', $user->default_store_id)->get();
            }

            // Get current store
            if ($user->default_store_id) {
                $currentStore = \App\Models\Store::find($user->default_store_id);
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $user ? $user->getPermissions() : [],
                'super' => $user ? $user->isSuperAdmin() : false,
            ],
            // Multi-store data
            'stores' => [
                'available' => $availableStores,
                'current' => $currentStore ? [
                    'id' => $currentStore->id,
                    'name' => $currentStore->name,
                    'code' => $currentStore->code,
                ] : null,
            ],
            // License warning data from CheckStoreLicense middleware
            'license_in_grace_period' => $request->attributes->get('license_in_grace_period', false),
            'license_expiring_soon' => $request->attributes->get('license_expiring_soon', false),
            'license_days_remaining' => $request->attributes->get('license_days_remaining'),
            'license_expired' => session('license_expired', false),
        ];
    }
}
