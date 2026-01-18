<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use App\Models\Store;

trait ClientScopeTrait
{
    /**
     * Boot the scope trait
     */
    protected static function bootClientScopeTrait()
    {
        // Only apply scope if user is authenticated and has a client
        if (auth()->check() && auth()->user()->client_id) {
            $user = auth()->user();

            // Skip scope for super admin
            if ($user->isSuperAdmin()) {
                return;
            }

            // Apply client scope
            static::addGlobalScope('client', function (Builder $builder) use ($user) {
                $builder->where(static::getTable() . '.client_id', $user->client_id);
            });
        }
    }

    /**
     * Scope query to specific client
     */
    public function scopeForClient(Builder $query, int $clientId)
    {
        return $query->where($this->getTable() . '.client_id', $clientId);
    }

    /**
     * Remove client scope temporarily
     */
    public function scopeWithoutClientScope(Builder $query)
    {
        return $query->withoutGlobalScope('client');
    }
}
