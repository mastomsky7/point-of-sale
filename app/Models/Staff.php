<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Models\Scopes\StoreScopeTrait;

class Staff extends Model
{
    use SoftDeletes, StoreScopeTrait;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'specialization',
        'avatar',
        'is_active',
        'commission_rate',
        'working_hours',
        'day_off',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'commission_rate' => 'decimal:2',
        'working_hours' => 'array',
        'day_off' => 'array',
    ];

    protected $appends = ['photo_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: fn ($avatar) => $avatar ? asset('/storage/' . $avatar) : null,
        );
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => isset($attributes['avatar']) && $attributes['avatar']
                ? asset('/storage/' . $attributes['avatar'])
                : null,
        );
    }
}
