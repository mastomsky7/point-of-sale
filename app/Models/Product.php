<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Scopes\StoreScopeTrait;

class Product extends Model
{
    use HasFactory, StoreScopeTrait;

    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'image', 'barcode', 'title', 'description', 'buy_price', 'sell_price', 'category_id', 'stock'
    ];

    /**
     * Append imageUrl to JSON
     *
     * @var array
     */
    protected $appends = ['image_url'];

    /**
     * category
     *
     * @return void
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * image - returns raw filename
     *
     * @return Attribute
     */
    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value,
        );
    }

    /**
     * imageUrl - returns full URL for display
     *
     * @return Attribute
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => isset($attributes['image']) && $attributes['image']
                ? asset('/storage/products/' . $attributes['image'])
                : null,
        );
    }
}
