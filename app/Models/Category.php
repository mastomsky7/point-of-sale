<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Scopes\StoreScopeTrait;

class Category extends Model
{
    use HasFactory, StoreScopeTrait;
    
    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'image', 'name', 'description'
    ];

    /**
     * products
     *
     * @return void
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * image
     *
     * @return Attribute
     */
    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => asset('/storage/category/' . $value),
        );
    }
}
