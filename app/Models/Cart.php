<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'cashier_id', 'appointment_id', 'customer_id', 'product_id', 'service_id', 'staff_id', 'qty', 'price', 'duration', 'hold_id', 'hold_label', 'held_at',
    ];

    /**
     * casts
     *
     * @var array
     */
    protected $casts = [
        'held_at' => 'datetime',
    ];

    /**
     * appends - Disabled for performance (frontend determines type from product_id/service_id)
     *
     * @var array
     */
    // protected $appends = [
    //     'item_type',
    //     'item_name',
    // ];

    /**
     * Relationships to eager load only when needed (removed global eager loading for performance)
     * Use explicit with() in queries instead
     */
    // protected $with = ['product', 'service', 'staff'];

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
     * appointment
     *
     * @return void
     */
    public function appointment()
    {
        return $this->belongsTo(\App\Models\Appointment::class);
    }

    /**
     * customer
     *
     * @return void
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get item type (product or service)
     *
     * @return string
     */
    public function getItemTypeAttribute()
    {
        return $this->product_id ? 'product' : 'service';
    }

    /**
     * Get item name (product title or service name)
     *
     * @return string|null
     */
    public function getItemNameAttribute()
    {
        return $this->product ? $this->product->title : ($this->service ? $this->service->name : null);
    }

    /**
     * Scope for active (not held) carts
     */
    public function scopeActive($query)
    {
        return $query->whereNull('hold_id');
    }

    /**
     * Scope for held carts
     */
    public function scopeHeld($query)
    {
        return $query->whereNotNull('hold_id');
    }

    /**
     * Scope for specific hold group
     */
    public function scopeForHold($query, $holdId)
    {
        return $query->where('hold_id', $holdId);
    }
}
