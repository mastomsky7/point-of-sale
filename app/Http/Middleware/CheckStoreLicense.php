<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Store;
use App\Models\StoreLicense;

class CheckStoreLicense
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Skip check if user is not authenticated
        if (!$user) {
            return $next($request);
        }

        // Skip check if user has no default store (backward compatibility)
        if (!$user->default_store_id) {
            return $next($request);
        }

        // Get user's store
        $store = Store::find($user->default_store_id);
        if (!$store) {
            return $next($request);
        }

        // Get store's active license
        $license = $store->license;
        if (!$license) {
            return $this->licenseExpiredResponse($request, 'No license found for this store.');
        }

        // Check if license is expired (not in grace period)
        if ($license->isExpired() && !$license->isInGracePeriod()) {
            return $this->licenseExpiredResponse(
                $request,
                'Your store license has expired. Please renew to continue using the POS system.'
            );
        }

        // Check if license is suspended
        if ($license->status === 'suspended') {
            return $this->licenseExpiredResponse(
                $request,
                'Your store license has been suspended. Please contact support.'
            );
        }

        // Check if license is cancelled
        if ($license->status === 'cancelled') {
            return $this->licenseExpiredResponse(
                $request,
                'Your store license has been cancelled. Please contact support to reactivate.'
            );
        }

        // Add license info to request for UI warnings
        if ($license->isInGracePeriod()) {
            $request->attributes->set('license_in_grace_period', true);
            $request->attributes->set('license_days_remaining', $license->daysUntilGracePeriodExpiry());
        } elseif ($license->daysUntilExpiry() !== null && $license->daysUntilExpiry() <= 7) {
            $request->attributes->set('license_expiring_soon', true);
            $request->attributes->set('license_days_remaining', $license->daysUntilExpiry());
        }

        return $next($request);
    }

    /**
     * Handle license expired response
     */
    private function licenseExpiredResponse(Request $request, string $message): Response
    {
        // For API requests, return JSON
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'License Expired',
                'message' => $message,
            ], 403);
        }

        // For web requests, redirect to license page with error
        return redirect()->route('dashboard')
            ->with('error', $message)
            ->with('license_expired', true);
    }
}
