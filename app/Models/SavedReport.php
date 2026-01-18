<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'filters',
        'columns',
        'format',
        'is_public',
        'view_count',
        'last_viewed_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'columns' => 'array',
        'is_public' => 'boolean',
        'last_viewed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the report
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Increment view count
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
        $this->update(['last_viewed_at' => now()]);
    }

    /**
     * Scope for public reports
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for user's reports
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for report type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
