<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\StoreLicense;
use App\Models\Client;
use Inertia\Inertia;

class LicenseController extends Controller
{
    /**
     * Display license information
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->default_store_id) {
            return Inertia::render('Dashboard/License/Index', [
                'license' => null,
                'store' => null,
                'client' => null,
            ]);
        }

        $store = Store::with(['license.plan', 'client.subscription.plan'])->find($user->default_store_id);

        if (!$store) {
            return Inertia::render('Dashboard/License/Index', [
                'license' => null,
                'store' => null,
                'client' => null,
            ]);
        }

        $license = $store->license;

        return Inertia::render('Dashboard/License/Index', [
            'license' => $license ? [
                'id' => $license->id,
                'license_key' => $license->license_key,
                'status' => $license->status,
                'activated_at' => $license->activated_at?->format('Y-m-d H:i:s'),
                'expires_at' => $license->expires_at?->format('Y-m-d H:i:s'),
                'grace_period_ends_at' => $license->grace_period_ends_at?->format('Y-m-d H:i:s'),
                'days_until_expiry' => $license->daysUntilExpiry(),
                'days_until_grace_expiry' => $license->daysUntilGracePeriodExpiry(),
                'is_active' => $license->isActive(),
                'is_expired' => $license->isExpired(),
                'is_in_grace_period' => $license->isInGracePeriod(),
                'plan' => $license->plan ? [
                    'name' => $license->plan->name,
                    'tier' => $license->plan->tier,
                ] : null,
            ] : null,
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'code' => $store->code,
            ],
            'client' => $store->client ? [
                'id' => $store->client->id,
                'name' => $store->client->name,
                'status' => $store->client->status,
            ] : null,
        ]);
    }

    /**
     * Show license renewal page
     */
    public function renew(Request $request)
    {
        $user = $request->user();

        if (!$user->default_store_id) {
            return redirect()->route('dashboard')->with('error', 'No store found.');
        }

        $store = Store::with(['license.plan', 'client'])->find($user->default_store_id);

        if (!$store || !$store->license) {
            return redirect()->route('dashboard')->with('error', 'No license found.');
        }

        return Inertia::render('Dashboard/License/Renew', [
            'license' => [
                'id' => $store->license->id,
                'license_key' => $store->license->license_key,
                'expires_at' => $store->license->expires_at?->format('Y-m-d'),
                'plan' => $store->license->plan ? [
                    'name' => $store->license->plan->name,
                    'price' => $store->license->plan->price,
                    'billing_interval' => $store->license->plan->billing_interval,
                ] : null,
            ],
            'store' => [
                'name' => $store->name,
            ],
        ]);
    }
}
