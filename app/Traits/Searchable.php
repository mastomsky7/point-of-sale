<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Apply search filter to query
     *
     * @param Builder $query
     * @param string|null $searchTerm
     * @param array $searchableFields - fields to search in
     * @return Builder
     */
    public function scopeSearch(Builder $query, ?string $searchTerm, array $searchableFields = ['name']): Builder
    {
        if (empty($searchTerm)) {
            return $query;
        }

        return $query->where(function ($q) use ($searchTerm, $searchableFields) {
            foreach ($searchableFields as $field) {
                $q->orWhere($field, 'like', "%{$searchTerm}%");
            }
        });
    }

    /**
     * Apply multiple filters to query
     *
     * @param Builder $query
     * @param array $filters
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        foreach ($filters as $field => $value) {
            if (!empty($value)) {
                if (is_array($value)) {
                    $query->whereIn($field, $value);
                } else {
                    $query->where($field, $value);
                }
            }
        }

        return $query;
    }
}
