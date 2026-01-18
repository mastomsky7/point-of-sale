<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;

trait StoreScopeTrait
{
    /**
     * Boot the scope trait
     */
    protected static function bootStoreScopeTrait()
    {
        // Only apply scope if user is authenticated and has a default store
        if (auth()->check() && auth()->user()->default_store_id) {
            $user = auth()->user();

            // Skip scope for super admin
            if ($user->isSuperAdmin()) {
                return;
            }

            // Apply store scope
            static::addGlobalScope('store', function (Builder $builder) use ($user) {
                $table = $builder->getModel()->getTable();
                $builder->where($table . '.store_id', $user->default_store_id);
            });
        }
    }

    /**
     * Scope query to specific store
     */
    public function scopeForStore(Builder $query, int $storeId)
    {
        return $query->where($this->getTable() . '.store_id', $storeId);
    }

    /**
     * Scope query to multiple stores
     */
    public function scopeForStores(Builder $query, array $storeIds)
    {
        return $query->whereIn($this->getTable() . '.store_id', $storeIds);
    }

    /**
     * Remove store scope temporarily
     */
    public function scopeWithoutStoreScope(Builder $query)
    {
        return $query->withoutGlobalScope('store');
    }
}
