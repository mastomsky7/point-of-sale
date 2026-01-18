<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    use HasFactory;
    
    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'transaction_id',
        'product_id',
        'service_id',
        'staff_id',
        'qty',
        'price',
        'duration'
    ];

    /**
     * transaction
     *
     * @return void
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * product
     *
     * @return void
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * service
     *
     * @return void
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * staff
     *
     * @return void
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get the item type (product or service)
     *
     * @return string
     */
    public function getItemTypeAttribute()
    {
        return $this->service_id ? 'service' : 'product';
    }

    /**
     * Get the item name
     *
     * @return string
     */
    public function getItemNameAttribute()
    {
        if ($this->service_id) {
            return $this->service?->name ?? 'Service';
        }
        return $this->product?->title ?? 'Product';
    }
}
