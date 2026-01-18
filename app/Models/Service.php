<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Models\Scopes\StoreScopeTrait;

class Service extends Model
{
    use SoftDeletes, StoreScopeTrait;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration',
        'category_id',
        'image',
        'is_active',
        'requires_staff',
        'commission_percent',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'requires_staff' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($image) => $image,
        );
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => isset($attributes['image']) && $attributes['image']
                ? asset('/storage/services/' . $attributes['image'])
                : null,
        );
    }
}
